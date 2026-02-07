<template>
  <div class="data-panel">
    <div class="data-header">REAL-TIME TELEMETRY</div>
    <div class="xyz-grid">
      <div class="card">X: {{ pos.x.toFixed(2) }}</div>
      <div class="card">Y: {{ pos.y.toFixed(2) }}</div>
      <div class="card">Z: {{ pos.z.toFixed(2) }}</div>
    </div>
    <div class="log-window">
       <div v-for="(log, i) in logs" :key="i" class="log-entry">
         {{ log.time }} - {{ log.msg }}
       </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { shotApi } from '@/api/shot'

const pos = ref({ x: 0, y: 0, z: 0 })
const logs = ref<{time: string, msg: string}[]>([])
let pollTimer: any = null

const updateStatus = async () => {
  try {
    const res = await shotApi.getStatus()
    // 修复后，这里 res.data 是 SdkResponse，res.data.data 是 RobotStatus
    // TypeScript 现在能正确理解这个结构
    if (res.data.code === 200 && res.data.data.current_pos) {
      const [x, y, z] = res.data.data.current_pos
      pos.value = { x, y, z }
    }
  } catch (e) {
    // 轮询失败暂不报错，避免刷屏
  }
}

onMounted(() => {
  pollTimer = setInterval(updateStatus, 500)
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
})
</script>

<style scoped>
.data-panel { padding: 12px; display: flex; flex-direction: column; gap: 10px; height: 100%; }
.data-header { font-size: 10px; font-weight: 800; color: #64748b; }
.xyz-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 5px; }
.card { background: #f8fafc; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px; }
.log-window { flex: 1; background: #1e293b; color: #94a3b8; padding: 10px; font-size: 10px; overflow-y: auto; border-radius: 4px; }
</style>