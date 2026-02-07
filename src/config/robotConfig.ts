// src/config/robotConfig.ts

export const ROBOT_CONFIG = {
  // 物理关节限制 (单位: 度)
  JOINTS: [
    { id: 1, name: 'Base',     min: -170, max: 170 },
    { id: 2, name: 'Shoulder', min: -120, max: 120 },
    { id: 3, name: 'Elbow',    min: -120, max: 120 },
    { id: 4, name: 'Wrist 1',  min: -180, max: 180 },
    { id: 5, name: 'Wrist 2',  min: -120, max: 120 },
    { id: 6, name: 'Wrist 3',  min: -360, max: 360 }
  ],

  // 运动参数限制
  MOTION: {
    MAX_SPEED: 100,       
    MIN_SPEED: 1,
    MAX_ACCEL: 100,
    DEFAULT_DWELL: 1.0,   
    COLLISION_THRESHOLD: {
      MIN: 10,
      MAX: 200,
      DEFAULT: 50
    }
  },
  
  // 轮询间隔 (ms)
  POLLING_INTERVAL: {
    TELEMETRY: 100,
    SLOW: 1000
  }
}