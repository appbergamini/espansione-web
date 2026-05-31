import { Campo, LegendSection, RequiredMark, TextArea } from './_ui';

export default function Secao5_PersonalidadeMarca({ dados, atualizar, erros, projetoMeta }) {
  const marca = projetoMeta?.nome_marca || 'a marca';

  return (
    <section>
      <h2 style={{ fontSize: '1.4rem', marginTop: 0 }}>Seção 5 — Personalidade da marca</h2>
      <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '1.5rem' }}>
        A identidade simbólica e emocional da marca, na sua percepção.
      </p>

      <LegendSection titulo="Identidade simbólica">
        <Campo id="s5_marca_pessoa" label={<>25. Se {marca} fosse uma pessoa, como você descreveria a personalidade dela?</>}
          hint="Tom, jeito, energia, forma de se relacionar.">
          <TextArea id="s5_marca_pessoa" value={dados.s5_marca_pessoa} onChange={v => atualizar('s5_marca_pessoa', v)} rows={4} />
        </Campo>

        <Campo id="s5_apresentaria_amigo" label={<>26. Você indicaria a {marca}? Se sim, como você apresentaria em poucas palavras?</>}>
          <TextArea id="s5_apresentaria_amigo" value={dados.s5_apresentaria_amigo} onChange={v => atualizar('s5_apresentaria_amigo', v)} rows={3} />
        </Campo>

        <Campo id="s5_palavra_proibida" label="27. Qual palavra você nunca usaria para descrever essa marca?">
          <input className="form-input" type="text" id="s5_palavra_proibida"
            value={dados.s5_palavra_proibida || ''}
            onChange={e => atualizar('s5_palavra_proibida', e.target.value)} />
        </Campo>

        <Campo id="s5_marca_uma_palavra" label={<>28. Defina {marca} em uma única palavra. <RequiredMark/></>}
          erro={erros.s5_marca_uma_palavra}>
          <input className="form-input" type="text" id="s5_marca_uma_palavra"
            maxLength={40}
            value={dados.s5_marca_uma_palavra || ''}
            onChange={e => atualizar('s5_marca_uma_palavra', e.target.value)} />
        </Campo>
      </LegendSection>
    </section>
  );
}
