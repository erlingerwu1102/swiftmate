// src/api/cameraApi.ts
import request from '@/utils/request'

// 相机状态接口定义
interface CameraStatus {
  status: string
  speed: number
  fps?: number
}

/**
 * 获取相机状态
 * 路径说明：后端 V2 无此接口，必须调用 V1 版本
 */
export const getCameraStatus = () => {
  // 显式指定 /api/v1 前缀
  return request.get<{ data: CameraStatus }>('/api/v1/status')
}

/**
 * 控制相机操作
 * @param action 操作指令: 'start' | 'stop' | 'reset'
 * 对应后端: @bp.route('/camera/control', methods=['POST'])
 */
export const controlCamera = (action: 'start' | 'stop' | 'reset') => {
  // 必须使用 /api/v1 路径
  return request.post('/api/v1/camera/control', { action })
}

/**
 * 获取视频流 URL 
 * 用于 TrajectoryView.vue 中的 <CameraView />
 */
export const getVideoFeedUrl = () => {
  // 由于 V2 蓝图未定义视频流，返回 V1 物理地址
  return '/api/v1/video_feed'
}