<template>
  <div class="admin-layout">
    <header class="admin-header">
      <div class="brand">🛡️ SwiftMate SDK Pro</div>
      <div class="user-info">
        <span>ADMINISTRATOR</span>
        <button @click="logout" class="logout-btn">EXIT</button>
      </div>
    </header>

    <main class="dashboard-grid">
      <div class="card monitor-card">
        <h3>USER BEHAVIOR LOGS</h3>
        <div class="log-list custom-scroll">
          <div v-for="(log, i) in mockLogs" :key="i" class="log-item">
            <span class="time">{{ log.time }}</span>
            <span class="user">{{ log.user }}</span>
            <span class="action">{{ log.action }}</span>
          </div>
        </div>
      </div>

      <div class="card dynamics-card">
        <h3>DYNAMICS IDENTIFICATION (SDK)</h3>
        <div class="status-panel">
          <div class="status-row">
            <span>System Status:</span>
            <span :class="identifying ? 'busy' : 'ready'">
              {{ identifying ? 'IDENTIFYING...' : 'READY' }}
            </span>
          </div>
          <div class="progress-bar">
            <div class="fill" :style="{ width: progress + '%' }"></div>
          </div>
        </div>
        
        <div class="control-panel">
          <p class="desc">
            Automatically identify friction, inertia, and mass parameters. 
            Ensure the robot workspace is clear.
          </p>
          <div class="btn-row">
            <button class="btn-start" @click="startIdentification" :disabled="identifying || loading">
              {{ loading ? 'WAIT...' : '▶ START IDENTIFICATION' }}
            </button>
            <button class="btn-stop" @click="stopIdentification" :disabled="!identifying">
              ⏹ EMERGENCY STOP
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
// 使用统一封装的 request，已处理 V2 BaseURL 和 API Key
import api from '@/utils/request'

const router = useRouter()
const identifying = ref(false)
const loading = ref(false) // 增加加载状态控制
const progress = ref(0)
let timer: any = null

const mockLogs = ref([
  { time: '10:01:23', user: 'SWIFT05', action: 'Login Success' },
  { time: '10:02:15', user: 'SWIFT02', action: 'Trajectory Executed (Curve)' },
  { time: '10:05:00', user: 'SWIFT05', action: 'Emergency Stop Triggered' },
])

const logout = () => {
  localStorage.clear()
  router.push('/login')
}

/**
 * 启动辨识：先停止，再开始，防止 400 冲突
 */
const startIdentification = async () => {
  try {
    loading.value = true
    
    // 1. 
    await api.post('/dynamics/identification/stop').catch(() => {}) 
    
    // 2. 发送 V2 启动请求
    await api.post('/dynamics/identification/start', {
      trajectory_range: 10,
      trajectory_speed: 10
    })
    
    identifying.value = true
    progress.value = 0
    startPolling()
  } catch (e: any) {
    alert(e.message || 'API Error')
  } finally {
    loading.value = false
  }
}

const stopIdentification = async () => {
  try {
    await api.post('/dynamics/identification/stop')
    identifying.value = false
    if (timer) clearInterval(timer)
  } catch (e) {
    console.error(e)
  }
}

const startPolling = () => {
  if (timer) clearInterval(timer)
  timer = setInterval(async () => {
    try {
      // 适配 V2 查询接口
      const res = await api.get('/dynamics/identification/status')
      const d = res.data.data
      
      // 兼容 V2 字段
      identifying.value = !!(d.is_identifying || d.running)
      progress.value = d.progress || 0
      
      if (!identifying.value && progress.value >= 100) {
        clearInterval(timer)
        alert('Identification Completed!')
      }
    } catch (e) {
      identifying.value = false
      clearInterval(timer)
    }
  }, 1000)
}

// 挂载时同步一次状态，确保 UI 与后端一致，防止初次点击即报 400
onMounted(() => {
  startPolling() 
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
/* 样式保持原样 */
.admin-layout { height: 100vh; background: #0f172a; color: #e2e8f0; display: flex; flex-direction: column; }
.admin-header { height: 60px; background: #1e293b; border-bottom: 1px solid #334155; display: flex; justify-content: space-between; align-items: center; padding: 0 24px; }
.brand { font-weight: 800; color: #fff; letter-spacing: 1px; }
.user-info { display: flex; gap: 16px; align-items: center; font-size: 12px; font-weight: bold; color: #94a3b8; }
.logout-btn { background: #ef4444; border: none; color: #fff; padding: 4px 12px; border-radius: 4px; cursor: pointer; font-size: 10px; font-weight: bold; }
.dashboard-grid { flex: 1; padding: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.card { background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 20px; display: flex; flex-direction: column; }
.card h3 { margin: 0 0 16px 0; font-size: 12px; color: #64748b; letter-spacing: 1px; border-bottom: 1px solid #334155; padding-bottom: 8px; }
.log-list { flex: 1; overflow-y: auto; font-family: monospace; font-size: 12px; }
.log-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #334155; color: #cbd5e1; }
.log-item .time { color: #64748b; }
.log-item .action { color: #f59e0b; }
.status-panel { background: #0f172a; padding: 12px; border-radius: 6px; margin-bottom: 16px; }
.status-row { display: flex; justify-content: space-between; font-size: 12px; font-weight: bold; margin-bottom: 8px; }
.status-row .ready { color: #10b981; }
.status-row .busy { color: #3b82f6; animation: blink 1s infinite; }
.progress-bar { height: 6px; background: #334155; border-radius: 3px; overflow: hidden; }
.fill { height: 100%; background: #3b82f6; transition: width 0.3s; }
.control-panel .desc { font-size: 12px; color: #94a3b8; margin-bottom: 16px; line-height: 1.5; }
.btn-row { display: flex; gap: 10px; }
button { flex: 1; padding: 10px; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 11px; }
.btn-start { background: #3b82f6; color: #fff; }
.btn-start:disabled { background: #475569; cursor: not-allowed; }
.btn-stop { background: #ef4444; color: #fff; }
.btn-stop:disabled { background: #475569; }
@keyframes blink { 50% { opacity: 0.5; } }
</style>