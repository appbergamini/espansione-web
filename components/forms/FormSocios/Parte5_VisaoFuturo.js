import { Campo, LegendSection, TextArea, TextAreaLongo, TabelaParalela } from './_ui';

export default function Parte5_VisaoFuturo({ dados, atualizar }) {
  return (
    <section>
      <h2 style={{ fontSize: '1.4rem', marginTop: 0 }}>Parte 5 — Visão, Futuro e Estratégia</h2>
      <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '1.5rem' }}>
        Olhar para frente. Visão, objetivos, alavancas e obstáculos.
      </p>

      <LegendSection titulo="5.1 Visão de futuro">
        <Campo id="p5_visao_marca" label="1. Conte sobre sua visão para esta marca"
          hint="Qual foi a motivação para criá-la, o que ela significa na vida das pessoas, e como quer que ela seja percebida?">
          <TextAreaLongo id="p5_visao_marca" value={dados.p5_visao_marca} onChange={v => atualizar('p5_visao_marca', v)} />
        </Campo>

        <Campo label="2. Onde você quer a empresa em 3 anos? E em 5 anos?"
          hint="Seja concreto: faturamento, estrutura, presença, reputação.">
          <TabelaParalela
            colunas={[
              {
                header: 'Em 3 anos',
                children: <TextArea id="p5_visao_3_anos" value={dados.p5_visao_3_anos} onChange={v => atualizar('p5_visao_3_anos', v)} rows={5} />,
              },
              {
                header: 'Em 5 anos',
                children: <TextArea id="p5_visao_5_anos" value={dados.p5_visao_5_anos} onChange={v => atualizar('p5_visao_5_anos', v)} rows={5} />,
              },
            ]}
          />
        </Campo>

        <Campo id="p5_papel_no_mundo" label="3. Qual é, na sua visão, o papel que sua organização tem ou quer ter no mundo?">
          <TextAreaLongo id="p5_papel_no_mundo" value={dados.p5_papel_no_mundo} onChange={v => atualizar('p5_papel_no_mundo', v)} />
        </Campo>

        <Campo id="p5_mudaria_uma_coisa" label="4. Se pudesse mudar UMA coisa na sua marca amanhã, o que seria?">
          <TextArea id="p5_mudaria_uma_coisa" value={dados.p5_mudaria_uma_coisa} onChange={v => atualizar('p5_mudaria_uma_coisa', v)} rows={3} />
        </Campo>
      </LegendSection>

      <LegendSection titulo="5.2 Objetivos e desafios pessoais">
        <Campo label="5. Hoje, enquanto líder do negócio:">
          <TabelaParalela
            colunas={[
              {
                header: 'Meu MAIOR OBJETIVO é…',
                children: <TextArea id="p5_maior_objetivo" value={dados.p5_maior_objetivo} onChange={v => atualizar('p5_maior_objetivo', v)} rows={4} />,
              },
              {
                header: 'Meu MAIOR DESAFIO é…',
                children: <TextArea id="p5_maior_desafio" value={dados.p5_maior_desafio} onChange={v => atualizar('p5_maior_desafio', v)} rows={4} />,
              },
            ]}
          />
        </Campo>

        <Campo id="p5_metas_12_meses" label="6. Quais metas de negócio a marca e a comunicação precisam sustentar nos próximos 12 meses?">
          <TextArea id="p5_metas_12_meses" value={dados.p5_metas_12_meses} onChange={v => atualizar('p5_metas_12_meses', v)} rows={4}
            placeholder="Ex.: crescimento, premiumização, expansão de canal, retenção, marca empregadora, fortalecimento comercial" />
        </Campo>
      </LegendSection>

      <LegendSection titulo="5.3 Mapeamento estratégico (IDA)">
        <Campo label="Liste 3 em cada coluna, frases curtas de uma linha:">
          <TabelaParalela
            colunas={[
              {
                header: '3 IMPULSIONADORES (forças)',
                children: (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {[1, 2, 3].map(n => (
                      <input
                        key={n}
                        className="form-input"
                        type="text"
                        placeholder={`Impulsionador ${n}`}
                        value={dados[`p5_impulsionador_${n}`] || ''}
                        onChange={e => atualizar(`p5_impulsionador_${n}`, e.target.value)}
                      />
                    ))}
                  </div>
                ),
              },
              {
                header: '3 DETRATORES (fragilidades)',
                children: (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {[1, 2, 3].map(n => (
                      <input
                        key={n}
                        className="form-input"
                        type="text"
                        placeholder={`Detrator ${n}`}
                        value={dados[`p5_detrator_${n}`] || ''}
                        onChange={e => atualizar(`p5_detrator_${n}`, e.target.value)}
                      />
                    ))}
                  </div>
                ),
              },
              {
                header: '3 ACELERADORES (oportunidades)',
                children: (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {[1, 2, 3].map(n => (
                      <input
                        key={n}
                        className="form-input"
                        type="text"
                        placeholder={`Acelerador ${n}`}
                        value={dados[`p5_acelerador_${n}`] || ''}
                        onChange={e => atualizar(`p5_acelerador_${n}`, e.target.value)}
                      />
                    ))}
                  </div>
                ),
              },
            ]}
          />
        </Campo>

        <Campo id="p5_o_que_necessario_chegar" label="7. O que é necessário para chegar até a sua visão de futuro? Com quem você pode aprender?"
          hint="Mentores, referências, parceiros, formações.">
          <TextArea id="p5_o_que_necessario_chegar" value={dados.p5_o_que_necessario_chegar} onChange={v => atualizar('p5_o_que_necessario_chegar', v)} rows={4} />
        </Campo>
      </LegendSection>

      <LegendSection titulo="5.4 Reflexão Final (opcional)">
        <div style={{
          background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)',
          borderRadius: 8, padding: '0.8rem 1rem', marginBottom: '1rem',
          fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.55,
        }}>
          ⭐ As próximas perguntas são mais francas. Elas costumam ficar de fora de questionários,
          mas são as que mais ajudam a entender a realidade por trás do negócio. Responda só o que fizer sentido
          agora — respostas vazias também são dado. Você pode pular este bloco e voltar depois.
          <br/><strong>Todos os campos abaixo são opcionais.</strong>
        </div>

        <Campo id="p5_tira_o_sono" label="8. O que mais te tira o sono em relação ao negócio?">
          <TextArea id="p5_tira_o_sono" value={dados.p5_tira_o_sono} onChange={v => atualizar('p5_tira_o_sono', v)} rows={3} />
        </Campo>

        <Campo id="p5_maior_medo" label="9. Qual o maior medo em relação ao futuro da empresa?">
          <TextArea id="p5_maior_medo" value={dados.p5_maior_medo} onChange={v => atualizar('p5_maior_medo', v)} rows={3} />
        </Campo>

        <Campo id="p5_vergonha" label="10. Do que você tem vergonha na empresa hoje?">
          <TextArea id="p5_vergonha" value={dados.p5_vergonha} onChange={v => atualizar('p5_vergonha', v)} rows={3} />
        </Campo>

        <Campo id="p5_promete_fora_nao_entrega_dentro" label="11. O que sua marca promete publicamente que você sente que nem sempre consegue entregar por dentro?">
          <TextArea id="p5_promete_fora_nao_entrega_dentro" value={dados.p5_promete_fora_nao_entrega_dentro} onChange={v => atualizar('p5_promete_fora_nao_entrega_dentro', v)} rows={3} />
        </Campo>

        <Campo id="p5_incoerencia_a_resolver" label="12. Qual incoerência entre o que a empresa diz e o que pratica você gostaria de resolver primeiro?">
          <TextArea id="p5_incoerencia_a_resolver" value={dados.p5_incoerencia_a_resolver} onChange={v => atualizar('p5_incoerencia_a_resolver', v)} rows={3} />
        </Campo>
      </LegendSection>

      <LegendSection titulo="5.5 Alinhamento entre sócios">
        <div style={{
          background: 'rgba(107,163,255,0.06)', border: '1px solid rgba(107,163,255,0.18)',
          borderRadius: 8, padding: '0.7rem 0.9rem', marginBottom: '0.9rem',
          fontSize: '0.88rem', color: 'var(--text-secondary)',
        }}>
          Se sua empresa tem <strong>2 ou mais sócios</strong>, responda as duas perguntas abaixo.
          Caso contrário, pode pular.
        </div>

        <Campo id="p5_divergencia_entre_socios" label="13. Quais destas perguntas anteriores você acha que seu(s) sócio(s) responderia(m) muito diferente de você?">
          <TextArea id="p5_divergencia_entre_socios" value={dados.p5_divergencia_entre_socios} onChange={v => atualizar('p5_divergencia_entre_socios', v)} rows={3} />
        </Campo>

        <Campo id="p5_maior_tensao_socios" label="14. Se hoje vocês tivessem que optar por uma direção e divergissem, onde seria a maior tensão entre os sócios?">
          <TextArea id="p5_maior_tensao_socios" value={dados.p5_maior_tensao_socios} onChange={v => atualizar('p5_maior_tensao_socios', v)} rows={3} />
        </Campo>
      </LegendSection>

      {/* FIX.29 (Fase A) — Comunicação atual e investimento. Insumo
          direto do Agente 13 (Plano de Comunicação) pra calibrar
          plano de conexões e share de budget por Onda com a realidade
          do cliente. Todos opcionais — se ficar em branco, o agente
          entrega recomendação metodológica pura. */}
      <LegendSection titulo="5.6 Comunicação atual e investimento">
        <div style={{
          background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.20)',
          borderRadius: 8, padding: '0.7rem 0.9rem', marginBottom: '0.9rem',
          fontSize: '0.88rem', color: 'var(--text-secondary)',
        }}>
          Esta seção alimenta o Plano de Comunicação. Quanto mais detalhado,
          mais o plano será calibrado à realidade da sua empresa.
          Todos os campos são opcionais.
        </div>

        <Campo id="p5_canais_ativos_hoje" label="15. Quais canais de comunicação a empresa USA HOJE de forma recorrente?"
          hint="Site, blog, redes (LinkedIn / Instagram / YouTube / TikTok / outras), e-mail marketing, podcasts, eventos próprios, mídia paga, PR, etc. Diga quais canais estão ATIVOS — não os planejados.">
          <TextArea id="p5_canais_ativos_hoje" value={dados.p5_canais_ativos_hoje} onChange={v => atualizar('p5_canais_ativos_hoje', v)} rows={4} />
        </Campo>

        <Campo id="p5_canais_papel_principal" label="16. Para cada canal ativo, qual é o papel principal hoje?"
          hint="Ex.: 'LinkedIn — autoridade institucional', 'Instagram — relação com cliente final', 'E-mail — pós-venda'. Se não souber, escreva 'sem direção definida'.">
          <TextArea id="p5_canais_papel_principal" value={dados.p5_canais_papel_principal} onChange={v => atualizar('p5_canais_papel_principal', v)} rows={3} />
        </Campo>

        <Campo id="p5_equipe_comunicacao" label="17. Quem cuida da comunicação hoje?"
          hint="Time interno (com quantas pessoas e papéis), agência terceirizada, freelancers, sócio acumulando, ninguém dedicado.">
          <TextArea id="p5_equipe_comunicacao" value={dados.p5_equipe_comunicacao} onChange={v => atualizar('p5_equipe_comunicacao', v)} rows={3} />
        </Campo>

        <Campo id="p5_orcamento_comunicacao_faixa" label="18. Faixa anual de investimento em comunicação (incluindo mídia, agência, produção, eventos)">
          <select
            id="p5_orcamento_comunicacao_faixa"
            value={dados.p5_orcamento_comunicacao_faixa || ''}
            onChange={e => atualizar('p5_orcamento_comunicacao_faixa', e.target.value)}
            className="form-input"
            style={{ width: '100%' }}
          >
            <option value="">— selecione —</option>
            <option value="ate_50k">Até R$ 50 mil/ano</option>
            <option value="50k_150k">R$ 50 mil a R$ 150 mil/ano</option>
            <option value="150k_500k">R$ 150 mil a R$ 500 mil/ano</option>
            <option value="500k_1.5m">R$ 500 mil a R$ 1,5 milhão/ano</option>
            <option value="1.5m_5m">R$ 1,5 a R$ 5 milhões/ano</option>
            <option value="acima_5m">Acima de R$ 5 milhões/ano</option>
            <option value="nao_definido">Ainda não tenho orçamento definido</option>
            <option value="prefere_nao_informar">Prefiro não informar</option>
          </select>
        </Campo>

        <Campo id="p5_orcamento_comunicacao_observacoes" label="19. Observações sobre o orçamento (opcional)"
          hint="Ex.: 'crescemos 30% em mídia paga este ano', 'vamos investir mais em conteúdo próprio', 'não há orçamento dedicado mas há disposição', etc.">
          <TextArea id="p5_orcamento_comunicacao_observacoes" value={dados.p5_orcamento_comunicacao_observacoes} onChange={v => atualizar('p5_orcamento_comunicacao_observacoes', v)} rows={3} />
        </Campo>

        <Campo id="p5_comunicacao_funciona_e_nao_funciona" label="20. O que está funcionando e o que NÃO está na sua comunicação hoje?"
          hint="Seja honesto. Achados aqui guiam onde o plano vai investir vs onde vai cortar.">
          <TabelaParalela
            colunas={[
              { header: 'O que está funcionando', children: <TextArea id="p5_comunicacao_funciona" value={dados.p5_comunicacao_funciona} onChange={v => atualizar('p5_comunicacao_funciona', v)} rows={4} /> },
              { header: 'O que NÃO está funcionando', children: <TextArea id="p5_comunicacao_nao_funciona" value={dados.p5_comunicacao_nao_funciona} onChange={v => atualizar('p5_comunicacao_nao_funciona', v)} rows={4} /> },
            ]}
          />
        </Campo>

        <Campo id="p5_objetivos_comunicacao_12m" label="21. O que você espera DA COMUNICAÇÃO especificamente nos próximos 12 meses?"
          hint="Não é meta de negócio (já respondida em 5.2). É o que comunicação precisa ENTREGAR — ex.: posicionamento institucional, geração de demanda qualificada, atração de talento, recall em determinada audiência, presença em prêmios.">
          <TextArea id="p5_objetivos_comunicacao_12m" value={dados.p5_objetivos_comunicacao_12m} onChange={v => atualizar('p5_objetivos_comunicacao_12m', v)} rows={4} />
        </Campo>
      </LegendSection>
    </section>
  );
}
