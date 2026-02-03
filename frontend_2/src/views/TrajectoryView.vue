<template>
  <MainLayout class="app-container">
    <template #header-right>
      <button class="exit-link" @click="handleExit">EXIT ⏻</button>
    </template>

    <template #left>
      <div class="col-left">
        <div class="panel-section camera-box">
          <div class="panel-header">
            <span>📹 VISION FEED</span>
            <span class="status-badge" :class="{ active: isPlaying }">
              {{ isPlaying ? '● LIVE' : 'STANDBY' }}
            </span>
          </div>
          <div class="camera-content">
            <CameraView url="/api/v1/video_feed" />
            <div class="overlay-hud"><span>CAM_01</span><span>1080P</span></div>
          </div>
        </div>

        <div class="panel-section waypoint-box adaptive-panel">
          <WaypointList 
            :points="points" :selectedIndex="selectedIndex"
            @select="idx => selectedIndex = idx"
            @add="addPoint" @remove="removePoint"
            @import="handleImport" @export="exportJSON(points)"
            @update="syncRobotToSelection" 
          />
        </div>

        <div class="panel-section template-box adaptive-panel">
          <div class="panel-header-sm"> PRESETS / SAVED</div>
          <div class="tpl-grid custom-scroll">
            <div v-for="t in defaultTemplates" :key="t.name" class="tpl-card system" @click="loadTemplate(t)">
              <div class="icon">{{ t.icon }}</div>
              <div class="info">
                <span class="name">{{ t.name }}</span>
                <span class="tag">SYS</span>
              </div>
            </div>
            <div v-for="(t, i) in userTemplates" :key="'u'+i" class="tpl-card user" @click="loadTemplate(t)">
              <div class="icon">{{ t.icon }}</div>
              <div class="info">
                <span class="name">{{ t.name }}</span>
                <span class="tag user">USER</span>
              </div>
              <button class="del-btn" @click.stop="deleteTemplate(i)" title="Delete">×</button>
            </div>
          </div>
          <div class="action-row">
            <button class="action-btn primary" @click="handleSaveTemplate">💾 SAVE AS</button>
            <button class="action-btn secondary" @click="clearPoints">🗑️ CLEAR</button>
          </div>
        </div>
      </div>
    </template>

    <template #center>
      <div class="col-center">
        <Viewport3D 
  v-model:points="points" 
  v-model:drawMode="drawMode"
  :selectedIndex="selectedIndex" 
  :joints="joints"
  :progress="progress" 
  :isPlaying="isPlaying"
  :robotPos="robotPos" 
  @select-point="idx => selectedIndex = idx"
  @canvas-click="handleCanvasClick"
/>
        
        <div class="playback-bar">
          <div class="play-controls">
            <button class="play-btn" :class="{ active: isPlaying }" @click="togglePlay">
              {{ isPlaying ? '⏸' : '▶' }}
            </button>
            <div class="mode-group">
              <select v-model="playMode" :disabled="isPlaying" class="mode-select">
                <option value="single">🔁 SINGLE</option>
                <option value="loop">🔄 LOOP ∞</option>
                <option value="count">🔢 COUNT</option>
              </select>
              <input v-if="playMode === 'count'" v-model.number="loopTarget" type="number" min="1" class="loop-inp" title="Loop Count">
            </div>
          </div>
          <div class="progress-section">
            <div class="progress-track">
              <div class="progress-fill" :class="{ waiting: isWaiting }" :style="{ width: progress + '%' }"></div>
            </div>
            <div class="status-hud">
              <span v-if="playMode === 'count'" class="loop-stat">LOOP: {{ currentLoop }}/{{ loopTarget }}</span>
              <span v-else-if="playMode === 'loop'" class="loop-stat">LOOP: {{ currentLoop }}</span>
              <span v-else class="loop-stat">SINGLE RUN</span>
              <span class="pct">{{ isWaiting ? `WAIT ${waitCountdown.toFixed(1)}s` : `${progress.toFixed(0)}%` }}</span>
            </div>
          </div>
          <button class="btn-estop" @click="estop" title="Emergency Stop">STOP 🛑</button>
        </div>
      </div>
    </template>

    <template #right>
      <div class="col-right">
        <div class="tabs-header">
          <button v-for="tab in ['OPERATION', 'SYSTEM']" :key="tab" class="tab-btn" :class="{ active: activeTab === tab }" @click="activeTab = tab">{{ tab }}</button>
        </div>
        <div class="tab-content">
          <OperationPanel 
            v-if="activeTab === 'OPERATION'"
            :params="params"
            :pointCount="points.length"
            @reset="resetJoints"
          />
          <SystemPanel 
            v-else
            :logs="logs"
            :status="isPlaying ? 'running' : 'ready'"
            @estop="estop"
          />
        </div>
      </div>
    </template>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import CameraView from '@/components/viewport/CameraView.vue'
import Viewport3D from '@/components/trajectory/Viewport3D.vue'
import WaypointList from '@/components/trajectory/WaypointList.vue'
import OperationPanel from '@/components/trajectory/OperationPanel.vue'
import SystemPanel from '@/components/trajectory/SystemPanel.vue'
import { useStorage } from '@/composables/useStorage'
import { useTrajectoryRunner } from '@/composables/useTrajectoryRunner'

const router = useRouter()
const { defaultTemplates, userTemplates, initStorage, saveToLocal, deleteTemplate, exportJSON, importJSON } = useStorage()
const { isPlaying, progress, joints, updateRobotState, robotPos } = useTrajectoryRunner()

const activeTab = ref('OPERATION')
const selectedIndex = ref(0)
const drawMode = ref('select')
const points = ref<any[]>([{ x: 300, y: 0, z: 200, type: 'LIN', id: '1' }])
const logs = ref<any[]>([])

// 播放控制状态
const playMode = ref<'single' | 'loop' | 'count'>('single')
const loopTarget = ref(3)
const currentLoop = ref(0)
const isWaiting = ref(false)
const waitCountdown = ref(0)
const params = reactive({ speed: 50, accel: 50, dwellTime: 1.0 })

// --- 核心修复：同步机械臂位置 ---
const syncRobotToSelection = () => {
  if (!isPlaying.value && selectedIndex.value !== -1 && points.value[selectedIndex.value]) {
    // 将 robotPos 直接移动到当前选中的点，实现“所见即所得”
    const p = points.value[selectedIndex.value]
    robotPos.x = p.x
    robotPos.y = p.y
    robotPos.z = p.z
  }
}

// 监听选中项变化，自动同步位置
watch(selectedIndex, syncRobotToSelection)

const handleExit = () => { localStorage.removeItem('isLoggedIn'); router.push('/login') }
const addLog = (msg: string, type='info') => logs.value.push({ time: new Date().toLocaleTimeString(), msg, type })

const handleImport = async () => { 
  try {
    const data = await importJSON()
    if (data) { 
      points.value = data 
      addLog('Imported successfully', 'success') 
    }
  } catch(e) { 
    addLog('Import failed', 'error') 
  }
}

const handleSaveTemplate = () => { 
  const n = prompt('Template Name:')
  if(n) { saveToLocal(n, points.value); addLog(`Saved "${n}"`, 'success') }
}

const clearPoints = () => { if(confirm('Clear all?')) { points.value = []; addLog('Points cleared', 'warning') } }

const loadTemplate = (t: any) => { 
  points.value = JSON.parse(JSON.stringify(t.points))
  progress.value = 0
  updateRobotState(points.value, 0)
  addLog(`Loaded "${t.name}"`, 'info') 
}

const addPoint = () => {
  const lastP = points.value[points.value.length-1] || {x:0,y:0,z:0}
  points.value.push({ ...lastP, x: lastP.x + 50, id: Date.now().toString() })
  // 新增点后选中它
  selectedIndex.value = points.value.length - 1
}

const removePoint = (i: number) => { points.value.splice(i, 1); selectedIndex.value = -1 }

const handleCanvasClick = (pos: any) => {
  const referenceZ = selectedIndex.value !== -1 ? points.value[selectedIndex.value].z : 0
  points.value.push({ ...pos, z: referenceZ, type: 'LIN', id: Date.now().toString() })
  selectedIndex.value = points.value.length - 1 // 选中新点
}

const resetJoints = () => { joints.value = [0,0,0,0,0,0]; addLog('Joints homed', 'info') }

const togglePlay = () => {
  if (isPlaying.value) { 
    isPlaying.value = false; isWaiting.value = false; addLog('Paused', 'warning'); return 
  }
  if (progress.value >= 100) { progress.value = 0; currentLoop.value = 0; }
  isPlaying.value = true; addLog(`Started`, 'success'); runLoop()
}

const runLoop = () => {
  const timer = setInterval(() => {
    if (!isPlaying.value) { clearInterval(timer); return }
    if (isWaiting.value) return
    const step = 0.2 * (params.speed / 50)
    progress.value += step
    updateRobotState(points.value, progress.value)
    if (progress.value >= 100) {
      if (playMode.value === 'single') { finishPlay(timer, 'Done') }
      else {
        currentLoop.value++
        if (playMode.value === 'count' && currentLoop.value >= loopTarget.value) { finishPlay(timer, 'Loop Done') }
        else { progress.value = 0; if (params.dwellTime > 0) startDwell() }
      }
    }
  }, 20)
}

const finishPlay = (timer: any, msg: string) => { clearInterval(timer); isPlaying.value = false; progress.value = 100; addLog(msg, 'success') }
const startDwell = () => {
  isWaiting.value = true; waitCountdown.value = params.dwellTime
  const dt = setInterval(() => {
    if (!isPlaying.value) { clearInterval(dt); isWaiting.value = false; return }
    waitCountdown.value -= 0.1
    if (waitCountdown.value <= 0) { clearInterval(dt); isWaiting.value = false }
  }, 100)
}
const estop = () => { 
  isPlaying.value = false; 
  isWaiting.value = false; 
  addLog('E-STOP', 'error') 
}

onMounted(() => initStorage())
</script>

<style scoped>
/* 样式保持不变 */
.app-container {
  --bg-app: #020617;
  --text-primary: #f8fafc;
  --bg-panel: #1e293b;
  --border-color: #334155;
  --accent-color: #3b82f6;
  --text-secondary: #94a3b8;
  --header-bg: #000000;
  --header-text: #ffffff;
  --input-bg: #0f172a;
  --input-text: #ffffff;
  background: var(--bg-app);
  color: var(--text-primary);
}

@media (prefers-color-scheme: light) {
  .app-container {
    --bg-app: #ffffff;
    --text-primary: #1e293b;
    --text-secondary: #64748b;
    --bg-panel: #f1f5f9;
    --border-color: #cbd5e1;
    --header-bg: #ffffff;
    --header-text: #1e293b;
    --input-bg: #ffffff;
    --input-text: #1e293b;
  }
}

.col-left, .col-center, .col-right { display: flex; flex-direction: column; height: 100%; gap: 8px; overflow: hidden; }
.panel-section { background: var(--bg-panel); border: 1px solid var(--border-color); border-radius: 4px; overflow: hidden; display: flex; flex-direction: column; }

.camera-box { flex: 0 0 180px; position: relative; background: #000 !important; border-color: #334155 !important; }
.camera-content { height: 100%; }
.panel-header { padding: 6px 10px; background: rgba(0,0,0,0.6); position: absolute; top:0; left:0; right:0; z-index:2; display:flex; justify-content:space-between; font-size:10px; font-weight:bold; color: #fff; }
.status-badge.active { color: #10b981; animation: pulse 2s infinite; }

.waypoint-box { flex: 1; min-height: 0; }
.template-box { flex: 0 0 240px; padding: 8px; }
.panel-header-sm { font-size: 10px; font-weight: 800; color: var(--text-secondary); margin-bottom: 6px; }

.tpl-grid { flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 6px; overflow-y: auto; margin-bottom: 8px; }
.tpl-card { 
  background: var(--input-bg);
  border: 1px solid var(--border-color); 
  border-radius: 4px; padding: 8px; cursor: pointer;
  display: flex; gap: 6px; align-items: center; position: relative;
  color: var(--input-text);
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}
.tpl-card:hover { border-color: var(--accent-color); background: rgba(59, 130, 246, 0.05); }
.icon { font-size: 16px; }
.info { display: flex; flex-direction: column; overflow: hidden; }
.name { font-size: 10px; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tag { font-size: 8px; color: var(--text-secondary); margin-top: 2px; }
.tag.user { color: var(--accent-color); }
.del-btn { position: absolute; top: 2px; right: 2px; background: none; border: none; color: #ef4444; font-size: 14px; cursor: pointer; display: none; }
.tpl-card:hover .del-btn { display: block; }

.action-row { display: flex; gap: 6px; }
.action-btn { flex: 1; padding: 8px; border-radius: 4px; font-size: 10px; font-weight: bold; cursor: pointer; border: none; }
.action-btn.primary { background: var(--accent-color); color: #fff; }
.action-btn.secondary { background: var(--input-bg); color: var(--input-text); border: 1px solid var(--border-color); }

.col-center { background: #000; border: 1px solid var(--border-color); position: relative; }
.playback-bar { 
  position: absolute; bottom: 15px; left: 15px; right: 15px;
  background: rgba(15, 23, 42, 0.95); padding: 8px 12px; border-radius: 6px; 
  border: 1px solid var(--accent-color); display: flex; align-items: center; gap: 12px;
  backdrop-filter: blur(4px);
}
.play-controls { display: flex; gap: 8px; align-items: center; }
.play-btn { background: var(--accent-color); color: white; border: none; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; font-size: 12px; display: flex; align-items: center; justify-content: center; }
.mode-group { display: flex; gap: 4px; }
.mode-select, .loop-inp { background: #0f172a; border: 1px solid #334155; color: #cbd5e1; font-size: 10px; padding: 2px 4px; border-radius: 4px; height: 24px; outline: none; }
.loop-inp { width: 35px; text-align: center; }

.progress-section { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.progress-track { flex: 1; height: 4px; background: #334155; border-radius: 2px; overflow: hidden; }
.progress-fill { height: 100%; background: var(--accent-color); transition: width 0.1s linear; }
.progress-fill.waiting { background: #eab308; animation: pulse 1s infinite; }
.status-hud { display: flex; justify-content: space-between; font-family: monospace; font-size: 10px; color: var(--accent-color); }
.loop-stat { color: #f59e0b; font-weight: bold; }

.btn-estop {
  height: 28px;
  padding: 0 12px;
  background: #ef4444;
  border: 1px solid #b91c1c;
  border-radius: 4px;
  color: white;
  font-weight: 800;
  font-size: 11px;
  cursor: pointer;
  margin-left: 8px;
  white-space: nowrap;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}
.btn-estop:hover { background: #dc2626; box-shadow: 0 0 8px rgba(239, 68, 68, 0.5); }
.btn-estop:active { transform: scale(0.95); }

.tabs-header { display: flex; gap: 2px; background: var(--bg-panel); border-radius: 4px 4px 0 0; border: 1px solid var(--border-color); border-bottom: none; }
.tab-btn { flex: 1; background: none; border: none; color: var(--text-secondary); padding: 10px; font-size: 11px; font-weight: bold; cursor: pointer; border-bottom: 2px solid transparent; }
.tab-btn.active { color: var(--accent-color); border-bottom-color: var(--accent-color); background: rgba(59,130,246,0.05); }
.tab-content { flex: 1; display: flex; flex-direction: column; min-height: 0; }

.exit-link { background: none; border: 1px solid #ef4444; color: #ef4444; padding: 4px 10px; border-radius: 4px; font-size: 10px; cursor: pointer; }
.custom-scroll::-webkit-scrollbar { width: 4px; }
.custom-scroll::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 2px; }
@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
</style>