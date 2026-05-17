import { Campo, LegendSection, RequiredMark, RadioGroup } from './_ui';
import { TEXTO_CONSENTIMENTO_OPT_IN } from '../../../lib/forms/colaboradores_v3_schema';

export default function Bloco8_OptIn({ dados, atualizar, erros }) {
  const topa = dados.b8_topa_entrevista === 'sim';

  return (
    <section>
      <h2 style={{ fontSize: '1.4rem', marginTop: 0 }}>Bloco 8 — Participação opcional em entrevista</h2>

      <div style={{
        background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.3)',
        borderRadius: 8, padding: '1rem 1.15rem', marginBottom: '1.25rem',
        fontSize: '0.92rem', lineHeight: 1.6,
      }}>
        <p style={{ margin: '0 0 0.55rem 0' }}>
          <strong>Esta última seção é completamente opcional</strong> e fica em <strong>área separada</strong> das suas respostas anteriores.
        </p>
        <p style={{ margin: '0 0 0.55rem 0' }}>
          Queremos entender algumas questões em mais profundidade com um grupo pequeno de colaboradores.
          Se você aceitar essa <strong>conversa confidencial de 30 minutos</strong>, deixe seu contato abaixo.
          Os dados aqui informados são usados <strong>exclusivamente para agendar a entrevista</strong>
          {' '}— e não são cruzados com suas respostas da pesquisa anterior, que permanecem totalmente anônimas.
        </p>
        <p style={{ margin: 0 }}>
          Se preferir não participar, selecione &ldquo;Não&rdquo; e envie. Sua voz já foi capturada no que você respondeu.
        </p>
      </div>

      <Campo label="31. Você toparia participar de uma conversa confidencial de 30 minutos para aprofundarmos alguns temas?">
        <RadioGroup
          name="b8_topa_entrevista"
          opcoes={['Sim, podem me convidar', 'Não, prefiro apenas as respostas da pesquisa']}
          value={dados.b8_topa_entrevista === 'sim' ? 'Sim, podem me convidar'
               : dados.b8_topa_entrevista === 'nao' ? 'Não, prefiro apenas as respostas da pesquisa'
               : null}
          onChange={label => atualizar('b8_topa_entrevista', label === 'Sim, podem me convidar' ? 'sim' : 'nao')}
        />
      </Campo>

      {topa && (
        <LegendSection titulo="Dados para contato (consentimento obrigatório)">
          <Campo id="b8_nome" label={<>32. Nome completo <RequiredMark/></>} erro={erros.b8_nome}>
            <input className="form-input" type="text" id="b8_nome"
              value={dados.b8_nome || ''} onChange={e => atualizar('b8_nome', e.target.value)} />
          </Campo>

          <Campo id="b8_contato" label={<>33. WhatsApp ou e-mail para contato <RequiredMark/></>} erro={erros.b8_contato}>
            <input className="form-input" type="text" id="b8_contato"
              value={dados.b8_contato || ''} onChange={e => atualizar('b8_contato', e.target.value)} />
          </Campo>

          <div style={{ marginTop: '0.9rem' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.55rem', cursor: 'pointer', fontSize: '0.88rem', lineHeight: 1.5 }}>
              <input
                type="checkbox"
                checked={!!dados.b8_consentimento}
                onChange={e => atualizar('b8_consentimento', e.target.checked)}
                style={{ marginTop: '0.2rem', flexShrink: 0 }}
              />
              <span>{TEXTO_CONSENTIMENTO_OPT_IN}</span>
            </label>
            {erros.b8_consentimento && (
              <small style={{ display: 'block', color: 'var(--brand-red, #dc2626)', marginTop: '0.35rem', fontSize: '0.82rem' }}>
                {erros.b8_consentimento}
              </small>
            )}
          </div>
        </LegendSection>
      )}
    </section>
  );
}
