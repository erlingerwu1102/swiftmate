// 1. 删除 'vi'，保留用到的 describe, it, expect, beforeEach
import { describe, it, expect, beforeEach } from 'vitest'
import { useTrajectoryRunner } from '../useTrajectoryRunner'
// 2. 删除 'nextTick' 的导入行，因为目前的测试逻辑不需要等待 DOM 更新
// import { nextTick } from 'vue' 

describe('useTrajectoryRunner Core Logic', () => {
  let runner: ReturnType<typeof useTrajectoryRunner>

  beforeEach(() => {
    runner = useTrajectoryRunner()
  })

  it('应该正确初始化状态', () => {
    expect(runner.progress.value).toBe(0)
    expect(runner.robotPos).toEqual({ x: 0, y: 0, z: 0 })
  })

  it('线性插值计算 (Linear Interpolation)', () => {
    const points = [
      { x: 0, y: 0, z: 0 },
      { x: 100, y: 100, z: 100 }
    ]
    
    // 进度 50%
    runner.updateRobotState(points, 50)
    
    expect(runner.robotPos.x).toBeCloseTo(50)
    expect(runner.robotPos.y).toBeCloseTo(50)
    expect(runner.robotPos.z).toBeCloseTo(50)
  })

  it('多路点分段计算 (Multi-segment)', () => {
    const points = [
      { x: 0, y: 0, z: 0 },    // 0%
      { x: 50, y: 0, z: 0 },   // 50%
      { x: 50, y: 50, z: 0 }   // 100%
    ]

    // 进度 25% (在第一段的中间)
    runner.updateRobotState(points, 25)
    expect(runner.robotPos.x).toBeCloseTo(25)
    expect(runner.robotPos.y).toBe(0)

    // 进度 75% (在第二段的中间)
    runner.updateRobotState(points, 75)
    expect(runner.robotPos.x).toBe(50)
    expect(runner.robotPos.y).toBeCloseTo(25)
  })

  it('边界条件处理', () => {
    const points = [{ x: 10, y: 10, z: 10 }]
    runner.updateRobotState(points, 50)
    // 只有一个点时，应保持该点坐标
    expect(runner.robotPos).toEqual({ x: 10, y: 10, z: 10 })
  })
})