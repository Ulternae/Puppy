export const routines = [
  { id: 'walk', title: 'Un paseo para explorar', detail: '08:00 · 30 minutos', icon: 'walk' },
  { id: 'food', title: 'Su plato favorito', detail: '13:00 · Alimentación', icon: 'silverware-fork-knife' },
  { id: 'play', title: 'Tiempo de jugar', detail: '17:00 · 20 minutos', icon: 'tennis-ball-outline' },
] as const;
export type RoutineId = (typeof routines)[number]['id'];
export type Reminder = { id: string; title: string; date: string; time: string; notes: string; done: boolean };
export type CareState = { day: string; completed: RoutineId[]; reminders: Reminder[] };
export type CareAction =
  | { type: 'routine'; id: RoutineId }
  | { type: 'reminder'; id: string }
  | { type: 'add'; reminder: Reminder }
  | { type: 'day'; day: string };

export function localDay(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function dayAfter(days: number, now = new Date()) {
  const date = new Date(now);
  date.setDate(date.getDate() + days);
  return localDay(date);
}
export function initialCare(): CareState {
  return { day: localDay(), completed: ['walk'], reminders: [
    { id: 'example-visit', title: 'Visita al veterinario', date: dayAfter(2), time: '10:00', notes: 'Revisión de rutina de Milo', done: false },
  ] };
}
export function careReducer(state: CareState, action: CareAction): CareState {
  switch (action.type) {
    case 'routine': return { ...state, completed: state.completed.includes(action.id)
      ? state.completed.filter(id => id !== action.id) : [...state.completed, action.id] };
    case 'reminder': return { ...state, reminders: state.reminders.map(r => r.id === action.id ? { ...r, done: !r.done } : r) };
    case 'add': return state.reminders.some(r => r.id === action.reminder.id) ? state
      : { ...state, reminders: [...state.reminders, action.reminder] };
    case 'day': return action.day === state.day ? state : { ...state, day: action.day, completed: [] };
  }
}
export function sortedReminders(reminders: Reminder[]) {
  return [...reminders].sort((a, b) => Number(a.done) - Number(b.done) || `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
}
export function readableDate(date: string, options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' }) {
  return new Intl.DateTimeFormat('es-CO', options).format(new Date(`${date}T12:00:00`));
}
export function inputDate(iso: string) { return iso.split('-').reverse().join('/'); }
export type ReminderDraft = { title: string; date: string; time: string; notes: string };
export function validateReminder(draft: ReminderDraft, today = localDay()):
  { ok: true; value: Omit<Reminder, 'id'> } | { ok: false; errors: Partial<Record<keyof ReminderDraft, string>> } {
  const errors: Partial<Record<keyof ReminderDraft, string>> = {};
  const title = draft.title.trim();
  if (!title || title.length > 80) errors.title = 'Escribe un título de hasta 80 caracteres.';
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(draft.date.trim());
  const iso = match ? `${match[3]}-${match[2]}-${match[1]}` : '';
  const parsed = new Date(`${iso}T12:00:00`);
  if (!match || Number.isNaN(parsed.getTime()) || localDay(parsed) !== iso) errors.date = 'Usa una fecha válida: DD/MM/AAAA.';
  else if (iso < today) errors.date = 'Elige hoy o una fecha futura.';
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(draft.time.trim())) errors.time = 'Usa una hora válida: HH:mm.';
  if (draft.notes.trim().length > 200) errors.notes = 'La descripción admite hasta 200 caracteres.';
  return Object.keys(errors).length ? { ok: false, errors } : {
    ok: true, value: { title, date: iso, time: draft.time.trim(), notes: draft.notes.trim(), done: false },
  };
}
