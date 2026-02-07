<template>
  <div class="data-panel">
    <div class="panel-header">
      <span class="title">SYSTEM TELEMETRY</span>
      <div class="status-indicator" :class="status">
        <span class="dot"></span> {{ status.toUpperCase() }}
      </div>
    </div>

    <div class="telemetry-grid">
      <div class="t-card">
        <label>X-AXIS</label>
        <span class="value">{{ pos.x.toFixed(3) }}</span>
      </div>
      <div class="t-card">
        <label>Y-AXIS</label>
        <span class="value">{{ pos.y.toFixed(3) }}</span>
      </div>
      <div class="t-card">
        <label>Z-AXIS</label>
        <span class="value">{{ pos.z.toFixed(3) }}</span>
      </div>
      <div class="t-card">
        <label>PROGRESS</label>
        <span class="value highlight">{{ Math.floor(progress) }}%</span>
      </div>
    </div>

    <div class="logs-wrapper">
      <div class="log-header">
        <span>EVENT LOGS</span>
        <button class="clear-btn" @click="logs = []">CLEAR</button>
      </div>
      <div class="log-console" ref="logContainer">
        <div v-for="(log, i) in logs" :key="i" class="log-line">
          <span class="time">[{{ log.time }}]</span>
          <span class="msg">{{ log.msg }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { shotApi } from '@/api/shot'

const pos = ref({ x: 0, y: 0, z: 0 })
const status = ref('idle')
const progress = ref(0)
const logs = ref<{time: string, msg: string}[]>([])

let timer: any = null

const updateStatus = async () => {
  try {
    const res = await shotApi.getStatus()
    if (res.data.code === 200) {
      const d = res.data.data
      if (d.current_pos) {
        pos.value = { x: d.current_pos[0], y: d.current_pos[1], z: d.current_pos[2] }
      }
      status.value = d.status || 'idle'
      // shot.ts 里的适配器已确保 progress 存在
      progress.value = d.progress || 0
    }
  } catch (e) {
    status.value = 'error'
  }
}

onMounted(() => {
  timer = setInterval(updateStatus, 500)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.data-panel { height: 100%; display: flex; flex-direction: column; padding: 12px; gap: 12px; background: #fff; }
.panel-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 8px; }
.title { font-size: 10px; font-weight: 800; color: #64748b; }
.status-indicator { font-size: 10px; font-weight: bold; display: flex; align-items: center; gap: 4px; }
.status-indicator.idle { color: #f59e0b; }
.status-indicator.running { color: #10b981; }
.status-indicator.error { color: #ef4444; }
.dot { width: 6px; height: 6px; background: currentColor; border-radius: 50%; }

.telemetry-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.t-card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 4px; text-align: center; }
.t-card label { display: block; font-size: 9px; color: #94a3b8; font-weight: 700; }
.t-card .value { font-family: monospace; font-size: 13px; font-weight: 600; color: #334155; }
.value.highlight { color: #3b82f6; }

.logs-wrapper { flex: 1; border: 1px solid #e2e8f0; border-radius: 4px; display: flex; flex-direction: column; overflow: hidden; }
.log-header { background: #f1f5f9; padding: 4px 8px; display: flex; justify-content: space-between; font-size: 9px; font-weight: bold; color: #64748b; }
.clear-btn { border: none; background: none; color: #3b82f6; cursor: pointer; font-size: 9px; }
.log-console { flex: 1; overflow-y: auto; padding: 8px; background: #1e293b; color: #e2e8f0; font-family: monospace; font-size: 10px; }
.log-line { display: flex; gap: 6px; margin-bottom: 2px; }
.time { color: #64748b; }
</style>