// components/deliverable/shared/ComoLemosSuaEmpresa.js
//
// Bloco D · TASK 4.4 — bloco de metadados da escuta. Abre a Parte 0.
// Informa ao leitor período da escuta + quantas pessoas foram ouvidas
// por fonte. Sinaliza explicitamente quando a amostra é parcial.

export default function ComoLemosSuaEmpresa({ metadadosEscuta }) {
  if (!metadadosEscuta) return null;

  const {
    periodo_inicio,
    periodo_fim,
    total_socios,
    total_colaboradores,
    total_clientes,
    total_entrevistas,
    cis_cobertura_pct,
  } = metadadosEscuta;

  const fragmentoPeriodo = montarFragmentoPeriodo(periodo_inicio, periodo_fim);
  const fontes = [];
  if (total_socios > 0) {
    fontes.push(`${total_socios} ${total_socios === 1 ? 'sócio respondente' : 'sócios respondentes'}`);
  }
  if (total_colaboradores > 0) {
    fontes.push(`${total_colaboradores} ${total_colaboradores === 1 ? 'colaborador' : 'colaboradores'} em pesquisa anônima`);
  }
  if (total_clientes > 0) {
    fontes.push(`${total_clientes} ${total_clientes === 1 ? 'cliente' : 'clientes'} ouvidos`);
  }
  if (total_entrevistas > 0) {
    fontes.push(`${total_entrevistas} ${total_entrevistas === 1 ? 'entrevista' : 'entrevistas'} em profundidade`);
  }

  // Se nada foi capturado, render mínimo (evita mostrar bloco vazio).
  if (!fragmentoPeriodo && fontes.length === 0) return null;

  return (
    <section className="como-lemos page-break-inside-avoid" aria-label="Como lemos sua empresa">
      <h3 className="como-lemos-titulo">Como lemos sua empresa</h3>
      <p className="como-lemos-texto">
        Este documento é resultado de uma escuta estruturada{' '}
        {fragmentoPeriodo ? `realizada ${fragmentoPeriodo}, ` : ''}
        envolvendo:
      </p>
      {fontes.length > 0 && (
        <ul className="como-lemos-stats">
          {fontes.map((f, i) => <li key={i}>{f}</li>)}
        </ul>
      )}
      {cis_cobertura_pct !== null && cis_cobertura_pct < 70 && (
        <p className="como-lemos-nota">
          Nota: o mapeamento comportamental (CIS) cobriu{' '}
          {cis_cobertura_pct}% do time. Algumas leituras deste diagnóstico são
          portanto baseadas em amostra parcial — recomendamos complementação
          em ciclos futuros.
        </p>
      )}
    </section>
  );
}

function montarFragmentoPeriodo(ini, fim) {
  if (!ini || !fim) return '';
  if (ini === fim) return `em ${formatarData(ini)}`;
  return `entre ${formatarData(ini)} e ${formatarData(fim)}`;
}

function formatarData(iso) {
  try {
    const [y, m, d] = String(iso).split('-');
    const data = new Date(Number(y), Number(m) - 1, Number(d));
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}
