// @vitest-environment node
import axios from 'axios'

// 确保 URL 结构清晰
export const BASE_URL = 'http://localhost:8000'
const API_PREFIX = '/api/v1'

export const testClient = axios.create({
  baseURL: `${BASE_URL}${API_PREFIX}`,
  timeout: 15000, 
  validateStatus: () => true 
})

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const resetSystem = async () => {
  await testClient.post('/dynamics/stop')
  await sleep(500)
}