<script setup lang="ts">
import { defineEmits, defineProps, onMounted, onUnmounted } from 'vue'
import feather from 'feather-icons'
import './chat.css'
// @ts-ignore: module "./chat.js" has no declaration file (implicit any)
import { _init } from './chat.js'

// 你报错啥啊，错在哪？？？？
// 这不能跑吗，你报什么错？？？？

console.log('Chat.vue loaded');
// 接受传入 info（可为空），并 emit close / input focus blur
const props = defineProps<{ info: any | null }>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'input-focus'): void
  (e: 'input-blur'): void
}>()

const iconClose = feather.icons['x']?.toSvg({ width: 16, height: 16 }) ?? ''
const iconMessageCircle = feather.icons['message-circle']?.toSvg({ width: 16, height: 16 }) ?? ''
const iconSend = feather.icons['send']?.toSvg({ width: 16, height: 16 }) ?? ''

function doClose() {
  emit('close')
}

function onInputFocus() {
  emit('input-focus')
}
function onInputBlur() {
  emit('input-blur')
}

// 新增：在组件挂载时调用全局初始化函数，传入获取当前 props.info 的方法
onMounted(() => {
  _init();
  // window.initChat 在 chat.js 中定义
  // if (typeof (window as any).initChat === 'function') {
    console.log('Initializing chat with info:', props.info);
    (window as any).initChat(props.info || {name: '', brief: '', detail: ''})
  // }
})

// 新增：组件卸载时停止流并清理全局引用
onUnmounted(() => {
  try {
    if (typeof (window as any).stopChatStream === 'function') {
      (window as any).stopChatStream()
    }
    // 可选清理全局对象（避免内存泄漏）
    try { delete (window as any).initChat } catch (e) {}
    try { delete (window as any).stopChatStream } catch (e) {}
  } catch (e) {}
});

</script>

<template>
  <div class="chat-panel">
    <div class="chat-header">
      <div class="chat-title">{{ props.info.name }}</div>
      <button class="chat-close" @click="doClose" v-html="iconClose" aria-label="关闭"></button>
    </div>

    <div class="chat-body">
      <!-- 简单占位信息 -->
      <div class="chat-info">
        <div v-if="props.info">
          <div class="chat-brief">{{ props.info.brief }}</div>
        </div>
        <div v-else>
          <em>未选择位置</em>
        </div>
      </div>
      
      <div id="chat-messages"></div>


      <div class="input-container">
          <!-- 监听 focus / blur 并通知父组件 -->
          <input id="message-input" class="inp"
              placeholder="询问 AI"
              @focus="onInputFocus"
              ></input>
          <div class="button-group">
              <!-- 新：清空按钮含 x 图标 -->
              <button id="new-chat-button" class="button"
                      :data-clear-icon="iconClose">
                  <span class="btn-icon" v-html="iconClose"></span>
                  <span class="btn-text">清空</span>
              </button>
              <button id="send-button" class="button primary"
                      :data-send-icon="iconSend" :data-stop-icon="iconClose" title="发送">
                  <span class="btn-icon" v-html="iconSend"></span>
              </button>
          </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
/* filepath: e:\jx\jxGuide\src\views\Chat.vue */
/* 全局默认变量（可被外层覆盖） */


/* 基础样式 */
.chat-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  pointer-events: auto;
  padding: 8px;
}
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px;
  border-bottom: 1px solid #eef2f7;
}
.chat-title { font-weight: 600 }
.chat-close {
  background: transparent;
  border: none;
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.chat-body {
  padding: 8px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0; /* 允许子元素正确 overflow */
}

/* 聊天滚动区 */
#chat-messages {
  flex: 1;
  overflow: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  scroll-behavior: smooth;
}

/* 输入区 */
.input-container {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 8px 0;
  border-top: 1px solid #eef2f7;
}
.input-container .inp {
  flex: 1;
  padding: 10px 12px;
  border-radius: 8px;
  border: 2px solid #99999930;
  outline: none;
  background: var(--input-bg);
  font-size: 14px;
  line-height: 1.4;
}

.input-container .inp:focus {
  border-color: #3b82f6;
}
.input-container .inp:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 按钮组 */
.button-group {
  display: flex;
  gap: 6px;
}
.button {
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #e6eef9;
  background: var(--button-bg);
  cursor: pointer;
  font-size: 1em;
  display: flex;
  gap: 5px;
  transition: 80ms;
  align-items: center;
  justify-content: center;
}

.button:active{
  filter: brightness(0.8);
}
.button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.button.primary {
  background: var(--button-primary-bg);
  color: var(--button-primary-color);
  border: none;
  padding: 8px 15px;
}

.button>.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  
}

</style>
