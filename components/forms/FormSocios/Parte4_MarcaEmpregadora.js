import { Campo, LegendSection, TextArea } from './_ui';
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
        Como a empresa é vivida por dentro — ativos e tensões da cultura.
      </p>

      <LegendSection titulo="Cultura vivida">
        <Campo id="p4_clima" label="1. Em uma palavra, como descreveria o clima da empresa hoje?">
          <input className="form-input" type="text" id="p4_clima"
            value={dados.p4_clima || ''} onChange={e => atualizar('p4_clima', e.target.value)} />
        </Campo>

        <Campo id="p4_atrapalha" label="2. O que mais atrapalha hoje a marca que você quer construir aí dentro?">
          <TextArea id="p4_atrapalha" value={dados.p4_atrapalha} onChange={v => atualizar('p4_atrapalha', v)} rows={4} />
        </Campo>

        <Campo id="p4_desafios_lideranca" label="3. Quais são seus principais desafios como liderança?">
          <TextArea id="p4_desafios_lideranca" value={dados.p4_desafios_lideranca} onChange={v => atualizar('p4_desafios_lideranca', v)} rows={4} />
        </Campo>

        <Campo id="p4_evp"
          label="4. Se você tivesse que contratar hoje alguém excelente, o que prometeria? (EVP — promessa ao colaborador)">
          <TextArea id="p4_evp" value={dados.p4_evp} onChange={v => atualizar('p4_evp', v)} rows={4} />
        </Campo>
      </LegendSection>

      <LegendSection titulo="Radar de Marca Empregadora (0 a 10)">
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: 0 }}>
          Atribua uma nota de <strong>0 (inexistente)</strong> a <strong>10 (referência)</strong> para cada dimensão,
          considerando a situação atual — não o que você gostaria que fosse.
        </p>
        <RadarSliders
          dimensoes={RADAR_EMPREGADORA_DIMENSOES}
          valores={radarValues}
          onChange={setRadar}
        />

        <Campo id="p4_dimensao_critica" label="Qual dimensão do radar é a mais crítica para o momento atual da empresa?" hint="Justifique em 2-3 frases.">
          <TextArea id="p4_dimensao_critica" value={dados.p4_dimensao_critica} onChange={v => atualizar('p4_dimensao_critica', v)} rows={3} />
        </Campo>
      </LegendSection>
    </section>
  );
}
