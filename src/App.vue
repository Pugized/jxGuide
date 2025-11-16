<script setup lang="ts">
// import './assets/jq.min.js';
</script>

<template>
	<div id="app">
		<router-view />
	</div>
</template>

<style>
:root{
	--theme-blue: #2447b3;
	--theme-blue-bright: #467eff;
	--theme-blue-bg: #103792b0;
	--theme-red: rgb(142, 38, 40);
	--theme-red-bright: rgb(219, 0, 51);
}
*{
  user-select: none;
  box-sizing: border-box;
}
img{
	-webkit-user-drag: none;
}
.jump{
	color: var(--theme-blue);
	text-decoration: none;
}
.jump:active{
	opacity: 0.6;
}
</style>
