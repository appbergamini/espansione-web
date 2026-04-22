import { Campo, LegendSection, RequiredMark, TextArea } from './_ui';

export default function Parte2_EmpresaMarca({ dados, atualizar, erros }) {
  return (
    <section>
      <h2 style={{ fontSize: '1.4rem', marginTop: 0 }}>Parte 2 — A Empresa e sua Marca</h2>
      <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '1.5rem' }}>
        Como a empresa se apresenta hoje para o mundo e como a marca é percebida internamente.
      </p>

      <LegendSection titulo="Oferta e posicionamento">
        <Campo id="p2_oferta_cliente" label={<>1. O que sua empresa oferece ao cliente? (produtos, serviços, entregas principais) <RequiredMark/></>} erro={erros.p2_oferta_cliente}>
          <TextArea id="p2_oferta_cliente" value={dados.p2_oferta_cliente} onChange={v => atualizar('p2_oferta_cliente', v)} rows={4} />
        </Campo>

        <Campo id="p2_perfil_cliente" label="2. Descreva o cliente ideal da empresa (quem, onde, o que busca, o que o move)">
          <TextArea id="p2_perfil_cliente" value={dados.p2_perfil_cliente} onChange={v => atualizar('p2_perfil_cliente', v)} rows={4} />
        </Campo>

        <Campo id="p2_diferenciais" label={<>3. Em uma frase, por que o cliente deveria escolher sua empresa e não um concorrente? <RequiredMark/></>} hint="Foque no diferencial defensável, não em slogan." erro={erros.p2_diferenciais}>
          <TextArea id="p2_diferenciais" value={dados.p2_diferenciais} onChange={v => atualizar('p2_diferenciais', v)} rows={3} />
        </Campo>
      </LegendSection>

      <LegendSection titulo="Personalidade e voz da marca">
        <Campo id="p2_personalidade_marca" label={<>4. Se a marca fosse uma pessoa, como ela seria? (tom, postura, valores, como se relaciona) <RequiredMark/></>} erro={erros.p2_personalidade_marca}>
          <TextArea id="p2_personalidade_marca" value={dados.p2_personalidade_marca} onChange={v => atualizar('p2_personalidade_marca', v)} rows={4} />
        </Campo>

        <Campo id="p2_tres_palavras" label="5. Escolha 3 palavras que capturam a essência da marca hoje.">
          <input className="form-input" type="text" id="p2_tres_palavras"
            placeholder="ex.: precisa, acolhedora, ousada"
            value={dados.p2_tres_palavras || ''}
            onChange={e => atualizar('p2_tres_palavras', e.target.value)} />
        </Campo>

        <Campo id="p2_como_falar" label="6. Como a marca fala? (formal, informal, técnica, poética, direta…)">
          <TextArea id="p2_como_falar" value={dados.p2_como_falar} onChange={v => atualizar('p2_como_falar', v)} rows={3} />
        </Campo>
      </LegendSection>

      <LegendSection titulo="Mercado e comparação">
        <Campo id="p2_marca_admirada"
          label="7. Qual marca (de qualquer setor) você admira e gostaria de ter como referência?"
          hint="Pode ser uma marca local, nacional ou internacional. Explique por que admira.">
          <TextArea id="p2_marca_admirada" value={dados.p2_marca_admirada} onChange={v => atualizar('p2_marca_admirada', v)} rows={3} />
        </Campo>

        <Campo id="p2_atributo_emprestado"
          label="8. Se pudesse emprestar UM atributo dessa marca admirada para a sua, qual seria?"
          hint="Um único atributo — o mais precioso para o momento do negócio.">
          <input className="form-input" type="text" id="p2_atributo_emprestado"
            value={dados.p2_atributo_emprestado || ''}
            onChange={e => atualizar('p2_atributo_emprestado', e.target.value)} />
        </Campo>

        <Campo id="p2_quando_vencemos" label="9. Em que momento/situação costumam VENCER uma concorrência com clientes?">
          <TextArea id="p2_quando_vencemos" value={dados.p2_quando_vencemos} onChange={v => atualizar('p2_quando_vencemos', v)} rows={3} />
        </Campo>

        <Campo id="p2_quando_perdemos" label="10. E em que momento costumam PERDER?">
          <TextArea id="p2_quando_perdemos" value={dados.p2_quando_perdemos} onChange={v => atualizar('p2_quando_perdemos', v)} rows={3} />
        </Campo>
      </LegendSection>
    </section>
  );
}
