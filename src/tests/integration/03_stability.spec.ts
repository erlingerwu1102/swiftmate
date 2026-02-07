// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { testClient, sleep, BASE_URL } from '../utils'
import axios from 'axios'

// 设定测试总时长为 1 小时 (3,600,000 毫秒)
const TEST_DURATION_MS = 60 * 60 * 1000 

describe('⏳ SwiftMate 1小时高可靠稳定性试验', () => {
  
  beforeAll(async () => { await forceClear() })
  afterAll(async () => { await forceClear() })

  /**
   * 强制清除函数：通过 V1 接口彻底解锁后端状态机
   */
  async function forceClear() {
    try {
      // 1. 调用 V1 紧急停止，取消所有后台 Task
      await axios.post(`${BASE_URL}/api/v1/emergency/stop`, {}, {
        headers: { 'X-API-Key': 'swiftmate' },
        validateStatus: () => true 
      })
      // 2. 调用 V1 复位接口，清除 error 锁定状态
      await axios.post(`${BASE_URL}/api/v1/reset`, {}, {
        headers: { 'X-API-Key': 'swiftmate' },
        validateStatus: () => true 
      })
      await sleep(1500) // 等待物理引擎复位
    } catch (e) {
      console.warn('[System] 自动修复逻辑执行中...')
    }
  }

  it(`I-05: 稳定性接力试验 (持续时间: 3600s)`, async () => {
    const startTime = Date.now()
    const endTime = startTime + TEST_DURATION_MS
    let cycles = 0
    let totalAttempts = 0

    console.log(`\n🚀 [Stability] 启动试验，当前时间: ${new Date().toLocaleTimeString()}`)

    while (Date.now() < endTime) {
      totalAttempts++
      try {
        // --- V2 业务流：设置参数 (必需) -> 安全自检 -> 启动 ---
        // 1. 设置辨识参数
        await testClient.post('/dynamics/identification/set-params', {
          trajectory_range: 15,
          trajectory_speed: 50
        })

        // 2. 启动辨识
        const startRes: any = await testClient.post('/dynamics/identification/start')
        const code = startRes.code || startRes.status

        // --- 实时反馈与标识打印 ---
        if (code === 200) {
          cycles++
          process.stdout.write(`\r[Attempt ${totalAttempts}] 🟢 循环 ${cycles} 成功运行中... `)
        } else if (code === 423) {
          process.stdout.write(`\r[Attempt ${totalAttempts}] 🟡 资源忙 (423)，正在避让... `)
          await sleep(2000)
          continue
        } else if (code === 400) {
          process.stdout.write(`\r[Attempt ${totalAttempts}] 🟠 状态锁定 (400)，正在自动复位... `)
          await forceClear()
          continue
        } else {
          throw new Error(`非预期返回: ${code}`)
        }

        // 模拟运行 1.5 秒
        await sleep(1500)
        
        // 3. 停止指令
        await testClient.post('/dynamics/identification/stop')
        await sleep(1000) // 复位缓冲，防止 423

      } catch (e: any) {
        // 记录异常但不中断 1 小时大循环，确保测试能够接力
        process.stdout.write(`\n❌ [Loop Error] 尝试 ${totalAttempts} 失败: ${e.message}\n`)
        await forceClear()
        await sleep(2000)
      }
    }

    console.log(`\n\n📊 [总结] 试验结束时间: ${new Date().toLocaleTimeString()}`)
    console.log(`- 总完成循环: ${cycles}`)
    console.log(`- 成功率: ${((cycles/totalAttempts)*100).toFixed(2)}%`)

    expect(cycles).toBeGreaterThan(0)
  }, TEST_DURATION_MS + 20000)
})