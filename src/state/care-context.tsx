import { createContext, useContext, useEffect, useReducer, useRef, useState, type PropsWithChildren } from 'react';
import { AppState } from 'react-native';
import { Snackbar } from 'react-native-paper';
import { careReducer, initialCare, localDay, type CareState, type Reminder, type RoutineId } from '../lib/care';
import { colors } from '../theme';

type CareContext = {
  state: CareState; toggleRoutine: (id: RoutineId) => void; toggleReminder: (id: string) => void;
  addReminder: (value: Omit<Reminder, 'id'>) => void;
  editorOpen: boolean; openEditor: () => void; closeEditor: () => void;
};
const Context = createContext<CareContext | null>(null);

export function CareProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(careReducer, undefined, initialCare);
  const [editorOpen, setEditorOpen] = useState(false);
  const [message, setMessage] = useState('');
  const nextId = useRef(0);
  useEffect(() => {
    const refresh = () => dispatch({ type: 'day', day: localDay() });
    const listener = AppState.addEventListener('change', status => { if (status === 'active') refresh(); });
    const timer = setInterval(refresh, 60_000);
    return () => { listener.remove(); clearInterval(timer); };
  }, []);
  return <Context.Provider value={{
    state, editorOpen, openEditor: () => setEditorOpen(true), closeEditor: () => setEditorOpen(false),
    toggleRoutine(id) {
      dispatch({ type: 'day', day: localDay() });
      dispatch({ type: 'routine', id });
    },
    toggleReminder(id) { dispatch({ type: 'reminder', id }); },
    addReminder(value) {
      dispatch({ type: 'add', reminder: { ...value, id: `reminder-${nextId.current++}` } });
      setEditorOpen(false);
      setMessage('Recordatorio añadido a tu agenda.');
    },
  }}>
    {children}
    <Snackbar visible={!!message} onDismiss={() => setMessage('')} duration={4500}
      style={{ backgroundColor: colors.ink }} accessibilityLiveRegion="polite"
      action={{ label: 'Cerrar', textColor: colors.primary, onPress: () => setMessage('') }}>{message}</Snackbar>
  </Context.Provider>;
}
export function useCare() {
  const value = useContext(Context);
  if (!value) throw new Error('CareProvider is required');
  return value;
}
