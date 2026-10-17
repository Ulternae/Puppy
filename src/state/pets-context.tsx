import { createContext, useCallback, useContext, useMemo, useReducer, type PropsWithChildren } from 'react';
import { initialPetsState, petsStateReducer, type Pet } from '../lib/pets';
import { ConfettiBurst } from '../components/confetti';

type PetsContext = { pets: Pet[]; ratePet: (id: string) => void };
const Context = createContext<PetsContext | null>(null);

export function PetsProvider({ children }: PropsWithChildren) {
  const [{ pets, celebration }, dispatch] = useReducer(petsStateReducer, undefined, initialPetsState);
  const ratePet = useCallback((id: string) => dispatch({ type: 'rate', id }), []);
  const finishCelebration = useCallback((id: number) => dispatch({ type: 'celebrationFinished', id }), []);
  const value = useMemo(() => ({ pets, ratePet }), [pets, ratePet]);
  return <Context.Provider value={value}>{children}
    {celebration && <ConfettiBurst key={celebration.id} id={celebration.id} onComplete={finishCelebration} />}
  </Context.Provider>;
}

export function usePets() {
  const value = useContext(Context);
  if (!value) throw new Error('PetsProvider is required');
  return value;
}
