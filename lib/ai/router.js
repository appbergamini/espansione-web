// =====================================================================
// ESPANSIONE - router.js
//
// Router multi-provider: Gemini (Google), Claude (Anthropic), OpenAI
// =====================================================================

const MAX_RETRIES = 3;
const RETRY_DELAYS = [0, 2000, 5000];

export const AIRouter = {
  // Configs padrão
  MODEL_DEFAULT: "gemini-3-flash-preview", // Pode ser ajustado depois
  MAX_OUTPUT_TOKENS: 16000,
  TEMPERATURE_AGENT: 0.3,

  // Catalogo de modelos para resolver IDs e Providers
  MODELS: {
    "gemini-flash":   { id: "gemini-3-flash-preview",      provider: "gemini" },
    "gemini-pro":     { id: "gemini-1.5-pro",              provider: "gemini" },
    "claude-opus-4-7":{ id: "claude-opus-4-7",             provider: "anthropic" },
    "claude-sonnet":  { id: "claude-sonnet-4-6",           provider: "anthropic" },
    "claude-haiku":   { id: "claude-haiku-4-5-20251001",   provider: "anthropic" },
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

    const payload = {
      model: modelId,
      messages: oaiMessages,
      max_tokens: maxTokens,
      temperature: temperature
    };

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

    const payload = {
      model: modelId,
      max_tokens: maxTokens,
      temperature: temperature,
      messages: messages || []
    };

    if (systemPrompt) {
      payload.system = [
        { type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } }
      ];
    }

    return this._fetchWithRetry(async () => {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify(payload)
      });

      const body = await response.json();

      if (!response.ok) {
        if (response.status === 429) throw new Error("429 Rate limit");
        throw new Error(`Claude API Error: ${body?.error?.message || response.statusText}`);
      }

      let text = "";
      if (body.content) {
        body.content.forEach(c => { if (c.type === "text") text += c.text; });
      }

      let tokensIn = body.usage?.input_tokens || 0;
      let tokensOut = body.usage?.output_tokens || 0;

      return { text, tokensIn, tokensOut, model: body.model || modelId };
    });
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
