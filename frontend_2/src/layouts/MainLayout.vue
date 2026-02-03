<template>
  <div class="sdk-pro-layout" :class="themeMode">
    <header class="navbar">
      <div class="brand-group">
        <div class="logo-box">
          <img src="@/assets/logo.png" alt="Logo" class="logo-img" />
        </div>
        <div class="titles">
          <h1 class="app-name">SWIFTMATE <span class="tag">PRO</span></h1>
          <span class="sub-name">SDK CONTROL V2.1</span>
        </div>
      </div>

      <div class="nav-actions">
        <button class="theme-toggle" @click="toggleTheme" title="Switch Theme">
          <span class="icon">{{ themeMode === 'light' ? '☀️' : '🌙' }}</span>
          <span class="label">{{ themeMode === 'light' ? 'DAY' : 'NIGHT' }}</span>
        </button>
      </div>
    </header>

    <main class="workspace">
      <aside 
        class="panel left" 
        :class="{ active: activePanel === 'left' }"
        @click.capture="setActive('left')"
      >
        <div class="panel-header">
          <span class="p-title">INPUT CONFIG</span>
          <span class="p-status">READY</span>
        </div>
        <div class="panel-body custom-scroll">
          <slot name="left"></slot>
        </div>
      </aside>

      <section 
        class="panel center" 
        :class="{ active: activePanel === 'center' }"
        @click.capture="setActive('center')"
      >
        <div class="panel-header">
          <span class="p-title">MAIN VIEWPORT</span>
          <div class="live-dot"></div>
        </div>
        <div class="panel-body no-scroll">
          <slot name="center"></slot>
        </div>
      </section>

      <aside 
        class="panel right" 
        :class="{ active: activePanel === 'right' }"
        @click.capture="setActive('right')"
      >
        <div class="panel-header">
          <span class="p-title">TELEMETRY</span>
          <span class="p-status">LOGGING</span>
        </div>
        <div class="panel-body custom-scroll">
          <slot name="right"></slot>
        </div>
      </aside>
    </main>

    <footer class="statusbar">
      <div class="sb-section">
        <div class="indicator connected"></div>
        <span>SERVER: <strong>CONNECTED</strong></span>
      </div>
      <div class="sb-section">
        <span>LATENCY: <strong>12ms</strong></span>
        <span class="divider">|</span>
        <span>FPS: <strong>60</strong></span>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const themeMode = ref<'light' | 'dark'>('light')
const activePanel = ref<'left' | 'center' | 'right'>('center') // 默认聚焦中间

const toggleTheme = () => {
  themeMode.value = themeMode.value === 'light' ? 'dark' : 'light'
}

const setActive = (panel: 'left' | 'center' | 'right') => {
  activePanel.value = panel
}
</script>

<style scoped>
/* CSS 变量系统：方便统一调色 */
.sdk-pro-layout {
  --bg-app: #f3f4f6;
  --bg-panel: #ffffff;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --border-color: #e5e7eb;
  --accent-color: #3b82f6;
  --accent-hover: #2563eb;
  --header-height: 60px;
  --footer-height: 28px;
  --radius: 8px;
  
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-app);
  color: var(--text-primary);
  font-family: 'Inter', system-ui, sans-serif;
  transition: all 0.3s ease;
  overflow: hidden;
}

/* 深色模式覆盖 */
.sdk-pro-layout.dark {
  --bg-app: #0f172a;
  --bg-panel: #1e293b;
  --text-primary: #f3f4f6;
  --text-secondary: #94a3b8;
  --border-color: #334155;
  --accent-color: #60a5fa;
  --accent-hover: #3b82f6;
}

/* --- Header --- */
.navbar {
  height: var(--header-height);
  background: var(--bg-panel);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  flex-shrink: 0;
}

.brand-group { display: flex; align-items: center; gap: 12px; }
.logo-box { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; }
.logo-img { width: 100%; height: auto; }
.titles { display: flex; flex-direction: column; line-height: 1.1; }
.app-name { font-size: 16px; font-weight: 800; margin: 0; letter-spacing: -0.5px; }
.tag { font-size: 10px; background: var(--accent-color); color: #fff; padding: 1px 4px; border-radius: 4px; vertical-align: middle; }
.sub-name { font-size: 10px; font-weight: 600; color: var(--text-secondary); letter-spacing: 1px; }

.theme-toggle {
  display: flex; align-items: center; gap: 6px;
  background: transparent; border: 1px solid var(--border-color);
  color: var(--text-primary); padding: 6px 12px; border-radius: 20px;
  cursor: pointer; transition: all 0.2s; font-size: 12px; font-weight: 600;
}
.theme-toggle:hover { border-color: var(--accent-color); color: var(--accent-color); }

/* --- Workspace (弹性布局核心) --- */
.workspace {
  flex: 1;
  display: flex;
  gap: 12px;
  padding: 12px;
  height: calc(100vh - var(--header-height) - var(--footer-height));
  overflow: hidden;
}

.panel {
  background: var(--bg-panel);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  /* 关键动画：flex-grow 的平滑过渡 */
  transition: flex 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

/* 默认比例 (左:中:右 = 2:5:2) */
.left { flex: 2; }
.center { flex: 5; }
.right { flex: 2; }

/* 激活态比例 (聚焦者变大) */
.left.active { flex: 5; }
.center.active { flex: 8; }
.right.active { flex: 5; }

/* 非激活态 (当兄弟节点被激活时，自己缩小) */
/* 使用 :has 伪类检测父容器状态 */
.workspace:has(.active) .panel:not(.active) {
  flex: 2; /* 保持最小可见宽度 */
}

/* 面板内部结构 */
.panel-header {
  height: 36px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 12px;
  background: rgba(128, 128, 128, 0.03);
  user-select: none;
}
.p-title { font-size: 10px; font-weight: 800; color: var(--text-secondary); letter-spacing: 1px; }
.p-status { font-size: 9px; font-weight: 600; padding: 2px 6px; background: var(--border-color); border-radius: 4px; color: var(--text-primary); }
.live-dot { width: 8px; height: 8px; background: #ef4444; border-radius: 50%; box-shadow: 0 0 8px #ef4444; }

.panel-body { flex: 1; overflow: hidden; position: relative; }
.custom-scroll { overflow-y: auto; }
.no-scroll { overflow: hidden; }

/* --- Footer --- */
.statusbar {
  height: var(--footer-height);
  background: var(--bg-panel);
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  font-size: 10px;
  color: var(--text-secondary);
}
.sb-section { display: flex; align-items: center; gap: 12px; }
.indicator { width: 6px; height: 6px; border-radius: 50%; background: #ccc; }
.indicator.connected { background: #10b981; box-shadow: 0 0 6px #10b981; }
.divider { opacity: 0.3; }
strong { color: var(--text-primary); }
</style>