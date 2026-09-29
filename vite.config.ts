import { defineConfig, loadEnv, type Plugin } from 'vite'
import { reactRouter } from '@react-router/dev/vite'
import wyw from '@wyw-in-js/vite'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { lookup } from 'mrmime'

function serveShared(): Plugin {
  const sharedDir = resolve(import.meta.dirname, 'shared')
  return {
    name: 'serve-shared',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url || req.method !== 'GET') {
          return next()
        }
        const pathname = new URL(req.url, 'http://localhost').pathname
        const filePath = join(sharedDir, pathname)
        if (
          filePath.startsWith(sharedDir) &&
          existsSync(filePath) &&
          statSync(filePath).isFile()
        ) {
          const mime = lookup(filePath) || 'application/octet-stream'
          res.setHeader('Content-Type', mime)
          res.end(readFileSync(filePath))
          return
        }
        next()
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    resolve: { tsconfigPaths: true },
    plugins: [
      wyw({ include: ['**/*.{ts,tsx}'] }),
      reactRouter(),
      serveShared(),
    ],
    server: { allowedHosts: ['haih.localhost'] },
    define: {
      'import.meta.env.BETTERLYTICS_SITE_ID': JSON.stringify(
        env.BETTERLYTICS_SITE_ID || '',
      ),
    },
  }
})
