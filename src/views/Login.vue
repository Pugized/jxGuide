<template>
  <div class="auth-page">
    <div class="auth-card">
      <h2>学校导览 — 后台登录</h2>
      <div class="field"><label>账号</label><input v-model="username" /></div>
      <div class="field"><label>密码</label><input type="password" v-model="password" /></div>
      <div class="actions">
        <button @click="submit" :disabled="loading">{{ loading ? '登录中...' : '登录' }}</button>
        <button @click="logout" class="ghost">清除本地会话</button>
      </div>
      <div v-if="error" class="error">{{ error }}</div>
      <div class="hint">控制者账号进入控制者页面，管理员账号进入管理员页面。</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { API_BASE } from '../config'
import { useRouter } from 'vue-router'

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const router = useRouter()

async function submit() {
  loading.value = true
  error.value = null
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value, password: password.value })
    })
    if (!res.ok) {
      const txt = await res.text()
      throw new Error(txt || `status ${res.status}`)
    }
    const data = await res.json()
    // 约定后端返回 { token: string, role: 'controller'|'admin'|'guest', user?: {...} }
    localStorage.setItem('token', data.token)
    localStorage.setItem('role', data.role ?? 'guest')
    // 跳转到不同页面
    if (data.role === 'controller') {
      router.push('/controller')
    } else if (data.role === 'admin') {
      router.push('/admin')
    } else {
      router.push('/guide')
    }
  } catch (e: any) {
    error.value = '登录失败：' + (e.message ?? e)
  } finally {
    loading.value = false
  }
}

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  error.value = null
  username.value = ''
  password.value = ''
}
</script>

<style scoped>
.auth-page{
  height:100vh;
  display:flex;
  align-items:center;
  justify-content:center;
  background:var(--theme-blue-bg, #f7fafc);
}
.auth-card{
  width:320px;
  padding:20px;
  border-radius:12px;
  background:rgba(255,255,255,0.95);
  box-shadow:0 8px 30px rgba(2,6,23,0.08);
  border:2px solid var(--theme-blue);
}
.auth-card h2{ margin:0 0 12px 0; font-size:18px; }
.field{ margin:10px 0; display:flex; flex-direction:column; }
.field label{ font-size:12px; color:#4b5563; margin-bottom:6px; }
.field input{ padding:8px 10px; border-radius:8px; border:1px solid #e5e7eb; }
.actions{ display:flex; gap:8px; margin-top:12px; }
button{ padding:8px 12px; border-radius:8px; border:none; background:var(--theme-red); color:#fff; cursor:pointer;}
button.ghost{ background:transparent; border:1px dashed #ccc; color:#111; }
.error{ margin-top:10px; color:var(--theme-red); font-size:13px; }
.hint{ margin-top:8px; font-size:12px; color:#6b7280; }
</style>
