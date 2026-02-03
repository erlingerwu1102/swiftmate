<template>
  <div class="system-panel-container">
    <div class="status-card">
      <div class="card-row">
        <span class="label">SYSTEM STATE</span>
        <span class="badge" :class="status === 'running' ? 'active' : 'idle'">
          {{ status === 'running' ? '● RUNNING' : '○ READY' }}
        </span>
      </div>
      <div class="card-row">
        <span class="label">NETWORK</span>
        <span class="val success">ONLINE (12ms)</span>
      </div>
      <button class="soft-estop" @click="$emit('estop')">
        ⚠️ SOFTWARE E-STOP
      </button>
    </div>

    <div class="log-section">
      <div class="section-header">CONSOLE LOGS</div>
      <div class="log-list custom-scroll">
        <div v-for="(l, i) in logs" :key="i" class="log-item">
          <span class="time">[{{ l.time }}]</span>
          <div class="log-content">
            <span class="type" :class="l.type">[{{ l.type }}]</span>
            <span class="msg">{{ l.msg }}</span>
          </div>
        </div>
        <div v-if="logs.length === 0" class="empty-tip">-- No Active Logs --</div>
      </div>
    </div>

    <div class="sys-info">
      <div class="info-item"><span>CORE:</span> <span>v2.4.0</span></div>
      <div class="info-item"><span>DRIVER:</span> <span>R-Series</span></div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ 
  logs: any[],
  status: string 
}>()

defineEmits(['estop'])
</script>

<style scoped>
/* 容器占满父级（右侧栏）空间 */
.system-panel-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 8px;
  overflow: hidden;
  color: var(--text-primary);
}

/* 状态卡片 */
.status-card {
  background: var(--bg-panel);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10px;
}

.label {
  font-weight: 800;
  color: var(--text-secondary);
}

.badge {
  font-family: monospace;
  font-weight: bold;
  color: var(--text-secondary);
}
.badge.active { color: #10b981; text-shadow: 0 0 5px rgba(16, 185, 129, 0.4); }
.val.success { color: #3b82f6; font-family: monospace; }

.soft-estop {
  background: rgba(239, 68, 68, 0.1);
  border: 1px dashed #ef4444;
  color: #ef4444;
  padding: 8px;
  border-radius: 4px;
  font-weight: 800;
  font-size: 10px;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 4px;
}
.soft-estop:hover {
  background: #ef4444;
  color: #fff;
}

/* 日志区域 */
.log-section {
  flex: 1;
  background: #000; /* 日志通常用深色背景 */
  border: 1px solid var(--border-color);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.section-header {
  padding: 6px 10px;
  background: var(--bg-panel);
  font-size: 9px;
  font-weight: 800;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border-color);
}

.log-list {
  flex: 1;
  overflow-y: auto;
  padding: 6px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.log-item {
  display: flex;
  gap: 6px;
  line-height: 1.4;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  padding-bottom: 2px;
}

.time { color: #64748b; white-space: nowrap; }
.type { font-weight: bold; margin-right: 4px; }
.type.info { color: #3b82f6; }
.type.success { color: #10b981; }
.type.warning { color: #f59e0b; }
.type.error { color: #ef4444; }
.msg { color: #cbd5e1; word-break: break-all; }

.empty-tip {
  text-align: center;
  color: #475569;
  margin-top: 20px;
  font-style: italic;
}

/* 底部信息 */
.sys-info {
  display: flex;
  justify-content: space-between;
  padding: 0 4px;
  font-size: 9px;
  color: var(--text-secondary);
  font-family: monospace;
}

.custom-scroll::-webkit-scrollbar { width: 4px; }
.custom-scroll::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 2px; }
</style>