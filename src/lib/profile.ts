export type ProfilePhoto = { id: string; source: 'park' | 'beach' | 'garden' | 'play' | 'walk' | 'rest'; title: string; rating: number };

export const profilePhotos: readonly ProfilePhoto[] = [
  { id: 'park-morning', source: 'park', title: 'Una mañana en el parque', rating: 12 },
  { id: 'garden-sun', source: 'garden', title: 'Una pausa entre flores', rating: 18 },
  { id: 'beach-walk', source: 'beach', title: 'Junto al mar', rating: 9 },
  { id: 'play-afternoon', source: 'play', title: 'Su pelota favorita', rating: 21 },
  { id: 'woodland-walk', source: 'walk', title: 'Explorando nuevos caminos', rating: 15 },
  { id: 'home-rest', source: 'rest', title: 'Un descanso en casa', rating: 8 },
];

export function profileRating(photos: readonly ProfilePhoto[] = profilePhotos): number {
  return photos.reduce((total, photo) => total + photo.rating, 0);
}
