<template>
  <div id="app">
    <header class="app-header">
      <h1>智能运镜控制系统</h1>
    </header>
    
    <main class="app-main">
      <div class="container">
        <!-- 预设运镜区域 -->
        <section class="preset-section">
          <h2>预设运镜区域</h2>
          <div class="preset-buttons">
            <el-button type="primary" @click="selectMode('环绕模式')">环绕模式</el-button>
            <el-button type="primary" @click="selectMode('推进模式')">推进模式</el-button>
            <el-button type="primary" @click="selectMode('平移模式')">平移模式</el-button>
            <el-button type="success" @click="selectMode('自定义轨迹')">自定义轨迹</el-button>
          </div>
        </section>

        <!-- 轨迹编辑区 -->
        <section class="canvas-section">
          <h2>轨迹编辑区</h2>
          <p class="canvas-hint">点击画布添加控制点，拖拽点调整轨迹。</p>
          <div id="canvas-container">
            <canvas id="trajectory-canvas" width="800" height="400"></canvas>
          </div>
        </section>

        <!-- 实时状态 -->
        <section class="status-section">
          <h2>实时状态</h2>
          <div class="status-grid">
            <div class="status-item">
              <label>当前模式：</label>
              <span>{{ currentMode }}</span>
            </div>
            <div class="status-item">
              <label>轨迹点数：</label>
              <span>{{ pointCount }}</span>
            </div>
            <div class="status-item">
              <label>运行状态：</label>
              <el-tag :type="statusTagType">{{ runStatus }}</el-tag>
            </div>
            <div class="status-item">
              <label>进度：</label>
              <el-progress :percentage="progress" :status="progressStatus" />
            </div>
          </div>
          
          <!-- 紧急停止按钮 -->
          <div class="emergency-stop">
            <el-button type="danger" size="large" @click="emergencyStop" :disabled="runStatus === '空闲'">
              🛑 紧急停止
            </el-button>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 状态管理
const currentMode = ref('未选择')
const pointCount = ref(0)
const runStatus = ref('空闲')
const progress = ref(0)

// 计算属性
const statusTagType = computed(() => {
  switch (runStatus.value) {
    case '运行中': return 'success'
    case '空闲': return 'info'
    case '错误': return 'danger'
    default: return 'info'
  }
})

const progressStatus = computed(() => {
  if (progress.value >= 100) return 'success'
  if (progress.value > 0) return undefined
  return 'exception'
})

// 方法
const selectMode = (mode: string) => {
  currentMode.value = mode
  ElMessage.success(`已选择: ${mode}`)
  
  // 模拟轨迹点
  if (mode === '自定义轨迹') {
    pointCount.value = 4
  } else {
    pointCount.value = Math.floor(Math.random() * 5) + 2
  }
}

const emergencyStop = () => {
  runStatus.value = '空闲'
  progress.value = 0
  ElMessage.warning('已紧急停止')
}

// 初始化画布
onMounted(() => {
  const canvas = document.getElementById('trajectory-canvas') as HTMLCanvasElement
  if (canvas) {
    const ctx = canvas.getContext('2d')
    if (ctx) {
      // 绘制示例轨迹
      ctx.strokeStyle = '#409EFF'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(50, 200)
      ctx.bezierCurveTo(150, 50, 350, 350, 550, 200)
      ctx.stroke()
      
      // 绘制控制点
      const points = [
        { x: 50, y: 200 },
        { x: 150, y: 50 },
        { x: 350, y: 350 },
        { x: 550, y: 200 }
      ]
      
      points.forEach(point => {
        ctx.fillStyle = '#F56C6C'
        ctx.beginPath()
        ctx.arc(point.x, point.y, 6, 0, Math.PI * 2)
        ctx.fill()
      })
    }
  }
})
</script>

<style scoped>
.app-header {
  background: #2c3e50;
  color: white;
  text-align: center;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.app-header h1 {
  margin: 0;
  font-size: 1.8rem;
}

.container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

h2 {
  margin-bottom: 1rem;
  color: #2c3e50;
  border-bottom: 2px solid #409EFF;
  padding-bottom: 0.5rem;
}

/* 预设按钮区域 */
.preset-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

/* 轨迹编辑区域 */
.canvas-hint {
  color: #666;
  margin-bottom: 1rem;
  font-style: italic;
}

#canvas-container {
  width: 100%;
  height: 400px;
  border: 2px dashed #dcdfe6;
  border-radius: 6px;
  overflow: hidden;
  background: #fafafa;
}

#trajectory-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

/* 状态区域 */
.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.status-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.status-item label {
  font-weight: bold;
  color: #606266;
}

.status-item span {
  color: #303133;
}

.emergency-stop {
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid #ebeef5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
    gap: 1rem;
  }
  
  .preset-buttons {
    flex-direction: column;
  }
  
  .status-grid {
    grid-template-columns: 1fr;
  }
}
</style>
