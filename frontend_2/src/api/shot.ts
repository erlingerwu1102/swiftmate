import axios, { type AxiosResponse } from 'axios'
import type { SdkResponse, RobotStatus, Point } from '@/types/sdk'

// 定义扩展参数接口
export interface MotionOptions {
  duration: number;
  speed?: number;
  acceleration?: number;
  precision?: number;
  curve?: boolean;
  [key: string]: any; 
}

// 1. 基础配置
const api = axios.create({
  baseURL: '/api', 
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    // 确保与 robot_config.py 中的 allowed_api_keys 匹配
    'X-API-Key': 'swiftmate' 
  }
})

export const shotApi = {
  /**
   * 获取机器人实时状态 (适配后端 V2 接口: /api/v2/state)
   */
  getStatus: async (): Promise<AxiosResponse<SdkResponse<RobotStatus>>> => {
    const res = await api.get('/v2/state');
    
    if (res.data && res.data.code === 200 && res.data.data) {
      const d = res.data.data as any;
      // 字段适配：后端 position -> 前端 current_pos
      if (d.position) d.current_pos = d.position;
      if (d.angle !== undefined) d.current_angle = d.angle; 
      
      // 补全组件必需字段
      if (!d.joints) d.joints = [0, 0, 0, 0, 0, 0];
      if (d.progress === undefined) d.progress = 0;
    }
    return res;
  },

  /**
   * 下发轨迹指令 (适配后端 V2 接口: /api/v2/trajectory/multi-segment)
   * 修复：调整 SCALE 和 HOME 坐标以适配后端工作空间边界
   */
  startPath: (path: Point[], options: MotionOptions | number): Promise<AxiosResponse<SdkResponse>> => {
    if (!path || path.length === 0) return Promise.reject('Path empty');

    const params = typeof options === 'number' ? { duration: options } : options;

    // --- 坐标换算修正逻辑 ---
    // 减小 SCALE (由 0.0001 降至 0.00005)，让大范围轨迹在物理空间内更紧凑，防止 400 越界
    const SCALE = 0.00005; 
    // 将起始点设为后端工作空间的中心区域 (后端范围 X:0~1.2, Y:0~1.0, Z:0~0.8)
    const HOME_X = 0.6; 
    const HOME_Y = 0.5;
    const HOME_Z = 0.3;
    
    const startPt = path[0] as any;

    // 将前端 Point 对象转换为后端需要的 [[x, y, z], ...] 格式
    const waypoints = path.map(p => {
      const point = p as any;
      const origZ = point.z !== undefined ? point.z : 0;
      const startZ = startPt.z !== undefined ? startPt.z : 0;
      
      return [
        (point.x - startPt.x) * SCALE + HOME_X,
        (point.y - startPt.y) * SCALE + HOME_Y,
        (origZ - startZ) * SCALE + HOME_Z
      ];
    });

    // 调用 V2 多段运镜接口
    return api.post('/v2/trajectory/multi-segment', {
      waypoints: waypoints,
      duration: params.duration,
      // 传递插值类型
      interpolation_type: params.curve ? 'bezier' : 'linear'
    });
  },

  /**
   * 紧急停止 (调用 V1 接口)
   */
  stop: (): Promise<AxiosResponse<SdkResponse>> => {
    return api.post('/v1/emergency/stop')
  },
  
  /**
   * 碰撞检测配置 (调用 V1 接口)
   */
  setCollisionDetection: (enabled: boolean): Promise<AxiosResponse<SdkResponse>> => {
    return api.post('/v1/safety/collision-detection', {
      enabled: enabled
    })
  }
}