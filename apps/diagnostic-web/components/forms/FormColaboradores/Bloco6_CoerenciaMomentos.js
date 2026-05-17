import { Campo, LegendSection, TextArea, TextAreaLongo } from './_ui';

export default function Bloco6_CoerenciaMomentos({ dados, atualizar }) {
  return (
    <section>
      <h2 style={{ fontSize: '1.4rem', marginTop: 0 }}>Bloco 6 — Coerência e momentos-chave</h2>

      <div style={{
        background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)',
        borderRadius: 8, padding: '0.8rem 1rem', marginBottom: '1.25rem',
        fontSize: '0.92rem', lineHeight: 1.55,
      }}>
        ⭐ Estas próximas perguntas pedem um pouco mais de reflexão.
        São <strong>opcionais</strong> — responda só o que fizer sentido. São as que mais nos ajudam
        a entender o que funciona bem e o que pode melhorar.
      </div>

      <LegendSection titulo="Coerência externa × interna">
        <Campo id="b6_comunica_fora_nao_acontece_dentro" label="18. O que a empresa comunica para fora (site, redes, anúncios) que você sente que na prática não acontece por dentro?">
          <TextAreaLongo id="b6_comunica_fora_nao_acontece_dentro" value={dados.b6_comunica_fora_nao_acontece_dentro} onChange={v => atualizar('b6_comunica_fora_nao_acontece_dentro', v)} />
        </Campo>

        <Campo id="b6_faz_bem_ninguem_sabe" label="19. E o contrário: o que a gente faz bem aqui dentro que ninguém lá fora sabe?">
          <TextAreaLongo id="b6_faz_bem_ninguem_sabe" value={dados.b6_faz_bem_ninguem_sabe} onChange={v => atualizar('b6_faz_bem_ninguem_sabe', v)} />
        </Campo>
      </LegendSection>

      <LegendSection titulo="Momentos marcantes">
        <Campo id="b6_momento_orgulho" label="20. Descreva uma situação em que você se orgulhou de trabalhar aqui.">
          <TextAreaLongo id="b6_momento_orgulho" value={dados.b6_momento_orgulho} onChange={v => atualizar('b6_momento_orgulho', v)} />
        </Campo>

        <Campo id="b6_momento_pensou_sair" label="21. Descreva uma situação em que você pensou em sair.">
          <TextAreaLongo id="b6_momento_pensou_sair" value={dados.b6_momento_pensou_sair} onChange={v => atualizar('b6_momento_pensou_sair', v)} />
        </Campo>
      </LegendSection>
    </section>
  );
}
