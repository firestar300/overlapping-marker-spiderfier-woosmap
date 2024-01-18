import { defineConfig } from 'vite'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
import license from 'rollup-plugin-license'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: '@mit0ri/woosmap-spiderfier',
      fileName: 'woosmap-spiderfier',
    },
    rollupOptions: {
      output: [
        {
          dir: 'dist',
          format: 'es',
          preserveModules: true,
          entryFileNames: '[name].js',
          manualChunks: undefined,
        },
      ],
      plugins: [
        cssInjectedByJsPlugin(),
        license({
          thirdParty: {
            output: resolve(__dirname, './dist/vendor.LICENSE.txt'),
          },
        }),
      ],
    },
  },
})
