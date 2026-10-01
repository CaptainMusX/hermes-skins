# Hermes 皮肤中心

Hermes Desktop 插件：六款内置主题、自定义配色工坊，以及 Wallpaper Engine 本地库浏览与壁纸选用。

## 主要行为

- 主题通过 Hermes 官方主题接口注册；Hermes 自身仍决定当前主题和明暗模式。
- “试穿”只调用临时预览；“退出试穿”恢复原主题；“应用”才保存。恢复按钮会返回应用插件皮肤前的 Hermes 主题。
- 从 Wallpaper Engine 选用或手动设置的壁纸可搭配任意 Hermes 主题。“界面透光度” `panelGlass`（0–100%）统一驱动面板、顶栏、侧栏与底栏底色，“界面毛玻璃强度” `surfaceFrost` 调节背景磨砂；每个面板仅由最外层内容容器绘制一次，内部会话、侧栏与文件视图不叠加第二层。终端真正透视需要应用 `patches/hermes-desktop-terminal-alpha.patch` 并重新构建 Hermes 宿主。
- 上下文用量浮窗、菜单、选择器、对话框与工具提示使用同一透光材质；浮层保留至少 70% 底色保证文字可读，随界面透光度调整，并使用同一背景模糊参数（0px 时关闭）。遮挡内容的必要实色层与图表分类色保留。
- 插件启用期间，Hermes 全局滑动条以主题强调色显示已选范围，以中性色显示剩余范围；关闭壁纸后仍生效，支持键盘焦点、禁用状态与 RTL 方向。
- 插件重载或禁用时，会移除自身壁纸、样式和未提交的预览。
- 全新安装保留 Hermes 当前主题，自动优化滑动条，不自动开启壁纸；升级时已有数值原样保留，所有百分比参数均开放完整 0-100 区间。

## 构建与安装

```sh
npm run build
npm test
npm run install:desktop
```

安装脚本会备份原有 `plugin.js`，然后原子替换，并部署场景后端，同时通过 `hermes plugins enable hermes-skins` 把插件注册进官方插件管理器（失败时回退为直接改写白名单）。Hermes 打开时通常会自动重载；也可在命令面板运行 **Reload desktop plugins**。首次安装若网关已在运行，需重启一次以挂载场景接口；此后重启不再需要手动操作。若场景接口报 404 "Plugin not found"，重新运行安装脚本即可恢复。

通过侧边栏“皮肤中心”或命令面板进入；底栏不再保留皮肤入口。

## 分发到其他设备

当前安装包面向 Windows，实机验证宿主为 Hermes Desktop 0.21.5+3337，需要 Node.js 22+。运行 `npm run package:desktop` 会在 `dist/` 生成包含已构建插件、场景后端、安装脚本和许可文件的 ZIP，以及 SHA-256 校验文件。

目标设备解压后双击 `install.cmd`；不需要安装构建依赖或重新编译。仓库也保留了构建产物，从 GitHub 下载源码 ZIP 后可直接运行 `node scripts/install-local.js`。自定义数据目录通过 `HERMES_HOME` 指定；`--frontend-only` 可仅安装前端，`--no-enable` 可留待手动启用后端。

完整安装、配色迁移、素材路径和终端透明边界见 [跨设备安装与迁移指南](docs/INSTALL.zh.md)。安装包不包含个人配置、截图、会话或 Steam 壁纸素材；本地素材和 Wallpaper Engine 项目需要在目标设备重新选择。

## 壁纸与自定义主题

打开“壁纸与背景控制”可自动扫描本机 Steam 库及 Wallpaper Engine 项目，按标题搜索、按类型筛选并选用壁纸；也可以手动选择库目录。不同项目使用以下播放方式：

- **视频**项目通过 Hermes 本地 `hermes-media://stream` 协议用 `<video>` 播放。
- **场景**项目由插件自带的场景后端（`backend/scene-helper.mjs`，PKG/TEX/MDL 解析）解包成缓存清单，再用内置 WebGL 播放器在隔离 iframe 中实时渲染——支持 2D 图层着色器、3D 场景、粒子与内嵌视频。没有可渲染图层时退回播放内嵌视频，最后再退回解码出的全分辨率静帧。
- **网页**项目把脚本、样式与资源内联进沙箱 iframe，并提供 Wallpaper Engine API 垫片；依赖未支持的 CEF 接口的页面可能呈现不同效果。

场景解包依赖插件后端：`npm run install:desktop` 会把它部署到桌面插件旁。首次安装后需让 Hermes 本地后端重新启动以挂载场景接口。接口不可用时界面会报错。选用时引用库中的原文件，不复制项目；取消 Steam 订阅后该文件可能消失。

手填地址仍支持 `http(s)`、`file:///` 和 Windows 本地绝对路径。直接读取本地图片失败时，插件会尝试 Hermes 文件桥；媒体最终加载失败则撤销透光样式，保持界面可读。

工坊可保存并立即注册自定义配色，也可导出当前配色 JSON；导入会把导出文件的内容回填到表单，确认保存后注册为新皮肤。

场景解析器、WebGL 播放器和网页壁纸垫片引用了 [dsh-skins](https://github.com/zhu1090093659/dsh-skins) 的源码；版本与许可见 [third_party/dsh-skins/NOTICE.md](third_party/dsh-skins/NOTICE.md)。设计还参考了 [hermes-skin-studio](https://github.com/weiweiplus0527/hermes-skin-studio)。

开发时可运行 `npm run audit:wallpaper-engine`，只读统计本机可发现的项目类型。
