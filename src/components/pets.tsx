import { memo, useState } from 'react';
import { Image, StyleSheet, View, type ImageSourcePropType } from 'react-native';
import { ActivityIndicator, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import type { Pet, PetPhoto } from '../lib/pets';
import { colors } from '../theme';
import { Action, AppMenu, Copy, Icon } from './ui';
import { usePets } from '../state/pets-context';

const photos: Record<PetPhoto, ImageSourcePropType> = {
  milo: require('../../assets/pets/milo.jpg'),
  luna: require('../../assets/pets/luna.jpg'),
  coco: require('../../assets/pets/coco.jpg'),
  nala: require('../../assets/pets/nala.jpg'),
  toby: require('../../assets/pets/toby.jpg'),
  bruno: require('../../assets/pets/bruno.jpg'),
  rocky: require('../../assets/pets/rocky.jpg'),
  kira: require('../../assets/pets/kira.jpg'),
  simon: require('../../assets/pets/simon.jpg'),
  lola: require('../../assets/pets/lola.jpg'),
};
const thumbnails: Record<PetPhoto, ImageSourcePropType> = {
  milo: require('../../assets/pets/thumbnails/milo.jpg'),
  luna: require('../../assets/pets/thumbnails/luna.jpg'),
  coco: require('../../assets/pets/thumbnails/coco.jpg'),
  nala: require('../../assets/pets/thumbnails/nala.jpg'),
  toby: require('../../assets/pets/thumbnails/toby.jpg'),
  bruno: require('../../assets/pets/thumbnails/bruno.jpg'),
  rocky: require('../../assets/pets/thumbnails/rocky.jpg'),
  kira: require('../../assets/pets/thumbnails/kira.jpg'),
  simon: require('../../assets/pets/thumbnails/simon.jpg'),
  lola: require('../../assets/pets/thumbnails/lola.jpg'),
};

function PetPhotoView({ pet, compact = false }: { pet: Pet; compact?: boolean }) {
  const [failed, setFailed] = useState(false);
  return <View style={compact ? styles.thumbnail : styles.photo}>
    {failed ? <View style={styles.photoFallback} accessibilityLabel={`Fotografía de ${pet.name} no disponible`}>
      <Icon name="paw-outline" size={compact ? 28 : 52} />
    </View> : <Image source={compact ? thumbnails[pet.photo] : photos[pet.photo]} resizeMode="cover" style={styles.image} accessibilityLabel={`Fotografía de ${pet.name}`} onError={() => setFailed(true)} />}
  </View>;
}

function Rating({ pet }: { pet: Pet }) {
  return <View accessible accessibilityLabel={`${pet.name}: ${pet.rating} ${pet.rating === 1 ? 'huesito' : 'huesitos'}`} accessibilityLiveRegion="polite" style={styles.rating}>
    <Icon name="bone" size={22} color={colors.rating} />
    <Copy weight="bold" style={{ fontVariant: ['tabular-nums'] }}>{pet.rating}</Copy>
  </View>;
}

export const PetCard = memo(function PetCard({ pet, onRate, disabled = false, saving = false }: { pet: Pet; onRate: (id: string) => void; disabled?: boolean; saving?: boolean }) {
  return <View style={styles.card}>
    <PetPhotoView pet={pet} />
    <View style={styles.cardContent}>
      <View style={styles.nameRow}><Copy weight="bold" accessibilityRole="header" style={styles.petName}>{pet.name}</Copy><Rating pet={pet} /></View>
      <Copy style={styles.description}>{pet.description}</Copy>
      <Action icon={pet.liked ? 'check' : 'bone'} secondary={pet.liked}
        disabled={disabled} loading={saving}
        accessibilityLabel={saving ? `Guardando el huesito de ${pet.name}` : pet.liked ? `Retirar tu huesito de ${pet.name}` : `Darle un huesito a ${pet.name}`}
        accessibilityState={{ selected: pet.liked, disabled, busy: saving }} onPress={() => onRate(pet.id)}>{saving ? 'Guardando…' : pet.liked ? 'Retirar huesito' : 'Dale un huesito'}</Action>
    </View>
  </View>;
});

export function PetsStorageFeedback() {
  const { status, saveError, retryLoad, retrySave } = usePets();
  if (status === 'ready' && !saveError) return null;
  return <View accessibilityLiveRegion="polite" style={{ gap: 12, padding: 16, borderRadius: 12, backgroundColor: colors.primarySubtle }}>
    {status === 'loading' ? <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <ActivityIndicator size="small" color={colors.primaryDark} /><Copy style={{ flex: 1, fontSize: 14 }}>Cargando tus favoritos…</Copy>
    </View> : <>
      <Copy style={{ fontSize: 14 }}>{status === 'error' ? 'No pudimos cargar tus favoritos. Inténtalo de nuevo.' : 'No pudimos guardar el cambio. Tus favoritos siguen como estaban.'}</Copy>
      <Action secondary icon="refresh" onPress={status === 'error' ? retryLoad : retrySave}>Reintentar</Action>
    </>}
  </View>;
}

export function FavoritePetRow({ pet }: { pet: Pet }) {
  return <View style={styles.favoriteRow}>
    <PetPhotoView pet={pet} compact />
    <View style={{ flex: 1, gap: 4 }}><Copy weight="bold">{pet.name}</Copy><Copy style={styles.description}>{pet.description}</Copy></View>
    <Rating pet={pet} />
  </View>;
}

export function PetCatalogHeader({ favorites = false }: { favorites?: boolean }) {
  return <SafeAreaView edges={['top']} style={{ backgroundColor: colors.canvas }}>
    <View style={styles.header}>
      <IconButton icon="arrow-left" iconColor={colors.primaryDark} accessibilityLabel={favorites ? 'Volver a mascotas' : 'Volver al inicio'} onPress={() => { if (favorites) router.dismissTo('/mascotas'); else router.navigate('/inicio'); }} />
      {favorites ? <Copy weight="bold" style={styles.headerTitle}>Favoritos</Copy> : <View style={styles.brand}><Icon name="paw-outline" size={25} /><Copy weight="bold" style={styles.headerTitle}>puppy</Copy></View>}
      {!favorites && <IconButton icon="star-outline" iconColor={colors.primaryDark} accessibilityLabel="Ver mascotas favoritas" onPress={() => router.navigate('/mascotas/favoritos')} />}
      <AppMenu />
    </View>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  header: { minHeight: 64, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center', gap: 4 },
  brand: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { flex: 1, fontSize: 22, lineHeight: 28 },
  card: { backgroundColor: colors.surface, borderRadius: 16, overflow: 'hidden' },
  photo: { aspectRatio: 4 / 3, backgroundColor: colors.primarySubtle },
  image: { width: '100%', height: '100%' },
  photoFallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cardContent: { padding: 16, gap: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  petName: { flex: 1, fontSize: 22, lineHeight: 28 },
  description: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 0 },
  favoriteRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 16, backgroundColor: colors.surface },
  thumbnail: { width: 64, height: 72, borderRadius: 10, overflow: 'hidden', backgroundColor: colors.primary },
});
