import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const expoRequire = createRequire(require.resolve('expo/package.json'));
const cliRequire = createRequire(expoRequire.resolve('@expo/cli/package.json'));
const { getTypedRoutesDeclarationFile } = cliRequire('@expo/router-server/build/typed-routes/generate');
const { requireContext } = require('expo-router/internal/testing');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
// Use a fresh, slash-normalized context rather than Metro's incremental Windows cache.
const context = requireContext(resolve(root, 'src/app'));
const declaration = getTypedRoutesDeclarationFile(context);
if (!declaration) throw new Error('Expo Router could not generate route types.');
// Metro also writes .expo/types while running. Keep typecheck's snapshot isolated.
const output = resolve(root, '.expo/typecheck');
mkdirSync(output, { recursive: true });
writeFileSync(resolve(output, 'router.d.ts'), declaration);
