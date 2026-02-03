import request from '@/utils/request'

export interface DynamicsStatus {
  running: boolean
  progress: number
  identification_count: number
  max_identification_count: number
  axis_errors: number[] | Record<string, number> 
  current_params: {
    range: number
    speed: number
  }
  zero_position_confirmed: boolean
}

// 1. 获取状态
export const getDynamicsStatus = () => {
  return request.get<{ data: DynamicsStatus }>('/v1/dynamics/status')
}

// 2. 开始辨识
export const startIdentification = (range: number, speed: number) => {
  return request.post('/v1/dynamics/start', { 
    trajectory_range: range, 
    trajectory_speed: speed 
  })
}

// 3. 停止辨识
export const stopIdentification = () => {
  return request.post('/v1/dynamics/stop')
}

// 4. 确认零点
export const confirmZero = () => {
  return request.post('/v1/dynamics/confirm_zero')
}