<template>
  <div class="login-wrapper">
    <div class="bg-animation"></div>
    
    <div class="login-card">
      <div class="brand-header">
        <div class="logo-circle"></div>
        <h1>SWIFTMATE <span class="tag">PRO</span></h1>
        <p>Industrial Control System</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="input-group">
          <label>OPERATOR ID</label>
          <input 
            v-model="form.username" 
            type="text" 
            placeholder="admin"
            autofocus 
          />
        </div>
        
        <div class="input-group">
          <label>ACCESS KEY</label>
          <input 
            v-model="form.password" 
            type="password" 
            placeholder="••••••" 
          />
        </div>

        <div v-if="errorMsg" class="error-banner">{{ errorMsg }}</div>

        <button type="submit" class="login-btn" :disabled="loading">
          <span v-if="!loading">INITIALIZE SYSTEM</span>
          <span v-else>VERIFYING...</span>
        </button>
      </form>

      <div class="footer-meta">
        <span>V 2.1.0 STABLE</span>
        <span>SECURE CONNECTION</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const form = reactive({ username: '', password: '' })
const loading = ref(false)
const errorMsg = ref('')

const handleLogin = () => {
  if (!form.username || !form.password) {
    errorMsg.value = "Credentials required"
    return
  }

  loading.value = true
  errorMsg.value = ""

  // 模拟登录请求
  setTimeout(() => {
    loading.value = false
    // 简单的硬编码验证
    if (form.username === 'admin' && form.password === 'admin') {
      localStorage.setItem('user_role', 'admin')
      router.push('/trajectory')
    } else if (form.username === 'user' && form.password === 'user') {
      localStorage.setItem('user_role', 'user')
      router.push('/trajectory')
    } else {
      errorMsg.value = "Invalid ID or Key"
    }
  }, 800)
}
</script>

<style scoped>
.login-wrapper {
  height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #0f172a;
  position: relative;
  overflow: hidden;
  font-family: 'Inter', sans-serif;
}

.bg-animation {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 60%);
  animation: rotate 20s linear infinite;
  z-index: 0;
}

.login-card {
  position: relative;
  z-index: 10;
  width: 380px;
  background: rgba(30, 41, 59, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  color: #fff;
}

.brand-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo-circle {
  font-size: 40px;
  margin-bottom: 10px;
  filter: drop-shadow(0 0 10px rgba(59, 130, 246, 0.5));
}

.brand-header h1 {
  font-size: 24px;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.5px;
}

.tag {
  background: #3b82f6;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  vertical-align: middle;
}

.brand-header p {
  color: #94a3b8;
  font-size: 12px;
  margin-top: 5px;
  letter-spacing: 1px;
}

.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  font-size: 11px;
  color: #94a3b8;
  margin-bottom: 6px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.input-group input {
  width: 100%;
  background: #020617;
  border: 1px solid #334155;
  padding: 12px;
  border-radius: 6px;
  color: white;
  font-family: monospace;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.input-group input:focus {
  border-color: #3b82f6;
}

.login-btn {
  width: 100%;
  padding: 14px;
  background: #3b82f6;
  border: none;
  border-radius: 6px;
  color: white;
  font-weight: 800;
  font-size: 12px;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 10px;
}

.login-btn:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-banner {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  font-size: 11px;
  padding: 8px;
  border-radius: 4px;
  text-align: center;
  margin-bottom: 15px;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.footer-meta {
  margin-top: 30px;
  display: flex;
  justify-content: space-between;
  font-size: 9px;
  color: #475569;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>