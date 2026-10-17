import { useCallback } from 'react';
import { BackHandler } from 'react-native';
import { Stack, router, useFocusEffect, usePathname } from 'expo-router';
import { RegistrationHeader } from '../../components/registration/layout';
import { colors } from '../../theme';
import { isRegistrationApp } from '../../lib/app-mode';
import { useRegistration } from '../../state/registration-context';

export const unstable_settings = { initialRouteName: 'index' };

export default function RegistrationLayout() {
  const { confirmed, savedContact } = useRegistration();
  const accepted = !!confirmed && confirmed === savedContact;
  const pathname = usePathname();
  const backFromReview = useCallback(() => {
    router.dismissTo(accepted && !isRegistrationApp ? '/inicio' : '/registro');
  }, [accepted]);
  useFocusEffect(useCallback(() => {
    const listener = BackHandler.addEventListener('hardwareBackPress', () => {
      if (pathname === '/registro/confirmar') {
        backFromReview();
        return true;
      }
      if (!isRegistrationApp) {
        router.dismissTo('/inicio');
        return true;
      }
      return false;
    });
    return () => listener.remove();
  }, [pathname, backFromReview]));
  return <Stack screenOptions={({ route }) => ({
    contentStyle: { backgroundColor: colors.canvas },
    gestureEnabled: !(route.name === 'confirmar' && accepted && !isRegistrationApp),
    header: () => <RegistrationHeader confirmation={route.name === 'confirmar'} onBack={route.name === 'confirmar'
      ? backFromReview
      : isRegistrationApp ? undefined : () => router.dismissTo('/inicio')}
      backLabel={route.name === 'confirmar' && (!accepted || isRegistrationApp) ? 'Volver a editar los datos' : 'Volver al inicio'} />,
  })}>
    <Stack.Screen name="index" options={{ title: 'Contacto' }} />
    <Stack.Screen name="confirmar" options={{ title: 'Tu contacto' }} />
  </Stack>;
}
