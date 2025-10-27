<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function enterGuide() {
  router.push('/guide')
}
</script>

<template>
  <div class="welcome-page">
    <h1>欢迎来到学校智能导览</h1>
    <p>点击按钮开始导览，系统会定位您当前的位置并展示相关介绍。</p>
    <button @click="enterGuide">进入导览</button>
  </div>
</template>

<style scoped>
.welcome-page{display:flex;flex-direction:column;align-items:center;justify-content:center;height:70vh}
button{padding:8px 16px;border-radius:6px;background:#3b82f6;color:white;border:none;cursor:pointer}
</style>
