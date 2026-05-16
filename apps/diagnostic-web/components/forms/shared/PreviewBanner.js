// components/forms/shared/PreviewBanner.js
//
// TASK FIX.2 — banner visual sticky exibido no topo dos formulários
// em modo preview. Sinaliza de forma clara e impossível de ignorar
// que respostas NÃO serão salvas. Usa cor âmbar (var(--viz-warning))
// pra remeter a "atenção", não a "erro".

/**
 * @param {Object} props
 * @param {string} [props.tipo]        Ex.: "sócios", "colaboradores", "clientes"
 * @param {string} [props.nomeMarca]   Nome da empresa/cliente do projeto
 */
export default function PreviewBanner({ tipo, nomeMarca }) {
  return (
    <div
      role="status"
      aria-label="Modo pré-visualização"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backgroundColor: 'var(--viz-warning, #F59E0B)',
        color: '#1A1A1A',
        padding: '10px 20px',
        fontSize: 13,
        fontWeight: 600,
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        fontFamily: 'var(--font-ui, system-ui)',
        letterSpacing: 0.2,
      }}
    >
      <span aria-hidden="true" style={{ fontSize: 16 }}>👁</span>
      <span>
        Pré-visualização
        {tipo && <> do formulário de <strong>{tipo}</strong></>}
        {nomeMarca && <> para <strong>{nomeMarca}</strong></>}
        {' — '}
        respostas <strong>NÃO serão salvas</strong>.
      </span>
    </div>
  );
}
