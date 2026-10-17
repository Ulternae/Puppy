import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  const registration = process.env.EXPO_PUBLIC_APP_VARIANT === 'registration';
  return {
    ...config,
    name: registration ? 'Registro de contactos' : 'PuppyMobile',
    slug: registration ? 'puppy-registration' : 'PuppyMobile',
    scheme: registration ? 'puppyregistration' : 'puppymobile',
  };
};
