import { Redirect } from 'expo-router';
import { isRegistrationApp } from '../lib/app-mode';

export default function EntryScreen() {
  return <Redirect href={isRegistrationApp ? '/registro' : '/inicio'} />;
}
