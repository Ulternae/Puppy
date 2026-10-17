import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, type PropsWithChildren } from 'react';
import { initialPetsState, petsStateReducer, type FavoritePet, type Pet } from '../lib/pets';
import { ConfettiBurst } from '../components/confetti';
import { openPetStore } from '../storage/open-pet-store';

type PetsContext = {
  pets: Pet[]; favorites: FavoritePet[]; ratePet: (id: string) => void;
  status: 'loading' | 'ready' | 'error'; savingId: string | null; saveError: boolean;
  retryLoad: () => void; retrySave: () => void;
};
const Context = createContext<PetsContext | null>(null);

export function PetsProvider({ children }: PropsWithChildren) {
  const [{ pets, favorites, celebration }, dispatch] = useReducer(petsStateReducer, undefined, initialPetsState);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [failedId, setFailedId] = useState<string | null>(null);
  const busy = useRef(false);
  useEffect(() => {
    let cancelled = false;
    void openPetStore().then(store => store.load()).then(records => {
      if (!cancelled) { dispatch({ type: 'hydrate', favorites: records }); setStatus('ready'); }
    }).catch(() => { if (!cancelled) setStatus('error'); });
    return () => { cancelled = true; };
  }, [attempt]);
  const ratePet = useCallback((id: string) => {
    const pet = pets.find(item => item.id === id);
    if (!pet || status !== 'ready' || busy.current) return;
    busy.current = true;
    setSavingId(id);
    setFailedId(null);
    void openPetStore().then(store => store.toggle(pet)).then(result => {
      dispatch({ type: 'saved', ...result });
    }).catch(() => { setFailedId(id); }).finally(() => { busy.current = false; setSavingId(null); });
  }, [pets, status]);
  const retryLoad = useCallback(() => { setStatus('loading'); setAttempt(value => value + 1); }, []);
  const retrySave = useCallback(() => { if (failedId) ratePet(failedId); }, [failedId, ratePet]);
  const finishCelebration = useCallback((id: number) => dispatch({ type: 'celebrationFinished', id }), []);
  const value = useMemo(() => ({ pets, favorites, ratePet, status, savingId, saveError: !!failedId, retryLoad, retrySave }), [pets, favorites, ratePet, status, savingId, failedId, retryLoad, retrySave]);
  return <Context.Provider value={value}>{children}
    {celebration && <ConfettiBurst key={celebration.id} id={celebration.id} onComplete={finishCelebration} />}
  </Context.Provider>;
}

export function usePets() {
  const value = useContext(Context);
  if (!value) throw new Error('PetsProvider is required');
  return value;
}
