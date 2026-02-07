// frontend_2/src/tests/utils.ts
import service from '../utils/request'
import axios from 'axios'

export const BASE_URL = 'http://127.0.0.1:8000'
export const API_PREFIX = '/api/v2'

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 直接引用我们刚刚加固过的 service
export const testClient = service 

export const resetSystem = async () => {
  try {
    // 强制使用绝对路径
    await axios.post(`${BASE_URL}/api/v1/emergency/stop`, {}, {
      headers: { 'X-API-Key': 'swiftmate' },
      validateStatus: () => true 
    })
  } catch (e) {
    // 静默处理重置错误
  }
}