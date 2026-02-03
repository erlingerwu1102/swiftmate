<template>
  <div class="wp-container">
    <div class="header">
      <div class="title-group"><h3> TRAJECTORY POINTS</h3></div>
      <div class="actions">
        <button class="icon-btn" @click="$emit('import')">📂</button>
        <button class="icon-btn" @click="$emit('export')">💾</button>
      </div>
    </div>

    <div class="list-body custom-scroll">
      <div v-for="(p, i) in points" :key="i" class="row" :class="{ active: selectedIndex === i }" @click="$emit('select', i)">
        <div class="idx">{{ i + 1 }}</div>
        <div class="type-select">
          <select v-model="p.type" @change="$emit('update')">
            <option>PTP</option><option>LIN</option><option>CIRC</option>
          </select>
        </div>
        <div class="coords">
          <div class="coord-item"><span>X</span><input v-model.number="p.x" @input="$emit('update')"></div>
          <div class="coord-item"><span>Y</span><input v-model.number="p.y" @input="$emit('update')"></div>
          <div class="coord-item"><span>Z</span><input v-model.number="p.z" @input="$emit('update')"></div>
        </div>
        <button class="del-btn" @click.stop="$emit('remove', i)">×</button>
      </div>
    </div>
    <div class="footer"><button class="add-btn" @click="$emit('add')">+ ADD WAYPOINT</button></div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ points: any[], selectedIndex: number }>()
defineEmits(['select', 'remove', 'add', 'update', 'export', 'import'])
</script>

<style scoped>
/* 继承父级变量 */
.wp-container { display: flex; flex-direction: column; height: 100%; color: var(--text-primary); }
.header { flex: 0 0 auto; padding: 8px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; }
.header h3 { margin: 0; font-size: 11px; color: var(--text-secondary); font-weight: 800; }
.icon-btn { background: transparent; border: 1px solid var(--border-color); color: var(--text-primary); padding: 2px 6px; border-radius: 4px; cursor: pointer; font-size: 10px; margin-left: 4px; }
.list-body { flex: 1; overflow-y: auto; padding: 4px; display: flex; flex-direction: column; gap: 4px; }

/* 行样式：背景色使用 --input-bg */
.row { display: flex; align-items: center; background: var(--input-bg); border: 1px solid transparent; padding: 6px; border-radius: 4px; cursor: pointer; transition: all 0.1s; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
.row:hover { border-color: var(--border-color); }
.row.active { border-color: var(--accent-color); background: rgba(59,130,246,0.1); }

.type-select select { background: transparent; border: 1px solid var(--border-color); color: var(--accent-color); font-size: 10px; padding: 2px; border-radius: 3px; width: 50px; outline: none; }
.coords { flex: 1; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4px; margin: 0 8px; }

/* 修复：输入框背景 */
.coord-item { display: flex; align-items: center; background: rgba(0,0,0,0.05); border: 1px solid var(--border-color); border-radius: 3px; padding: 0 4px; }
.coord-item span { font-size: 8px; color: var(--text-secondary); margin-right: 2px; }
.coord-item input { 
  width: 100%; background: transparent; border: none; 
  color: var(--input-text); /* 关键：文字颜色随皮肤 */
  font-family: monospace; font-size: 10px; text-align: right; outline: none; 
}

.del-btn { background: transparent; border: none; color: #ef4444; font-weight: bold; cursor: pointer; }
.footer { flex: 0 0 auto; padding: 8px; border-top: 1px solid var(--border-color); }
.add-btn { width: 100%; background: var(--accent-color); border: none; color: white; padding: 8px; border-radius: 4px; font-size: 11px; font-weight: bold; cursor: pointer; }
.custom-scroll::-webkit-scrollbar { width: 4px; }
.custom-scroll::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 2px; }
</style>