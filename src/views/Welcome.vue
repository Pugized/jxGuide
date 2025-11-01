<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function enterGuide() {
  router.push('/guide')
}
</script>

<template>
  <div class="welcome-page">
    <img src="../assets/logo.png">
    <h1 class="welcome">嘉祥欢迎您</h1>
    <p>探索美丽校园，感受嘉祥智慧</p>
    <button @click="enterGuide" class="rotate">开始导览</button>
  </div>
</template>

<style scoped>
.welcome-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 80%;
}

img{
  height: 20vh;
  min-height: 100px;
  max-height: 130px;
  max-width: 40vw;
  margin-bottom: 15px;
}

.welcome {
  font-weight: 800;
  background-image: radial-gradient(circle at 20% 50%, #a42c78 0 0, #29358b 80%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  position: relative;
  margin: 0;
}

@property --angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

button {
  padding: 14px 32px;
  border-radius: var(--accent-border-radius);
  /* background-image: linear-gradient(var(--angle), #2b225b, #811d5d); */

  background-color: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.1em;
  --accent-border-width: 4px;
  --accent-border-radius: 12px;
  position: relative;
  transition: 100ms;
  margin-top: 15px;
}

button:active{
  transform: scale(0.92);
  opacity: 0.6;
}


.rotate::after{
    --c1: #9e136b;
    --c2: #342589;
    --c3: #391b92;
    content: "";
    position: absolute;
    height: calc(100% - var(--accent-border-width) * 2);
    width: calc(100% - var(--accent-border-width) * 2);
    top: 0;
    left: 0;
    
    --angle: 0deg;
    
    animation-name: tile-border-tile-border-rotate;
    animation-iteration-count: infinite;
    animation-duration: 2.25s;
    animation-timing-function: linear;

    border-radius: var(--accent-border-radius);
    border: solid var(--accent-border-width) transparent;
    transition: 200ms,filter 300ms 300ms;
    background: conic-gradient(from var(--angle),var(--c1),var(--c1),var(--c2),var(--c3),var(--c1)) border-box;
    -webkit-mask: linear-gradient(#fff 0 0) padding-box,linear-gradient(#fff 0 0);
    mask: linear-gradient(#fff 0 0) padding-box,linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    /* z-index: -1; */
}


@keyframes tile-border-tile-border-rotate {
  from {
    --angle: 0deg;
  }

  to {
    --angle: 360deg;
  }
}
</style>
