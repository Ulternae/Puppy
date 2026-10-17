import { configureFonts, MD3LightTheme } from 'react-native-paper';

export const colors = {
  primary: '#F0DEC7', primaryDark: '#A64B38', primaryText: '#A64B38',
  primarySoft: '#F5E3D6', primarySubtle: '#FAF0E6', accent: '#A64B38',
  action: '#3C2F33', accentSoft: '#F7E8DE', ink: '#3C2F33', muted: '#705E55',
  canvas: '#FFFFFF', surface: '#FFFDFA', outline: '#967E71',
  divider: '#E9DBCF', error: '#AF302B', errorSoft: '#FFE8E2',
  rating: '#A76506',
} as const;

export const fonts = {
  regular: 'Roboto_400Regular', medium: 'Roboto_500Medium', bold: 'Roboto_700Bold',
} as const;

export const theme = {
  ...MD3LightTheme,
  fonts: configureFonts({ config: { fontFamily: fonts.regular } }),
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primaryDark, onPrimary: colors.surface,
    primaryContainer: colors.primarySoft, onPrimaryContainer: colors.primaryText,
    secondary: colors.action, onSecondary: colors.surface,
    secondaryContainer: colors.accentSoft, onSecondaryContainer: colors.ink,
    tertiary: colors.primaryDark, onTertiary: colors.surface,
    tertiaryContainer: colors.primary, onTertiaryContainer: colors.ink,
    background: colors.canvas, surface: colors.surface, surfaceVariant: colors.primarySubtle,
    onBackground: colors.ink, onSurface: colors.ink, onSurfaceVariant: colors.muted,
    outline: colors.outline, outlineVariant: colors.divider,
    error: colors.error, onError: colors.surface,
    errorContainer: colors.errorSoft, onErrorContainer: colors.error,
    inverseSurface: colors.ink, inverseOnSurface: colors.canvas, inversePrimary: colors.primary,
    surfaceDisabled: 'rgba(60, 47, 51, 0.12)', onSurfaceDisabled: 'rgba(60, 47, 51, 0.38)',
    backdrop: 'rgba(60, 47, 51, 0.4)', shadow: colors.ink, scrim: colors.ink,
    elevation: {
      level0: 'transparent', level1: '#FCF5EC', level2: '#F9F0E6',
      level3: '#F6EBE0', level4: '#F4E8DC', level5: '#F1E4D8',
    },
  },
};
