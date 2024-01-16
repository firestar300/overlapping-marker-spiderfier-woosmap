import { defineConfig } from 'vite'
import license from 'rollup-plugin-license'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: '@mitori/woosmap-spiderfier',
      fileName: 'woosmap-spiderfier',
    },
    rollupOptions: {
      output: [
        {
          dir: 'dist',
          format: 'es',
          preserveModules: true,
          entryFileNames: '[name].js',
        },
      ],
      plugins: [
        license({
          thirdParty: {
            output: resolve(__dirname, './dist/vendor.LICENSE.txt'),
          },
        }),
      ],
    },
  },
})
