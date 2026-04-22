import { Campo, RadioGroup, LegendSection, RequiredMark } from './_ui';

const ESCOLARIDADE = [
  'Até ensino médio completo',
  'Superior incompleto',
  'Superior completo',
  'Pós-graduação (MBA, mestrado, doutorado)',
];

const OCUPACAO = [
  'Empresário(a) / sócio(a)',
  'Profissional liberal',
  'Autônomo(a)',
  'Colaborador(a) em cargo de liderança',
  'Outro',
];

const TEMPO = ['Menos de 1 ano', '1 a 3 anos', '3 a 7 anos', '7 a 15 anos', 'Mais de 15 anos'];
const SEGMENTO = ['Serviço', 'Comércio varejista', 'Comércio atacadista', 'Indústria', 'Outro'];
const FATURAMENTO = [
  'Até R$ 120 mil', 'R$ 120 mil a R$ 500 mil', 'R$ 500 mil a R$ 2 milhões',
  'R$ 2 a 6 milhões', 'R$ 6 a 12 milhões', 'Mais de R$ 12 milhões',
];
const COLABORADORES = ['Apenas eu', '2 a 10', '11 a 50', '51 a 100', 'Mais de 100'];
const ESTAGIO = [
  { key: 'Estruturação',      desc: 'ainda montando as bases' },
  { key: 'Crescimento',       desc: 'expandindo operação e receita' },
  { key: 'Reposicionamento',  desc: 'redefinindo direção ou identidade' },
  { key: 'Consolidação',      desc: 'maturidade e escala' },
  { key: 'Sucessão',          desc: 'transição de liderança ou sociedade' },
  { key: 'Virada',            desc: 'correção de rota diante de crise ou ruptura' },
];

export default function Parte1_Identificacao({ dados, atualizar, erros }) {
  return (
    <section>
      <h2 style={{ fontSize: '1.4rem', marginTop: 0 }}>Parte 1 — Identificação da Empresa</h2>
      <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '1.5rem' }}>
        Dados objetivos que contextualizam todas as análises seguintes.
      </p>

      <LegendSection titulo="Sobre você">
        <Campo id="p1_nome_completo" label={<>1. Nome completo <RequiredMark/></>} erro={erros.p1_nome_completo}>
          <input className="form-input" type="text" id="p1_nome_completo"
            value={dados.p1_nome_completo || ''} onChange={e => atualizar('p1_nome_completo', e.target.value)} />
        </Campo>

        <Campo id="p1_idade" label="2. Idade">
          <input className="form-input" type="number" id="p1_idade"
            value={dados.p1_idade || ''} onChange={e => atualizar('p1_idade', e.target.value)} />
        </Campo>

        <Campo id="p1_cidade_estado" label="3. Cidade / Estado">
          <input className="form-input" type="text" id="p1_cidade_estado"
            value={dados.p1_cidade_estado || ''} onChange={e => atualizar('p1_cidade_estado', e.target.value)} />
        </Campo>

        <Campo id="p1_email" label={<>4. E-mail <RequiredMark/></>} erro={erros.p1_email}>
          <input className="form-input" type="email" id="p1_email"
            value={dados.p1_email || ''} onChange={e => atualizar('p1_email', e.target.value)} />
        </Campo>

        <Campo id="p1_telefone" label={<>5. Telefone / WhatsApp <RequiredMark/></>} erro={erros.p1_telefone}>
          <input className="form-input" type="tel" id="p1_telefone"
            value={dados.p1_telefone || ''} onChange={e => atualizar('p1_telefone', e.target.value)} />
        </Campo>

        <Campo label="6. Grau de escolaridade">
          <RadioGroup name="p1_escolaridade" opcoes={ESCOLARIDADE}
            value={dados.p1_escolaridade} onChange={v => atualizar('p1_escolaridade', v)} />
        </Campo>

        <Campo label="7. Principal ocupação atual">
          <RadioGroup name="p1_ocupacao" opcoes={OCUPACAO}
            value={dados.p1_ocupacao} onChange={v => atualizar('p1_ocupacao', v)} />
          {dados.p1_ocupacao === 'Outro' && (
            <input className="form-input" type="text" placeholder="Especifique…"
              value={dados.p1_ocupacao_outro || ''}
              onChange={e => atualizar('p1_ocupacao_outro', e.target.value)}
              style={{ marginTop: '0.5rem' }} />
          )}
        </Campo>
      </LegendSection>

      <LegendSection titulo="Sobre a empresa">
        <Campo id="p1_razao_social" label={<>8. Razão social / nome fantasia <RequiredMark/></>} erro={erros.p1_razao_social}>
          <input className="form-input" type="text" id="p1_razao_social"
            value={dados.p1_razao_social || ''} onChange={e => atualizar('p1_razao_social', e.target.value)} />
        </Campo>

        <Campo id="p1_ano_fundacao" label={<>9. Ano de fundação <RequiredMark/></>} erro={erros.p1_ano_fundacao}>
          <input className="form-input" type="number" id="p1_ano_fundacao" min="1900" max={new Date().getFullYear()}
            value={dados.p1_ano_fundacao || ''} onChange={e => atualizar('p1_ano_fundacao', e.target.value)} />
        </Campo>

        <Campo id="p1_site_instagram" label="10. Site / Instagram / redes sociais principais">
          <input className="form-input" type="text" id="p1_site_instagram"
            value={dados.p1_site_instagram || ''} onChange={e => atualizar('p1_site_instagram', e.target.value)} />
        </Campo>

        <Campo label="11. Há quanto tempo sua empresa existe?">
          <RadioGroup name="p1_tempo_existencia" opcoes={TEMPO}
            value={dados.p1_tempo_existencia} onChange={v => atualizar('p1_tempo_existencia', v)} />
        </Campo>

        <Campo label={<>12. Segmento de atuação <RequiredMark/></>} erro={erros.p1_segmento}>
          <RadioGroup name="p1_segmento" opcoes={SEGMENTO}
            value={dados.p1_segmento} onChange={v => atualizar('p1_segmento', v)} />
          {dados.p1_segmento === 'Outro' && (
            <input className="form-input" type="text" placeholder="Especifique…"
              value={dados.p1_segmento_outro || ''}
              onChange={e => atualizar('p1_segmento_outro', e.target.value)}
              style={{ marginTop: '0.5rem' }} />
          )}
        </Campo>

        <Campo label="13. Faturamento anual atual">
          <RadioGroup name="p1_faturamento" opcoes={FATURAMENTO}
            value={dados.p1_faturamento} onChange={v => atualizar('p1_faturamento', v)} />
        </Campo>

        <Campo label="14. Número de colaboradores">
          <RadioGroup name="p1_colaboradores" opcoes={COLABORADORES}
            value={dados.p1_colaboradores} onChange={v => atualizar('p1_colaboradores', v)} />
        </Campo>

        <Campo label={<>15. Estágio atual do negócio <RequiredMark/></>} erro={erros.p1_estagio_negocio}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {ESTAGIO.map(opt => (
              <label key={opt.key} style={radioItemStyle(dados.p1_estagio_negocio === opt.key)}>
                <input type="radio" name="p1_estagio_negocio" value={opt.key}
                  checked={dados.p1_estagio_negocio === opt.key}
                  onChange={() => atualizar('p1_estagio_negocio', opt.key)}
                  style={{ marginTop: 3 }} />
                <span><strong>{opt.key}</strong> — {opt.desc}</span>
              </label>
            ))}
          </div>
        </Campo>

        <Campo id="p1_organizacao" label="16. Como a empresa está organizada hoje? (seu papel, o dos sócios, as áreas principais)">
          <textarea className="form-input" id="p1_organizacao" rows={5}
            value={dados.p1_organizacao || ''} onChange={e => atualizar('p1_organizacao', e.target.value)} />
        </Campo>

        <Campo id="p1_decisoes_12m" label={<>17. Quais decisões mais importantes a empresa precisa tomar nos próximos 12 meses? <RequiredMark/></>} erro={erros.p1_decisoes_12m}>
          <textarea className="form-input" id="p1_decisoes_12m" rows={5}
            value={dados.p1_decisoes_12m || ''} onChange={e => atualizar('p1_decisoes_12m', e.target.value)} />
        </Campo>
      </LegendSection>
    </section>
  );
}

function radioItemStyle(selecionado) {
  return {
    display: 'flex', alignItems: 'flex-start', gap: '0.6rem', cursor: 'pointer',
    padding: '0.55rem 0.7rem', borderRadius: 6,
    border: selecionado ? '1px solid var(--accent-blue, #6BA3FF)' : '1px solid var(--glass-border)',
    background: selecionado ? 'rgba(107,163,255,0.08)' : 'rgba(255,255,255,0.02)',
    transition: 'all 0.15s',
  };
}
