import { Campo, LegendSection, TextArea, TextAreaLongo } from './_ui';
import RankingDragDrop from '../shared/RankingDragDrop';
import { FATORES_ESCOLHA } from '../../../lib/forms/clientes_v2_schema';

export default function Secao2_ComportamentoEscolha({ dados, atualizar, erros, projetoMeta }) {
  const marca = projetoMeta?.nome_marca || 'a marca';

  return (
    <section>
      <h2 style={{ fontSize: '1.4rem', marginTop: 0 }}>Seção 2 — Como você decide</h2>
      <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '1.5rem' }}>
        Entendendo como você escolhe onde investir.
      </p>

      <LegendSection titulo="Fatores de escolha">
        <Campo label="11. Ao escolher uma marca neste segmento, o que é mais importante para você?" erro={erros.s2_ranking_fatores}>
          <RankingDragDrop
            items={FATORES_ESCOLHA}
            value={dados.s2_ranking_fatores}
            onChange={v => atualizar('s2_ranking_fatores', v)}
          />
        </Campo>
      </LegendSection>

      <LegendSection titulo="Influências e migração">
        <Campo id="s2_quem_influenciou" label={<>12. Quem influenciou sua decisão de escolher {marca}?</>}
          hint="Amigos, familiares, influenciadores, busca na internet...">
          <TextArea id="s2_quem_influenciou" value={dados.s2_quem_influenciou} onChange={v => atualizar('s2_quem_influenciou', v)} rows={3} />
        </Campo>

        <Campo id="s2_migracao_fornecedor" label={<>13. Antes de {marca}, você usava outra marca/fornecedor semelhante? Se sim, qual? E por que trocou?</>}>
          <TextAreaLongo id="s2_migracao_fornecedor" value={dados.s2_migracao_fornecedor} onChange={v => atualizar('s2_migracao_fornecedor', v)} />
        </Campo>

        <Campo id="s2_quase_desistiu" label={<>14. O que quase te fez desistir de {marca} antes de contratar? E o que te fez decidir pelo sim?</>}>
          <TextAreaLongo id="s2_quase_desistiu" value={dados.s2_quase_desistiu} onChange={v => atualizar('s2_quase_desistiu', v)} />
        </Campo>

        <Campo id="s2_outras_marcas_admira" label="15. Quais outras marcas (de qualquer segmento) você admira e consome na sua rotina?">
          <TextArea id="s2_outras_marcas_admira" value={dados.s2_outras_marcas_admira} onChange={v => atualizar('s2_outras_marcas_admira', v)} rows={3} />
        </Campo>
      </LegendSection>
    </section>
  );
}
