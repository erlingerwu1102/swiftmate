// @vitest-environment node
import { describe, it, expect } from 'vitest'
import axios from 'axios' // ✅ 修复：添加 axios 导入
import { testClient, resetSystem, BASE_URL } from '../utils' // ✅ 修复：添加 BASE_URL 导入

describe('🔥 系统压力测试 (Concurrency)', () => {
  
  it('I-04: 50用户并发请求抗压测试', async () => {
    await resetSystem()
    const CONCURRENCY = 50
    
    // 构造并发请求
    const requests = Array.from({ length: CONCURRENCY }).map((_, i) => {
      if (i % 2 === 0) {
        return testClient.get('/dynamics/status')
      } else {
        return testClient.post('/dynamics/start', { 
          trajectory_range: 10, 
          trajectory_speed: 10 
        })
      }
    })

    const startTime = Date.now()
    const responses = await Promise.all(requests)
    const duration = Date.now() - startTime

    const successCount = responses.filter(r => r.status === 200).length
    const serverErrors = responses.filter(r => r.status >= 500).length
    
    console.log(`\n📊 压力报告: 
      - 总请求数: ${CONCURRENCY}
      - 耗时: ${duration}ms
      - HTTP 响应成功: ${successCount}
      - 5xx 服务端错误: ${serverErrors}
    `)

    // 断言：服务端不应崩溃
    expect(serverErrors).toBe(0)
    
    // ✅ 修复：使用正确的变量和导入进行健康检查
    const healthCheck = await axios.get(`${BASE_URL}/`)
    expect(healthCheck.status).toBe(200)
  })
})