// src/api/dynamics.ts
import request from '@/utils/request'

// 1. 获取状态 (V2 路径)
export const getDynamicsStatus = () => {
  return request.get('/dynamics/identification/status')
}

// 2. 开始辨识 (V2 路径: /start)
export const startIdentification = (range: number, speed: number) => {
  // [Config Change] V2 显式区分 start/stop 动作路径
  return request.post('/dynamics/identification/start', { 
    trajectory_range: range, 
    trajectory_speed: speed 
  })
}

// 3. 停止辨识 (V2 路径: /stop)
export const stopIdentification = () => {
  return request.post('/dynamics/identification/stop')
}