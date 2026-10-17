import { Pressable, View } from 'react-native';
import { router, usePathname } from 'expo-router';
import { TopTabs, type MaterialTopTabBarProps } from 'expo-router/js-top-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '../../theme';
import { CareProvider } from '../../state/care-context';
import { ReminderEditor } from '../../components/care';
import { BrandHeader, Copy, Icon, type IconName } from '../../components/ui';
import { PetCatalogHeader } from '../../components/pets';

const pages: { name: string; title: string; icon: IconName }[] = [
  { name: 'inicio', title: 'Mi día', icon: 'home-outline' },
  { name: 'mascotas', title: 'Mascotas', icon: 'paw-outline' },
  { name: 'mascota', title: 'Milo', icon: 'dog-side' },
  { name: 'agenda', title: 'Agenda', icon: 'calendar-month-outline' },
];

export default function PuppyLayout() {
  return <CareProvider><Navigation /><ReminderEditor /></CareProvider>;
}

function Navigation() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const catalog = pathname.startsWith('/mascotas');
  return <View style={{ flex: 1, backgroundColor: colors.canvas }}>
    {catalog ? <PetCatalogHeader favorites={pathname === '/mascotas/favoritos'} /> : <View style={{ paddingTop: insets.top }}><BrandHeader /></View>}
    <TopTabs initialRouteName="inicio" backBehavior="history" tabBarPosition="bottom" tabBar={BottomBar}
      screenOptions={{ swipeEnabled: true, animationEnabled: true, lazy: true, lazyPreloadDistance: 1, sceneStyle: { backgroundColor: colors.canvas } }}>
      {pages.map(page => <TopTabs.Screen key={page.name} name={page.name} options={{ title: page.title }} />)}
    </TopTabs>
  </View>;
}

function BottomBar({ state, navigation }: MaterialTopTabBarProps) {
  const insets = useSafeAreaInsets();
  return <View style={{ flexDirection: 'row', backgroundColor: colors.surface, paddingTop: 8, paddingBottom: insets.bottom + 8 }}>
    {state.routes.map((route: { name: string; key: string }, index: number) => {
      const page = pages.find(item => item.name === route.name);
      if (!page) return null;
      const focused = state.index === index;
      return <Pressable key={route.key} testID={`tab-${route.name}`} accessibilityRole="tab" accessibilityLabel={page.title} accessibilityState={{ selected: focused }}
        onPress={() => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (event.defaultPrevented) return;
          if (focused && route.name === 'mascotas') router.dismissTo('/mascotas');
          else if (!focused) navigation.navigate(route.name);
        }}
        style={({ pressed }) => ({ flex: 1, minHeight: 56, alignItems: 'center', justifyContent: 'center', gap: 2, opacity: pressed ? 0.7 : 1 })}>
        <View style={{ width: 64, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: focused ? colors.primarySoft : 'transparent' }}>
          <Icon name={page.icon} size={24} color={focused ? colors.primaryDark : colors.muted} />
        </View>
        <Copy weight="medium" style={{ fontFamily: fonts.medium, fontSize: 11, lineHeight: 16, color: focused ? colors.primaryText : colors.muted }}>{page.title}</Copy>
      </Pressable>;
    })}
  </View>;
}
