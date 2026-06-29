import { Router } from 'express';
import { randomUUID } from 'crypto';
import { readTodos, writeTodos } from '../utils/db.js';

const router = Router();

const VALID_PRIORITIES = ['low', 'medium', 'high'];

/**
 * Validates a request body for creating/updating a todo.
 * @param {object} body
 * @param {{ partial?: boolean }} options - when partial is true (PATCH),
 *   fields that are simply absent are not required.
 */
function validateTodoInput(body, { partial = false } = {}) {
  const errors = [];

  if (!partial || body.title !== undefined) {
    if (typeof body.title !== 'string' || body.title.trim().length === 0) {
      errors.push('title is required and must be a non-empty string');
    }
  }
  if (body.priority !== undefined && !VALID_PRIORITIES.includes(body.priority)) {
    errors.push(`priority must be one of: ${VALID_PRIORITIES.join(', ')}`);
  }
  if (
    body.dueDate !== undefined &&
    body.dueDate !== null &&
    Number.isNaN(Date.parse(body.dueDate))
  ) {
    errors.push('dueDate must be a valid date string or null');
  }
  if (body.completed !== undefined && typeof body.completed !== 'boolean') {
    errors.push('completed must be a boolean');
  }
  if (body.tags !== undefined && !Array.isArray(body.tags)) {
    errors.push('tags must be an array of strings');
  }

  return errors;
}

/**
 * GET /api/todos
 * Optional query params:
 *   ?completed=true|false  - filter by completion state
 *   ?priority=low|medium|high
 *   ?search=text           - case-insensitive match on title/description
 *   ?sort=dueDate|priority|createdAt
 */
router.get('/', async (req, res, next) => {
  try {
    let todos = await readTodos();
    const { completed, priority, search, sort } = req.query;

    if (completed !== undefined) {
      const want = completed === 'true';
      todos = todos.filter((t) => t.completed === want);
    }
    if (priority) {
      todos = todos.filter((t) => t.priority === priority);
    }
    if (search) {
      const q = String(search).toLowerCase();
      todos = todos.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description || '').toLowerCase().includes(q)
      );
    }

    if (sort === 'dueDate') {
      todos = [...todos].sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1; // no due date sorts last
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
    } else if (sort === 'priority') {
      const rank = { high: 0, medium: 1, low: 2 };
      todos = [...todos].sort((a, b) => rank[a.priority] - rank[b.priority]);
    } else if (sort === 'createdAt') {
      todos = [...todos].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    }

    res.json(todos);
  } catch (err) {
    next(err);
  }
});

/** GET /api/todos/:id */
router.get('/:id', async (req, res, next) => {
  try {
    const todos = await readTodos();
    const todo = todos.find((t) => t.id === req.params.id);
    if (!todo) {
      return res
        .status(404)
        .json({ error: `Todo with id "${req.params.id}" not found` });
    }
    res.json(todo);
  } catch (err) {
    next(err);
  }
});

/** POST /api/todos */
router.post('/', async (req, res, next) => {
  try {
    const errors = validateTodoInput(req.body);
    if (errors.length) return res.status(400).json({ errors });

    const now = new Date().toISOString();
    const todo = {
      id: randomUUID(),
      title: req.body.title.trim(),
      description: (req.body.description || '').trim(),
      completed: false,
      priority: req.body.priority || 'medium',
      dueDate: req.body.dueDate || null,
      tags: req.body.tags || [],
      createdAt: now,
      updatedAt: now,
    };

    const todos = await readTodos();
    todos.push(todo);
    await writeTodos(todos);

    res.status(201).json(todo);
  } catch (err) {
    next(err);
  }
});

/** PUT /api/todos/:id  - full update of editable fields */
router.put('/:id', async (req, res, next) => {
  try {
    const errors = validateTodoInput(req.body);
    if (errors.length) return res.status(400).json({ errors });

    const todos = await readTodos();
    const index = todos.findIndex((t) => t.id === req.params.id);
    if (index === -1) {
      return res
        .status(404)
        .json({ error: `Todo with id "${req.params.id}" not found` });
    }

    const existing = todos[index];
    const updated = {
      ...existing,
      title: req.body.title.trim(),
      description:
        req.body.description !== undefined
          ? req.body.description.trim()
          : existing.description,
      completed:
        req.body.completed !== undefined
          ? req.body.completed
          : existing.completed,
      priority: req.body.priority || existing.priority,
      dueDate:
        req.body.dueDate !== undefined ? req.body.dueDate : existing.dueDate,
      tags: req.body.tags || existing.tags,
      updatedAt: new Date().toISOString(),
    };

    todos[index] = updated;
    await writeTodos(todos);

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

/** PATCH /api/todos/:id - partial update (e.g. just toggling `completed`) */
router.patch('/:id', async (req, res, next) => {
  try {
    const errors = validateTodoInput(req.body, { partial: true });
    if (errors.length) return res.status(400).json({ errors });

    const todos = await readTodos();
    const index = todos.findIndex((t) => t.id === req.params.id);
    if (index === -1) {
      return res
        .status(404)
        .json({ error: `Todo with id "${req.params.id}" not found` });
    }

    todos[index] = {
      ...todos[index],
      ...req.body,
      id: todos[index].id, // id is never overwritable via body
      updatedAt: new Date().toISOString(),
    };

    await writeTodos(todos);
    res.json(todos[index]);
  } catch (err) {
    next(err);
  }
});

/** DELETE /api/todos/:id */
router.delete('/:id', async (req, res, next) => {
  try {
    const todos = await readTodos();
    const index = todos.findIndex((t) => t.id === req.params.id);
    if (index === -1) {
      return res
        .status(404)
        .json({ error: `Todo with id "${req.params.id}" not found` });
    }

    const [deleted] = todos.splice(index, 1);
    await writeTodos(todos);

    res.json(deleted);
  } catch (err) {
    next(err);
  }
});

export default router;
