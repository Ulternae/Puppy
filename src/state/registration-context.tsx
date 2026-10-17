import { createContext, useContext, useReducer, type PropsWithChildren } from 'react';
import { calendarDate, initialRegistration, registrationReducer, validateContact, type ContactField, type RegistrationState } from '../lib/registration';

type RegistrationContext = RegistrationState & {
  changeField: (field: ContactField, value: string) => void;
  review: () => ContactField | undefined;
  acceptContact: () => void;
  viewContact: () => void;
};
const Context = createContext<RegistrationContext | null>(null);

export function RegistrationProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(registrationReducer, undefined, initialRegistration);
  function review() {
    const today = calendarDate(new Date());
    const errors = validateContact(state.draft, today);
    dispatch({ type: 'review', today });
    return Object.keys(errors)[0] as ContactField | undefined;
  }
  return <Context.Provider value={{ ...state, review,
    acceptContact: () => dispatch({ type: 'accept' }), viewContact: () => dispatch({ type: 'view' }),
    changeField: (field, value) => dispatch({ type: 'change', field, value }) }}>
    {children}
  </Context.Provider>;
}

export function useRegistration() {
  const value = useContext(Context);
  if (!value) throw new Error('RegistrationProvider is required');
  return value;
}
