import axios from 'axios'

export interface SafetyStatus {
  is_safe: boolean
  warning_msg: string | null
  current_load: number     // 假设后端返回电流负载
  collision_detected: boolean
  emergency_stop: boolean
}

// 获取安全状态 (通常需要轮询)
export const getSafetyStatus = () => {
  // 假设后端接口为 GET /api/v1/safety/status
  return axios.get<{ code: number; data: SafetyStatus }>('/api/v1/safety/status')
}

// 触发急停 (复用已有的逻辑，或走统一的安全接口)
export const triggerEmergencyStop = () => {
  return axios.post('/api/v1/safety/estop')
}

// 复位错误状态
export const resetSafetyError = () => {
  return axios.post('/api/v1/safety/reset')
}