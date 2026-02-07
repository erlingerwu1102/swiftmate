// src/tests/useTrajectoryRunner.spec.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useTrajectoryRunner } from '../useTrajectoryRunner'

describe('useTrajectoryRunner 振荡逻辑验证', () => {
  let runner: ReturnType<typeof useTrajectoryRunner>

  beforeEach(() => {
    runner = useTrajectoryRunner()
  })

  it('关节角度应在 ±30° 范围内进行正弦振荡', () => {
    const points = [{ x: 0, y: 0, z: 0 }, { x: 100, y: 100, z: 100 }]
    
    // 模拟多次更新，验证正弦波峰值
    for (let i = 0; i < 20; i++) {
      runner.updateRobotState(points, i * 5)
      runner.joints.value.forEach(angle => {
        expect(angle).toBeLessThanOrEqual(30.001)
        expect(angle).toBeGreaterThanOrEqual(-30.001)
      })
    }
  })

  it('轨迹位置更新应保持 LERP 线性插值', () => {
    const points = [{ x: 0, y: 0, z: 0 }, { x: 100, y: 100, z: 100 }]
    runner.updateRobotState(points, 50)
    expect(runner.robotPos.x).toBeCloseTo(50)
    expect(runner.robotPos.y).toBeCloseTo(50)
  })
})