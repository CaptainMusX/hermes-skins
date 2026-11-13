# Hermes 壁纸引擎

Hermes Desktop 的 Wallpaper Engine 插件。把本机 Scene、Web、视频和图片壁纸放到界面背后，并提供液态玻璃、字体集、点击/拖尾、3D 视差和轮播列表。

入口位于 **设置 → 外观 → 常规** 页面底部。插件不增加侧边栏入口、皮肤画廊、主题工坊或主题注册。宠物、吉祥物和会话头像按需求排除；参考的 DSH 壁纸插件中其余面向用户的功能均提供 Hermes 对应实现。

## 功能

- **壁纸库**：Steam 库发现、Wallpaper Engine Scene/Web/视频/图片项目、本地图片/视频导入、URL 导入、Bing 每日一图、搜索、类型/内容分级/方向筛选、隐藏/恢复与卡片布局。
- **壁纸属性**：读取 Scene/Web 作者声明的 `general.properties`，按壁纸保存覆盖值并实时推给 WebWallGL。
- **Scene / Web**：WebWallGL 3.0.1 实时渲染、指针转发、沙箱 Web 项目、带签名 token 的本地环回媒体源与 HTTP Range。
- **视频 / 图片**：本地视频直接播放、音量/倍速、Picture 项目交叉淡化，并支持统一的图内轮播间隔覆盖。
- **切换过场**：硬切、交叉淡化、推移、擦除、光圈、缩放、条带，可选方向与速度。
- **轮播列表**：命名列表、逐列表选择壁纸、独立间隔、顺序/随机、按间隔或视频播完推进、逐列表总开关。
- **液态玻璃**：透光度、气泡填充、输入框/结构面磨砂、饱和度、边缘强度、顶部高光、明暗玻璃色、玻璃保真度、标题栏与侧栏控制。
- **字体与配色**：命名字体集与导入导出、系统字体扫描、全局字族、角色级字号/字重/字族、组件级字体、文字颜色角色、全局 UI 配色和独立光标色。
- **主题随壁纸**：从当前预览取样主色并更新 Hermes 强调色。
- **点击 / 拖尾**：波纹、火花、两者同时、彗尾、星尘、彩虹/自定义颜色、混合模式和不透明度。
- **3D 视差**：背景及可选的会话、输入框、侧栏、用户气泡和运行期发现的插件前端组。
- **播放与省电**：15/30/60fps 场景上限、自动画质、渲染分辨率、视频纹理缩放、重启恢复等待、隐藏/失焦/电池暂停。
- **系统页**：场景媒体健康、字体缓存数量、上传/场景缓存占用、最近日志、场景缓存清理、整套预设导入导出、关于与许可页。
- **Now Playing**：Windows GSMTC 尽力集成，把当前媒体元数据送入 WebWallGL 媒体源。

## 使用

1. 打开 **设置 → 外观 → 常规**。
2. 在页面底部点击 **打开壁纸引擎**。
3. 在 **壁纸库** 选择壁纸，或导入本地文件、URL、Bing 图片。
4. 打开启用开关。Scene/Web 壁纸需要插件后端；首次安装后重启 Hermes 网关。

## 安装

```sh
hermes plugins install CaptainMusX/hermes-skins/plugin --enable
```

也可使用 **技能与工具 → 插件 → Git 安装** 输入 `CaptainMusX/hermes-skins/plugin`。安装后重新打开 Hermes，并在需要时重启网关以挂载场景媒体接口。

## 开发

```sh
npm install
npm run build
npm test
npm run install:desktop
npm run package:desktop
```

`npm run install:desktop` 会备份旧桌面前端，部署后端与 WebWallGL 资源，并通过 Hermes 插件管理器启用插件。

## 架构

- `scripts/build.js` 构建单个桌面前端 ESM；内部模块辅助符号使用独立 IIFE 作用域，避免顶层命名冲突。
- `src/engine/backdrop-manager.js` 管理双壁纸层、过场几何、画面滤镜、指针、功耗暂停和首帧看门狗。
- `src/engine/{glass,font,fx-overlay,parallax,theme-follow}-controller.js` 分别管理玻璃、字体、画布特效、指针视差和主题取色，并在停用时完整清理。
- `src/engine/rotation-controller.js` 在用户轮播组内推进，并在需要时监听视频播放结束。
- `backend/scene_media.py` 在随机本地环回端口运行签名媒体源，支持 Range。
- `backend/webwallgl/` 保存 WebWallGL 渲染页与引擎资源。
- `backend/plugin_api.py` 提供场景解包/健康、系统字体、文件/URL/Bing 导入、诊断/缓存清理和 Now Playing 接口。

## 与 DSHWE 的对齐范围

壁纸与渲染模型参考 [dsh-wallpaper-engine](https://github.com/elysia395/dsh-wallpaper-engine) 1.4.2（`fd3e01f`）。Hermes 已覆盖除宠物相关外的用户功能：壁纸库、过场、轮播组、玻璃、字体集、FX、3D 视差、声音/媒体集成、系统诊断和关于/许可。宠物、吉祥物、头像、pet-link 以及皮肤画廊/主题工坊不实现。

逐项状态见 [DSHWE 功能对齐台账](docs/DSHWE-PARITY.zh.md)。

## 许可

WebWallGL 3.0.1、dsh-wallpaper-engine 渲染适配和旧的 dsh-skins 解析器均保留原始 MIT/BSD/Apache 许可与来源说明；详见 [LICENSING.md](LICENSING.md)、[THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md) 和 `third_party/`。

工坊壁纸素材不随插件分发；请只使用自己拥有或已获授权的素材。
