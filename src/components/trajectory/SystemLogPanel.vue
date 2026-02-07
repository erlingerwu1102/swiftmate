<template>
  <div class="log-panel">
    <div class="header">
      <span>> SYSTEM CONSOLE</span>
      <span class="status">ONLINE</span>
    </div>
    <div class="log-container custom-scroll-light">
      <div v-for="(l, i) in logs" :key="i" class="log-line">
        <span class="time">[{{ l.time }}]</span>
        <span class="type" :class="l.type">{{ l.type }}</span>
        <span class="msg">{{ l.msg }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ logs: any[] }>()
</script>

<style scoped>
.log-panel { height: 100%; display: flex; flex-direction: column; background: #fff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; }
.header { background: #f8fafc; padding: 8px 12px; font-family: 'Consolas', monospace; font-size: 11px; color: #64748b; display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; }
.status { color: #10b981; font-weight: bold; }
.log-container { flex: 1; padding: 8px; overflow-y: auto; font-family: 'Consolas', monospace; font-size: 12px; }
.log-line { margin-bottom: 4px; display: flex; gap: 8px; }
.time { color: #94a3b8; }
.type { font-weight: bold; text-transform: uppercase; }
.type.info { color: #3b82f6; }
.type.error { color: #ef4444; }
.msg { color: #334155; word-break: break-all; }
.custom-scroll-light::-webkit-scrollbar { width: 4px; }
.custom-scroll-light::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }
</style>