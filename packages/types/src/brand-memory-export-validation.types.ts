export type BrandMemoryExportValidationStatus =
  | 'not_applicable'
  | 'missing'
  | 'valid'
  | 'invalid'
  | 'warning';

export interface BrandMemoryExportValidationResult {
  agent_id: string;
  expected_slices: string[];
  found_slices: string[];
  missing_slices: string[];
  invalid_slices: string[];
  warnings: string[];
  errors: string[];
  status: BrandMemoryExportValidationStatus;
}
