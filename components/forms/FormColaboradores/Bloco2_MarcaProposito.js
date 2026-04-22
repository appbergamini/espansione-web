import { Campo, LegendSection, RequiredMark, TextArea, TabelaParalela } from './_ui';
import EscalaLikert from '../shared/EscalaLikert';

export default function Bloco2_MarcaProposito({ dados, atualizar, erros }) {
  return (
    <section>
      <h2 style={{ fontSize: '1.4rem', marginTop: 0 }}>Bloco 2 — Marca e Propósito</h2>
      <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '1.5rem' }}>
        Como você percebe a empresa hoje e o quanto se sente conectado(a) com o que ela diz ser.
      </p>

      <LegendSection titulo="Palavras-espelho">
        <Campo label={<>1. Quando você pensa na empresa, quais são as 3 primeiras palavras que vêm à sua mente? <RequiredMark/></>}
          hint="Escreva a primeira coisa que vem — sem filtro."
          erro={erros.b2_palavras_empresa}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }} className="palavras-grid">
            {[1, 2, 3].map(n => (
              <input
                key={n}
                className="form-input"
                type="text"
                placeholder={`Palavra ${n}`}
                value={dados[`b2_palavra${n}_empresa`] || ''}
                onChange={e => atualizar(`b2_palavra${n}_empresa`, e.target.value)}
              />
            ))}
          </div>
        </Campo>

        <Campo label="2. Como é trabalhar aqui, em 3 palavras?">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }} className="palavras-grid">
            {[1, 2, 3].map(n => (
              <input
                key={n}
                className="form-input"
                type="text"
                placeholder={`Palavra ${n}`}
                value={dados[`b2_palavra${n}_trabalhar`] || ''}
                onChange={e => atualizar(`b2_palavra${n}_trabalhar`, e.target.value)}
              />
            ))}
          </div>
        </Campo>
      </LegendSection>

      <LegendSection titulo="Percepções de marca">
        <Campo label={<>3. Você acredita que nossa empresa tem uma imagem forte no mercado? <RequiredMark/></>} erro={erros.b2_imagem_mercado}>
          <EscalaLikert
            name="b2_imagem_mercado"
            value={dados.b2_imagem_mercado}
            onChange={v => atualizar('b2_imagem_mercado', v)}
            escala={5}
            labelMin="Muito fraca"
            labelMax="Muito forte"
          />
        </Campo>

        <Campo label={<>4. Você conhece o propósito e os valores da empresa? <RequiredMark/></>} erro={erros.b2_conhece_proposito}>
          <EscalaLikert
            name="b2_conhece_proposito"
            value={dados.b2_conhece_proposito}
            onChange={v => atualizar('b2_conhece_proposito', v)}
            escala={5}
            labelMin="Não conheço"
            labelMax="Conheço muito bem"
          />
        </Campo>

        <Campo id="b2_trabalho_conecta_proposito" label="5. Em uma frase, como seu trabalho específico contribui para o propósito da empresa?">
          <TextArea
            id="b2_trabalho_conecta_proposito"
            value={dados.b2_trabalho_conecta_proposito}
            onChange={v => atualizar('b2_trabalho_conecta_proposito', v)}
            rows={3}
            placeholder="Se você não conseguir responder ou tiver dúvida, escreva isso mesmo — é informação importante."
          />
        </Campo>

        <Campo id="b2_diferenca_concorrencia" label="6. Na sua visão, o que mais diferencia nossa empresa de concorrentes ou empresas parecidas? Se você não percebe grande diferença, escreva isso.">
          <TextArea
            id="b2_diferenca_concorrencia"
            value={dados.b2_diferenca_concorrencia}
            onChange={v => atualizar('b2_diferenca_concorrencia', v)}
            rows={4}
          />
        </Campo>
      </LegendSection>

      <style jsx>{`
        @media (max-width: 480px) {
          :global(.palavras-grid) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
