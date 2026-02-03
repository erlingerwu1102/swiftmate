import request from '@/utils/request'

// 定义响应数据接口
interface CameraStatus {
  status: string
  speed: number
  fps?: number
}

// 1. 获取相机状态
export const getCameraStatus = () => {
  return request.get<{ data: CameraStatus }>('/v1/camera/status')
}

// 2. 控制相机
export const controlCamera = (action: 'start' | 'stop' | 'reset') => {
  return request.post('/v1/camera/control', { action })
}