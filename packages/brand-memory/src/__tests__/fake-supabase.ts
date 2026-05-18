type Row = Record<string, any>;

let idSeq = 1;

function nextId(prefix: string) {
  return `${prefix}-${idSeq++}`;
}

export class FakeSupabase {
  tables: Record<string, Row[]>;

  constructor(seed: Record<string, Row[]> = {}) {
    this.tables = {
      brands: [],
      diagnostic_runs: [],
      brand_snapshots: [],
      brand_memory_versions: [],
      agency_requests: [],
      agency_runs: [],
      agency_steps: [],
      projetos: [],
      ...seed,
    };
  }

  from(table: string) {
    if (!this.tables[table]) this.tables[table] = [];
    return new FakeQuery(this, table);
  }
}

class FakeQuery {
  action: 'select' | 'insert' | 'update' | 'upsert' = 'select';
  filters: { key: string; value: any }[] = [];
  orderBy: { key: string; ascending: boolean } | null = null;
  limitCount: number | null = null;
  payload: any = null;
  singleMode: 'single' | 'maybeSingle' | null = null;
  db: FakeSupabase;
  table: string;

  constructor(db: FakeSupabase, table: string) {
    this.db = db;
    this.table = table;
  }

  select() {
    return this;
  }

  insert(payload: any) {
    this.action = 'insert';
    this.payload = payload;
    return this;
  }

  update(payload: any) {
    this.action = 'update';
    this.payload = payload;
    return this;
  }

  upsert(payload: any) {
    this.action = 'upsert';
    this.payload = payload;
    return this;
  }

  eq(key: string, value: any) {
    this.filters.push({ key, value });
    return this;
  }

  order(key: string, options: { ascending?: boolean } = {}) {
    this.orderBy = { key, ascending: options.ascending !== false };
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.singleMode = 'single';
    return this;
  }

  maybeSingle() {
    this.singleMode = 'maybeSingle';
    return this;
  }

  then(resolve: (value: any) => void, reject: (reason?: any) => void) {
    return this.execute().then(resolve, reject);
  }

  async execute() {
    if (this.action === 'insert') return this.executeInsert();
    if (this.action === 'upsert') return this.executeUpsert();
    if (this.action === 'update') return this.executeUpdate();
    return this.executeSelect();
  }

  executeInsert() {
    const rows = Array.isArray(this.payload) ? this.payload : [this.payload];
    const inserted: Row[] = [];

    for (const row of rows) {
      if (this.table === 'brand_memory_versions' && row.status === 'active') {
        const active = this.db.tables[this.table].find((item) => (
          item.brand_id === row.brand_id && item.status === 'active'
        ));
        if (active) {
          return { data: null, error: { message: 'duplicate active Brand Memory version' } };
        }
      }

      const next = {
        id: row.id || nextId(this.table),
        created_at: row.created_at || new Date().toISOString(),
        updated_at: row.updated_at || new Date().toISOString(),
        ...row,
      };
      this.db.tables[this.table].push(next);
      inserted.push(next);
    }

    return this.format(inserted);
  }

  executeUpsert() {
    if (this.table === 'brands') {
      const existing = this.db.tables.brands.find((row) => row.slug === this.payload.slug);
      if (existing) {
        Object.assign(existing, this.payload, { updated_at: new Date().toISOString() });
        return this.format([existing]);
      }
    }

    return this.executeInsert();
  }

  executeUpdate() {
    const rows = this.applyFilters(this.db.tables[this.table]);
    for (const row of rows) {
      Object.assign(row, this.payload, { updated_at: new Date().toISOString() });
    }
    return this.format(rows);
  }

  executeSelect() {
    return this.format(this.applyOrderAndLimit(this.applyFilters(this.db.tables[this.table])));
  }

  applyFilters(rows: Row[]) {
    return rows.filter((row) => this.filters.every((filter) => row[filter.key] === filter.value));
  }

  applyOrderAndLimit(rows: Row[]) {
    let next = [...rows];
    if (this.orderBy) {
      const { key, ascending } = this.orderBy;
      next.sort((a, b) => {
        if (a[key] === b[key]) return 0;
        return (a[key] > b[key] ? 1 : -1) * (ascending ? 1 : -1);
      });
    }
    if (this.limitCount != null) next = next.slice(0, this.limitCount);
    return next;
  }

  format(rows: Row[]) {
    if (this.singleMode === 'single') {
      return { data: rows[0] || null, error: rows[0] ? null : { message: 'No rows' } };
    }
    if (this.singleMode === 'maybeSingle') {
      return { data: rows[0] || null, error: null };
    }
    return { data: rows, error: null };
  }
}

export function makeDiagnostic(overrides: Record<string, any> = {}) {
  return {
    brand_slug: 'marca-teste',
    brand_name: 'Marca Teste',
    industry: 'Servicos',
    espansione_project_id: 'projeto-1',
    schema_version: '2.0',
    vi: { sintese: 'visao interna' },
    ve: { sintese: 'visao externa' },
    vm: { sintese: 'mercado' },
    vm_sources: [],
    decodificacao: { sumario_estrategico: 'direcao' },
    values_and_attributes: { values: ['clareza'], personality_attributes: ['confiavel'] },
    diretrizes_estrategicas: [{ titulo: 'foco', o_que: 'manter clareza' }],
    diretrizes_reinforcement_logic: 'reforcar consistencia',
    plataforma_branding: {
      marca_e: {
        proposito: { statement: 'ajudar clientes' },
        arquetipo: { dominante: 'sabio' },
        valores: ['clareza'],
        atributos: ['confiavel'],
      },
      comunicacao_fala: {
        discurso_posicionamento: 'posicionamento',
        tagline: 'tagline',
      },
    },
    voice_profile: {
      tons_de_voz: [{ nome: 'direto', descricao: 'claro' }],
      territorios_palavras: ['estrategia'],
      palavras_proibidas: [],
      convencoes_naming: [],
    },
    visual_identity: {
      manter_perder_ganhar: { manter: ['sobriedade'], perder: [], ganhar: ['nitidez'] },
      color_palette: { principal: ['#000000'], complementar: ['#ffffff'] },
      typography: 'sans',
    },
    experiencia: {
      personas: [{ name: 'Decisor', jtbd: 'comprar melhor' }],
      customer_journey: { stages: ['descoberta'] },
      brand_moments: ['diagnostico'],
    },
    plano_comunicacao: {
      clusters_comunicacao: [{ nome: 'Decisores' }],
      narrativa_marca: { historia_central: 'historia' },
      ondas_branding: [{ nome: 'onda 1' }],
      plano_conexoes: {},
      diferenciais: [{ titulo: 'metodo', defesa: 'processo' }],
    },
    meta: {
      consolidated_at: new Date().toISOString(),
      schema_version: '2.0',
      agents_present: [2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
      agents_missing: [],
      has_evp: false,
      validation_errors: [],
      missing_required_fields: [],
      gaps_by_agent: {},
      load_status: 'ready',
    },
    ...overrides,
  };
}
