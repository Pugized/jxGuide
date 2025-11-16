<script setup lang="ts">
</script>

<template>
    <div id="header">
        <span id="teamname">Pugized</span>
    </div>
    <span style="display:block;margin: 20px 30px;font-size: 25px;">团队成员</span>
    <div id="teammates">
        <div class="card">
            <div class="bg">
            </div>
            <div class="headcontainer">
                <div class="head"></div>
            </div>
            <div class="info">

                <span class="name">EncVar</span>
                <span class="realname">余涵</span>
                <div class="tags">
                    <span class="tag stressed">队长</span>
                    <span class="tag">后端开发</span>
                </div>
                <span class="description">负责 API 设计与实现</span>
            </div>
        </div><div class="card" >
            <div class="bg">
            </div>
            <div class="headcontainer">
                <div class="head"></div>
            </div>
            <div class="info">

                <span class="name">EncVar</span>
                <span class="realname">余涵</span>
                <div class="tags">
                    <span class="tag stressed">队长</span>
                    <span class="tag">后端开发</span>
                </div>
                <span class="description">负责 API 设计与实现</span>
            </div>
        </div><div class="card">
            <div class="bg">
            </div>
            <div class="headcontainer">
                <div class="head"></div>
            </div>
            <div class="info">

                <span class="name">EncVar</span>
                <span class="realname">余涵</span>
                <div class="tags">
                    <span class="tag stressed">队长</span>
                    <span class="tag">后端开发</span>
                </div>
                <span class="description">负责 API 设计与实现</span>
            </div>
        </div><div class="card">
            <div class="bg">
            </div>
            <div class="headcontainer">
                <div class="head"></div>
            </div>
            <div class="info">

                <span class="name">EncVar</span>
                <span class="realname">余涵</span>
                <div class="tags">
                    <span class="tag stressed">队长</span>
                    <span class="tag">后端开发</span>
                </div>
                <span class="description">负责 API 设计与实现</span>
            </div>
        </div><div class="card">
            <div class="bg">
            </div>
            <div class="headcontainer">
                <div class="head"></div>
            </div>
            <div class="info">

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
    gap: 16px;
    padding: 20px;
    justify-content: center;
}

.card {
    border: 2px solid #ddd;
    border-radius: 17px;
    overflow: hidden;
    width: 200px;
    display: flex;
    flex-direction: column;
    height: 300px;
    width: 250px;
    box-shadow: 0 7px 20px rgba(0, 0, 0, 0.14);
    background-color: #fff;
}

.card .bg {
    background: url(../assets/strc_img.jpg);
    background-position: center;
    background-size: cover;
    height: 30%;
}

.card .headcontainer {
    position: relative;
    height: 50px;
}

.card .head {
    background-image: url(../assets/EncVar.png);
    background-size: cover;
    border-radius: 50%;
    height: 100px;
    width: 100px;
    position: absolute;
    top: 0;
    left: 50%;
    transform: translate(-50%, -50%);
    border: 4px solid #fff;
}

.card .info {
    padding: 10px;
    padding-top: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.name {
    font-weight: thin;
    font-size: 2em;
    line-height: 1;
}

.realname{
    color: #777;
    font-size: 1.3em;
    line-height: 1;
    margin-top: 2px;
}

.tags {
    display: flex;
    gap: 7px;
    margin: 8px 0;
}
.tag {
    height: 25px;
    padding: 0 7px;
    border: 2px solid var(--theme-red);
    border-radius: 50px;
    font-size: 0.8em;
    color: var(--theme-red);
    line-height: 1;
    display: flex;
    align-items: center;
}
.tag.stressed {
    border-color: var(--theme-red);
    background-color: var(--theme-red);
    color: #fff;
}

.description {
    font-size: 0.9em;
    color: #999;
}
</style>
