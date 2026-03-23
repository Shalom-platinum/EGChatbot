import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path";
// import { VitePWA } from 'vite-plugin-pwa'

const alias = {}
const defaultSrcPath = ['app-components', 'app-framework', 'app-modules', 'app-containers', 'app-model', 'app-routes', 'app-config', 'app-services', 'app-store', 'app-screens', 'assets', 'utils'];
defaultSrcPath.forEach(x => alias[x] = path.join(__dirname, `@/${x}`));

// REFERENCE - https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    // alias: { ...alias },
    alias:{
      "@": path.resolve(__dirname, "./src"),
    }
  },
  plugins: [
    // You can use vite pwa plugin here too;
    react({
      babel: {
        plugins: [
          'babel-plugin-macros'
        ]
      }
    }),
    // dynamicImport()
  ],
})


