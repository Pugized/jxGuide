import { createRouter, createWebHistory, type RouteRecordRaw} from 'vue-router'
import Welcome from '../views/Welcome.vue'
import Guide from '../views/Guide.vue'
import Chat from '../views/Chat.vue'
import { BASE_URL } from '../config'

const routes: Array<RouteRecordRaw> = [
  { path: '/', redirect: '/welcome' },
  { path: '/welcome', name: 'Welcome', component: Welcome },
  { path: '/guide', name: 'Guide', component: Guide },
  { path: '/chat/:id', name: 'Chat', component: Chat, props: true },
]

const router = createRouter({
  history: createWebHistory(BASE_URL),
  routes,
})

export default router
