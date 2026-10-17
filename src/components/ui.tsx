import { useState, type ComponentProps, type PropsWithChildren } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type TextProps,
  type AccessibilityState,
} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import { Button, IconButton, Menu } from "react-native-paper";
import { colors, fonts } from "../theme";
import { useRegistration } from "../state/registration-context";

export type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];
export function Icon({
  name,
  size = 22,
  color = colors.primaryDark,
}: {
  name: IconName;
  size?: number;
  color?: string;
}) {
  return (
    <MaterialCommunityIcons
      name={name}
      size={size}
      color={color}
      accessible={false}
    />
  );
}
export function Copy({
  weight = "regular",
  style,
  ...props
}: TextProps & { weight?: keyof typeof fonts }) {
  return (
    <Text
      {...props}
      style={[styles.copy, { fontFamily: fonts[weight] }, style]}
    />
  );
}
export function Title({ children }: PropsWithChildren) {
  return (
    <Copy accessibilityRole="header" weight="bold" style={styles.title}>
      {children}
    </Copy>
  );
}
export function Screen({ children }: PropsWithChildren) {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}
export function Action({
  children,
  onPress,
  icon,
  secondary = false,
  dark = false,
  accessibilityLabel,
  accessibilityState,
  disabled = false,
  loading = false,
}: PropsWithChildren<{
  onPress: () => void;
  icon?: IconName;
  secondary?: boolean;
  dark?: boolean;
  accessibilityLabel?: string;
  accessibilityState?: AccessibilityState;
  disabled?: boolean;
  loading?: boolean;
}>) {
  return (
    <Button
      mode={secondary ? "outlined" : "contained"}
      onPress={onPress}
      disabled={disabled}
      loading={loading}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={accessibilityState}
      icon={
        icon
          ? ({ size, color }) => <Icon name={icon} size={size} color={color} />
          : undefined
      }
      buttonColor={
        secondary ? colors.surface : dark ? colors.ink : colors.action
      }
      textColor={secondary ? colors.primaryDark : colors.surface}
      contentStyle={{ minHeight: 48 }}
      labelStyle={{ fontFamily: fonts.medium, fontSize: 14 }}
      style={{ borderRadius: 26, borderColor: colors.outline }}
    >
      {children}
    </Button>
  );
}
export function AppMenu() {
  const { savedContact, viewContact } = useRegistration();
  const [visible, setVisible] = useState(false);
  const links = [
    ["Mi día", "/inicio"],
    ["Mi mascota", "/mascota"],
    ["Agenda", "/agenda"],
    ["Explorar mascotas", "/mascotas"],
    [savedContact ? "Ver contacto" : "Registrar contacto", savedContact ? "/registro/confirmar" : "/registro"],
    ["Contacto", "/contacto"],
    ["Acerca de", "/acerca"],
  ] as const;
  return <Menu
          visible={visible}
          onDismiss={() => setVisible(false)}
          anchor={
            <IconButton
              icon="menu"
              accessibilityLabel="Abrir menú de navegación"
              onPress={() => setVisible(true)}
              iconColor={colors.ink}
              size={24}
              style={{ margin: 0 }}
            />
          }
        >
          {links.map(([label, href]) => (
            <Menu.Item
              key={href}
              title={label}
              onPress={() => {
                setVisible(false);
                if (href === "/registro/confirmar") viewContact();
                router.navigate(href);
              }}
            />
          ))}
        </Menu>;
}
export function BrandHeader() {
  return <View style={styles.header}>
    <View style={styles.brand}><Icon name="paw-outline" size={27} /><Copy weight="bold" style={styles.wordmark}>puppy</Copy></View>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <View style={styles.avatar} accessibilityLabel="Perfil de Dani"><Copy weight="bold">D</Copy></View>
      <IconButton icon="star-outline" iconColor={colors.primaryDark} accessibilityLabel="Ver cinco mascotas favoritas" onPress={() => router.navigate('/mascotas/favoritos')} style={{ margin: 0 }} />
      <AppMenu />
    </View>
  </View>;
}
export function Mascot({ large = false }: { large?: boolean }) {
  return (
    <Image
      source={require("../../assets/brand/puppy-milo.png")}
      accessibilityLabel="Milo, el cachorro de la marca Puppy"
      resizeMode="contain"
      style={{ width: large ? 220 : 144, height: large ? 188 : 124 }}
    />
  );
}
export function Footer() {
  return (
    <View style={{ gap: 4, paddingTop: 4 }}>
      <Copy style={styles.small}>Hecho para cuidar, con cariño.</Copy>
    </View>
  );
}
export function NavText({
  children,
  onPress,
}: PropsWithChildren<{ onPress: () => void }>) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={styles.textAction}
    >
      <Copy weight="medium" style={{ color: colors.primaryText }}>
        {children}
      </Copy>
      <Icon name="arrow-top-right" size={18} />
    </Pressable>
  );
}
const styles = StyleSheet.create({
  copy: { fontSize: 16, lineHeight: 23, color: colors.ink },
  title: { fontSize: 28, lineHeight: 34 },
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: {
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    padding: 20,
    paddingBottom: 32,
    gap: 24,
  },
  header: {
    minHeight: 64,
    backgroundColor: colors.canvas,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: { flexDirection: "row", gap: 10, alignItems: "center" },
  wordmark: { fontSize: 28, lineHeight: 34 },
  avatar: {
    width: 36,
    height: 36,
    backgroundColor: colors.divider,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  small: { fontSize: 12, lineHeight: 18, color: colors.muted },
  textAction: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
