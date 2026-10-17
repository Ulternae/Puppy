export type PetPhoto = 'milo' | 'luna' | 'coco' | 'nala' | 'toby' | 'bruno' | 'rocky' | 'kira' | 'simon' | 'lola';
export type Pet = {
  id: string;
  name: string;
  description: string;
  photo: PetPhoto;
  rating: number;
  liked: boolean;
};

const catalog: readonly Omit<Pet, 'liked'>[] = [
  { id: 'milo', name: 'Milo', description: 'Siempre listo para pasear', photo: 'milo', rating: 12 },
  { id: 'luna', name: 'Luna', description: 'Una exploradora curiosa', photo: 'luna', rating: 8 },
  { id: 'coco', name: 'Coco', description: 'Un gran compañero con mucha personalidad', photo: 'coco', rating: 6 },
  { id: 'nala', name: 'Nala', description: 'La aventura va con ella', photo: 'nala', rating: 15 },
  { id: 'toby', name: 'Toby', description: 'El mejor compañero de juegos', photo: 'toby', rating: 10 },
  { id: 'bruno', name: 'Bruno', description: 'Siempre cerca, siempre atento', photo: 'bruno', rating: 0 },
  { id: 'rocky', name: 'Rocky', description: 'Una sonrisa para cada paseo', photo: 'rocky', rating: 4 },
  { id: 'kira', name: 'Kira', description: 'Siempre encuentra un nuevo camino', photo: 'kira', rating: 7 },
  { id: 'simon', name: 'Simón', description: 'Feliz entre hojas y juegos', photo: 'simon', rating: 3 },
  { id: 'lola', name: 'Lola', description: 'Un abrazo de pelo y alegría', photo: 'lola', rating: 9 },
];

export const favoritePetIds: readonly string[] = ['milo', 'luna', 'coco', 'nala', 'toby'];
export type PetsAction = { type: 'rate'; id: string };

export function initialPets(): Pet[] {
  return catalog.map(pet => ({ ...pet, liked: false }));
}

export function petsReducer(pets: Pet[], action: PetsAction): Pet[] {
  const index = pets.findIndex(pet => pet.id === action.id);
  if (index === -1 || (!pets[index].liked && pets[index].rating >= Number.MAX_SAFE_INTEGER)) return pets;
  return pets.map((pet, position) => position === index
    ? { ...pet, liked: !pet.liked, rating: pet.rating + (pet.liked ? -1 : 1) } : pet);
}

export function favoritePets(pets: readonly Pet[]): Pet[] {
  return favoritePetIds.flatMap(id => {
    const pet = pets.find(item => item.id === id);
    return pet ? [pet] : [];
  });
}

export type PetsState = { pets: Pet[]; celebration: { id: number; petId: string } | null; sequence: number };
export type PetsEvent = PetsAction | { type: 'celebrationFinished'; id: number };

export function initialPetsState(): PetsState {
  return { pets: initialPets(), celebration: null, sequence: 0 };
}

export function petsStateReducer(state: PetsState, action: PetsEvent): PetsState {
  if (action.type === 'celebrationFinished') {
    return state.celebration?.id === action.id ? { ...state, celebration: null } : state;
  }
  const pets = petsReducer(state.pets, action);
  if (pets === state.pets) return state;
  if (pets.find(pet => pet.id === action.id)?.liked) {
    const sequence = state.sequence + 1;
    return { pets, sequence, celebration: { id: sequence, petId: action.id } };
  }
  return { ...state, pets, celebration: state.celebration?.petId === action.id ? null : state.celebration };
}
