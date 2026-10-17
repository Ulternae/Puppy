import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Action, Copy, Footer, Mascot, NavText, Screen, Title } from '../components/ui';
import { RoutineList, ReminderCard } from '../components/care';
import { useCare } from '../state/care-context';
import { sortedReminders } from '../lib/care';
import { colors } from '../theme';

export default function HomeScreen() {
  const { state, openEditor } = useCare();
  const next = sortedReminders(state.reminders).find(r => !r.done);
  return <Screen>
    <View style={{ gap: 8 }}><Title>Hola, Dani</Title><Copy style={styles.subtitle}>Un buen día para cuidar de quien más te quiere.</Copy></View>
    <View style={styles.hero}>
      <Copy weight="bold" accessibilityRole="header" style={styles.heroTitle}>Más momentos juntos.{"\n"}Menos pendientes.</Copy>
      <Copy style={styles.heroDescription}>Sus rutinas, sus citas y todo tu cariño.{"\n"}Dale a Milo un día tan especial como él.</Copy>
      <View style={styles.heroBottom}><View style={{ paddingBottom: 8 }}><Action dark icon="arrow-top-right" onPress={() => router.navigate('/mascota')}>Conoce a Milo</Action></View><Mascot /></View>
    </View>
    <RoutineList />
    <View style={{ gap: 16 }}><View style={styles.section}><Copy accessibilityRole="header" weight="bold" style={{ fontSize: 22 }}>En su agenda</Copy><NavText onPress={() => router.navigate('/agenda')}>Ver todo</NavText></View>
      {next ? <ReminderCard reminder={next} /> : <View style={styles.empty}><Copy weight="medium">Todo al día, más tiempo juntos.</Copy><Copy style={styles.subtitle}>Añade su próximo plan cuando quieras.</Copy></View>}
      <Action icon="plus" onPress={openEditor}>Nuevo recordatorio</Action>
    </View>
    <Footer />
  </Screen>;
}
const styles = StyleSheet.create({
  subtitle: { fontSize: 14, lineHeight: 21, color: colors.muted },
  hero: { backgroundColor: colors.primary, borderRadius: 20, padding: 24, paddingBottom: 12, gap: 16, overflow: 'hidden' },
  heroTitle: { fontSize: 28, lineHeight: 34 }, heroDescription: { fontSize: 14, lineHeight: 20 },
  heroBottom: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', rowGap: 8 },
  section: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  empty: { padding: 24, borderRadius: 16, backgroundColor: colors.surface, gap: 8 },
});
