import { useEffect } from 'react';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { Roboto_400Regular } from '@expo-google-fonts/roboto/400Regular';
import { Roboto_500Medium } from '@expo-google-fonts/roboto/500Medium';
import { Roboto_700Bold } from '@expo-google-fonts/roboto/700Bold';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, theme } from '../theme';
import { CareProvider } from '../state/care-context';
import { ReminderEditor } from '../components/care';
import { BrandHeader, Icon, type IconName } from '../components/ui';

void SplashScreen.preventAutoHideAsync();
export default function RootLayout() {
  const [loaded, error] = useFonts({ Roboto_400Regular, Roboto_500Medium, Roboto_700Bold });
  useEffect(() => { if (loaded || error) void SplashScreen.hideAsync(); }, [loaded, error]);
  if (!loaded && !error) return null;
  return <SafeAreaProvider><PaperProvider theme={theme} settings={{ icon: props => <Icon name={props.name as IconName} size={props.size} color={props.color} /> }}>
    <CareProvider><StatusBar style="dark" /><Navigation /><ReminderEditor /></CareProvider>
  </PaperProvider></SafeAreaProvider>;
}
function Navigation() {
  const insets = useSafeAreaInsets();
  const pages: { name: string; title: string; icon: IconName }[] = [
    { name: 'index', title: 'Mi día', icon: 'home-outline' },
    { name: 'mascota', title: 'Mascota', icon: 'paw-outline' },
    { name: 'agenda', title: 'Agenda', icon: 'calendar-month-outline' },
  ];
  return <Tabs screenOptions={{
    header: () => <View style={{ paddingTop: insets.top, backgroundColor: colors.canvas }}><BrandHeader /></View>,
    sceneStyle: { backgroundColor: colors.canvas }, tabBarActiveTintColor: colors.primaryText,
    tabBarInactiveTintColor: colors.muted, tabBarLabelStyle: { fontFamily: fonts.medium, fontSize: 11 },
    tabBarStyle: { backgroundColor: colors.surface, borderTopWidth: 0, height: 72 + insets.bottom, paddingBottom: insets.bottom + 8, paddingTop: 8 },
  }}>{pages.map(page => <Tabs.Screen key={page.name} name={page.name} options={{ title: page.title,
    tabBarIcon: ({ focused }) => <View style={{ width: 64, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: focused ? colors.primarySoft : 'transparent' }}>
      <Icon name={page.icon} size={24} color={focused ? colors.primaryDark : colors.muted} />
    </View>,
  }} />)}</Tabs>;
}
