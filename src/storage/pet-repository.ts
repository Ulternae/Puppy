import { petsReducer, type FavoritePet, type Pet } from '../lib/pets.ts';

export type SqlValue = string | number | null;
export type SqlExecutor = {
  execAsync: (sql: string) => Promise<void>;
  runAsync: (sql: string, ...params: SqlValue[]) => Promise<unknown>;
  getAllAsync: <T>(sql: string, ...params: SqlValue[]) => Promise<T[]>;
  getFirstAsync: <T>(sql: string, ...params: SqlValue[]) => Promise<T | null>;
};
export type PetDatabase = SqlExecutor & {
  transaction: <T>(task: (transaction: SqlExecutor) => Promise<T>) => Promise<T>;
};
export type SavedRating = { pet: Pet; favorites: FavoritePet[] };
export type PetRepository = { load: () => Promise<FavoritePet[]>; toggle: (pet: Pet) => Promise<SavedRating> };

export const mascotaSchema = `CREATE TABLE IF NOT EXISTS mascota (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  photo TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 0),
  liked INTEGER NOT NULL CHECK (liked = 1),
  ordenRating INTEGER NOT NULL CHECK (ordenRating > 0)
);`;

type PetRow = Omit<Pet, 'liked'> & { liked: number; ordenRating: number };
const columns = 'id, name, description, photo, rating, liked, ordenRating';
function petFromRow(row: PetRow): Pet {
  return { id: row.id, name: row.name, description: row.description, photo: row.photo, rating: row.rating, liked: true };
}
function fromRow(row: PetRow): FavoritePet {
  return { ...petFromRow(row), lastRatedOrder: row.ordenRating };
}
async function readFavorites(db: SqlExecutor): Promise<FavoritePet[]> {
  const rows = await db.getAllAsync<PetRow>(`SELECT ${columns} FROM mascota ORDER BY ordenRating DESC, id ASC LIMIT 5`);
  return rows.map(fromRow);
}

export function createPetRepository(db: PetDatabase): PetRepository {
  let initialization: Promise<void> | undefined;
  let queue: Promise<unknown> = Promise.resolve();
  function serial<T>(task: () => Promise<T>): Promise<T> {
    const operation = queue.then(task);
    queue = operation.then(() => undefined, () => undefined);
    return operation;
  }
  async function initialize() {
    if (!initialization) {
      initialization = (async () => {
        await db.execAsync('PRAGMA journal_mode = WAL;');
        await db.transaction(async transaction => {
          const version = await transaction.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
          if ((version?.user_version ?? 0) > 1) throw new Error('Unsupported favorites database version');
          if (!version?.user_version) {
            await transaction.execAsync(mascotaSchema);
            await transaction.execAsync('PRAGMA user_version = 1;');
          }
        });
      })().catch(error => { initialization = undefined; throw error; });
    }
    return initialization;
  }
  return {
    load: () => serial(async () => { await initialize(); return readFavorites(db); }),
    toggle: pet => serial(async () => {
      await initialize();
      return db.transaction(async transaction => {
        const row = await transaction.getFirstAsync<PetRow>(`SELECT ${columns} FROM mascota WHERE id = ?`, pet.id);
        const current = row ? petFromRow(row) : pet;
        const changed = petsReducer([current], { type: 'rate', id: current.id })[0];
        if (changed === current) return { pet: current, favorites: await readFavorites(transaction) };
        if (changed.liked) {
          const latest = await transaction.getFirstAsync<{ lastOrder: number }>('SELECT COALESCE(MAX(ordenRating), 0) AS lastOrder FROM mascota');
          const order = (latest?.lastOrder ?? 0) + 1;
          if (!Number.isSafeInteger(order)) throw new Error('Favorites sequence is out of range');
          await transaction.runAsync(`INSERT INTO mascota (${columns}) VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET name = excluded.name, description = excluded.description,
            photo = excluded.photo, rating = excluded.rating, liked = excluded.liked, ordenRating = excluded.ordenRating`,
          changed.id, changed.name, changed.description, changed.photo, changed.rating, 1, order);
          await transaction.execAsync('DELETE FROM mascota WHERE id NOT IN (SELECT id FROM mascota ORDER BY ordenRating DESC, id ASC LIMIT 5)');
        } else {
          await transaction.runAsync('DELETE FROM mascota WHERE id = ?', changed.id);
        }
        return { pet: changed, favorites: await readFavorites(transaction) };
      });
    }),
  };
}
