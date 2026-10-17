import { useCallback } from 'react';
import { FlatList, StyleSheet, View, type ListRenderItem } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PetCard } from '../../../components/pets';
import { Copy, Footer, Title } from '../../../components/ui';
import { usePets } from '../../../state/pets-context';
import type { Pet } from '../../../lib/pets';
import { colors } from '../../../theme';

const keyForPet = (pet: Pet) => pet.id;
function Separator() { return <View style={{ height: 20 }} />; }
function CatalogIntro() {
  return <View style={{ gap: 12, marginBottom: 24 }}><Title>Pequeños grandes amigos.</Title><Copy style={{ color: colors.muted }}>Conoce a las mascotas y regala un huesito a tus favoritas.</Copy></View>;
}

export default function PetsScreen() {
  const { pets, ratePet } = usePets();
  const insets = useSafeAreaInsets();
  const renderPet = useCallback<ListRenderItem<Pet>>(({ item }) => <PetCard pet={item} onRate={ratePet} />, [ratePet]);
  return <FlatList data={pets} renderItem={renderPet} keyExtractor={keyForPet}
    style={styles.list} contentContainerStyle={[styles.content, { paddingBottom: 24 + insets.bottom }]}
    ListHeaderComponent={CatalogIntro} ItemSeparatorComponent={Separator}
    ListFooterComponent={<View style={{ paddingTop: 24 }}><Footer /></View>}
    initialNumToRender={3} windowSize={5} />;
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: colors.canvas },
  content: { width: '100%', maxWidth: 600, alignSelf: 'center', padding: 20 },
});
