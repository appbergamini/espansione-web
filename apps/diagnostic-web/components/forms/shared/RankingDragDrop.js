import { useState, useEffect } from 'react';

/**
 * Componente de ranking drag-and-drop com fallback de setas para mobile/acessibilidade.
 *
 * Props:
 * - items: [{ id, label }, ...]
 * - value: array de ids na ordem escolhida pelo usuário (ou undefined)
 * - onChange: (novoArray) => void
 */
export default function RankingDragDrop({ items, value, onChange }) {
  const [ordem, setOrdem] = useState(() => value && value.length === items.length ? value : items.map(i => i.id));
  const [arrastando, setArrastando] = useState(null);

  useEffect(() => {
    if (value && Array.isArray(value) && value.length === items.length) setOrdem(value);
  }, [value, items.length]);

  const commit = (novaOrdem) => {
    setOrdem(novaOrdem);
    onChange(novaOrdem);
  };

  const moverParaCima = (index) => {
    if (index === 0) return;
    const n = [...ordem];
    [n[index - 1], n[index]] = [n[index], n[index - 1]];
    commit(n);
  };
  const moverParaBaixo = (index) => {
    if (index === ordem.length - 1) return;
    const n = [...ordem];
    [n[index + 1], n[index]] = [n[index], n[index + 1]];
    commit(n);
  };
  const handleDragStart = (e, index) => {
    setArrastando(index);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (arrastando === null || arrastando === dropIndex) return;
    const n = [...ordem];
    const [mov] = n.splice(arrastando, 1);
    n.splice(dropIndex, 0, mov);
    commit(n);
    setArrastando(null);
  };
  const handleDragEnd = () => setArrastando(null);

  return (
    <div style={{ margin: '0.5rem 0' }}>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>
        Arraste para ordenar ou use as setas. <strong>1</strong> = mais importante, <strong>{items.length}</strong> = menos importante.
      </p>
      <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {ordem.map((itemId, index) => {
          const item = items.find(i => i.id === itemId);
          const sendo = arrastando === index;
          return (
            <li
              key={itemId}
              draggable
              onDragStart={e => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={e => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.65rem 0.85rem',
                border: '1px solid var(--glass-border)',
                borderRadius: 8,
                background: sendo ? 'rgba(107,163,255,0.08)' : 'rgba(255,255,255,0.02)',
                opacity: sendo ? 0.5 : 1,
                cursor: 'move',
                transition: 'all 0.15s',
              }}
            >
              <span style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'var(--accent-blue, #6BA3FF)',
                color: '#00326D', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '0.88rem', flexShrink: 0,
              }}>
                {index + 1}
              </span>
              <span style={{ flex: 1, fontSize: '0.92rem' }}>{item?.label}</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <button
                  type="button"
                  onClick={() => moverParaCima(index)}
                  disabled={index === 0}
                  aria-label="Mover para cima"
                  title="Mover para cima"
                  style={arrowBtn(index === 0)}
                >▲</button>
                <button
                  type="button"
                  onClick={() => moverParaBaixo(index)}
                  disabled={index === ordem.length - 1}
                  aria-label="Mover para baixo"
                  title="Mover para baixo"
                  style={arrowBtn(index === ordem.length - 1)}
                >▼</button>
              </div>
              <span aria-hidden="true" style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', cursor: 'grab' }}>⋮⋮</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function arrowBtn(disabled) {
  return {
    width: 30, height: 22,
    border: '1px solid var(--glass-border)',
    background: 'rgba(255,255,255,0.02)',
    color: 'inherit',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '0.68rem',
    borderRadius: 3,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    opacity: disabled ? 0.3 : 1,
  };
}
