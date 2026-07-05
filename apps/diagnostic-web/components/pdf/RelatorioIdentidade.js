import React from 'react';
import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';

// Relatório PDF do Mapa de Identidade Estratégica (triangulação 3 públicos).
// Cores: azul #00326D (Sócios), vermelho #Da3144 (Equipe), verde-azul (Externo).

const AZUL = '#00326D';
const VERMELHO = '#Da3144';
const VERDE = '#2f855a';
const CINZA = '#5b6470';
const CINZA_CLARO = '#9aa3ad';

const PUB = [
  { key: 'socios', nome: 'Sócios', cor: AZUL },
  { key: 'colaboradores', nome: 'Equipe', cor: VERMELHO },
  { key: 'clientes', nome: 'Externo', cor: VERDE },
];

const s = StyleSheet.create({
  page: { paddingTop: 42, paddingBottom: 56, paddingHorizontal: 44, fontSize: 10, color: '#1a2230', fontFamily: 'Helvetica', lineHeight: 1.5 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  logo: { height: 30, objectFit: 'contain' },
  headerMeta: { fontSize: 8, color: CINZA_CLARO, textAlign: 'right' },
  title: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: AZUL },
  subtitle: { fontSize: 11, color: CINZA, marginTop: 2, marginBottom: 14 },
  geralRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  geralBox: { flex: 1, borderWidth: 1, borderColor: '#e7ebf0', borderRadius: 6, padding: 10, alignItems: 'center' },
  geralNum: { fontSize: 22, fontFamily: 'Helvetica-Bold' },
  geralLabel: { fontSize: 8, color: CINZA, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },
  sectionTitle: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: AZUL, marginTop: 14, marginBottom: 6, borderBottomWidth: 1, borderBottomColor: '#e7ebf0', paddingBottom: 3 },
  paragraph: { marginBottom: 7, textAlign: 'justify' },
  sisCard: { borderWidth: 1, borderColor: '#e7ebf0', borderRadius: 6, padding: 10, marginBottom: 8 },
  sisNome: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: AZUL, marginBottom: 5 },
  barLine: { flexDirection: 'row', alignItems: 'center', marginBottom: 3 },
  barPub: { width: 44, fontSize: 8, color: CINZA },
  barOut: { flex: 1, height: 7, backgroundColor: '#edf0f3', borderRadius: 4, marginRight: 6 },
  barIn: { height: 7, borderRadius: 4 },
  barVal: { width: 26, fontSize: 8, color: CINZA, textAlign: 'right' },
  gapRow: { borderWidth: 1, borderColor: '#f0d9c0', backgroundColor: '#fdf6ee', borderRadius: 5, padding: 8, marginBottom: 6 },
  gapHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  gapNome: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: AZUL },
  gapTag: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#b7791f' },
  gapNotas: { fontSize: 8, color: CINZA, marginBottom: 2 },
  bullets: { marginTop: 2 },
  bulletLine: { flexDirection: 'row', marginBottom: 2 },
  bulletMark: { width: 10, fontSize: 9, color: AZUL },
  bulletText: { flex: 1, fontSize: 9 },
  footer: { position: 'absolute', bottom: 24, left: 44, right: 44, flexDirection: 'row', justifyContent: 'space-between', fontSize: 7, color: CINZA_CLARO, borderTopWidth: 1, borderTopColor: '#e7ebf0', paddingTop: 6 },
});

function Paragrafos({ texto }) {
  if (!texto) return null;
  return String(texto).split(/\n{2,}|\n/).filter((p) => p.trim()).map((p, i) => (
    <Text key={i} style={s.paragraph}>{p.trim()}</Text>
  ));
}

function Bars({ notas }) {
  return (
    <View>
      {PUB.map((p) => {
        const v = notas[p.key];
        return (
          <View key={p.key} style={s.barLine}>
            <Text style={s.barPub}>{p.nome}</Text>
            <View style={s.barOut}><View style={[s.barIn, { width: `${v == null ? 0 : Math.round(v)}%`, backgroundColor: p.cor }]} /></View>
            <Text style={s.barVal}>{v == null ? '—' : `${Math.round(v)}`}</Text>
          </View>
        );
      })}
    </View>
  );
}

export default function RelatorioIdentidade({ cliente, result, narrativa = {}, logoData, dataLabel }) {
  const porPublico = result.porPublico || {};
  const sistemasNomes = Array.from(new Set((result.triangulacao || []).map((t) => t.sistema)));
  const porSistemaNarr = narrativa.porSistema || {};

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header} fixed>
          {logoData ? <Image src={logoData} style={s.logo} /> : <Text style={{ color: AZUL, fontFamily: 'Helvetica-Bold' }}>Espansione</Text>}
          <Text style={s.headerMeta}>Mapa de Identidade Estratégica{dataLabel ? `\n${dataLabel}` : ''}</Text>
        </View>

        <Text style={s.title}>Mapa de Identidade Estratégica</Text>
        <Text style={s.subtitle}>{cliente || 'Triangulação de percepção'} · Sócios × Equipe × Externo</Text>

        <View style={s.geralRow}>
          {PUB.map((p) => (
            <View key={p.key} style={s.geralBox}>
              <Text style={[s.geralNum, { color: p.cor }]}>{porPublico[p.key]?.geral != null ? Math.round(porPublico[p.key].geral) : '—'}</Text>
              <Text style={s.geralLabel}>{p.nome}</Text>
            </View>
          ))}
        </View>

        <Text style={s.sectionTitle}>Panorama</Text>
        <Paragrafos texto={narrativa.panorama} />

        <Text style={s.sectionTitle}>Percepção por sistema</Text>
        {sistemasNomes.map((sis) => {
          const notas = {};
          for (const p of PUB) notas[p.key] = porPublico[p.key]?.sistemas?.[sis]?.nota ?? null;
          return (
            <View key={sis} style={s.sisCard} wrap={false}>
              <Text style={s.sisNome}>{sis}</Text>
              <Bars notas={notas} />
              {porSistemaNarr[sis]?.leitura ? <View style={{ marginTop: 4 }}><Paragrafos texto={porSistemaNarr[sis].leitura} /></View> : null}
            </View>
          );
        })}

        {narrativa.maiores_divergencias?.length ? (
          <>
            <Text style={s.sectionTitle}>Maiores divergências de percepção</Text>
            {narrativa.maiores_divergencias.map((d, i) => {
              const t = (result.triangulacao || []).find((x) => x.indicador === d.indicador);
              return (
                <View key={i} style={s.gapRow} wrap={false}>
                  <View style={s.gapHead}>
                    <Text style={s.gapNome}>{d.indicador}</Text>
                    {t?.gap != null ? <Text style={s.gapTag}>gap {Math.round(t.gap)}</Text> : null}
                  </View>
                  {t ? (
                    <Text style={s.gapNotas}>
                      {PUB.map((p) => t.porPublico?.[p.key] != null ? `${p.nome} ${Math.round(t.porPublico[p.key])}` : null).filter(Boolean).join('  ·  ')}
                    </Text>
                  ) : null}
                  <Paragrafos texto={d.leitura} />
                </View>
              );
            })}
          </>
        ) : null}

        {narrativa.indices ? (<><Text style={s.sectionTitle}>Lealdade e satisfação</Text><Paragrafos texto={narrativa.indices} /></>) : null}
        {narrativa.drivers_do_cliente ? (<><Text style={s.sectionTitle}>O que move o cliente</Text><Paragrafos texto={narrativa.drivers_do_cliente} /></>) : null}

        {narrativa.recomendacoes?.length ? (
          <>
            <Text style={s.sectionTitle}>Recomendações</Text>
            <View style={s.bullets}>
              {narrativa.recomendacoes.map((r, i) => (
                <View key={i} style={s.bulletLine}><Text style={s.bulletMark}>›</Text><Text style={s.bulletText}>{r}</Text></View>
              ))}
            </View>
          </>
        ) : null}

        {narrativa.fechamento ? (<><Text style={s.sectionTitle}>Síntese</Text><Paragrafos texto={narrativa.fechamento} /></>) : null}

        <View style={s.footer} fixed>
          <Text>Espansione · Mapa de Identidade Estratégica</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
