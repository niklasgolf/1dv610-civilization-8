import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, searchForWorkspaceRoot } from 'vite'

const projectRoot = process.cwd()

// npm installs this package as a symlink to a sibling project.
// Vite follows that link and then refuses the real path because it sits
// outside this repository. Keep the symlink path, and allow the real
// directory so the package name still resolves.
const linkedPackage = fs.realpathSync(
  path.resolve(projectRoot, 'node_modules/midgard-hex-grid'),
)

export default defineConfig({
  resolve: {
    preserveSymlinks: true,
  },
  optimizeDeps: {
    exclude: ['midgard-hex-grid'],
  },
  server: {
    fs: {
      allow: [
        searchForWorkspaceRoot(projectRoot),
        linkedPackage,
      ],
    },
  },
})
