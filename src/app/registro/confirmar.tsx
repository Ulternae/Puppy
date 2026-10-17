import { View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { Action, Copy, Icon, Title } from '../../components/ui';
import { RegistrationScreen } from '../../components/registration/layout';
import { displayBirthDate } from '../../lib/registration';
import { useRegistration } from '../../state/registration-context';
import { colors } from '../../theme';
import { isRegistrationApp } from '../../lib/app-mode';

export default function ContactConfirmationScreen() {
  const { confirmed, savedContact, acceptContact } = useRegistration();
  const accepted = !!confirmed && savedContact === confirmed;
  if (!confirmed) return <Redirect href="/registro" />;
  const rows = [
    ['Nombre completo', confirmed.fullName],
    ['Fecha de nacimiento', displayBirthDate(confirmed.birthDate)],
    ['Teléfono', confirmed.phone],
    ['Email', confirmed.email],
    ['Descripción del contacto', confirmed.description],
  ];
  return <RegistrationScreen>
    <View style={{ gap: 12 }}><Title>{accepted ? '¡Todo listo!' : '¿Todo está bien?'}</Title><Copy style={{ color: colors.muted }}>{accepted ? 'Has confirmado los datos de este contacto. Puedes editarlos cuando lo necesites.' : 'Revisa tu información. Puedes volver y cambiar cualquier dato.'}</Copy></View>
    <View style={{ backgroundColor: colors.surface, borderRadius: 16, paddingHorizontal: 20 }}>
      {rows.map(([label, value], index) => <View key={label} style={{ paddingVertical: 18, gap: 6, borderBottomWidth: index === rows.length - 1 ? 0 : 1, borderBottomColor: colors.divider }}>
        <Copy style={{ fontSize: 13, color: colors.muted }}>{label}</Copy>
        <Copy selectable weight="medium" style={{ flexShrink: 1 }}>{value}</Copy>
      </View>)}
    </View>
    <View style={{ gap: 12 }}>
      {accepted ? <View accessibilityLiveRegion="polite" style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 12, backgroundColor: colors.primarySoft }}>
        <Icon name="check-circle-outline" size={24} />
        <Copy weight="medium" style={{ flex: 1 }}>Datos confirmados.</Copy>
      </View> : <Action icon="check" onPress={acceptContact}>Confirmar datos</Action>}
      {accepted && !isRegistrationApp && <Action icon="home-outline" onPress={() => router.dismissTo('/inicio')}>Volver al inicio</Action>}
      <Action secondary icon="pencil-outline" onPress={() => router.dismissTo('/registro')}>Editar datos</Action>
    </View>
  </RegistrationScreen>;
}
