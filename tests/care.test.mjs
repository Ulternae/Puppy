import test from 'node:test';
import assert from 'node:assert/strict';
import { careReducer, dayAfter, localDay, sortedReminders, validateReminder } from '../src/lib/care.ts';

const reminder = { id: 'a', title: 'Paseo', date: '2026-10-19', time: '10:00', notes: '', done: false };
const initial = () => ({ day: '2026-10-17', completed: ['walk'], reminders: [{ ...reminder }] });
test('routine toggles are reversible and do not change other routines or the input state', () => {
  const state = initial();
  const changed = careReducer(state, { type: 'routine', id: 'food' });
  assert.deepEqual(changed.completed, ['walk', 'food']);
  assert.deepEqual(state.completed, ['walk']);
  assert.deepEqual(careReducer(changed, { type: 'routine', id: 'food' }).completed, ['walk']);
});
test('a new local day resets rituals while preserving the agenda', () => {
  const state = initial();
  assert.equal(careReducer(state, { type: 'day', day: state.day }), state);
  const tomorrow = careReducer(state, { type: 'day', day: '2026-10-18' });
  assert.deepEqual(tomorrow.completed, []);
  assert.deepEqual(tomorrow.reminders, state.reminders);
});
test('completing and reopening a reminder preserves its data', () => {
  const state = initial();
  const done = careReducer(state, { type: 'reminder', id: 'a' });
  assert.equal(done.reminders[0].done, true);
  assert.deepEqual(careReducer(done, { type: 'reminder', id: 'a' }), state);
});
test('adding a reminder rejects repeated identifiers and leaves earlier records intact', () => {
  const state = initial();
  assert.equal(careReducer(state, { type: 'add', reminder }), state);
  const added = careReducer(state, { type: 'add', reminder: { ...reminder, id: 'b' } });
  assert.equal(added.reminders.length, 2);
  assert.equal(state.reminders.length, 1);
});
test('agenda sorts pending items chronologically without mutating the source', () => {
  const rows = [{ ...reminder, id: 'done', done: true }, { ...reminder, id: 'later', date: '2026-10-20' }, reminder];
  assert.deepEqual(sortedReminders(rows).map(r => r.id), ['a', 'later', 'done']);
  assert.equal(rows[0].id, 'done');
});
test('invalid calendar dates, past days, blank titles and invalid times are rejected', () => {
  for (const draft of [
    { title: ' ', date: '19/10/2026', time: '10:00', notes: '' },
    { title: 'Paseo', date: '31/02/2027', time: '10:00', notes: '' },
    { title: 'Paseo', date: '16/10/2026', time: '10:00', notes: '' },
    { title: 'Paseo', date: '19/10/2026', time: '24:00', notes: '' },
  ]) assert.equal(validateReminder(draft, '2026-10-17').ok, false);
});
test('validated fields are trimmed and converted from display date to stable local date', () => {
  const result = validateReminder({ title: '  Paseo  ', date: '19/10/2026', time: ' 10:00 ', notes: '  Junto al parque  ' }, '2026-10-17');
  assert.deepEqual(result, { ok: true, value: { title: 'Paseo', date: '2026-10-19', time: '10:00', notes: 'Junto al parque', done: false } });
});
test('calendar helpers handle year transitions in local time', () => {
  assert.equal(localDay(new Date(2026, 11, 31, 23, 59)), '2026-12-31');
  assert.equal(dayAfter(2, new Date(2026, 11, 31, 12)), '2027-01-02');
});
