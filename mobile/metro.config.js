const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const repoRoot = path.resolve(projectRoot, '..');
const sharedLib = path.resolve(repoRoot, 'src/lib');

const config = getDefaultConfig(projectRoot);

// The puzzle engine is shared verbatim with the Next.js app rather than copied,
// so generator.ts stays single-source. Metro has to watch it explicitly because
// it lives outside this project root.
config.watchFolders = [sharedLib];

// Files outside the project root still have to resolve their imports (zod, react)
// against this app's node_modules. Hierarchical lookup stays ON: npm nests some
// transitive deps (expo-asset lives under expo/node_modules), and disabling it
// makes those unresolvable.
config.resolver.nodeModulesPaths = [path.resolve(projectRoot, 'node_modules')];
config.resolver.extraNodeModules = {
  '@shared': sharedLib,
};

// Package imports made *from* the shared files resolve as if they came from this
// app. Without this, `import { z } from 'zod'` inside generator.ts would bind to
// the web app's copy of zod whenever the web app happens to be npm-installed,
// silently pulling a second zod into the bundle.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const isShared = context.originModulePath?.startsWith(sharedLib);
  const isBareImport = !moduleName.startsWith('.') && !path.isAbsolute(moduleName);

  if (isShared && isBareImport) {
    return context.resolveRequest(
      { ...context, originModulePath: path.join(projectRoot, 'index.ts') },
      moduleName,
      platform
    );
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
