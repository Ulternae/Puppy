import { Image, View } from 'react-native';
import { router } from 'expo-router';
import { Action, Copy, Footer, Screen, Title } from '../../components/ui';
import { colors } from '../../theme';

export default function AboutScreen() {
  return <Screen>
    <View style={{ backgroundColor: colors.ink, borderRadius: 20, padding: 24, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
      <Image source={require('../../../assets/brand/puppy-milo.png')} resizeMode="contain" style={{ width: 96, height: 96 }} accessibilityLabel="Milo, la mascota de Puppy" />
      <View style={{ flex: 1, gap: 8 }}><Copy weight="bold" style={{ color: colors.surface, fontSize: 28, lineHeight: 34 }}>puppy</Copy><Copy style={{ color: colors.primary }}>Pequeños cuidados. Grandes vínculos.</Copy></View>
    </View>
    <View style={{ gap: 8 }}><Title>Daniel Ríos</Title><Copy style={{ color: colors.primaryText }}>Diseño y desarrollo</Copy></View>
    <Copy>Creo experiencias sencillas para que las personas disfruten más tiempo con sus mascotas. Puppy nace de mi interés por unir diseño, tecnología y cuidado cotidiano.</Copy>
    <Copy style={{ color: colors.muted }}>Un proyecto para aprender creando y compartir pequeños momentos con grandes amigos.</Copy>
    <Action secondary icon="email-outline" onPress={() => router.navigate('/contacto')}>Hablemos de Puppy</Action>
    <Footer />
  </Screen>;
}
