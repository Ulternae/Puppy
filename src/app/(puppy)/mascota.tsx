import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Action, Copy, Footer, Mascot, Screen, Title } from '../../components/ui';
import { colors } from '../../theme';

export default function PetScreen() {
  return <Screen>
    <View style={{ gap: 8 }}><Title>El mundo de Milo</Title><Copy style={{ color: colors.muted }}>Su historia, sus favoritos y todo eso que lo hace único.</Copy></View>
    <View style={styles.portrait}><Mascot large /><Copy weight="bold" style={{ fontSize: 32, lineHeight: 38 }}>Milo</Copy><Copy>Tu compañero de aventuras</Copy></View>
    <View style={{ backgroundColor: colors.surface, borderRadius: 16, paddingHorizontal: 20 }}>
      {([['Nombre', 'Milo'], ['Raza o mezcla', 'Mestizo'], ['Su cumpleaños', '12 de mayo de 2024'], ['Lo que más le gusta', 'Su pelota y los paseos largos']] as const).map(([label, value], i) => <View key={label} style={[styles.fact, i === 3 && { borderBottomWidth: 0 }]}><Copy style={styles.label}>{label}</Copy><Copy weight="medium">{value}</Copy></View>)}
    </View>
    <Action icon="calendar-month-outline" onPress={() => router.navigate('/agenda')}>Ver su agenda</Action>
    <Footer />
  </Screen>;
}
const styles = StyleSheet.create({
  portrait: { backgroundColor: colors.primary, padding: 24, borderRadius: 20, alignItems: 'center', gap: 12 },
  fact: { gap: 6, paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: colors.divider },
  label: { fontSize: 14, color: colors.muted },
});
