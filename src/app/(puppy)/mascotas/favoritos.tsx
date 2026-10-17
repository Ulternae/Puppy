import { FlatList, StyleSheet, View, type ListRenderItem } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { FavoritePetRow } from '../../../components/pets';
import { Action, Copy, Title } from '../../../components/ui';
import { favoritePets, type Pet } from '../../../lib/pets';
import { usePets } from '../../../state/pets-context';
import { colors } from '../../../theme';

const keyForPet = (pet: Pet) => pet.id;
const renderFavorite: ListRenderItem<Pet> = ({ item }) => <FavoritePetRow pet={item} />;
function Separator() { return <View style={{ height: 12 }} />; }
function FavoritesIntro() {
  return <View style={{ gap: 12, marginBottom: 24 }}><Title>Cinco favoritos.</Title><Copy style={{ color: colors.muted }}>Cinco amigos para tener siempre cerca.</Copy></View>;
}

export default function FavoritesScreen() {
  const { pets } = usePets();
  const insets = useSafeAreaInsets();
  return <FlatList data={favoritePets(pets)} renderItem={renderFavorite} keyExtractor={keyForPet}
    style={styles.list} contentContainerStyle={[styles.content, { paddingBottom: 24 + insets.bottom }]}
    ListHeaderComponent={FavoritesIntro} ItemSeparatorComponent={Separator}
    ListFooterComponent={<View style={{ paddingTop: 24 }}><Action secondary icon="arrow-left" onPress={() => router.dismissTo('/mascotas')}>Volver a mascotas</Action></View>} />;
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: colors.canvas },
  content: { width: '100%', maxWidth: 600, alignSelf: 'center', padding: 20 },
});
