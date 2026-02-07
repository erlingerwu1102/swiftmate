<template>
  <div class="motion-panel">
    <div class="panel-header-dark">
      <span>⚙️ MOTION PARAMETERS</span>
      <span class="sub">{{ selectedIndex !== -1 ? 'LOCAL' : 'GLOBAL' }}</span>
    </div>
    
    <div class="ctrl-group">
      <label>VELOCITY %</label>
      <div class="slider-row">
        <input type="range" :value="speed" @input="$emit('update:speed', +($event.target as HTMLInputElement).value)" min="1" max="100">
        <span class="val">{{ speed }}</span>
      </div>
    </div>

    <div class="ctrl-group">
      <label>ACCELERATION %</label>
      <div class="slider-row">
        <input type="range" :value="accel" @input="$emit('update:accel', +($event.target as HTMLInputElement).value)" min="1" max="100">
        <span class="val">{{ accel }}</span>
      </div>
    </div>

    <div class="ctrl-group">
      <label>INTERPOLATION</label>
      <div class="btn-group">
        <button v-for="m in ['SPLINE', 'LIN', 'PTP']" :key="m"
          :class="{ active: precision === m }"
          @click="$emit('update:precision', m)"
        >{{ m }}</button>
      </div>
    </div>

    <button class="estop" @click="$emit('estop')"> EMERGENCY STOP</button>
  </div>
</template>

<script setup lang="ts">
defineProps<{ speed: number, accel: number, precision: string, selectedIndex: number }>()
defineEmits(['update:speed', 'update:accel', 'update:precision', 'estop'])
</script>

<style scoped>
.motion-panel { background: #0f172a; padding: 12px; border-radius: 8px; color: #fff; border: 1px solid #334155; }
.panel-header-dark { display: flex; justify-content: space-between; margin-bottom: 12px; font-weight: 800; font-size: 11px; color: #94a3b8; }
.ctrl-group { margin-bottom: 12px; }
label { display: block; font-size: 10px; color: #64748b; font-weight: 700; margin-bottom: 4px; }
.slider-row { display: flex; align-items: center; gap: 8px; }
input[type=range] { flex: 1; accent-color: #3b82f6; cursor: pointer; }
.val { font-family: 'Consolas', monospace; color: #3b82f6; width: 30px; text-align: right; font-size: 12px; }
.btn-group { display: flex; background: #1e293b; padding: 2px; border-radius: 4px; }
.btn-group button { flex: 1; background: transparent; color: #64748b; border: none; padding: 8px; font-weight: 700; font-size: 11px; cursor: pointer; border-radius: 2px; font-family: 'Noto Sans SC', sans-serif; }
.btn-group button.active { background: #3b82f6; color: #fff; }
.estop { width: 100%; background: #ef4444; color: #fff; font-weight: 900; padding: 12px; border: none; border-radius: 4px; margin-top: 8px; cursor: pointer; letter-spacing: 1px; font-size: 14px; }
</style>