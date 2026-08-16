// =====================================================================
// O contrato de saída da IA.
//
// Ela devolve SÓ PROSA. Nenhum campo aqui é posição, nível, ordem, rota
// ou pilar fora de faixa — esses vêm do motor e são costurados em
// aplicar.js. Um modelo que alucinasse não conseguiria mover um resultado
// nem por acidente: não há onde escrever um.
//
// `chave` e `pilar` existem só para casar cada texto ao item certo, e são
// enums fechados — chave inválida não passa pela validação da API.
// =====================================================================
import { CHAVES } from '../competencias/catalog.js';
import { PILARES, ROTULO_PILAR } from '@espansione/cis';

/**
 * Versão do par prompt+esquema. Bump invalida o cache e regenera na
 * próxima abertura — é assim que uma correção de voz alcança quem já
 * tem relatório gerado. Formato: v<n>-<data>.
 */
export const NARRATIVA_VERSAO = 'v1-2026-08-16';

export const MODELO = 'claude-opus-5';

const texto = (descricao) => ({ type: 'string', description: descricao });

const objeto = (properties) => ({
  type: 'object',
  properties,
  required: Object.keys(properties),
  additionalProperties: false,
});

export const ESQUEMA_NARRATIVA = objeto({
  abertura: texto(
    'Um parágrafo que abre o relatório dirigindo-se a quem respondeu. Situa o que ele tem em mãos e o que vai encontrar. Sem saudação, sem "bem-vindo", sem prometer transformação.'
  ),

  onde_voce_esta: objeto({
    titulo: texto('Título do bloco.'),
    texto: texto(
      'Um a dois parágrafos lendo as quatro capacidades na ordem em que aparecem nos fatos. O que essa ordem diz sobre como a pessoa opera.'
    ),
  }),

  suas_competencias: objeto({
    titulo: texto('Título do bloco.'),
    texto: texto(
      'Um parágrafo curto introduzindo o mapa das doze competências, que é mostrado logo abaixo em forma de faixa. Não repita a lista.'
    ),
  }),

  por_que: objeto({
    titulo: texto('Título do bloco.'),
    texto: texto('Um parágrafo curto que introduz as leituras individuais abaixo.'),
    padraoRecorrente: texto(
      'Se os fatos trouxerem um padrão recorrente, um parágrafo que o nomeia com força, uma vez só. Se não trouxerem, string vazia.'
    ),
    leituras: {
      type: 'array',
      description: 'Uma entrada por competência listada em fragilidades, na mesma ordem.',
      items: objeto({
        chave: { type: 'string', enum: CHAVES, description: 'A chave da competência, copiada dos fatos.' },
        texto: texto(
          'Um a dois parágrafos: o que a observação do motor significa no dia a dia de quem toca um negócio. Concreto, situado.'
        ),
      }),
    },
  }),

  sustenta_custa: objeto({
    titulo: texto('Título do bloco.'),
    texto: texto('Um a dois parágrafos sobre a distância entre o jeito natural e o jeito operado hoje.'),
    leituras: {
      type: 'array',
      description: 'Uma entrada por pilar listado nos fatos, na mesma ordem. Array vazio se não houver.',
      items: objeto({
        pilar: { type: 'string', enum: PILARES.map((p) => ROTULO_PILAR[p]), description: 'O nome do pilar, copiado dos fatos.' },
        texto: texto('Um parágrafo sobre o custo dessa diferença especificamente.'),
      }),
    },
  }),

  trilha: objeto({
    titulo: texto('Título do bloco.'),
    introducao: texto('Um parágrafo explicando o critério de ordem e por que se começa por poucas coisas.'),
    itens: {
      type: 'array',
      description: 'Uma entrada por item da trilha, na mesma ordem.',
      items: objeto({
        chave: { type: 'string', enum: CHAVES, description: 'A chave da competência, copiada dos fatos.' },
        texto: texto('Um parágrafo: por que esta competência agora, e o que muda quando ela se move.'),
      }),
    },
  }),

  passo_7_dias: objeto({
    titulo: texto('Título do bloco.'),
    texto: texto(
      'A ação da próxima semana, reescrita para caber na segunda-feira de quem lê. Uma coisa só, verificável, sem preparação prévia.'
    ),
  }),

  convite: objeto({
    titulo: texto('Título do bloco.'),
    texto: texto('Um parágrafo curto convidando para a sessão de leitura de 45 minutos. Sem urgência fabricada.'),
  }),

  fechamento: texto(
    'Uma ou duas frases encerrando o documento. Nada de resumo do que já foi dito.'
  ),
});
