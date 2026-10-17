import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Dialog, HelperText, Portal, TextInput } from 'react-native-paper';
import { dayAfter, inputDate, readableDate, routines, validateReminder, type Reminder, type ReminderDraft } from '../lib/care';
import { useCare } from '../state/care-context';
import { colors } from '../theme';
import { Action, Copy, Icon } from './ui';

export function RoutineList() {
  const { state, toggleRoutine } = useCare();
  return <View style={{ gap: 14 }}>
    <View style={styles.heading}><Copy accessibilityRole="header" weight="bold" style={styles.headingText}>Sus pequeños rituales</Copy><Copy style={styles.progress}>{state.completed.length} de 3 completados</Copy></View>
    <View style={styles.routineList}>{routines.map(routine => {
      const checked = state.completed.includes(routine.id);
      return <Pressable key={routine.id} testID={`routine-${routine.id}`} onPress={() => toggleRoutine(routine.id)}
        accessibilityRole="checkbox" accessibilityLabel={routine.title} accessibilityState={{ checked }}
        android_ripple={{ color: colors.primarySoft }} style={({ pressed }) => [styles.routine, pressed && { backgroundColor: colors.primarySubtle }]}>
        <View style={styles.routineIcon}><Icon name={routine.icon} /></View>
        <View style={{ flex: 1, gap: 4 }}><Copy weight="medium" style={{ fontSize: 14, lineHeight: 20 }}>{routine.title}</Copy><Copy style={styles.detail}>{routine.detail}</Copy></View>
        <View style={[styles.check, checked && { backgroundColor: colors.primaryDark, borderColor: colors.primaryDark }]}>{checked && <Icon name="check" size={18} color={colors.surface} />}</View>
      </Pressable>;
    })}</View>
    <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}><Icon name="heart-outline" size={18} color={colors.accent} /><Copy style={styles.detail}>Cada cuidado cuenta. Vas muy bien.</Copy></View>
  </View>;
}
export function ReminderCard({ reminder, editable = false }: { reminder: Reminder; editable?: boolean }) {
  const { toggleReminder } = useCare();
  const date = new Date(`${reminder.date}T12:00:00`);
  return <View style={[styles.reminder, reminder.done && { backgroundColor: colors.primarySoft }]}>
    <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
      <View style={styles.date}><Copy weight="bold" style={{ fontSize: 24, lineHeight: 28 }}>{date.getDate()}</Copy><Copy style={{ fontSize: 11, lineHeight: 16, color: colors.muted }}>{readableDate(reminder.date, { month: 'short' }).replace('.', '').toUpperCase()}</Copy></View>
      <View style={{ flex: 1, gap: 4 }}><Copy weight="medium" style={{ fontSize: 14, textTransform: 'capitalize' }}>{readableDate(reminder.date, { weekday: 'long' })}</Copy><Copy style={styles.detail}>{reminder.time}</Copy></View>
    </View>
    <Copy weight="bold" style={{ fontSize: 18 }}>{reminder.title}</Copy>
    {!!reminder.notes && <Copy style={{ color: colors.muted, fontSize: 14 }}>{reminder.notes}</Copy>}
    {editable && <Action secondary icon={reminder.done ? 'undo' : 'check'} onPress={() => toggleReminder(reminder.id)}>{reminder.done ? 'Reabrir recordatorio' : 'Marcar como completado'}</Action>}
    {reminder.done && <Copy weight="medium" style={{ color: colors.primaryText, fontSize: 14 }}>Completado</Copy>}
  </View>;
}
export function ReminderEditor() {
  const { editorOpen } = useCare();
  return editorOpen ? <EditorContent /> : null;
}
function EditorContent() {
  const { closeEditor, addReminder } = useCare();
  const [draft, setDraft] = useState<ReminderDraft>(() => ({ title: '', date: inputDate(dayAfter(2)), time: '10:00', notes: '' }));
  const [errors, setErrors] = useState<Partial<Record<keyof ReminderDraft, string>>>({});
  function save() {
    const result = validateReminder(draft);
    if (!result.ok) { setErrors(result.errors); return; }
    addReminder(result.value);
  }
  return <Portal><Dialog visible onDismiss={closeEditor} style={{ backgroundColor: colors.surface, maxWidth: 520, width: '90%', alignSelf: 'center' }}>
    <Dialog.Title>Nuevo recordatorio</Dialog.Title>
    <Dialog.ScrollArea style={{ maxHeight: 380, paddingHorizontal: 20 }}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingVertical: 16, gap: 12 }}>
      {([['title', 'Título', 80], ['date', 'Fecha (DD/MM/AAAA)', 10], ['time', 'Hora (HH:mm)', 5], ['notes', 'Descripción (opcional)', 200]] as const).map(([key, label, limit]) => <View key={key}>
        <TextInput mode="outlined" label={label} accessibilityLabel={label} value={draft[key]} maxLength={limit} multiline={key === 'notes'}
          autoFocus={key === 'title'} error={!!errors[key]} onChangeText={value => { setDraft(prev => ({ ...prev, [key]: value })); setErrors(prev => ({ ...prev, [key]: undefined })); }}
          style={{ backgroundColor: colors.surface }} />
        {!!errors[key] && <HelperText type="error" accessibilityRole="alert">{errors[key]}</HelperText>}
      </View>)}
    </ScrollView></Dialog.ScrollArea>
    <Dialog.Actions><Action secondary onPress={closeEditor}>Cancelar</Action><Action onPress={save}>Guardar</Action></Dialog.Actions>
  </Dialog></Portal>;
}
const styles = StyleSheet.create({
  heading: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'space-between' },
  headingText: { fontSize: 20, lineHeight: 26 }, progress: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  routineList: { backgroundColor: colors.surface, borderRadius: 16, paddingVertical: 6, overflow: 'hidden' },
  routine: { minHeight: 90, flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 14 },
  routineIcon: { width: 44, height: 44, backgroundColor: colors.primarySubtle, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  check: { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, borderColor: colors.outline, alignItems: 'center', justifyContent: 'center' },
  detail: { fontSize: 13, lineHeight: 19, color: colors.muted },
  reminder: { backgroundColor: colors.accentSoft, borderRadius: 16, padding: 24, gap: 16 },
  date: { minWidth: 52, minHeight: 58, padding: 8, backgroundColor: colors.surface, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});
