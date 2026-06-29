import { useEffect, useMemo, useState, useCallback } from 'react';
import { api } from '../shared/api.js';
import { formatDate, isOverdue, shortId } from '../shared/format.js';

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
];

const PRIORITIES = ['low', 'medium', 'high'];

const emptyDraft = {
  title: '',
  description: '',
  priority: 'medium',
  dueDate: '',
  tags: '',
};

export default function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('createdAt');

  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [formErrors, setFormErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const loadTodos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { sort };
      if (status === 'active') params.completed = 'false';
      if (status === 'completed') params.completed = 'true';
      if (search.trim()) params.search = search.trim();

      const data = await api.list(params);
      setTodos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [status, search, sort]);

  // Re-fetch whenever filters change. The search box is debounced so we
  // don't fire a request on every keystroke.
  useEffect(() => {
    const t = setTimeout(loadTodos, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [loadTodos, search]);

  const activeCount = useMemo(
    () => todos.filter((t) => !t.completed).length,
    [todos]
  );

  async function handleToggle(todo) {
    // optimistic update so the checkbox feels instant
    setTodos((prev) =>
      prev.map((t) => (t.id === todo.id ? { ...t, completed: !t.completed } : t))
    );
    try {
      await api.patch(todo.id, { completed: !todo.completed });
    } catch (err) {
      setError(err.message);
      loadTodos(); // resync on failure
    }
  }

  async function handleDelete(todo) {
    if (!window.confirm(`Delete "${todo.title}"? This can't be undone.`)) return;
    setTodos((prev) => prev.filter((t) => t.id !== todo.id));
    try {
      await api.remove(todo.id);
    } catch (err) {
      setError(err.message);
      loadTodos();
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormErrors([]);

    if (!draft.title.trim()) {
      setFormErrors(['Title is required.']);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: draft.title.trim(),
        description: draft.description.trim(),
        priority: draft.priority,
        dueDate: draft.dueDate || null,
        tags: draft.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      };
      await api.create(payload);
      setDraft(emptyDraft);
      setShowForm(false);
      loadTodos();
    } catch (err) {
      setFormErrors(err.details?.errors || [err.message]);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page">
      <p className="eyebrow">Task queue</p>
      <h1 className="page-title">Todo Tickets</h1>
      <p className="page-subtitle">
        {loading
          ? 'Loading…'
          : `${activeCount} open, ${todos.length - activeCount} done · ${todos.length} total`}
      </p>

      {error && <div className="error-banner">⚠ {error}</div>}

      <section className="toolbar">
        <div className="status-pills" role="tablist" aria-label="Filter by status">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              role="tab"
              aria-selected={status === f.value}
              className={`pill ${status === f.value ? 'pill-active' : ''}`}
              onClick={() => setStatus(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <input
          type="search"
          className="search-input"
          placeholder="Search tickets…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search todos"
        />

        <select
          className="sort-select"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          aria-label="Sort todos"
        >
          <option value="createdAt">Newest first</option>
          <option value="dueDate">Due date</option>
          <option value="priority">Priority</option>
        </select>
      </section>

      {!showForm && (
        <button className="btn btn-primary new-ticket-btn" onClick={() => setShowForm(true)}>
          + New ticket
        </button>
      )}

      {showForm && (
        <form className="ticket new-ticket-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              autoFocus
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="What needs doing?"
            />
          </div>

          <div className="field">
            <label htmlFor="description">Description (optional)</label>
            <textarea
              id="description"
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              placeholder="Any extra detail…"
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
              <label htmlFor="dueDate">Due date (optional)</label>
              <input
                id="dueDate"
                type="date"
                value={draft.dueDate}
                onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="tags">Tags (optional, comma-separated)</label>
            <input
              id="tags"
              value={draft.tags}
              onChange={(e) => setDraft({ ...draft, tags: e.target.value })}
              placeholder="design, backend"
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
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : 'Create ticket'}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setShowForm(false);
                setDraft(emptyDraft);
                setFormErrors([]);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <section className="ticket-list">
        {loading && <div className="loading-state">Loading tickets…</div>}

        {!loading && todos.length === 0 && (
          <div className="empty-state">
            {search || status !== 'all'
              ? 'No tickets match these filters.'
              : 'No tickets yet — create your first one above.'}
          </div>
        )}

        {!loading &&
          todos.map((todo) => {
            const overdue = isOverdue(todo.dueDate, todo.completed);
            return (
              <a
                key={todo.id}
                href={`/todo.html?id=${todo.id}`}
                className={`ticket ticket-link priority-${todo.priority} ${
                  todo.completed ? 'is-completed' : ''
                }`}
              >
                <span className="ticket-stamp">{todo.priority}</span>

                <div className="ticket-main-row">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleToggle(todo);
                    }}
                    aria-label={`Mark "${todo.title}" as ${
                      todo.completed ? 'active' : 'completed'
                    }`}
                  />
                  <span className={`ticket-title ${todo.completed ? 'strike' : ''}`}>
                    {todo.title}
                  </span>
                </div>

                {todo.description && (
                  <p className="ticket-description">{todo.description}</p>
                )}

                <div className="ticket-meta-row">
                  {todo.dueDate && (
                    <span className={`due-date ${overdue ? 'overdue' : ''}`}>
                      {overdue ? 'Overdue · ' : 'Due '}
                      {formatDate(todo.dueDate)}
                    </span>
                  )}
                  {todo.tags?.map((tag) => (
                    <span key={tag} className="tag-chip">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="ticket-footer">
                  <span>#{shortId(todo.id)}</span>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDelete(todo);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </a>
            );
          })}
      </section>
    </main>
  );
}
