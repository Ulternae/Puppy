import type { PropsWithChildren, Ref } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { IconButton } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme';
import { Copy, Icon } from '../ui';

export function RegistrationHeader({ confirmation, onBack, backLabel = 'Volver al inicio' }: { confirmation: boolean; onBack?: () => void; backLabel?: string }) {
  return <SafeAreaView edges={['top']} style={{ backgroundColor: colors.canvas }}>
    <View style={{ minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: onBack ? 8 : 20 }}>
      {onBack ? <IconButton icon="arrow-left" accessibilityLabel={backLabel} onPress={onBack} iconColor={colors.primaryDark} /> : <Icon name="account-outline" size={27} />}
      <Copy weight="bold" style={{ fontSize: 22, lineHeight: 28 }}>{confirmation ? 'Tu contacto' : 'Contacto'}</Copy>
    </View>
  </SafeAreaView>;
}

export function RegistrationScreen({ children, scrollRef }: PropsWithChildren<{ scrollRef?: Ref<ScrollView> }>) {
  const insets = useSafeAreaInsets();
  return <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.canvas }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={insets.top + 64}>
    <ScrollView ref={scrollRef} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag"
      contentContainerStyle={{ padding: 20, paddingBottom: 24 + insets.bottom, gap: 24, width: '100%', maxWidth: 600, alignSelf: 'center' }}>
      {children}
    </ScrollView>
  </KeyboardAvoidingView>;
}
