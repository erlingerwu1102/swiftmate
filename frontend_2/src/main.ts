import { createApp } from 'vue'
import './index.css'
import App from './App.vue'
import router from './router' // 引入路由

createApp(App)
  .use(router) // 挂载
  .mount('#app')