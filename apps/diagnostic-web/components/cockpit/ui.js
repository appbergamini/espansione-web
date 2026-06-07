// Cockpit — design system portado do handoff (Dashboard-handoff / Claude Design).
// Paleta "GitHub dark" + componentes com estilo inline, fiéis ao protótipo.
// Área NOVA e autocontida — não usa o tema glass/roxo do admin de diagnóstico.
import { useState } from 'react';

export const P = {
  bg: '#0d1117',
  surface: '#151b23',
  card: '#1c2128',
  cardHov: '#262c36',
  border: '#30363d',
  borderLt: '#21262d',
  text: '#e6edf3',
  textSec: '#8b949e',
  textDim: '#484f58',
  accent: '#4493f8',
  accentDim: '#1a3a5c',
  green: '#3fb950',
  greenBg: '#0d3520',
  orange: '#d29922',
  orangeBg: '#3d2e00',
  red: '#f85149',
  redBg: '#4a1516',
  purple: '#a371f7',
  purpleBg: '#271e3a',
  teal: '#39d3c5',
  tealBg: '#0d3230',
  radius: 8,
  radiusLg: 12,
};

export function Hoverable({ children, style, hoverStyle, as = 'div', onClick, className }) {
  const [hov, setHov] = useState(false);
  const Tag = as;
  return (
    <Tag
      className={className}
      style={{ ...style, ...(hov ? hoverStyle : {}), transition: 'all .15s ease', cursor: onClick ? 'pointer' : style?.cursor }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onClick}
    >{children}</Tag>
  );
}

export function PBadge({ label, color = 'green', size = 'sm' }) {
  const colors = {
    green: { bg: P.greenBg, fg: P.green },
    orange: { bg: P.orangeBg, fg: P.orange },
    red: { bg: P.redBg, fg: P.red },
    purple: { bg: P.purpleBg, fg: P.purple },
    blue: { bg: P.accentDim, fg: P.accent },
    teal: { bg: P.tealBg, fg: P.teal },
    gray: { bg: P.borderLt, fg: P.textSec },
  };
  const c = colors[color] || colors.green;
  const sz = size === 'xs' ? { fontSize: 10, padding: '1px 7px' } : { fontSize: 11, padding: '2px 10px' };
  return (
    <span style={{ display: 'inline-block', borderRadius: 12, fontWeight: 600, background: c.bg, color: c.fg, letterSpacing: 0.3, lineHeight: '18px', whiteSpace: 'nowrap', ...sz }}>{label}</span>
  );
}

export function PMetric({ value, label, icon, trend, trendUp }) {
  return (
    <div style={{ background: P.card, borderRadius: P.radiusLg, padding: '18px 20px', border: `1px solid ${P.border}`, flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 12, color: P.textSec, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 14, opacity: 0.6 }}>{icon}</span>{label}
        </span>
        {trend && (
          <span style={{ fontSize: 11, fontWeight: 600, color: trendUp ? P.green : P.red }}>
            {trendUp ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: P.text, letterSpacing: -0.5 }}>{value}</div>
    </div>
  );
}

export function PSideItem({ icon, label, active, count, onClick }) {
  return (
    <Hoverable
      onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderRadius: P.radius, background: active ? P.accentDim : 'transparent', color: active ? P.accent : P.textSec, fontSize: 13, fontWeight: active ? 600 : 400, userSelect: 'none' }}
      hoverStyle={{ background: active ? P.accentDim : P.borderLt, color: active ? P.accent : P.text }}
    >
      <span style={{ fontSize: 16, width: 20, textAlign: 'center', flexShrink: 0 }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {count != null && (
        <span style={{ fontSize: 10, fontWeight: 700, background: active ? 'rgba(68,147,248,0.25)' : P.border, color: active ? P.accent : P.textSec, borderRadius: 8, padding: '1px 7px', lineHeight: '16px' }}>{count}</span>
      )}
    </Hoverable>
  );
}

export function PContentCard({ title, type, status, statusColor, date, onClick }) {
  return (
    <Hoverable
      onClick={onClick}
      style={{ background: P.card, borderRadius: P.radius, padding: '14px 16px', border: `1px solid ${P.border}`, display: 'flex', flexDirection: 'column', gap: 8 }}
      hoverStyle={{ background: P.cardHov, borderColor: P.textDim }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: P.text, lineHeight: 1.4, flex: 1 }}>{title}</span>
        <PBadge label={status} color={statusColor} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 10, color: P.textDim, textTransform: 'uppercase', letterSpacing: 0.5 }}>{type}</span>
        {date && <span style={{ fontSize: 10, color: P.textDim }}>· {date}</span>}
      </div>
    </Hoverable>
  );
}

export function PTaskRow({ label, done: initDone, priority, onToggle }) {
  const [done, setDone] = useState(initDone);
  return (
    <Hoverable
      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: `1px solid ${P.borderLt}` }}
      hoverStyle={{ opacity: 0.9 }}
    >
      <div
        onClick={() => { setDone(!done); onToggle && onToggle(); }}
        style={{ width: 18, height: 18, borderRadius: 5, flexShrink: 0, cursor: 'pointer', border: done ? 'none' : `1.5px solid ${P.border}`, background: done ? P.green : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff', transition: 'all .15s' }}
      >{done ? '✓' : ''}</div>
      <span style={{ flex: 1, fontSize: 13, color: done ? P.textDim : P.text, textDecoration: done ? 'line-through' : 'none', transition: 'all .15s' }}>{label}</span>
      {priority && (
        <PBadge label={priority} color={priority === 'alta' ? 'red' : priority === 'média' ? 'orange' : 'green'} size="xs" />
      )}
    </Hoverable>
  );
}

export function PReviewItem({ number, title, status, onClick }) {
  return (
    <Hoverable
      onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderBottom: `1px solid ${P.borderLt}` }}
      hoverStyle={{ background: P.borderLt }}
    >
      <span style={{ width: 26, height: 26, borderRadius: 7, background: P.accentDim, color: P.accent, fontSize: 11, fontWeight: 700, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{number}</span>
      <span style={{ flex: 1, fontSize: 13, color: P.text }}>{title}</span>
      <PBadge label={status} color={status === 'Aprovado' ? 'green' : status === 'Pendente' ? 'orange' : 'blue'} size="xs" />
    </Hoverable>
  );
}

export function PTabBar({ tabs, active, onSelect }) {
  return (
    <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${P.border}` }}>
      {tabs.map((tab, i) => (
        <Hoverable
          key={i}
          onClick={() => onSelect(i)}
          style={{ padding: '11px 18px', fontSize: 13, fontWeight: active === i ? 600 : 400, color: active === i ? P.accent : P.textSec, userSelect: 'none', borderBottom: active === i ? `2px solid ${P.accent}` : '2px solid transparent' }}
          hoverStyle={{ color: active === i ? P.accent : P.text }}
        >{tab}</Hoverable>
      ))}
    </div>
  );
}

export function PSearch({ placeholder = 'Buscar...', value, onChange, width = '100%' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: P.card, border: `1px solid ${P.border}`, borderRadius: P.radius, width, maxWidth: 320 }}>
      <span style={{ fontSize: 14, color: P.textDim }}>⌕</span>
      <input
        type="text" placeholder={placeholder} value={value || ''} onChange={e => onChange && onChange(e.target.value)}
        style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: P.text, width: '100%', fontFamily: 'inherit' }}
      />
    </div>
  );
}

export function PBtn({ label, primary, icon, onClick, small }) {
  return (
    <Hoverable
      as="button"
      onClick={onClick}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: small ? '5px 12px' : '8px 16px', borderRadius: P.radius, fontSize: small ? 11 : 12, fontWeight: 600, cursor: 'pointer', border: 'none', background: primary ? P.accent : P.card, color: primary ? '#fff' : P.textSec, outline: primary ? 'none' : `1px solid ${P.border}`, fontFamily: 'inherit', whiteSpace: 'nowrap' }}
      hoverStyle={{ background: primary ? '#5ba3f9' : P.cardHov, color: primary ? '#fff' : P.text }}
    >{icon && <span style={{ fontSize: small ? 12 : 14 }}>{icon}</span>}{label}</Hoverable>
  );
}

export function PSection({ title, subtitle, action, children, style: extra }) {
  return (
    <div style={{ ...extra }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: P.text }}>{title}</div>
          {subtitle && <div style={{ fontSize: 12, color: P.textSec, marginTop: 2 }}>{subtitle}</div>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

export function PCalStrip({ selected, onSelect }) {
  const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const dates = [2, 3, 4, 5, 6, 7, 8];
  const sel = selected != null ? selected : 2;
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {days.map((d, i) => (
        <Hoverable
          key={i}
          onClick={() => onSelect && onSelect(i)}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '8px 12px', borderRadius: P.radius, minWidth: 46, userSelect: 'none', background: sel === i ? P.accentDim : P.card, border: `1px solid ${sel === i ? P.accent : P.border}` }}
          hoverStyle={{ borderColor: P.accent }}
        >
          <span style={{ fontSize: 9, color: P.textDim, textTransform: 'uppercase' }}>{d}</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: sel === i ? P.accent : P.text }}>{dates[i]}</span>
        </Hoverable>
      ))}
    </div>
  );
}

export function PPanel({ children, style: extra }) {
  return (
    <div style={{ background: P.surface, borderRadius: P.radiusLg, border: `1px solid ${P.border}`, padding: '18px 20px', ...extra }}>{children}</div>
  );
}

export function PProgress({ value, color = P.accent, height = 6 }) {
  return (
    <div style={{ height, background: P.card, borderRadius: height / 2, overflow: 'hidden' }}>
      <div style={{ width: `${Math.min(100, Math.max(0, value))}%`, height: '100%', borderRadius: height / 2, background: color, transition: 'width .4s ease' }} />
    </div>
  );
}

export function PEmpty({ icon, message }) {
  return (
    <div style={{ padding: '48px 0', textAlign: 'center' }}>
      <div style={{ fontSize: 32, marginBottom: 8, opacity: 0.3 }}>{icon}</div>
      <div style={{ fontSize: 13, color: P.textDim }}>{message}</div>
    </div>
  );
}
