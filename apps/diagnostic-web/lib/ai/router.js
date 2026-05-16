// =====================================================================
// ESPANSIONE - router.js
//
// Router multi-provider: Gemini (Google), Claude (Anthropic), OpenAI
// =====================================================================

const MAX_RETRIES = 3;
const RETRY_DELAYS = [0, 2000, 5000];

// FIX.12 — retry específico de Claude. Chamadas grandes falhando (timeout
// ou fetch aborted) não se beneficiam de retry: vão falhar pelos mesmos
// motivos e empilham segundos contra o cap serverless. Policy separada:
// MAX=2, delays rápidos, skip quando erro indicar timeout/abort.
const MAX_RETRIES_CLAUDE = 2;
const RETRY_DELAYS_CLAUDE = [0, 500];
const CLAUDE_ABORT_MS = 270_000; // 270s — cap do endpoint é 300s, deixamos 30s pra parse + save

function isTimeoutError(err) {
  const m = String(err?.message || err || '').toLowerCase();
  return m.includes('timeout')
      || m.includes('aborted')
      || m.includes('abortsignal')
      || m.includes('econnreset')
      || m.includes(' 504')
      || m.startsWith('504')
      || m.includes('the operation was aborted');
}

export const AIRouter = {
  // Configs padrão
  MODEL_DEFAULT: "gemini-3-flash-preview", // Pode ser ajustado depois
  MAX_OUTPUT_TOKENS: 16000,
  TEMPERATURE_AGENT: 0.3,

  // Catalogo de modelos para resolver IDs e Providers
  MODELS: {
    "gemini-flash":   { id: "gemini-3-flash-preview",      provider: "gemini" },
    "gemini-pro":     { id: "gemini-3.1-pro-preview",      provider: "gemini" },
    "claude-opus-4-7":{ id: "claude-opus-4-7",             provider: "anthropic" },
    "claude-sonnet":  { id: "claude-sonnet-4-6",           provider: "anthropic" },
    "gpt-5.4":        { id: "gpt-5.4",                     provider: "openai" },
    "gpt-5.4-mini":   { id: "gpt-5.4-mini",                provider: "openai" }
  },

  async callModel(systemPrompt, messages, options = {}) {
    let modelKey = options.modelKey || "";
    let modelId = options.model || this.MODEL_DEFAULT;
    let provider = "gemini"; // fallback

    // Resolver model key -> model id + provider
    if (modelKey && this.MODELS[modelKey]) {
      let m = this.MODELS[modelKey];
      modelId = m.id;
      provider = m.provider;
    } else if (modelId.includes("gemini")) {
      provider = "gemini";
    } else if (modelId.includes("gpt") || modelId.includes("o1") || modelId.includes("o3")) {
      provider = "openai";
    } else if (modelId.includes("claude")) {
      provider = "anthropic";
    }

    const maxTokens = options.maxTokens || this.MAX_OUTPUT_TOKENS;
    const temperature = typeof options.temperature === 'number' ? options.temperature : this.TEMPERATURE_AGENT;
    const useGrounding = options.useGrounding === true;

    console.log(`[AIRouter] calling ${provider} with model ${modelId}${useGrounding ? ' +grounding' : ''}`);

    if (provider === "gemini") {
      return this._callGemini(systemPrompt, messages, modelId, maxTokens, temperature, useGrounding);
    } else if (provider === "openai") {
      return this._callOpenAI(systemPrompt, messages, modelId, maxTokens, temperature);
    } else {
      return this._callClaude(systemPrompt, messages, modelId, maxTokens, temperature);
    }
  },

  // ── Gemini ────────────────────────────────────────────────────────

  async _callGemini(systemPrompt, messages, modelId, maxTokens, temperature, useGrounding = false) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is missing from .env.local");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

    const contents = messages.map(msg => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }]
    }));

    const payload = {
      contents,
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: temperature
      }
    };

    if (systemPrompt) {
      payload.systemInstruction = {
        parts: [{ text: systemPrompt }]
      };
    }

    if (useGrounding) {
      payload.tools = [{ googleSearch: {} }];
    }

    return this._fetchWithRetry(async () => {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const body = await response.json();

      if (!response.ok) {
        if (response.status === 429) throw new Error("429 Rate limit");
        throw new Error(`Gemini API Error: ${body?.error?.message || response.statusText}`);
      }

      let text = "";
      let tokensIn = body?.usageMetadata?.promptTokenCount || 0;
      let tokensOut = body?.usageMetadata?.candidatesTokenCount || 0;

      if (body.candidates && body.candidates.length > 0) {
        let parts = body.candidates[0].content.parts;
        parts.forEach(p => { if (p.text) text += p.text; });
      }

      return { text, tokensIn, tokensOut, model: modelId };
    });
  },

  // ── OpenAI ─────────────────────────────────────────────────────────

  async _callOpenAI(systemPrompt, messages, modelId, maxTokens, temperature) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY is missing from .env.local");

    const url = "https://api.openai.com/v1/chat/completions";

    const oaiMessages = [];
    if (systemPrompt) {
      oaiMessages.push({ role: "system", content: systemPrompt });
    }
    messages.forEach(m => oaiMessages.push({ role: m.role, content: m.content }));

    // FIX.31 — modelos GPT-5.x e reasoning (o1/o3/o4) exigem
    // `max_completion_tokens`. `max_tokens` é rejeitado pela API.
    // Detectamos pelo prefixo do modelId.
    const usaCompletionTokens = /^(gpt-5|o[1-9])/i.test(modelId);
    const payload = {
      model: modelId,
      messages: oaiMessages,
      temperature: temperature,
    };
    if (usaCompletionTokens) {
      payload.max_completion_tokens = maxTokens;
    } else {
      payload.max_tokens = maxTokens;
    }

    return this._fetchWithRetry(async () => {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
      });

      const body = await response.json();

      if (!response.ok) {
        if (response.status === 429) throw new Error("429 Rate limit");
        throw new Error(`OpenAI API Error: ${body?.error?.message || response.statusText}`);
      }

      let text = (body.choices && body.choices.length > 0) ? body.choices[0].message.content : "";
      let tokensIn = body.usage?.prompt_tokens || 0;
      let tokensOut = body.usage?.completion_tokens || 0;

      return { text, tokensIn, tokensOut, model: body.model || modelId };
    });
  },

  // ── Claude ────────────────────────────────────────────────────────

  async _callClaude(systemPrompt, messages, modelId, maxTokens, temperature) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY is missing from .env.local");

    const url = "https://api.anthropic.com/v1/messages";

    // FIX.12 — streaming habilitado. Chamadas com prompt grande (Agente 6,
    // 13, 15) em single-shot levavam 3-5 min e alguns proxies cortavam
    // antes do endpoint. Com SSE, os bytes começam a chegar em segundos
    // e mantêm a conexão viva até o message_stop.
    const payload = {
      model: modelId,
      max_tokens: maxTokens,
      temperature: temperature,
      messages: messages || [],
      stream: true,
    };

    if (systemPrompt) {
      // cache_control: ephemeral preservado — reduz custo em re-execuções.
      payload.system = [
        { type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } }
      ];
    }

    return this._fetchWithRetryClaude(async () => {
      // FIX.12 — AbortController com 270s. Mesmo em streaming, se o modelo
      // travar sem emitir eventos, o reader fica pendurado. Cortamos um
      // pouco antes do cap do endpoint pra sobrar margem pra parse/save.
      const ctrl = new AbortController();
      const abortTimer = setTimeout(() => ctrl.abort(), CLAUDE_ABORT_MS);

      let response;
      try {
        response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01"
          },
          body: JSON.stringify(payload),
          signal: ctrl.signal,
        });
      } catch (err) {
        clearTimeout(abortTimer);
        if (err?.name === 'AbortError') throw new Error('Claude API: aborted (270s timeout)');
        throw err;
      }

      if (!response.ok) {
        clearTimeout(abortTimer);
        // erros antes do stream começar: body é JSON normal
        let body = null;
        try { body = await response.json(); } catch {}
        if (response.status === 429) throw new Error("429 Rate limit");
        throw new Error(`Claude API Error: ${body?.error?.message || response.statusText}`);
      }

      // FIX.12 — parser SSE manual.
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let text = '';
      let tokensIn = 0;
      let tokensOut = 0;
      let sawMessageStop = false;
      let streamError = null;

      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          // Eventos SSE são separados por \n\n. Mantemos no buffer qualquer
          // linha parcial restante (tail) entre iterações.
          let sepIdx;
          while ((sepIdx = buffer.indexOf('\n\n')) !== -1) {
            const rawEvent = buffer.slice(0, sepIdx);
            buffer = buffer.slice(sepIdx + 2);
            if (!rawEvent.trim()) continue;

            // Um evento SSE pode ter linhas "event: xxx" e "data: {json}".
            // Só a linha data: nos interessa.
            let dataLine = '';
            for (const line of rawEvent.split('\n')) {
              if (line.startsWith('data:')) dataLine = line.slice(5).trimStart();
            }
            if (!dataLine) continue;
            if (dataLine === '[DONE]') { sawMessageStop = true; continue; }

            let evt;
            try { evt = JSON.parse(dataLine); } catch { continue; }

            switch (evt.type) {
              case 'message_start':
                tokensIn = evt.message?.usage?.input_tokens || tokensIn;
                // output_tokens inicial aqui é 0 ou parcial — ignoramos
                break;
              case 'content_block_delta':
                if (evt.delta?.type === 'text_delta' && typeof evt.delta.text === 'string') {
                  text += evt.delta.text;
                }
                break;
              case 'message_delta':
                // usage.output_tokens no message_delta é CUMULATIVO (não incremental).
                // Sobrescrever em vez de somar — em algumas versões Anthropic
                // envia múltiplos message_delta com o mesmo cumulativo.
                if (typeof evt.usage?.output_tokens === 'number') {
                  tokensOut = evt.usage.output_tokens;
                }
                if (typeof evt.usage?.input_tokens === 'number' && evt.usage.input_tokens > tokensIn) {
                  tokensIn = evt.usage.input_tokens;
                }
                break;
              case 'message_stop':
                sawMessageStop = true;
                break;
              case 'error':
                streamError = evt.error?.message || 'erro sem mensagem';
                break;
              // content_block_start / content_block_stop / ping: ignorados
            }
          }
        }
      } finally {
        clearTimeout(abortTimer);
      }

      if (streamError) throw new Error(`Claude stream error: ${streamError}`);
      if (!sawMessageStop) {
        // Stream encerrou sem message_stop — pode ser a conexão caiu mid-stream.
        throw new Error('Claude stream: conexão fechou antes de message_stop');
      }

      return { text, tokensIn, tokensOut, model: modelId };
    });
  },

  // FIX.12 — retry enxuto específico de Claude. Separado do _fetchWithRetry
  // genérico (Gemini/OpenAI) pra não mudar comportamento dos outros providers.
  async _fetchWithRetryClaude(fetchFn) {
    let lastError;
    const sleep = ms => new Promise(r => setTimeout(r, ms));

    for (let attempt = 0; attempt < MAX_RETRIES_CLAUDE; attempt++) {
      if (RETRY_DELAYS_CLAUDE[attempt] > 0) {
        await sleep(RETRY_DELAYS_CLAUDE[attempt]);
      }
      try {
        return await fetchFn();
      } catch (error) {
        lastError = error;
        console.warn(`[AIRouter/Claude] Attempt ${attempt + 1}/${MAX_RETRIES_CLAUDE} failed: ${error.message}`);
        if (error.message.includes('400') || error.message.includes('401') || error.message.includes('403')) {
          throw error; // auth/malformed — não retentar
        }
        if (isTimeoutError(error)) {
          throw error; // timeout — retry vai cair no mesmo problema e só gasta tempo
        }
      }
    }
    throw lastError;
  },

  // ── Retry Genérico ────────────────────────────────────────────────

  async _fetchWithRetry(fetchFn) {
    let lastError;
    const sleep = ms => new Promise(r => setTimeout(r, ms));

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      if (RETRY_DELAYS[attempt] > 0) {
        await sleep(RETRY_DELAYS[attempt]);
      }
      try {
        return await fetchFn();
      } catch (error) {
        lastError = error;
        console.warn(`[AIRouter] Attempt ${attempt + 1}/${MAX_RETRIES} failed: ${error.message}`);
        if (error.message.includes("400") || error.message.includes("401") || error.message.includes("403")) {
          throw error; // Não retentar erros criticos de auth ou malformed request
        }
      }
    }
    throw lastError;
  }
};
