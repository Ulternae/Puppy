import { createElement, useId, type ChangeEvent } from 'react';
import { View } from 'react-native';
import { HelperText } from 'react-native-paper';
import { calendarDate } from '../../lib/registration';
import { colors, fonts } from '../../theme';
import type { BirthDateFieldProps } from './birth-date-field';

export default function BirthDateField({ value, onChange, error }: BirthDateFieldProps) {
  const id = useId();
  return <View style={{ gap: 4 }}>
    {createElement('label', { htmlFor: id, style: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted } }, 'Fecha de nacimiento')}
    {createElement('input', {
      id, type: 'date', value, min: '1900-01-01', max: calendarDate(new Date()), 'aria-invalid': !!error,
      'aria-describedby': error ? `${id}-error` : undefined,
      onChange: (event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value),
      style: { minHeight: 56, boxSizing: 'border-box', width: '100%', borderRadius: 4, padding: '12px 14px',
        border: `1px solid ${error ? colors.error : colors.outline}`, background: colors.surface, color: colors.ink,
        fontFamily: fonts.regular, fontSize: 16, colorScheme: 'light', accentColor: colors.primaryDark },
    })}
    {!!error && <HelperText nativeID={`${id}-error`} type="error" accessibilityRole="alert">{error}</HelperText>}
  </View>;
}
