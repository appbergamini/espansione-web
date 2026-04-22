import { Campo, LegendSection, RequiredMark, RadioGroup, TextArea } from './_ui';
import { TEMPO_CLIENTE, FREQUENCIA_USO, IMPORTANCIA_SERVICO } from '../../../lib/forms/clientes_v2_schema';

export default function Secao1_Perfil({ dados, atualizar, erros, projetoMeta }) {
  const ehB2B = projetoMeta?.tipo_negocio === 'B2B' || projetoMeta?.tipo_negocio === 'B2B2C';
  const marca = projetoMeta?.nome_marca || 'a marca';

  return (
    <section>
      <h2 style={{ fontSize: '1.4rem', marginTop: 0 }}>Seção 1 — Quem é você</h2>
      <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '1.5rem' }}>
        Perfil e contexto — quanto mais específico, mais preciso o diagnóstico.
      </p>

      <LegendSection titulo="Perfil">
        <Campo id="s1_nome_completo" label={<>1. Nome completo <RequiredMark/></>} erro={erros.s1_nome_completo}>
          <input className="form-input" type="text" id="s1_nome_completo"
            value={dados.s1_nome_completo || ''} onChange={e => atualizar('s1_nome_completo', e.target.value)} />
        </Campo>

        <Campo id="s1_idade" label="2. Idade (opcional)">
          <input className="form-input" type="number" id="s1_idade"
            value={dados.s1_idade || ''} onChange={e => atualizar('s1_idade', e.target.value)} />
        </Campo>

        <Campo id="s1_profissao" label={<>3. Profissão / Cargo <RequiredMark/></>} erro={erros.s1_profissao}>
          <input className="form-input" type="text" id="s1_profissao"
            value={dados.s1_profissao || ''} onChange={e => atualizar('s1_profissao', e.target.value)} />
        </Campo>

        <Campo id="s1_cidade_estado" label={<>4. Cidade / Estado <RequiredMark/></>} erro={erros.s1_cidade_estado}>
          <input className="form-input" type="text" id="s1_cidade_estado"
            value={dados.s1_cidade_estado || ''} onChange={e => atualizar('s1_cidade_estado', e.target.value)} />
        </Campo>

        {ehB2B && (
          <Campo id="s1_empresa_b2b" label="5. Empresa / Organização">
            <input className="form-input" type="text" id="s1_empresa_b2b"
              value={dados.s1_empresa_b2b || ''} onChange={e => atualizar('s1_empresa_b2b', e.target.value)} />
          </Campo>
        )}
      </LegendSection>

      <LegendSection titulo="Relação com a marca">
        <Campo label={<>6. Há quanto tempo é cliente de {marca}? <RequiredMark/></>} erro={erros.s1_tempo_cliente}>
          <RadioGroup name="s1_tempo_cliente" opcoes={TEMPO_CLIENTE}
            value={dados.s1_tempo_cliente} onChange={v => atualizar('s1_tempo_cliente', v)} />
        </Campo>

        <Campo label={<>7. Com que frequência usa / consome {marca}? <RequiredMark/></>} erro={erros.s1_frequencia_uso}>
          <RadioGroup name="s1_frequencia_uso" opcoes={FREQUENCIA_USO}
            value={dados.s1_frequencia_uso} onChange={v => atualizar('s1_frequencia_uso', v)} />
        </Campo>

        <Campo id="s1_ultima_interacao" label="8. Qual foi a sua última interação ou compra com a marca (mês/ano aproximado)?">
          <input className="form-input" type="text" id="s1_ultima_interacao"
            placeholder="ex.: outubro/2025"
            value={dados.s1_ultima_interacao || ''}
            onChange={e => atualizar('s1_ultima_interacao', e.target.value)} />
        </Campo>

        <Campo label={<>9. Qual a importância desse tipo de produto/serviço no seu dia a dia? <RequiredMark/></>} erro={erros.s1_importancia}>
          <RadioGroup name="s1_importancia" opcoes={IMPORTANCIA_SERVICO}
            value={dados.s1_importancia} onChange={v => atualizar('s1_importancia', v)} />
        </Campo>

        <Campo id="s1_problema_resolver" label={<>10. Que problema da sua vida ou rotina te fez procurar por esse tipo de produto/serviço? <RequiredMark/></>} erro={erros.s1_problema_resolver}>
          <TextArea id="s1_problema_resolver" value={dados.s1_problema_resolver} onChange={v => atualizar('s1_problema_resolver', v)} rows={4} />
        </Campo>
      </LegendSection>
    </section>
  );
}
