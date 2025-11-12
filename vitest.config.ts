import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    threads: false,  // 完全禁用多线程
    pool: 'forks',   // 使用 forks
    poolOptions: {
      forks: {
        singleFork: true  // 单进程模式
      }
    }
  }
})
