import { useRef, useState } from 'react';
import { FlatList, Image, Modal, Pressable, StyleSheet, View, useWindowDimensions, type ImageSourcePropType, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { IconButton } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { profilePhotos, type ProfilePhoto } from '../lib/profile';
import { colors } from '../theme';
import { Copy, Icon } from './ui';

const photos: Record<ProfilePhoto['source'], ImageSourcePropType> = {
  park: require('../../assets/gallery/milo-park.jpg'),
  beach: require('../../assets/gallery/milo-beach.jpg'),
  garden: require('../../assets/gallery/milo-garden.jpg'),
  play: require('../../assets/gallery/milo-play.jpg'),
  walk: require('../../assets/gallery/milo-walk.jpg'),
  rest: require('../../assets/gallery/milo-rest.jpg'),
};

export function ProfilePhotoTile({ photo, size, onPress }: { photo: ProfilePhoto; size: number; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={`Ver ${photo.title}, ${photo.rating} huesitos`} accessibilityHint="Abre la foto completa"
    onPress={onPress} style={({ pressed }) => [styles.tile, { width: size, opacity: pressed ? 0.8 : 1 }]}>
    <Image source={photos[photo.source]} resizeMode="cover" style={{ width: size, height: size }} accessible={false} />
    <View style={styles.rating}><Icon name="bone" size={18} color={colors.rating} /><Copy weight="medium" style={{ fontSize: 14 }}>{photo.rating}</Copy></View>
  </Pressable>;
}

export function ProfilePhotoViewer({ initialIndex, onClose }: { initialIndex: number; onClose: () => void }) {
  const [selected, setSelected] = useState(initialIndex);
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const pageWidth = Math.max(1, width - 32);
  const photoSize = Math.max(1, Math.min(pageWidth, height - insets.top - insets.bottom - 256));
  const pager = useRef<FlatList<ProfilePhoto>>(null);
  const thumbnails = useRef<FlatList<ProfilePhoto>>(null);
  const current = profilePhotos[selected];

  function select(index: number) {
    if (index < 0 || index >= profilePhotos.length) return;
    setSelected(index);
    pager.current?.scrollToIndex({ index, animated: true });
    thumbnails.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
  }
  function onPageChanged(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const index = Math.min(profilePhotos.length - 1, Math.max(0, Math.round(event.nativeEvent.contentOffset.x / pageWidth)));
    setSelected(index);
    thumbnails.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
  }
  return <Modal visible animationType="fade" presentationStyle="fullScreen" onRequestClose={onClose}>
    <StatusBar style="light" />
    <SafeAreaView style={styles.viewer} accessibilityViewIsModal>
      <View style={styles.header}>
        <Copy weight="bold" style={styles.viewerTitle}>Fotos de Milo</Copy>
        <Copy style={styles.viewerText} accessibilityLiveRegion="polite">{selected + 1} / {profilePhotos.length}</Copy>
        <IconButton icon="close" iconColor={colors.surface} accessibilityLabel="Cerrar galería" onPress={onClose} />
      </View>
      <View style={styles.stage}>
        <FlatList key={pageWidth} ref={pager} horizontal pagingEnabled showsHorizontalScrollIndicator={false}
          data={profilePhotos} initialScrollIndex={selected} keyExtractor={photo => photo.id}
          getItemLayout={(_data, index) => ({ length: pageWidth, offset: pageWidth * index, index })}
          onMomentumScrollEnd={onPageChanged} style={{ height: photoSize, flexGrow: 0, width: pageWidth }}
          renderItem={({ item }) => <View style={{ width: pageWidth, height: photoSize, alignItems: 'center', justifyContent: 'center' }}>
            <Image source={photos[item.source]} resizeMode="contain" style={{ width: photoSize, height: photoSize, borderRadius: 16 }} accessibilityLabel={item.title} />
          </View>} />
      </View>
      <View style={styles.caption}>
        <IconButton icon="chevron-left" iconColor={colors.surface} disabled={selected === 0} accessibilityLabel="Foto anterior" onPress={() => select(selected - 1)} />
        <View style={styles.captionText}>
          <Copy weight="medium" style={[styles.viewerText, { textAlign: 'center' }]}>{current.title}</Copy>
          <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'center', alignItems: 'center' }}>
            <Icon name="bone" size={18} color={colors.primary} /><Copy style={styles.viewerText}>{current.rating}</Copy>
          </View>
        </View>
        <IconButton icon="chevron-right" iconColor={colors.surface} disabled={selected === profilePhotos.length - 1} accessibilityLabel="Foto siguiente" onPress={() => select(selected + 1)} />
      </View>
      <View style={{ height: 88 }}>
        <FlatList ref={thumbnails} horizontal data={profilePhotos} initialScrollIndex={initialIndex} keyExtractor={photo => photo.id} showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbnails} getItemLayout={(_data, index) => ({ length: 74, offset: 16 + 74 * index, index })}
          renderItem={({ item, index }) => <Pressable accessibilityRole="button" accessibilityState={{ selected: selected === index }} accessibilityLabel={`${item.title}, foto ${index + 1} de ${profilePhotos.length}`}
            onPress={() => select(index)} style={[styles.thumbnail, { borderColor: selected === index ? colors.primary : 'transparent' }]}>
            <Image source={photos[item.source]} resizeMode="cover" style={{ width: 58, height: 58, borderRadius: 7 }} accessible={false} />
          </Pressable>} />
      </View>
      <Copy style={{ color: colors.primary, fontSize: 12, lineHeight: 18, textAlign: 'center', paddingBottom: 12 }}>Desliza la foto o toca una miniatura.</Copy>
    </SafeAreaView>
  </Modal>;
}

const styles = StyleSheet.create({
  tile: { borderRadius: 12, overflow: 'hidden', backgroundColor: colors.surface },
  rating: { minHeight: 44, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  viewer: { flex: 1, backgroundColor: colors.ink },
  header: { minHeight: 64, paddingLeft: 20, paddingRight: 8, flexDirection: 'row', alignItems: 'center', gap: 12 },
  viewerTitle: { flex: 1, fontSize: 20, lineHeight: 26, color: colors.surface },
  viewerText: { color: colors.surface, fontSize: 14, lineHeight: 20 },
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  caption: { minHeight: 64, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center' },
  captionText: { flex: 1, gap: 4, alignItems: 'center' },
  thumbnails: { paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  thumbnail: { width: 64, height: 64, padding: 1, borderWidth: 2, borderRadius: 10 },
});
