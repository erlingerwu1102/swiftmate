<template>
  <div class="canvas-container">
    <Viewport3D 
      :points="points"
      :selectedIndex="selectedIndex"
      :joints="joints"
      :progress="0"
      :isPlaying="false"
      v-model:drawMode="localDrawMode"
      @select-point="onSelect"
      @update:points="onUpdatePoints"
      @canvas-click="onCanvasClick"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Viewport3D from '@/components/trajectory/Viewport3D.vue'

// 修复：确保传入的 props 与父组件调用一致，解决类型错误
const props = defineProps<{
  points: any[],
  selectedIndex: number,
  joints: number[],
}>()

const emit = defineEmits(['select', 'update:points'])

// 修复：新增 drawMode 本地状态，满足 Viewport3D 的 props 要求
const localDrawMode = ref('select')

const onSelect = (idx: number) => emit('select', idx)
const onUpdatePoints = (pts: any[]) => emit('update:points', pts)

// 简单的点位添加逻辑，适配 Draw 模式
const onCanvasClick = (pos: any) => {
  const newPoints = [...props.points]
  newPoints.push({
    ...pos,
    id: Date.now().toString(),
    type: 'LIN'
  })
  emit('update:points', newPoints)
}
</script>

<style scoped>
.canvas-container { width: 100%; height: 100%; }
</style>