import test from 'node:test';
import assert from 'node:assert/strict';
import { calendarDate, emptyContact, initialRegistration, parseBirthDate, registrationReducer, validateContact } from '../src/lib/registration.ts';

const today = '2026-10-17';
const contact = {
  fullName: 'Daniel Ríos', birthDate: '1998-08-12', phone: '+57 300 555 0142',
  email: 'daniel.rios@example.com', description: 'Me gusta salir a caminar con Milo.',
};
function fill(state, values) {
  return Object.entries(values).reduce((result, [field, value]) => registrationReducer(result, { type: 'change', field, value }), state);
}

test('a new registration starts with five empty fields and no confirmation', () => {
  assert.deepEqual(initialRegistration(), { draft: emptyContact(), confirmed: null, savedContact: null, errors: {} });
  assert.equal(Object.keys(emptyContact()).length, 5);
});
test('review preserves all five values without reformatting the phone or text', () => {
  const draft = { ...contact, phone: '(300) 555-0142', description: 'Primera línea.\nSegunda línea.' };
  const filled = fill(initialRegistration(), draft);
  const reviewed = registrationReducer(filled, { type: 'review', today });
  assert.deepEqual(reviewed.confirmed, draft);
  assert.deepEqual(reviewed.draft, draft);
  assert.notEqual(reviewed.confirmed, reviewed.draft);
  assert.equal(filled.confirmed, null);
});
test('editing only the phone and reviewing again keeps the other four fields intact', () => {
  const first = registrationReducer(fill(initialRegistration(), contact), { type: 'review', today });
  const edited = registrationReducer(first, { type: 'change', field: 'phone', value: '301 555 0188' });
  assert.deepEqual(edited.confirmed, contact);
  const second = registrationReducer(edited, { type: 'review', today });
  assert.deepEqual(second.confirmed, { ...contact, phone: '301 555 0188' });
  assert.deepEqual(first.draft, contact);
});
test('an invalid email blocks confirmation and preserves every field for correction', () => {
  const draft = { ...contact, email: 'daniel@' };
  const blocked = registrationReducer(fill(initialRegistration(), draft), { type: 'review', today });
  assert.equal(blocked.confirmed, null);
  assert.deepEqual(blocked.draft, draft);
  assert.ok(blocked.errors.email);
  const fixed = registrationReducer(blocked, { type: 'change', field: 'email', value: contact.email });
  assert.equal(fixed.errors.email, undefined);
  assert.deepEqual(registrationReducer(fixed, { type: 'review', today }).confirmed, contact);
});
test('invalid edits cannot replace a previously confirmed snapshot', () => {
  const first = registrationReducer(fill(initialRegistration(), contact), { type: 'review', today });
  const edited = registrationReducer(first, { type: 'change', field: 'description', value: ' ' });
  const blocked = registrationReducer(edited, { type: 'review', today });
  assert.deepEqual(blocked.confirmed, contact);
  assert.equal(blocked.draft.description, ' ');
  assert.ok(blocked.errors.description);
});
test('accepting a contact keeps a session snapshot that can be viewed after an unconfirmed edit', () => {
  const reviewed = registrationReducer(fill(initialRegistration(), contact), { type: 'review', today });
  assert.equal(reviewed.savedContact, null);
  const accepted = registrationReducer(reviewed, { type: 'accept' });
  assert.deepEqual(accepted.savedContact, contact);
  const edited = registrationReducer(accepted, { type: 'change', field: 'phone', value: '301 555 0188' });
  const viewed = registrationReducer(edited, { type: 'view' });
  assert.deepEqual(viewed.draft, contact);
  assert.equal(viewed.confirmed, viewed.savedContact);
  assert.equal(edited.draft.phone, '301 555 0188');
  const changed = registrationReducer(edited, { type: 'review', today });
  assert.notEqual(changed.confirmed, changed.savedContact);
  const saved = registrationReducer(changed, { type: 'accept' });
  assert.equal(saved.savedContact.phone, '301 555 0188');
});
test('birth dates reject nonexistent, future and out-of-range calendar days', () => {
  for (const birthDate of ['', '1998-02-30', '2025-02-29', '17/10/2000', '2026-10-18', '1899-12-31']) {
    assert.ok(validateContact({ ...contact, birthDate }, today).birthDate, birthDate);
  }
  assert.equal(validateContact({ ...contact, birthDate: today }, today).birthDate, undefined);
  assert.equal(validateContact({ ...contact, birthDate: '2000-02-29' }, today).birthDate, undefined);
});
test('calendar storage round-trips local dates without converting them to UTC', () => {
  assert.equal(calendarDate(new Date(1998, 7, 12, 0, 1)), contact.birthDate);
  assert.equal(calendarDate(new Date(1998, 7, 12, 23, 59)), contact.birthDate);
  const date = parseBirthDate(contact.birthDate);
  assert.ok(date);
  assert.equal(calendarDate(date), contact.birthDate);
});
test('required fields, lengths and phone formats have recoverable validation', () => {
  assert.equal(Object.keys(validateContact(emptyContact(), today)).length, 5);
  for (const phone of ['123', '1234567890123456', 'phone number', '300+5550142']) {
    assert.ok(validateContact({ ...contact, phone }, today).phone, phone);
  }
  assert.deepEqual(validateContact(contact, today), {});
  assert.ok(validateContact({ ...contact, fullName: 'a'.repeat(101) }, today).fullName);
  assert.ok(validateContact({ ...contact, description: 'a'.repeat(501) }, today).description);
});
