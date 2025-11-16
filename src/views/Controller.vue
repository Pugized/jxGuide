<template>
  <div class="page">
    <header class="page-header">
      <h3>控制者面板</h3>
      <div class="actions">
        <button @click="fetchPlaces">刷新地点</button>
        <button @click="doLogout" class="danger">登出</button>
      </div>
    </header>

    <section class="card">
      <div class="row">
        <label>当前所在位置：</label>
        <div class="current" v-if="current">{{ current.name }} (id: {{ current.id }})</div>
        <div v-else>未设置</div>
      </div>

      <div class="row">
        <label>选择要设为当前位置</label>
        <select v-model="selectedId">
          <option value="">— 选择地点 —</option>
          <option v-for="p in places" :key="p.id" :value="p.id">{{ p.name }}</option>
        </select>
        <div class="row-actions">
          <button @click="setCurrent" :disabled="!selectedId">设为当前</button>
        </div>
      </div>

      <div class="places-list">
        <h4>全部地点</h4>
        <ul>
          <li v-for="p in places" :key="p.id">{{ p.name }} — {{ p.brief }}</li>
        </ul>
      </div>

      <div v-if="msg" class="msg">{{ msg }}</div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { API_BASE } from '../config'
import { useRouter } from 'vue-router'

type Place = { id: string; name: string; brief?: string }

const places = ref<Place[]>([])
const selectedId = ref('')
const current = ref<Place | null>(null)
const msg = ref<string | null>(null)
const router = useRouter()

function authHeaders() {
  const t = localStorage.getItem('token')
  return t ? { Authorization: `Bearer ${t}` } : {}
}

async function fetchPlaces() {
  try {
    const res = await fetch(`${API_BASE}/places/`, { headers: { ...authHeaders() } })
    if (!res.ok) throw new Error(`status ${res.status}`)
    places.value = await res.json()
  } catch (e: any) {
    msg.value = '获取地点失败: ' + (e.message ?? e)
  }
}

async function fetchCurrent() {
  try {
    const res = await fetch(`${API_BASE}/position/current/`, { headers: { ...authHeaders() } })
    if (res.ok) {
      const d = await res.json()
      if (d && d.id) current.value = { id: String(d.id), name: d.name ?? String(d.id) }
      else current.value = null
    } else {
      current.value = null
    }
  } catch (e:any) {
    current.value = null
  }
}

async function setCurrent() {
  if (!selectedId.value) return
  try {
    const res = await fetch(`${API_BASE}/position/current/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ id: selectedId.value })
    })
    if (!res.ok) throw new Error(`status ${res.status}`)
    msg.value = '已设置当前所在位置'
    await fetchCurrent()
    setTimeout(()=> msg.value = null, 2500)
  } catch (e:any) {
    msg.value = '设置失败: ' + (e.message ?? e)
  }
}

function doLogout() {
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  router.push('/login')
}

onMounted(() => {
  fetchPlaces()
  fetchCurrent()
})
</script>

<style scoped>
.page{ padding:16px; max-width:900px; margin:18px auto; }
.page-header{ display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
.card{ background:rgba(255,255,255,0.95); padding:12px; border-radius:10px; border:2px solid var(--theme-blue); box-shadow:0 6px 20px rgba(2,6,23,0.06); }
.row{ margin:10px 0; display:flex; align-items:center; gap:12px; }
.row-actions{ margin-left:8px; }
button{ padding:8px 10px; border-radius:8px; border:none; background:var(--theme-red); color:#fff; cursor:pointer; }
button.danger{ background:#ef4444; }
select{ padding:8px; border-radius:8px; border:1px solid #e5e7eb; }
.places-list ul{ margin:8px 0 0 16px; }
.msg{ margin-top:10px; color:var(--theme-blue); }
</style>
