# jxGuide

**团队名称**：Pugized<br>
**指导教师**：孙雪梅

## 项目背景与目标

嘉祥常年接待各类外来宾客，包括上级领导、家长等。传统的导览方式主要依赖校领导或专职人员进行现场讲解，存在诸多问题：

- 校领导讲解负担较重，耗费大量时间和精力。
- 参观者提问多，一一解答压力大，效率低。

为此，项目旨在充分利用生成式 AI 的人机交互能力，打造智能化校园导览系统。可以：

- 减轻工作者的负担；
- 提高参观体验；
- 展示先进技术，留下更深印象。

## 功能

### 1. 地图标记，动态更新

- 实时更新客户端的地图上的地点标记，便于得知目前参观位置。
- 有介绍文本，便于快速方便地了解信息（考虑语音播报）。

### 2. AI 问答、互动

- 客户端有聊天区域，参观者可随时询问不解，了解更多。
- 可给出个性化回答。充分利用了生成式 AI 的优点，并照顾了参观者的个性体验。

### 3. 蓝牙 iBeacon 定位（待定）

在校园内各处部署蓝牙信标，实现自动定位，帮助参观者实时了解自身位置及周边信息。

若蓝牙定位方案难以实施，备用方案为：由随同导览人员通过手机的管理系统，手动、统一更新参观位置。

- 陪同人员的管理端可以有广播消息推送的功能，方便通知全体参观者。


> 若需确定自己的位置，可考虑在一些位置放置二维码。或者使用 NFC 芯片。


## 技术

| 组件          | 技术选型                | 人员安排        |
| ------------- | ----------------------- | --------------- |
| 客户端+管理端 | vue.js                  | 谭景元          |
| 后端          | Rust（暂定）            | ~~余涵~~ 谭景元 |
| 语音播报合成  | 购买相关 token          | 夏威夷          |
| 定位          | 蓝牙信标 / NFC / 二维码 | 沈仲仪          |

## 其他人员安排

**队长** 徐图：统筹安排

待分配：
1. **宣传工作** PPT 等制作
2. 书面工作、沟通交流、经费管理等

## Vite 说明

**Vue 3 + TypeScript + Vite**

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).
