import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'todos.json');

// Writes are serialized through this promise chain so two requests
// arriving close together can't race and clobber each other's changes
// (the classic "read file A, read file A, write A, write A -> lost update"
// bug you get with naive concurrent file I/O).
let writeQueue = Promise.resolve();

async function ensureDataFile() {
  await mkdir(DATA_DIR, { recursive: true });
  try {
    await readFile(DATA_FILE, 'utf-8');
  } catch (err) {
    if (err.code === 'ENOENT') {
      await writeFile(DATA_FILE, JSON.stringify([], null, 2));
    } else {
      throw err;
    }
  }
}

export async function readTodos() {
  await ensureDataFile();
  const raw = await readFile(DATA_FILE, 'utf-8');
  return JSON.parse(raw);
}

export function writeTodos(todos) {
  writeQueue = writeQueue.then(() =>
    writeFile(DATA_FILE, JSON.stringify(todos, null, 2))
  );
  return writeQueue;
}

/**
 * NOTE on swapping in a real database later:
 * Every route in routes/todos.js only ever calls readTodos()/writeTodos().
 * To move to SQLite/Postgres/Mongo, this file is the only one that needs
 * to change — re-implement these two functions against the new store and
 * the rest of the API keeps working unmodified.
 */
