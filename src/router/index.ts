import { createRouter, createWebHistory, type RouteRecordRaw} from 'vue-router'
import Welcome from '../views/Welcome.vue'
import About from '../views/About.vue'
import Guide from '../views/Guide.vue'
import Chat from '../views/Chat.vue'
import { BASE_URL } from '../config'

// 新增组件路由按需导入（相对路径）
import Login from '../views/Login.vue'
import Controller from '../views/Controller.vue'
import Admin from '../views/Admin.vue'

const routes: Array<RouteRecordRaw> = [
  { path: '/', redirect: '/welcome' },
  { path: '/welcome', name: 'Welcome', component: Welcome },
  { path: '/about', name: 'About', component: About },
  { path: '/guide', name: 'Guide', component: Guide },
  { path: '/chat/:id', name: 'Chat', component: Chat, props: true },

  // 新增路由：登录、控制者、管理员
  { path: '/login', name: 'Login', component: Login },
  { path: '/controller', name: 'Controller', component: Controller, 
    meta: { requiresAuth: true, roles: ['controller'] } 
  },
  { path: '/admin', name: 'Admin', component: Admin, 
    meta: { requiresAuth: true, roles: ['admin'] } 
  },
]

const router = createRouter({
  history: createWebHistory(BASE_URL),
  routes,
})

// 简单导航守卫：基于 localStorage 的 token / role
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role') // e.g. "controller" | "admin" | "guest"

  if (to.path === '/login') return next()

  // 需要登录才能访问的页面
  const requiresAuth = to.meta?.requiresAuth as boolean | undefined
  const allowedRoles = to.meta?.roles as string[] | undefined

  if (requiresAuth) {
    if (!token) return next('/login')
    if (allowedRoles && (!role || !allowedRoles.includes(role))) {
      // 权限不符，回到登录页（也可以定向到其他页）
      return next('/login')
    }
    return next()
  }

  // 对于普通页面，如果未登录且访问根导览页，允许访问；但如果有 token 且访问根页可跳转到角色对应页（可选）
  if (!requiresAuth && token && to.path === '/welcome') {
    // 如果已登录，优先跳转到角色主界面（可选）
    if (role === 'controller') return next('/controller')
    if (role === 'admin') return next('/admin')
  }

  next()
})

export default router
