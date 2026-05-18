import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getActiveBrandMemoryVersion,
  loadBrandMemory,
} from '../brand-memory-loader-v2.ts';
import { FakeSupabase, makeDiagnostic } from './fake-supabase.ts';

test('cria a primeira Brand Memory ativa com versao 1', async () => {
  const db = new FakeSupabase();
  const diagnostic = makeDiagnostic();

  const result = await loadBrandMemory(db as any, diagnostic as any, {
    reviewedAt: '2026-05-18T12:00:00.000Z',
    reviewedBy: 'admin-1',
    agent16OutputId: 'output-16',
  });

  assert.equal(result.versionNumber, 1);
  assert.equal(result.snapshotsWritten, 11);
  assert.ok(result.brandMemoryVersionId);

  const active = await getActiveBrandMemoryVersion(db as any, result.brandId);
  assert.equal(active?.versionNumber, 1);
  assert.equal(active?.status, 'active');
  assert.equal(active?.sourceOutputId, 'output-16');
  assert.deepEqual(active?.espansioneDiagnosticJson.brand_name, 'Marca Teste');
});

test('cria nova versao e arquiva automaticamente a anterior', async () => {
  const db = new FakeSupabase();

  const first = await loadBrandMemory(db as any, makeDiagnostic() as any, {
    reviewedAt: '2026-05-18T12:00:00.000Z',
    reviewedBy: 'admin-1',
    agent16OutputId: 'output-16-a',
  });

  const second = await loadBrandMemory(db as any, makeDiagnostic({ brand_name: 'Marca Teste v2' }) as any, {
    reviewedAt: '2026-05-18T13:00:00.000Z',
    reviewedBy: 'admin-1',
    agent16OutputId: 'output-16-b',
  });

  assert.equal(second.brandId, first.brandId);
  assert.equal(second.versionNumber, 2);

  const versions = db.tables.brand_memory_versions;
  assert.equal(versions.length, 2);
  assert.equal(versions.filter((row) => row.status === 'active').length, 1);
  assert.equal(versions.find((row) => row.version_number === 1)?.status, 'archived');
  assert.equal(versions.find((row) => row.version_number === 2)?.status, 'active');

  const activeSnapshots = db.tables.brand_snapshots.filter((row) => row.is_active);
  assert.equal(activeSnapshots.every((row) => row.diagnostic_run_id === second.diagnosticRunId), true);
});

test('impede duas versoes ativas para a mesma marca', async () => {
  const db = new FakeSupabase();
  const loaded = await loadBrandMemory(db as any, makeDiagnostic() as any, {
    reviewedAt: '2026-05-18T12:00:00.000Z',
    reviewedBy: 'admin-1',
  });

  const { error } = await db
    .from('brand_memory_versions')
    .insert({
      brand_id: loaded.brandId,
      version_number: 99,
      status: 'active',
      espansione_diagnostic_json: makeDiagnostic(),
    });

  assert.equal(error?.message, 'duplicate active Brand Memory version');
  assert.equal(db.tables.brand_memory_versions.filter((row) => row.status === 'active').length, 1);
});

test('recusa carregamento sem revisao humana explicita', async () => {
  const db = new FakeSupabase();

  await assert.rejects(
    () => loadBrandMemory(db as any, makeDiagnostic() as any),
    /requires explicit human review/
  );
});

