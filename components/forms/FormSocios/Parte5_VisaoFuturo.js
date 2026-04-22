import { Campo, LegendSection, TextArea } from './_ui';

export default function Parte5_VisaoFuturo({ dados, atualizar }) {
  return (
    <section>
      <h2 style={{ fontSize: '1.4rem', marginTop: 0 }}>Parte 5 — Visão, Futuro e Estratégia</h2>
      <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '1.5rem' }}>
        Onde você quer chegar, o que acredita que será decisivo e as tensões a resolver.
      </p>

      <LegendSection titulo="Horizontes de 3 e 5 anos">
        <Campo id="p5_visao_3anos" label="1. Onde você quer que a empresa esteja em 3 anos?"
          hint="Seja específico: receita, tamanho, posicionamento, presença.">
          <TextArea id="p5_visao_3anos" value={dados.p5_visao_3anos} onChange={v => atualizar('p5_visao_3anos', v)} rows={4} />
        </Campo>

        <Campo id="p5_visao_5anos" label="2. E em 5 anos, qual é a grande ambição?"
          hint="Se tudo der certo, onde chegaremos?">
          <TextArea id="p5_visao_5anos" value={dados.p5_visao_5anos} onChange={v => atualizar('p5_visao_5anos', v)} rows={4} />
        </Campo>

        <Campo id="p5_maior_objetivo" label="3. Qual é o maior objetivo dos próximos 12 meses?">
          <TextArea id="p5_maior_objetivo" value={dados.p5_maior_objetivo} onChange={v => atualizar('p5_maior_objetivo', v)} rows={3} />
        </Campo>

        <Campo id="p5_maior_desafio" label="4. E o maior desafio desse mesmo período?">
          <TextArea id="p5_maior_desafio" value={dados.p5_maior_desafio} onChange={v => atualizar('p5_maior_desafio', v)} rows={3} />
        </Campo>
      </LegendSection>

      <LegendSection titulo="IDA da empresa — forças, dores e oportunidades">
        <Campo id="p5_ida_forcas" label="5. IMPULSIONADORES — o que a empresa faz MUITO bem hoje e é um ativo real?">
          <TextArea id="p5_ida_forcas" value={dados.p5_ida_forcas} onChange={v => atualizar('p5_ida_forcas', v)} rows={4} />
        </Campo>
        <Campo id="p5_ida_detratores" label="6. DETRATORES — o que, hoje, te atrapalha mais?">
          <TextArea id="p5_ida_detratores" value={dados.p5_ida_detratores} onChange={v => atualizar('p5_ida_detratores', v)} rows={4} />
        </Campo>
        <Campo id="p5_ida_aceleradores" label="7. ACELERADORES — que oportunidade, se capturada nos próximos 12 meses, muda o jogo?">
          <TextArea id="p5_ida_aceleradores" value={dados.p5_ida_aceleradores} onChange={v => atualizar('p5_ida_aceleradores', v)} rows={4} />
        </Campo>
      </LegendSection>

      <LegendSection titulo="Reflexão final (opcional)">
        <div style={{
          background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)',
          borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1rem',
          fontSize: '0.88rem', color: 'var(--text-secondary)',
        }}>
          ⭐ Este bloco é opcional. Responda o que fizer sentido — qualidade vence quantidade.
        </div>
        <Campo id="p5_mudaria" label="8. Se pudesse mudar UMA coisa na empresa hoje, o que seria?">
          <TextArea id="p5_mudaria" value={dados.p5_mudaria} onChange={v => atualizar('p5_mudaria', v)} rows={3} />
        </Campo>
        <Campo id="p5_orgulho" label="9. Do que você mais se orgulha quando olha o que construiu até aqui?">
          <TextArea id="p5_orgulho" value={dados.p5_orgulho} onChange={v => atualizar('p5_orgulho', v)} rows={3} />
        </Campo>
        <Campo id="p5_empresa_deixasse" label="10. Se a empresa deixasse de existir amanhã, o que o mundo perderia?">
          <TextArea id="p5_empresa_deixasse" value={dados.p5_empresa_deixasse} onChange={v => atualizar('p5_empresa_deixasse', v)} rows={3} />
        </Campo>
      </LegendSection>

      <LegendSection titulo="Alinhamento entre sócios (se aplicável)">
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: 0 }}>
          Se sua empresa tem <strong>2 ou mais sócios</strong>, responda esta seção.
          Se é fundador único, pode pular.
        </p>
        <Campo id="p5_socios_divergencia" label="11. Em que tema os sócios mais divergem?">
          <TextArea id="p5_socios_divergencia" value={dados.p5_socios_divergencia} onChange={v => atualizar('p5_socios_divergencia', v)} rows={3} />
        </Campo>
        <Campo id="p5_socios_decisao" label="12. Como resolvem quando discordam em uma decisão importante?">
          <TextArea id="p5_socios_decisao" value={dados.p5_socios_decisao} onChange={v => atualizar('p5_socios_decisao', v)} rows={3} />
        </Campo>
      </LegendSection>
    </section>
  );
}
