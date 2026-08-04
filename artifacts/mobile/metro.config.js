const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// @anthropic-ai/sdk is server-only (api-server). Exclude it from Metro's
// file watcher so a dangling temp directory from pnpm install doesn't crash
// the bundler.
config.resolver = config.resolver ?? {};
config.resolver.blockList = [
  ...(Array.isArray(config.resolver.blockList) ? config.resolver.blockList : []),
  /node_modules\/.pnpm\/@anthropic-ai\+sdk.*/,
];

module.exports = config;
