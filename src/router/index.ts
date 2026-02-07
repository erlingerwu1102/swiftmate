import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import TrajectoryView from '../views/TrajectoryView.vue'
import AdminDashboard from '../views/AdminDashboard.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/trajectory',
    name: 'trajectory',
    component: TrajectoryView,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'admin',
    component: AdminDashboard,
    meta: { requiresAuth: true, role: 'admin' }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  const role = localStorage.getItem('user_role')
  
  // 1. 需要登录但未登录
  if (to.meta.requiresAuth && !role) {
    next('/login')
    return
  }

  // 2. 已登录但访问登录页 -> 跳转主页
  if (to.path === '/login' && role) {
    next(role === 'admin' ? '/admin' : '/trajectory')
    return
  }

  // 3. 权限检查
  if (to.meta.role && to.meta.role !== role) {
    next('/trajectory') // 权限不足回退到普通页
    return
  }

  next()
})

export default router