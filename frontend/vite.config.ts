import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import process from 'process';
import path from 'path';
// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), svgr()],
    server: {
      open: true,
      port: 5173,
      proxy: {
        '/api': {
          target: env.VITE_API_FULL_URL,
          changeOrigin: true,
          secure: false,
          // 仅在非开发模式重写路径
          rewrite: mode !== 'development' ? (path) => path.replace(/^\/api/, '') : undefined
        }
      }
    },
    css: {
      preprocessorOptions: {
        less: {
           modifyVars: {
            hack: `true; @import (reference) "${path.resolve(__dirname, "src/assets/styles/base.less")}";`,
          },
          javascriptEnabled: true,
        }
      }
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src")
      }
    },
    build: {
      assetsInclude: ['**/*.png', '**/*.jpg', '**/*.svg'],
      sourcemap: false
    }
  }
});
