<template>
  <div class="camera-container">
    <img 
      v-if="isConnected"
      :src="streamUrl" 
      class="video-feed" 
      alt="Live Feed"
      @error="handleError"
    />

    <div v-else class="no-signal">
      <div class="icon">📡</div>
      <div class="text">NO SIGNAL</div>
      <div class="sub-text">正在尝试连接摄像头...</div>
      <button class="retry-btn" @click="retryConnection">重试连接</button>
    </div>

    <div class="overlay-info">
      <span class="badge">LIVE</span>
      <span class="fps">30 FPS</span>
      <span class="res">1920x1080</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  url?: string
}>()

// 默认指向后端 OpenCV 视频流接口
const streamUrl = ref(props.url || '/api/v1/video_feed')
const isConnected = ref(true)

const handleError = () => {
  isConnected.value = false
}

const retryConnection = () => {
  // 通过添加时间戳强制刷新图片流
  const baseUrl = props.url || '/api/v1/video_feed'
  streamUrl.value = `${baseUrl}?t=${Date.now()}`
  isConnected.value = true
}
</script>

<style scoped>
.camera-container {
  width: 100%;
  height: 100%;
  background: #000;
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.video-feed {
  width: 100%;
  height: 100%;
  object-fit: contain; /* 保持比例 */
}

.no-signal {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #ef4444;
  gap: 12px;
}
.icon { font-size: 32px; margin-bottom: 8px; }
.text { font-weight: 900; letter-spacing: 2px; font-size: 18px; }
.sub-text { color: #64748b; font-size: 12px; }

.retry-btn {
  margin-top: 10px;
  padding: 6px 16px;
  background: transparent;
  border: 1px solid #ef4444;
  color: #ef4444;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s;
}
.retry-btn:hover { background: #ef4444; color: white; }

.overlay-info {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 8px;
}
.badge, .fps, .res {
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-family: 'JetBrains Mono', monospace;
  backdrop-filter: blur(4px);
}
.badge { background: #ef4444; font-weight: bold; }
</style>