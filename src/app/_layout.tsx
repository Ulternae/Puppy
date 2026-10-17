import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { Roboto_400Regular } from '@expo-google-fonts/roboto/400Regular';
import { Roboto_500Medium } from '@expo-google-fonts/roboto/500Medium';
import { Roboto_700Bold } from '@expo-google-fonts/roboto/700Bold';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors, theme } from '../theme';
import { Icon, type IconName } from '../components/ui';
import { RegistrationProvider } from '../state/registration-context';

void SplashScreen.preventAutoHideAsync();
export default function RootLayout() {
  const [loaded, error] = useFonts({ Roboto_400Regular, Roboto_500Medium, Roboto_700Bold });
  useEffect(() => { if (loaded || error) void SplashScreen.hideAsync(); }, [loaded, error]);
  if (!loaded && !error) return null;
  return <SafeAreaProvider><PaperProvider theme={theme} settings={{ icon: props => <Icon name={props.name as IconName} size={props.size} color={props.color} /> }}>
    <RegistrationProvider><StatusBar style="dark" />
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.canvas } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(puppy)" />
      <Stack.Screen name="registro" />
    </Stack></RegistrationProvider>
  </PaperProvider></SafeAreaProvider>;
}
