import { useCallback } from 'react';
import { BackHandler } from 'react-native';
import { Stack, router, useFocusEffect, usePathname } from 'expo-router';
import { PetCatalogHeader } from '../../../components/pets';
import { colors } from '../../../theme';

export const unstable_settings = { initialRouteName: 'index' };

export default function PetsLayout() {
  const pathname = usePathname();
  useFocusEffect(useCallback(() => {
    const listener = BackHandler.addEventListener('hardwareBackPress', () => {
      if (pathname === '/mascotas/favoritos') router.dismissTo('/mascotas');
      else router.navigate('/inicio');
      return true;
    });
    return () => listener.remove();
  }, [pathname]));
  return <Stack screenOptions={({ route }) => ({
    contentStyle: { backgroundColor: colors.canvas },
    header: () => <PetCatalogHeader favorites={route.name === 'favoritos'} />,
  })}>
    <Stack.Screen name="index" options={{ title: 'Mascotas' }} />
    <Stack.Screen name="favoritos" options={{ title: 'Favoritos' }} />
  </Stack>;
}
