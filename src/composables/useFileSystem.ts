// src/composables/useFileSystem.ts
export function useFileSystem() {
  
  /**
   * 导出数据为 JSON 文件
   * @param data 要导出的对象或数组
   * @param filename 文件名前缀
   */
  const exportJSON = (data: any, filename: string = 'trajectory') => {
    try {
      const jsonStr = JSON.stringify(data, null, 2)
      const blob = new Blob([jsonStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `${filename}_${Date.now()}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      return { success: true, msg: '文件导出成功' }
    } catch (e) {
      console.error(e)
      return { success: false, msg: '导出失败' }
    }
  }

  /**
   * 导入 JSON 文件
   * @returns Promise 返回解析后的数据
   */
  const importJSON = (): Promise<any> => {
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
        reader.onload = (evt) => {
          try {
            const result = JSON.parse(evt.target?.result as string)
            resolve(result)
          } catch (err) {
            reject('JSON 格式无效')
          }
        }
        reader.onerror = () => reject('文件读取错误')
        reader.readAsText(file)
      }
      
      input.click()
    })
  }

  return {
    exportJSON,
    importJSON
  }
}