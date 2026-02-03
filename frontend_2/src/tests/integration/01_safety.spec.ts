// @vitest-environment node
import { describe, it, expect, beforeAll } from 'vitest'
import { testClient, resetSystem } from '../utils'

describe('🛡️ 安全接口集成测试', () => {
  beforeAll(async () => {
    await resetSystem()
  })

  it('I-01: 超大范围参数应被拒绝', async () => {
    const res = await testClient.post('/dynamics/start', {
      trajectory_range: 9999, 
      trajectory_speed: 20
    })
    const isRejected = res.status !== 200 || (res.data.code && res.data.code !== 200)
    expect(isRejected).toBe(true)
  })

  it('I-02: 负数速度测试', async () => {
    const res = await testClient.post('/dynamics/start', {
      trajectory_range: 10,
      trajectory_speed: -50
    })
    // 允许断言失败或成功，取决于后端是否已补齐逻辑
    expect(res.data.code).not.toBe(200)
  })

  it('I-03: 急停锁定测试', async () => {
    await testClient.post('/safety/estop')
    const res = await testClient.post('/dynamics/start', {
      trajectory_range: 10,
      trajectory_speed: 10
    })
    expect(res.data.code).not.toBe(200)
    await testClient.post('/safety/reset')
  })
})