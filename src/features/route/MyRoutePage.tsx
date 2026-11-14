import {
  ArrowDown,
  ArrowUp,
  Check,
  Compass,
  Download,
  ExternalLink,
  Pencil,
  Plus,
  Trash2,
  Undo2,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useApp } from '../../app/appContextStore';
import { isSafeHttpsUrl } from '../../domain/catalogRules';
import {
  countActiveTasks,
  exportRouteToMarkdown,
  MAX_ACTIVE_TASKS,
  MAX_GOAL_LENGTH,
  MAX_TASK_LENGTH,
} from '../../domain/routeRules';
import type {
  SavedOpportunityTracking,
  TaskStatus,
  TrackingStatus,
} from '../../domain/types';

function triggerDownload(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function MyRoutePage() {
  const { t } = useTranslation();
  const {
    locale,
    route,
    saveGoal,
    clearGoal,
    addTask,
    editTaskText,
    changeTaskStatus,
    changeTaskDate,
    deleteTask,
    reorderTask,
    changeSavedStatus,
    unsaveOpportunity,
    restoreSavedOpportunity,
  } = useApp();

  const [goalDraft, setGoalDraft] = useState(route.goal?.text ?? '');
  const [pendingReplaceGoal, setPendingReplaceGoal] = useState<string | null>(null);
  const [goalFeedback, setGoalFeedback] = useState<string | null>(null);

  const [taskDraft, setTaskDraft] = useState('');
  const [taskDateDraft, setTaskDateDraft] = useState('');
  const [taskFeedback, setTaskFeedback] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskText, setEditingTaskText] = useState('');

  const [lastRemoved, setLastRemoved] = useState<SavedOpportunityTracking | null>(null);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  const activeTasksCount = countActiveTasks(route.tasks);
  const savedItems = Object.values(route.saved).sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );

  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGoalFeedback(null);
    const trimmed = goalDraft.trim();
    if (!trimmed) return;

    const result = saveGoal(trimmed);
    if (!result.ok) {
      if (result.error === 'CONFIRM_REPLACE_REQUIRED') {
        setPendingReplaceGoal(trimmed);
      } else {
        setGoalFeedback(result.error);
      }
      return;
    }
    setPendingReplaceGoal(null);
  };

  const handleConfirmReplace = () => {
    if (!pendingReplaceGoal) return;
    const result = saveGoal(pendingReplaceGoal, { confirmReplace: true });
    if (result.ok) {
      setPendingReplaceGoal(null);
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    setTaskFeedback(null);
    const trimmed = taskDraft.trim();
    if (!trimmed) return;

    const result = addTask(trimmed, {
      personalTargetDate: taskDateDraft || undefined,
    });
    if (!result.ok) {
      if (result.error === 'MAX_ACTIVE_TASKS_REACHED') {
        setTaskFeedback(t('route.taskLimitNote'));
      } else {
        setTaskFeedback(result.error);
      }
      return;
    }
    setTaskDraft('');
    setTaskDateDraft('');
  };

  return (
    <div className="stack-lg">
      <section className="surface-card stack-sm">
        <h1 style={{ margin: 0, fontSize: 'clamp(1.38rem, 2.4vw, 1.85rem)' }}>
          {t('route.heading')}
        </h1>
        <p style={{ margin: 0, color: 'var(--ink-secondary)' }}>
          {t('route.subheading')}
        </p>
      </section>

      <section className="surface-card stack-md" aria-labelledby="goal-heading">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap',
          }}
        >
          <h2 id="goal-heading" style={{ margin: 0, fontSize: '1.15rem' }}>
            {t('route.goalHeading')}
          </h2>
          {route.goal && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                clearGoal();
                setGoalDraft('');
                setPendingReplaceGoal(null);
              }}
            >
              <X size={14} aria-hidden="true" />
              <span>{t('route.goalClearBtn')}</span>
            </button>
          )}
        </div>

        {route.goal && (
          <div className="banner banner-good" style={{ marginBottom: 0 }}>
            <strong>{route.goal.text}</strong>
          </div>
        )}

        <form onSubmit={handleGoalSubmit} className="stack-sm">
          <label htmlFor="route-goal-input" className="sr-only">
            {t('route.goalInputLabel')}
          </label>
          <input
            id="route-goal-input"
            type="text"
            maxLength={MAX_GOAL_LENGTH}
            className="text-input"
            value={goalDraft}
            placeholder={t('route.goalPlaceholder')}
            onChange={(e) => setGoalDraft(e.target.value)}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ fontSize: '0.82rem', color: 'var(--ink-muted)' }}>
              {t('route.goalChars', {
                count: goalDraft.trim().length,
                max: MAX_GOAL_LENGTH,
              })}
            </span>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={!goalDraft.trim()}
            >
              {t('route.goalSetBtn')}
            </button>
          </div>
        </form>

        {pendingReplaceGoal && route.goal && (
          <div className="banner banner-warn stack-sm" role="region" aria-label={t('route.goalConfirmReplaceTitle')}>
            <strong>{t('route.goalConfirmReplaceTitle')}</strong>
            <span>
              {t('route.goalConfirmReplaceBody', {
                current: route.goal.text,
                next: pendingReplaceGoal,
              })}
            </span>
            <div className="card-actions">
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleConfirmReplace}
              >
                {t('route.goalReplaceBtn')}
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setPendingReplaceGoal(null)}
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        )}

        {goalFeedback && (
          <div className="banner banner-bad" role="alert">
            {goalFeedback}
          </div>
        )}
      </section>

      <section className="surface-card stack-md" aria-labelledby="tasks-heading">
        <h2 id="tasks-heading" style={{ margin: 0, fontSize: '1.15rem' }}>
          {t('route.tasksHeading', { active: activeTasksCount })}
        </h2>

        {activeTasksCount >= MAX_ACTIVE_TASKS && (
          <div className="banner banner-info" role="status">
            {t('route.taskLimitNote')}
          </div>
        )}

        <form onSubmit={handleAddTask} className="stack-sm">
          <div className="two-col-form">
            <div className="field-group">
              <label htmlFor="route-task-input" className="sr-only">
                {t('route.taskPlaceholder')}
              </label>
              <input
                id="route-task-input"
                type="text"
                maxLength={MAX_TASK_LENGTH}
                className="text-input"
                value={taskDraft}
                placeholder={t('route.taskPlaceholder')}
                onChange={(e) => setTaskDraft(e.target.value)}
              />
            </div>

            <div className="field-group">
              <label htmlFor="route-task-date" className="sr-only">
                {t('route.taskDateLabel')}
              </label>
              <input
                id="route-task-date"
                type="date"
                className="text-input"
                value={taskDateDraft}
                aria-label={t('route.taskDateLabel')}
                onChange={(e) => setTaskDateDraft(e.target.value)}
              />
            </div>
          </div>

          <div className="card-actions">
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={!taskDraft.trim() || activeTasksCount >= MAX_ACTIVE_TASKS}
            >
              <Plus size={15} aria-hidden="true" />
              <span>{t('route.taskAddBtn')}</span>
            </button>
          </div>
        </form>

        {taskFeedback && (
          <div className="banner banner-warn" role="alert">
            {taskFeedback}
          </div>
        )}

        {route.tasks.length === 0 ? (
          <div className="subtle-card stack-sm">
            <strong>{t('route.taskEmptyTitle')}</strong>
            <span style={{ color: 'var(--ink-secondary)', fontSize: '0.9rem' }}>
              {t('route.taskEmptyBody')}
            </span>
          </div>
        ) : (
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'grid',
              gap: '10px',
            }}
          >
            {route.tasks.map((task, idx) => {
              const isEditing = editingTaskId === task.id;
              return (
                <li key={task.id} className="subtle-card stack-sm">
                  {isEditing ? (
                    <div className="stack-sm">
                      <input
                        type="text"
                        maxLength={MAX_TASK_LENGTH}
                        className="text-input"
                        value={editingTaskText}
                        onChange={(e) => setEditingTaskText(e.target.value)}
                      />
                      <div className="card-actions">
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            const res = editTaskText(task.id, editingTaskText);
                            if (res.ok) setEditingTaskId(null);
                          }}
                        >
                          <Check size={14} aria-hidden="true" />
                          <span>{t('common.save')}</span>
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setEditingTaskId(null)}
                        >
                          {t('common.cancel')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          gap: '10px',
                          flexWrap: 'wrap',
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 600,
                            textDecoration:
                              task.status === 'completed' ? 'line-through' : 'none',
                            color:
                              task.status === 'completed'
                                ? 'var(--ink-muted)'
                                : 'var(--ink-primary)',
                          }}
                          className="wrap-text"
                        >
                          {task.text}
                        </span>

                        {task.opportunityId && (
                          <Link
                            to={`/opportunities/${task.opportunityId}`}
                            className="pill pill-info"
                            style={{ textDecoration: 'none' }}
                          >
                            {t('explore.openDetail')}
                          </Link>
                        )}
                      </div>

                      <div className="card-actions">
                        <label className="sr-only" htmlFor={`status-${task.id}`}>
                          Task status
                        </label>
                        <select
                          id={`status-${task.id}`}
                          className="select-input"
                          style={{ width: 'auto', minHeight: '38px' }}
                          value={task.status}
                          onChange={(e) => {
                            const res = changeTaskStatus(
                              task.id,
                              e.target.value as TaskStatus,
                            );
                            if (!res.ok && res.error === 'MAX_ACTIVE_TASKS_REACHED') {
                              setTaskFeedback(t('route.taskLimitNote'));
                            } else {
                              setTaskFeedback(null);
                            }
                          }}
                        >
                          <option value="pending">{t('route.taskStatuses.pending')}</option>
                          <option value="in_progress">
                            {t('route.taskStatuses.in_progress')}
                          </option>
                          <option value="completed">
                            {t('route.taskStatuses.completed')}
                          </option>
                        </select>

                        <input
                          type="date"
                          className="text-input"
                          style={{ width: 'auto', minHeight: '38px' }}
                          value={task.personalTargetDate ?? ''}
                          aria-label={t('route.taskDateLabel')}
                          onChange={(e) =>
                            changeTaskDate(task.id, e.target.value || undefined)
                          }
                        />

                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          aria-label={t('route.taskMoveUp')}
                          disabled={idx === 0}
                          onClick={() => reorderTask(task.id, 'up')}
                        >
                          <ArrowUp size={15} aria-hidden="true" />
                        </button>

                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          aria-label={t('route.taskMoveDown')}
                          disabled={idx === route.tasks.length - 1}
                          onClick={() => reorderTask(task.id, 'down')}
                        >
                          <ArrowDown size={15} aria-hidden="true" />
                        </button>

                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          aria-label={t('common.edit')}
                          onClick={() => {
                            setEditingTaskId(task.id);
                            setEditingTaskText(task.text);
                          }}
                        >
                          <Pencil size={15} aria-hidden="true" />
                        </button>

                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          aria-label={t('common.delete')}
                          onClick={() => deleteTask(task.id)}
                        >
                          <Trash2 size={15} aria-hidden="true" />
                        </button>
                      </div>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="surface-card stack-md" aria-labelledby="saved-heading">
        <h2 id="saved-heading" style={{ margin: 0, fontSize: '1.15rem' }}>
          {t('route.savedHeading', { count: savedItems.length })}
        </h2>

        {lastRemoved && (
          <div className="banner banner-info" role="status" aria-live="polite">
            <span style={{ flex: 1 }}>
              {t('route.savedRemovedUndo', {
                title: lastRemoved.titleSnapshot[locale],
              })}
            </span>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                restoreSavedOpportunity(lastRemoved);
                setLastRemoved(null);
              }}
            >
              <Undo2 size={14} aria-hidden="true" />
              <span>{t('common.undo')}</span>
            </button>
          </div>
        )}

        {savedItems.length === 0 ? (
          <div className="subtle-card stack-sm">
            <strong>{t('route.savedEmptyTitle')}</strong>
            <span style={{ color: 'var(--ink-secondary)', fontSize: '0.9rem' }}>
              {t('route.savedEmptyBody')}
            </span>
            <div>
              <Link to="/" className="btn btn-primary btn-sm">
                <Compass size={15} aria-hidden="true" />
                <span>{t('route.savedGoExplore')}</span>
              </Link>
            </div>
          </div>
        ) : (
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'grid',
              gap: '12px',
            }}
          >
            {savedItems.map((item) => {
              const safeUrl = isSafeHttpsUrl(item.officialUrlSnapshot)
                ? item.officialUrlSnapshot
                : null;
              return (
                <li key={item.opportunityId} className="subtle-card stack-sm">
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '10px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div className="stack-sm" style={{ gap: '2px' }}>
                      <Link
                        to={`/opportunities/${item.opportunityId}`}
                        style={{ fontWeight: 700, textDecoration: 'none' }}
                      >
                        {item.titleSnapshot[locale]}
                      </Link>
                      <span style={{ fontSize: '0.84rem', color: 'var(--ink-muted)' }}>
                        {item.providerSnapshot[locale]}
                      </span>
                    </div>

                    <select
                      className="select-input"
                      style={{ width: 'auto', minHeight: '38px' }}
                      aria-label={item.titleSnapshot[locale]}
                      value={item.status}
                      onChange={(e) =>
                        changeSavedStatus(
                          item.opportunityId,
                          e.target.value as TrackingStatus,
                        )
                      }
                    >
                      <option value="saved">{t('route.trackingStatuses.saved')}</option>
                      <option value="preparing">
                        {t('route.trackingStatuses.preparing')}
                      </option>
                      <option value="applied_self_reported">
                        {t('route.trackingStatuses.applied_self_reported')}
                      </option>
                      <option value="closed">{t('route.trackingStatuses.closed')}</option>
                    </select>
                  </div>

                  <div className="card-actions">
                    <Link
                      to={`/opportunities/${item.opportunityId}`}
                      className="btn btn-secondary btn-sm"
                    >
                      {t('explore.openDetail')}
                    </Link>

                    {safeUrl && (
                      <a
                        href={safeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-ghost btn-sm"
                      >
                        <span>{t('detail.officialLinkBtn')}</span>
                        <ExternalLink size={14} aria-hidden="true" />
                      </a>
                    )}

                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => {
                        const removed = unsaveOpportunity(item.opportunityId);
                        if (removed) setLastRemoved(removed);
                      }}
                    >
                      <Trash2 size={14} aria-hidden="true" />
                      <span>{t('common.delete')}</span>
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="surface-card stack-sm" aria-labelledby="export-heading">
        <h2 id="export-heading" style={{ margin: 0, fontSize: '1.1rem' }}>
          {t('route.exportHeading')}
        </h2>
        <div className="card-actions">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              const md = exportRouteToMarkdown(route, locale);
              triggerDownload('umbral-my-route.md', md, 'text/markdown;charset=utf-8');
              setExportMessage(t('route.exportedNotice', { format: 'Markdown' }));
            }}
          >
            <Download size={15} aria-hidden="true" />
            <span>{t('route.exportMarkdown')}</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              triggerDownload(
                'umbral-my-route.json',
                JSON.stringify(route, null, 2),
                'application/json;charset=utf-8',
              );
              setExportMessage(t('route.exportedNotice', { format: 'JSON' }));
            }}
          >
            <Download size={15} aria-hidden="true" />
            <span>{t('route.exportJson')}</span>
          </button>
        </div>

        {exportMessage && (
          <p role="status" aria-live="polite" style={{ margin: 0, fontSize: '0.88rem' }}>
            {exportMessage}
          </p>
        )}
      </section>
    </div>
  );
}
