// src/composables/useTemplateManager.ts
import { ref } from 'vue'

export interface Template {
  name: string
  icon: string
  points: any[]
}

export function useTemplateManager() {
  // 定义默认预设模式
  const defaultTemplates: Template[] = [
    { 
      name: 'Orbit Circle ', 
      icon: '🪐', 
      points: [
        { x: 500, y: 0, z: 200, type: 'PTP', id: 'orb-1' },     // 起点
        { x: 400, y: 100, z: 200, type: 'CIRC', id: 'orb-2' }, // 90度
        { x: 300, y: 0, z: 200, type: 'CIRC', id: 'orb-3' },   // 180度
        { x: 400, y: -100, z: 200, type: 'CIRC', id: 'orb-4' },// 270度
        { x: 500, y: 0, z: 200, type: 'CIRC', id: 'orb-5' }    // 回到起点
      ] 
    },
    { 
      name: 'One Take ', 
      icon: '🎥', 
      points: [
        { x: 300, y: -200, z: 400, type: 'PTP', id: 'ot-1' },   // 高位入场
        { x: 400, y: 0, z: 100, type: 'LIN', id: 'ot-2' },      // 俯冲特写
        { x: 500, y: 200, z: 150, type: 'LIN', id: 'ot-3' },    // 侧拉
        { x: 600, y: 0, z: 300, type: 'SPLINE', id: 'ot-4' },   // 拉升离场
      ] 
    },
    
  ]

  const templates = ref<Template[]>([])

  // 初始化：合并默认模板和用户保存的模板
  const initTemplates = () => {
    const saved = localStorage.getItem('user_templates')
    let userTpls: Template[] = []
    if (saved) {
      try {
        userTpls = JSON.parse(saved)
      } catch (e) {
        console.error('模板加载失败', e)
      }
    }
    templates.value = [...defaultTemplates, ...userTpls]
  }

  // 保存新模板到 LocalStorage
  const saveTemplate = (name: string, points: any[]) => {
    const newTemplate = {
      name,
      icon: '💾',
      points: JSON.parse(JSON.stringify(points)) // 深拷贝
    }
    
    // 更新当前列表
    templates.value.push(newTemplate)

    // 只持久化用户自定义的模板（过滤掉默认的）
    const userOnly = templates.value.filter(t => !defaultTemplates.some(dt => dt.name === t.name))
    localStorage.setItem('user_templates', JSON.stringify(userOnly))
  }

  return {
    templates,
    initTemplates,
    saveTemplate
  }
}