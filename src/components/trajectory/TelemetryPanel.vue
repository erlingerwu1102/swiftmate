<template>
  <div class="telemetry-panel">
    <div class="panel-header-dark">
      <span>📊 TELEMETRY</span>
      <span class="live">● LIVE</span>
    </div>
    
    <div class="grid">
      <div class="item">
        <span class="k">X</span>
        <span class="v">{{ robotPos.x.toFixed(2) }}</span>
      </div>
      <div class="item">
        <span class="k">Y</span>
        <span class="v">{{ robotPos.y.toFixed(2) }}</span>
      </div>
      <div class="item">
        <span class="k">Z</span>
        <span class="v">{{ robotPos.z.toFixed(2) }}</span>
      </div>
    </div>

    <div class="joints">
      <div v-for="(j, i) in joints" :key="i" class="j-row">
        <span class="j-lbl">J{{ i+1 }}</span>
        <span class="j-val">{{ j.toFixed(1) }}°</span>
        <div class="j-bar"><div class="fill" :style="{width: Math.abs(j)/3.6 + '%'}"></div></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ robotPos: any, joints: number[] }>()
</script>

<style scoped>
.telemetry-panel { background: #0f172a; padding: 12px; border-radius: 8px; border: 1px solid #334155; margin-top: 10px; flex: 1; color: #fff; }
.panel-header-dark { display: flex; justify-content: space-between; margin-bottom: 10px; font-weight: 800; font-size: 11px; color: #94a3b8; }
.live { color: #ef4444; animation: blink 1s infinite; }
.grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 12px; }
.item { background: #1e293b; padding: 6px; border-radius: 4px; text-align: center; }
.k { display: block; font-size: 9px; color: #64748b; font-weight: bold; }
.v { font-family: 'Consolas', monospace; font-size: 13px; color: #fff; font-weight: 600; }
.j-row { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; font-size: 11px; }
.j-lbl { color: #64748b; width: 20px; font-weight: bold; }
.j-val { font-family: 'Consolas'; color: #3b82f6; width: 40px; text-align: right; }
.j-bar { flex: 1; height: 4px; background: #334155; border-radius: 2px; }
.fill { height: 100%; background: #6366f1; border-radius: 2px; }
@keyframes blink { 50% { opacity: 0; } }
</style>