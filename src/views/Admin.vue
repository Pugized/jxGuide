<template>
  <div class="page">
    <header class="page-header">
      <h3>管理员面板 — 地点管理</h3>
      <div class="actions">
        <button @click="fetchPlaces">刷新</button>
        <button @click="logout" class="danger">登出</button>
      </div>
    </header>

    <section class="card">
      <div class="new-form">
        <input v-model="newName" placeholder="地点名称" />
        <input v-model="newBrief" placeholder="简介" />
        <input v-model="newX" placeholder="x (0-100)" />
        <input v-model="newY" placeholder="y (0-100)" />
        <button @click="createPlace">新增地点</button>
      </div>

      <div class="list">
        <div v-for="p in places" :key="p.id" class="item">
          <div class="meta">
            <input v-model="p._editName" />
            <input v-model="p._editBrief" />
            <input v-model="p._editX" />
            <input v-model="p._editY" />
          </div>
          <div class="ops">
            <button @click="updatePlace(p)">保存</button>
            <button @click="deletePlace(p)" class="danger">删除</button>
          </div>
        </div>
      </div>

      <div v-if="msg" class="msg">{{ msg }}</div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { API_BASE } from '../config'
import { useRouter } from 'vue-router'

type Place = { id: string; name: string; brief?: string; x?: number; y?: number; _editName?: string; _editBrief?: string; _editX?: number | string; _editY?: number | string }

const places = ref<Place[]>([])
const newName = ref('')
const newBrief = ref('')
const newX = ref('')
const newY = ref('')
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
    const data = await res.json()
    // 为编辑初始化临时字段
    places.value = data.map((p: any) => ({ ...p, _editName: p.name, _editBrief: p.brief, _editX: p.x ?? '', _editY: p.y ?? '' }))
  } catch (e:any) {
    msg.value = '获取失败: ' + (e.message ?? e)
  }
}

async function createPlace() {
  try {
    const payload = { name: newName.value, brief: newBrief.value, x: Number(newX.value || 0), y: Number(newY.value || 0) }
    const res = await fetch(`${API_BASE}/places/`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(payload)
    })
    if (!res.ok) throw new Error(`status ${res.status}`)
    newName.value = newBrief.value = newX.value = newY.value = ''
    await fetchPlaces()
    msg.value = '已新增'
    setTimeout(()=>msg.value=null,2000)
  } catch (e:any) {
    msg.value = '新增失败: ' + (e.message ?? e)
  }
}

async function updatePlace(p: Place) {
  try {
    const payload = { name: p._editName, brief: p._editBrief, x: Number(p._editX || 0), y: Number(p._editY || 0) }
    const res = await fetch(`${API_BASE}/places/${encodeURIComponent(p.id)}/`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(payload)
    })
    if (!res.ok) throw new Error(`status ${res.status}`)
    await fetchPlaces()
    msg.value = '保存成功'
    setTimeout(()=>msg.value=null,2000)
  } catch (e:any) {
    msg.value = '保存失败: ' + (e.message ?? e)
  }
}

async function deletePlace(p: Place) {
  if (!confirm('确认删除？')) return
  try {
    const res = await fetch(`${API_BASE}/places/${encodeURIComponent(p.id)}/`, {
      method: 'DELETE', headers: { ...authHeaders() }
    })
    if (!res.ok) throw new Error(`status ${res.status}`)
    await fetchPlaces()
    msg.value = '已删除'
    setTimeout(()=>msg.value=null,2000)
  } catch (e:any) {
    msg.value = '删除失败: ' + (e.message ?? e)
  }
}

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  router.push('/login')
}

onMounted(() => {
  fetchPlaces()
})
</script>

<style scoped>
.page{ padding:16px; max-width:1000px; margin:18px auto; }
.page-header{ display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
.card{ background:rgba(255,255,255,0.98); padding:12px; border-radius:10px; border:2px solid var(--theme-blue); }
.new-form{ display:flex; gap:8px; align-items:center; margin-bottom:12px; flex-wrap:wrap; }
.new-form input{ padding:8px; border-radius:8px; border:1px solid #e5e7eb; }
.list .item{ display:flex; justify-content:space-between; align-items:center; gap:8px; padding:8px 0; border-top:1px dashed #eee; }
.meta{ display:flex; gap:8px; flex:1; }
.meta input{ padding:6px; border-radius:6px; border:1px solid #e5e7eb; }
.ops button{ margin-left:6px; padding:6px 8px; border-radius:6px; border:none; background:var(--theme-red); color:#fff; cursor:pointer; }
.ops button.danger{ background:#ef4444; }
.msg{ margin-top:8px; color:var(--theme-blue); }
</style>
