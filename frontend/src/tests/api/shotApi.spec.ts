import { describe, it, expect } from 'vitest'
import { shotControl } from '@/api/shot'

describe('Shot API', () => {
  it('should export shotControl', () => {
    expect(shotControl).toBeDefined()
    expect(typeof shotControl.translateCamera).toBe('function')
    expect(typeof shotControl.rotateCamera).toBe('function')
    expect(typeof shotControl.getCameraStatus).toBe('function')
  })
})