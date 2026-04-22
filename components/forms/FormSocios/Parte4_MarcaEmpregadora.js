import { Campo, LegendSection, TextArea, TextAreaLongo } from './_ui';
import RadarSliders from '../shared/RadarSliders';
import { RADAR_EMPREGADORA_DIMENSOES } from '../../../lib/forms/socios_v4_schema';

export default function Parte4_MarcaEmpregadora({ dados, atualizar }) {
  const radarValues = dados.p4_radar_empregadora || {};
  const setRadar = (dim, val) => {
    atualizar('p4_radar_empregadora', { ...radarValues, [dim]: val });
  };

  return (
    <section>
      <h2 style={{ fontSize: '1.4rem', marginTop: 0 }}>Parte 4 — Marca Empregadora e Cultura</h2>
      <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '1.5rem' }}>
        Uma marca forte começa de dentro para fora. Como a empresa é vivida por dentro.
      </p>

      <LegendSection titulo="4.1 Clima e cultura atual">
        <Campo id="p4_clima_interno" label="1. Na sua percepção, como é o clima interno da sua empresa hoje?"
          hint="Seja honesto — leitura real, não institucional.">
          <TextAreaLongo id="p4_clima_interno" value={dados.p4_clima_interno} onChange={v => atualizar('p4_clima_interno', v)} />
        </Campo>

        <Campo id="p4_desafios_comunicacao_interna" label="2. Quais os maiores desafios de comunicação interna que você identifica?">
          <TextArea id="p4_desafios_comunicacao_interna" value={dados.p4_desafios_comunicacao_interna} onChange={v => atualizar('p4_desafios_comunicacao_interna', v)} rows={4} />
        </Campo>

        <Campo id="p4_desafios_lideranca_gestao" label="3. Quais seus maiores desafios em relação a liderança e gestão de pessoas?">
          <TextArea id="p4_desafios_lideranca_gestao" value={dados.p4_desafios_lideranca_gestao} onChange={v => atualizar('p4_desafios_lideranca_gestao', v)} rows={4} />
        </Campo>
      </LegendSection>

      <LegendSection titulo="4.2 Proposta ao colaborador">
        <Campo id="p4_proposta_oferece" label="4. O que a empresa oferece de concreto hoje a quem trabalha aqui?">
          <TextArea id="p4_proposta_oferece" value={dados.p4_proposta_oferece} onChange={v => atualizar('p4_proposta_oferece', v)} rows={4} />
        </Campo>

        <Campo id="p4_proposta_pede" label="5. O que a empresa pede em troca?">
          <TextArea id="p4_proposta_pede" value={dados.p4_proposta_pede} onChange={v => atualizar('p4_proposta_pede', v)} rows={3} />
        </Campo>

        <Campo id="p4_proposta_por_que_escolher" label="6. Por que alguém talentoso deveria escolher vocês em vez de um concorrente?">
          <TextArea id="p4_proposta_por_que_escolher" value={dados.p4_proposta_por_que_escolher} onChange={v => atualizar('p4_proposta_por_que_escolher', v)} rows={4} />
        </Campo>
      </LegendSection>

      <LegendSection titulo="4.3 Valores vividos internamente">
        <Campo id="p4_valores_no_dia_a_dia" label="7. Na sua visão, quais são os valores inegociáveis da sua empresa no dia a dia com as pessoas?">
          <TextArea id="p4_valores_no_dia_a_dia" value={dados.p4_valores_no_dia_a_dia} onChange={v => atualizar('p4_valores_no_dia_a_dia', v)} rows={4} />
        </Campo>

        <Campo id="p4_cultura_atrapalha_marca" label="8. O que hoje, na cultura atual, ATRAPALHA a marca que vocês querem construir?"
          hint="Incoerências entre o que dizem e praticam, comportamentos que enfraquecem a identidade desejada.">
          <TextAreaLongo id="p4_cultura_atrapalha_marca" value={dados.p4_cultura_atrapalha_marca} onChange={v => atualizar('p4_cultura_atrapalha_marca', v)} />
        </Campo>
      </LegendSection>

      <LegendSection titulo="4.4 Radar de Marca Empregadora">
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: 0 }}>
          Avalie cada dimensão de 0 a 10, onde <strong>0 = inexistente</strong> na empresa e <strong>10 = referência de excelência</strong>.
        </p>
        <RadarSliders
          dimensoes={RADAR_EMPREGADORA_DIMENSOES}
          valores={radarValues}
          onChange={setRadar}
        />

        <Campo id="p4_radar_dimensao_mais_importante" label="9. Qual dessas dimensões do radar você considera mais importante para chegar na sua visão de futuro, e por quê?">
          <TextArea id="p4_radar_dimensao_mais_importante" value={dados.p4_radar_dimensao_mais_importante} onChange={v => atualizar('p4_radar_dimensao_mais_importante', v)} rows={3} />
        </Campo>

        <Campo id="p4_radar_dimensao_ja_referencia" label="10. E qual destas dimensões você considera que sua empresa JÁ É referência hoje, de fato?">
          <TextArea id="p4_radar_dimensao_ja_referencia" value={dados.p4_radar_dimensao_ja_referencia} onChange={v => atualizar('p4_radar_dimensao_ja_referencia', v)} rows={3} />
        </Campo>
      </LegendSection>

      <LegendSection titulo="4.5 Referência em marca empregadora">
        <Campo id="p4_empresa_admira_como_empregadora" label="11. Qual empresa (qualquer segmento) você admira como empregadora? Por quê?">
          <TextArea id="p4_empresa_admira_como_empregadora" value={dados.p4_empresa_admira_como_empregadora} onChange={v => atualizar('p4_empresa_admira_como_empregadora', v)} rows={3} />
        </Campo>

        <Campo id="p4_pratica_a_emprestar" label="12. Se pudesse 'emprestar' uma prática de outra empresa para sua cultura, qual seria e de qual empresa?">
          <TextArea id="p4_pratica_a_emprestar" value={dados.p4_pratica_a_emprestar} onChange={v => atualizar('p4_pratica_a_emprestar', v)} rows={3} />
        </Campo>
      </LegendSection>
    </section>
  );
}
