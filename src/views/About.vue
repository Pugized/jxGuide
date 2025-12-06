<!-- <script setup lang="ts">
</script> -->

<template>
	<div id="header">
		<div class="cover"></div>
		<span style="font-size: 30px;transition-delay: 200ms;">关于我们</span>
		<span id="teamname">Pugized</span>
	</div>
	<span style="display:block;margin: 20px 30px;font-size: 25px;">团队成员</span>
	<div id="teammates">
		<!-- 动态生成小卡片 -->
		<div
			class="card"
			:class="member.id"
			v-for="member in teammates"
			:key="member.id"
			@click="openDetail($event, member)"
		>
			<div class="bg" :style="member.bg ? { '--bg': `url(${member.bg})` } : {}"></div>
			<div class="info">
				<div class="headcontainer">
					<div class="head" :style="{ '--img': `url(${member.avatar})` }"></div>
				</div>
				<span class="name" v-html="member.name"></span>
				<span class="realname">{{ member.realname }}</span>
				<div class="tags">
					<span class="tag" :class="{ stressed: tag === '队长' }" v-for="tag in member.tags" :key="tag">{{ tag }}</span>
				</div>
				<span class="description">{{ member.description }}</span>
			</div>
		</div>
	</div>

	<!-- 详情 overlay（固定定位的大卡片） -->
	<div v-if="overlayVisible" class="detail-overlay" @click.self="closeDetail">
		<div
			class="detail-card card"
			ref="detailCard"
			:class="(overlayExpanded?'expanded ':'')+(selected?selected.id:'')"
			:style="{...overlayStyle,...(selected?.bg ? { backgroundImage: `url(${selected.bg})` } : {})}"
		>
			<button class="close-btn" @click.stop="closeDetail">✕</button>
			<div class="detail-bg" ></div>
			<div class="detail-info info">
				<div class="headcontainer">
					<div class="head" :style="{ '--img': `url(${selected?.avatar})` }"></div>
				</div>
				<span class="name" v-html="selected?.name"></span>
				<span class="realname">{{ selected?.realname }}</span>
				<div class="tags">
					<span class="tag" :class="{ stressed: t === '队长' }" v-for="t in selected?.tags || []" :key="t">{{ t }}</span>
				</div>
				<span class="description">{{ selected?.description }}</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import teammates from '../data/teammates';

const teammatesList = teammates;
// const teammatesRef = ref(teammatesList);

const overlayVisible = ref(false);
const overlayExpanded = ref(false);
const selected = ref<typeof teammatesList[0] | null>(null);
const overlayStyle = ref({});
// const detailCard = ref<HTMLElement | null>(null);

function openDetail(e: MouseEvent, member: any) {
	const target = (e.currentTarget as HTMLElement);
	const rect = target.getBoundingClientRect();
	selected.value = member;
	overlayVisible.value = true;
	overlayExpanded.value = false;
	overlayStyle.value = {
		position: 'fixed',
		top: `${rect.top}px`,
		left: `${rect.left}px`,
		width: `${rect.width}px`,
		height: `${rect.height}px`,
		borderRadius: window.getComputedStyle(target).borderRadius || '12px'
	};
	// 等下一帧触发 expand 动画
	nextTick(() => {
		requestAnimationFrame(() => {
			overlayExpanded.value = true;
			// 目标样式由 CSS .expanded 控制
		});
	});
}

function closeDetail() {
	overlayExpanded.value = false;
    setTimeout(() => {
        
		overlayVisible.value = false;
		selected.value = null;
		overlayStyle.value = {};
    }, 200);
	// 结束后在 onTransitionEnd 隐藏 overlayVisible
}

// function onTransitionEnd(e: TransitionEvent) {
// 	// 仅在缩回动画结束时隐藏 overlay
// 	if (!overlayExpanded.value) {
// 		overlayVisible.value = false;
// 		selected.value = null;
// 		overlayStyle.value = {};
// 	}
// }

document.body.onload=()=>{
    document.body.style.overflow='hidden';
    setTimeout(() => {
        document.body.style.overflow='auto';
    }, 2000);
    (document.getElementById("header") as HTMLElement).classList+='load';
};
</script>

<style scoped>

#header{
    display: flex;
    flex-direction: column;
    background: url(../assets/bg.png);
    background-position:  center 35%;
    /* background-origin: 50% center; */
    background-size: cover;
    height: 100%;
    align-items: center;
    justify-content: center;
    position: relative;
    >.cover{
        /* background-color: var(--theme-blue); */
        /* backdrop-filter: blur(10px); */
        width: 100%;
        height: 100%;
        position: absolute;
        transition: 200ms 2s;
        /* opacity: 0.3; */
    }
    transition: 200ms 2s;
}
#header.load{
    height: 30vh;
    min-height: 200px;
    >.cover{
        backdrop-filter: blur(10px);
    }
    >span{
        transform: none;
        opacity: 1;
    }
}

#header>span{
    
    color: #000;
    text-shadow: 0 1px 15px #d0e3ff;
    font-weight: bold;
    z-index: 1;
    opacity: 0;
    transform: translateY(100%) scale(0.9);
    transition: 400ms cubic-bezier(0.21, 1.39, 0.66, 0.98) 600ms;
}

#teamname{
    font-size: 50px;
    font-family:'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;

}

#teammates {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    padding: 20px;
    justify-content: center;
}

.card {
    --bg:#f0f0f0;
    --detail: #777;
    border: 2px solid #ddd;
    border-radius: 17px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    height: 312.5px;
    width: 250px;
    box-shadow: 0 6px 25px -3px rgba(0, 0, 0, 0.2);
    background: var(--bg);
    background-size: cover;
}

.card .bg {
    height: 30%;
}

.headcontainer {
    position: relative;
    height: 50px;
}

.head {
    --img: url(../assets/EncVar.png);
    background-image: var(--img);
    background-size: cover;
    border-radius: 50%;
    height: 90px;
    width: 90px;
    position: absolute;
    top: 0;
    left: 50%;
    transform: translate(-50%, -50%);
    box-shadow: 0 1px 8px rgba(0, 0, 0, 0.3);
    /* outline: 5px solid #ffffffc0; */
}

.card .info {
    flex-grow: 1;
    padding: 10px;
    padding-top: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #ffffffd0;
    transition: 100ms;
    backdrop-filter: blur(20px) saturate(1.8) contrast(1.3);
}

.name {
    font-weight: thin;
    text-align: center;
    font-size: 2em;
    line-height: 1.1;
}

.realname{
    color: var(--detail);
    font-size: 1.3em;
    line-height: 1;
    margin-top: 4px;
}

.tags {
    display: flex;
    gap: 7px;
    margin: 8px 0;
}
.tag {

    --color: var(--theme-red);
    height: 25px;
    padding: 0 7px;
    border: 2px solid var(--color);
    border-radius: 50px;
    font-size: 0.8em;
    color: var(--color);
    line-height: 1;
    display: flex;
    align-items: center;
}
.tag.stressed {
    border-color: var(--color);
    background-color: var(--color);
    color: #fff;
}

.description {
    font-size: 0.9em;
    color: var(--detail);
    transition: 100ms;
}


.card.xt{
    --bg: url(../assets/x.jpg);
    .head{
        
        --img:url(../assets/xt.jpg);
    }
}

.card.tjy{
    --bg:url(../assets/star_clip.jpg);
    background-size: cover;
    background-position: center;
    --detail:#aaa;
    >.info{
        background-color: #11111187;
        /* background-color: transparent; */
        backdrop-filter: blur(10px) saturate(1.2) contrast(1.2);
        /* backdrop-filter: blur(5px); */
        color: #fff;
    }

    &.expanded>.info{
        background-color: #222;
    }

    .head{
        --img:url(../assets/strc_img.jpg);
        box-shadow: 0 -1px 9px rgba(104, 87, 3, 0.7);
    }
    .tag{
        --color:#61ccff;
    }
}

/* Overlay 基础样式 */
.detail-overlay {
	position: fixed;
	background: transparent;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 9999;
}
/* 详情卡片（从小卡片位置放大到居中大卡）*/
.card.detail-card {
    transition: 200ms cubic-bezier(0.6, 0, 0.3, 1);
	/* overflow: hidden;
	background-size: cover;
    display: flex;
    flex-direction: column; */
	/* 初始样式通过内联 overlayStyle 设置 top/left/width/height */
}

/* 展开后的目标样式 */
.card.detail-card.expanded {
    box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.5);
	top: 5vh !important;
	left: 5vw !important;
	width: 90vw !important;
	height: 90vh !important;
	border-radius: 14px !important;
    
    transition: 300ms cubic-bezier(0.42, 0.1, 0.3, 1.47);

    >.info{
        background-color: #fff;
    }
}

/* 关闭按钮 */
.close-btn{
	position: absolute;
	right: 12px;
	top: 12px;
	z-index: 2;
	border: none;
	background: rgba(255,255,255,0.6);
	border-radius: 6px;
	padding: 3px 8px;
	cursor: pointer;
}

/* detail 内部布局，保留原卡片的头像、文本样式 */
.detail-bg {
	height: 30%;
	/* background-position: center; */
}
.detail-info {
    flex-grow: 1;
    padding: 10px;
    padding-top: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #ffffffd0;
    backdrop-filter: blur(20px) saturate(1.8) contrast(1.3);
}

</style>
