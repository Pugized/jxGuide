<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import feather from 'feather-icons'
import './chat.css'
import { Chat } from './chat';

console.log('Chat.vue loaded');
// 接受传入 info（可为空），并 emit close / input focus blur
const props = defineProps<{ info: any | null }>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'input-focus'): void
  (e: 'input-blur'): void
}>()

const iconClose = feather.icons['x']?.toSvg({ width: 16, height: 16 }) ?? ''
//const iconMessageCircle = feather.icons['message-circle']?.toSvg({ width: 16, height: 16 }) ?? ''
const iconSend = feather.icons['send']?.toSvg({ width: 16, height: 16 }) ?? ''

function doClose() {
  emit('close')
}

function onInputFocus() {
  emit('input-focus')
}
// function onInputBlur() {
//   emit('input-blur')
// }

// 新增：在组件挂载时调用全局初始化函数，传入获取当前 props.info 的方法
onMounted(() => {
  // window.initChat 在 chat.js 中定义
  // if (typeof (window as any).initChat === 'function') {
  console.log('Initializing chat with info:', props.info);
  Chat.bootstrap(props.info || { name: '', brief: '', detail: '' })
  // }
})

// 新增：组件卸载时停止流并清理全局引用
onUnmounted(() => {
  try {
    if (typeof (window as any).stopChatStream === 'function') {
      (window as any).stopChatStream()
    }
    // 可选清理全局对象（避免内存泄漏）
    try { delete (window as any).initChat } catch (e) { }
    try { delete (window as any).stopChatStream } catch (e) { }
  } catch (e) { }
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
        <input id="message-input" class="inp" placeholder="询问 AI" @focus="onInputFocus"></input>
        <div class="button-group">
          <!-- 新：清空按钮含 x 图标 -->
          <button id="new-chat-button" class="button" :data-clear-icon="iconClose">
            <span class="btn-icon" v-html="iconClose"></span>
            <span class="btn-text">清空</span>
          </button>
          <button id="send-button" class="button primary" :data-send-icon="iconSend" :data-stop-icon="iconClose"
            title="发送">
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
}

.chat-title {
  font-size: 1.1em;
}

.chat-info {
  border-bottom: 2px solid var(--theme-blue);
  margin-top: -5px;
  padding-bottom: 15px;
  opacity: 0.7;
}

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
  padding: 0 7px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  /* 允许子元素正确 overflow */
}

/* 聊天滚动区 */
#chat-messages {
  flex: 1;
  overflow: auto;
  padding: 15px 17px 15px 10px;
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
  border-top: 2px solid var(--theme-red);
}

.input-container .inp {
  flex: 1;
  padding: 10px 12px;
  border-radius: 8px;
  border: 2px solid #99999930;
  outline: none;
  /* background: var(--input-bg); */
  font-size: 14px;
  line-height: 1.4;
}

.input-container .inp:focus {
  border-color: var(--theme-red);
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
  background: #7f7f7f20;
  cursor: pointer;
  font-size: 1em;
  display: flex;
  gap: 5px;
  transition: 80ms;
  align-items: center;
  justify-content: center;
}

.button:active {
  filter: brightness(0.8);
}

.button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.button.primary {
  background: var(--theme-red);
  color: #fff;
  border: none;
  padding: 8px 15px;
}

.button>.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;

}
</style>

<style>
/* 消息样式 */
.message {
  max-width: 80%;
  margin-bottom: 10px;
  clear: both;
  display: flex;
  flex-direction: column;
  position: relative;
  /* opacity: 0; */
  /* transform: translateY(10px); */
  /* animation: messageAppear 0.3s ease forwards; */
  z-index: 0;
}


.message.user {
  align-self: end;
}

.message.bot {
  align-self: start;
}

.message.error {
  align-self: center;
}

.message-content {
  padding: 12px 16px;
  border-radius: 18px;
  /* box-shadow: var(--shadow); */
  line-height: 1.5;
  font-size: 1em;
  letter-spacing: 0.2px;
  box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04);
}

.message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.message-sender {
  font-weight: 500;
}

/* 消息气泡颜色（根据变量） */
.user .message-content {
  background: var(--theme-blue-bg);
  white-space: pre-wrap;
  word-break: break-word;
  color: #fff;
}

.bot .message-content {
  border: 2px solid var(--theme-blue-bg);
}

.error .message-content {
  background: #ff6d6d30;
  outline: 2px solid #ee8c8c;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
