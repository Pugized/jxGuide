<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { API_BASE } from '../config'

type Info = { id: string; x: number; y: number; name: string; brief: string }

const router = useRouter()
const mapRef = ref<HTMLElement | null>(null)
const currentId = ref<string | null>(null)
const info = ref<Info | null>(null)
const error = ref<string | null>(null)

let timer: number | null = null

async function fetchNowPos() {
  try {
    const res = await fetch(`${API_BASE}/nowpos`)
    if (!res.ok) throw new Error(`status ${res.status}`)
    const data = await res.json()
    if (data && data.id) {
      currentId.value = String(data.id)
    }
  } catch (e: any) {
    error.value = '无法获取当前位置（/nowpos）: ' + (e.message ?? e)
  }
}

async function fetchInfoForId(id: string) {
  try {
    const res = await fetch(`${API_BASE}/getinfo/${encodeURIComponent(id)}`)
    if (!res.ok) throw new Error(`status ${res.status}`)
    const data = await res.json()
    // expect { id, x, y, name, brief }
    info.value = {
      id: String(data.id),
      x: Number(data.x ?? 0),
      y: Number(data.y ?? 0),
      name: String(data.name ?? ''),
      brief: String(data.brief ?? ''),
    }
    error.value = null
  } catch (e: any) {
    error.value = '无法获取位置信息（/getinfo）: ' + (e.message ?? e)
    info.value = null
  }
}

watch(currentId, (id) => {
  if (id) fetchInfoForId(id)
})

onMounted(() => {
  // start polling every 2s
  fetchNowPos()
  timer = window.setInterval(fetchNowPos, 2000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

function goChat() {
  if (info.value) router.push(`/chat/${info.value.id}`)
}
</script>

<template>
  <div class="guide-page">
    <div class="map-area" ref="mapRef">
      <img src="/src/assets/map.svg" alt="学校地图" class="map-image" />

      <div v-if="info" class="marker" :style="{ left: info.x + 'px', top: info.y + 'px' }">
        <div class="marker-dot"></div>
      </div>
    </div>

    <aside class="info-panel">
      <h3 v-if="info">{{ info.name }}</h3>
      <p v-if="info">{{ info.brief }}</p>
      <p v-else>正在定位中…</p>
      <p class="error" v-if="error">{{ error }}</p>
      <button v-if="info" @click="goChat">与 AI 一对一问答</button>
    </aside>
  </div>
</template>

<style scoped>
.guide-page{display:flex;gap:16px}
.map-area{position:relative;flex:1;min-height:500px;border:1px solid #e6eef8;border-radius:8px;overflow:hidden}
.map-image{width:100%;height:100%;object-fit:contain;display:block}
.marker{position:absolute;transform:translate(-50%,-50%);pointer-events:none}
.marker-dot{width:18px;height:18px;border-radius:50%;background:crimson;box-shadow:0 0 8px rgba(220,38,38,0.6)}
.info-panel{width:320px;padding:12px;border:1px solid #eef2ff;border-radius:8px;background:#fff}
.info-panel h3{margin:0 0 8px}
.info-panel p{margin:6px 0}
.info-panel .error{color:crimson;font-size:13px}
.info-panel button{margin-top:12px;padding:8px 12px;background:#0369a1;color:white;border:none;border-radius:6px;cursor:pointer}
</style>
