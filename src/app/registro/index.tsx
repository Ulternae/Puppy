import { useRef } from 'react';
import { AccessibilityInfo, Keyboard, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { HelperText, TextInput } from 'react-native-paper';
import { Action, Copy, Title } from '../../components/ui';
import { RegistrationScreen } from '../../components/registration/layout';
import BirthDateField from '../../components/registration/birth-date-field';
import { useRegistration } from '../../state/registration-context';
import { colors } from '../../theme';
import type { ContactField } from '../../lib/registration';

type InputRef = { focus: () => void } | null;
export default function ContactFormScreen() {
  const { draft, errors, changeField, review } = useRegistration();
  const refs = useRef<Partial<Record<ContactField, InputRef>>>({});
  const scrollRef = useRef<ScrollView>(null);
  const formTop = useRef(0);
  const positions = useRef<Partial<Record<ContactField, number>>>({});
  function next() {
    const invalid = review();
    if (invalid) {
      scrollRef.current?.scrollTo({ y: Math.max(0, formTop.current + (positions.current[invalid] ?? 0) - 12), animated: true });
      refs.current[invalid]?.focus();
      AccessibilityInfo.announceForAccessibility('Revisa los campos señalados antes de continuar.');
      return;
    }
    Keyboard.dismiss();
    router.navigate('/registro/confirmar');
  }
  return <RegistrationScreen scrollRef={scrollRef}>
    <View style={{ gap: 12 }}><Title>Tu contacto, a mano.</Title><Copy style={{ color: colors.muted }}>Completa tus datos. Todos los campos son obligatorios. Podrás revisarlos antes de continuar.</Copy></View>
    <View onLayout={event => { formTop.current = event.nativeEvent.layout.y; }} style={{ gap: 16 }}>
      <View onLayout={event => { positions.current.fullName = event.nativeEvent.layout.y; }}><TextInput mode="outlined" label="Nombre completo" placeholder="Tu nombre y apellidos" accessibilityLabel="Nombre completo"
        ref={(ref: InputRef) => { refs.current.fullName = ref; }} value={draft.fullName} onChangeText={value => changeField('fullName', value)} error={!!errors.fullName}
        maxLength={100} autoComplete="name" textContentType="name" autoCapitalize="words" returnKeyType="done" style={{ backgroundColor: colors.surface }} />
        {!!errors.fullName && <HelperText type="error" accessibilityRole="alert">{errors.fullName}</HelperText>}</View>
      <View onLayout={event => { positions.current.birthDate = event.nativeEvent.layout.y; }}><BirthDateField value={draft.birthDate} onChange={value => changeField('birthDate', value)} error={errors.birthDate} /></View>
      <View onLayout={event => { positions.current.phone = event.nativeEvent.layout.y; }}><TextInput mode="outlined" label="Teléfono" placeholder="Número de contacto" accessibilityLabel="Teléfono"
        ref={(ref: InputRef) => { refs.current.phone = ref; }} value={draft.phone} onChangeText={value => changeField('phone', value)} error={!!errors.phone}
        maxLength={30} keyboardType="phone-pad" autoComplete="tel" textContentType="telephoneNumber" style={{ backgroundColor: colors.surface }} />
        {!!errors.phone && <HelperText type="error" accessibilityRole="alert">{errors.phone}</HelperText>}</View>
      <View onLayout={event => { positions.current.email = event.nativeEvent.layout.y; }}><TextInput mode="outlined" label="Email" placeholder="nombre@correo.com" accessibilityLabel="Email"
        ref={(ref: InputRef) => { refs.current.email = ref; }} value={draft.email} onChangeText={value => changeField('email', value)} error={!!errors.email}
        maxLength={254} keyboardType="email-address" autoComplete="email" textContentType="emailAddress" autoCapitalize="none" autoCorrect={false}
        returnKeyType="next" onSubmitEditing={() => refs.current.description?.focus()} style={{ backgroundColor: colors.surface }} />
        {!!errors.email && <HelperText type="error" accessibilityRole="alert">{errors.email}</HelperText>}</View>
      <View onLayout={event => { positions.current.description = event.nativeEvent.layout.y; }}><TextInput mode="outlined" label="Descripción del contacto" placeholder="Cuéntanos un poco de ti" accessibilityLabel="Descripción del contacto"
        ref={(ref: InputRef) => { refs.current.description = ref; }} value={draft.description} onChangeText={value => changeField('description', value)} error={!!errors.description}
        maxLength={500} multiline numberOfLines={4} style={{ backgroundColor: colors.surface, minHeight: 120 }} />
        {errors.description ? <HelperText type="error" accessibilityRole="alert">{errors.description}</HelperText> : <HelperText type="info">{draft.description.length}/500 caracteres</HelperText>}</View>
    </View>
    <Action icon="arrow-right" onPress={next}>Siguiente</Action>
  </RegistrationScreen>;
}
