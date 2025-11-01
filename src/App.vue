<script setup lang="ts">
import './assets/jq.min.js';
</script>

<template>
	<div id="app">
		<router-view />
	</div>
</template>

<style>
:root{
	--theme-blue: #1e4bbc;
	/* --theme-blue-bright: #3b82f6; */
	--theme-blue-bg: #1b3f93b0;
	--theme-red: rgb(157, 45, 47);
	--theme-red-bright: rgb(219, 0, 51);
}
*{
  user-select: none;
  box-sizing: border-box;
}
img{
	-webkit-user-drag: none;
}
</style>
