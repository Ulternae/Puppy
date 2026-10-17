import { useRef } from 'react';
import { AccessibilityInfo, Keyboard, ScrollView, View } from 'react-native';
import { HelperText, TextInput } from 'react-native-paper';
import { Action, Copy, Icon, Title } from '../../components/ui';
import { RegistrationScreen } from '../../components/registration/layout';
import { useSupport } from '../../state/support-context';
import { commentCopy, commentFeedback, supportEmail, type CommentField } from '../../lib/support';
import { colors } from '../../theme';

type InputRef = { focus: () => void } | null;
export default function ContactScreen() {
  const { draft, errors, status, changeField, submit, copyMessage } = useSupport();
  const refs = useRef<Partial<Record<CommentField, InputRef>>>({});
  const scroll = useRef<ScrollView>(null);
  const formTop = useRef(0);
  const positions = useRef<Partial<Record<CommentField, number>>>({});
  const pending = status === 'opening';
  const fallback = ['unavailable', 'error', 'copied', 'copyFailed'].includes(status);
  async function sendComment() {
    const invalid = await submit();
    if (invalid) {
      scroll.current?.scrollTo({ y: Math.max(0, formTop.current + (positions.current[invalid] ?? 0) - 12), animated: true });
      refs.current[invalid]?.focus();
      AccessibilityInfo.announceForAccessibility('Revisa los campos señalados antes de continuar.');
    } else Keyboard.dismiss();
  }
  return <RegistrationScreen scrollRef={scroll}>
    <View style={{ gap: 12 }}><Title>Hablemos de Puppy</Title><Copy style={{ color: colors.muted }}>Tu mensaje nos ayuda a cuidar cada detalle.</Copy></View>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><Icon name="email-outline" /><Copy selectable style={{ flex: 1, color: colors.primaryText }}>{supportEmail}</Copy></View>
    <View onLayout={event => { formTop.current = event.nativeEvent.layout.y; }} style={{ gap: 16 }}>
      <View onLayout={event => { positions.current.name = event.nativeEvent.layout.y; }}><TextInput ref={(ref: InputRef) => { refs.current.name = ref; }} mode="outlined" label="Nombre" accessibilityLabel="Nombre"
        value={draft.name} onChangeText={value => changeField('name', value)} maxLength={100} error={!!errors.name} disabled={pending}
        autoComplete="name" autoCapitalize="words" returnKeyType="next" onSubmitEditing={() => refs.current.email?.focus()} style={{ backgroundColor: colors.surface }} />
        {!!errors.name && <HelperText type="error" accessibilityRole="alert">{errors.name}</HelperText>}</View>
      <View onLayout={event => { positions.current.email = event.nativeEvent.layout.y; }}><TextInput ref={(ref: InputRef) => { refs.current.email = ref; }} mode="outlined" label="Tu correo" accessibilityLabel="Tu correo"
        value={draft.email} onChangeText={value => changeField('email', value)} maxLength={254} error={!!errors.email} disabled={pending}
        keyboardType="email-address" autoComplete="email" autoCapitalize="none" autoCorrect={false} returnKeyType="next"
        onSubmitEditing={() => refs.current.message?.focus()} style={{ backgroundColor: colors.surface }} />
        {!!errors.email && <HelperText type="error" accessibilityRole="alert">{errors.email}</HelperText>}</View>
      <View onLayout={event => { positions.current.message = event.nativeEvent.layout.y; }}><TextInput ref={(ref: InputRef) => { refs.current.message = ref; }} mode="outlined" label="Mensaje" accessibilityLabel="Mensaje"
        value={draft.message} onChangeText={value => changeField('message', value)} maxLength={2000} error={!!errors.message} disabled={pending}
        multiline numberOfLines={5} style={{ backgroundColor: colors.surface, minHeight: 150 }} />
        {errors.message ? <HelperText type="error" accessibilityRole="alert">{errors.message}</HelperText> : <HelperText type="info">{draft.message.length}/2000 caracteres</HelperText>}</View>
    </View>
    <View style={{ gap: 12 }}>
      <Action icon="send-outline" disabled={pending} loading={pending} onPress={() => { void sendComment(); }}>{pending ? 'Abriendo correo…' : 'Enviar comentario'}</Action>
      <Copy style={{ color: colors.muted, fontSize: 13 }}>Revisa y envía el mensaje desde tu aplicación de correo.</Copy>
    </View>
    {status !== 'idle' && <View accessibilityLiveRegion="polite" style={{ padding: 16, gap: 12, borderRadius: 12, backgroundColor: colors.primarySubtle }}>
      <Copy style={{ fontSize: 14 }}>{commentFeedback(status)}</Copy>
      {fallback && <Action secondary icon="content-copy" onPress={() => { void copyMessage(); }}>Copiar mensaje</Action>}
      {status === 'copyFailed' && <Copy selectable style={{ fontSize: 13 }}>{commentCopy(draft)}</Copy>}
    </View>}
  </RegistrationScreen>;
}
