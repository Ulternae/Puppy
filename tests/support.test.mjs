import test from 'node:test';
import assert from 'node:assert/strict';
import { commentCopy, commentFeedback, createCommentSender, emptyComment, prepareComment, supportEmail, validateComment } from '../src/lib/support.ts';

const draft = { name: 'Dani', email: 'dani@example.com', message: 'Me gusta la galería de Milo.' };

test('required or invalid contact fields block opening the mail client', async () => {
  let calls = 0;
  const send = createCommentSender({ platform: 'android', isAvailable: async () => { calls++; return true; }, compose: async () => { calls++; return { status: 'sent' }; } });
  assert.equal(Object.keys(validateComment(emptyComment())).length, 3);
  const result = await send({ ...draft, email: 'dani@' });
  assert.equal(result.kind, 'invalid');
  assert.ok(result.errors.email);
  assert.equal(calls, 0);
  assert.ok(validateComment({ ...draft, message: ' '.repeat(3) }).message);
  assert.ok(validateComment({ ...draft, message: 'x'.repeat(2001) }).message);
});

test('the prepared mail includes the destination and all fields as plain text without changing the draft', () => {
  const original = { name: ' Dani ', email: ' dani@example.com ', message: ' Una línea.\nOtra línea. ' };
  assert.deepEqual(prepareComment(original), {
    recipients: [supportEmail], subject: 'Comentario sobre Puppy', body: 'Nombre: Dani\nCorreo: dani@example.com\n\nUna línea.\nOtra línea.', isHtml: false,
  });
  assert.equal(original.message, ' Una línea.\nOtra línea. ');
  const copy = commentCopy(original);
  assert.ok(copy.includes(supportEmail));
  assert.ok(copy.includes('dani@example.com'));
  assert.ok(copy.endsWith('Una línea.\nOtra línea.'));
});

test('an unavailable mail client produces a recoverable result without calling compose', async () => {
  let opened = false;
  const send = createCommentSender({ platform: 'ios', isAvailable: async () => false, compose: async () => { opened = true; return { status: 'sent' }; } });
  assert.deepEqual(await send(draft), { kind: 'unavailable' });
  assert.equal(opened, false);
  assert.deepEqual(draft, { name: 'Dani', email: 'dani@example.com', message: 'Me gusta la galería de Milo.' });
});

test('Android never treats opening the email application as verified sending', async () => {
  let received;
  const send = createCommentSender({ platform: 'android', isAvailable: async () => true, compose: async mail => { received = mail; return { status: 'sent' }; } });
  assert.deepEqual(await send(draft), { kind: 'opened' });
  assert.deepEqual(received, prepareComment(draft));
  assert.ok(!commentFeedback('opened').includes('fue enviado'));
});

test('iOS cancellation, saving and submission are distinguished without clearing input', async () => {
  for (const [status, kind] of [['cancelled', 'cancelled'], ['saved', 'saved'], ['sent', 'submitted'], ['undetermined', 'opened']]) {
    const send = createCommentSender({ platform: 'ios', isAvailable: async () => true, compose: async () => ({ status }) });
    assert.deepEqual(await send(draft), { kind });
    assert.equal(draft.message, 'Me gusta la galería de Milo.');
  }
});

test('a failed opening releases the sender so the same draft can be retried', async () => {
  let attempts = 0;
  const send = createCommentSender({ platform: 'ios', isAvailable: async () => true, compose: async () => {
    if (++attempts === 1) throw new Error('No mail client');
    return { status: 'cancelled' };
  } });
  assert.deepEqual(await send(draft), { kind: 'error' });
  assert.deepEqual(await send(draft), { kind: 'cancelled' });
  assert.equal(attempts, 2);
});

test('fast repeated presses open only one composer using a snapshot of the original message', async () => {
  let release;
  let composeCalls = 0;
  let actualMail;
  const available = new Promise(resolve => { release = resolve; });
  const send = createCommentSender({ platform: 'android', isAvailable: () => available, compose: async mail => { composeCalls++; actualMail = mail; return { status: 'sent' }; } });
  const editing = { ...draft };
  const first = send(editing);
  editing.message = 'Changed while opening';
  assert.deepEqual(await send(editing), { kind: 'busy' });
  release(true);
  assert.deepEqual(await first, { kind: 'opened' });
  assert.equal(composeCalls, 1);
  assert.ok(actualMail.body.endsWith(draft.message));
});
