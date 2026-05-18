export type CuratedEvidenceLens = 'vi' | 've' | 'vm';
export type CuratedEvidenceStrength = 'strong' | 'medium' | 'weak';
export type CuratedEvidencePackStatus = 'draft' | 'ready_for_agent_6' | 'archived';

export interface CuratedEvidenceItem {
  title: string;
  description: string;
  source_lens: CuratedEvidenceLens;
  source_reference?: string;
  evidence_strength: CuratedEvidenceStrength;
}

export interface CuratedContradiction {
  title: string;
  vi_signal?: string;
  ve_signal?: string;
  vm_signal?: string;
  why_it_matters: string;
  should_preserve_for_strategy: boolean;
}

export interface CuratedEvidencePack {
  id?: string;
  project_id: string;
  source_outputs: {
    vi_output_id?: string;
    ve_output_id?: string;
    vm_output_id?: string;
  };
  strong_evidence: CuratedEvidenceItem[];
  weak_evidence: CuratedEvidenceItem[];
  contradictions: CuratedContradiction[];
  evidence_gaps: string[];
  sensitive_points: string[];
  unresolved_questions: string[];
  assumptions_to_validate: string[];
  curator_notes?: string;
  status: CuratedEvidencePackStatus;
  created_at?: string;
  updated_at?: string;
}
