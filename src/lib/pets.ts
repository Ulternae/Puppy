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

export type FavoritePet = Pet & { lastRatedOrder: number };
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

export function favoritePets(pets: readonly FavoritePet[]): FavoritePet[] {
  return [...pets].filter(pet => pet.liked).sort((a, b) => b.lastRatedOrder - a.lastRatedOrder || a.id.localeCompare(b.id)).slice(0, 5);
}

export type PetsState = { pets: Pet[]; favorites: FavoritePet[]; celebration: { id: number; petId: string } | null; sequence: number };
export type PetsEvent =
  | { type: 'hydrate'; favorites: FavoritePet[] }
  | { type: 'saved'; pet: Pet; favorites: FavoritePet[] }
  | { type: 'celebrationFinished'; id: number };

export function initialPetsState(): PetsState {
  return { pets: initialPets(), favorites: [], celebration: null, sequence: 0 };
}

export function petsStateReducer(state: PetsState, action: PetsEvent): PetsState {
  if (action.type === 'celebrationFinished') {
    return state.celebration?.id === action.id ? { ...state, celebration: null } : state;
  }
  const favorites = favoritePets(action.favorites);
  const pets = state.pets.map(pet => {
    const saved = favorites.find(favorite => favorite.id === pet.id);
    if (saved) return { id: saved.id, name: saved.name, description: saved.description, photo: saved.photo, rating: saved.rating, liked: saved.liked };
    return action.type === 'saved' && action.pet.id === pet.id ? action.pet : pet;
  });
  if (action.type === 'hydrate') return { ...state, pets, favorites, celebration: null };
  if (action.pet.liked) {
    const sequence = state.sequence + 1;
    return { pets, favorites, sequence, celebration: { id: sequence, petId: action.pet.id } };
  }
  return { ...state, pets, favorites, celebration: state.celebration?.petId === action.pet.id ? null : state.celebration };
}
