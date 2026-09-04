import { getDatabase } from './database';

export type ListRow = {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  item_count?: number;
};

export type ListItemRow = {
  id: number;
  list_id: number;
  title: string;
  completed: number;
  created_at: string;
  updated_at: string;
};

function requireNonEmptyName(name: string, label: string): string {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error(`${label} cannot be empty`);
  }
  return trimmed;
}

export async function getLists(): Promise<ListRow[]> {
  const db = await getDatabase();
  return db.getAllAsync<ListRow>(`
    SELECT
      l.id,
      l.name,
      l.created_at,
      l.updated_at,
      (
        SELECT COUNT(*) FROM list_items li WHERE li.list_id = l.id
      ) AS item_count
    FROM lists l
    ORDER BY l.updated_at DESC, l.id DESC
  `);
}

export async function getListById(id: number): Promise<ListRow | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<ListRow>(
    `SELECT id, name, created_at, updated_at FROM lists WHERE id = ?`,
    [id],
  );
  return row ?? null;
}

export async function createList(name: string): Promise<ListRow> {
  const trimmed = requireNonEmptyName(name, 'List name');
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO lists (name) VALUES (?)`,
    [trimmed],
  );
  const list = await getListById(Number(result.lastInsertRowId));
  if (!list) {
    throw new Error('Failed to create list');
  }
  return list;
}

export async function renameList(id: number, name: string): Promise<void> {
  const trimmed = requireNonEmptyName(name, 'List name');
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE lists SET name = ?, updated_at = datetime('now') WHERE id = ?`,
    [trimmed, id],
  );
}

export async function deleteList(id: number): Promise<void> {
  const db = await getDatabase();
  // CASCADE deletes items via FK when foreign_keys are on
  await db.runAsync(`DELETE FROM lists WHERE id = ?`, [id]);
}

export async function getItemsForList(listId: number): Promise<ListItemRow[]> {
  const db = await getDatabase();
  return db.getAllAsync<ListItemRow>(
    `
    SELECT id, list_id, title, completed, created_at, updated_at
    FROM list_items
    WHERE list_id = ?
    ORDER BY completed ASC, updated_at DESC, id DESC
    `,
    [listId],
  );
}

export async function addItem(listId: number, title: string): Promise<ListItemRow> {
  const trimmed = requireNonEmptyName(title, 'Item title');
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO list_items (list_id, title) VALUES (?, ?)`,
    [listId, trimmed],
  );
  await db.runAsync(
    `UPDATE lists SET updated_at = datetime('now') WHERE id = ?`,
    [listId],
  );
  const item = await db.getFirstAsync<ListItemRow>(
    `SELECT id, list_id, title, completed, created_at, updated_at FROM list_items WHERE id = ?`,
    [Number(result.lastInsertRowId)],
  );
  if (!item) {
    throw new Error('Failed to add item');
  }
  return item;
}

export async function editItem(id: number, title: string): Promise<void> {
  const trimmed = requireNonEmptyName(title, 'Item title');
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE list_items SET title = ?, updated_at = datetime('now') WHERE id = ?`,
    [trimmed, id],
  );
}

export async function deleteItem(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(`DELETE FROM list_items WHERE id = ?`, [id]);
}

export async function toggleItemCompleted(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `
    UPDATE list_items
    SET completed = CASE WHEN completed = 0 THEN 1 ELSE 0 END,
        updated_at = datetime('now')
    WHERE id = ?
    `,
    [id],
  );
}
