// frontend_2/src/api/config.ts
import request from '@/utils/request' // 修复：必须添加此行

export interface CollisionConfig {
  axis: number
  sensitivity: number
}

/**
 * 获取碰撞配置
 * 说明：V2 无直接 GET 接口，从 V1 安全状态中获取
 */
export const getCollisionConfig = () => {
  return request.get('/safety/status')
}

/**
 * 更新碰撞配置 (走 V2 路径)
 * 对应后端: @bp_v2.route('/collision/sensitivity')
 */
export const setCollisionConfig = (config: CollisionConfig) => {
  return request.post('/collision/sensitivity', {
    axis: config.axis,
    sensitivity: config.sensitivity
  })
}