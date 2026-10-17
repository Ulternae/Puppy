import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { profilePhotos, profileRating } from '../src/lib/profile.ts';

test('the profile gallery contains six distinct photo entries with 83 total bones', () => {
  assert.equal(profilePhotos.length, 6);
  assert.equal(new Set(profilePhotos.map(photo => photo.id)).size, 6);
  assert.equal(new Set(profilePhotos.map(photo => photo.source)).size, 6);
  assert.equal(profileRating(), 83);
  assert.equal(profileRating([]), 0);
  for (const photo of profilePhotos) {
    assert.ok(photo.title);
    assert.ok(Number.isSafeInteger(photo.rating) && photo.rating >= 0);
  }
});

test('every gallery source has a local image within the optimized photograph budget', () => {
  const hashes = new Set();
  for (const source of new Set(profilePhotos.map(photo => photo.source))) {
    const file = new URL(`../assets/gallery/milo-${source}.jpg`, import.meta.url);
    assert.ok(existsSync(file));
    assert.ok(statSync(file).size <= 256 * 1024);
    hashes.add(createHash('sha256').update(readFileSync(file)).digest('hex'));
  }
  assert.equal(hashes.size, 6, 'The six gallery photographs must contain distinct images');
});
