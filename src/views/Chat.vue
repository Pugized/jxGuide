<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
const id = route.params.id
</script>

<template>
  <div class="chat-page">
    <h2>AI 聊天（占位）</h2>
    <p>当前对象 ID: {{ id }}</p>
    <p>这里将实现与 AI 的一对一对话功能。先作为占位页。</p>
  </div>
</template>

<style scoped>
.chat-page{padding:16px}
</style>
