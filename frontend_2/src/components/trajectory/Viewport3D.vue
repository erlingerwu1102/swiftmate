<template>
  <div class="viewport-box" ref="containerRef">
    <div class="toolbar">
      <div class="tool-group">
        <button :class="{ active: drawMode === 'select' }" @click="$emit('update:drawMode', 'select')">👆 SELECT</button>
        <button :class="{ active: drawMode === 'add' }" @click="$emit('update:drawMode', 'add')" title="Double click to add point">➕ DRAW (DBL-CLICK)</button>
      </div>
      <div class="tool-group">
        <label><input type="checkbox" v-model="showAxes"> AXIS</label>
      </div>
    </div>
    
    <div class="coords-hud">
      TRACKER: X:{{ cursor.x.toFixed(1) }} Y:{{ cursor.y.toFixed(1) }} Z:{{ cursor.z.toFixed(1) }}
    </div>
    
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, reactive } from 'vue'
import * as THREE from 'three'
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const props = defineProps<{
  points: any[],
  selectedIndex: number,
  progress: number,
  isPlaying: boolean,
  drawMode: string,
  // 接收实时坐标
  robotPos: { x: number, y: number, z: number }
}>()

const emit = defineEmits(['select-point', 'update:drawMode', 'canvas-click'])

const containerRef = ref<HTMLDivElement>()
const canvasRef = ref<HTMLCanvasElement>()
const showAxes = ref(true)
const cursor = reactive({ x: 0, y: 0, z: 0 })

// Three.js 核心对象
let scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer
let controls: OrbitControls
let raycaster: THREE.Raycaster, pointer: THREE.Vector2
let pointMeshes: THREE.Mesh[] = []
let trajectoryLine: THREE.Line | null = null 
let gridPlane: THREE.Plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
let robotModel: THREE.Group 

onMounted(() => {
  initThree()
  animate() // 启动渲染循环
  window.addEventListener('resize', onResize)
  if (canvasRef.value) {
    canvasRef.value.addEventListener('pointerdown', onPointerDown)
    canvasRef.value.addEventListener('pointermove', onPointerMove)
    canvasRef.value.addEventListener('dblclick', onDoubleClick)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  renderer?.dispose()
})

// 监听数据变化
watch(() => props.points, renderTrajectory, { deep: true })
watch(() => props.selectedIndex, renderTrajectory)

function initThree() {
  if (!containerRef.value || !canvasRef.value) return
  const w = containerRef.value.clientWidth
  const h = containerRef.value.clientHeight

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x020617)

  // 调整相机位置
  camera = new THREE.PerspectiveCamera(45, w / h, 1, 10000)
  camera.position.set(1000, 1200, 1000)

  renderer = new THREE.WebGLRenderer({ canvas: canvasRef.value, antialias: true })
  renderer.setSize(w, h)
  renderer.setPixelRatio(window.devicePixelRatio)

  // 灯光系统
  scene.add(new THREE.AmbientLight(0xffffff, 0.7))
  const light = new THREE.DirectionalLight(0xffffff, 0.8)
  light.position.set(500, 1000, 500)
  scene.add(light)

  // 地面网格
  const grid = new THREE.GridHelper(2000, 40, 0x334155, 0x111827)
  scene.add(grid)
  
  // 坐标轴辅助
  const axes = new THREE.AxesHelper(300)
  watch(showAxes, (val) => axes.visible = val, { immediate: true })
  scene.add(axes)

  // --- 初始化机械臂模型 ---
  robotModel = new THREE.Group()
  
  // 1. 蓝色基座 (圆柱体) - 设置透明度以便看到内部中心
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(40, 50, 20, 32),
    new THREE.MeshPhongMaterial({ 
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.8 
    })
  )
  // 基座几何中心默认就是 (0,0,0)，无需位移
  robotModel.add(base)

  // 2. 红色中心点 (TCP指示球) - 严格对齐基座中心
  const centerPoint = new THREE.Mesh(
    new THREE.SphereGeometry(8, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xff0000 }) // 红色醒目
  )
  // 【核心修正】：位置归零，确保它是运动的绝对中心
  centerPoint.position.set(0, 0, 0) 
  robotModel.add(centerPoint)

  scene.add(robotModel)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.maxPolarAngle = Math.PI / 2 - 0.1

  raycaster = new THREE.Raycaster()
  pointer = new THREE.Vector2()

  renderTrajectory()
}

/**
 * 渲染路径点和连线
 * 映射逻辑：Data.Z -> Three.Y (垂直高度)
 */
function renderTrajectory() {
  if (!scene) return
  
  pointMeshes.forEach(m => scene.remove(m))
  pointMeshes = []
  if (trajectoryLine) scene.remove(trajectoryLine)

  if (!props.points || props.points.length === 0) return

  const sphereGeo = new THREE.SphereGeometry(8, 24, 24)
  
  props.points.forEach((p, i) => {
    const isSelected = i === props.selectedIndex
    
    // 材质：选中亮橙色，未选中青绿色
    const mat = new THREE.MeshPhongMaterial({ 
      color: isSelected ? 0xff7e00 : 0x10b981, 
      emissive: isSelected ? 0x331a00 : 0x000000,
      shininess: 100
    })
    
    const mesh = new THREE.Mesh(sphereGeo, mat)
    
    // 映射：Z 是高度 (Three.js Y轴)
    mesh.position.set(p.x, p.z, p.y)
    
    // 选中点放大 1.5 倍
    if (isSelected) {
      mesh.scale.set(1.5, 1.5, 1.5)
    }
    
    mesh.userData = { index: i }
    scene.add(mesh)
    pointMeshes.push(mesh)
  })

  // 绘制轨迹连线
  if (props.points.length > 1) {
    const pathPoints = props.points.map(p => new THREE.Vector3(p.x, p.z, p.y))
    const lineGeo = new THREE.BufferGeometry().setFromPoints(pathPoints)
    const lineMat = new THREE.LineBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.6 })
    trajectoryLine = new THREE.Line(lineGeo, lineMat)
    scene.add(trajectoryLine)
  }
}

// 渲染循环
function animate() {
  requestAnimationFrame(animate)
  controls.update()

  // 实时同步机械臂位置
  if (robotModel && props.robotPos) {
    // 映射：X->X, Z->Y(高度), Y->Z(深度)
    robotModel.position.set(
      props.robotPos.x, 
      props.robotPos.z, 
      props.robotPos.y
    )
  }

  renderer.render(scene, camera)
}

// 选中逻辑
function onPointerDown(event: PointerEvent) {
  if (!canvasRef.value || props.drawMode !== 'select') return

  const rect = canvasRef.value.getBoundingClientRect()
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  
  raycaster.setFromCamera(pointer, camera)
  const intersects = raycaster.intersectObjects(pointMeshes)
  
  if (intersects.length > 0) {
    const idx = intersects[0].object.userData.index
    emit('select-point', idx)
  } else {
    emit('select-point', -1)
  }
}

// 双击添加点
function onDoubleClick(event: MouseEvent) {
  if (!canvasRef.value || props.drawMode !== 'add') return

  const rect = canvasRef.value.getBoundingClientRect()
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

  raycaster.setFromCamera(pointer, camera)
  const target = new THREE.Vector3()
  raycaster.ray.intersectPlane(gridPlane, target)

  if (target) {
    // 继承上一个点的高度
    const lastZ = props.points.length > 0 ? props.points[props.points.length - 1].z : 0
    
    // 传出数据：Y是深度，Z是高度
    emit('canvas-click', { 
      x: Math.round(target.x), 
      y: Math.round(target.z), 
      z: lastZ 
    })
  }
}

// HUD 更新
function onPointerMove(event: PointerEvent) {
  if (!canvasRef.value) return
  const rect = canvasRef.value.getBoundingClientRect()
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

  raycaster.setFromCamera(pointer, camera)
  const target = new THREE.Vector3()
  raycaster.ray.intersectPlane(gridPlane, target)

  if (target) {
    cursor.x = target.x
    cursor.y = target.z 
    cursor.z = props.selectedIndex !== -1 ? props.points[props.selectedIndex].z : 0
  }
}

function onResize() {
  if (!containerRef.value || !camera || !renderer) return
  const w = containerRef.value.clientWidth
  const h = containerRef.value.clientHeight
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
}
</script>

<style scoped>
.viewport-box { width: 100%; height: 100%; position: relative; overflow: hidden; background: #000; }
.toolbar { position: absolute; top: 15px; left: 15px; z-index: 10; display: flex; gap: 12px; }
.tool-group { 
  background: rgba(15, 23, 42, 0.9); padding: 5px; border-radius: 6px; 
  display: flex; gap: 5px; border: 1px solid rgba(59, 130, 246, 0.2);
  backdrop-filter: blur(8px);
}
button { 
  background: transparent; border: none; color: #94a3b8; font-size: 10px; 
  cursor: pointer; padding: 6px 12px; font-weight: 800; border-radius: 4px; 
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
button:hover { color: #fff; background: rgba(255, 255, 255, 0.05); }
button.active { background: #3b82f6; color: white; box-shadow: 0 0 12px rgba(59, 130, 246, 0.5); }
label { color: #94a3b8; font-size: 10px; display: flex; align-items: center; gap: 6px; padding: 0 8px; cursor: pointer; font-weight: bold; }

.coords-hud {
  position: absolute; top: 15px; right: 15px; z-index: 10;
  background: rgba(0, 0, 0, 0.8); border: 1px solid #3b82f6;
  color: #3b82f6; font-family: 'Consolas', monospace; font-size: 10px;
  padding: 8px 14px; border-radius: 6px; pointer-events: none;
  box-shadow: 0 4px 12px rgba(0,0,0,0.5);
  letter-spacing: 0.5px;
}
canvas { display: block; width: 100%; height: 100%; outline: none; }
</style>