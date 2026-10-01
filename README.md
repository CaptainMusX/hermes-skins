# Hermes Skins (Hermes 皮肤中心)

> **Hermes Desktop 皮肤中心与自定义壁纸/毛玻璃引擎**  
> 对标并吸收 [dsh-skins (`zhu1090093659/dsh-skins`)](https://github.com/zhu1090093659/dsh-skins) 的核心理念与架构设计，为 **Hermes Desktop** 原生打造的下一代换肤插件。

---

## 🌟 核心特性与 DSH 对齐矩阵

| 功能模块 | DSH Skins (`dsh-skins`) | Hermes Skins (`hermes-skins`) | 优势与实现 |
| :--- | :--- | :--- | :--- |
| **皮肤画廊** | 卡片式皮肤列表，展示预览图与色块 | ✅ 原生卡片网格画廊，支持多风格标签过滤 | 深度契合 Hermes Tailwind 设计规范 |
| **试穿机制** | Try-on 瞬时生效，Exit 还原 | ✅ 原子级试穿引擎 + 悬浮状态条 | 无副作用切换，随时退出或保存应用 |
| **内置经典皮肤** | Blue Fantasy, Whale Song, Maid Atelier | ✅ 完整内置 6 款高品质精美皮肤 | 离线矢量插画背景，零外链依赖，秒级加载 |
| **自定义壁纸** | 支持图片与视频壁纸 | ✅ 支持本地文件绝对路径、网络 URL、动态视频 | 全局独立背景图层，平滑淡入淡出（Crossfade） |
| **遮罩控制** | 背景遮罩 Occlusion (0–100%) | ✅ 自适应亮暗模式防遮挡遮罩滑块 | 彻底保证在复杂多彩壁纸下的文字极高对比度 |
| **高斯模糊** | Gaussian Blur 滑块 (0–20px) | ✅ 背景高斯模糊滤镜 (0–30px) | 柔化背景杂色，突出对话核心内容 |
| **面板透光** | 半透明面板与毛玻璃 | ✅ 面板毛玻璃透光控制 (0–100%) | 主视口、侧栏、卡片三层自适应透光 |
| **气泡透明度** | Bubble opacity 滑块 (0–100%) | ✅ 消息气泡透明度控制 (0–100%) | 接管 `--user-bubble-keep`，质感轻盈 |
| **输入框磨砂** | Composer frost 独立滤镜 | ✅ 输入框毛玻璃磨砂滤镜 (0–25px) | 底部输入框专属 backdrop-filter，防止打字干扰 |
| **主题工坊** | Light/Dark 调色板编辑器 | ✅ 自定义主题工坊 (Theme Studio) | 自由调色、一键试穿、保存与 JSON 导出 |
| **快捷入口** | 位于设置页面 | ✅ 路由全页 (`/skins`) + 侧边栏导航 + 状态栏挂件 + ⌘K | 全方位无缝集成 Hermes 桌面生态 |
| **多语言** | 中文 / 英文 | ✅ 中英文双语原生响应式切换 | 随客户端语言环境自适应 |

---

## 🎨 内置皮肤阵容 (Curated Skins)

1. **蓝色幻想 (Blue Fantasy)**
   - 适配自 powerdog996 · DreamSkin 社区
   - 巨鲸与星海插画，长春花靛蓝色调（Accent `#5a72cb`），晶莹半透明毛玻璃面板与高光边框。
2. **鲸吟 (Whale Song)**
   - 适配自 dsh-web 官方设计
   - 深海鲸语女神与冰蓝星轨，冷青蓝（Accent `#4d8fd4`）与神性金色微光。
3. **深海女仆工坊 (Abyssal Maid Atelier)**
   - 适配自 Small-tailqwq
   - 优雅香槟金（Accent `#c5a468`）与深海蓝蕾丝界面，华美典雅宫廷角色风。
4. **霓虹赛博 2077 (Cyberpunk Neon)**
   - Hermes Skin Lab 原创
   - 暗夜纯黑配合电光青蓝（Accent `#00f0ff`）与霓虹粉（`#ff007f`），赛博朋克极客科技感。
5. **黑曜翡翠 (Forest Obsidian)**
   - Hermes Skin Lab 原创
   - 静谧墨黑搭配温润松石翠绿（Accent `#10b981`），极度舒适护眼。
6. **落樱浅风 (Sakura Breeze)**
   - Hermes Skin Lab 原创
   - 雅致明快的浅色主题，樱花粉（Accent `#ec4899`）与温润米白，轻盈典雅。
7. **官方默认 (Official Default)**
   - 一键还原 Hermes Desktop 原生纯净外观。

---

## 🏗️ 架构设计 (Architecture)

```
hermes-skins/
├── plugin.js                  # 核心单文件 ESM 插件（分发与桌面端加载入口）
├── package.json               # 模块定义与脚本
├── src/
│   ├── catalog/
│   │   └── builtin-skins.js   # 内置皮肤库、调色板与离线矢量壁纸
│   ├── engine/
│   │   ├── backdrop-manager.js# 全局壁纸、视频与模糊遮罩层控制器
│   │   ├── glass-controller.js# 毛玻璃、样式注入与透明度控制器
│   │   └── storage-manager.js # 状态持久化、试穿事务管理
│   ├── ui/
│   │   ├── SkinCenterPage.js  # 全功能皮肤中心主页面（画廊/壁纸/工坊）
│   │   ├── StatusBarChip.js   # 状态栏快速挂件与 Popover 弹窗
│   │   ├── TryOnBanner.js     # 试穿浮动提示条
│   │   └── CustomThemeStudio.js# 自定义调色板与导入导出
│   └── i18n.js                # 中英文双语本地化字典
└── scripts/
    ├── build.js               # 编译整合为单文件 plugin.js
    └── install-local.js       # 本地安装到 Hermes 桌面端插件目录
```

### 核心机制

1. **BackdropManager (全局背景层)**：
   在 DOM 顶层插入 `#hermes-skins-backdrop-root`，采用 `contain: strict; pointer-events: none; z-index: -9999;`，不阻挡任何鼠标交互，不触发页面重排。支持图片与 HTML5 循环静音视频。
2. **GlassController (透光与毛玻璃)**：
   管理 `<style id="hermes-skins-runtime-css">`，为 `html[data-hermes-skins-active="true"]` 提供精细的作用域样式：
   - 穿透 `--ui-chat-surface-background` 和 `--ui-editor-surface-background`；
   - 调节 `--user-bubble-keep` 控制消息气泡玻璃感；
   - 输入框应用专属 `backdrop-filter: blur(...)` 磨砂效果。
3. **Anti-FOUC (防闪烁启动)**：
   插件挂载瞬间即从本地持久化存储加载激活的配置并立即渲染，避免切换窗口或重新启动时的白屏或闪烁。

---

## 🚀 安装与使用

### 1. 快速体验（已自动安装）
本插件已生成并自动安装到本机：
`~/.hermes/desktop-plugins/hermes-skins/plugin.js`

在 Hermes Desktop 中按下 `⌘K`（macOS）或 `Ctrl+K`（Windows/Linux）：
输入并回车：**`Reload desktop plugins`**，插件将立即热重载生效！

### 2. 使用方法
- **入口 1**：点击左侧侧边栏导航中的 **“皮肤中心”** 调色板图标（`symbol-color`）；
- **入口 2**：在右下角状态栏点击当前皮肤名称的挂件，直接弹出快速换肤卡片；
- **入口 3**：按 `Ctrl+K` / `⌘K` 搜索 **“Skin Center: Open Gallery”** 直达画廊。

---

## 🛠️ 自定义壁纸操作

1. 打开 **“皮肤中心”** -> 点击 **“壁纸与背景控制”** Tab。
2. 开启 **“启用自定义壁纸”** 开关。
3. 支持选择 **静态图片** 或 **动态视频**。
4. 在输入框输入：
   - 本地路径，例如：`C:/Users/CaptainMus/Pictures/my_wallpaper.jpg`
   - 在线 URL，例如：`https://images.unsplash.com/...`
   - 本地视频，例如：`C:/Users/CaptainMus/Videos/live_wallpaper.mp4`
5. 滑动调节 **背景模糊**（0–30px）和 **防遮挡遮罩**（0–100%），找到最舒适的视觉平衡。

---

## 📜 许可证

MIT License. Designed with ❤️ for the Hermes community.
