import {defineConfig} from 'vite'
import {litStyleLoader, litTemplateLoader} from '@mordech/vite-lit-loader';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    litStyleLoader(),
    litTemplateLoader(),
  ],
  optimizeDeps: {
    exclude: ['lit', 'lit-html'],
  },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: [
          "global-builtin",
          "color-functions",
        ]
      }
    }
  },
})
