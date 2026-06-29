import { useEffect, useState } from 'react';
import { api } from '../shared/api.js';
import { formatDate, formatDateTime, isOverdue, shortId } from '../shared/format.js';

const PRIORITIES = ['low', 'medium', 'high'];

function getIdFromUrl() {
  return new URLSearchParams(window.location.search).get('id');
}

export default function App() {
  const id = getIdFromUrl();

  const [todo, setTodo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);
  const [formErrors, setFormErrors] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError('No todo id was provided in the URL (expected ?id=...).');
      return;
    }
    let cancelled = false;
    setLoading(true);
    api
      .get(id)
      .then((data) => {
        if (cancelled) return;
        setTodo(data);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.status === 404 ? `No ticket found with id "${id}".` : err.message);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id]);

  function startEditing() {
    setDraft({
      title: todo.title,
      description: todo.description || '',
      priority: todo.priority,
      dueDate: todo.dueDate ? todo.dueDate.slice(0, 10) : '',
      tags: (todo.tags || []).join(', '),
    });
    setFormErrors([]);
    setEditing(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!draft.title.trim()) {
      setFormErrors(['Title is required.']);
      return;
    }
    setSaving(true);
    try {
      const updated = await api.update(todo.id, {
        title: draft.title.trim(),
        description: draft.description.trim(),
        priority: draft.priority,
        dueDate: draft.dueDate || null,
        completed: todo.completed,
        tags: draft.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      });
      setTodo(updated);
      setEditing(false);
    } catch (err) {
      setFormErrors(err.details?.errors || [err.message]);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleComplete() {
    try {
      const updated = await api.patch(todo.id, { completed: !todo.completed });
      setTodo(updated);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${todo.title}"? This can't be undone.`)) return;
    try {
      await api.remove(todo.id);
      window.location.href = '/index.html';
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="page">
      <a className="back-link" href="/index.html">
        ← Back to all tickets
      </a>

      {loading && <div className="loading-state">Loading ticket…</div>}

      {!loading && error && <div className="error-banner">⚠ {error}</div>}

      {!loading && todo && !editing && (
        <article className={`ticket detail-ticket priority-${todo.priority} ${todo.completed ? 'is-completed' : ''}`}>
          <span className="ticket-stamp">{todo.priority}</span>

          <div className="ticket-main-row">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={handleToggleComplete}
              aria-label={`Mark "${todo.title}" as ${todo.completed ? 'active' : 'completed'}`}
            />
            <h1 className={`ticket-title detail-title ${todo.completed ? 'strike' : ''}`}>
              {todo.title}
            </h1>
          </div>

          {todo.description && <p className="detail-description">{todo.description}</p>}

          <div className="ticket-meta-row">
            {todo.dueDate && (
              <span className={`due-date ${isOverdue(todo.dueDate, todo.completed) ? 'overdue' : ''}`}>
                {isOverdue(todo.dueDate, todo.completed) ? 'Overdue · ' : 'Due '}
                {formatDate(todo.dueDate)}
              </span>
            )}
            {todo.tags?.map((tag) => (
              <span key={tag} className="tag-chip">
                {tag}
              </span>
            ))}
          </div>

          <div className="detail-actions">
            <button className="btn btn-primary" onClick={startEditing}>
              Edit ticket
            </button>
            <button className="btn btn-danger" onClick={handleDelete}>
              Delete
            </button>
          </div>

          <div className="ticket-footer detail-footer">
            <span>id: #{shortId(todo.id)}</span>
            <span>created {formatDateTime(todo.createdAt)}</span>
            <span>updated {formatDateTime(todo.updatedAt)}</span>
          </div>
        </article>
      )}

      {!loading && todo && editing && (
        <form className="ticket detail-ticket new-ticket-form" onSubmit={handleSave}>
          <div className="field">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              autoFocus
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
          </div>

          <div className="field">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="field">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                value={draft.priority}
                onChange={(e) => setDraft({ ...draft, priority: e.target.value })}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p[0].toUpperCase() + p.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="dueDate">Due date</label>
              <input
                id="dueDate"
                type="date"
                value={draft.dueDate}
                onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="tags">Tags (comma-separated)</label>
            <input
              id="tags"
              value={draft.tags}
              onChange={(e) => setDraft({ ...draft, tags: e.target.value })}
            />
          </div>

          {formErrors.length > 0 && (
            <ul className="field-error">
              {formErrors.map((msg) => (
                <li key={msg}>{msg}</li>
              ))}
            </ul>
          )}

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </main>
  );
}
