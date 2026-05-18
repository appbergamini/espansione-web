/**
 * Espansione Diagnostic — types
 * -----------------------------
 * Shape consolidado emitido pelo Agente 16 (Exportador para Brand Memory)
 * e consumido pelo loader (`@espansione/brand-memory`) que escreve nas
 * tabelas da Brand Memory.
 *
 * Cada seção espelha o `<brand_memory_export>` de um agente upstream
 * (ver `brand-memory-export-contract-v2.md` para detalhes).
 *
 * Localização sugerida no monorepo: packages/types/src/espansione-diagnostic.ts
 *
 * Versão: 2.0
 */

import type { CheckpointApprovalRecord } from './checkpoint.types';

// ============================================================
// PRIMITIVOS REUSADOS
// ============================================================

export type ISODateTime = string; // "2026-04-25T10:56:00Z"
export type ISODate = string;     // "2026-04-25"

export type Lens = 'VI' | 'VE' | 'VM';
export type ConvergenceClass = 'A' | 'B1' | 'B2' | 'B3' | 'C' | 'D';
export type DiscDimension = 'D' | 'I' | 'S' | 'C';
export type RdpcLevel = 'forte' | 'razoavel' | 'fraco';
export type GapEntry = { field: string; reason: string };
export type ValidationSeverity = 'fatal' | 'warning';

export type DiretrizCategory =
  | 'estrategica'
  | 'comunicacional'
  | 'cultural'
  | 'operacional';

export type IdaType = 'impulsionador' | 'detrator' | 'acelerador';

// ============================================================
// ROOT
// ============================================================

export interface EspansioneDiagnostic {
  // Identificação
  brand_slug: string;
  brand_name: string;
  industry: string | null;
  espansione_project_id: string;
  schema_version: '2.0';

  // Artefatos por agente
  vi: VisaoInterna;                                  // Agente 2
  ve: VisaoExterna;                                  // Agente 4
  vm: VisaoMercado;                                  // Agente 5
  vm_sources: VmSource[];                            // Agente 5
  decodificacao: DecodificacaoEstrategica;           // Agente 6
  values_and_attributes: ValuesAndAttributes;        // Agente 7
  diretrizes_estrategicas: DiretrizEstrategica[];    // Agente 8
  diretrizes_reinforcement_logic: string;            // Agente 8
  plataforma_branding: PlataformaBranding;           // Agente 9
  voice_profile: VoiceProfile;                       // Agente 10
  visual_identity: VisualIdentity;                   // Agente 11
  experiencia: Experiencia;                          // Agente 12
  plano_comunicacao: PlanoComunicacao;               // Agente 13
  evp?: Evp;                                         // Agente 14 (opcional)
  strategic_tensions?: StrategicTensionsSlice;        // Agente 6 (opcional, compatível com diagnósticos legados)
  executional_readiness?: ExecutionalReadiness;       // Agente 6 (opcional, prontidão de execução)

  // Metadados de consolidação
  meta: ConsolidationMeta;
}

// ============================================================
// META
// ============================================================

export interface ConsolidationMeta {
  consolidated_at: ISODateTime;
  schema_version: '2.0';
  agents_present: number[];
  agents_missing: number[];
  has_evp: boolean;
  validation_errors: ValidationError[];
  missing_required_fields: MissingField[];
  gaps_by_agent: Record<string, GapEntry[]>;
  load_status: 'ready' | 'partial' | 'blocked' | 'loaded';
  checkpoint_context?: CheckpointApprovalRecord[];
}

export interface ValidationError {
  agent: number;
  severity: ValidationSeverity;
  error: string;
  snippet?: string;
}

export interface MissingField {
  agent: number;
  field: string;
}

// ============================================================
// AGENTE 2 — VISÃO INTERNA
// ============================================================

export interface VisaoInterna {
  tese_central: string;
  metodologia: ViMetodologia;
  socios: SocioProfile[];
  dinamica_sociedade: string;
  cultura_time: CulturaTime;
  retrato_3_camadas: Retrato3Camadas;
  maturidade_360: MaturidadePilar[];
  cultura_vivida_gaps: CulturaVividaGap[];
  ambicao_vs_capacidade: AmbicaoVsCapacidade;
  tensoes_criticas: string[];
  ida_vi: IdaSimples;
  enps: number | null;
  evidencias_literais: EvidenciaLiteral[];
}

export interface ViMetodologia {
  n_socios: number;
  n_colaboradores: number;
  n_entrevistas_socios: number;
  n_entrevistas_colaboradores: number;
  cis_coverage_percent: number;
  diagnostico_360_coverage_percent: number;
}

export interface SocioProfile {
  nome: string;
  papel: string | null;
  disc: {
    perfil_dominante: DiscDimension;
    perfil_secundario: DiscDimension | null;
    scores: Record<DiscDimension, number>;
    perfil_narrativo: string;
  };
  jung_type: string | null;
  estilo_lideranca: string | null;
  fortalezas: string[];
  pontos_de_atencao: string[];
  evidencia_literal: string | null;
}

export interface CulturaTime {
  disc_predominante: DiscDimension;
  jung_coletivo: string | null;
  sintese_narrativa: string;
  heatmap_competencias: CompetenciaScore[];
  estilo_lideranca_predominante: string;
}

export interface CompetenciaScore {
  competencia: string;
  score: number;
  classificacao: 'sustenta' | 'em_desenvolvimento' | 'fragil';
}

export interface Retrato3Camadas {
  negocio_e: string;
  marca_e: string;
  comunicacao_fala: string;
}

export type MaturidadePilarName =
  | 'financas'
  | 'marketing'
  | 'estrategia'
  | 'operacao'
  | 'comercial'
  | 'pessoas';

export interface MaturidadePilar {
  pilar: MaturidadePilarName;
  score_percent: number;
  prioridade: 'alta' | 'media' | 'baixa';
  divergencia: 'alta' | 'media' | 'baixa';
  divergencia_pp: number | null;
}

export interface CulturaVividaGap {
  dimensao:
    | 'clima'
    | 'valores'
    | 'lideranca'
    | 'proposito'
    | 'opiniao'
    | 'feedback';
  visao_socios: string;
  visao_colaboradores: string;
  status: 'alinhado' | 'parcial' | 'desalinhado';
}

export interface AmbicaoVsCapacidade {
  ambicao: string;
  capacidade_instalada: string;
  gaps_criticos: {
    tipo: 'cultural' | 'processual' | 'lideranca' | 'comercial' | 'financeiro';
    descricao: string;
  }[];
}

export interface IdaSimples {
  impulsionadores: string[];
  detratores: string[];
  aceleradores: string[];
}

export interface EvidenciaLiteral {
  topic: string;
  quote: string;
  source: string | null;
}

// ============================================================
// AGENTE 4 — VISÃO EXTERNA
// ============================================================

export interface VisaoExterna {
  caveat_amostra: string | null;
  metodologia: VeMetodologia;
  perfil_amostra: PerfilAmostra[];
  subsegmentacao_icp: SubsegmentoIcp[];
  percepcao_geral: string;
  primeiro_contato: string | null;
  experiencia_atual: {
    pontos_fortes: string[];
    pontos_fracos: string[];
  };
  marca_atual_vs_ideal: MarcaAtualVsIdeal;
  marca_categoria: {
    categoria_atual: string | null;
    categoria_almejada: string | null;
  };
  posicao_competitiva: {
    referencias_admiradas: string[];
    concorrentes_reais: string[];
    substitutos: string[];
  };
  dados_quantitativos: { metrica: string; valor: number | string; leitura: string | null }[];
  zona_simbolica_emocional: string | null;
  ida_ve: IdaSimples;
  hipoteses_direcionais: HipoteseDirecional[];
}

export interface VeMetodologia {
  icp_descricao: string;
  n_respondentes: number;
  instrumento: string;
  periodo: string;
}

export interface PerfilAmostra {
  codinome: string;
  subperfil: string;
  tempo_relacao: string | null;
  ticket_medio: string | null;
  nps_equivalente: number | null;
}

export interface SubsegmentoIcp {
  cluster_nome: string;
  representantes: string[];
  descricao: string;
  percepcao_marca: string | null;
}

export interface MarcaAtualVsIdeal {
  ja_entrega: string[];
  esta_perto: string[];
  esta_longe: string[];
  ninguem_entrega: string[];
}

export interface HipoteseDirecional {
  dimensao: 'negocio' | 'marca' | 'comunicacao';
  hipotese: string;
}

// ============================================================
// AGENTE 5 — VISÃO DE MERCADO
// ============================================================

export interface VisaoMercado {
  panorama: VmPanorama;
  concorrentes_listados_cliente: ConcorrenteListado[];
  concorrentes_descobertos_research: ConcorrenteDescoberto[];
  mapa_territorios: MapaTerritorios;
  tendencias: Tendencia[];
  ida_vm: IdaSimples;
}

export interface VmPanorama {
  tamanho_mercado: string | null;
  crescimento: string | null;
  pressoes_estruturais: string | null;
  estrutura_competitiva: string | null;
  dinamica_relacionamento: string | null;
}

export interface ConcorrenteListado {
  nome: string;
  url: string | null;
  posicionamento_declarado: string | null;
  publico_alvo: string | null;
  diferenciadores_declarados: string[];
  movimentos_recentes: string[];
  vulnerabilidades: string[];
  leitura_critica: string | null;
}

export interface ConcorrenteDescoberto {
  nome: string;
  url: string | null;
  tipo_concorrencia: 'direta' | 'indireta' | 'substituto' | 'silencioso';
  posicionamento_declarado: string | null;
  leitura_critica: string | null;
}

export interface MapaTerritorios {
  ocupados: { territorio: string; ocupantes: string[]; saturacao: 'alta' | 'media' | 'baixa' }[];
  sub_explorados: { territorio: string; descricao: string; por_que_esta_vazio: string | null }[];
  commoditizacao: { termo_queimado: string; razao: string }[];
  ameacas_convergentes: { fonte: string; horizonte: string; descricao: string }[];
}

export interface Tendencia {
  tipo: 'forte' | 'sinal_fraco';
  nome: string;
  horizonte: string | null;
  ponte_para_cliente: string;
}

export interface VmSource {
  ref: string;
  url: string;
  title: string;
  publisher: string | null;
  date: ISODate | null;
}

// ============================================================
// AGENTE 6 — DECODIFICAÇÃO ESTRATÉGICA
// ============================================================

export interface DecodificacaoEstrategica {
  sumario_estrategico: string;
  achados_convergencia_total: { achado: string; tipo: 'impulsionador' | 'detrator' }[];
  divergencias_principais_resumo: { topic: string; type: DiretrizCategory }[];
  convergence_map: ConvergenceMapItem[];
  ida_consolidado: IdaConsolidado;
  divergencias_criticas: DivergenciaCritica[];
  de_para: DeParaItem[];
  escolhas_pendentes: EscolhaPendente[];
  strategic_tensions?: StrategicTensionsSlice;
  pontos_de_escolha_estrategica?: StrategicTensionsSlice;
  executional_readiness?: ExecutionalReadiness;
  diretrizes_resumo: { numero: number; titulo: string }[];
  conexao_plataforma_branding: ConexaoPlataformaBranding;
}

export interface ConvergenceMapItem {
  achado: string;
  in_vi: boolean;
  in_ve: boolean;
  in_vm: boolean;
  convergence_class: ConvergenceClass;
  tipo:
    | 'impulsionador'
    | 'detrator'
    | 'acelerador'
    | 'divergencia_estrategica'
    | 'divergencia_comunicacional'
    | 'divergencia_cultural'
    | 'divergencia_operacional';
}

export interface IdaConsolidadoItem {
  description: string;
  source_lenses: Lens[];
  disc_reading: string | null;
}

export interface IdaConsolidado {
  impulsionadores: IdaConsolidadoItem[];
  detratores: IdaConsolidadoItem[];
  aceleradores: IdaConsolidadoItem[];
}

export interface DivergenciaCritica {
  topic: string;
  type: DiretrizCategory;
  description: string;
  implication: string;
}

export interface DeParaItem {
  camada: 'negocio' | 'marca' | 'comunicacao';
  sair_de: string;
  ir_para: string;
}

export interface EscolhaPendente {
  context: string;
  rota_a: { label: string; description: string; implicacoes: string[] };
  rota_b: { label: string; description: string; implicacoes: string[] };
  rota_assumida_nas_diretrizes: 'a' | 'b';
}

export interface ConexaoPlataformaBranding {
  arquetipo_direcional: string | null;
  proposito_direcional: string | null;
  atributos_direcionais: string[];
  lexico_proprietario_sugerido: string[];
  termos_a_evitar: string[];
}

export type StrategicTensionStatus = 'open' | 'resolved' | 'monitor';

export interface StrategicTension {
  id?: string;
  title: string;
  theme: string;
  vi_signal?: string;
  ve_signal?: string;
  vm_signal?: string;
  tension_summary: string;
  strategic_choice_needed: string;
  recommended_choice?: string;
  risk_if_ignored: string;
  impact_on_positioning?: string;
  impact_on_communication?: string;
  impact_on_experience?: string;
  confidence_score?: number;
  evidence_strength?: 'strong' | 'medium' | 'weak' | 'unknown';
  status?: StrategicTensionStatus;
}

export interface StrategicTensionsSlice {
  tensions: StrategicTension[];
  summary: string;
  unresolved_count: number;
  high_risk_count: number;
}

export type InternalAlignmentLevel = 'high' | 'medium' | 'low' | 'unknown';

export interface ExecutionalReadiness {
  summary: string;
  leadership_style_signals: string[];
  cultural_blockers: string[];
  adoption_risks: string[];
  internal_alignment_level?: InternalAlignmentLevel;
  decision_profile_signals: string[];
  behavioral_signals?: string[];
  capability_gaps: string[];
  implications_for_strategy: string[];
  implications_for_communication: string[];
  recommended_change_management_notes: string[];
  confidence_score?: number;
  source_basis: {
    forms?: boolean;
    interviews?: boolean;
    cis?: boolean;
    disc?: boolean;
    diagnostic_360?: boolean;
    inferred?: boolean;
  };
}

// ============================================================
// AGENTE 7 — VALORES E ATRIBUTOS
// ============================================================

export interface ValuesAndAttributes {
  values: BrandValue[];
  personality_attributes: PersonalityAttribute[];
  diagnostic_coherence: {
    ataque_aos_detratores: string | null;
    amplificacao_dos_impulsionadores: string | null;
    resposta_ao_de_para: string | null;
  };
}

export interface BrandValue {
  name: string;
  manifestation: string;
  decisions_oriented: string;
}

export interface PersonalityAttribute {
  name: string;
  creative_tension_with: string | null;
  manifestation: string;
}

// ============================================================
// AGENTE 8 — DIRETRIZES ESTRATÉGICAS
// ============================================================

export interface DiretrizEstrategica {
  numero: number;
  titulo: string;
  o_que: string;
  por_que: string;
  como: string;
  de_para_link: {
    sair_de: string | null;
    ir_para: string | null;
  };
}

// ============================================================
// AGENTE 9 — PLATAFORMA DE BRANDING
// ============================================================

export interface PlataformaBranding {
  marca_e: MarcaE;
  negocio_faz: NegocioFaz;
  comunicacao_fala: ComunicacaoFala;
  atuacao_nas_3_ondas: AtuacaoNas3Ondas;
}

export interface MarcaE {
  proposito: { statement: string; defesa: string | null };
  arquetipo: {
    dominante: string;
    justificativa: string;
    qualidades_complementares: string | null;
  };
  atributos: { name: string; manifestation: string }[];
  valores: { name: string; manifestation: string }[];
}

export interface NegocioFaz {
  direcionadores_experiencia: {
    numero: number;
    titulo: string;
    descricao: string;
  }[];
}

export interface ComunicacaoFala {
  discurso_posicionamento: string;
  tagline: string | null;
}

export interface AtuacaoNas3Ondas {
  onda_1_produto: string;
  onda_2_pessoas: string;
  onda_3_proposito: string;
}

// ============================================================
// AGENTE 10 — IDENTIDADE VERBAL
// ============================================================

export interface VoiceProfile {
  tons_de_voz: TomDeVoz[];
  territorios_palavras: TerritorioPalavras[];
  palavras_proibidas: { termo: string; razao: string }[];
  convencoes_naming: { termo: string; definicao: string }[];
}

export interface TomDeVoz {
  nome: string;
  arquetipo_associado: string | null;
  descricao: string;
  quando_usar: string;
  quando_nao_usar: string;
  exemplo: string;
}

export interface TerritorioPalavras {
  nome: string;
  conceito: string;
  vocabulario: string[];
}

// ============================================================
// AGENTE 11 — VISUAL IDENTITY
// ============================================================

export interface VisualIdentity {
  manter_perder_ganhar: {
    manter: string[];
    perder: string[];
    ganhar: string[];
  };
  simbolo_logo: {
    tipo_recomendado: string;
    defesa: string;
    conceitos_a_transmitir: string[];
  };
  color_palette: {
    principal: ColorPrincipal[];
    complementar: ColorComplementar[];
  };
  forma: {
    descricao: string;
    como_cria_propriedade: string;
  };
  typography: {
    titulos: TypographyEntry;
    corpo: TypographyEntry;
    logica_contraste: string | null;
  };
  fotografia: {
    estilo: string;
    temas: string[];
    tratamento: string;
    proibido: string | null;
  };
  ilustracao: {
    estilo: string;
    papel_na_marca: string;
  };
  iconografia: {
    estilo: string;
    regras_consistencia: string;
  };
  comportamento_visual: string;
  rdpc_evaluation: {
    relevante: { nivel: RdpcLevel; justificativa: string };
    diferenciada: { nivel: RdpcLevel; justificativa: string };
    proprietaria: { nivel: RdpcLevel; justificativa: string };
    consistente: { nivel: RdpcLevel; justificativa: string };
  };
  moodboard_sugerido: { territorio: string; referencias: string }[];
  operational_guidelines?: VisualIdentityOperationalSlice;
}

export interface VisualIdentityOperationalSlice {
  visual_principles: string[];
  maintain: string[];
  lose: string[];
  gain: string[];
  color_direction: {
    primary?: string[];
    secondary?: string[];
    avoid?: string[];
    notes?: string;
  };
  typography_direction: {
    recommended_style?: string;
    hierarchy_notes?: string;
    avoid?: string[];
  };
  image_style: {
    photography?: string[];
    illustration?: string[];
    iconography?: string[];
    avoid?: string[];
  };
  layout_behavior: {
    composition?: string[];
    density?: string;
    hierarchy?: string;
    whitespace?: string;
  };
  symbol_logo_guidance?: string[];
  dos: string[];
  donts: string[];
  visual_risks: string[];
  prompt_guidelines?: string[];
}

export interface ColorPrincipal {
  nome: string;
  descricao: string;
  hex: string | null;
  papel: 'primary' | 'secondary' | 'accent' | 'neutral';
}

export interface ColorComplementar {
  nome: string;
  descricao: string;
  hex: string | null;
  uso_contextual: string | null;
}

export interface TypographyEntry {
  estilo: string;
  exemplo_familia: string | null;
  transmite: string;
}

// ============================================================
// AGENTE 12 — EXPERIÊNCIA
// ============================================================

export interface Experiencia {
  personas: Persona[];
  customer_journey: CustomerJourney;
  brand_moments: BrandMoment[];
  coerencia_3_ondas: { onda_1: string; onda_2: string; onda_3: string };
}

export interface Persona {
  name: string;
  age: number | null;
  role_profession: string;
  descritivo: string;
  jtbd: string;
  momentos_de_verdade: string[];
  is_internal_persona: boolean;
  pains: string[];
  desires: string[];
  fears: string[];
  frequent_places: string[];
  interest_content: string[];
}

export type JourneyStageName = 'conhecimento' | 'compra' | 'uso' | 'fidelizacao';

export interface CustomerJourney {
  stages: {
    name: JourneyStageName;
    title_evocativo: string | null;
    descricao: string;
    canais_ou_facilitadores: string[];
  }[];
}

export type BrandMomentTipo =
  | 'mudanca_de_fase'
  | 'momento_de_dor'
  | 'core_business'
  | 'milestone_cliente';

export interface BrandMoment {
  numero: number;
  nome: string;
  tipo: BrandMomentTipo;
  o_que_acontece: string;
  como_manifesta_proposito: string;
  por_que_e_memoravel: string;
}

// ============================================================
// AGENTE 13 — PLANO DE COMUNICAÇÃO
// ============================================================

export type OndaNumero = 1 | 2 | 3;
export type OndaLabel = 'produto' | 'pessoas' | 'proposito';

export interface PlanoComunicacao {
  atemporal: { proposito: string; arquetipo: string; tagline: string };
  clusters_comunicacao: ClusterComunicacao[];
  diferenciais: DiferencialComunicacao[];
  atuacao_contexto: AtuacaoContexto;
  narrativa_marca: { historia_central: string; por_que_agora: string };
  ondas_branding: OndaBranding[];
  plano_conexoes: PlanoConexoes;
  plano_acao_12_meses: PlanoAcao12Meses;
  ativacao_brand_moments: AtivacaoBrandMoment[];
  visao_operacional: VisaoOperacional;
  kpis: Kpis;
  ativo_proprietario_central: string;
  principal_risco_a_monitorar: string;
}

export interface ClusterComunicacao {
  numero: number;
  nome: string;
  descricao: string;
  afinidades: string;
  motivacoes_jtbd: string;
  objetivo_negocio: string;
  origem: 'literal_do_consultor' | 'derivada_diagnostico' | 'descoberta_research';
}

export interface DiferencialComunicacao {
  numero: number;
  titulo: string;
  defesa: string;
  evidencia_que_sustenta: string;
  clusters_mais_persuasivos: number[];
}

export interface AtuacaoContexto {
  tensoes_clusters_hoje: { cluster_numero: number | null; tensao: string }[];
  tendencias_capturaveis: { tendencia: string; como_capturar: string }[];
  caminho_para_narrativa: string;
}

export interface OndaBranding {
  onda: OndaNumero;
  label: OndaLabel;
  mensagem_ancora: string;
  narrativa_apoio: string;
  territorio_palavras_aplicado: string;
  tom_voz_dominante: string;
  clusters_alvo: number[];
}

export interface PlanoConexoes {
  midia_paga: MidiaCanais;
  midia_propria: MidiaCanais;
  midia_espontanea: {
    alvos_pr: string[];
    pauta_ancora: string;
    porta_vozes: { nome: string; tema: string }[];
    papel: string;
    kpi_dominante: string;
    nota_calibracao: string | null;
  };
}

export interface MidiaCanais {
  canais: string[];
  papel_por_canal: { canal: string; papel: string; onda: OndaNumero }[];
  formato_intensidade: string;
  kpi_dominante: string;
  nota_calibracao: string | null;
}

export interface PlanoAcao12Meses {
  share_budget_por_onda: {
    onda_1_percent: number;
    onda_2_percent: number;
    onda_3_percent: number;
    nota_calibracao: string | null;
  };
  trimestres: TrimestreAcao[];
}

export interface TrimestreAcao {
  trimestre: 1 | 2 | 3 | 4;
  onda_1_iniciativas: string[];
  onda_2_iniciativas: string[];
  onda_3_iniciativas: string[];
}

export interface AtivacaoBrandMoment {
  brand_moment_nome: string;
  tipo: string;
  onda_que_ativa: OndaNumero;
  peca_protagonista: string;
  clusters_beneficiados: number[];
}

export interface VisaoOperacional {
  institucional: VisaoOperacionalFrente;
  comercial: VisaoOperacionalFrente;
  marca_empregadora_interna: VisaoOperacionalFrente & { nota: string | null };
}

export interface VisaoOperacionalFrente {
  clusters: number[];
  ondas_protagonistas: OndaNumero[];
  pecas_chave: string[];
  objetivo: string;
}

export interface Kpis {
  por_onda: { onda_1: string[]; onda_2: string[]; onda_3: string[] };
  rdpc: {
    relevancia: string[];
    diferenciacao: string[];
    propriedade: string[];
    consistencia: string[];
  };
}

// ============================================================
// AGENTE 14 — EVP (opcional)
// ============================================================

export type JornadaColaboradorEstagio =
  | 'atracao'
  | 'selecao'
  | 'onboarding'
  | 'desenvolvimento'
  | 'reconhecimento'
  | 'saida';

export interface Evp {
  sinalizacao_limitacao_amostra: string | null;
  diagnostico_atual: {
    retrato_cultura_percebida: string;
    pilares_fortes: { nome: string; evidencia: string | null }[];
    pilares_fragies: { nome: string; evidencia: string | null }[];
    incoerencias_discurso_realidade: { promessa_externa: string; realidade_interna: string }[];
    riscos_dependencia: { competencia_ou_pessoa: string; risco: string }[];
  };
  evp_statement: string;
  manifesto_interno: string | null;
  pilares: { nome: string; descricao: string; na_pratica: string; evidencia: string | null }[];
  jornada_colaborador: {
    estagio: JornadaColaboradorEstagio;
    promessa: string;
    sinais: string[];
  }[];
  discurso_interno_vs_externo: {
    tom_lideranca_time: string | null;
    canais: string[];
    exemplo_pratico: string | null;
    apresentacao_para_candidatos: string | null;
    compatibilidade: 'forte' | 'media' | 'fraca';
    compatibilidade_justificativa: string | null;
  };
  gap_atual_futuro: {
    dimensao: string;
    estado_atual: string;
    '3_meses': string;
    '6_meses': string;
    '12_meses': string;
  }[];
  perfil_ideal_contratacao: {
    perfil_comportamental: string;
    competencias_minimas: string[];
    valores_compativeis: string[];
    perfis_que_nao_serviriam: string;
  };
  compatibilidade_posicionamento_externo: {
    arquetipo_externo_vs_interno: string | null;
    promessa_cliente_vs_colaborador: string | null;
    leitura_coerencia: 'forte' | 'media' | 'fraca';
  };
}

// ============================================================
// TYPE GUARDS / HELPERS
// ============================================================

export function hasEvp(d: EspansioneDiagnostic): d is EspansioneDiagnostic & { evp: Evp } {
  return d.evp !== undefined;
}

export function isReadyForLoad(d: EspansioneDiagnostic): boolean {
  return d.meta.load_status === 'ready' || d.meta.load_status === 'partial';
}

export function isBlocked(d: EspansioneDiagnostic): boolean {
  return d.meta.load_status === 'blocked';
}

/**
 * Critical agents that must be present and valid for any load to proceed.
 * Mirrors the criteria in agent-16-system-prompt-v2.md.
 */
export const CRITICAL_AGENTS = [6, 9, 12, 13] as const;

/**
 * All agents that contribute to the EspansioneDiagnostic.
 * Agent 14 (EVP) is optional and modular.
 */
export const CONTRIBUTING_AGENTS = [2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] as const;
export const REQUIRED_AGENTS = [2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] as const;
