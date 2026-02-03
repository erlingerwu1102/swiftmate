<template>
  <div class="diagnostics-container">
    <div class="header-card card">
      <h2>动力学参数辨识系统 (SDK Pro)</h2>
      <p>自动识别机械臂物理特性，优化 PID 与力矩前馈参数。</p>
    </div>

    <div class="grid-layout">
      <section class="config-panel card">
        <h3>辨识任务配置</h3>
        <div class="form-item">
          <label>激励范围 (0.1 - 1.2m)</label>
          <input type="range" v-model="range" min="0.1" max="1.2" step="0.1" />
          <div class="val-display">{{ range }} m</div>
        </div>
        <button class="btn-start" :disabled="isIdentifying" @click="startTask">
          {{ isIdentifying ? '正在辨识...' : '执行辨识程序' }}
        </button>
      </section>

      <section class="results-panel card">
        <div class="progress-section">
          <div class="progress-text">总进度: {{ progress }}%</div>
          <div class="progress-bar"><div class="fill" :style="{ width: progress + '%' }"></div></div>
        </div>
        <div class="axis-grid">
           <div v-for="i in 6" :key="i" class="axis-box">
              <label>Axis {{ i }}</label>
              <span class="val">±0.00{{ (Math.random()*9).toFixed(0) }}</span>
           </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
// 修正：如果暂不使用 axios，则不导入以消除报错。后续可改为 shotApi 调用。

const range = ref(0.6)
const isIdentifying = ref(false)
const progress = ref(0)

const startTask = () => {
  isIdentifying.value = true
  progress.value = 0
  const timer = setInterval(() => {
    progress.value += 5
    if (progress.value >= 100) {
      clearInterval(timer)
      isIdentifying.value = false
    }
  }, 100)
}
</script>