import { describe, it, expect } from 'vitest'
import { shotApi } from '../../api/shot'

describe('Shot API测试', () => {
  it('应该能够调用状态查询接口', async () => {
    const result = await shotApi.getStatus()
    expect(result.code).toBe(200)
  })

  it('应该能够调用平移接口', async () => {
    const params = { x_offset: 1.0, y_offset: 0.5, z_offset: 0, duration: 2 }
    const result = await shotApi.translate(params)
    expect(result.code).toBe(200)
  })
})