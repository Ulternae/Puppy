import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, statSync } from 'node:fs';
import { favoritePets, initialPets, initialPetsState, petsReducer, petsStateReducer } from '../src/lib/pets.ts';

test('the catalog starts with distinct stable identifiers and independent session records', () => {
  const first = initialPets();
  const second = initialPets();
  assert.equal(new Set(first.map(pet => pet.id)).size, first.length);
  assert.equal(first.length, 10);
  for (const [index, pet] of first.entries()) {
    assert.ok(pet.name);
    assert.ok(pet.photo);
    assert.ok(Number.isSafeInteger(pet.rating) && pet.rating >= 0);
    assert.equal(pet.liked, false);
    assert.notEqual(pet, second[index]);
    assert.ok(existsSync(new URL(`../assets/pets/${pet.photo}.jpg`, import.meta.url)), `Missing photograph: ${pet.photo}`);
  }
});

test('catalog photographs and favorite thumbnails stay within their size budgets', () => {
  for (const pet of initialPets()) {
    const full = statSync(new URL(`../assets/pets/${pet.photo}.jpg`, import.meta.url));
    const thumbnail = statSync(new URL(`../assets/pets/thumbnails/${pet.photo}.jpg`, import.meta.url));
    assert.ok(full.size > 0 && full.size <= 256 * 1024, `${pet.photo}: catalog photograph is too large`);
    assert.ok(thumbnail.size > 0 && thumbnail.size <= 32 * 1024, `${pet.photo}: favorite thumbnail is too large`);
  }
});

test('a celebration starts on adding a bone and is cancelled when withdrawing that bone', () => {
  const start = initialPetsState();
  const pet = { ...start.pets[0], liked: true, rating: 13 };
  const liked = petsStateReducer(start, { type: 'saved', pet, favorites: [{ ...pet, lastRatedOrder: 1 }] });
  assert.deepEqual(liked.celebration, { id: 1, petId: 'milo' });
  const unliked = petsStateReducer(liked, { type: 'saved', pet: start.pets[0], favorites: [] });
  assert.equal(unliked.celebration, null);
  assert.equal(unliked.pets[0].rating, 12);
  assert.equal(petsStateReducer(start, { type: 'celebrationFinished', id: 99 }), start);
});

test('completion of an earlier animation cannot remove a newer celebration or its vote', () => {
  const initial = initialPetsState();
  const milo = { ...initial.pets[0], liked: true, rating: 13, lastRatedOrder: 1 };
  const luna = { ...initial.pets[1], liked: true, rating: 9, lastRatedOrder: 2 };
  const first = petsStateReducer(initial, { type: 'saved', pet: milo, favorites: [milo] });
  const second = petsStateReducer(first, { type: 'saved', pet: luna, favorites: [luna, milo] });
  assert.equal(second.celebration.id, 2);
  assert.equal(petsStateReducer(second, { type: 'celebrationFinished', id: 1 }), second);
  const done = petsStateReducer(second, { type: 'celebrationFinished', id: 2 });
  assert.equal(done.celebration, null);
  assert.equal(done.pets, second.pets);
  assert.equal(done.pets[0].liked, true);
  assert.equal(done.pets[1].liked, true);
});

test('a bone increments only the selected pet without changing earlier state or list order', () => {
  const initial = initialPets();
  const rated = petsReducer(initial, { type: 'rate', id: 'milo' });
  assert.equal(rated[0].rating, 13);
  assert.equal(rated[0].liked, true);
  assert.equal(initial[0].rating, 12);
  assert.deepEqual(rated.map(pet => pet.id), initial.map(pet => pet.id));
  for (let index = 1; index < initial.length; index++) assert.equal(rated[index], initial[index]);
});

test('repeated taps toggle one personal bone instead of accumulating unlimited votes', () => {
  let pets = initialPets();
  for (let count = 0; count < 25; count++) pets = petsReducer(pets, { type: 'rate', id: 'luna' });
  assert.equal(pets.find(pet => pet.id === 'luna').rating, 9);
  assert.equal(pets.find(pet => pet.id === 'luna').liked, true);
  assert.equal(pets.find(pet => pet.id === 'milo').rating, 12);
  pets = petsReducer(pets, { type: 'rate', id: 'luna' });
  assert.equal(pets.find(pet => pet.id === 'luna').rating, 8);
  assert.equal(pets.find(pet => pet.id === 'luna').liked, false);
});

test('withdrawing a bone restores the original counter including a zero-vote pet', () => {
  const original = initialPets();
  const liked = petsReducer(original, { type: 'rate', id: 'bruno' });
  assert.equal(liked.find(pet => pet.id === 'bruno').rating, 1);
  assert.deepEqual(petsReducer(liked, { type: 'rate', id: 'bruno' }), original);
});

test('favorites start empty and select at most five pets by recency rather than score', () => {
  assert.deepEqual(initialPetsState().favorites, []);
  const pets = initialPets().slice(0, 6).map((pet, index) => ({ ...pet, liked: true, lastRatedOrder: index + 1 }));
  const favorites = favoritePets(pets);
  assert.deepEqual(favorites.map(pet => pet.id), ['bruno', 'toby', 'nala', 'coco', 'luna']);
  assert.equal(favorites.length, 5);
  assert.equal(new Set(favorites.map(pet => pet.id)).size, 5);
});

test('the favorites screen reads the same updated ratings as the catalog', () => {
  const pet = { ...initialPets()[3], liked: true, rating: 16, lastRatedOrder: 1 };
  const state = petsStateReducer(initialPetsState(), { type: 'saved', pet, favorites: [pet] });
  const favorite = state.favorites.find(pet => pet.id === 'nala');
  assert.equal(favorite.rating, 16);
  assert.equal(favorite.liked, true);
  assert.equal(state.pets.find(pet => pet.id === 'nala').rating, favorite.rating);
});

test('reopening restores all persisted pet fields without replaying confetti', () => {
  const pet = { ...initialPets()[2], name: 'Coco', liked: true, rating: 7, lastRatedOrder: 3 };
  const restored = petsStateReducer(initialPetsState(), { type: 'hydrate', favorites: [pet] });
  assert.equal(restored.celebration, null);
  assert.deepEqual(restored.favorites, [pet]);
  assert.equal(restored.pets[2].rating, 7);
  assert.equal(restored.pets[2].liked, true);
  assert.equal(restored.pets[0].liked, false);
});

test('unknown identifiers do not affect ratings and a new session starts with original values', () => {
  const pets = initialPets();
  assert.equal(petsReducer(pets, { type: 'rate', id: 'missing' }), pets);
  const rated = petsReducer(pets, { type: 'rate', id: 'milo' });
  assert.equal(rated[0].rating, 13);
  assert.equal(initialPets()[0].rating, 12);
});
