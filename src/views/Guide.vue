<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { API_BASE } from '../config'
import Chat from './Chat.vue'
import feather from 'feather-icons'

// x,y 为 0~100 的百分比坐标
type Info = { id: string; x: number; y: number; name: string; brief: string; detail?: string }

const mapRef = ref<HTMLElement | null>(null)
const currentId = ref<string | null>(null)
const info = ref<Info | null>(null)
const error = ref<string | null>(null)

// 聊天状态（底部内嵌面板）
const chatOpen = ref(false)
const chatInfo = ref<Info | null>(null) // 当前聊天对应的信息
const pendingNotice = ref<string | null>(null) // 聊天打开且移动到新位置时的临时通知

const chatKey=ref(true); // 用于强制刷新Chat组件

// 输入框是否聚焦
const chatInputFocused = ref(false)

let timer: number | null = null

async function fetchNowPos() {
  try {
    const res = await fetch(`${API_BASE}/position/current/`)
    if (!res.ok) throw new Error(`status ${res.status}`)
    const data = await res.json()
    if (data && data.id) {
      currentId.value = String(data.id)
    }
  } catch (e: any) {
    error.value = '无法获取当前位置: ' + (e.message ?? e)
  }
}

async function fetchInfoForId(id: string) {
  try {
    const res = await fetch(`${API_BASE}/position/${encodeURIComponent(id)}/`)
    if (!res.ok) throw new Error(`status ${res.status}`)
    const data = await res.json()
    info.value = {
      id: id,
      x: Number(data.x ?? 0),
      y: Number(data.y ?? 0),
      name: String(data.name ?? ''),
      brief: String(data.brief ?? ''),
      detail: data.detail ?? data.brief ?? '',
    }
    error.value = null
  } catch (e: any) {
    error.value = '无法获取位置信息: ' + (e.message ?? e)
    info.value = null
  }
}

// 当 currentId 更改时获取对应信息，并在聊天打开但 id 变化时显示短暂提示
watch(currentId, (id) => {
  if (id) {
    fetchInfoForId(id).then(() => {
      if (chatOpen.value && chatInfo.value && id !== chatInfo.value.id) {
        pendingNotice.value = `已移动到：${info.value?.name ?? id}`;
        setTimeout(() => (pendingNotice.value = null), 3500);
      }
    });
  }
});

onMounted(() => {
  fetchNowPos()
  timer = window.setInterval(fetchNowPos, 5000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

// 打开chat卡片
function openChatWithInfo(i: Info) {
  console.log(chatInfo.value?.id, i.id)
  if (chatInfo.value?.id !== i.id) {
    chatInfo.value = i;
    // 强制刷新Chat组件
    chatKey.value = false;
    nextTick(() => {
      chatKey.value = true;
    });
  }
  chatOpen.value = true
}

function closeChat() {
  chatOpen.value = false
  // chatInfo.value = null
  chatInputFocused.value = false
  // 用户主动关闭聊天后不要再自动 fitToView
  autoFitEnabled.value = false
  // 短暂延时后恢复自动 fit 功能
  setTimeout(() => {
    autoFitEnabled.value = true;
  }, 300)
}

/* 计算卡片 transform，避免靠右侧时溢出屏幕 */
function cardTransformFor(p: Info | null) {
  if (!p) return 'translate(20px, -50%)'
  // 如果 x 较靠右（>60%），则让卡片向左展开，否则向右展开
  return p.x > 60 ? 'translate(calc(-100% - 20px), -50%)' : 'translate(20px, -50%)'
}


const scale = ref(1)
const tx = ref(0) // 平移（像素）
const ty = ref(0)
const minScale = ref(0.5)
const maxScale = ref(3)

const imgNaturalW = ref(0)
const imgNaturalH = ref(0)
const containerW = ref(0)
const containerH = ref(0)

const imgEl = ref<HTMLImageElement | null>(null)
const containerEl = mapRef

let isPanning = false
let panStart = { x: 0, y: 0, tx: 0, ty: 0 }

// touch 两指缩放
let touchInitialDist = 0
let touchInitialScale = 1
// let touchInitialCenter = { x: 0, y: 0 }

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

function updateContainerSize() {
  const c = containerEl.value
  if (!c) return
  const rect = c.getBoundingClientRect()
  containerW.value = rect.width
  containerH.value = rect.height
}

function getContainerPoint(clientX: number, clientY: number) {
  const c = containerEl.value
  if (!c) return { x: clientX, y: clientY }
  const rect = c.getBoundingClientRect()
  return { x: clientX - rect.left, y: clientY - rect.top }
}

/* 根据当前 scale 与容器大小限制 tx/ty 的范围，防止无限拖动 */
function clampPan() {
  updateContainerSize()
  const imgW = imgNaturalW.value || 1
  const imgH = imgNaturalH.value || 1
  const scaledW = imgW * scale.value
  const scaledH = imgH * scale.value

  // X 方向
  let minTx: number, maxTx: number
  if (scaledW <= containerW.value) {
    // 居中
    minTx = maxTx = (containerW.value - scaledW) / 2
  } else {
    minTx = containerW.value - scaledW // 负数
    maxTx = 0
  }
  tx.value = clamp(tx.value, minTx, maxTx)

  // Y 方向
  let minTy: number, maxTy: number
  if (scaledH <= containerH.value) {
    minTy = maxTy = (containerH.value - scaledH) / 2
  } else {
    minTy = containerH.value - scaledH
    maxTy = 0
  }
  ty.value = clamp(ty.value, minTy, maxTy)
}

function applyZoomAt(point: { x: number; y: number }, newScale: number) {
  newScale = clamp(newScale, minScale.value, maxScale.value)
  const old = scale.value
  if (old === 0) {
    scale.value = newScale
    clampPan()
    return
  }
  // 保持 point 在屏幕位置不变： newTx = px - (px - tx) * (newScale/old)
  tx.value = point.x - (point.x - tx.value) * (newScale / old)
  ty.value = point.y - (point.y - ty.value) * (newScale / old)
  scale.value = newScale
  clampPan()
}

function handleWheel(e: WheelEvent) {
  if (!containerEl.value) return
  e.preventDefault()
  const delta = -e.deltaY
  const zoomFactor = delta > 0 ? 1.08 : 1 / 1.08
  const point = getContainerPoint(e.clientX, e.clientY)
  const newScale = scale.value * zoomFactor
  applyZoomAt(point, newScale)
}

function startMousePan(e: MouseEvent) {
  if (!containerEl.value) return
  isPanning = true
  panStart = { x: e.clientX, y: e.clientY, tx: tx.value, ty: ty.value }
  window.addEventListener('mousemove', onMousePan)
  window.addEventListener('mouseup', endMousePan)
}

function onMousePan(e: MouseEvent) {
  if (!isPanning) return
  const dx = e.clientX - panStart.x
  const dy = e.clientY - panStart.y
  tx.value = panStart.tx + dx
  ty.value = panStart.ty + dy
  clampPan() // 立即限制，避免拖出太远
}

function endMousePan() {
  isPanning = false
  window.removeEventListener('mousemove', onMousePan)
  window.removeEventListener('mouseup', endMousePan)
  clampPan()
}

/* touch handlers */
function distBetween(t1: Touch, t2: Touch) {
  const dx = t1.clientX - t2.clientX
  const dy = t1.clientY - t2.clientY
  return Math.sqrt(dx * dx + dy * dy)
}
function centerBetween(t1: Touch, t2: Touch) {
  return { x: (t1.clientX + t2.clientX) / 2, y: (t1.clientY + t2.clientY) / 2 }
}

function onTouchStart(e: TouchEvent) {
  if (!containerEl.value) return
  if (e.touches.length === 1) {
    // 单指拖拽
    isPanning = true

    // @ts-ignore: 神经 ts 
    panStart = { x: e.touches[0].clientX, y: e.touches[0].clientY, tx: tx.value, ty: ty.value }
  } else if (e.touches.length === 2) {
    // 双指捏合
    // @ts-ignore: 有点意思 
    touchInitialDist = distBetween(e.touches[0], e.touches[1])
    touchInitialScale = scale.value
    // @ts-ignore: 神经 ts 
    touchInitialCenter = centerBetween(e.touches[0], e.touches[1])
  }
}

function onTouchMove(e: TouchEvent) {
  if (!containerEl.value) return
  if (e.touches.length === 1 && isPanning) {
    // @ts-ignore: fuck you ts 
    const dx = e.touches[0].clientX - panStart.x
    // @ts-ignore: fuck
    const dy = e.touches[0].clientY - panStart.y
    tx.value = panStart.tx + dx
    ty.value = panStart.ty + dy
    clampPan()
  } else if (e.touches.length === 2) {
    // @ts-ignore: 好好好
    const d = distBetween(e.touches[0], e.touches[1])
    if (touchInitialDist <= 0) return
    const factor = d / touchInitialDist
    const newScale = touchInitialScale * factor
    // @ts-ignore: 好好好
    const center = centerBetween(e.touches[0], e.touches[1])
    const local = getContainerPoint(center.x, center.y)
    applyZoomAt(local, newScale)
  }
}

function onTouchEnd(e: TouchEvent) {
  if (e.touches.length === 0) {
    isPanning = false
    touchInitialDist = 0
    clampPan()
  } else if (e.touches.length === 1) {
    // keep panning with remaining touch
    
    // @ts-ignore: 好好好
    panStart = { x: e.touches[0].clientX, y: e.touches[0].clientY, tx: tx.value, ty: ty.value }
    isPanning = true
  }
}

const autoFitEnabled = ref(true) // 如果用户关闭聊天，则设为 false，阻止自动 fit

// icons
const iconPlus = feather.icons['plus']?.toSvg({ width: 18, height: 18 }) ?? ''
const iconMinus = feather.icons['minus']?.toSvg({ width: 18, height: 18 }) ?? ''
const iconMaximize = feather.icons['maximize']?.toSvg({ width: 18, height: 18 }) ?? ''
const iconCrosshair = feather.icons['crosshair']?.toSvg({ width: 18, height: 18 }) ?? ''

/* image load & fit */
function fitToView() {
  const c = containerEl.value
  const imgW = imgNaturalW.value
  const imgH = imgNaturalH.value
  if (!c || !imgW || !imgH) return
  const rect = c.getBoundingClientRect()
  containerW.value = rect.width
  containerH.value = rect.height
  // 预留一些内边距
  const padding = 16
  const availableW = Math.max(1, rect.width - padding * 2)
  const availableH = Math.max(1, rect.height - padding * 2)
  const s = Math.min(availableW / imgW, availableH / imgH)
  const baseScale = s
  scale.value = baseScale
  // 修改：minScale 与初始 fit 一致，保证最小缩放即为 fit
  minScale.value = baseScale
  maxScale.value = Math.max(1.5, baseScale * 4)
  // 居中
  tx.value = (rect.width - imgW * scale.value) / 2
  ty.value = (rect.height - imgH * scale.value) / 2
  clampPan()
}

function onImgLoad() {
  if (!imgEl.value) return
  imgNaturalW.value = imgEl.value.naturalWidth || imgEl.value.width
  imgNaturalH.value = imgEl.value.naturalHeight || imgEl.value.height
  nextTick(() => {
    // 只有在未打开聊天详细面板且允许自动 fit 时自动 fit
    if (!chatOpen.value && autoFitEnabled.value) {
      fitToView()
    } else {
      // 更新容器尺寸并限制当前 tx/ty 到合法范围
      updateContainerSize()
      clampPan()
    }
  })
}

let resizeObserver: ResizeObserver | null = null

/* 命名的 mousedown handler 以便正确 removeEventListener */
function onMouseDown(e: MouseEvent) {
  if (e.button === 0) startMousePan(e)
}

/* zoom control helpers */
function zoomIn() {
  updateContainerSize()
  const center = { x: containerW.value / 2, y: containerH.value / 2 }
  applyZoomAt(center, scale.value * 1.2)
}
function zoomOut() {
  updateContainerSize()
  const center = { x: containerW.value / 2, y: containerH.value / 2 }
  applyZoomAt(center, scale.value / 1.2)
}

/* 功能：将当前标记居中（保持当前 scale） */
function centerToMarker() {
  if (!info.value || !imgNaturalW.value || !imgNaturalH.value || !containerEl.value) return
  updateContainerSize()
  const imgW = imgNaturalW.value
  const imgH = imgNaturalH.value
  const px = (info.value.x / 100) * imgW * scale.value
  const py = (info.value.y / 100) * imgH * scale.value
  // 使 marker 屏幕坐标为容器中心
  tx.value = containerW.value / 2 - px
  ty.value = containerH.value / 2 - py
  clampPan()
}

onMounted(() => {
  // 绑定事件
  const c = containerEl.value
  if (c) {
    c.addEventListener('wheel', handleWheel, { passive: false })
    c.addEventListener('mousedown', onMouseDown)
    c.addEventListener('touchstart', onTouchStart, { passive: false })
    c.addEventListener('touchmove', onTouchMove, { passive: false })
    c.addEventListener('touchend', onTouchEnd)
    // resize 监听，以便 fitToView
    resizeObserver = new ResizeObserver(() => {
      updateContainerSize()
      if (!chatOpen.value && autoFitEnabled.value) {
        fitToView()
      } else {
        clampPan()
      }
    })
    resizeObserver.observe(c)
  }
})

onBeforeUnmount(() => {
  const c = containerEl.value
  if (c) {
    c.removeEventListener('wheel', handleWheel)
    c.removeEventListener('mousedown', onMouseDown)
    c.removeEventListener('touchstart', onTouchStart as any)
    c.removeEventListener('touchmove', onTouchMove as any)
    c.removeEventListener('touchend', onTouchEnd as any)
  }
  if (resizeObserver && containerEl.value) {
    resizeObserver.unobserve(containerEl.value)
    resizeObserver = null
  }
})

/* 计算标记在屏幕上的像素位置（标记不随 scale 改变大小） */
function markerScreenPos(p: Info) {
  // 根据图片原始尺寸来计算地图中点的像素坐标，然后乘 scale 并加平移
  const imgW = imgNaturalW.value || 1
  const imgH = imgNaturalH.value || 1
  const px = tx.value + (p.x / 100) * imgW * scale.value
  const py = ty.value + (p.y / 100) * imgH * scale.value
  return { left: px, top: py }
}
</script>

<template>
  <div class="guide-page-mobile">
    <section class="map-top" ref="mapRef">
      <!-- 新：一个容器承载 transform 的图片层与不缩放的覆盖层 -->
      <div class="map-container">
        <!-- 可缩放的图片层 -->
        <div
          class="map-inner"
          :style="{
            transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
            touchAction: 'none'
          }"
        >
          <img
            id="map-image"
            ref="imgEl"
            src="/src/assets/map.png"
            alt="地图"
            @load="onImgLoad"
            draggable="false"
          />
        </div>

        <!-- 覆盖层：标记与卡片（不随缩放变大） -->
        <div class="overlay-layer">
          <!-- 标记（不缩放） -->
          <div
            v-if="info"
            class="marker"
            :style="{ left: markerScreenPos(info).left + 'px', top: markerScreenPos(info).top + 'px' }"
          >
            <div class="marker-dot"></div>
          </div>

          <!-- 靠近标记的小卡片，使用像素定位并动态调整展开方向 -->
          <div
            class="mini-card"
            v-if="info"
            :style="{
              left: markerScreenPos(info).left + 'px',
              top: markerScreenPos(info).top + 'px',
              transform: cardTransformFor(info)
            }"
            @click="openChatWithInfo(info)"
          >
            <div class="mini-title">{{ info.name }}</div>
            <div class="mini-brief">{{ info.brief }}</div>
          </div>

          <!-- 右下角控件：缩放与居中（标记） -->
          
        </div>
      </div>

      <!-- 移动时若聊天打开显示的临时通知 -->
      <div v-if="pendingNotice" class="pending-notice">{{ pendingNotice }}</div>
    </section>

    <!-- 底部：聊天面板打开时显示大部分 -->
    <section class="bottom-area">
      <div class="map-controls" v-if="imgNaturalW > 0">
            <button class="ctrl-btn" @click="zoomIn" aria-label="放大" v-html="iconPlus"></button>
            <button class="ctrl-btn" @click="zoomOut" aria-label="缩小" v-html="iconMinus"></button>
            <button class="ctrl-btn" @click="() => { autoFitEnabled = true; fitToView(); }" title="适应视图" aria-label="适应视图" v-html="iconMaximize"></button>
            <button class="ctrl-btn" @click="centerToMarker" :disabled="!info" title="标记居中" aria-label="标记居中" v-html="iconCrosshair"></button>
            <div class="scale-indicator">{{ (scale).toFixed(2) }}x</div>
          </div>
      <div class="bottom-card" :class="{ 'bottom-large': chatOpen, 'bottom-full': chatInputFocused }">
      <!-- 将聊天控件迁移到 Chat.vue：传递 info 并监听 close 事件 -->
      <Chat class="chat-page" :class="{show:(chatOpen && chatInfo)}" v-if="chatInfo && chatKey"
            :info="chatInfo"
            @close="closeChat"
            @input-focus="chatInputFocused = true"
            @input-blur="chatInputFocused = false" />
      <div class="bottom-label" :class="{show: !(chatOpen && chatInfo)}">
        <span>嘉祥 AI 校园导览</span>
      </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.guide-page-mobile {
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.map-top {
  position: relative;
  flex: 1;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden; /* 改为 hidden 以便平移不露出容器外 */
}

/* 新：容器，限制内层尺寸 */
.map-container {
  position: relative;
  width: 100%;
  height: 100%;
  touch-action: none;
  user-select: none;
}

/* 内层可变换容器，缩放和平移作用在这里 */
.map-inner {
  transform-origin: 0 0;
  position: absolute;
  left: 0;
  top: 0;
  /* 图片直接占用其天然大小，缩放通过 transform 实现 */
}

/* 地图图片默认样式（不使用百分比撑满，以便按 natural size 显示并缩放） */
#map-image {
  display: block;
  -moz-user-drag: none;
  -webkit-user-drag: none;
  -ms-user-drag: none;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  border-radius: 6px;
  background: #e9e9e9;
}

/* 覆盖层：包含不缩放的标记 */
.overlay-layer {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; /* 默认不中断交互，具体元素可覆盖 */
}

/* 标记相对于容器绝对定位，保持与地图一起移动（位置通过脚本计算），大小不随缩放 */
.marker {
  position: absolute;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.marker-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--theme-red-bright);
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.6);
  transition: 100ms;
}

.mini-card {
  position: absolute;
  min-width: 140px;
  max-width: 42vw; /* 在手机上尽量不要太宽 */
  /* background: rgba(255, 255, 255, 0.8); */
  background-color: var(--theme-blue-bg);
  color: #fff;
  border-radius: 10px;
  backdrop-filter: blur(10px) saturate(1.8);
  padding: 8px 10px;
  box-shadow: 0 6px 20px rgba(2, 6, 23, 0.12);
  cursor: pointer;
  transition: scale 100ms;
  pointer-events: auto; /* 允许点击 */
}

.mini-card:active {
  scale: 0.96;
}

.mini-title {
  font-weight: 600;
  font-size: 14px;
}

.mini-brief {
  font-size: 12px;
  opacity: 0.7;
  margin-top: 4px;
}

.pending-notice {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 10px;
  background: var(--theme-red);
  color: white;
  padding: 6px 10px;
  border-radius: 20px;
  font-size: 13px;
  z-index: 20;
}

/* 底部区域：默认高度小一些，打开聊天时放大占大部分 */
.bottom-area {
  z-index: 10;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
}


.map-controls {
  position: absolute;
  top: -57px;
  right: 12px;
  display: flex;
  flex-direction: row;
  gap: 7px;
  align-items: center;
  background: rgba(255,255,255,0.8);
  backdrop-filter: blur(10px) saturate(180%);
  padding: 5px;
  border: 2px solid var(--theme-blue);
  border-radius: 10px;
  box-shadow: 0 6px 20px rgba(2,6,23,0.08);
  pointer-events: auto;
}

.ctrl-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  cursor: pointer;
  color: #0f172a;
  border: none;
  padding: 4px;
  background-color: transparent;
  transition: 100ms;
}
.ctrl-btn:active{
  background-color: #00000015;
}
.ctrl-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.scale-indicator {
  font-size: 0.9em;
  padding: 0 5px 0 7px;
}

.bottom-card{
  height: 60px;
  border-radius: 16px 16px 0 0;
  backdrop-filter: blur(15px) saturate(1.5);
  box-shadow: 0 -6px 20px rgba(2, 6, 23, 0.08);
  background: var(--theme-red);
  border: 2px solid var(--theme-blue);
  border-bottom: none;
  transition: 200ms;
}

.bottom-card>.bottom-label{
  text-align: center;
  font-size: 1.2em;
  height: 100%;
  width: 100%;
  display: none;
  align-items: center;
  color: #fff !important;
  justify-content: center;
}

.bottom-card>.bottom-label.show{
  display: flex;
}

.bottom-card>.chat-page{
  display: none;
}

.bottom-card>.chat-page.show{
  display: flex;
}

.bottom-card>.bottom-label>span{
  user-select: none;
  margin-bottom: 5px;
}

.bottom-card.bottom-large {
  height: 75vh;
  background: rgba(255, 255, 255, 0.8);
}

.bottom-card.bottom-full {
  height: 100vh;
  border-radius: 0 !important;
  background-color: #fff;
  backdrop-filter: none;
}
</style>
