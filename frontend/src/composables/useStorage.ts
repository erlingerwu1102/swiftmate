import { ref } from 'vue'

export interface Waypoint { x: number; y: number; z: number; type: string; id: string }
export interface Template { name: string; icon: string; points: Waypoint[] }

const STORAGE_KEY = 'swiftmate_user_tpls'

export function useStorage() {
  // --- 1. 系统默认模板 (硬编码，不可删除) ---
  const defaultTemplates: Template[] = [
    { 
      name: 'Orbit ', icon: '', 
      points: [
        { x: 500, y: 0, z: 200, type: 'PTP', id: 'o1' },
        { x: 0, y: 500, z: 200, type: 'CIRC', id: 'o2' },
        { x: -500, y: 0, z: 200, type: 'CIRC', id: 'o3' },
        { x: 0, y: -500, z: 200, type: 'CIRC', id: 'o4' },
        { x: 500, y: 0, z: 200, type: 'CIRC', id: 'o5' }
      ] 
    },
    { 
      name: 'One Take', icon: '',
      points: [
        { x: 800, y: -400, z: 600, type: 'PTP', id: 'ot1' },
        { x: 400, y: 0, z: 100, type: 'LIN', id: 'ot2' },
        { x: 200, y: 600, z: 300, type: 'LIN', id: 'ot3' },
        { x: 600, y: 0, z: 400, type: 'LIN', id: 'ot4' }
      ] 
    }
  ]

  // --- 2. 用户自定义模板 (响应式) ---
  const userTemplates = ref<Template[]>([])

  // 初始化：从 LocalStorage 读取
  const initStorage = () => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        userTemplates.value = JSON.parse(saved)
      } catch (e) {
        console.error('存储数据损坏，重置模板库')
        userTemplates.value = []
      }
    }
  }

  // 保存模板到本地 (物理写入)
  const saveToLocal = (name: string, points: Waypoint[]) => {
    const newTpl: Template = { 
      name, 
      icon: '💾', 
      points: JSON.parse(JSON.stringify(points)) 
    }
    userTemplates.value.push(newTpl)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userTemplates.value))
  }

  // 删除模板 (物理删除)
  const deleteTemplate = (index: number) => {
    userTemplates.value.splice(index, 1)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userTemplates.value))
  }

  // --- 3. 文件系统操作 ---
  
  // 导出 JSON
  const exportJSON = (data: any) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trajectory_${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // 导入 JSON
  const importJSON = (): Promise<Waypoint[]> => {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.json'
      
      input.onchange = (e: any) => {
        const file = e.target.files[0]
        if (!file) {
          reject('未选择文件')
          return
        }
        const reader = new FileReader()
        reader.onload = (f) => {
          try {
            const res = JSON.parse(f.target?.result as string)
            if (Array.isArray(res)) resolve(res)
            else reject('格式错误：文件必须包含数组')
          } catch (err) {
            reject('文件解析失败')
          }
        }
        reader.readAsText(file)
      }
      input.click()
    })
  }

  return { 
    defaultTemplates, 
    userTemplates, 
    initStorage, 
    saveToLocal, 
    deleteTemplate, 
    exportJSON, 
    importJSON 
  }
}