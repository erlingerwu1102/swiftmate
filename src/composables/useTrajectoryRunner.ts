import { ref, reactive } from 'vue'

/**
 * 全局单例状态 (Singleton State)
 * 确保在视图切换（如从 3D 视图切到其他页面再切回来）时，
 * 机器人的位置和播放进度保持不变。
 */
const isPlaying = ref(false)
const progress = ref(0)
const robotPos = reactive({ x: 0, y: 0, z: 0 }) // 机械臂末端/基座坐标
const joints = ref([0, 0, 0, 0, 0, 0]) // 6个关节角度

export function useTrajectoryRunner() {

  /**
   * 核心状态更新函数
   * @param points 当前的路径点数组
   * @param prog 当前进度 (0-100)
   */
  const updateRobotState = (points: any[], prog: number) => {
    // ---------------------------------------------------------
    // 1. 关节动画逻辑 (基于您的优化：±30° 正弦振荡)
    // ---------------------------------------------------------
    // 使用当前时间戳生成平滑波形，避免累加导致的数值溢出
    const time = Date.now() / 1000 
    joints.value = joints.value.map((_, i) => {
      // 每个关节有不同的相位偏移 (i * 0.5)，实现波浪式运动
      // 范围控制在 ±30 度之间
      return Math.sin(time * 2 + i * 0.5) * 30
    })

    // ---------------------------------------------------------
    // 2. 轨迹插值逻辑 (解决“机械臂不移动”的关键)
    // ---------------------------------------------------------
    if (!points || points.length === 0) return

    // 如果只有一个点，直接定位到该点
    if (points.length === 1) {
      robotPos.x = points[0].x
      robotPos.y = points[0].y
      robotPos.z = points[0].z
      return
    }

    // 多点插值算法 (Linear Interpolation - LERP)
    const segmentCount = points.length - 1
    const normalizedProgress = Math.max(0, Math.min(100, prog)) / 100 // 归一化 0.0 - 1.0
    
    // 计算当前处于哪一段 (Index)
    let currentIndex = Math.floor(normalizedProgress * segmentCount)
    // 防止数组越界（当进度为 100% 时）
    if (currentIndex >= segmentCount) currentIndex = segmentCount - 1

    // 计算当前段内的局部进度 (0.0 - 1.0)
    // 公式：(总进度 - 当前段起始进度) / 单段长度
    const segmentLength = 1 / segmentCount
    const segmentProgress = (normalizedProgress - (currentIndex * segmentLength)) / segmentLength

    // 获取当前段的 起点(p1) 和 终点(p2)
    const p1 = points[currentIndex]
    const p2 = points[currentIndex + 1]

    if (p1 && p2) {
      // 执行线性插值并更新响应式对象
      // 公式: 当前值 = 起点 + (终点 - 起点) * 进度
      robotPos.x = p1.x + (p2.x - p1.x) * segmentProgress
      robotPos.y = p1.y + (p2.y - p1.y) * segmentProgress
      robotPos.z = p1.z + (p2.z - p1.z) * segmentProgress
    }
  }

  return {
    isPlaying,
    progress,
    robotPos,
    joints,
    updateRobotState
  }
}