export type EvidenceStrength = 'strong' | 'medium' | 'weak' | 'unknown';

export interface OutputQualityMetadata {
  confidence_score?: number;
  evidence_strength?: EvidenceStrength;
  evidence_gaps?: string[];
  assumptions?: string[];
  contradictions?: string[];
  needs_human_attention?: boolean;
  risk_summary?: string;
  source_coverage?: {
    vi?: boolean;
    ve?: boolean;
    vm?: boolean;
    forms?: boolean;
    interviews?: boolean;
    market_research?: boolean;
  };
}

