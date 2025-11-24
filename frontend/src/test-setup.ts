import { config } from '@vue/test-utils'
import ElementPlus from 'element-plus'
import { vi } from 'vitest'

// 全局注册 Element Plus
config.global.plugins = [ElementPlus]

// Mock 全局对象
globalThis.console = {
  ...console,
  error: vi.fn()
}

// 模拟 API
const mockApi = {
  translateCamera: vi.fn(),
  rotateCamera: vi.fn(),
  getCameraStatus: vi.fn()
}

vi.mock('@/api/shot', () => ({
  shotControl: mockApi
}))