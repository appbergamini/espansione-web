import { Campo, LegendSection, RequiredMark, RadioGroup, TextArea, TextAreaLongo, EscalaSlider } from './_ui';
import { PERCEPCAO_PRECO } from '../../../lib/forms/clientes_v2_schema';

export default function Secao4_ExperienciaValor({ dados, atualizar, erros, projetoMeta }) {
  const marca = projetoMeta?.nome_marca || 'a marca';

  return (
    <section>
      <h2 style={{ fontSize: '1.4rem', marginTop: 0 }}>Seção 4 — Experiência e valor</h2>
      <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '1.5rem' }}>
        Entendendo o impacto real que nós entregamos na sua vida.
      </p>

      <LegendSection titulo="Satisfação e impacto">
        <Campo label={<>19. Em uma escala de 0 a 10, o quanto você está satisfeito(a) com os resultados obtidos? <RequiredMark/></>} erro={erros.s4_satisfacao}>
          <EscalaSlider name="s4_satisfacao" value={dados.s4_satisfacao} onChange={v => atualizar('s4_satisfacao', v)} />
        </Campo>

        <Campo id="s4_impacto_rotina" label={<>20. Como {marca} impactou sua rotina ou a forma como você se sente?</>}>
          <TextAreaLongo id="s4_impacto_rotina" value={dados.s4_impacto_rotina} onChange={v => atualizar('s4_impacto_rotina', v)} />
        </Campo>

        <Campo id="s4_expectativa_vs_realidade" label="21. O que você esperava antes de contratar, e o que encontrou? Em que foi superado, em que foi frustrado?">
          <TextAreaLongo id="s4_expectativa_vs_realidade" value={dados.s4_expectativa_vs_realidade} onChange={v => atualizar('s4_expectativa_vs_realidade', v)} />
        </Campo>

        <Campo id="s4_momento_marcante" label={<>22. Descreva uma situação específica com {marca} que te marcou — positiva ou negativa.</>}>
          <TextAreaLongo id="s4_momento_marcante" value={dados.s4_momento_marcante} onChange={v => atualizar('s4_momento_marcante', v)} />
        </Campo>

        <Campo id="s4_maior_diferencial" label={<>23. Qual é o maior diferencial de {marca} em relação às outras opções que você conhece?</>}>
          <TextArea id="s4_maior_diferencial" value={dados.s4_maior_diferencial} onChange={v => atualizar('s4_maior_diferencial', v)} rows={4} />
        </Campo>
      </LegendSection>

      <LegendSection titulo="Valor percebido vs preço">
        <Campo label={<>24. Sobre o valor investido, como você percebe o preço em relação ao benefício entregue? <RequiredMark/></>} erro={erros.s4_percepcao_preco}>
          <RadioGroup name="s4_percepcao_preco" opcoes={PERCEPCAO_PRECO}
            value={dados.s4_percepcao_preco} onChange={v => atualizar('s4_percepcao_preco', v)} />
        </Campo>
      </LegendSection>
    </section>
  );
}
