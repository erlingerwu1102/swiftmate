// src/types/sdk.d.ts

export interface SdkResponse<T = any> {
  code: number;
  msg: string;
  data: T;
  error?: any;
}

export interface RobotStatus {
  // 【修复 1】确保包含 'running' 状态，解决 TS2367 比较报错
  status: 'idle' | 'running' | 'error' | 'stopped' | 'ready';
  
  current_operation: string;
  error_message: string;
  
  // 坐标相关
  current_pos: [number, number, number]; // [x, y, z]
  current_angle?: number;
  
  // 【修复 2】添加 joints 字段，解决 "Property 'joints' does not exist" 报错
  joints?: number[]; 

  coordinate_system: string;
  collision_detection_enabled: boolean;
  torque_feedforward_enabled: boolean;

  // 兼容性字段
  msg?: string;
  progress?: number;
}

export interface Point {
  x: number;
  y: number;
  z: number;
}