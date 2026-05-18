import type {
  AgencyRequestType,
  BrandReadinessResult,
  BrandReadinessStatus,
  EspansioneDiagnostic,
} from '@espansione/types';

export const CRITICAL_AGENCY_SLICES = [
  'decodificacao',
  'plataforma_branding',
  'experiencia',
  'plano_comunicacao',
] as const;

export const IMPORTANT_AGENCY_SLICES = [
  'voice_profile',
  'visual_identity',
  'values_and_attributes',
  'diretrizes_estrategicas',
] as const;

export const CONTENT_REQUEST_TYPES: AgencyRequestType[] = [
  'social_post',
  'carousel',
  'short_video_script',
  'email',
];

export const CAMPAIGN_REQUEST_TYPES: AgencyRequestType[] = [
  ...CONTENT_REQUEST_TYPES,
  'landing_page_copy',
];

type BrandMemoryLike =
  | Partial<Record<keyof EspansioneDiagnostic, unknown>>
  | null
  | undefined;

export function validateBrandReadinessForAgency(
  brandMemory: BrandMemoryLike
): BrandReadinessResult {
  if (!brandMemory || !hasAnyOwnKeys(brandMemory)) {
    return makeResult('not_ready', [...CRITICAL_AGENCY_SLICES], [], []);
  }

  const criticalSlicesFound = CRITICAL_AGENCY_SLICES.filter((slice) =>
    hasUsableSlice(brandMemory, slice)
  );
  const missingSlices = CRITICAL_AGENCY_SLICES.filter(
    (slice) => !criticalSlicesFound.includes(slice)
  );

  if (criticalSlicesFound.length <= 1) {
    return makeResult('not_ready', missingSlices, [], criticalSlicesFound);
  }

  if (missingSlices.length > 0) {
    return makeResult('partial_ready', missingSlices, [], criticalSlicesFound);
  }

  const warnings = buildComplementaryWarnings(brandMemory);
  const hasVoice = hasUsableSlice(brandMemory, 'voice_profile');
  const hasVisual = hasUsableSlice(brandMemory, 'visual_identity');

  if (hasVoice && hasVisual) {
    return makeResult('ready_for_campaigns', [], warnings, criticalSlicesFound);
  }

  return makeResult('ready_for_content', [], warnings, criticalSlicesFound);
}

function makeResult(
  status: BrandReadinessStatus,
  missingSlices: string[],
  warnings: string[],
  criticalSlicesFound: string[]
): BrandReadinessResult {
  return {
    status,
    missingSlices,
    warnings,
    allowedRequestTypes: allowedRequestTypesForStatus(status),
    criticalSlicesFound,
  };
}

export function allowedRequestTypesForStatus(
  status: BrandReadinessStatus
): AgencyRequestType[] {
  if (status === 'ready_for_campaigns') return CAMPAIGN_REQUEST_TYPES;
  if (status === 'ready_for_content') return CONTENT_REQUEST_TYPES;
  return [];
}

function buildComplementaryWarnings(
  brandMemory: Partial<Record<keyof EspansioneDiagnostic, unknown>>
): string[] {
  const warnings: string[] = [];

  if (!hasUsableSlice(brandMemory, 'voice_profile')) {
    warnings.push('voice_profile ausente: limitar producao a conteudos simples e revisar tom manualmente.');
  }

  if (!hasUsableSlice(brandMemory, 'visual_identity')) {
    warnings.push('visual_identity ausente: limitar direcao visual e revisar identidade manualmente.');
  }

  return warnings;
}

function hasAnyOwnKeys(value: object): boolean {
  return Object.keys(value).length > 0;
}

function hasUsableSlice(
  brandMemory: Partial<Record<keyof EspansioneDiagnostic, unknown>>,
  slice: keyof EspansioneDiagnostic
): boolean {
  const value = brandMemory[slice];
  if (value === null || value === undefined) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
}
