import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ShotControl from '../../components/ShotControl.vue'

describe('ShotControl组件测试', () => {
  it('组件应该正常挂载', () => {
    const wrapper = mount(ShotControl)
    expect(wrapper.exists()).toBe(true)
  })
  
  it('应该包含基础UI元素', () => {
    const wrapper = mount(ShotControl)
    // 检查是否有任何文本内容
    expect(wrapper.text().length).toBeGreaterThan(0)
  })
})