export type ContactDraft = {
  fullName: string;
  birthDate: string;
  phone: string;
  email: string;
  description: string;
};
export type ContactField = keyof ContactDraft;
export type ContactErrors = Partial<Record<ContactField, string>>;
export const contactFields = ['fullName', 'birthDate', 'phone', 'email', 'description'] as const;

export function emptyContact(): ContactDraft {
  return { fullName: '', birthDate: '', phone: '', email: '', description: '' };
}

// Calendar values are local YYYY-MM-DD strings, never UTC timestamps.
export function calendarDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function parseBirthDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) || calendarDate(date) !== value ? null : date;
}
export function displayBirthDate(value: string): string {
  const date = parseBirthDate(value);
  return date ? new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }).format(date) : '';
}
export function validateContact(draft: ContactDraft, today = calendarDate(new Date())): ContactErrors {
  const errors: ContactErrors = {};
  if (!draft.fullName.trim() || draft.fullName.length > 100) errors.fullName = 'Escribe tu nombre completo (hasta 100 caracteres).';
  if (!parseBirthDate(draft.birthDate) || draft.birthDate > today || draft.birthDate < '1900-01-01') {
    errors.birthDate = 'Elige una fecha de nacimiento entre 1900 y hoy.';
  }
  const phone = draft.phone.trim();
  const digits = phone.replace(/\D/g, '');
  if (!/^\+?[\d\s().-]+$/.test(phone) || digits.length < 7 || digits.length > 15 || phone.length > 30) {
    errors.phone = 'Escribe un teléfono de 7 a 15 dígitos; puedes incluir +, espacios o guiones.';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim()) || draft.email.length > 254) {
    errors.email = 'Escribe un correo válido, como nombre@correo.com.';
  }
  if (!draft.description.trim() || draft.description.length > 500) errors.description = 'Añade una descripción de hasta 500 caracteres.';
  return errors;
}

export type RegistrationState = { draft: ContactDraft; confirmed: ContactDraft | null; savedContact: ContactDraft | null; errors: ContactErrors };
export type RegistrationAction =
  | { type: 'change'; field: ContactField; value: string }
  | { type: 'review'; today: string }
  | { type: 'accept' }
  | { type: 'view' };
export function initialRegistration(): RegistrationState {
  return { draft: emptyContact(), confirmed: null, savedContact: null, errors: {} };
}
export function registrationReducer(state: RegistrationState, action: RegistrationAction): RegistrationState {
  if (action.type === 'accept') return state.confirmed ? { ...state, savedContact: state.confirmed } : state;
  if (action.type === 'view') return state.savedContact
    ? { ...state, draft: { ...state.savedContact }, confirmed: state.savedContact, errors: {} } : state;
  if (action.type === 'change') {
    const errors = { ...state.errors };
    delete errors[action.field];
    return { ...state, draft: { ...state.draft, [action.field]: action.value }, errors };
  }
  const errors = validateContact(state.draft, action.today);
  return Object.keys(errors).length ? { ...state, errors }
    : { ...state, confirmed: { ...state.draft }, errors: {} };
}
