import type { DevelopmentMaterial } from "./types";
import { METHODOLOGY_VERSION } from "./methodology/versions";

/**
 * =====================================================================
 * MATERIAIS / APOSTILAS — ARQUITETURA PREPARADA
 * =====================================================================
 * Catálogo oficial ainda NÃO cadastrado (inventário das apostilas virá em
 * etapa posterior). NENHUM link fictício deve ser adicionado aqui.
 *
 * A recomendação futura dependerá de:
 *   competência prioritária + comportamentos-chave + developmentMovement
 *   + material disponível (pode haver recomendação distinta por pessoa).
 *
 * Provider agnóstico (Greenn ou hospedagem interna a definir).
 * =====================================================================
 */
export const developmentMaterials: DevelopmentMaterial[] = [];

export const materialsVersion = METHODOLOGY_VERSION;
