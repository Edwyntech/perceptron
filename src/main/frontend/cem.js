import {customElementJetBrainsPlugin} from "custom-element-jet-brains-integration";

// @type {import('custom-element-jet-brains-integration').PluginOptions}
const pluginOptions = {
  packagejson: true,
  outdir: 'src/main/frontend',
};

// @type {import('@custom-elements-manifest/analyzer').Config}
export default {
  plugins: [customElementJetBrainsPlugin(pluginOptions)],
  dependencies: true,
  globs: [
    'src/**/*.ts',
  ],
  outdir: 'src/main/frontend',
  litelement: true,
  packagejson: true,
};
