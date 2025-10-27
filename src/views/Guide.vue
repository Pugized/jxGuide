<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { API_BASE } from '../config'
import ChatPanel from '../components/ChatPanel.vue'

// 信息类型：x,y 为 0~100 的百分比坐标
type Info = { id: string; x: number; y: number; name: string; brief: string; detail?: string }

const mapRef = ref<HTMLElement | null>(null)
const currentId = ref<string | null>(null)
const info = ref<Info | null>(null)
const error = ref<string | null>(null)

// 聊天状态（底部内嵌面板）
const chatOpen = ref(false)
const chatInfo = ref<Info | null>(null) // 当前聊天对应的信息
const pendingNotice = ref<string | null>(null) // 聊天打开且移动到新位置时的临时通知

let timer: number | null = null

async function fetchNowPos() {
  try {
    const res = await fetch(`${API_BASE}/position/current`)
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
    const res = await fetch(`${API_BASE}/position/${encodeURIComponent(id)}`)
    if (!res.ok) throw new Error(`status ${res.status}`)
    const data = await res.json()
    // 假设返回的 x,y 为百分比（0~100）
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

// 当 currentId 更改时获取对应信息，并在聊天打开但 id 变化时显示短暂提示
watch(currentId, (id) => {
  if (id) {
    fetchInfoForId(id)

    if (chatOpen.value && chatInfo.value && id !== chatInfo.value.id) {
      pendingNotice.value = `已移动到：${info.value?.name ?? id}`
      setTimeout(() => (pendingNotice.value = null), 3500)
    }
  }
});

onMounted(() => {
  fetchNowPos()
  timer = window.setInterval(fetchNowPos, 2000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

// 点击卡片：打开聊天并切换到该信息
function openChatWithInfo(i: Info) {
  chatInfo.value = i
  chatOpen.value = true
}

function closeChat() {
  chatOpen.value = false
  chatInfo.value = null
}

/* ---------- 地图 平移 / 缩放 手势实现（移动端） ---------- */
const scale = ref(1)
const translateX = ref(0)
const translateY = ref(0)
const isPanning = ref(false)
let panStartX = 0
let panStartY = 0
let panOriginX = 0
let panOriginY = 0

// pinch 相关
let pinchStartDist = 0
let pinchStartScale = 1
let pinchMidX = 0
let pinchMidY = 0
let translateAtPinchStartX = 0
let translateAtPinchStartY = 0

const MIN_SCALE = 1
const MAX_SCALE = 3

function distanceBetweenTouches(t1: Touch, t2: Touch) {
  const dx = t2.clientX - t1.clientX
  const dy = t2.clientY - t1.clientY
  return Math.hypot(dx, dy)
}

function midpoint(t1: Touch, t2: Touch) {
  return { x: (t1.clientX + t2.clientX) / 2, y: (t1.clientY + t2.clientY) / 2 }
}

function handleTouchStart(e: TouchEvent) {
  if (!mapRef.value) return
  if (e.touches.length === 1) {
    // 单指平移
    isPanning.value = true
    const t = e.touches[0]
    panStartX = t.clientX
    panStartY = t.clientY
    panOriginX = translateX.value
    panOriginY = translateY.value
  } else if (e.touches.length === 2) {
    // 双指捏合
    pinchStartDist = distanceBetweenTouches(e.touches[0], e.touches[1])
    pinchStartScale = scale.value
    const m = midpoint(e.touches[0], e.touches[1])
    pinchMidX = m.x
    pinchMidY = m.y
    translateAtPinchStartX = translateX.value
    translateAtPinchStartY = translateY.value

    // 计算缩放时的相对偏移（以缩放中心为基点）
    // offset = (midpoint - translate) / scale
    // 新 translate = mid - offset * newScale
  }
  // 阻止页面滚动以获得更好手势体验（移动端）
  e.preventDefault()
}

function handleTouchMove(e: TouchEvent) {
  if (!mapRef.value) return
  if (e.touches.length === 1 && isPanning.value) {
    const t = e.touches[0]
    translateX.value = panOriginX + (t.clientX - panStartX)
    translateY.value = panOriginY + (t.clientY - panStartY)
    e.preventDefault()
  } else if (e.touches.length === 2) {
    const newDist = distanceBetweenTouches(e.touches[0], e.touches[1])
    if (pinchStartDist === 0) return
    let newScale = pinchStartScale * (newDist / pinchStartDist)
    if (newScale < MIN_SCALE) newScale = MIN_SCALE
    if (newScale > MAX_SCALE) newScale = MAX_SCALE

    // 以 pinch 中点为基准调整 translate，保证缩放时中心点不漂移
    const offsetX = (pinchMidX - translateAtPinchStartX) / pinchStartScale
    const offsetY = (pinchMidY - translateAtPinchStartY) / pinchStartScale
    translateX.value = pinchMidX - offsetX * newScale
    translateY.value = pinchMidY - offsetY * newScale

    scale.value = newScale
    e.preventDefault()
  }
}

function handleTouchEnd(e: TouchEvent) {
  if (e.touches.length === 0) {
    isPanning.value = false
    pinchStartDist = 0
  } else if (e.touches.length === 1) {
    // 从双指回到单指
    isPanning.value = true
    const t = e.touches[0]
    panStartX = t.clientX
    panStartY = t.clientY
    panOriginX = translateX.value
    panOriginY = translateY.value
  }
}

/* 计算卡片 transform，避免靠右侧时溢出屏幕 */
function cardTransformFor(p: Info | null) {
  if (!p) return 'translate(0, -50%)'
  // 如果 x 较靠右（>60%），则让卡片向左展开，否则向右展开
  return p.x > 60 ? 'translate(-100%, -50%)' : 'translate(0, -50%)'
}
</script>

<template>
  <div class="guide-page-mobile">
    <section class="map-top" ref="mapRef">
      <!-- 内层可变换容器：缩放/平移作用在这里，标记与卡片作为子元素一起移动，保持相对地图位置不变 -->
      <div
        class="map-inner"
        :style="{ transform: `translate(${translateX}px, ${translateY}px) scale(${scale})` }"
        @touchstart.passive="handleTouchStart"
        @touchmove.passive="handleTouchMove"
        @touchend.passive="handleTouchEnd"
      >
        <img src="/src/assets/map.svg" alt="学校地图" class="map-image" />

        <!-- 标记（使用百分比定位） -->
        <div v-if="info" class="marker" :style="{ left: info.x + '%', top: info.y + '%' }">
          <div class="marker-dot"></div>
        </div>

        <!-- 靠近标记的小卡片（点击打开聊天），使用百分比定位并动态调整展开方向 -->
        <div
          v-if="info"
          class="mini-card"
          :style="{ left: info.x + '%', top: info.y + '%', transform: cardTransformFor(info) }"
          @click="openChatWithInfo(info)"
        >
          <div class="mini-title">{{ info.name }}</div>
          <div class="mini-brief">{{ info.brief }}</div>
        </div>
      </div>

      <!-- 移动时若聊天打开显示的临时通知 -->
      <div v-if="pendingNotice" class="pending-notice">{{ pendingNotice }}</div>
    </section>

    <!-- 底部：聊天面板打开时显示大部分（移动端优先） -->
    <section class="bottom-area" :class="{ 'bottom-large': chatOpen }">
      <ChatPanel v-if="chatOpen && chatInfo" :info="chatInfo" @close="closeChat" />
      <div v-else class="chat-hint">点击地图上的卡片可打开 AI 聊天（底部），地图保持在上方以实时更新。</div>
    </section>
  </div>
</template>

<style scoped>
/* 移动优先：假设只在手机访问，地图在上，聊天在下 */
.guide-page-mobile {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 地图顶部区域，增加内边距以留出 margin 感觉 */
.map-top {
  position: relative;
  flex: 1;
  border-bottom: 1px solid #e6eef8;
  overflow: hidden;
  padding: 8px; /* 地图四周留白，避免卡片紧贴屏幕边缘 */
  background: #f8fafc;
}

/* 内层可变换容器，缩放和平移作用在这里 */
.map-inner {
  width: calc(100% - 16px); /* 考虑 padding */
  height: calc(100% - 16px);
  transform-origin: 0 0;
  position: relative;
  touch-action: none; /* 禁用浏览器默认触摸行为以便自定义手势 */
}

/* 地图图片默认填充放置 */
.map-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border-radius: 6px;
  background: #e6eef8;
}

/* 标记相对于地图绝对定位，保持与地图一起变换 */
.marker {
  position: absolute;
  transform: translate(-50%, -50%);
  pointer-events: none;
  left: 50%;
  top: 50%;
}

.marker-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #ef4444;
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.6);
  transition: 100ms;
}

/* 小卡片：尽量不要超出屏幕，限制宽度并用动态 transform 决定左右展开 */
.mini-card {
  position: absolute;
  min-width: 140px;
  max-width: 42vw; /* 在手机上尽量不要太宽 */
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 6px 20px rgba(2, 6, 23, 0.12);
  cursor: pointer;
  transition: 100ms;
  /* 不在这里写 transform，模板中动态设置以控制左右展开 */
}

.mini-title {
  font-weight: 600;
  font-size: 14px;
  color: #0f172a;
}

.mini-brief {
  font-size: 12px;
  color: #475569;
  margin-top: 4px;
}

.pending-notice {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 10px;
  background: rgba(15, 23, 42, 0.9);
  color: white;
  padding: 6px 10px;
  border-radius: 20px;
  font-size: 13px;
}

/* 底部区域：默认高度小一些，打开聊天时放大占大部分 */
.bottom-area {
  height: 40vh;
  background: #ffffff;
  transition: height 200ms;
}

.bottom-area.bottom-large {
  height: 75vh; /* 打开聊天时占据大部分屏幕 */
}

.chat-hint {
  padding: 12px;
  color: #334155;
}
</style>
