export type CheckpointDecision =
  | 'approved'
  | 'approved_with_notes'
  | 'revision_requested'
  | 'rejected';

export interface StructuredCheckpointNotes {
  approved_points: string[];
  points_with_reservations: string[];
  required_adjustments: string[];
  pending_decisions: string[];
  context_for_next_agents: string[];
  risks_to_monitor: string[];
}

export interface CheckpointApprovalRecord {
  checkpoint_id: string;
  project_id: string;
  agent_id: string;
  decision: CheckpointDecision;
  structured_notes: StructuredCheckpointNotes;
  freeform_notes?: string;
  created_at?: string;
  updated_at?: string;
}
