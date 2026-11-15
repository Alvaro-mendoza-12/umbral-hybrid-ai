import { isSafeHttpsUrl } from './catalogRules';
import type {
  ActiveGoal,
  Locale,
  MyRouteState,
  Opportunity,
  RouteTask,
  SavedOpportunityTracking,
  TaskStatus,
  TrackingStatus,
} from './types';

export const MAX_ROUTE_IMPORT_BYTES = 512_000;

export const MAX_GOAL_LENGTH = 120;
export const MAX_TASK_LENGTH = 200;
export const MAX_ACTIVE_TASKS = 3;

export const emptyMyRouteState: MyRouteState = {
  version: 2,
  goal: null,
  tasks: [],
  saved: {},
};

export type RouteActionError =
  | 'EMPTY_GOAL'
  | 'GOAL_TOO_LONG'
  | 'CONFIRM_REPLACE_REQUIRED'
  | 'EMPTY_TASK'
  | 'TASK_TOO_LONG'
  | 'MAX_ACTIVE_TASKS_REACHED'
  | 'TASK_NOT_FOUND';

export type RouteMutationResult =
  | { ok: true; state: MyRouteState }
  | { ok: false; error: RouteActionError };

export function countActiveTasks(tasks: readonly RouteTask[]): number {
  return tasks.filter(
    (task) => task.status === 'pending' || task.status === 'in_progress',
  ).length;
}

export function setActiveGoal(
  state: MyRouteState,
  rawText: string,
  options?: { opportunityId?: string; confirmReplace?: boolean; now?: string },
): RouteMutationResult {
  const trimmed = rawText.trim();
  if (!trimmed) return { ok: false, error: 'EMPTY_GOAL' };
  if (trimmed.length > MAX_GOAL_LENGTH) return { ok: false, error: 'GOAL_TOO_LONG' };

  if (
    state.goal &&
    state.goal.text !== trimmed &&
    !options?.confirmReplace
  ) {
    return { ok: false, error: 'CONFIRM_REPLACE_REQUIRED' };
  }

  const timestamp = options?.now ?? new Date().toISOString();
  return {
    ok: true,
    state: {
      ...state,
      goal: {
        text: trimmed,
        opportunityId: options?.opportunityId,
        updatedAt: timestamp,
      },
    },
  };
}

export function clearActiveGoal(state: MyRouteState): MyRouteState {
  return { ...state, goal: null };
}

export function addRouteTask(
  state: MyRouteState,
  rawText: string,
  options?: {
    id?: string;
    opportunityId?: string;
    personalTargetDate?: string;
    now?: string;
  },
): RouteMutationResult {
  const trimmed = rawText.trim();
  if (!trimmed) return { ok: false, error: 'EMPTY_TASK' };
  if (trimmed.length > MAX_TASK_LENGTH) return { ok: false, error: 'TASK_TOO_LONG' };

  if (countActiveTasks(state.tasks) >= MAX_ACTIVE_TASKS) {
    return { ok: false, error: 'MAX_ACTIVE_TASKS_REACHED' };
  }

  const timestamp = options?.now ?? new Date().toISOString();
  const id =
    options?.id ??
    `step-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

  const nextTask: RouteTask = {
    id,
    text: trimmed,
    status: 'pending',
    opportunityId: options?.opportunityId,
    personalTargetDate: options?.personalTargetDate?.trim() || undefined,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  return {
    ok: true,
    state: {
      ...state,
      tasks: [...state.tasks, nextTask],
    },
  };
}

export function updateRouteTaskText(
  state: MyRouteState,
  taskId: string,
  rawText: string,
  now: string = new Date().toISOString(),
): RouteMutationResult {
  const trimmed = rawText.trim();
  if (!trimmed) return { ok: false, error: 'EMPTY_TASK' };
  if (trimmed.length > MAX_TASK_LENGTH) return { ok: false, error: 'TASK_TOO_LONG' };

  const exists = state.tasks.some((task) => task.id === taskId);
  if (!exists) return { ok: false, error: 'TASK_NOT_FOUND' };

  return {
    ok: true,
    state: {
      ...state,
      tasks: state.tasks.map((task) =>
        task.id === taskId ? { ...task, text: trimmed, updatedAt: now } : task,
      ),
    },
  };
}

export function updateRouteTaskStatus(
  state: MyRouteState,
  taskId: string,
  nextStatus: TaskStatus,
  now: string = new Date().toISOString(),
): RouteMutationResult {
  const target = state.tasks.find((task) => task.id === taskId);
  if (!target) return { ok: false, error: 'TASK_NOT_FOUND' };

  const wasCompleted = target.status === 'completed';
  const willBeActive = nextStatus === 'pending' || nextStatus === 'in_progress';

  if (wasCompleted && willBeActive && countActiveTasks(state.tasks) >= MAX_ACTIVE_TASKS) {
    return { ok: false, error: 'MAX_ACTIVE_TASKS_REACHED' };
  }

  return {
    ok: true,
    state: {
      ...state,
      tasks: state.tasks.map((task) =>
        task.id === taskId ? { ...task, status: nextStatus, updatedAt: now } : task,
      ),
    },
  };
}

export function updateRouteTaskDate(
  state: MyRouteState,
  taskId: string,
  personalTargetDate: string,
  now: string = new Date().toISOString(),
): RouteMutationResult {
  const exists = state.tasks.some((task) => task.id === taskId);
  if (!exists) return { ok: false, error: 'TASK_NOT_FOUND' };

  return {
    ok: true,
    state: {
      ...state,
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              personalTargetDate: personalTargetDate.trim() || undefined,
              updatedAt: now,
            }
          : task,
      ),
    },
  };
}

export function removeRouteTask(state: MyRouteState, taskId: string): MyRouteState {
  return {
    ...state,
    tasks: state.tasks.filter((task) => task.id !== taskId),
  };
}

export function moveRouteTask(
  state: MyRouteState,
  taskId: string,
  direction: 'up' | 'down',
): MyRouteState {
  const idx = state.tasks.findIndex((task) => task.id === taskId);
  if (idx === -1) return state;
  const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= state.tasks.length) return state;

  const copy = [...state.tasks];
  const current = copy[idx];
  const other = copy[swapIdx];
  if (!current || !other) return state;
  copy[idx] = other;
  copy[swapIdx] = current;
  return { ...state, tasks: copy };
}

export function saveOpportunityToRoute(
  state: MyRouteState,
  opportunity: Opportunity,
  now: string = new Date().toISOString(),
): MyRouteState {
  const existing = state.saved[opportunity.id];
  if (existing) {
    return state;
  }
  const entry: SavedOpportunityTracking = {
    opportunityId: opportunity.id,
    titleSnapshot: opportunity.title,
    providerSnapshot: opportunity.providerName,
    officialUrlSnapshot: opportunity.officialUrl,
    status: 'saved',
    savedAt: now,
    updatedAt: now,
  };
  return {
    ...state,
    saved: {
      ...state.saved,
      [opportunity.id]: entry,
    },
  };
}

export function updateSavedOpportunityStatus(
  state: MyRouteState,
  opportunityId: string,
  status: TrackingStatus,
  now: string = new Date().toISOString(),
): MyRouteState {
  const existing = state.saved[opportunityId];
  if (!existing) return state;
  return {
    ...state,
    saved: {
      ...state.saved,
      [opportunityId]: {
        ...existing,
        status,
        updatedAt: now,
      },
    },
  };
}

export function removeSavedOpportunity(
  state: MyRouteState,
  opportunityId: string,
): { state: MyRouteState; removed?: SavedOpportunityTracking } {
  const removed = state.saved[opportunityId];
  if (!removed) return { state };
  const nextSaved = { ...state.saved };
  delete nextSaved[opportunityId];
  return {
    state: {
      ...state,
      saved: nextSaved,
    },
    removed,
  };
}

export function normalizeMyRouteState(raw: unknown): MyRouteState {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return emptyMyRouteState;
  const obj = raw as Record<string, unknown>;
  if (obj.version !== 2 && obj.version !== 1) return emptyMyRouteState;

  let goal: ActiveGoal | null = null;
  if (obj.goal && typeof obj.goal === 'object' && !Array.isArray(obj.goal)) {
    const g = obj.goal as Record<string, unknown>;
    if (typeof g.text === 'string') {
      const trimmed = g.text.replace(/\s+/g, ' ').trim();
      if (trimmed.length > 0 && trimmed.length <= MAX_GOAL_LENGTH) {
        goal = {
          text: trimmed,
          opportunityId: typeof g.opportunityId === 'string' ? g.opportunityId : undefined,
          updatedAt:
            typeof g.updatedAt === 'string' ? g.updatedAt : new Date().toISOString(),
        };
      }
    }
  }

  const tasks: RouteTask[] = [];
  if (Array.isArray(obj.tasks)) {
    const seen = new Set<string>();
    let activeCount = 0;
    for (const item of obj.tasks) {
      if (!item || typeof item !== 'object') continue;
      const t = item as Record<string, unknown>;
      if (
        typeof t.id !== 'string' ||
        seen.has(t.id) ||
        typeof t.text !== 'string'
      ) {
        continue;
      }
      const trimmed = t.text.trim();
      if (!trimmed || trimmed.length > MAX_TASK_LENGTH) continue;
      const status: TaskStatus =
        t.status === 'pending' || t.status === 'in_progress' || t.status === 'completed'
          ? t.status
          : 'pending';
      if (status !== 'completed') {
        if (activeCount >= MAX_ACTIVE_TASKS) continue;
        activeCount += 1;
      }
      seen.add(t.id);
      tasks.push({
        id: t.id,
        text: trimmed,
        status,
        opportunityId: typeof t.opportunityId === 'string' ? t.opportunityId : undefined,
        personalTargetDate:
          typeof t.personalTargetDate === 'string' ? t.personalTargetDate : undefined,
        createdAt:
          typeof t.createdAt === 'string' ? t.createdAt : new Date().toISOString(),
        updatedAt:
          typeof t.updatedAt === 'string' ? t.updatedAt : new Date().toISOString(),
      });
    }
  }

  const saved: Record<string, SavedOpportunityTracking> = {};
  if (obj.saved && typeof obj.saved === 'object' && !Array.isArray(obj.saved)) {
    for (const [key, val] of Object.entries(obj.saved as Record<string, unknown>)) {
      if (!val || typeof val !== 'object') continue;
      const s = val as Record<string, unknown>;
      if (typeof s.opportunityId !== 'string' || s.opportunityId !== key) continue;
      const titleSnap = s.titleSnapshot as Record<string, unknown> | undefined;
      const providerSnap = s.providerSnapshot as Record<string, unknown> | undefined;
      if (
        !titleSnap ||
        typeof titleSnap.es !== 'string' ||
        typeof titleSnap.en !== 'string' ||
        !providerSnap ||
        typeof providerSnap.es !== 'string' ||
        typeof providerSnap.en !== 'string' ||
        typeof s.officialUrlSnapshot !== 'string' ||
        !isSafeHttpsUrl(s.officialUrlSnapshot)
      ) {
        continue;
      }
      const status: TrackingStatus =
        s.status === 'saved' ||
        s.status === 'preparing' ||
        s.status === 'applied_self_reported' ||
        s.status === 'closed'
          ? s.status
          : 'saved';
      saved[key] = {
        opportunityId: s.opportunityId,
        titleSnapshot: { es: titleSnap.es, en: titleSnap.en },
        providerSnapshot: { es: providerSnap.es, en: providerSnap.en },
        officialUrlSnapshot: s.officialUrlSnapshot,
        status,
        savedAt: typeof s.savedAt === 'string' ? s.savedAt : new Date().toISOString(),
        updatedAt:
          typeof s.updatedAt === 'string' ? s.updatedAt : new Date().toISOString(),
      };
    }
  }

  return { version: 2, goal, tasks, saved };
}

export function exportRouteToMarkdown(state: MyRouteState, locale: Locale): string {
  const lines: string[] = [];
  lines.push(
    locale === 'es'
      ? '# Mi Ruta · UMBRAL Hybrid AI'
      : '# My Route · UMBRAL Hybrid AI',
  );
  lines.push('');
  lines.push(
    locale === 'es'
      ? `Exportado localmente: ${new Date().toISOString()}`
      : `Exported locally: ${new Date().toISOString()}`,
  );
  lines.push('');
  lines.push(locale === 'es' ? '## Objetivo activo' : '## Active goal');
  lines.push(
    state.goal
      ? `- ${state.goal.text}`
      : locale === 'es'
        ? '- Ningún objetivo definido.'
        : '- No active goal set.',
  );
  lines.push('');
  lines.push(
    locale === 'es'
      ? '## Próximos pasos (máximo 3 activos)'
      : '## Next steps (up to 3 active)',
  );
  if (state.tasks.length === 0) {
    lines.push(
      locale === 'es' ? '- Sin pasos registrados.' : '- No steps recorded.',
    );
  } else {
    for (const task of state.tasks) {
      const box = task.status === 'completed' ? '[x]' : '[ ]';
      const dateNote = task.personalTargetDate
        ? ` (${locale === 'es' ? 'fecha personal' : 'personal date'}: ${task.personalTargetDate})`
        : '';
      lines.push(`- ${box} ${task.text}${dateNote}`);
    }
  }
  lines.push('');
  lines.push(
    locale === 'es' ? '## Oportunidades guardadas' : '## Saved opportunities',
  );
  const savedList = Object.values(state.saved);
  if (savedList.length === 0) {
    lines.push(
      locale === 'es'
        ? '- Ninguna oportunidad guardada.'
        : '- No saved opportunities.',
    );
  } else {
    for (const item of savedList) {
      lines.push(
        `- ${item.titleSnapshot[locale]} (${item.providerSnapshot[locale]}) — ${item.status} — ${item.officialUrlSnapshot}`,
      );
    }
  }
  return lines.join('\n');
}

export function exportRouteToJson(state: MyRouteState): string {
  return JSON.stringify(normalizeMyRouteState(state), null, 2);
}

export type RouteImportErrorCode =
  | 'INVALID_JSON'
  | 'INVALID_SCHEMA'
  | 'UNSUPPORTED_VERSION'
  | 'FILE_TOO_LARGE';

export type RouteImportResult =
  | {
      ok: true;
      state: MyRouteState;
      warnings: {
        rejectedUrlsCount: number;
        trimmedTasksCount: number;
        upgradedFromV1: boolean;
      };
    }
  | { ok: false; error: RouteImportErrorCode };

export function parseAndValidateRouteImport(rawJson: string): RouteImportResult {
  if (typeof rawJson !== 'string' || rawJson.length > MAX_ROUTE_IMPORT_BYTES) {
    return { ok: false, error: 'FILE_TOO_LARGE' };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    return { ok: false, error: 'INVALID_JSON' };
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { ok: false, error: 'INVALID_SCHEMA' };
  }

  const obj = parsed as Record<string, unknown>;
  if (typeof obj.version !== 'number') {
    return { ok: false, error: 'INVALID_SCHEMA' };
  }

  if (obj.version !== 1 && obj.version !== 2) {
    return { ok: false, error: 'UNSUPPORTED_VERSION' };
  }

  if (
    obj.goal !== undefined &&
    obj.goal !== null &&
    (typeof obj.goal !== 'object' || Array.isArray(obj.goal))
  ) {
    return { ok: false, error: 'INVALID_SCHEMA' };
  }
  if (obj.tasks !== undefined && !Array.isArray(obj.tasks)) {
    return { ok: false, error: 'INVALID_SCHEMA' };
  }
  if (
    obj.saved !== undefined &&
    (!obj.saved || typeof obj.saved !== 'object' || Array.isArray(obj.saved))
  ) {
    return { ok: false, error: 'INVALID_SCHEMA' };
  }

  const normalized = normalizeMyRouteState(obj);

  const rawSavedCount =
    obj.saved && typeof obj.saved === 'object' ? Object.keys(obj.saved).length : 0;
  const acceptedSavedCount = Object.keys(normalized.saved).length;
  const rejectedUrlsCount = Math.max(0, rawSavedCount - acceptedSavedCount);

  const rawTasksCount = Array.isArray(obj.tasks) ? obj.tasks.length : 0;
  const trimmedTasksCount = Math.max(0, rawTasksCount - normalized.tasks.length);

  return {
    ok: true,
    state: normalized,
    warnings: {
      rejectedUrlsCount,
      trimmedTasksCount,
      upgradedFromV1: obj.version === 1,
    },
  };
}
