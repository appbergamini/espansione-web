import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet, Font } from '@react-pdf/renderer';

// ── Registrar fonte com suporte a acentos (latin-ext) ────
// Usando Roboto que tem excelente suporte a caracteres latinos
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 400 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf', fontWeight: 500 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 },
  ],
});

// Desabilitar hifenização (causa problemas com acentos)
Font.registerHyphenationCallback(word => [word]);

// ── Cores DISC ───────────────────────────────────────────
const COLORS = {
  D: '#A1A1AA', I: '#EAB308', S: '#22C55E', C: '#3B82F6',
  navy: '#040812', navyCard: '#0a1122', navyLight: '#142240',
  teal: '#6BA3FF', tealDark: '#004198',
  coral: '#Da3144', white: '#FEFEFE', off: '#CBD5E1',
  muted: '#94A3B8', grayD: '#64748B',
  green: '#4ADE80', gold: '#FCD34D',
};

const DN = { D: 'Dominância', I: 'Influência', S: 'Estabilidade', C: 'Conformidade' };

// ── Estilos ──────────────────────────────────────────────
const s = StyleSheet.create({
  page: { backgroundColor: COLORS.navy, paddingHorizontal: 40, paddingVertical: 30, fontFamily: 'Roboto', color: COLORS.off },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottomWidth: 0.5, borderBottomColor: '#1e3a5f', paddingBottom: 12 },
  logoBox: { backgroundColor: '#ffffff', borderRadius: 4, padding: '4 8' },
  logoImg: { height: 16 },
  logoText: { fontSize: 11, fontWeight: 700, color: COLORS.tealDark, letterSpacing: 1.5 },
  headerName: { fontSize: 8, color: COLORS.muted },
  footer: { position: 'absolute', bottom: 16, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: 6.5, color: COLORS.grayD },
  secTitle: { fontSize: 14, fontWeight: 700, color: COLORS.teal, marginBottom: 4 },
  secLine: { width: 32, height: 1, backgroundColor: COLORS.teal, marginBottom: 12 },
  bodyText: { fontSize: 10, lineHeight: 1.6, color: COLORS.off, marginBottom: 8 },
  card: { backgroundColor: COLORS.navyCard, borderRadius: 6, padding: 14, marginBottom: 10 },
  barRow: { marginBottom: 10 },
  barHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  barLabel: { fontSize: 9.5, color: COLORS.off },
  barValue: { fontSize: 9.5, fontWeight: 700 },
  barTrack: { height: 5, backgroundColor: COLORS.navyLight, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: 5, borderRadius: 3 },
  discRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  discBox: { flex: 1, borderRadius: 6, padding: 10, alignItems: 'center', backgroundColor: COLORS.navyCard, borderWidth: 0.5 },
  discLetter: { fontSize: 16, fontWeight: 700, marginBottom: 2 },
  discValue: { fontSize: 22, fontWeight: 700, color: COLORS.white },
  discLabel: { fontSize: 7, color: COLORS.muted, marginTop: 2 },
  badge: { backgroundColor: COLORS.teal, borderRadius: 6, paddingHorizontal: 20, paddingVertical: 8, alignSelf: 'flex-start', marginBottom: 16 },
  badgeText: { fontSize: 28, fontWeight: 700, color: COLORS.navy, letterSpacing: 3 },
  summaryRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  summaryBox: { flex: 1, backgroundColor: COLORS.navyCard, borderRadius: 6, padding: 12 },
  summaryTitle: { fontSize: 8, fontWeight: 700, letterSpacing: 1.5, marginBottom: 8 },
  summaryItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  summaryName: { fontSize: 9.5, color: COLORS.white },
  summaryValue: { fontSize: 9.5, fontWeight: 700 },
  coverAccent: { width: 44, height: 2, backgroundColor: COLORS.teal, marginBottom: 20 },
  coverTitle: { fontSize: 26, fontWeight: 700, color: COLORS.white, marginBottom: 4 },
  coverSubtitle: { fontSize: 26, fontWeight: 700, color: COLORS.white, marginBottom: 24 },
  coverName: { fontSize: 18, fontWeight: 700, color: COLORS.white, marginBottom: 4 },
  coverEmail: { fontSize: 10, color: COLORS.muted, marginBottom: 4 },
  coverDate: { fontSize: 10, color: COLORS.muted },
  coverFooter: { position: 'absolute', bottom: 20, left: 40, fontSize: 7, color: COLORS.grayD },
  groupTitle: { fontSize: 10, fontWeight: 700, letterSpacing: 1, marginBottom: 6 },
});

// ── Componentes auxiliares ────────────────────────────────

function Header({ nome, logoData }) {
  return (
    <View style={s.header} fixed>
      {logoData ? (
        <View style={s.logoBox}><Image src={logoData} style={s.logoImg} /></View>
      ) : (
        <View style={s.logoBox}><Text style={s.logoText}>ESPANSIONE</Text></View>
      )}
      <Text style={s.headerName}>{nome}</Text>
    </View>
  );
}

function Footer() {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerText}>Espansione © 2026 — Mapeamento Comportamental</Text>
      <Text style={s.footerText} render={({ pageNumber }) => `Pág. ${pageNumber}`} />
    </View>
  );
}

function Section({ title }) {
  return (
    <View>
      <Text style={s.secTitle}>{title}</Text>
      <View style={s.secLine} />
    </View>
  );
}

function Bar({ label, value, max, color }) {
  const pct = Math.min(100, Math.max(1, (value / max) * 100));
  return (
    <View style={s.barRow}>
      <View style={s.barHeader}>
        <Text style={s.barLabel}>{label}</Text>
        <Text style={[s.barValue, { color }]}>{value}</Text>
      </View>
      <View style={s.barTrack}>
        <View style={[s.barFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

function DiscBoxes({ disc }) {
  return (
    <View style={s.discRow}>
      {[['D', 'Dominância', COLORS.D], ['I', 'Influência', COLORS.I], ['S', 'Estabilidade', COLORS.S], ['C', 'Conformidade', COLORS.C]].map(([key, label, color]) => (
        <View key={key} style={[s.discBox, { borderColor: color }]}>
          <Text style={[s.discLetter, { color }]}>{key}</Text>
          <Text style={s.discValue}>{disc[key]}</Text>
          <Text style={s.discLabel}>{label}</Text>
        </View>
      ))}
    </View>
  );
}

function BodyParagraphs({ text }) {
  if (!text) return null;
  const normalized = Array.isArray(text) ? text.join('\n') : String(text);
  return normalized.split('\n').filter(p => p.trim()).map((p, i) => (
    <Text key={i} style={s.bodyText}>{p.trim()}</Text>
  ));
}

// ── Documento principal ──────────────────────────────────

export default function RelatorioDisc({ nome, email, scores, narratives, logoData }) {
  const sc = scores;
  const nar = {};
  for (const [k, v] of Object.entries(narratives || {})) {
    nar[k] = Array.isArray(v) ? v.join('\n') : String(v || '');
  }

  const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  const sorted = Object.entries(sc.comp || {}).sort((a, b) => b[1] - a[1]);
  const top3 = sorted.slice(0, 3);
  const gap3 = sorted.slice(-3).reverse();

  const compGroups = [
    { t: 'Dominância', c: COLORS.D, k: ['Ousadia', 'Comando', 'Objetividade', 'Assertividade'] },
    { t: 'Influência', c: COLORS.I, k: ['Persuasão', 'Extroversão', 'Entusiasmo', 'Sociabilidade'] },
    { t: 'Estabilidade', c: COLORS.S, k: ['Empatia', 'Paciência', 'Persistência', 'Planejamento'] },
    { t: 'Conformidade', c: COLORS.C, k: ['Organização', 'Detalhismo', 'Prudência', 'Concentração'] },
  ];

  // Map para buscar competências (dados podem ter acentos ou não)
  const compMap = {};
  if (sc.comp) {
    for (const [k, v] of Object.entries(sc.comp)) {
      compMap[k] = v;
      const norm = k.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      compMap[norm] = v;
    }
  }
  function getComp(name) {
    return compMap[name] ?? compMap[name.normalize('NFD').replace(/[\u0300-\u036f]/g, '')] ?? 0;
  }

  return (
    <Document>
      {/* ═══ CAPA ═══ */}
      <Page size="A4" style={[s.page, { justifyContent: 'center' }]}>
        {logoData ? (
          <View style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: '8 16', marginBottom: 32, alignSelf: 'flex-start' }}>
            <Image src={logoData} style={{ height: 48 }} />
          </View>
        ) : (
          <View style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: '8 16', marginBottom: 32, alignSelf: 'flex-start' }}>
            <Text style={{ fontSize: 24, fontWeight: 700, color: COLORS.tealDark, letterSpacing: 2 }}>ESPANSIONE</Text>
          </View>
        )}
        <View style={s.coverAccent} />
        <Text style={s.coverTitle}>Relatório de Perfil</Text>
        <Text style={s.coverSubtitle}>Comportamental</Text>
        <View style={s.badge}>
          <Text style={s.badgeText}>{sc.profile}</Text>
        </View>
        <View style={{ marginTop: 24 }}>
          <Text style={s.coverName}>{nome}</Text>
          <Text style={s.coverEmail}>{email}</Text>
          <Text style={s.coverDate}>{today}</Text>
        </View>
        <Text style={s.coverFooter}>Documento confidencial — Espansione © 2026</Text>
      </Page>

      {/* ═══ O QUE É O DISC ═══ */}
      <Page size="A4" style={s.page}>
        <Header nome={nome} logoData={logoData} />
        <Section title="O que é o DISC?" />
        <Text style={s.bodyText}>
          O DISC é um modelo de perfil comportamental criado pelo psicólogo William Moulton Marston na década de 1920. Ele descreve quatro estilos de comportamento que todas as pessoas apresentam em diferentes graus.
        </Text>
        <View style={[s.card, { marginBottom: 16 }]}>
          <Text style={[s.bodyText, { color: COLORS.D, fontWeight: 700, marginBottom: 2 }]}>D — Dominância</Text>
          <Text style={[s.bodyText, { marginBottom: 8 }]}>Foco em resultados e ação direta.</Text>
          <Text style={[s.bodyText, { color: COLORS.I, fontWeight: 700, marginBottom: 2 }]}>I — Influência</Text>
          <Text style={[s.bodyText, { marginBottom: 8 }]}>Foco em pessoas e comunicação.</Text>
          <Text style={[s.bodyText, { color: COLORS.S, fontWeight: 700, marginBottom: 2 }]}>S — Estabilidade</Text>
          <Text style={[s.bodyText, { marginBottom: 8 }]}>Foco em harmonia e consistência.</Text>
          <Text style={[s.bodyText, { color: COLORS.C, fontWeight: 700, marginBottom: 2 }]}>C — Conformidade</Text>
          <Text style={s.bodyText}>Foco em qualidade e precisão.</Text>
        </View>
        <Section title="Natural vs Adaptado" />
        <Text style={s.bodyText}>Perfil Natural: Como você realmente é — seu jeito espontâneo de agir.</Text>
        <Text style={s.bodyText}>Perfil Adaptado: Como o seu ambiente espera que você seja — a versão que você mostra ao mundo profissional.</Text>
        <Footer />
      </Page>

      {/* ═══ PERFIL DISC ═══ */}
      <Page size="A4" style={s.page}>
        <Header nome={nome} logoData={logoData} />
        <Section title="Seu Perfil DISC" />
        <DiscBoxes disc={sc.disc} />
        <Section title="DISC Natural" />
        {['D', 'I', 'S', 'C'].map(k => (
          <Bar key={`nat-${k}`} label={DN[k]} value={sc.disc[k]} max={100} color={COLORS[k]} />
        ))}
        <View style={{ marginTop: 8 }} />
        <Section title="DISC Adaptado" />
        {['D', 'I', 'S', 'C'].map(k => (
          <Bar key={`adp-${k}`} label={DN[k]} value={sc.dA[k]} max={100} color={COLORS[k]} />
        ))}
        <Footer />
      </Page>

      {/* ═══ DESCRIÇÃO + FORÇAS ═══ */}
      <Page size="A4" style={s.page}>
        <Header nome={nome} logoData={logoData} />
        <Section title="Descrição do Perfil" />
        <BodyParagraphs text={nar.profile_desc} />
        <View style={{ marginTop: 12 }} />
        <Section title="Forças Naturais" />
        <BodyParagraphs text={nar.strengths} />
        <Footer />
      </Page>

      {/* ═══ DESENVOLVIMENTO + LIDERANÇA ═══ */}
      <Page size="A4" style={s.page}>
        <Header nome={nome} logoData={logoData} />
        <Section title="Áreas de Desenvolvimento" />
        <BodyParagraphs text={nar.development} />
        <View style={{ marginTop: 12 }} />
        <Section title="Estilo de Liderança" />
        <Bar label="Executivo" value={sc.lead?.Executivo || 0} max={50} color={COLORS.D} />
        <Bar label="Motivador" value={sc.lead?.Motivador || 0} max={50} color={COLORS.I} />
        <Bar label="Metódico" value={sc.lead?.['Metódico'] || sc.lead?.Metodico || 0} max={50} color={COLORS.S} />
        <Bar label="Sistemático" value={sc.lead?.['Sistemático'] || sc.lead?.Sistematico || 0} max={50} color={COLORS.C} />
        <View style={{ marginTop: 8 }} />
        <BodyParagraphs text={nar.leadership} />
        <Footer />
      </Page>

      {/* ═══ COMUNICAÇÃO + CONFLITO ═══ */}
      <Page size="A4" style={s.page}>
        <Header nome={nome} logoData={logoData} />
        <Section title="Comunicação" />
        <BodyParagraphs text={nar.communication} />
        <View style={{ marginTop: 12 }} />
        <Section title="Conflito e Pressão" />
        <BodyParagraphs text={nar.conflict} />
        <View style={{ marginTop: 12 }} />
        <Section title="Dicas Práticas" />
        <BodyParagraphs text={nar.tips} />
        <Footer />
      </Page>

      {/* ═══ 16 COMPETÊNCIAS ═══ */}
      <Page size="A4" style={s.page}>
        <Header nome={nome} logoData={logoData} />
        <Section title="16 Competências" />
        <View style={s.summaryRow}>
          <View style={s.summaryBox}>
            <Text style={[s.summaryTitle, { color: COLORS.green }]}>PONTOS FORTES</Text>
            {top3.map(([k, v]) => (
              <View key={k} style={s.summaryItem}>
                <Text style={s.summaryName}>{k}</Text>
                <Text style={[s.summaryValue, { color: COLORS.green }]}>{v}</Text>
              </View>
            ))}
          </View>
          <View style={s.summaryBox}>
            <Text style={[s.summaryTitle, { color: COLORS.coral }]}>DESENVOLVIMENTO</Text>
            {gap3.map(([k, v]) => (
              <View key={k} style={s.summaryItem}>
                <Text style={s.summaryName}>{k}</Text>
                <Text style={[s.summaryValue, { color: COLORS.coral }]}>{v}</Text>
              </View>
            ))}
          </View>
        </View>
        {compGroups.map(group => (
          <View key={group.t} style={{ marginBottom: 12 }}>
            <Text style={[s.groupTitle, { color: group.c }]}>{group.t.toUpperCase()}</Text>
            {group.k.map(k => (
              <Bar key={k} label={k} value={getComp(k)} max={100} color={group.c} />
            ))}
          </View>
        ))}
        <Footer />
      </Page>
    </Document>
  );
}
