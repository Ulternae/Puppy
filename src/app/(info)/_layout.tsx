import { View } from 'react-native';
import { Stack, router } from 'expo-router';
import { IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Copy } from '../../components/ui';
import { colors } from '../../theme';

export default function InfoLayout() {
  return <Stack screenOptions={{
    contentStyle: { backgroundColor: colors.canvas },
    header: ({ options }) => <SafeAreaView edges={['top']} style={{ backgroundColor: colors.canvas }}>
      <View style={{ minHeight: 64, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <IconButton icon="arrow-left" accessibilityLabel="Volver" iconColor={colors.primaryDark}
          onPress={() => { if (router.canGoBack()) router.back(); else router.replace('/inicio'); }} />
        <Copy weight="bold" style={{ fontSize: 22, lineHeight: 28 }}>{options.title}</Copy>
      </View>
    </SafeAreaView>,
  }}>
    <Stack.Screen name="contacto" options={{ title: 'Contacto' }} />
    <Stack.Screen name="acerca" options={{ title: 'Acerca de' }} />
  </Stack>;
}
