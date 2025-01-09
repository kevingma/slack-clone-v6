import { defineConfig } from 'vite'
import { resolveProjectPath } from 'wasp/dev'

export default defineConfig({
  server: {
    open: true,
    fs: {
      allow: [
        // Allow the project root
        resolveProjectPath('.'),
        // Also allow the .wasp folder
        resolveProjectPath('.wasp')
      ]
    }
  },
})
