// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { testClient, sleep, resetSystem } from '../utils'

const TEST_DURATION_MS = 30 * 1000 *2

describe('⏳ 长时间稳定性测试 (Stability)', () => {
  beforeAll(async () => {
    await resetSystem()
  })

  afterAll(async () => {
    await resetSystem()
  })

  it(`I-05: 连续运行测试`, async () => {
    const endTime = Date.now() + TEST_DURATION_MS
    
    let cycles = 0
    let errors: string[] = []

    while (Date.now() < endTime) {
      try {
        const startRes = await testClient.post('/dynamics/start', {
          trajectory_range: 15,
          trajectory_speed: 50
        })

        if (startRes.status === 200) {
          await sleep(2000)
        }
        await testClient.post('/dynamics/stop')
        await sleep(500)
        cycles++
      } catch (e: any) {
        errors.push(e.message)
      }
    }
    expect(errors.length).toBe(0)
  }, 10000000)
})