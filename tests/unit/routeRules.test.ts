import { describe, expect, it } from 'vitest';
import { curatedOpportunities } from '../../src/data/opportunities';
import {
  addRouteTask,
  emptyMyRouteState,
  exportRouteToMarkdown,
  MAX_GOAL_LENGTH,
  MAX_TASK_LENGTH,
  moveRouteTask,
  normalizeMyRouteState,
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
});
