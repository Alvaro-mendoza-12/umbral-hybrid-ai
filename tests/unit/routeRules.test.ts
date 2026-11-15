import { describe, expect, it } from 'vitest';
import { curatedOpportunities } from '../../src/data/opportunities';
import {
  addRouteTask,
  emptyMyRouteState,
  exportRouteToJson,
  exportRouteToMarkdown,
  MAX_GOAL_LENGTH,
  MAX_ROUTE_IMPORT_BYTES,
  MAX_TASK_LENGTH,
  moveRouteTask,
  normalizeMyRouteState,
  parseAndValidateRouteImport,
  removeSavedOpportunity,
  saveOpportunityToRoute,
  setActiveGoal,
  updateRouteTaskStatus,
} from '../../src/domain/routeRules';

describe('routeRules', () => {
  it('enforces single active goal with confirm-replace guard and max length', () => {
    const tooLong = setActiveGoal(emptyMyRouteState, 'x'.repeat(MAX_GOAL_LENGTH + 1));
    expect(tooLong.ok).toBe(false);
    if (!tooLong.ok) expect(tooLong.error).toBe('GOAL_TOO_LONG');

    const first = setActiveGoal(emptyMyRouteState, 'Apply to scholarship before December');
    expect(first.ok).toBe(true);
    if (!first.ok) return;

    const blockedReplace = setActiveGoal(first.state, 'Switch to new goal');
    expect(blockedReplace.ok).toBe(false);
    if (!blockedReplace.ok) expect(blockedReplace.error).toBe('CONFIRM_REPLACE_REQUIRED');

    const confirmed = setActiveGoal(first.state, 'Switch to new goal', { confirmReplace: true });
    expect(confirmed.ok).toBe(true);
    if (confirmed.ok) {
      expect(confirmed.state.goal?.text).toBe('Switch to new goal');
    }
  });

  it('enforces max 3 active tasks while allowing completed archive and preventing reactivation over 3', () => {
    let state = emptyMyRouteState;
    for (let i = 1; i <= 3; i += 1) {
      const res = addRouteTask(state, `Step ${i}`, { id: `t-${i}` });
      expect(res.ok).toBe(true);
      if (res.ok) state = res.state;
    }

    const blocked4th = addRouteTask(state, 'Step 4');
    expect(blocked4th.ok).toBe(false);
    if (!blocked4th.ok) expect(blocked4th.error).toBe('MAX_ACTIVE_TASKS_REACHED');

    const completedFirst = updateRouteTaskStatus(state, 't-1', 'completed');
    expect(completedFirst.ok).toBe(true);
    if (!completedFirst.ok) return;
    state = completedFirst.state;

    const addedAfterComplete = addRouteTask(state, 'Step 4 now allowed', { id: 't-4' });
    expect(addedAfterComplete.ok).toBe(true);
    if (!addedAfterComplete.ok) return;
    state = addedAfterComplete.state;

    const blockedReactivate = updateRouteTaskStatus(state, 't-1', 'pending');
    expect(blockedReactivate.ok).toBe(false);
    if (!blockedReactivate.ok) expect(blockedReactivate.error).toBe('MAX_ACTIVE_TASKS_REACHED');

    const reordered = moveRouteTask(state, 't-2', 'up');
    expect(reordered.tasks[0]?.id).toBe('t-2');

    const tooLongTask = addRouteTask(emptyMyRouteState, 'a'.repeat(MAX_TASK_LENGTH + 1));
    expect(tooLongTask.ok).toBe(false);
  });

  it('saves, removes, normalizes corrupt state, and exports route to Markdown', () => {
    const opp = curatedOpportunities[0]!;
    const withSaved = saveOpportunityToRoute(emptyMyRouteState, opp);
    expect(withSaved.saved[opp.id]?.status).toBe('saved');

    const goalRes = setActiveGoal(withSaved, 'Complete dossier');
    const finalState = goalRes.ok ? goalRes.state : withSaved;

    const md = exportRouteToMarkdown(finalState, 'en');
    expect(md).toContain('Complete dossier');
    expect(md).toContain(opp.title.en);

    const removed = removeSavedOpportunity(finalState, opp.id);
    expect(removed.removed?.opportunityId).toBe(opp.id);
    expect(removed.state.saved[opp.id]).toBeUndefined();

    expect(normalizeMyRouteState({ bad: true })).toEqual(emptyMyRouteState);
  });

  it('rejects non-HTTPS saved snapshots during normalization and JSON import', () => {
    const opp = curatedOpportunities[0]!;
    const poisoned = {
      version: 2,
      goal: null,
      tasks: [],
      saved: {
        [opp.id]: {
          opportunityId: opp.id,
          titleSnapshot: opp.title,
          providerSnapshot: opp.providerName,
          officialUrlSnapshot: 'javascript:alert(1)',
          status: 'saved',
          savedAt: '2026-11-14T00:00:00.000Z',
          updatedAt: '2026-11-14T00:00:00.000Z',
        },
        unsafeHttp: {
          opportunityId: 'unsafeHttp',
          titleSnapshot: opp.title,
          providerSnapshot: opp.providerName,
          officialUrlSnapshot: 'http://insecure.example.com',
          status: 'saved',
          savedAt: '2026-11-14T00:00:00.000Z',
          updatedAt: '2026-11-14T00:00:00.000Z',
        },
      },
    };

    const normalized = normalizeMyRouteState(poisoned);
    expect(Object.keys(normalized.saved)).toEqual([]);

    const imported = parseAndValidateRouteImport(JSON.stringify(poisoned));
    expect(imported.ok).toBe(true);
    if (imported.ok) {
      expect(Object.keys(imported.state.saved)).toEqual([]);
      expect(imported.warnings.rejectedUrlsCount).toBe(2);
    }
  });

  it('validates JSON backup exports, v1 upgrades, malformed inputs, size cap, and active task limits', () => {
    const opp = curatedOpportunities[0]!;
    let state = saveOpportunityToRoute(emptyMyRouteState, opp);
    const goalRes = setActiveGoal(state, 'Verify transcript and references');
    if (goalRes.ok) state = goalRes.state;
    const t1 = addRouteTask(state, 'Download transcript', { id: 't1' });
    if (t1.ok) state = t1.state;

    const json = exportRouteToJson(state);
    const roundTrip = parseAndValidateRouteImport(json);
    expect(roundTrip.ok).toBe(true);
    if (roundTrip.ok) {
      expect(roundTrip.state.goal?.text).toBe('Verify transcript and references');
      expect(roundTrip.state.tasks).toHaveLength(1);
      expect(roundTrip.warnings).toEqual({
        rejectedUrlsCount: 0,
        trimmedTasksCount: 0,
        upgradedFromV1: false,
      });
    }

    const v1 = parseAndValidateRouteImport(
      JSON.stringify({
        version: 1,
        goal: null,
        tasks: [
          { id: '1', text: 'One', status: 'pending', createdAt: '2026-11-14T00:00:00Z', updatedAt: '2026-11-14T00:00:00Z' },
          { id: '2', text: 'Two', status: 'pending', createdAt: '2026-11-14T00:00:00Z', updatedAt: '2026-11-14T00:00:00Z' },
          { id: '3', text: 'Three', status: 'in_progress', createdAt: '2026-11-14T00:00:00Z', updatedAt: '2026-11-14T00:00:00Z' },
          { id: '4', text: 'Four active exceeds cap', status: 'pending', createdAt: '2026-11-14T00:00:00Z', updatedAt: '2026-11-14T00:00:00Z' },
        ],
        saved: {},
      }),
    );
    expect(v1.ok).toBe(true);
    if (v1.ok) {
      expect(v1.state.version).toBe(2);
      expect(v1.state.tasks).toHaveLength(3);
      expect(v1.warnings.upgradedFromV1).toBe(true);
      expect(v1.warnings.trimmedTasksCount).toBe(1);
    }

    expect(parseAndValidateRouteImport('{bad-json')).toEqual({ ok: false, error: 'INVALID_JSON' });
    expect(parseAndValidateRouteImport(JSON.stringify([]))).toEqual({ ok: false, error: 'INVALID_SCHEMA' });
    expect(parseAndValidateRouteImport(JSON.stringify({ version: 2, tasks: 'bad' }))).toEqual({
      ok: false,
      error: 'INVALID_SCHEMA',
    });
    expect(parseAndValidateRouteImport(JSON.stringify({ version: 99, tasks: [], saved: {} }))).toEqual({
      ok: false,
      error: 'UNSUPPORTED_VERSION',
    });
    expect(parseAndValidateRouteImport('x'.repeat(MAX_ROUTE_IMPORT_BYTES + 1))).toEqual({
      ok: false,
      error: 'FILE_TOO_LARGE',
    });
  });
});
