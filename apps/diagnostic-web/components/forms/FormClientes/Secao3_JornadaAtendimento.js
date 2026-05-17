import { Campo, LegendSection, RequiredMark, TextArea, CheckboxGroup, EscalaSlider } from './_ui';
import { CANAIS_INTERACAO, DIMENSOES_ATENDIMENTO, toKey } from '../../../lib/forms/clientes_v2_schema';

export default function Secao3_JornadaAtendimento({ dados, atualizar, erros, projetoMeta }) {
  const marca = projetoMeta?.nome_marca || 'a marca';
  const canaisMarcados = Array.isArray(dados.s3_canais_interacao) ? dados.s3_canais_interacao : [];

  return (
    <section>
      <h2 style={{ fontSize: '1.4rem', marginTop: 0 }}>Seção 3 — Jornada e atendimento</h2>
      <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '1.5rem' }}>
        Os pontos de contato e a qualidade da interação.
      </p>

      <LegendSection titulo="Canais de contato">
        <Campo label={<>16. Por quais canais você já interagiu com {marca}? <RequiredMark/></>}
          hint="Marque todos que se aplicam."
          erro={erros.s3_canais_interacao}>
          <CheckboxGroup
            name="s3_canais_interacao"
            opcoes={CANAIS_INTERACAO}
            values={canaisMarcados}
            onChange={v => atualizar('s3_canais_interacao', v)}
          />
          {canaisMarcados.includes('Outro') && (
            <input
              className="form-input"
              type="text"
              placeholder="Especifique…"
              value={dados.s3_canais_outro || ''}
              onChange={e => atualizar('s3_canais_outro', e.target.value)}
              style={{ marginTop: '0.5rem' }}
            />
          )}
        </Campo>
      </LegendSection>

      <LegendSection titulo="Qualidade do atendimento (0-10)">
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: 0 }}>
          17. De 0 a 10, como você avalia nosso atendimento nos seguintes quesitos?
          <br/><small style={{ color: 'var(--text-secondary)' }}>Avalie ao menos 3 das 5 dimensões.</small>
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          {DIMENSOES_ATENDIMENTO.map(dim => {
            const campo = `s3_atendimento_${toKey(dim)}`;
            return (
              <div key={dim} style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                <label htmlFor={campo} style={{ fontSize: '0.9rem', fontWeight: 500 }}>{dim}</label>
                <EscalaSlider name={campo} value={dados[campo]} onChange={v => atualizar(campo, v)} />
              </div>
            );
          })}
        </div>
        {erros.s3_atendimento && (
          <small style={{ display: 'block', color: 'var(--brand-red, #dc2626)', marginTop: '0.5rem' }}>{erros.s3_atendimento}</small>
        )}
      </LegendSection>

      <LegendSection titulo="Diferenças e última comunicação">
        <Campo id="s3_diferenca_real" label="18. Em qual desses itens você viu diferença real vs outros lugares que já usou?">
          <TextArea id="s3_diferenca_real" value={dados.s3_diferenca_real} onChange={v => atualizar('s3_diferenca_real', v)} rows={3} />
        </Campo>

        <Campo id="s3_ultima_comunicacao" label="19. Qual foi a última vez que você viu algo da marca nos canais (redes, WhatsApp, site, e-mail)? O que você lembra?">
          <TextArea id="s3_ultima_comunicacao" value={dados.s3_ultima_comunicacao} onChange={v => atualizar('s3_ultima_comunicacao', v)} rows={3} />
        </Campo>
      </LegendSection>
    </section>
  );
}
