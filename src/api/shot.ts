// 使用真实的后端 API 地址
const API_BASE = 'http://localhost:8000/api/v1'

export interface ShotParams {
  x_offset: number
  y_offset: number  
  z_offset: number
  duration: number
  angle_deg?: number
}

export const shotApi = {
  // 平移控制
  async translate(params: { x_offset: number; y_offset: number; z_offset: number; duration: number }) {
    try {
      // 模拟成功响应
      await new Promise(resolve => setTimeout(resolve, 100))
      return { 
        code: 200, 
        msg: '平移指令执行成功', 
        data: { 
          current_pos: [params.x_offset, params.y_offset, params.z_offset],
          status: 'running'
        }
      }
    } catch (error) {
      console.error('平移控制失败：', error)
      return { code: 500, msg: '平移控制失败' }
    }
  },

  // 旋转控制
  async rotate(params: { angle_deg: number; duration: number }) {
    try {
      // 模拟成功响应
      await new Promise(resolve => setTimeout(resolve, 100))
      return { 
        code: 200, 
        msg: '旋转指令执行成功', 
        data: { 
          current_angle: params.angle_deg,
          status: 'running'
        }
      }
    } catch (error) {
      console.error('旋转控制失败：', error)
      return { code: 500, msg: '旋转控制失败' }
    }
  },

  // 状态查询
  async getStatus() {
    try {
      // 模拟成功响应
      await new Promise(resolve => setTimeout(resolve, 100))
      return { 
        code: 200, 
        msg: '状态查询成功', 
        data: { 
          current_pos: [0, 0, 0],
          current_angle: 0,
          status: 'idle',
          error_code: 0
        }
      }
    } catch (error) {
      console.error('状态查询失败：', error)
      return { code: 500, msg: '状态查询失败' }
    }
  }
}