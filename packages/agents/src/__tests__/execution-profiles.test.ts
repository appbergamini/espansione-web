import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildAgencyExecutionPlan,
  DEFAULT_AGENCY_EXECUTION_PROFILES,
  selectAgencyExecutionProfile,
} from '../execution-profiles.ts';
import type { AgencyRequest, BrandKernel } from '@espansione/types';

const brandKernel = {
  brand: { name: 'Marca Teste', slug: 'marca-teste', industry: 'Serviços' },
} as BrandKernel;

test('social_post seleciona channel_adapted_content', () => {
  const profile = selectAgencyExecutionProfile({
    agencyRequest: makeRequest({ requestType: 'social_post', channel: 'linkedin' }),
  });

  assert.equal(profile.id, 'channel_adapted_content');
});

test('carousel seleciona visual_content', () => {
  const profile = selectAgencyExecutionProfile({
    agencyRequest: makeRequest({ requestType: 'carousel', channel: 'instagram' }),
  });

  assert.equal(profile.id, 'visual_content');
});

test('email seleciona channel_adapted_content', () => {
  const profile = selectAgencyExecutionProfile({
    agencyRequest: makeRequest({ requestType: 'email', channel: 'email' }),
  });

  assert.equal(profile.id, 'channel_adapted_content');
});

test('landing_page_copy seleciona landing_page_copy', () => {
  const profile = selectAgencyExecutionProfile({
    agencyRequest: makeRequest({ requestType: 'landing_page_copy', channel: 'website' }),
  });

  assert.equal(profile.id, 'landing_page_copy');
});

test('campaign flag seleciona campaign_light', () => {
  const profile = selectAgencyExecutionProfile({
    agencyRequest: {
      ...makeRequest({ requestType: 'social_post', channel: 'linkedin' }),
      campaign: true,
    } as AgencyRequest & { campaign: boolean },
  });

  assert.equal(profile.id, 'campaign_light');
});

test('execution plan inclui brand_compliance quando exigido', () => {
  const request = makeRequest({ requestType: 'social_post', channel: 'linkedin' });
  const profile = DEFAULT_AGENCY_EXECUTION_PROFILES.channel_adapted_content;
  const plan = buildAgencyExecutionPlan({ agencyRequest: request, brandKernel, selectedProfile: profile });

  assert.equal(plan.profile_id, 'channel_adapted_content');
  assert.equal(plan.agent_sequence.includes('brand_compliance'), true);
  assert.equal(plan.agent_sequence.at(-1), 'approver');
  assert.equal(plan.required_gates.includes('brand_compliance_before_approver'), true);
});

test('simple_content pula visual_director e channel_adapter', () => {
  const request = makeRequest({ requestType: 'social_post', channel: 'other' });
  const plan = buildAgencyExecutionPlan({
    agencyRequest: request,
    brandKernel,
    selectedProfile: DEFAULT_AGENCY_EXECUTION_PROFILES.simple_content,
  });

  assert.deepEqual(plan.agent_sequence, ['account_director', 'copywriter', 'editor', 'brand_compliance', 'approver']);
  assert.equal(plan.skipped_agents.some((item) => item.agent_id === 'visual_director'), true);
  assert.equal(plan.skipped_agents.some((item) => item.agent_id === 'channel_adapter'), true);
});

function makeRequest(overrides: Partial<AgencyRequest> = {}): AgencyRequest {
  return {
    id: 'request-1',
    brandId: 'brand-1',
    requestType: 'social_post',
    channel: 'linkedin',
    objective: 'authority',
    context: 'Contexto do pedido',
    ...overrides,
  };
}
