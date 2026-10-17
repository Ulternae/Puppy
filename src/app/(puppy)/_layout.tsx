import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '../../theme';
import { CareProvider } from '../../state/care-context';
import { ReminderEditor } from '../../components/care';
import { BrandHeader, Icon, type IconName } from '../../components/ui';

export default function PuppyLayout() {
  return <CareProvider><Navigation /><ReminderEditor /></CareProvider>;
}

function Navigation() {
  const insets = useSafeAreaInsets();
  const pages: { name: string; title: string; icon: IconName }[] = [
    { name: 'inicio', title: 'Mi día', icon: 'home-outline' },
    { name: 'mascotas', title: 'Mascotas', icon: 'paw-outline' },
    { name: 'mascota', title: 'Milo', icon: 'dog-side' },
    { name: 'agenda', title: 'Agenda', icon: 'calendar-month-outline' },
  ];
  return <Tabs initialRouteName="inicio" screenOptions={{
    header: () => <View style={{ paddingTop: insets.top, backgroundColor: colors.canvas }}><BrandHeader /></View>,
    sceneStyle: { backgroundColor: colors.canvas }, tabBarActiveTintColor: colors.primaryText,
    tabBarInactiveTintColor: colors.muted, tabBarLabelStyle: { fontFamily: fonts.medium, fontSize: 11 },
    tabBarStyle: { backgroundColor: colors.surface, borderTopWidth: 0, height: 72 + insets.bottom, paddingBottom: insets.bottom + 8, paddingTop: 8 },
  }}>{pages.map(page => <Tabs.Screen key={page.name} name={page.name} options={{ title: page.title, headerShown: page.name !== 'mascotas',
    tabBarIcon: ({ focused }) => <View style={{ width: 64, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: focused ? colors.primarySoft : 'transparent' }}>
      <Icon name={page.icon} size={24} color={focused ? colors.primaryDark : colors.muted} />
    </View>,
  }} />)}</Tabs>;
}
