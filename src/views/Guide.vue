<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { API_BASE } from '../config'
import ChatPanel from '../components/ChatPanel.vue'

type Info = { id: string; x: number; y: number; name: string; brief: string; detail?: string }

const mapRef = ref<HTMLElement | null>(null)
const currentId = ref<string | null>(null)
const info = ref<Info | null>(null)
const error = ref<string | null>(null)

// 状态（聊天面板）
const chatOpen = ref(false)
const chatInfo = ref<Info | null>(null) // 展示在聊天面板中的位置信息
const pendingNotice = ref<string | null>(null) // 当移动到新位置时的通知

let timer: number | null = null

async function fetchNowPos() {
  try {
    const res = await fetch(`${API_BASE}/position/current`)
    if (!res.ok) throw new Error(`status ${res.status}`)
    const data = await res.json()
    // const data = { id: 1 }
    if (data && data.id) {
      currentId.value = String(data.id)
    }
  } catch (e: any) {
    error.value = '无法获取当前位置（/nowpos）: ' + (e.message ?? e)
  }
}

async function fetchInfoForId(id: string) {
  try {
    const res = await fetch(`${API_BASE}/position/${encodeURIComponent(id)}`)
    if (!res.ok) throw new Error(`status ${res.status}`)
    const data = await res.json()
    // const data = { id: 1, x: 100, y: 200, name: '位置名称', brief: '位置简介', detail: '位置详细信息' }
    info.value = {
      id: String(data.id),
      x: Number(data.x ?? 0),
      y: Number(data.y ?? 0),
      name: String(data.name ?? ''),
      brief: String(data.brief ?? ''),
      detail: data.detail ?? data.brief ?? '',
    }
    error.value = null
  } catch (e: any) {
    error.value = '无法获取位置信息（/getinfo）: ' + (e.message ?? e)
    info.value = null
  }
}

watch(currentId, (id) => {
  if (id) {
    fetchInfoForId(id)
    // 当检测到的当前位置 ID 与聊天信息的 ID 不同时
    if (chatOpen.value && chatInfo.value && id !== chatInfo.value.id) {
      // 记录下当前位置信息
      pendingNotice.value = `已移动到：${info.value?.name ?? id}`
      // 删除通知
      setTimeout(() => (pendingNotice.value = null), 3500)
    }
  }
})

onMounted(() => {
  fetchNowPos()
  timer = window.setInterval(fetchNowPos, 2000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

function openChatWithInfo(i: Info) {
  // 记录下当前位置信息
  chatInfo.value = i
  chatOpen.value = true
}

function closeChat() {
  chatOpen.value = false
  chatInfo.value = null
}
</script>

<template>
  <div class="guide-page-mobile">
    <section class="map-top" ref="mapRef">
      <img src="/src/assets/map.svg" alt="学校地图" class="map-image" />

      <!-- 标记 -->
      <div v-if="info" class="marker" :style="{ left: info.x + 'px', top: info.y + 'px' }">
        <div class="marker-dot"></div>
      </div>

      <!-- 小卡片 -->
      <div v-if="info" class="mini-card" :style="{ left: (info.x + 22) + 'px', top: (info.y - 10) + 'px' }" @click="openChatWithInfo(info)">
        <div class="mini-title">{{ info.name }}</div>
        <div class="mini-brief">{{ info.brief }}</div>
      </div>

      <!-- 当移动到新位置时的通知 -->
      <div v-if="pendingNotice" class="pending-notice">{{ pendingNotice }}</div>
    </section>

    <!-- 底部区域 -->
    <section class="bottom-area">
      <ChatPanel v-if="chatOpen && chatInfo" :info="chatInfo" @close="closeChat" />

      <div v-else class="chat-hint">点击地图上的卡片可打开 AI 聊天（底部），地图保持在上方以实时更新。</div>
    </section>
  </div>
</template>

<style scoped>
/* 移动端优先：假设手机视口，地图在上，聊天在下 */
.guide-page-mobile{height:100vh;display:flex;flex-direction:column}
.map-top{position:relative;flex:1;border-bottom:1px solid #e6eef8;overflow:hidden}
.map-image{width:100%;height:100%;object-fit:cover;display:block}
.marker{position:absolute;transform:translate(-50%,-50%);pointer-events:none}
.marker-dot{width:14px;height:14px;border-radius:50%;background:#ef4444;box-shadow:0 0 10px rgba(239,68,68,0.6)}
.mini-card{position:absolute;transform:translate(0,-50%);min-width:140px;background:rgba(255,255,255,0.95);border-radius:8px;padding:8px;box-shadow:0 6px 20px rgba(2,6,23,0.12);cursor:pointer}
.mini-title{font-weight:600;font-size:14px;color:#0f172a}
.mini-brief{font-size:12px;color:#475569;margin-top:4px}
.pending-notice{position:absolute;left:50%;transform:translateX(-50%);top:10px;background:rgba(15,23,42,0.9);color:white;padding:6px 10px;border-radius:20px;font-size:13px}
.bottom-area{height:40vh;background:#ffffff}
.chat-hint{padding:12px;color:#334155}
</style>
