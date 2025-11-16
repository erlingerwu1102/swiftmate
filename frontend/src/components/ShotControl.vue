<template>
  <div class="shot-control">
    <el-card header="运镜控制">
      <el-row :gutter="20">
        <!-- 平移控制 -->
        <el-col :span="12">
          <el-form label-width="100px">
            <el-form-item label="X轴偏移">
              <el-input-number v-model="translateParams.x_offset" :precision="2" />
            </el-form-item>
            <el-form-item label="Y轴偏移">
              <el-input-number v-model="translateParams.y_offset" :precision="2" />
            </el-form-item>
            <el-form-item label="Z轴偏移">
              <el-input-number v-model="translateParams.z_offset" :precision="2" />
            </el-form-item>
            <el-form-item label="持续时间">
              <el-input-number v-model="translateParams.duration" :min="0.1" :precision="1" />
            </el-form-item>
            <el-form-item>
              <el-button 
                type="primary" 
                @click="handleTranslate"
                :loading="translateLoading"
              >
                执行平移
              </el-button>
            </el-form-item>
          </el-form>
        </el-col>

        <!-- 旋转控制 -->
        <el-col :span="12">
          <el-form label-width="100px">
            <el-form-item label="旋转角度">
              <el-input-number v-model="rotateParams.angle_deg" :precision="1" />
            </el-form-item>
            <el-form-item label="持续时间">
              <el-input-number v-model="rotateParams.duration" :min="0.1" :precision="1" />
            </el-form-item>
            <el-form-item>
              <el-button 
                type="primary" 
                @click="handleRotate"
                :loading="rotateLoading"
              >
                执行旋转
              </el-button>
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>

      <!-- 状态显示 -->
      <el-row style="margin-top: 20px;">
        <el-col :span="24">
          <el-card header="相机状态">
            <p>位置: [{{ cameraStatus.current_pos[0] }}, {{ cameraStatus.current_pos[1] }}, {{ cameraStatus.current_pos[2] }}]</p>
            <p>角度: {{ cameraStatus.current_angle }}°</p>
            <p>状态: {{ getStatusText(cameraStatus.status) }}</p>
            <p>错误码: {{ cameraStatus.error_code }}</p>
            <el-button @click="fetchStatus" :loading="statusLoading">
              刷新状态
            </el-button>
          </el-card>
        </el-col>
      </el-row>

      <!-- 错误信息显示 -->
      <el-alert
        v-if="errorMessage"
        :title="errorMessage"
        type="error"
        show-icon
        closable
        style="margin-top: 20px;"
        @close="errorMessage = ''"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 直接导入，如果文件不存在会报错，但至少按钮会显示
import { shotControl } from '@/api/shot.js'

// 状态映射
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    idle: '空闲',
    running: '运行中',
    error: '错误'
  }
  return statusMap[status] || '未知'
}

// 组件状态
const cameraStatus = ref({
  current_pos: [0, 0, 0] as [number, number, number],
  current_angle: 0,
  status: 'idle' as 'idle' | 'running' | 'error',
  error_code: 0
})

// 控制参数
const translateParams = ref({
  x_offset: 0,
  y_offset: 0,
  z_offset: 0,
  duration: 1
})

const rotateParams = ref({
  angle_deg: 0,
  duration: 1
})

// 加载状态
const translateLoading = ref(false)
const rotateLoading = ref(false)
const statusLoading = ref(false)
const errorMessage = ref('')

// 方法
const handleTranslate = async () => {
  translateLoading.value = true
  errorMessage.value = ''

  try {
    const response = await shotControl.translateCamera(translateParams.value)
    
    if (response.data.code === 200) {
      ElMessage.success('平移指令执行成功')
      await fetchStatus()
    } else {
      errorMessage.value = `平移失败: ${response.data.msg}`
      ElMessage.error(`平移失败: ${response.data.msg}`)
    }
  } catch (error: any) {
    console.error('平移请求失败:', error)
    
    if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
      errorMessage.value = '网络连接失败，请检查后端服务是否启动 (http://localhost:8000)'
    } else if (error.code === 'TIMEOUT') {
      errorMessage.value = '请求超时，请检查网络连接'
    } else if (error.response?.status === 404) {
      errorMessage.value = 'API接口不存在 (404)，请检查后端服务'
    } else if (error.response?.status === 500) {
      errorMessage.value = '服务器内部错误 (500)'
    } else {
      errorMessage.value = `平移指令执行失败: ${error.message || '未知错误'}`
    }
    
    ElMessage.error('平移指令执行失败')
  } finally {
    translateLoading.value = false
  }
}

const handleRotate = async () => {
  rotateLoading.value = true
  errorMessage.value = ''

  try {
    const response = await shotControl.rotateCamera(rotateParams.value)
    
    if (response.data.code === 200) {
      ElMessage.success('旋转指令执行成功')
      await fetchStatus()
    } else {
      errorMessage.value = `旋转失败: ${response.data.msg}`
      ElMessage.error(`旋转失败: ${response.data.msg}`)
    }
  } catch (error: any) {
    console.error('旋转请求失败:', error)
    
    if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
      errorMessage.value = '网络连接失败，请检查后端服务是否启动 (http://localhost:8000)'
    } else if (error.code === 'TIMEOUT') {
      errorMessage.value = '请求超时，请检查网络连接'
    } else if (error.response?.status === 404) {
      errorMessage.value = 'API接口不存在 (404)，请检查后端服务'
    } else if (error.response?.status === 500) {
      errorMessage.value = '服务器内部错误 (500)'
    } else {
      errorMessage.value = `旋转指令执行失败: ${error.message || '未知错误'}`
    }
    
    ElMessage.error('旋转指令执行失败')
  } finally {
    rotateLoading.value = false
  }
}

const fetchStatus = async () => {
  statusLoading.value = true
  errorMessage.value = ''

  try {
    const response = await shotControl.getCameraStatus()
    
    if (response.data.code === 200) {
      cameraStatus.value = response.data.data
      ElMessage.success('状态查询成功')
    } else {
      errorMessage.value = `状态查询失败: ${response.data.msg}`
      ElMessage.error(`状态查询失败: ${response.data.msg}`)
    }
  } catch (error: any) {
    console.error('状态查询失败:', error)
    
    if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
      errorMessage.value = '网络连接失败，无法获取相机状态，请检查后端服务'
    } else if (error.response?.status === 404) {
      errorMessage.value = '状态查询接口不存在 (404)'
    } else {
      errorMessage.value = `状态查询失败: ${error.message || '未知错误'}`
    }
    
    ElMessage.error('状态查询失败')
  } finally {
    statusLoading.value = false
  }
}

onMounted(() => {
  fetchStatus()
})
</script>

<style scoped>
.shot-control {
  padding: 20px;
}
</style>