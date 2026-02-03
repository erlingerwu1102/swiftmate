<template>
  <div class="dynamics-panel custom-scroll">
    <div class="header-section">
      <div class="title-row">
        <h3>⚡ DYNAMICS IDENTIFICATION</h3>
        <span class="status-tag" :class="{ running: status.running }">
          {{ status.running ? 'RUNNING' : 'IDLE' }}
        </span>
      </div>
      
      <div class="config-grid">
        <div class="control-group">
          <label>TRAJECTORY RANGE (±{{ params.range }}°)</label>
          <input 
            type="range" 
            v-model.number="params.range" 
            :min="5" 
            :max="ROBOT_CONFIG.JOINTS[0]?.max || 45" 
            :disabled="status.running"
          >
        </div>
        <div class="control-group">
          <label>MOTION SPEED ({{ params.speed }}%)</label>
          <input 
            type="range" 
            v-model.number="params.speed" 
            :min="ROBOT_CONFIG.MOTION.MIN_SPEED" 
            :max="50" 
            :disabled="status.running"
          >
        </div>
        <div class="action-group">
          <button class="btn-start" @click="handleStart" :disabled="status.running">
            {{ status.running ? 'IDENTIFYING...' : 'START PROCESS' }}
          </button>
          <button class="btn-stop" @click="handleStop" :disabled="!status.running">STOP</button>
        </div>
      </div>
    </div>

    <div class="viz-section">
      <div class="progress-box">
        <div class="prog-info">
          <span>PROGRESS</span>
          <span class="step-badge">{{ status.identification_count }} / {{ status.max_identification_count }} ITERATIONS</span>
        </div>
        <div class="progress-track">
          <div class="progress-bar" :style="{ width: status.progress + '%' }"></div>
        </div>
      </div>

      <div class="charts-box">
        <div class="box-title">AXIS RESIDUAL ERRORS (RMS)</div>
        <div class="bars-container">
          <div v-for="(err, idx) in normalizedErrors" :key="idx" class="axis-bar-row">
            <span class="axis-label">{{ ROBOT_CONFIG.JOINTS[idx]?.name || `J${idx + 1}` }}</span>
            <div class="bar-track">
              <div class="bar-fill" 
                   :style="{ width: Math.min(err * 100, 100) + '%', backgroundColor: getErrorColor(err) }">
              </div>
            </div>
            <span class="err-val">{{ err.toFixed(4) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="modules-grid">
      <div class="module-card safety-placeholder">
        <div class="m-header">🛡️ SAFETY MONITOR</div>
        <div class="m-content">
          <div class="status-indicator safe">SYSTEM SAFE</div>
          <p class="desc">Real-time torque monitoring active.</p>
        </div>
      </div>

      <div class="module-card collision-placeholder">
        <div class="m-header">💥 COLLISION CONFIG</div>
        <div class="m-content">
          <div class="slider-mock"></div>
          <p class="desc">Threshold: {{ ROBOT_CONFIG.MOTION.COLLISION_THRESHOLD.DEFAULT }}N</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, reactive } from 'vue'
import { getDynamicsStatus, startIdentification, stopIdentification } from '@/api/dynamics'
// 引入配置，解决硬编码问题
import { ROBOT_CONFIG } from '@/config/robotConfig'

const pollingTimer = ref<any>(null)
const params = reactive({ range: 15, speed: 20 })

// 定义状态，与 API 接口对应
const status = reactive({
  running: false,
  progress: 0,
  identification_count: 0,
  max_identification_count: 10,
  // 这里的类型可能是数组也可能是对象，我们在 computed 中处理
  axis_errors: [] as number[] | Record<string, number>,
  zero_position_confirmed: true
})

// 核心修复：处理 axis_errors 的类型问题，并确保返回 number[]
const normalizedErrors = computed<number[]>(() => {
  if (!status.axis_errors) return [0, 0, 0, 0, 0, 0]

  if (Array.isArray(status.axis_errors)) {
    // 如果是空数组，填充 0
    return status.axis_errors.length > 0 ? status.axis_errors : [0, 0, 0, 0, 0, 0]
  } else {
    // 如果是对象 { axis1: 0.1, ... }，转为数组
    return Object.values(status.axis_errors)
  }
})

// 根据误差值返回颜色
const getErrorColor = (val: number) => {
  if (val > 0.8) return '#ef4444' // Red
  if (val > 0.4) return '#f59e0b' // Orange
  return '#3b82f6' // Blue
}

// 获取状态
const fetchStatus = async () => {
  try {
    const res = await getDynamicsStatus()
    // 配合 request.ts 的拦截器，res 已经是 response 对象，数据在 res.data.data
    if (res.data && res.data.data) {
      Object.assign(status, res.data.data)
    }
  } catch (e) {
    // 轮询失败通常不弹窗，避免打扰用户
    console.error("Status poll failed", e)
  }
}

// 开始辨识
const handleStart = async () => {
  try {
    status.running = true // 乐观更新 UI
    await startIdentification(params.range, params.speed)
    fetchStatus() // 立即刷新一次
  } catch (error: any) {
    status.running = false
    const msg = error.message || 'Failed to start identification'
    alert(msg)
  }
}

// 停止辨识
const handleStop = async () => {
  try {
    await stopIdentification()
    fetchStatus()
  } catch (e) {
    console.error(e)
  }
}

// 生命周期管理
onMounted(() => {
  fetchStatus()
  pollingTimer.value = setInterval(fetchStatus, 1000)
})

onUnmounted(() => {
  if (pollingTimer.value) clearInterval(pollingTimer.value)
})
</script>

<style scoped>
.dynamics-panel {
  height: 100%;
  /* 使用 CSS 变量适配皮肤 */
  background: var(--bg-app); 
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  color: var(--text-primary);
  font-family: 'Inter', sans-serif;
}

.header-section { border-bottom: 1px solid var(--border-color); padding-bottom: 16px; }
.title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
h3 { margin: 0; font-size: 16px; color: var(--accent-color); letter-spacing: 1px; }

.status-tag {
  font-size: 10px; font-weight: bold; padding: 4px 8px; border-radius: 4px;
  background: var(--bg-panel); color: var(--text-secondary);
}
.status-tag.running { background: rgba(16, 185, 129, 0.2); color: #10b981; animation: pulse 1.5s infinite; }

.config-grid { display: flex; gap: 20px; align-items: flex-end; }
.control-group { flex: 1; display: flex; flex-direction: column; gap: 8px; }
.control-group label { font-size: 10px; color: var(--text-secondary); font-weight: bold; }
input[type="range"] { width: 100%; accent-color: var(--accent-color); height: 4px; }

.action-group { display: flex; gap: 10px; }
button { border: none; padding: 8px 16px; border-radius: 4px; font-size: 11px; font-weight: bold; cursor: pointer; transition: all 0.2s; }
.btn-start { background: var(--accent-color); color: white; }
.btn-start:disabled { background: var(--bg-panel); color: var(--text-secondary); cursor: not-allowed; }
.btn-stop { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid #ef4444; }

.viz-section {
  flex: 1;
  background: var(--input-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.progress-box { display: flex; flex-direction: column; gap: 6px; }
.prog-info { display: flex; justify-content: space-between; font-size: 10px; color: var(--text-secondary); }
.step-badge { color: var(--text-primary); font-weight: bold; }
.progress-track { height: 6px; background: var(--border-color); border-radius: 3px; overflow: hidden; }
.progress-bar { height: 100%; background: linear-gradient(90deg, #3b82f6, #60a5fa); transition: width 0.3s ease; }

.charts-box { flex: 1; display: flex; flex-direction: column; }
.box-title { font-size: 10px; color: var(--text-secondary); margin-bottom: 12px; font-weight: bold; }
.bars-container { display: flex; flex-direction: column; gap: 8px; flex: 1; justify-content: center; }
.axis-bar-row { display: flex; align-items: center; gap: 12px; }
.axis-label { width: 60px; font-size: 9px; color: var(--text-secondary); font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: right; }
.bar-track { flex: 1; height: 8px; background: var(--bg-app); border-radius: 2px; overflow: hidden; }
.bar-fill { height: 100%; transition: width 0.5s ease; border-radius: 2px; }
.err-val { width: 45px; font-size: 10px; font-family: monospace; text-align: right; color: var(--text-secondary); }

.modules-grid { display: flex; gap: 16px; height: 120px; }
.module-card {
  flex: 1; background: var(--bg-panel); border: 1px dashed var(--border-color);
  border-radius: 6px; padding: 12px; display: flex; flex-direction: column;
  opacity: 0.7; transition: opacity 0.2s;
}
.module-card:hover { opacity: 1; border-color: var(--accent-color); }
.m-header { font-size: 10px; font-weight: bold; color: var(--text-secondary); margin-bottom: 8px; }
.m-content { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
.status-indicator.safe { color: #10b981; font-weight: bold; font-size: 12px; border: 1px solid #10b981; padding: 2px 8px; border-radius: 10px; margin-bottom: 4px; }
.desc { font-size: 9px; color: var(--text-secondary); margin: 0; }

@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.6; } 100% { opacity: 1; } }
</style>