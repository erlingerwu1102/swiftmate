// frontend_2/src/tests/integration/04_trajectory.spec.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { testClient, sleep, resetSystem } from '../utils'

describe('🚀 完整运镜功能集成测试 (Happy Path)', () => {
  // [修复] 改为 beforeEach，防止上一个测试失败导致的死锁影响本测试
  beforeEach(async () => {
    await resetSystem()
  })

  it('F-01: 标准运镜生命周期', async () => {
    // 1. 启动
    // [修复] 路径必须包含 /start 后缀以适配 V2 路由
    const startRes = await testClient.post('/dynamics/identification/start', {
      trajectory_range: 15, 
      trajectory_speed: 30
    })
    
    // 如果依然返回 400，通常是由于后端 stop 延迟。此时断言会提供更清晰的错误
    expect(startRes.status, `Start failed: ${startRes.data?.msg}`).toBe(200)

    // 2. 轮询
    await sleep(500)
    const statusRes = await testClient.get('/dynamics/identification/status')
    expect(statusRes.status).toBe(200)
    // 验证状态是否变为识别中
    expect(statusRes.data.data.is_identifying).toBe(true)

    // 3. 停止
    const stopRes = await testClient.post('/dynamics/identification/stop')
    expect(stopRes.status).toBe(200)
  })
})