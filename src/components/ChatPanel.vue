<script setup lang="ts">
import { ref } from 'vue'

type Info = { id: string; name: string; brief: string; detail?: string }

const props = defineProps<{ info: Info | null }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const messages = ref<Array<{ role: 'ai' | 'user'; text: string }>>([])

// initialize with AI message using info.detail (left)
if (props.info) {
  messages.value.push({ role: 'ai', text: String(props.info.detail ?? props.info.brief ?? '') })
}

function close() {
  emit('close')
}
</script>

<template>
  <div class="chat-panel">
    <div class="chat-header">
      <div class="chat-title">{{ props.info?.name ?? '聊天' }}</div>
      <button class="close-btn" @click="close">关闭</button>
    </div>

    <div class="chat-body">
      <div v-for="(m, idx) in messages" :key="idx" :class="['chat-msg', m.role]">
        <div class="msg-text">{{ m.text }}</div>
      </div>
    </div>

    <div class="chat-input-area">
      <input placeholder="输入你的问题（尚未接入 AI）" disabled />
      <button disabled>发送</button>
    </div>
  </div>
</template>

<style scoped>
.chat-panel{display:flex;flex-direction:column;height:100%}
.chat-header{display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-bottom:1px solid #e6eef8}
.chat-title{font-weight:600}
.close-btn{background:#ef4444;color:white;border:none;padding:6px 10px;border-radius:6px}
.chat-body{flex:1;padding:12px;overflow:auto;background:linear-gradient(180deg,#fbfdff,#ffffff)}
.chat-msg{max-width:86%;margin-bottom:10px}
.chat-msg.ai{align-self:flex-start}
.chat-msg.user{align-self:flex-end}
.msg-text{background:#f1f5f9;padding:10px;border-radius:10px}
.chat-input-area{display:flex;padding:8px;border-top:1px solid #eef2ff}
.chat-input-area input{flex:1;padding:8px;border:1px solid #e6eef8;border-radius:6px;margin-right:8px}
.chat-input-area button{padding:8px 12px;border-radius:6px;background:#3b82f6;color:white;border:none}
</style>
