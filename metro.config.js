const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const { getBundleModeMetroConfig } = require('react-native-worklets/bundleMode');
const { withUniwindConfig } = require('uniwind/metro');

let config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push('sql');
config.resolver.unstable_enablePackageExports = false;
config.watchFolders.push(path.resolve(__dirname, 'packages'));

// ✅ 关键修复：用 glob 模式包含 .pnpm 下的 .worklets 文件
config.resolver.assetExts.push('js');
config.resolver.blockList = [
  /node_modules\/\.pnpm\/.*\.worklets\/.*/,
];

const defaultResolver = config.resolver.resolveRequest;

config = getBundleModeMetroConfig(config);

const bundleModeResolver = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith('react-native-worklets/.worklets/')) {
    return bundleModeResolver(context, moduleName, platform);
  }

  if (defaultResolver) {
    return defaultResolver(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withUniwindConfig(config, {
  cssEntryFile: './src/styles/global.css',
  dtsFile: './src/types/uniwind-types.d.ts',
});
