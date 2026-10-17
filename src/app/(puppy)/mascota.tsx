import { useCallback, useState } from 'react';
import { FlatList, Image, View, StyleSheet, useWindowDimensions, type ListRenderItem } from 'react-native';
import { router } from 'expo-router';
import { Action, Copy, Footer, Icon, Title } from '../../components/ui';
import { profilePhotos, profileRating, type ProfilePhoto } from '../../lib/profile';
import { colors } from '../../theme';
import { ProfilePhotoTile, ProfilePhotoViewer } from '../../components/profile-gallery';
function ProfileHeader() {
  return <View style={{ gap: 24, marginBottom: 20 }}>
    <View style={{ gap: 8 }}><Title>El mundo de Milo</Title><Copy style={{ color: colors.muted }}>Su historia, sus favoritos y todo eso que lo hace único.</Copy></View>
    <View style={styles.portrait}>
      <Image source={require('../../../assets/pets/milo.jpg')} resizeMode="cover" style={styles.avatar} accessibilityLabel="Foto de perfil de Milo" />
      <Copy weight="bold" style={{ fontSize: 32, lineHeight: 38 }}>Milo</Copy><Copy>Tu compañero de aventuras</Copy>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Copy style={styles.label}>{profilePhotos.length} fotos</Copy><Icon name="bone" size={20} color={colors.rating} /><Copy weight="medium">{profileRating()} huesitos</Copy>
      </View>
    </View>
    <View style={{ gap: 8 }}><Copy weight="bold" accessibilityRole="header" style={{ fontSize: 22, lineHeight: 28 }}>Sus pequeños momentos.</Copy><Copy style={{ color: colors.muted }}>Una galería de fotos para volver a sonreír.</Copy></View>
  </View>;
}
function ProfileFooter() {
  return <View style={{ gap: 24, paddingTop: 24 }}>
    <View style={{ backgroundColor: colors.surface, borderRadius: 16, paddingHorizontal: 20 }}>
      {([['Nombre', 'Milo'], ['Raza o mezcla', 'Mestizo'], ['Su cumpleaños', '12 de mayo de 2024'], ['Lo que más le gusta', 'Su pelota y los paseos largos']] as const).map(([label, value], i) => <View key={label} style={[styles.fact, i === 3 && { borderBottomWidth: 0 }]}><Copy style={styles.label}>{label}</Copy><Copy weight="medium">{value}</Copy></View>)}
    </View>
    <Action icon="calendar-month-outline" onPress={() => router.navigate('/agenda')}>Ver su agenda</Action>
    <Footer />
  </View>;
}
export default function PetScreen() {
  const { width } = useWindowDimensions();
  const tileSize = Math.max(1, Math.floor((Math.min(width, 600) - 52) / 2));
  const [selected, setSelected] = useState<number | null>(null);
  const renderPhoto = useCallback<ListRenderItem<ProfilePhoto>>(({ item, index }) => <ProfilePhotoTile photo={item} size={tileSize} onPress={() => setSelected(index)} />, [tileSize]);
  return <><FlatList data={profilePhotos} numColumns={2} keyExtractor={photo => photo.id} renderItem={renderPhoto}
    extraData={tileSize}
    style={{ flex: 1, backgroundColor: colors.canvas }} contentContainerStyle={styles.content}
    columnWrapperStyle={{ gap: 12 }} ItemSeparatorComponent={PhotoSeparator}
    ListHeaderComponent={ProfileHeader} ListFooterComponent={ProfileFooter} />
    {selected !== null && <ProfilePhotoViewer initialIndex={selected} onClose={() => setSelected(null)} />}
  </>;
}
function PhotoSeparator() { return <View style={{ height: 12 }} />; }
const styles = StyleSheet.create({
  portrait: { backgroundColor: colors.primary, padding: 24, borderRadius: 20, alignItems: 'center', gap: 12 },
  fact: { gap: 6, paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: colors.divider },
  label: { fontSize: 14, color: colors.muted },
  avatar: { width: 128, height: 128, borderRadius: 64, backgroundColor: colors.surface },
  content: { width: '100%', maxWidth: 600, alignSelf: 'center', padding: 20, paddingBottom: 32 },
});
