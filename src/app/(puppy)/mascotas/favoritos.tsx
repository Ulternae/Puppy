import { FlatList, StyleSheet, View, type ListRenderItem } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { FavoritePetRow, PetsStorageFeedback } from '../../../components/pets';
import { Action, Copy, Icon, Title } from '../../../components/ui';
import type { Pet } from '../../../lib/pets';
import { usePets } from '../../../state/pets-context';
import { colors } from '../../../theme';

const keyForPet = (pet: Pet) => pet.id;
const renderFavorite: ListRenderItem<Pet> = ({ item }) => <FavoritePetRow pet={item} />;
function Separator() { return <View style={{ height: 12 }} />; }
function FavoritesIntro() {
  const { favorites, status } = usePets();
  return <View style={{ gap: 12, marginBottom: 24 }}><Title>Tus favoritos.</Title><Copy style={{ color: colors.muted }}>Los últimos amigos a los que diste un huesito.</Copy>
    {status === 'ready' && favorites.length > 0 && <Copy style={{ fontSize: 13, color: colors.primaryText }}>{favorites.length} de 5 mascotas</Copy>}
    <PetsStorageFeedback />
  </View>;
}
function EmptyFavorites() {
  const { status } = usePets();
  if (status !== 'ready') return null;
  return <View style={{ padding: 24, borderRadius: 16, backgroundColor: colors.primarySubtle, gap: 16, alignItems: 'center' }}>
    <Icon name="star-outline" size={40} />
    <Copy weight="bold" style={{ fontSize: 20, lineHeight: 26, textAlign: 'center' }}>Cada amistad empieza con un huesito.</Copy>
    <Copy style={{ color: colors.muted, textAlign: 'center' }}>Conoce a las mascotas y encuentra a tus favoritas.</Copy>
    <Action icon="paw-outline" onPress={() => router.dismissTo('/mascotas')}>Conocer mascotas</Action>
  </View>;
}

export default function FavoritesScreen() {
  const { favorites, status } = usePets();
  const insets = useSafeAreaInsets();
  return <FlatList data={favorites} renderItem={renderFavorite} keyExtractor={keyForPet}
    style={styles.list} contentContainerStyle={[styles.content, { paddingBottom: 24 + insets.bottom }]}
    ListHeaderComponent={FavoritesIntro} ItemSeparatorComponent={Separator} ListEmptyComponent={EmptyFavorites}
    ListFooterComponent={favorites.length > 0 || status !== 'ready' ? <View style={{ paddingTop: 24 }}><Action secondary icon="arrow-left" onPress={() => router.dismissTo('/mascotas')}>Volver a mascotas</Action></View> : null} />;
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: colors.canvas },
  content: { width: '100%', maxWidth: 600, alignSelf: 'center', padding: 20 },
});
