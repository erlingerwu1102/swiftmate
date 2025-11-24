// src/api/shot.ts
import axios from 'axios'

const BASE_URL = 'http://127.0.0.1:8000/api/v1'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
})

// 请求参数类型
export interface TranslateParams {
  x_offset: number
  y_offset: number
  z_offset: number
  duration?: number
}

export interface RotateParams {
  angle_deg: number
  duration?: number
}

// API 函数
export const translateCamera = (params: TranslateParams) => {
  return api.post('/translate', params)
}

export const rotateCamera = (params: RotateParams) => {
  return api.post('/rotate', params)
}

export const getCameraStatus = () => {
  return api.get('/status')
}

// 导出统一的对象
export const shotControl = {
  translateCamera,
  rotateCamera,
  getCameraStatus,
}