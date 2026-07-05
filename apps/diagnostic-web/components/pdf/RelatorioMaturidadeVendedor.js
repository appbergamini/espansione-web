import React from 'react';
import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';

// Relatório PDF do Mapa da Maturidade (versão vendedora).
// Nova taxonomia: 4 sistemas. Por sistema: nível → risco → por que aprofundar,
// conduzindo ao Mapa da Identidade pago. Cores da marca: azul #00326D, vermelho.

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
  indiceBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#cdd8e6', backgroundColor: '#eef3f9', borderRadius: 6, padding: 14, marginBottom: 8 },
  indiceNum: { fontSize: 34, fontFamily: 'Helvetica-Bold', color: AZUL, marginRight: 14 },
  indiceLabel: { fontSize: 8, color: CINZA, textTransform: 'uppercase', letterSpacing: 1 },
  indiceNivel: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: AZUL },
  leituraGeral: { fontSize: 9, color: CINZA, marginBottom: 14, fontStyle: 'italic' },
  sectionTitle: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: AZUL, marginTop: 14, marginBottom: 6, borderBottomWidth: 1, borderBottomColor: '#e7ebf0', paddingBottom: 3 },
  paragraph: { marginBottom: 7, textAlign: 'justify' },
  sistemaCard: { borderWidth: 1, borderColor: '#e7ebf0', borderRadius: 6, padding: 11, marginBottom: 10 },
  sistemaHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  sistemaNome: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: AZUL },
  nivelTag: { fontSize: 8, fontFamily: 'Helvetica-Bold', paddingVertical: 2, paddingHorizontal: 6, borderRadius: 8, color: '#fff' },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  barOut: { flex: 1, height: 7, backgroundColor: '#edf0f3', borderRadius: 4, marginRight: 8 },
  barIn: { height: 7, borderRadius: 4 },
  barLabel: { fontSize: 8, color: CINZA, width: 42, textAlign: 'right' },
  miniLabel: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: CINZA, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 6, marginBottom: 1 },
  riscoLabel: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: VERMELHO, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 6, marginBottom: 1 },
  ctaBox: { borderWidth: 1, borderColor: '#e2c4c9', backgroundColor: '#fbeef0', borderRadius: 6, padding: 14, marginTop: 8 },
  ctaTitle: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: VERMELHO, marginBottom: 4 },
  atributos: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 2 },
  chip: { fontSize: 8, backgroundColor: '#eef3f9', color: AZUL, borderRadius: 8, paddingVertical: 2, paddingHorizontal: 7, marginRight: 5, marginBottom: 4 },
  footer: { position: 'absolute', bottom: 24, left: 44, right: 44, flexDirection: 'row', justifyContent: 'space-between', fontSize: 7, color: CINZA_CLARO, borderTopWidth: 1, borderTopColor: '#e7ebf0', paddingTop: 6 },
});

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

export default function RelatorioMaturidadeVendedor({ cliente, result, narrativa = {}, logoData, dataLabel }) {
  const porSistema = narrativa.porSistema || {};
  const atributos = result.atributos_marca || [];

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header} fixed>
          {logoData ? <Image src={logoData} style={s.logo} /> : <Text style={{ color: AZUL, fontFamily: 'Helvetica-Bold' }}>Espansione</Text>}
          <Text style={s.headerMeta}>Mapa da Maturidade{dataLabel ? `\n${dataLabel}` : ''}</Text>
        </View>

        <Text style={s.title}>Mapa da Maturidade</Text>
        <Text style={s.subtitle}>{cliente || 'Check-up de maturidade do negócio'}</Text>

        <View style={s.indiceBox}>
          <Text style={s.indiceNum}>{result.general_score != null ? Math.round(result.general_score) : '—'}</Text>
          <View>
            <Text style={s.indiceLabel}>Índice Geral</Text>
            <Text style={s.indiceNivel}>
              {result.general_nivel ? `Nível ${result.general_nivel} — ` : ''}{result.general_level || '—'}
            </Text>
          </View>
        </View>
        {result.general_leitura ? <Text style={s.leituraGeral}>{result.general_leitura}</Text> : null}

        <Text style={s.sectionTitle}>Panorama</Text>
        <Paragrafos texto={narrativa.panorama} />

        <Text style={s.sectionTitle}>Análise por sistema</Text>
        {(result.sistemas || []).map((sis) => {
          const n = porSistema[sis.sistema] || {};
          const cor = NIVEL_COR[sis.nivel] || CINZA;
          const nota = sis.nota == null ? null : Math.round(sis.nota);
          return (
            <View style={s.sistemaCard} key={sis.sistema} wrap={false}>
              <View style={s.sistemaHead}>
                <Text style={s.sistemaNome}>{sis.sistema}</Text>
                <Text style={[s.nivelTag, { backgroundColor: sis.nivel ? cor : CINZA }]}>
                  {sis.nivel ? `Nível ${sis.nivel} — ${sis.nivel_nome}` : 'Sem dados'}
                </Text>
              </View>
              <View style={s.barRow}>
                <View style={s.barOut}>
                  <View style={[s.barIn, { width: `${nota ?? 0}%`, backgroundColor: cor }]} />
                </View>
                <Text style={s.barLabel}>{nota != null ? `${nota}%` : '—'}</Text>
              </View>

              {n.diagnostico ? <Paragrafos texto={n.diagnostico} /> : (sis.leitura ? <Paragrafos texto={sis.leitura} /> : null)}
              {n.riscos ? (
                <>
                  <Text style={s.riscoLabel}>Risco de manter esse nível</Text>
                  <Paragrafos texto={n.riscos} />
                </>
              ) : null}
              {n.por_que_aprofundar ? (
                <>
                  <Text style={s.miniLabel}>Por que aprofundar</Text>
                  <Paragrafos texto={n.por_que_aprofundar} />
                </>
              ) : null}
            </View>
          );
        })}

        {atributos.length ? (
          <>
            <Text style={s.sectionTitle}>Atributos de marca percebidos</Text>
            <View style={s.atributos}>
              {atributos.map((a, i) => (
                <Text style={s.chip} key={i}>{a}</Text>
              ))}
            </View>
          </>
        ) : null}

        <Text style={s.sectionTitle}>Por onde começar</Text>
        <Paragrafos texto={narrativa.prioridade} />

        {narrativa.chamada_final ? (
          <View style={s.ctaBox} wrap={false}>
            <Text style={s.ctaTitle}>Próximo passo: Mapa da Identidade Estratégica</Text>
            <Paragrafos texto={narrativa.chamada_final} />
          </View>
        ) : null}

        <View style={s.footer} fixed>
          <Text>Espansione · Mapa da Maturidade</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
