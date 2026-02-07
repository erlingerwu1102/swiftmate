// src/api/safety.ts
import request from '@/utils/request'

export interface SafetyStatus {
  is_safe: boolean
  warning_msg: string | null
  current_load: number
  collision_detected: boolean
  emergency_stop: boolean
}

// 获取安全状态
export const getSafetyStatus = () => {
  // 保持使用 request。拦截器会自动检测 'status' 并切换至 /api/v1/status
  return request.get<{ code: number; data: SafetyStatus }>('/status')
}

// 触发急停
export const triggerEmergencyStop = () => {
  // 拦截器会自动检测 'emergency/stop' 并切换至 /api/v1/emergency/stop
  return request.post('/emergency/stop')
}

// 复位错误
export const resetSafetyError = () => {
  // 后端源码中该接口为 /api/v1/reset，而非 /safety/reset
  return request.post('/reset')
}