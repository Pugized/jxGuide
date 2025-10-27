import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Welcome from '../views/Welcome.vue'
import Guide from '../views/Guide.vue'
import Chat from '../views/Chat.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/welcome' },
  { path: '/welcome', name: 'Welcome', component: Welcome },
  { path: '/guide', name: 'Guide', component: Guide },
  { path: '/chat/:id', name: 'Chat', component: Chat, props: true },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
