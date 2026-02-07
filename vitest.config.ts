// frontend_2/vitest.config.ts
import { defineConfig, configDefaults } from 'vitest/config'

export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, 'swiftmate/**', 'docs/**'],
    
    include: ['src/tests/**/*.spec.ts'],
    
    fileParallelism: false,
    
    reporters: ['default', 'html', 'json'],
    outputFile: {
      html: './docs/reports/index.html',
      json: './docs/reports/test-results.json' 
    }
  }
})