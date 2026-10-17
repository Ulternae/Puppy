import { useState } from 'react';
import { Keyboard, Platform, Pressable, View } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Dialog, HelperText, Portal, TextInput } from 'react-native-paper';
import { calendarDate, displayBirthDate, parseBirthDate } from '../../lib/registration';
import { colors } from '../../theme';
import { Action } from '../ui';

export type BirthDateFieldProps = { value: string; onChange: (value: string) => void; error?: string };
export default function BirthDateField({ value, onChange, error }: BirthDateFieldProps) {
  const [open, setOpen] = useState(false);
  const [selection, setSelection] = useState(new Date(2000, 0, 1, 12));
  function chooseDate() {
    Keyboard.dismiss();
    const date = parseBirthDate(value) ?? new Date(2000, 0, 1, 12);
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: date, mode: 'date', minimumDate: new Date(1900, 0, 1), maximumDate: new Date(),
        positiveButton: { label: 'Elegir fecha', textColor: colors.primaryDark },
        negativeButton: { label: 'Cancelar', textColor: colors.muted },
        onValueChange: (_event, picked) => onChange(calendarDate(picked)),
      });
    } else {
      setSelection(date);
      setOpen(true);
    }
  }
  return <View>
    <Pressable onPress={chooseDate} accessibilityRole="button" accessibilityLabel={`Fecha de nacimiento. ${displayBirthDate(value) || 'Selecciona una fecha'}`} accessibilityHint="Abre el selector de fecha" testID="birth-date">
      <View pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <TextInput mode="outlined" label="Fecha de nacimiento" value={displayBirthDate(value)} placeholder="Selecciona una fecha" editable={false} error={!!error}
          right={<TextInput.Icon icon="calendar-month-outline" />} style={{ backgroundColor: colors.surface }} />
      </View>
    </Pressable>
    {!!error && <HelperText type="error" accessibilityRole="alert">{error}</HelperText>}
    {open && <Portal><Dialog visible onDismiss={() => setOpen(false)} style={{ backgroundColor: colors.surface }}>
      <Dialog.Title>Fecha de nacimiento</Dialog.Title>
      <Dialog.Content><DateTimePicker value={selection} mode="date" display="spinner" themeVariant="light" textColor={colors.ink} accentColor={colors.primaryDark}
        minimumDate={new Date(1900, 0, 1)} maximumDate={new Date()} onValueChange={(_event, picked) => setSelection(picked)} /></Dialog.Content>
      <Dialog.Actions><Action secondary onPress={() => setOpen(false)}>Cancelar</Action><Action onPress={() => { onChange(calendarDate(selection)); setOpen(false); }}>Elegir fecha</Action></Dialog.Actions>
    </Dialog></Portal>}
  </View>;
}
