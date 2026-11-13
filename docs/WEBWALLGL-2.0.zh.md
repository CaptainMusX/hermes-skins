# 2.0 WebWallGL 重构说明

## 目标

让 Hermes 的壁纸链路与 DSH 上的 `dsh-wallpaper-engine` 保持同一套实时渲染
能力，而不是继续扩展旧的静态帧/简化场景播放器。重构参考了
[elysia395/dsh-wallpaper-engine](https://github.com/elysia395/dsh-wallpaper-engine)
的渲染页协议、图层生命周期与性能策略，渲染核心改用
[oneincase/webwallgl](https://github.com/oneincase/webwallgl) 3.0.1（MIT）。

## 渲染链路

1. `BackdropManager` 只持有一层“当前壁纸”和一层“退场壁纸”；切换时先建新层、
   等首帧/过渡完成后再销毁旧层，避免中间态透明导致玻璃失去背景。
2. Scene / Web 壁纸通过签名 token 访问本地工程：
   - `POST /api/plugins/hermes-skins/scene/open` 只接受工程目录或旧 manifest；
   - `/scene/files/<token>/...` 提供 `project.json`、`scene.pkg` 与松散资源；
   - 所有大文件支持 HTTP Range 和 1 MiB 分块流式读取。
   - 文件路由运行在 `127.0.0.1` 随机端口的独立 uvicorn 媒体源上，不经过
     Hermes 仪表盘的鉴权栅栏；媒体源只接受签名 token，不暴露 `scene/open`。
3. 渲染 iframe 加载 `/scene/live/index.html`，由 WebWallGL 解析图层、效果、
   粒子、模型、SceneScript、视频纹理与用户属性；宿主页只负责取景、帧率、
   指针、音频和暂停。
4. 指针按 rAF 合并后以归一化坐标送入渲染页；窗口失焦、最小化、电池供电
   三项暂停策略分别独立。
5. 首帧 30 秒看门狗；失败时保留工程预览作为静态垫底，不进入重载循环。

## 性能要点

- 场景帧率默认 30fps，可选 60fps；自动画质由 WebWallGL 按实时帧率降级。
- 视频纹理可设自动/半分辨率/完整分辨率，降低 4K 视频层的显存压力。
- 切换过场只动画 `opacity`、`transform` 或 `clip-path`，不触碰 `filter` 或 `backdrop-filter`。
- 模糊为 0 时不写 `blur(0px)`，避免无意义地提升合成层。
- 玻璃只改 CSSOM 变量，不重建整张样式表；文字层与壁纸层解耦。

## 玻璃

新增 `glassSaturation`（100-200%）、`glassBorder`（0-100%）与
`glassHighlight`。结构面、浮层、设置窗和输入卡片继续使用单一底色公式，
避免多层半透明叠加成实心板；饱和度与高光只在壁纸启用时生效。

## 兼容与迁移

- 配置 schema 升到 7；旧配置字段按兼容路径迁移，缺失字段取默认值。
- 切换过场新增推移、擦除、光圈和条带；旧 `slide` 自动迁移为 `push`。
- 旧 scene 选择保存的是解包 manifest。2.0 会读取 manifest 的 `scenePath`
  反推工程目录；也可以在壁纸库里重新点一次场景以写入新的 `dir` 选择。
- Web 壁纸现在由 WebWallGL 的严格沙箱 iframe 加载，WE API shim 由引擎提供。
- 字体集、点击/拖尾、3D 视差、轮播组、声音/媒体集成和系统诊断已另按 Hermes
  宿主的 DOM 与 SDK 重写；吉祥物、头像与宠物联动按要求排除。

## 许可

WebWallGL 以 MIT 许可随包分发，完整文本与来源见
`LICENSE.webwallgl`、`NOTICE.webwallgl.md`、`LICENSING.md` 和
`THIRD-PARTY-NOTICES.md`。工坊壁纸素材不随插件分发。
