// frontend_2/src/utils/request.ts
import axios from 'axios'

// 核心修复：Node.js 环境下必须使用绝对路径
const isNode = typeof window === 'undefined'
const service = axios.create({
  // 如果是测试环境，强制补全本地后端地址
  baseURL: isNode ? 'http://127.0.0.1:8000/api/v2' : '/api/v2',
  timeout: 10000
})

service.interceptors.request.use((config) => {
  config.headers['X-API-Key'] = 'swiftmate'

  const v1Endpoints = ['emergency/stop', 'safety/status', 'safety/collision', 'camera/control', 'reset', 'status']
  const isV1 = v1Endpoints.some(path => config.url?.includes(path))

  if (isV1) {
    // 动态切换时也要保持绝对路径
    config.baseURL = isNode ? 'http://127.0.0.1:8000/api/v1' : '/api/v1'
  }

  return config
})

// 核心修复：丢弃 Axios 的 Response 原型链，只传纯数据，彻底消灭 DataCloneError
service.interceptors.response.use(
  (response) => {
    // 仅返回普通的 JSON 对象
    return JSON.parse(JSON.stringify(response.data))
  },
  (error) => {
    if (error.response) {
      return Promise.resolve(JSON.parse(JSON.stringify(error.response.data)))
    }
    return Promise.reject(error)
  }
)

export default service