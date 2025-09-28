import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isDev = command === 'serve' || mode === 'development'
  const proxyTarget = env.VITE_PROXY_TARGET || 'http://localhost:8082'
  
  return {
    plugins: [
      vue(),
      ...(isDev ? [vueDevTools()] : []),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    server: {
      host: true,
      port: 3000,
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('🔴 代理错误:', err.message);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log(`🚀 代理请求: ${req.method} ${req.url} -> ${proxyTarget}${req.url}`);
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log(`📥 代理响应: ${proxyRes.statusCode} ${req.url}`);
            });
          },
        },
      },
    },
    build: {
      target: 'es2019',
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (/vue|element-plus|@element-plus|vue-router|pinia/.test(id)) {
                return 'vendor'
              }
              if (/axios|dayjs|@vueuse/.test(id)) {
                return 'utils'
              }
            }
          }
        }
      }
    },
    define: {
      __VUE_I18N_FULL_INSTALL__: true,
      __VUE_I18N_LEGACY_API__: false,
      __INTLIFY_PROD_DEVTOOLS__: false,
    },
  }
})
