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
            type="range" v-model.number="params.range" :min="5" :max="45" 
            :disabled="status.running"
          >
        </div>
        <div class="control-group">
          <label>MOTION SPEED ({{ params.speed }}%)</label>
          <input 
            type="range" v-model.number="params.speed" :min="1" :max="50" 
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
          <span class="step-badge">{{ status.progress }}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-bar" :style="{ width: status.progress + '%' }"></div>
        </div>
      </div>

      <div class="charts-box">
        <div class="box-title">AXIS RESIDUAL ERRORS (RMS)</div>
        <div class="bars-container">
          <div v-for="(err, idx) in normalizedErrors" :key="idx" class="axis-bar-row">
            <span class="axis-label">J{{ idx + 1 }}</span>
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, reactive } from 'vue'
// 核心逻辑：引用统一适配了 V2 路径的 dynamics API
import { getDynamicsStatus, startIdentification, stopIdentification } from '@/api/dynamics'

const pollingTimer = ref<any>(null)
const params = reactive({ range: 15, speed: 20 })

const status = reactive({
  running: false,
  progress: 0,
  axis_errors: [] as number[]
})

// 处理后端可能返回的对象或数组
const normalizedErrors = computed<number[]>(() => {
  const errs = status.axis_errors
  if (!errs) return [0, 0, 0, 0, 0, 0]
  return Array.isArray(errs) ? (errs.length ? errs : [0,0,0,0,0,0]) : Object.values(errs)
})

const getErrorColor = (val: number) => val > 0.8 ? '#ef4444' : val > 0.4 ? '#f59e0b' : '#3b82f6'

const fetchStatus = async () => {
  try {
    const res = await getDynamicsStatus()
    const d = res.data.data
    status.running = !!(d.is_identifying || d.running)
    status.progress = d.progress || 0
    status.axis_errors = d.results || d.axis_errors || []
  } catch (e) {
    console.error("Poll failed", e)
  }
}

const handleStart = async () => {
  try {
    // 适配 V2 参数名：trajectory_range
    await startIdentification(params.range, params.speed)
    status.running = true
  } catch (error: any) {
    alert(error.message || 'Start failed')
  }
}

const handleStop = async () => {
  try {
    await stopIdentification()
    status.running = false
  } catch (e) {}
}

onMounted(() => {
  fetchStatus()
  pollingTimer.value = setInterval(fetchStatus, 1000)
})

onUnmounted(() => {
  if (pollingTimer.value) clearInterval(pollingTimer.value)
})
</script>

<style scoped>
/* 样式复用 Admin 风格 */
.dynamics-panel { height: 100%; padding: 20px; background: #0f172a; color: #fff; }
.header-section { border-bottom: 1px solid #334155; padding-bottom: 16px; margin-bottom: 16px; }
.title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
h3 { margin: 0; font-size: 14px; color: #3b82f6; }
.status-tag { font-size: 10px; padding: 4px 8px; border-radius: 4px; background: #1e293b; }
.status-tag.running { background: rgba(16, 185, 129, 0.2); color: #10b981; }
.config-grid { display: flex; gap: 20px; align-items: flex-end; }
.control-group { flex: 1; display: flex; flex-direction: column; gap: 8px; }
.control-group label { font-size: 9px; color: #94a3b8; font-weight: bold; }
input[type="range"] { width: 100%; accent-color: #3b82f6; }
.action-group { display: flex; gap: 10px; }
button { border: none; padding: 8px 16px; border-radius: 4px; font-size: 11px; font-weight: bold; cursor: pointer; }
.btn-start { background: #3b82f6; color: white; }
.btn-start:disabled { background: #1e293b; color: #475569; cursor: not-allowed; }
.btn-stop { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid #ef4444; }
.viz-section { background: #1e293b; border-radius: 8px; padding: 16px; }
.progress-box { margin-bottom: 20px; }
.prog-info { display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 8px; }
.progress-track { height: 4px; background: #0f172a; border-radius: 2px; }
.progress-bar { height: 100%; background: #3b82f6; transition: width 0.3s; }
.axis-bar-row { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
.axis-label { width: 30px; font-size: 10px; color: #94a3b8; }
.bar-track { flex: 1; height: 6px; background: #0f172a; border-radius: 3px; }
.bar-fill { height: 100%; border-radius: 3px; }
.err-val { width: 50px; font-family: monospace; font-size: 10px; text-align: right; }
</style>