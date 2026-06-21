import React from 'react';
import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';

// Relatório PDF do Mapa de Maturidade Espansione.
// Recebe o resultado consolidado + a narrativa gerada por IA e renderiza um
// documento detalhado. Cores da marca: azul #00326D, vermelho #Da3144.

const AZUL = '#00326D';
const VERMELHO = '#Da3144';
const CINZA = '#5b6470';
const CINZA_CLARO = '#9aa3ad';

const NIVEL_COR = { 1: VERMELHO, 2: VERMELHO, 3: '#b7791f', 4: '#2f855a' };

const s = StyleSheet.create({
  page: { paddingTop: 42, paddingBottom: 56, paddingHorizontal: 44, fontSize: 10, color: '#1a2230', fontFamily: 'Helvetica', lineHeight: 1.5 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  logo: { height: 30, objectFit: 'contain' },
  headerMeta: { fontSize: 8, color: CINZA_CLARO, textAlign: 'right' },
  title: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: AZUL },
  subtitle: { fontSize: 11, color: CINZA, marginTop: 2, marginBottom: 16 },
  indiceBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e2c4c9', backgroundColor: '#fbeef0', borderRadius: 6, padding: 14, marginBottom: 14 },
  indiceNum: { fontSize: 34, fontFamily: 'Helvetica-Bold', color: VERMELHO, marginRight: 14 },
  indiceLabel: { fontSize: 8, color: CINZA, textTransform: 'uppercase', letterSpacing: 1 },
  indiceNivel: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: AZUL },
  alerta: { borderWidth: 1, borderColor: '#e6d28a', backgroundColor: '#fbf6e3', borderRadius: 5, padding: 8, fontSize: 9, color: '#7a611a', marginBottom: 14 },
  sectionTitle: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: AZUL, marginTop: 14, marginBottom: 6, borderBottomWidth: 1, borderBottomColor: '#e7ebf0', paddingBottom: 3 },
  paragraph: { marginBottom: 7, textAlign: 'justify' },
  pilarCard: { borderWidth: 1, borderColor: '#e7ebf0', borderRadius: 6, padding: 11, marginBottom: 10 },
  pilarHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  pilarNome: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: AZUL },
  nivelTag: { fontSize: 8, fontFamily: 'Helvetica-Bold', paddingVertical: 2, paddingHorizontal: 6, borderRadius: 8, color: '#fff' },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 7 },
  barOut: { flex: 1, height: 7, backgroundColor: '#edf0f3', borderRadius: 4, marginRight: 8 },
  barIn: { height: 7, borderRadius: 4 },
  barLabel: { fontSize: 8, color: CINZA, width: 70, textAlign: 'right' },
  bullets: { marginTop: 4 },
  bulletLine: { flexDirection: 'row', marginBottom: 2 },
  bulletMark: { width: 10, fontSize: 9 },
  bulletText: { flex: 1, fontSize: 9 },
  miniLabel: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: CINZA, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 5, marginBottom: 1 },
  trilhaRow: { flexDirection: 'row', justifyContent: 'space-between', borderWidth: 1, borderColor: '#e7ebf0', borderRadius: 5, padding: 8, marginBottom: 6 },
  trilhaNome: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: AZUL },
  trilhaPrio: { fontSize: 8, fontFamily: 'Helvetica-Bold' },
  footer: { position: 'absolute', bottom: 24, left: 44, right: 44, flexDirection: 'row', justifyContent: 'space-between', fontSize: 7, color: CINZA_CLARO, borderTopWidth: 1, borderTopColor: '#e7ebf0', paddingTop: 6 },
});

function Bullets({ items, mark = '•', cor = AZUL }) {
  if (!items || !items.length) return null;
  return (
    <View style={s.bullets}>
      {items.map((t, i) => (
        <View style={s.bulletLine} key={i}>
          <Text style={[s.bulletMark, { color: cor }]}>{mark}</Text>
          <Text style={s.bulletText}>{t}</Text>
        </View>
      ))}
    </View>
  );
}

function Paragrafos({ texto, style }) {
  if (!texto) return null;
  const partes = String(texto).split(/\n{2,}|\n/).filter((p) => p.trim());
  return (
    <>
      {partes.map((p, i) => (
        <Text key={i} style={[s.paragraph, style]}>{p.trim()}</Text>
      ))}
    </>
  );
}

export default function RelatorioMaturidade({ cliente, result, narrativa = {}, logoData, dataLabel }) {
  const pilaresNarr = narrativa.pilaresMap || {};
  const prio = (p) => (p === 'Alta' ? VERMELHO : p === 'Média' ? '#b7791f' : '#2f855a');

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header} fixed>
          {logoData ? <Image src={logoData} style={s.logo} /> : <Text style={{ color: AZUL, fontFamily: 'Helvetica-Bold' }}>Espansione</Text>}
          <Text style={s.headerMeta}>Mapa de Maturidade{dataLabel ? `\n${dataLabel}` : ''}</Text>
        </View>

        <Text style={s.title}>Mapa de Maturidade</Text>
        <Text style={s.subtitle}>{cliente || 'Diagnóstico de maturidade organizacional'}</Text>

        <View style={s.indiceBox}>
          <Text style={s.indiceNum}>{result.general_score}</Text>
          <View>
            <Text style={s.indiceLabel}>Índice Geral Espansione</Text>
            <Text style={s.indiceNivel}>{result.general_level}</Text>
          </View>
        </View>

        {result.alert ? <Text style={s.alerta}>{result.alert}</Text> : null}

        <Text style={s.sectionTitle}>Panorama executivo</Text>
        <Paragrafos texto={narrativa.panorama_executivo} />

        <Text style={s.sectionTitle}>Análise por pilar</Text>
        {result.pillars.map((p) => {
          const n = pilaresNarr[p.code] || {};
          const cor = NIVEL_COR[p.level] || CINZA;
          return (
            <View style={s.pilarCard} key={p.code} wrap={false}>
              <View style={s.pilarHead}>
                <Text style={s.pilarNome}>{p.name}</Text>
                <Text style={[s.nivelTag, { backgroundColor: p.evaluated === false ? CINZA : cor }]}>{p.evaluated === false ? 'Não avaliado' : `Nível ${p.level} — ${p.level_name}`}</Text>
              </View>
              {p.evaluated !== false && (
                <View style={s.barRow}>
                  <View style={s.barOut}>
                    <View style={[s.barIn, { width: `${p.percentage_score ?? 0}%`, backgroundColor: cor }]} />
                  </View>
                  <Text style={s.barLabel}>{p.percentage_score}% · {p.raw_score}/{p.max_score}</Text>
                </View>
              )}
              <Paragrafos texto={n.analise || p.interpretation} />
              {n.destaques && n.destaques.length ? (
                <>
                  <Text style={s.miniLabel}>Forças</Text>
                  <Bullets items={n.destaques} mark="+" cor="#2f855a" />
                </>
              ) : null}
              {n.riscos && n.riscos.length ? (
                <>
                  <Text style={s.miniLabel}>Lacunas</Text>
                  <Bullets items={n.riscos} mark="!" cor={VERMELHO} />
                </>
              ) : null}
            </View>
          );
        })}

        <Text style={s.sectionTitle}>Prioridades</Text>
        <Paragrafos texto={narrativa.prioridades} />
        {(result.recommendations || []).map((r) => (
          <View style={s.trilhaRow} key={r.pillar_code}>
            <View>
              <Text style={s.trilhaNome}>{r.trail}</Text>
              <Text style={{ fontSize: 8, color: CINZA }}>{r.pillar} — {r.reason}</Text>
            </View>
            <Text style={[s.trilhaPrio, { color: prio(r.priority) }]}>{r.priority}</Text>
          </View>
        ))}

        {narrativa.plano_de_acao && narrativa.plano_de_acao.length ? (
          <>
            <Text style={s.sectionTitle}>Plano de ação inicial</Text>
            <Bullets items={narrativa.plano_de_acao} mark="›" cor={AZUL} />
          </>
        ) : null}

        {narrativa.fechamento ? (
          <>
            <Text style={s.sectionTitle}>Síntese</Text>
            <Paragrafos texto={narrativa.fechamento} />
          </>
        ) : null}

        <View style={s.footer} fixed>
          <Text>Espansione · Mapa de Maturidade</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
