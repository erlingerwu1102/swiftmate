import axios, { type AxiosResponse } from 'axios'
import type { SdkResponse, RobotStatus, Point } from '@/types/sdk'

export interface MotionOptions {
  duration: number;
  speed?: number;
  acceleration?: number;
  precision?: number;
  curve?: boolean;
  [key: string]: any; 
}

// 1. 基础配置 (适配 V2 安全鉴权)
const api = axios.create({
  // [Config Change] 升级为 V2 基础路径
  baseURL: '/api/v2', 
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
    // [Config Change] 移除硬编码 Key，改为拦截器注入
  }
})

// [Config Change] 添加请求拦截器，动态注入 Key
api.interceptors.request.use((config) => {
  const apiKey = import.meta.env.VITE_ROBOT_API_KEY
  if (apiKey) {
    config.headers['X-API-Key'] = apiKey
  }
  return config
})

export const shotApi = {
  /**
   * 获取机器人实时状态 
   * V2 路径: /api/v2/task/status 或 /api/v2/state (视具体后端实现，此处沿用 /state)
   */
  getStatus: async (): Promise<AxiosResponse<SdkResponse<RobotStatus>>> => {
    // [Config Change] 相对路径，BaseURL 已包含 /api/v2
    const res = await api.get('/state');
    
    if (res.data && res.data.code === 200 && res.data.data) {
      const d = res.data.data as any;
      if (d.position) d.current_pos = d.position;
      if (d.angle !== undefined) d.current_angle = d.angle; 
      if (!d.joints) d.joints = [0, 0, 0, 0, 0, 0];
      if (d.progress === undefined) d.progress = 0;
    }
    return res;
  },

  /**
   * 下发轨迹指令 
   * V2 路径: /api/v2/trajectory/multi-segment
   */
  startPath: (path: Point[], options: MotionOptions | number): Promise<AxiosResponse<SdkResponse>> => {
    if (!path || path.length === 0) return Promise.reject('Path empty');

    const params = typeof options === 'number' ? { duration: options } : options;

    const SCALE = 0.00005; 
    const HOME_X = 0.6; 
    const HOME_Y = 0.5;
    const HOME_Z = 0.3;
    
    const startPt = path[0] as any;

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

    // [Config Change] 相对路径
    return api.post('/trajectory/multi-segment', {
      waypoints: waypoints,
      duration: params.duration,
      interpolation_type: params.curve ? 'bezier' : 'linear'
    });
  },

  /**
   * 紧急停止 
   * V2 路径: /api/v2/emergency/stop
   */
  stop: (): Promise<AxiosResponse<SdkResponse>> => {
    // 拦截器会将其处理为 /api/v1/emergency/stop
    return api.post('/emergency/stop')
  },
  

  setCollisionDetection: (enabled: boolean): Promise<AxiosResponse<SdkResponse>> => {
    // 强制指回 V1 路径
    return api.post('/api/v1/safety/collision-detection', {
      enabled: enabled
    })
  }
}