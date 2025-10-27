<script setup lang="ts">
</script>

<template>
	<div id="app">
		<header class="app-header">
			<h1>学校 AI 智能导览</h1>
		</header>
		<main>
			<router-view />
		</main>
	</div>
</template>

<style scoped>
.app-header{background:#0f172a;color:white;padding:12px}
.app-header h1{margin:0;font-size:18px}
main{padding:16px}
</style>
