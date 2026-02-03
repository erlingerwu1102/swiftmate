import axios from 'axios'

export interface CollisionConfig {
  threshold: number  // 碰撞阈值
  enabled: boolean   // 是否开启检测 (可选)
}

// 获取碰撞配置
export const getCollisionConfig = () => {
  return axios.get<{ code: number; data: CollisionConfig }>('/api/v1/config/collision')
}

// 更新碰撞配置
export const setCollisionConfig = (config: CollisionConfig) => {
  return axios.post('/api/v1/config/collision', config)
}