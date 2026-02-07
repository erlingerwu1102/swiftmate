<template>
  <div class="panel-container custom-scroll">
    <div v-if="modelValue" class="group-box">
      <div class="box-header">TARGET DURATION</div>
      <div class="time-inputs">
        <div class="input-col"><input type="number" v-model.number="modelValue.h" min="0"><label>HR</label></div>
        <span class="sep">:</span>
        <div class="input-col"><input type="number" v-model.number="modelValue.m" min="0" max="59"><label>MIN</label></div>
        <span class="sep">:</span>
        <div class="input-col"><input type="number" v-model.number="modelValue.s" min="1" max="59"><label>SEC</label></div>
      </div>
      <div class="total-bar">
        <span>TOTAL</span>
        <span class="val">{{ totalSeconds }}s</span>
      </div>
    </div>

    <div class="group-box">
      <div class="box-header">MOTION PARAMETERS</div>
      <div class="param-row">
        <label>Velocity</label>
        <div class="control-flex">
          <input 
            type="range" 
            v-model.number="params.speed" 
            :min="ROBOT_CONFIG.MOTION.MIN_SPEED" 
            :max="ROBOT_CONFIG.MOTION.MAX_SPEED" 
            class="j-slider"
          >
          <span class="val-text">{{ params.speed }}%</span>
        </div>
      </div>
      <div class="param-row dwell-row">
        <label>Cycle Dwell</label>
        <div class="input-wrap">
          <input type="number" v-model.number="params.dwellTime" min="0" step="0.5" class="num-input">
          <span class="unit">S</span>
        </div>
      </div>
      <div class="info-row">
        <span>Waypoints</span>
        <span class="val-highlight">{{ pointCount }}</span>
      </div>
    </div>

    <div class="group-box collision-box">
      <div class="box-header">
        <span> COLLISION DETECTION</span>
        <input type="checkbox" v-model="collisionConfig.enabled" @change="updateCollision" title="Enable/Disable">
      </div>
      <div class="param-row">
        <div class="row-header">
          <label>Force Threshold</label>
          <span class="threshold-val">{{ collisionConfig.threshold }}N</span>
        </div>
        <input 
          type="range" 
          v-model.number="collisionConfig.threshold" 
          :min="ROBOT_CONFIG.MOTION.COLLISION_THRESHOLD.MIN" 
          :max="ROBOT_CONFIG.MOTION.COLLISION_THRESHOLD.MAX" 
          :step="5" 
          class="j-slider danger-slider" 
          @change="updateCollision"
        >
        <div class="scale-labels"><span>Sensitive</span><span>Rigid</span></div>
      </div>
    </div>

    <div class="group-box flex-fill">
      <div class="box-header">JOINT OVERRIDE</div>
      <div class="joint-list custom-scroll">
        <div v-for="(val, i) in joints" :key="i" class="joint-item">
          <div class="j-row-top">
            <span>{{ ROBOT_CONFIG.JOINTS[i]?.name || `AXIS ${i + 1}` }}</span>
            <span class="j-val">{{ val.toFixed(1) }}°</span>
          </div>
          <input 
            type="range" 
            v-model.number="joints[i]" 
            :min="ROBOT_CONFIG.JOINTS[i]?.min || -180" 
            :max="ROBOT_CONFIG.JOINTS[i]?.max || 180" 
            step="0.1" 
            class="j-slider"
          >
        </div>
      </div>
      <button class="reset-btn" @click="$emit('reset')">RESET JOINTS</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
// 关键修复 1: 引入 useTrajectoryRunner
import { useTrajectoryRunner } from '@/composables/useTrajectoryRunner'
import { getCollisionConfig, setCollisionConfig, type CollisionConfig } from '@/api/config'
// 关键修复 2: 引入 ROBOT_CONFIG
import { ROBOT_CONFIG } from '@/config/robotConfig'

interface TimeTarget { h: number; m: number; s: number; }
interface MotionParams { speed: number; accel: number; dwellTime: number; }

const props = defineProps<{
  modelValue?: TimeTarget,
  params: MotionParams,
  pointCount: number
}>()

const emit = defineEmits(['update:modelValue', 'reset'])

// 关键修复 3: 解构出 joints 供模板使用
const { joints } = useTrajectoryRunner()

const collisionConfig = ref<CollisionConfig>({ threshold: 50, enabled: true })

onMounted(async () => {
  try {
    const res = await getCollisionConfig()
    if (res.data.data) collisionConfig.value = res.data.data
  } catch (e) { console.warn("Using default collision config") }
})

const updateCollision = async () => {
  try { await setCollisionConfig(collisionConfig.value) } catch (e) {}
}

const totalSeconds = computed(() => {
  if (!props.modelValue) return 0
  return (props.modelValue.h * 3600) + (props.modelValue.m * 60) + props.modelValue.s
})
</script>

<style scoped>
/* 样式保持不变，使用 CSS 变量 */
.panel-container { display: flex; flex-direction: column; gap: 12px; height: 100%; overflow-y: auto; padding-right: 4px; }
.group-box { background: var(--bg-panel); border: 1px solid var(--border-color); border-radius: 6px; padding: 12px; display: flex; flex-direction: column; }
.flex-fill { flex: 1; min-height: 0; }
.box-header { font-size: 10px; font-weight: 800; color: var(--text-secondary); margin-bottom: 12px; border-bottom: 1px solid var(--border-color); padding-bottom: 4px; display: flex; justify-content: space-between; align-items: center; }

input[type="number"], .num-input {
  background: var(--input-bg) !important; color: var(--input-text) !important;
  border: 1px solid var(--border-color); border-radius: 4px; padding: 6px; font-family: monospace; outline: none;
}
.time-inputs { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.input-col { display: flex; flex-direction: column; align-items: center; flex: 1; }
.input-col input { width: 100%; text-align: center; font-size: 14px; font-weight: bold; }
.input-col label { font-size: 8px; color: var(--text-secondary); margin-top: 4px; }
.sep { margin-bottom: 15px; font-weight: bold; color: var(--text-secondary); }

.total-bar { background: rgba(59, 130, 246, 0.1); border-radius: 4px; padding: 8px; display: flex; justify-content: space-between; font-size: 10px; }
.total-bar .val { color: var(--accent-color); font-weight: bold; }

.param-row { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
.param-row label { font-size: 10px; font-weight: bold; color: var(--text-secondary); }
.control-flex { display: flex; align-items: center; gap: 10px; }
.val-text { font-size: 10px; font-family: monospace; color: var(--accent-color); width: 35px; }
.dwell-row { flex-direction: row; justify-content: space-between; align-items: center; }
.input-wrap { display: flex; align-items: center; gap: 4px; }
.num-input { width: 50px; text-align: right; }
.unit { font-size: 9px; color: var(--text-secondary); }
.info-row { display: flex; justify-content: space-between; font-size: 10px; padding-top: 8px; border-top: 1px dashed var(--border-color); }
.val-highlight { color: var(--accent-color); font-weight: bold; }

.joint-list { overflow-y: auto; padding-right: 4px; flex: 1; }
.joint-item { margin-bottom: 12px; }
.j-row-top { display: flex; justify-content: space-between; font-size: 9px; color: var(--text-secondary); margin-bottom: 4px; }
.j-val { color: var(--input-text); font-family: monospace; }
.j-slider { width: 100%; height: 4px; accent-color: var(--accent-color); cursor: pointer; }
.reset-btn { width: 100%; padding: 10px; background: transparent; border: 1px dashed var(--border-color); color: var(--text-secondary); font-size: 10px; font-weight: bold; cursor: pointer; border-radius: 4px; transition: all 0.2s; margin-top: 8px; }
.reset-btn:hover { border-color: var(--accent-color); color: var(--accent-color); }

.collision-box { border-color: rgba(245, 158, 11, 0.3); }
.row-header { display: flex; justify-content: space-between; margin-bottom: 4px; }
.threshold-val { color: #f59e0b; font-family: monospace; font-weight: bold; font-size: 11px; }
.danger-slider { accent-color: #f59e0b; }
.scale-labels { display: flex; justify-content: space-between; font-size: 8px; color: var(--text-secondary); margin-top: -2px; }

.custom-scroll::-webkit-scrollbar { width: 4px; }
.custom-scroll::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 2px; }
</style>