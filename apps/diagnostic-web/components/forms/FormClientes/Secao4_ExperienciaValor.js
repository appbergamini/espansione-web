import { Campo, LegendSection, RequiredMark, RadioGroup, TextArea, TextAreaLongo, EscalaSlider } from './_ui';
import { PERCEPCAO_PRECO, MUDARIA_POR_PRECO } from '../../../lib/forms/clientes_v2_schema';

export default function Secao4_ExperienciaValor({ dados, atualizar, erros, projetoMeta }) {
  const marca = projetoMeta?.nome_marca || 'a marca';
  const mudariaOpts = MUDARIA_POR_PRECO.map(o => o.label);
  const mudariaValorAtual = MUDARIA_POR_PRECO.find(o => o.value === dados.s4_mudaria_por_preco)?.label;

  return (
    <section>
      <h2 style={{ fontSize: '1.4rem', marginTop: 0 }}>Seção 4 — Experiência e valor</h2>
      <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '1.5rem' }}>
        Entendendo o impacto real que nós entregamos na sua vida.
      </p>

      <LegendSection titulo="Satisfação e impacto">
        <Campo label={<>20. Em uma escala de 0 a 10, o quanto você está satisfeito(a) com os resultados obtidos? <RequiredMark/></>} erro={erros.s4_satisfacao}>
          <EscalaSlider name="s4_satisfacao" value={dados.s4_satisfacao} onChange={v => atualizar('s4_satisfacao', v)} />
        </Campo>

        <Campo id="s4_impacto_rotina" label={<>21. Como {marca} impactou sua rotina ou a forma como você se sente?</>}>
          <TextAreaLongo id="s4_impacto_rotina" value={dados.s4_impacto_rotina} onChange={v => atualizar('s4_impacto_rotina', v)} />
        </Campo>

        <Campo id="s4_expectativa_vs_realidade" label="22. O que você esperava antes de contratar, e o que encontrou? Em que foi superado, em que foi frustrado?">
          <TextAreaLongo id="s4_expectativa_vs_realidade" value={dados.s4_expectativa_vs_realidade} onChange={v => atualizar('s4_expectativa_vs_realidade', v)} />
        </Campo>

        <Campo id="s4_momento_marcante" label={<>23. Descreva uma situação específica com {marca} que te marcou — positiva ou negativa.</>}>
          <TextAreaLongo id="s4_momento_marcante" value={dados.s4_momento_marcante} onChange={v => atualizar('s4_momento_marcante', v)} />
        </Campo>

        <Campo id="s4_maior_diferencial" label={<>24. Qual é o maior diferencial de {marca} em relação às outras opções que você conhece?</>}>
          <TextArea id="s4_maior_diferencial" value={dados.s4_maior_diferencial} onChange={v => atualizar('s4_maior_diferencial', v)} rows={4} />
        </Campo>
      </LegendSection>

      <LegendSection titulo="Valor percebido vs preço">
        <Campo label={<>25. Sobre o valor investido, como você percebe o preço em relação ao benefício entregue? <RequiredMark/></>} erro={erros.s4_percepcao_preco}>
          <RadioGroup name="s4_percepcao_preco" opcoes={PERCEPCAO_PRECO}
            value={dados.s4_percepcao_preco} onChange={v => atualizar('s4_percepcao_preco', v)} />
        </Campo>

        <Campo id="s4_segunda_opcao" label={<>26. Se não pudesse mais usar {marca}, qual seria sua segunda opção?</>}>
          <TextArea id="s4_segunda_opcao" value={dados.s4_segunda_opcao} onChange={v => atualizar('s4_segunda_opcao', v)} rows={3} />
        </Campo>

        <Campo label={<>27. Se um concorrente oferecesse o mesmo serviço 20% mais barato, você mudaria? <RequiredMark/></>} erro={erros.s4_mudaria_por_preco}>
          <RadioGroup
            name="s4_mudaria_por_preco"
            opcoes={mudariaOpts}
            value={mudariaValorAtual}
            onChange={label => {
              const found = MUDARIA_POR_PRECO.find(o => o.label === label);
              atualizar('s4_mudaria_por_preco', found ? found.value : null);
            }}
          />
        </Campo>
      </LegendSection>
    </section>
  );
}
