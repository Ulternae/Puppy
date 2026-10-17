import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync, rmdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createPetRepository } from '../src/storage/pet-repository.ts';
import { initialPets } from '../src/lib/pets.ts';

function database(file = ':memory:') {
  const sql = new DatabaseSync(file);
  let fault = null;
  let closed = false;
  const committedSizes = [];
  function check(operation, query) { if (fault?.(operation, query)) throw new Error('Injected storage failure'); }
  const executor = {
    async execAsync(query) { check('exec', query); sql.exec(query); },
    async runAsync(query, ...params) { check('run', query); return sql.prepare(query).run(...params); },
    async getAllAsync(query, ...params) { check('all', query); return sql.prepare(query).all(...params); },
    async getFirstAsync(query, ...params) { check('first', query); return sql.prepare(query).get(...params) ?? null; },
  };
  const adapter = {
    ...executor,
    async transaction(task) {
      sql.exec('BEGIN IMMEDIATE');
      try {
        const value = await task(executor);
        sql.exec('COMMIT');
        if (sql.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'mascota'").get()) {
          committedSizes.push(sql.prepare('SELECT COUNT(*) AS count FROM mascota').get().count);
        }
        return value;
      } catch (error) { sql.exec('ROLLBACK'); throw error; }
    },
  };
  return { sql, store: createPetRepository(adapter), committedSizes,
    failWhen: next => { fault = next; },
    close() { if (!closed) { sql.close(); closed = true; } },
  };
}

test('SQLite initializes the complete mascota model with no favorites', async t => {
  const db = database(); t.after(() => db.close());
  assert.deepEqual(await db.store.load(), []);
  assert.deepEqual(db.sql.prepare('PRAGMA table_info(mascota)').all().map(column => column.name), ['id', 'name', 'description', 'photo', 'rating', 'liked', 'ordenRating']);
  assert.equal(db.sql.prepare('PRAGMA user_version').get().user_version, 1);
});

test('six ratings keep only the last five database rows and preserve recency', async t => {
  const db = database(); t.after(() => db.close());
  for (const pet of initialPets().slice(0, 6)) await db.store.toggle(pet);
  assert.deepEqual((await db.store.load()).map(pet => pet.id), ['bruno', 'toby', 'nala', 'coco', 'luna']);
  assert.equal(db.sql.prepare('SELECT COUNT(*) AS count FROM mascota').get().count, 5);
  assert.ok(db.committedSizes.every(count => count <= 5));
});

test('a withdrawn bone is removed and re-adding the same pet moves it first without duplicates', async t => {
  const db = database(); t.after(() => db.close());
  const pets = initialPets();
  for (const pet of pets.slice(0, 5)) await db.store.toggle(pet);
  const removed = await db.store.toggle(pets[0]);
  assert.equal(removed.pet.liked, false);
  assert.equal(removed.pet.rating, 12);
  const added = await db.store.toggle(removed.pet);
  assert.equal(added.favorites[0].id, 'milo');
  assert.equal(added.favorites[0].rating, 13);
  const final = await db.store.toggle(pets[5]);
  assert.deepEqual(final.favorites.map(pet => pet.id), ['bruno', 'milo', 'toby', 'nala', 'coco']);
  assert.equal(db.sql.prepare("SELECT COUNT(*) AS count FROM mascota WHERE id = 'milo'").get().count, 1);
});

test('serialized concurrent calls never exceed five rows or lose the final operation', async t => {
  const db = database(); t.after(() => db.close());
  await Promise.all(initialPets().map(pet => db.store.toggle(pet)));
  assert.deepEqual((await db.store.load()).map(pet => pet.id), ['lola', 'simon', 'kira', 'rocky', 'bruno']);
  assert.ok(db.committedSizes.every(count => count <= 5));
});

test('repeated queued calls use database state instead of adding multiple personal votes', async t => {
  const db = database(); t.after(() => db.close());
  const milo = initialPets()[0];
  const results = await Promise.all([db.store.toggle(milo), db.store.toggle(milo), db.store.toggle(milo)]);
  assert.deepEqual(results.map(result => result.pet.rating), [13, 12, 13]);
  assert.equal((await db.store.load()).length, 1);
});

test('favorites survive closing and reopening the actual database file with all model fields', async t => {
  const directory = mkdtempSync(join(tmpdir(), 'puppy-favorites-'));
  const file = join(directory, 'favorites.db');
  const handles = [];
  t.after(() => {
    for (const db of handles) db.close();
    for (const suffix of ['', '-wal', '-shm']) rmSync(file + suffix, { force: true });
    rmdirSync(directory);
  });
  const first = database(file); handles.push(first);
  const original = { ...initialPets()[0], name: "Milo O'Connor", description: "Paseo; 'hola' y un huesito" };
  await first.store.toggle(original);
  await first.store.toggle(initialPets()[1]);
  const expected = await first.store.load();
  first.close();
  const reopened = database(file); handles.push(reopened);
  assert.deepEqual(await reopened.store.load(), expected);
  assert.equal(expected[1].name, original.name);
  assert.equal(expected[1].description, original.description);
  assert.equal(expected[1].photo, original.photo);
  assert.equal(expected[1].liked, true);
});

test('a failure after inserting the sixth pet rolls back insertion and pruning together', async t => {
  const db = database(); t.after(() => db.close());
  for (const pet of initialPets().slice(0, 5)) await db.store.toggle(pet);
  const before = await db.store.load();
  db.failWhen((operation, query) => operation === 'exec' && query.startsWith('DELETE FROM mascota WHERE id NOT IN'));
  await assert.rejects(db.store.toggle(initialPets()[5]), /Injected storage failure/);
  db.failWhen(null);
  assert.deepEqual(await db.store.load(), before);
  assert.equal(db.sql.prepare('SELECT COUNT(*) AS count FROM mascota').get().count, 5);
  assert.equal((await db.store.toggle(initialPets()[5])).favorites[0].id, 'bruno');
});

test('a final read failure rolls back the write and leaves the previous saved favorites intact', async t => {
  const db = database(); t.after(() => db.close());
  await db.store.toggle(initialPets()[0]);
  const before = await db.store.load();
  db.failWhen((operation, query) => operation === 'all' && query.includes('FROM mascota'));
  await assert.rejects(db.store.toggle(initialPets()[1]), /Injected storage failure/);
  db.failWhen(null);
  assert.deepEqual(await db.store.load(), before);
});

test('initialization can be retried after a temporary storage failure', async t => {
  const db = database(); t.after(() => db.close());
  db.failWhen((operation, query) => operation === 'exec' && query.includes('CREATE TABLE'));
  await assert.rejects(db.store.load(), /Injected storage failure/);
  db.failWhen(null);
  assert.deepEqual(await db.store.load(), []);
  assert.equal(db.sql.prepare('PRAGMA user_version').get().user_version, 1);
});

test('an unsupported future database version is preserved instead of resetting user data', async t => {
  const db = database(); t.after(() => db.close());
  db.sql.exec('PRAGMA user_version = 2; CREATE TABLE preserved (value TEXT); INSERT INTO preserved VALUES (\'keep\');');
  await assert.rejects(db.store.load(), /Unsupported favorites database version/);
  assert.equal(db.sql.prepare('SELECT value FROM preserved').get().value, 'keep');
});
