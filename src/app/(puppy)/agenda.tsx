import { View } from 'react-native';
import { Action, Copy, Footer, Screen, Title } from '../../components/ui';
import { ReminderCard } from '../../components/care';
import { useCare } from '../../state/care-context';
import { sortedReminders } from '../../lib/care';
import { colors } from '../../theme';

export default function AgendaScreen() {
  const { state, openEditor } = useCare();
  const pending = state.reminders.filter(r => !r.done).length;
  return <Screen>
    <View style={{ gap: 8 }}><Title>Su agenda, sin olvidos</Title><Copy style={{ color: colors.muted }}>Sus próximos planes, en un mismo lugar.</Copy></View>
    <Action icon="plus" onPress={openEditor}>Nuevo recordatorio</Action>
    <Copy weight="medium" style={{ color: colors.primaryText }}>{pending === 1 ? '1 plan pendiente' : `${pending} planes pendientes`}</Copy>
    {sortedReminders(state.reminders).map(reminder => <ReminderCard key={reminder.id} reminder={reminder} editable />)}
    <Footer />
  </Screen>;
}
