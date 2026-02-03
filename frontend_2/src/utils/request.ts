// src/utils/request.ts
import axios, { type AxiosInstance, type AxiosResponse, type AxiosError } from 'axios'

// 响应结构
interface ApiResponse<T = any> {
  code: number
  msg: string
  data: T
}

// 错误结构
interface ApiErrorData {
  request_id?: string
  type?: string
  timestamp?: number
  details?: any
}

const service: AxiosInstance = axios.create({
  baseURL: '/api', 
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data
    // 如果 code 不是 200, 视为业务错误
    if (res.code && res.code !== 200) {
      console.error(`[BizError] ${res.msg}`)
      return Promise.reject(new Error(res.msg || 'Error'))
    }
    return response
  },
  (error: AxiosError<ApiResponse<ApiErrorData>>) => {
    let message = 'Network Error'
    let requestId = 'N/A'
    
    if (error.response) {
      const data = error.response.data
      message = data.msg || error.message
      if (data.data) {
        requestId = data.data.request_id || 'N/A'
      }
      console.error(`❌ [API Fail] ID:${requestId} | Msg:${message}`)
    } else {
      console.error(`❌ [Network] ${error.message}`)
    }
    
    // 将 requestId 传递下去，以便 UI 展示
    return Promise.reject({ message, requestId, originalError: error })
  }
)

export default service