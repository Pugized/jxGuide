<script setup lang="ts">
</script>

<template>
    <div id="header">
        <span id="teamname">Pugized</span>
    </div>
    <span style="display:block;margin: 20px 30px;font-size: 25px;">团队成员</span>
    <div id="teammates">
        <div class="card" style="--bg:#d1e5f3">
            <div class="bg">
            </div>
            <div class="info">
                <div class="headcontainer">
                    <div class="head"></div>
                </div>
                <span class="name">EncVar</span>
                <span class="realname">余涵</span>
                <div class="tags">
                    <span class="tag stressed">队长</span>
                    <span class="tag">后端开发</span>
                </div>
                <span class="description">负责 API 设计与实现</span>
            </div>
        </div>
        <div class="card tjy">
            <div class="bg">
            </div>
            <div class="info">
                <div class="headcontainer">
                    <div class="head"></div>
                </div>
                <span class="name">星源</span>
                <span class="realname">谭景元</span>
                <div class="tags">
                    <!-- <span class="tag stressed">队长</span> -->
                    <span class="tag">前端设计</span>
                </div>
                <span class="description">负责 API 设计与实现</span>
            </div>
        </div>
        <div class="card">
            <div class="bg">
            </div>
            <div class="info">
                <div class="headcontainer">
                    <div class="head"></div>
                </div>
                <span class="name">EncVar</span>
                <span class="realname">余涵</span>
                <div class="tags">
                    <span class="tag stressed">队长</span>
                    <span class="tag">后端开发</span>
                </div>
                <span class="description">负责 API 设计与实现</span>
            </div>
        </div>
    </div>
</template>

<style scoped>

#header{
    display: flex;
    flex-direction: column;
    background-color: var(--theme-blue);
    height: 200px;
    align-items: center;
    justify-content: center;
}

#teamname{
    font-size: 50px;
    color: #fff;
    font-weight: bold;
    font-family:'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
}

#teammates {
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    padding: 20px;
    justify-content: center;
}

.card {
    --bg:#f0f0f0;
    --detail: #777;
    border: 2px solid #ddd;
    border-radius: 17px;
    overflow: hidden;
    width: 200px;
    display: flex;
    flex-direction: column;
    height: 300px;
    width: 250px;
    box-shadow: 0 6px 25px -3px rgba(0, 0, 0, 0.2);
    background: var(--bg);
}

.card .bg {
    height: 30%;
}

.card .headcontainer {
    position: relative;
    height: 50px;
}

.card .head {
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
    backdrop-filter: blur(20px) saturate(1.8) contrast(1.3);
}

.name {
    font-weight: thin;
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
        transition: 100ms 300ms ;
}


.card.tjy{
    --bg:url(../assets/dark_clip.jpg);
    background-size: cover;
    background-position: center;
    --detail:#aaa;
    >.info{
        background-color: #111111a7;
        color: #fff;
    }
    .head{
        --img:url(../assets/strc_img.jpg);
        box-shadow: 0 1px 9px rgba(0, 0, 0, 0.7);
    }
    .tag{
        --color:#61ccff;
    }
}

.card{
    transform: scale(0.8);
    margin: -20px;
    transition: 150ms 200ms cubic-bezier(0.42, 0.1, 0.3, 1.47);

    >.info{
        transform-origin: top center;
        transition: 150ms 200ms cubic-bezier(0.42, 0.1, 0.3, 1.47);
    }
}

.card:not(:hover){
    .info{
        transform: scale(1.2);
    }
    .description{
        opacity: 0;
    }
}

.card:hover{
    z-index: 1;
    transform: none;
}
</style>
