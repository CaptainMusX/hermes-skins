/**
 * Hermes Skin Center (hermes-skins)
 * Version: 1.3.4
 * Author: CaptainMusX (inspired by dsh-skins)
 *
 * Standalone Desktop Plugin for Hermes Desktop.
 * Provides skin gallery, custom wallpaper/video engine, glassmorphism translucency,
 * try-on/apply workflows, and theme studio.
 *
 * Third-party portions: dsh-skins, pinned at 82f42bd3bf91ea88475e59a2753f87041a960a56.
 * Copyright (c) 2026, zhu1090093659; historical notice: dsh-external contributors.
 * Changes in this generated file: vendor imports/exports removed and modules concatenated;
 * Hermes adapters are added in project-owned modules. Vendor source is otherwise preserved.
 * See LICENSING.md, THIRD-PARTY-NOTICES.md and the accompanying complete license texts.
 */

import {
  atom, Badge, Button, host, Input,
  PALETTE_AREA, ROUTES_AREA, SegmentedControl, SIDEBAR_NAV_AREA,
  Switch, THEMES_AREA,
  usePluginI18n, useTheme, useValue
} from '@hermes/plugin-sdk'
import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { jsx, jsxs } from 'react/jsx-runtime'

// ─── Submodule: i18n ──────────────────────────────────────────
const I18N_DICTIONARY = {
  en: {
    pluginName: 'Hermes Skin Center',
    pluginDesc: 'Skin gallery and optional wallpaper for Hermes Desktop',
    tabGallery: 'Skin Gallery',
    tabWallpaper: 'Wallpaper & Glass',
    tabStudio: 'Theme Studio',
    activeBadge: 'Active',
    tryOnBadge: 'Trying On',
    applyButton: 'Apply Skin',
    tryOnButton: 'Try On',
    exitTryOnButton: 'Exit Try-on',
    resetToDefault: 'Official Default',
    officialDefaultDesc: 'Return to the Hermes theme you used before this skin. A selected Wallpaper Engine wallpaper stays available.',
    tryOnBannerTitle: name => `✨ Trying on: ${name}`,
    tryOnBannerDesc: 'Changes are live in this window. Click Apply to keep it, or Exit to restore previous theme.',
    applySuccess: 'Applied skin: {name}',
    exitSuccess: 'Restored previous skin',
    wallpaperControls: 'Wallpaper & Background Controls',
    enableWallpaper: 'Enable Custom Wallpaper',
    enableWallpaperDesc: 'Render image or video background behind chat panels with glassmorphism',
    wallpaperType: 'Wallpaper Type',
    wallpaperTypeImage: 'Image (URL / Local path)',
    wallpaperTypeVideo: 'Video (MP4 / WebM)',
    wallpaperTypePreset: 'Built-in Art Preset',
    wallpaperSource: 'Wallpaper Source URL or Local Path',
    wallpaperSourcePlaceholder: 'https://... or C:/path/to/wallpaper.jpg',
    wallpaperBlur: 'Backdrop Blur',
    wallpaperBlurDesc: 'Gaussian blur applied to the wallpaper media (0px - 60px)',
    maskOcclusion: 'Backdrop Occlusion Mask',
    maskOcclusionDesc: 'Wallpaper veil; 100% fully hides the wallpaper (0% - 100%).',
    panelGlass: 'Interface Transparency',
    panelGlassDesc: 'Shared transparency for panels, title bar, sidebars, and status bar; menus and popovers retain a readable translucent fill. 0% keeps the full panel fill, 100% makes it transparent (0% - 100%).',
    selectSkinFirst: 'Choose a skin, enter a media path, or pick a Wallpaper Engine project.',
    invalidWallpaperSource: 'Use an http(s) URL, a file URL, or an absolute local path.',
    sourceCommitHint: 'Press Enter or leave the field to apply the path.',
    weTitle: 'Import from Wallpaper Engine',
    weDescription: 'Browse your local Steam library. Videos and web projects play live; scene projects are unpacked and rendered in real time when selected. The source stays in the Wallpaper Engine library.',
    weChooseFolder: 'Choose library folder',
    weRefresh: 'Rescan',
    weScanning: 'Scanning local wallpapers…',
    weFound: count => `${count} projects found`,
    weBridgeUnavailable: 'This Hermes Desktop build does not expose local file browsing.',
    weSearch: 'Search wallpapers',
    weEmpty: 'No Wallpaper Engine projects found. Choose the Steam library, projects folder, or a project folder.',
    weMissing: 'The previously selected project is no longer in this library. Choose another project if its source file was removed.',
    weStaticFallback: 'static preview',
    weSceneLive: 'extract and render scene on selection',
    wePreparing: 'Preparing scene…',
    weSceneBackendUnavailable: 'Scene backend unavailable. Restart the Hermes gateway after installing the plugin backend.',
    weSceneBackendMissing: 'The scene backend is not enabled in the Hermes gateway (404). Run "npm run install:desktop" in the plugin folder, then restart Hermes.',
    weSceneUnsupported: 'This scene has no supported renderable layers or video.',
    weUse: 'Use as wallpaper',
    weSelected: 'Selected',
    weTypeVideo: 'Video',
    weTypeScene: 'Scene',
    weTypeImage: 'Image',
    weTypeWeb: 'Web',
    weTypeOther: 'Other',
    bubbleOpacity: 'Message Bubble Opacity',
    bubbleOpacityDesc: 'Bubble fill translucency; 0% keeps only text visible (0% - 100%)',
    composerFrost: 'Composer Frost Blur',
    composerFrostDesc: 'Frosted glass backdrop-filter behind the message input card (0px - 20px)',
    surfaceFrost: 'Surface Frost Blur',
    surfaceFrostDesc: 'Shared background blur for panels, title bar, sidebars, status bar, and floating menus; 0px disables the blur, text and icons stay sharp (0px - 20px)',
    wallpaperMode: 'Playback mode',
    wallpaperModeLive: 'Live',
    wallpaperModeFrame: 'Static frame',
    wallpaperFit: 'Fit',
    wallpaperFitCover: 'Cover',
    wallpaperFitContain: 'Contain',
    wallpaperFitFill: 'Fill',
    wallpaperOpacity: 'Wallpaper opacity',
    wallpaperOpacityDesc: 'Opacity of the wallpaper media layer (0% - 100%).',
    pauseOnHidden: 'Pause while Hermes is hidden',
    wallpaperSound: 'Play video sound',
    wallpaperVolume: 'Video volume',
    wallpaperVolumeDesc: 'Volume for standalone video wallpapers.',
    themeStudioTitle: 'Custom Theme Studio',
    themeStudioDesc: 'Create and customize your personalized color palette and typography',
    accentColor: 'Accent Color',
    backgroundColor: 'Background Color',
    foregroundColor: 'Foreground Color',
    cardColor: 'Card / Surface Color',
    saveCustomSkin: 'Save as Custom Skin',
    exportSkinJson: 'Export Skin JSON',
    importSkinJson: 'Import Skin JSON',
    skinJsonInvalid: 'Invalid skin JSON file.',
    customSkinName: 'Custom Skin Name',
    customSkinNamePlaceholder: 'My Custom Theme',
    quickSwitchSkin: 'Quick Skin Switch',
    statusBarTooltip: 'Hermes Skin Center — Click to customize appearance',
    openGalleryPalette: 'Skin Center: Open Gallery',
    toggleWallpaperPalette: 'Skin Center: Toggle Wallpaper',
    tagsAll: 'All',
    tagsArt: 'Illustration',
    tagsAnime: 'Anime & Aesthetic',
    tagsDark: 'Dark & Deep',
    tagsLight: 'Light & Clean',
    tagsCyber: 'Cyberpunk',
    author: 'Author',
    filterByTag: 'Filter by style'
  },
  zh: {
    pluginName: 'Hermes 皮肤中心',
    pluginDesc: '为 Hermes Desktop 提供皮肤画廊与可选壁纸',
    tabGallery: '皮肤画廊',
    tabWallpaper: '壁纸与背景控制',
    tabStudio: '主题工坊',
    activeBadge: '当前使用',
    tryOnBadge: '正在试穿',
    applyButton: '应用皮肤',
    tryOnButton: '试穿',
    exitTryOnButton: '退出试穿',
    resetToDefault: '官方默认',
    officialDefaultDesc: '恢复使用此皮肤前的 Hermes 主题；已选用的 Wallpaper Engine 壁纸仍可继续使用。',
    tryOnBannerTitle: name => `✨ 正在试穿：${name}`,
    tryOnBannerDesc: '当前仅在当前窗口预览生效，未持久化。点击“应用”正式保存，或点击“退出试穿”恢复原状。',
    applySuccess: '已成功应用皮肤：{name}',
    exitSuccess: '已退出试穿并恢复原主题',
    wallpaperControls: '壁纸与背景渲染设置',
    enableWallpaper: '启用自定义壁纸',
    enableWallpaperDesc: '在会话窗口与面板背后渲染图片/视频壁纸，并启用毛玻璃透光质感',
    wallpaperType: '壁纸类型',
    wallpaperTypeImage: '静态图片 (网络 URL / 本地路径)',
    wallpaperTypeVideo: '动态视频 (MP4 / WebM 循环静音)',
    wallpaperTypePreset: '精选内置艺术壁纸',
    wallpaperSource: '壁纸地址或本地绝对路径',
    wallpaperSourcePlaceholder: 'https://... 或 C:/Users/.../wallpaper.jpg',
    wallpaperBlur: '背景高斯模糊',
    wallpaperBlurDesc: '平滑模糊壁纸素材层，减少背景噪点干扰 (0px - 60px)',
    maskOcclusion: '防遮挡遮罩不透明度',
    maskOcclusionDesc: '明暗自适应遮罩；100% 表示完全遮住壁纸 (0% - 100%)。',
    panelGlass: '界面透光度',
    panelGlassDesc: '面板、顶栏、侧栏与底栏共用的透光度；菜单与浮窗保留适量透光底色以保证可读。0% 保留完整面板底色，100% 面板底色完全透明 (0% - 100%)。',
    selectSkinFirst: '请先选择皮肤、填写媒体路径，或从 Wallpaper Engine 选择项目。',
    invalidWallpaperSource: '请输入 http(s) 地址、file 地址或本地绝对路径。',
    sourceCommitHint: '按 Enter 或离开输入框后应用路径。',
    weTitle: '从 Wallpaper Engine 导入',
    weDescription: '浏览本机 Steam 壁纸库。视频与网页项目可在 Hermes 内实时播放，场景项目选用时会解包并实时渲染。当前方式引用原始库文件，不复制项目。',
    weChooseFolder: '选择壁纸库目录',
    weRefresh: '重新扫描',
    weScanning: '正在扫描本机壁纸…',
    weFound: count => `找到 ${count} 个项目`,
    weBridgeUnavailable: '当前 Hermes Desktop 版本未提供本地文件浏览接口。',
    weSearch: '搜索壁纸',
    weEmpty: '未找到 Wallpaper Engine 项目。请选择 Steam 库、projects 目录或具体项目目录。',
    weMissing: '之前选用的项目已不在当前库中；如果源文件被移除，请重新选择壁纸。',
    weStaticFallback: '静态预览',
    weSceneLive: '选用时解包并实时渲染',
    wePreparing: '正在解包场景…',
    weSceneBackendUnavailable: '场景后端尚未启用。安装后请重启 Hermes 网关。',
    weSceneBackendMissing: '场景后端未在网关白名单中启用(404)。请在插件目录重新运行 "npm run install:desktop",然后重启 Hermes。',
    weSceneUnsupported: '此场景没有可支持的图层或视频。',
    weUse: '设为壁纸',
    weSelected: '已选用',
    weTypeVideo: '视频',
    weTypeScene: '场景',
    weTypeImage: '图片',
    weTypeWeb: '网页',
    weTypeOther: '其他',
    bubbleOpacity: '消息气泡不透明度',
    bubbleOpacityDesc: '气泡底色不透明度；0% 时仅保留文字原有效果 (0% - 100%)',
    composerFrost: '输入框磨砂毛玻璃',
    composerFrostDesc: '输入卡片的磨砂滤镜，保持输入内容层级 (0px - 20px)',
    surfaceFrost: '界面毛玻璃强度',
    surfaceFrostDesc: '面板、顶栏、侧栏、底栏与浮动菜单共用的背景磨砂模糊；0px 关闭模糊，文字与图标保持清晰 (0px - 20px)',
    wallpaperMode: '播放模式',
    wallpaperModeLive: '动态播放',
    wallpaperModeFrame: '静态帧',
    wallpaperFit: '画面适配',
    wallpaperFitCover: '铺满',
    wallpaperFitContain: '完整显示',
    wallpaperFitFill: '拉伸填满',
    wallpaperOpacity: '壁纸不透明度',
    wallpaperOpacityDesc: '调整壁纸素材层的不透明度 (0% - 100%)。',
    pauseOnHidden: 'Hermes 隐藏时暂停动画',
    wallpaperSound: '播放视频声音',
    wallpaperVolume: '视频音量',
    wallpaperVolumeDesc: '调整独立视频壁纸音量。',
    themeStudioTitle: '自定义主题工坊',
    themeStudioDesc: '自由调节专属配色方案，支持实时预览与保存为独立皮肤',
    accentColor: '主强调色 (Accent)',
    backgroundColor: '背景底色 (Background)',
    foregroundColor: '主要文字色 (Foreground)',
    cardColor: '卡片/表面色 (Card)',
    saveCustomSkin: '保存为自定义皮肤',
    exportSkinJson: '导出皮肤配置 (JSON)',
    importSkinJson: '导入皮肤配置 (JSON)',
    skinJsonInvalid: '皮肤 JSON 文件无效。',
    customSkinName: '皮肤名称',
    customSkinNamePlaceholder: '我的专属皮肤',
    quickSwitchSkin: '快速换肤',
    statusBarTooltip: 'Hermes 皮肤中心 — 点击快速配置外观与壁纸',
    openGalleryPalette: '皮肤中心: 打开画廊',
    toggleWallpaperPalette: '皮肤中心: 切换壁纸开关',
    tagsAll: '全部风格',
    tagsArt: '艺术插画',
    tagsAnime: '角色美学',
    tagsDark: '深色深邃',
    tagsLight: '雅致浅色',
    tagsCyber: '赛博科技',
    author: '创作者',
    filterByTag: '按风格筛选'
  }
}

// ─── Submodule: Catalog ───────────────────────────────────────
/**
 * Built-in curated skins for Hermes Desktop.
 * Inspired by the best of dsh-skins (Blue Fantasy, Whale Song, Maid Atelier)
 * and tailored for Hermes desktop's glass & tailwind architecture.
 */

// High quality embedded SVG wallpaper generators (offline-first, zero external latency)
const WALLPAPER_PRESETS = {
  'blue-fantasy': `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
      <defs>
        <radialGradient id="oceanBg" cx="30%" cy="40%" r="80%">
          <stop offset="0%" stop-color="#16223f"/>
          <stop offset="45%" stop-color="#0d1428"/>
          <stop offset="100%" stop-color="#060914"/>
        </radialGradient>
        <linearGradient id="whaleGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#5a72cb" stop-opacity="0.6"/>
          <stop offset="50%" stop-color="#38bdf8" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="#1e1b4b" stop-opacity="0"/>
        </linearGradient>
        <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="60" result="blur"/>
        </filter>
      </defs>
      <rect width="1920" height="1080" fill="url(#oceanBg)"/>
      <circle cx="450" cy="380" r="350" fill="url(#whaleGlow)" filter="url(#softGlow)"/>
      <circle cx="1400" cy="700" r="280" fill="#4f46e5" fill-opacity="0.18" filter="url(#softGlow)"/>
      <!-- Constellation and star dust -->
      <g stroke="#93c5fd" stroke-opacity="0.4" stroke-width="1.2" fill="none">
        <path d="M 200,280 L 320,240 L 450,300 L 580,260 L 720,350 L 850,310"/>
        <path d="M 320,240 L 410,160 L 520,200 L 580,260"/>
      </g>
      <g fill="#bae6fd">
        <circle cx="200" cy="280" r="3" opacity="0.8"/>
        <circle cx="320" cy="240" r="4" opacity="0.9"/>
        <circle cx="450" cy="300" r="3.5" opacity="0.85"/>
        <circle cx="580" cy="260" r="4.5" opacity="1"/>
        <circle cx="720" cy="350" r="3" opacity="0.7"/>
        <circle cx="850" cy="310" r="4" opacity="0.9"/>
        <circle cx="410" cy="160" r="2.5" opacity="0.75"/>
        <circle cx="520" cy="200" r="3" opacity="0.8"/>
        <circle cx="1100" cy="200" r="2" opacity="0.5"/>
        <circle cx="1350" cy="150" r="2.5" opacity="0.6"/>
        <circle cx="1600" cy="320" r="1.8" opacity="0.4"/>
        <circle cx="1250" cy="500" r="2.2" opacity="0.5"/>
      </g>
      <!-- Stylized whale silhouette trace -->
      <path d="M 280,480 C 400,320 680,310 920,410 C 1150,510 1350,470 1520,390 C 1450,490 1280,620 1020,640 C 780,660 520,620 400,560 C 330,530 250,560 190,580 C 220,530 250,500 280,480 Z"
            fill="#38bdf8" fill-opacity="0.08" stroke="#60a5fa" stroke-opacity="0.25" stroke-width="2"/>
    </svg>
  `)}`,

  'whale-song': `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
      <defs>
        <radialGradient id="deepOcean" cx="20%" cy="30%" r="90%">
          <stop offset="0%" stop-color="#0b1b3d"/>
          <stop offset="50%" stop-color="#071026"/>
          <stop offset="100%" stop-color="#020612"/>
        </radialGradient>
        <radialGradient id="goldAura" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#e0a94d" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="#e0a94d" stop-opacity="0"/>
        </radialGradient>
        <filter id="auroraGlow">
          <feGaussianBlur stdDeviation="80"/>
        </filter>
      </defs>
      <rect width="1920" height="1080" fill="url(#deepOcean)"/>
      <circle cx="380" cy="320" r="300" fill="url(#goldAura)" filter="url(#auroraGlow)"/>
      <circle cx="800" cy="500" r="420" fill="#38bdf8" fill-opacity="0.12" filter="url(#auroraGlow)"/>
      <!-- Golden geometric lines -->
      <g stroke="#f59e0b" stroke-opacity="0.35" stroke-width="1" fill="none">
        <circle cx="380" cy="320" r="140" stroke-dasharray="4,8"/>
        <circle cx="380" cy="320" r="220" stroke-opacity="0.2"/>
        <line x1="80" y1="320" x2="680" y2="320" stroke-opacity="0.25"/>
        <line x1="380" y1="20" x2="380" y2="620" stroke-opacity="0.25"/>
      </g>
    </svg>
  `)}`,

  'maid-atelier': `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
      <defs>
        <linearGradient id="palaceBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#12182b"/>
          <stop offset="50%" stop-color="#0c1020"/>
          <stop offset="100%" stop-color="#070a14"/>
        </linearGradient>
        <radialGradient id="laceGlow" cx="25%" cy="35%" r="60%">
          <stop offset="0%" stop-color="#c5a468" stop-opacity="0.22"/>
          <stop offset="100%" stop-color="#c5a468" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="1920" height="1080" fill="url(#palaceBg)"/>
      <circle cx="360" cy="360" r="360" fill="url(#laceGlow)" filter="blur(60px)"/>
      <!-- Ornate delicate filigree frames -->
      <g stroke="#d4af37" stroke-opacity="0.25" stroke-width="1.2" fill="none">
        <rect x="40" y="40" width="1840" height="1000" rx="16" stroke-dasharray="12,12"/>
        <circle cx="360" cy="360" r="160"/>
        <circle cx="360" cy="360" r="170" stroke-dasharray="3,6"/>
      </g>
    </svg>
  `)}`,

  'cyberpunk-neon': `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
      <defs>
        <radialGradient id="cyberBg" cx="50%" cy="50%" r="80%">
          <stop offset="0%" stop-color="#120c1f"/>
          <stop offset="100%" stop-color="#05030a"/>
        </radialGradient>
        <filter id="neonBlur">
          <feGaussianBlur stdDeviation="70"/>
        </filter>
      </defs>
      <rect width="1920" height="1080" fill="url(#cyberBg)"/>
      <circle cx="300" cy="300" r="280" fill="#00f0ff" fill-opacity="0.22" filter="url(#neonBlur)"/>
      <circle cx="1500" cy="650" r="320" fill="#ff0055" fill-opacity="0.2" filter="url(#neonBlur)"/>
      <!-- Grid perspective lines -->
      <g stroke="#00f0ff" stroke-opacity="0.12" stroke-width="1">
        <line x1="0" y1="800" x2="1920" y2="800"/>
        <line x1="0" y1="880" x2="1920" y2="880"/>
        <line x1="0" y1="940" x2="1920" y2="940"/>
        <line x1="0" y1="980" x2="1920" y2="980"/>
        <line x1="960" y1="750" x2="100" y2="1080"/>
        <line x1="960" y1="750" x2="400" y2="1080"/>
        <line x1="960" y1="750" x2="700" y2="1080"/>
        <line x1="960" y1="750" x2="960" y2="1080"/>
        <line x1="960" y1="750" x2="1220" y2="1080"/>
        <line x1="960" y1="750" x2="1520" y2="1080"/>
        <line x1="960" y1="750" x2="1820" y2="1080"/>
      </g>
    </svg>
  `)}`,

  'forest-obsidian': `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
      <defs>
        <radialGradient id="forestBg" cx="40%" cy="30%" r="85%">
          <stop offset="0%" stop-color="#0a1a14"/>
          <stop offset="60%" stop-color="#050e0a"/>
          <stop offset="100%" stop-color="#020504"/>
        </radialGradient>
        <filter id="emeraldGlow">
          <feGaussianBlur stdDeviation="90"/>
        </filter>
      </defs>
      <rect width="1920" height="1080" fill="url(#forestBg)"/>
      <circle cx="450" cy="350" r="320" fill="#10b981" fill-opacity="0.18" filter="url(#emeraldGlow)"/>
      <circle cx="1300" cy="720" r="350" fill="#047857" fill-opacity="0.12" filter="url(#emeraldGlow)"/>
    </svg>
  `)}`,

  'sakura-breeze': `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
      <defs>
        <linearGradient id="sakuraBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fdf2f8"/>
          <stop offset="50%" stop-color="#fce7f3"/>
          <stop offset="100%" stop-color="#fae8ff"/>
        </linearGradient>
        <filter id="softPetal">
          <feGaussianBlur stdDeviation="40"/>
        </filter>
      </defs>
      <rect width="1920" height="1080" fill="url(#sakuraBg)"/>
      <circle cx="350" cy="280" r="240" fill="#f472b6" fill-opacity="0.25" filter="url(#softPetal)"/>
      <circle cx="1400" cy="650" r="300" fill="#ec4899" fill-opacity="0.18" filter="url(#softPetal)"/>
    </svg>
  `)}`
}

const BUILTIN_SKINS = [
  {
    id: 'blue-fantasy',
    name: '蓝色幻想',
    nameEn: 'Blue Fantasy',
    author: 'powerdog996 · DreamSkin 社区',
    tagline: '深海巨鲸星海插画 · 靛蓝冷色调 · 晶莹半透明毛玻璃面板',
    description: '源自 DSH 与 DreamSkin 社区最受欢迎的经典主题。深海鲸群在半透明面板之下游弋，长春花靛蓝色调赋予全界面沉浸感与优雅科技感。',
    tags: ['art', 'anime', 'dark'],
    accent: '#5a72cb',
    wallpaper: WALLPAPER_PRESETS['blue-fantasy'],
    wallpaperType: 'image',
    defaultBlur: 4,
    defaultOcclusion: 35,
    colors: {
      background: '#0d1428',
      foreground: '#e2e8f0',
      card: '#131d38',
      cardForeground: '#f8fafc',
      muted: '#1e293b',
      mutedForeground: '#94a3b8',
      popover: '#162244',
      popoverForeground: '#f8fafc',
      primary: '#5a72cb',
      primaryForeground: '#ffffff',
      secondary: '#253562',
      secondaryForeground: '#e2e8f0',
      accent: '#6366f1',
      accentForeground: '#ffffff',
      border: '#2a3b68',
      input: '#1a264a',
      ring: '#5a72cb',
      userBubble: '#24325e'
    },
    darkColors: {
      background: '#0a0f20',
      foreground: '#e2e8f0',
      card: '#101830',
      cardForeground: '#f8fafc',
      muted: '#18223f',
      mutedForeground: '#8b9bb4',
      popover: '#121c3b',
      popoverForeground: '#f8fafc',
      primary: '#5a72cb',
      primaryForeground: '#ffffff',
      secondary: '#1d2a52',
      secondaryForeground: '#cbd5e1',
      accent: '#6366f1',
      accentForeground: '#ffffff',
      border: '#23325c',
      input: '#162244',
      ring: '#5a72cb',
      userBubble: '#1f2c58'
    },
    customCSS: `
      /* Blue Fantasy special glass highlights */
      [data-hermes-skins-active="true"] [data-slot="sidebar-wrapper"] {
        border-right: 1px solid rgba(90, 114, 203, 0.22) !important;
      }
      [data-hermes-skins-active="true"] .hermes-skins-card-glow {
        box-shadow: 0 0 20px rgba(90, 114, 203, 0.15);
      }
    `
  },
  {
    id: 'whale-song',
    name: '鲸吟',
    nameEn: 'Whale Song',
    author: 'dsh-web 官方设计',
    tagline: '深海鲸语女神背景 · 冰蓝海洋调色板 · 金色微光点缀',
    description: '深邃高冷的冰蓝海洋体系，结合神性金色细线高光。对话视口展现深海远航意境，兼具通透感与出色的文字阅读对比度。',
    tags: ['art', 'anime', 'dark'],
    accent: '#4d8fd4',
    wallpaper: WALLPAPER_PRESETS['whale-song'],
    wallpaperType: 'image',
    defaultBlur: 5,
    defaultOcclusion: 38,
    colors: {
      background: '#071026',
      foreground: '#e0f2fe',
      card: '#0c1a3a',
      cardForeground: '#f0f9ff',
      muted: '#14254b',
      mutedForeground: '#7dd3fc',
      popover: '#0f2048',
      popoverForeground: '#f0f9ff',
      primary: '#4d8fd4',
      primaryForeground: '#ffffff',
      secondary: '#1b3569',
      secondaryForeground: '#e0f2fe',
      accent: '#38bdf8',
      accentForeground: '#082f49',
      border: '#1e3a73',
      input: '#11234a',
      ring: '#4d8fd4',
      userBubble: '#173062'
    },
    darkColors: {
      background: '#040918',
      foreground: '#e0f2fe',
      card: '#08132c',
      cardForeground: '#f0f9ff',
      muted: '#0e1d3f',
      mutedForeground: '#60a5fa',
      popover: '#0a1736',
      popoverForeground: '#f0f9ff',
      primary: '#4d8fd4',
      primaryForeground: '#ffffff',
      secondary: '#132853',
      secondaryForeground: '#bae6fd',
      accent: '#38bdf8',
      accentForeground: '#082f49',
      border: '#182f61',
      input: '#0c1c42',
      ring: '#4d8fd4',
      userBubble: '#12254e'
    },
    customCSS: `
      [data-hermes-skins-active="true"] [data-slot="composer-rich-input"] {
        border-color: rgba(77, 143, 212, 0.4) !important;
      }
    `
  },
  {
    id: 'maid-atelier',
    name: '深海女仆工坊',
    nameEn: 'Abyssal Maid Atelier',
    author: 'Small-tailqwq',
    tagline: '香槟金与深海蓝蕾丝界面 · 华美典雅宫廷风',
    description: '以深海蓝、柔金色与陶瓷白构筑的精致角色美学。金色边框点缀半透明面板，提供优雅奢华的会话交互体验。',
    tags: ['anime', 'art', 'dark'],
    accent: '#c5a468',
    wallpaper: WALLPAPER_PRESETS['maid-atelier'],
    wallpaperType: 'image',
    defaultBlur: 6,
    defaultOcclusion: 32,
    colors: {
      background: '#0c1020',
      foreground: '#f1f5f9',
      card: '#141a33',
      cardForeground: '#ffffff',
      muted: '#1f2747',
      mutedForeground: '#cbd5e1',
      popover: '#18203d',
      popoverForeground: '#ffffff',
      primary: '#c5a468',
      primaryForeground: '#1a1405',
      secondary: '#283256',
      secondaryForeground: '#f8fafc',
      accent: '#eab308',
      accentForeground: '#000000',
      border: '#3b3a58',
      input: '#1a2244',
      ring: '#c5a468',
      userBubble: '#242b4d'
    },
    darkColors: {
      background: '#070a14',
      foreground: '#e2e8f0',
      card: '#0f1428',
      cardForeground: '#ffffff',
      muted: '#181e36',
      mutedForeground: '#94a3b8',
      popover: '#131830',
      popoverForeground: '#ffffff',
      primary: '#c5a468',
      primaryForeground: '#1a1405',
      secondary: '#1f2644',
      secondaryForeground: '#f1f5f9',
      accent: '#d4af37',
      accentForeground: '#000000',
      border: '#2d334d',
      input: '#141a33',
      ring: '#c5a468',
      userBubble: '#1b223d'
    },
    customCSS: `
      [data-hermes-skins-active="true"] button:focus-visible {
        outline-color: #c5a468 !important;
      }
    `
  },
  {
    id: 'cyberpunk-neon',
    name: '霓虹赛博 2077',
    nameEn: 'Cyberpunk Neon',
    author: 'Hermes Skin Lab',
    tagline: '电光青蓝与霓虹粉 · 暗夜科技流光 · 高对比度',
    description: '纯粹的夜之城科技美学。深黑底色配合高对比度电光青色与粉紫霓虹，代码与指令流光溢彩，为黑客与极客打造。',
    tags: ['cyber', 'dark'],
    accent: '#00f0ff',
    wallpaper: WALLPAPER_PRESETS['cyberpunk-neon'],
    wallpaperType: 'image',
    defaultBlur: 3,
    defaultOcclusion: 30,
    colors: {
      background: '#06040a',
      foreground: '#00f0ff',
      card: '#0f091a',
      cardForeground: '#f8fafc',
      muted: '#1f1133',
      mutedForeground: '#a855f7',
      popover: '#160c26',
      popoverForeground: '#ffffff',
      primary: '#00f0ff',
      primaryForeground: '#05030a',
      secondary: '#2d1247',
      secondaryForeground: '#ff007f',
      accent: '#ff007f',
      accentForeground: '#ffffff',
      border: '#3c1860',
      input: '#160c26',
      ring: '#00f0ff',
      userBubble: '#240d3d'
    },
    darkColors: {
      background: '#040207',
      foreground: '#00f0ff',
      card: '#0b0614',
      cardForeground: '#f8fafc',
      muted: '#170c26',
      mutedForeground: '#9333ea',
      popover: '#10081d',
      popoverForeground: '#ffffff',
      primary: '#00f0ff',
      primaryForeground: '#05030a',
      secondary: '#220d36',
      secondaryForeground: '#ff007f',
      accent: '#ff007f',
      accentForeground: '#ffffff',
      border: '#2c1047',
      input: '#10081d',
      ring: '#00f0ff',
      userBubble: '#1b092e'
    },
    customCSS: `
      [data-hermes-skins-active="true"] [data-slot="composer-rich-input"] {
        box-shadow: 0 0 12px rgba(0, 240, 255, 0.25) !important;
      }
    `
  },
  {
    id: 'forest-obsidian',
    name: '黑曜翡翠',
    nameEn: 'Forest Obsidian',
    author: 'Hermes Skin Lab',
    tagline: '静谧幽邃暗森林 · 松石翠绿强调色 · 沉浸护眼',
    description: '深邃沉稳的暗夜森林调色，搭配清润柔和的翡翠绿光。长时间阅读与编码极度护眼舒适，静心凝神。',
    tags: ['dark', 'art'],
    accent: '#10b981',
    wallpaper: WALLPAPER_PRESETS['forest-obsidian'],
    wallpaperType: 'image',
    defaultBlur: 4,
    defaultOcclusion: 30,
    colors: {
      background: '#050e0a',
      foreground: '#ecfdf5',
      card: '#0b1b14',
      cardForeground: '#f0fdf4',
      muted: '#132820',
      mutedForeground: '#6ee7b7',
      popover: '#0e231a',
      popoverForeground: '#f0fdf4',
      primary: '#10b981',
      primaryForeground: '#022c22',
      secondary: '#19392c',
      secondaryForeground: '#a7f3d0',
      accent: '#34d399',
      accentForeground: '#064e3b',
      border: '#1f4838',
      input: '#0e231a',
      ring: '#10b981',
      userBubble: '#153327'
    },
    darkColors: {
      background: '#030806',
      foreground: '#ecfdf5',
      card: '#071510',
      cardForeground: '#f0fdf4',
      muted: '#0e2019',
      mutedForeground: '#34d399',
      popover: '#0a1b14',
      popoverForeground: '#f0fdf4',
      primary: '#10b981',
      primaryForeground: '#022c22',
      secondary: '#132e23',
      secondaryForeground: '#6ee7b7',
      accent: '#059669',
      accentForeground: '#ffffff',
      border: '#17392c',
      input: '#0a1b14',
      ring: '#10b981',
      userBubble: '#0f271e'
    },
    customCSS: `
      [data-hermes-skins-active="true"] .text-accent {
        color: #10b981 !important;
      }
    `
  },
  {
    id: 'sakura-breeze',
    name: '落樱浅风',
    nameEn: 'Sakura Breeze',
    author: 'Hermes Skin Lab',
    tagline: '温润粉白日式美学 · 樱花落雪 · 清新明丽',
    description: '雅致明快的浅色主题。樱花粉点缀温润米白，面板温润如玉，适合喜爱明朗轻盈界面的创作者。',
    tags: ['light', 'art'],
    accent: '#ec4899',
    wallpaper: WALLPAPER_PRESETS['sakura-breeze'],
    wallpaperType: 'image',
    defaultBlur: 6,
    defaultOcclusion: 15,
    colors: {
      background: '#fdf2f8',
      foreground: '#831843',
      card: '#ffffff',
      cardForeground: '#500724',
      muted: '#fce7f3',
      mutedForeground: '#9d174d',
      popover: '#ffffff',
      popoverForeground: '#500724',
      primary: '#ec4899',
      primaryForeground: '#ffffff',
      secondary: '#fbcfe8',
      secondaryForeground: '#700730',
      accent: '#f43f5e',
      accentForeground: '#ffffff',
      border: '#f472b6',
      input: '#fdf2f8',
      ring: '#ec4899',
      userBubble: '#fce7f3'
    },
    darkColors: {
      background: '#1f0d18',
      foreground: '#fce7f3',
      card: '#2c1322',
      cardForeground: '#ffffff',
      muted: '#3b1c30',
      mutedForeground: '#f472b6',
      popover: '#331627',
      popoverForeground: '#ffffff',
      primary: '#f472b6',
      primaryForeground: '#3d0a25',
      secondary: '#4d203e',
      secondaryForeground: '#fbcfe8',
      accent: '#fb7185',
      accentForeground: '#4c0519',
      border: '#5c274a',
      input: '#331627',
      ring: '#f472b6',
      userBubble: '#401933'
    },
    customCSS: `
      [data-hermes-skins-active="true"] [data-slot="sidebar-wrapper"] {
        background-color: rgba(253, 242, 248, 0.75) !important;
      }
    `
  }
]

// ─── Submodule: Backdrop Manager ──────────────────────────────
const ROOT_ID = 'hermes-skins-backdrop-root'

function normalizeMediaSource(input, type = 'image') {
  if (typeof input !== 'string' || !input.trim()) return null
  const source = input.trim()
  if (/^https?:\/\//i.test(source)) return source
  if (type === 'image' && /^data:image\/(svg\+xml|png|jpeg|webp);/i.test(source)) return source
  if (type === 'video' && /^hermes-media:\/\/stream\/[^\s?#]+$/i.test(source)) return source
  if (/^file:\/\/\//i.test(source)) return source
  if (/^[a-zA-Z]:[\\/]/.test(source)) {
    const normalized = source.replace(/\\/g, '/')
    if (type === 'video') return `hermes-media://stream/${encodeURIComponent(source)}`
    return `file:///${normalized.split('/').map((part, index) => index === 0 ? part : encodeURIComponent(part)).join('/')}`
  }
  return null
}

/** Fixed backdrop sits behind the app shell and never receives input. */
class BackdropManager {
  constructor() {
    this.root = null
    this.media = null
    this.mask = null
    this.currentKey = null
    this.failedKeys = new Set()
    this.onVisibilityChange = null
    this.sceneIframe = null
    this.sceneManifest = null
    this.sceneUrls = []
    this.sceneListeners = false
    this.videoElement = null
    this.pauseOnHidden = true
    this.fitValue = 'cover'
    this.modeValue = 'live'
    this.soundValue = false
    this.volumeValue = 100
    this.handleSceneMessage = event => {
      if (event.source !== this.sceneIframe?.contentWindow || event.data?.type !== 'dsh-scene-needs-reload') return
      this.sceneIframe.srcdoc = scenePlayerHtml(this.soundValue, this.volumeValue)
    }
    this.handleVisibility = () => {
      if (this.videoElement && this.pauseOnHidden) {
        if (document.hidden) this.videoElement.pause()
        else void this.videoElement.play()?.catch(() => {})
      }
      this.sceneIframe?.contentWindow?.postMessage({ type: 'dsh-set-pause', paused: document.hidden && this.pauseOnHidden }, '*')
    }
  }

  ensureElements() {
    if (typeof document === 'undefined' || !document.body) return
    if (this.root?.isConnected) return
    this.root = document.getElementById(ROOT_ID) || document.createElement('div')
    this.currentKey = null
    this.root.id = ROOT_ID
    this.root.setAttribute('aria-hidden', 'true')
    this.root.style.cssText = 'position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;'
    this.media = document.createElement('div')
    this.media.style.cssText = 'position:absolute;background-size:cover;background-position:center;background-repeat:no-repeat;'
    this.mask = document.createElement('div')
    this.mask.style.cssText = 'position:absolute;inset:0;'
    this.root.replaceChildren(this.media, this.mask)
    document.body.prepend(this.root)
  }

  update({ enabled, type = 'image', src, sceneFrame = null, webPreview = null, blur = 0, occlusion = 35,
    isDark = true, mode = 'live', fit = 'cover', opacity = 100, pauseOnHidden = true, sound = false, volume = 100 }) {
    const safeSource = enabled && type === 'scene' && /^[a-zA-Z]:[\\/]/.test(src)
      ? src : (enabled ? normalizeMediaSource(src, type) : null)
    if (!safeSource) {
      this.hide()
      return false
    }
    const key = `${type}:${safeSource}:${mode === 'frame' ? 'frame' : 'live'}`
    if (this.failedKeys.has(key)) {
      this.hide()
      return false
    }
    this.ensureElements()
    if (!this.root) return false
    this.root.style.display = 'block'
    // The full contract range lives in config.js; only non-finite junk is
    // coerced here. A legal 0 (no blur, fully transparent, silent) passes
    // through untouched.
    const blurValue = Number.isFinite(Number(blur)) ? Math.min(60, Math.max(0, Number(blur))) : 0
    this.media.style.filter = blurValue > 0 ? `blur(${blurValue}px)` : 'none'
    // Overscan the media box by the blur radius: gaussian sampling beyond the
    // element edge would otherwise fade to the backdrop's absence (a white or
    // theme-colored rim at large blurs). The mask keeps the viewport bounds.
    this.media.style.inset = `-${blurValue + 8}px`
    this.media.style.opacity = `${(Number.isFinite(Number(opacity)) ? Math.min(100, Math.max(0, Number(opacity))) : 100) / 100}`
    this.fitValue = ['cover', 'contain', 'fill'].includes(fit) ? fit : 'cover'
    this.modeValue = mode === 'frame' ? 'frame' : 'live'
    this.pauseOnHidden = Boolean(pauseOnHidden)
    this.soundValue = Boolean(sound)
    this.volumeValue = Number.isFinite(Number(volume)) ? Math.min(100, Math.max(0, Number(volume))) : 100
    // Endpoint honesty: occlusion 100 = the veil fully hides the wallpaper.
    // The old Math.min(0.9, …) ceiling is gone — 1.0 is a legal, reachable end.
    const alpha = (Number.isFinite(Number(occlusion)) ? Math.min(100, Math.max(0, Number(occlusion))) : 35) / 100
    this.mask.style.backgroundColor = isDark ? `rgba(0,0,0,${alpha})` : `rgba(255,255,255,${alpha})`
    if (key === this.currentKey) {
      this.syncMediaOptions(type, { fit: this.fitValue, sound, volume, pauseOnHidden })
      return true
    }
    this.currentKey = key
    this.releaseSceneUrls()
    this.sceneIframe = null
    this.sceneManifest = null
    this.media.replaceChildren()
    this.media.style.backgroundImage = 'none'
    if (type === 'scene') {
      if (sceneFrame) this.showSceneFrame(sceneFrame, key, this.modeValue === 'frame')
      if (this.modeValue === 'live') void this.showScene(key, safeSource)
    } else if (type === 'web') {
      if (webPreview) this.showSceneFrame(webPreview, key, this.modeValue === 'frame')
      if (this.modeValue === 'live') void this.showWeb(key, safeSource, src)
    } else if (type === 'video') {
      const video = document.createElement('video')
      video.onerror = () => this.fail(key)
      video.src = safeSource
      video.autoplay = true
      video.loop = true
      video.muted = !sound
      video.volume = this.volumeValue / 100
      video.playsInline = true
      video.style.cssText = `width:100%;height:100%;object-fit:${this.fitValue};display:block;`
      this.videoElement = video
      this.ensurePlaybackListeners()
      if (this.modeValue === 'frame') {
        video.addEventListener('loadeddata', () => {
          try {
            const canvas = document.createElement('canvas')
            const scale = Math.min(1, 1920 / Math.max(video.videoWidth, video.videoHeight))
            canvas.width = Math.max(1, Math.round(video.videoWidth * scale))
            canvas.height = Math.max(1, Math.round(video.videoHeight * scale))
            canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height)
            const image = document.createElement('img')
            image.src = canvas.toDataURL('image/jpeg', 0.9)
            image.style.cssText = `width:100%;height:100%;object-fit:${this.fitValue};display:block;`
            if (this.currentKey === key) this.media.replaceChildren(image)
          } catch { /* The live video remains visible if capture is blocked by CORS. */ }
          finally { video.pause(); this.videoElement = null }
        }, { once: true })
      }
      this.media.appendChild(video)
      video.play().catch(() => this.fail(key))
    } else {
      const image = document.createElement('img')
      image.alt = ''
      let triedBridge = false
      image.onerror = async () => {
        const local = /^[a-zA-Z]:[\\/]/.test(src) || /^file:\/\/\//i.test(src)
        const bridge = typeof window !== 'undefined' ? window.hermesDesktop : null
        if (!triedBridge && local && bridge?.readFileDataUrl) {
          triedBridge = true
          try {
            const data = await bridge.readFileDataUrl(src)
            if (this.currentKey !== key) return
            if (typeof data === 'string' && data.startsWith('data:image/')) {
              image.src = data
              return
            }
          } catch { /* Invalid or oversized local image. */ }
        }
        this.fail(key)
      }
      image.src = safeSource
      image.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;'
      this.media.appendChild(image)
    }
    return true
  }

  syncMediaOptions(type, options) {
    const video = this.media?.querySelector('video')
    if (video) {
      video.style.objectFit = options.fit
      video.muted = !options.sound
      video.volume = (Number.isFinite(Number(options.volume)) ? Math.min(100, Math.max(0, Number(options.volume))) : 100) / 100
      this.handleVisibility()
    }
    if (type === 'scene') {
      this.sceneIframe?.contentWindow?.postMessage({ type: 'dsh-set-fit', fit: options.fit }, '*')
      this.sceneIframe?.contentWindow?.postMessage({
        type: 'dsh-set-pause', paused: document.hidden && options.pauseOnHidden
      }, '*')
      this.sceneIframe?.contentWindow?.postMessage({
        type: 'dsh-set-audio', sound: options.sound, volume: options.volume
      }, '*')
    }
    const frame = this.media?.querySelector('iframe')
    if (frame && type === 'web') frame.style.objectFit = options.fit
  }

  showSceneFrame(framePath, key, freeze = false) {
    const image = document.createElement('img')
    image.alt = ''
    image.style.cssText = `position:absolute;inset:0;width:100%;height:100%;object-fit:${this.fitValue};display:block;`
    if (freeze) image.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = Math.max(1, image.naturalWidth)
        canvas.height = Math.max(1, image.naturalHeight)
        canvas.getContext('2d')?.drawImage(image, 0, 0)
        image.src = canvas.toDataURL('image/png')
        image.onload = null
      } catch { /* Keep the source preview as a fallback. */ }
    }
    const bridge = typeof window !== 'undefined' ? window.hermesDesktop : null
    const load = async () => {
      try {
        const data = await bridge.readFileDataUrl(framePath)
        if (this.currentKey === key) image.src = data
      } catch {
        try {
          const data = await bridge.readFileDataUrlForAttach?.(framePath)
          if (this.currentKey === key && data) image.src = data
        } catch { /* Live scene may still load without a backing frame. */ }
      }
    }
    if (bridge?.readFileDataUrl) void load()
    this.media.appendChild(image)
  }

  async showScene(key, manifestPath) {
    const bridge = typeof window !== 'undefined' ? window.hermesDesktop : null
    try {
      const scene = await loadSceneManifest(bridge, manifestPath)
      if (this.currentKey !== key) {
        scene.objectUrls.forEach(url => URL.revokeObjectURL(url))
        return
      }
      const frame = document.createElement('iframe')
      // The srcdoc contains only the vendored player code. Shared origin lets
      // its WebGL video textures consume the parent's Blob URLs safely.
      frame.setAttribute('sandbox', 'allow-scripts allow-same-origin')
      frame.setAttribute('aria-hidden', 'true')
      frame.style.cssText = `position:absolute;inset:0;width:100%;height:100%;border:0;pointer-events:none;object-fit:${this.fitValue};`
      frame.onload = () => {
        frame.contentWindow?.postMessage({ type: 'hermes-scene-manifest', manifest: scene.manifest }, '*')
        frame.contentWindow?.postMessage({ type: 'dsh-set-fit', fit: this.fitValue }, '*')
        frame.contentWindow?.postMessage({ type: 'dsh-set-pause', paused: document.hidden && this.pauseOnHidden }, '*')
      }
      this.sceneIframe = frame
      this.sceneManifest = scene.manifest
      this.sceneUrls = scene.objectUrls
      if (!this.sceneListeners) {
        this.ensurePlaybackListeners()
      }
      frame.srcdoc = scenePlayerHtml(this.soundValue, this.volumeValue)
      this.media.appendChild(frame)
      this.onVisibilityChange?.()
    } catch {
      // A decoded full-resolution frame remains visible if the WebGL scene
      // cannot be prepared by this Hermes build.
      if (this.currentKey === key && !this.media.querySelector('img')) this.fail(key)
    }
  }

  ensurePlaybackListeners() {
    if (this.sceneListeners || typeof window === 'undefined') return
    window.addEventListener('message', this.handleSceneMessage)
    document.addEventListener('visibilitychange', this.handleVisibility)
    this.sceneListeners = true
  }

  async showWeb(key, fileUrl, sourcePath) {
    const bridge = typeof window !== 'undefined' ? window.hermesDesktop : null
    try {
      const html = await loadWebWallpaper(bridge, sourcePath)
      if (this.currentKey !== key) return
      const frame = document.createElement('iframe')
      frame.setAttribute('sandbox', 'allow-scripts')
      frame.setAttribute('aria-hidden', 'true')
      frame.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0;pointer-events:none;'
      frame.style.objectFit = this.fitValue
      frame.srcdoc = html
      this.media.appendChild(frame)
    } catch {
      if (this.currentKey === key && !this.media.querySelector('img')) this.fail(key)
    }
  }

  fail(key) {
    if (this.currentKey !== key) return
    this.failedKeys.add(key)
    this.hide()
    this.onVisibilityChange?.()
  }

  hide() {
    if (this.root) this.root.style.display = 'none'
    const video = this.media?.querySelector('video')
    if (video) video.pause()
    this.videoElement = null
    this.media?.replaceChildren()
    if (this.media) this.media.style.backgroundImage = 'none'
    this.currentKey = null
    this.sceneIframe = null
    this.sceneManifest = null
    this.releaseSceneUrls()
  }

  releaseSceneUrls() {
    this.sceneUrls.forEach(url => URL.revokeObjectURL(url))
    this.sceneUrls = []
  }

  destroy() {
    this.hide()
    this.root?.remove()
    this.root = null
    this.media = null
    this.mask = null
    this.currentKey = null
    this.failedKeys.clear()
    if (this.sceneListeners) {
      window.removeEventListener('message', this.handleSceneMessage)
      document.removeEventListener('visibilitychange', this.handleVisibility)
      this.sceneListeners = false
    }
  }
}

// ─── Submodule: Glass Controller ──────────────────────────────
/** Only changes the shell surfaces needed to show a wallpaper. */
const STYLE_ID = 'hermes-skins-runtime-css'
// PaneBody is the first structural painter in the current Hermes layout.
// Sidebar, conversation and file views mount INSIDE it rather than beside it.
const PANE_SURFACE = '[class*="bg-(--ui-editor-surface-background)"]'
const NESTED_SURFACES = ':is([data-chat-surface], [data-slot="sidebar"], [data-panel-header], [class*="bg-(--ui-editor-surface-background)"], [class*="bg-(--ui-sidebar-surface-background)"], [class*="bg-(--ui-chat-surface-background)"])'
const PROTECTED_SURFACES = ':not(:where([data-glass-opaque], [data-glass-opaque] *, [data-glass-raised], [data-glass-raised] *, [data-overlay-surface], [data-overlay-surface] *, [data-floating-pane], [data-floating-pane] *, [data-remote-screen], [data-remote-screen] *, [data-radix-popper-content-wrapper] *, [role="dialog"], [role="dialog"] *, [role="menu"], [role="menu"] *, [role="listbox"], [role="listbox"] *))'
const FLOATING_SURFACES = ':is([data-slot="dropdown-menu-content"], [data-slot="dropdown-menu-sub-content"], [data-slot="context-menu-content"], [data-slot="context-menu-sub-content"], [data-slot="select-content"], [data-slot="popover-content"], [data-slot="dialog-content"], [data-slot="alert-dialog-content"], [data-slot="sheet-content"], [data-slot="tooltip-content"], .tooltip-bubble, [role="menu"], [role="listbox"])'

/**
 * xterm's own color parser (css.toColor) only accepts hex and comma-form
 * rgba() for translucent colors; a color-mix() chain serializes as
 * "color(srgb … / a)", which falls through to the silent #000000 fallback and
 * paints the WebGL canvas pitch black. Structural tints stay CSS color-mix
 * chains, but the terminal surface — the one value a canvas reads back as a
 * string — must be resolved here into a literal.
 */
function parseSerializedColor(text) {
  if (typeof text !== 'string') return null
  let match = text.match(/^color\((?:srgb|srgb-linear) ([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?\)$/)
  if (match) {
    const channel = value => Math.round(Number(value) * 255)
    return {
      r: channel(match[1]), g: channel(match[2]), b: channel(match[3]),
      a: match[4] === undefined ? 1 : Number(match[4])
    }
  }
  match = text.match(/^rgba?\(([\d.]+),?\s*([\d.]+),?\s*([\d.]+)(?:\s*[,/]\s*([\d.]+))?\)$/)
  if (match) {
    return {
      r: Math.round(Number(match[1])), g: Math.round(Number(match[2])), b: Math.round(Number(match[3])),
      a: match[4] === undefined ? 1 : Number(match[4])
    }
  }
  match = text.match(/^#([0-9a-f]{6})$/i)
  if (match) {
    const value = parseInt(match[1], 16)
    return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255, a: 1 }
  }
  return null
}

class GlassController {
  constructor() {
    this.styleEl = null
    this.refitObserver = null
    this.refitTargets = new Set()
    this.refitQueued = false
  }

  update({ enabled, glassTransparency = 10, bubbleOpacity = 100, composerFrost = 10, surfaceFrost = 8 }) {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    if (!enabled) {
      root.removeAttribute('data-hermes-skins-active')
      const styleEl = this.styleEl || document.getElementById(STYLE_ID)
      styleEl?.remove()
      this.styleEl = null
      this.releaseRefitWatcher()
      return
    }
    if (!this.styleEl || !document.head.contains(this.styleEl)) {
      this.styleEl = document.getElementById(STYLE_ID) || document.createElement('style')
      this.styleEl.id = STYLE_ID
      this.styleEl.dataset.plugin = 'hermes-skins'
      if (!this.styleEl.isConnected) document.head.appendChild(this.styleEl)
    }

    // Material contract (see src/engine/config.js PARAM_RANGES): one lever,
    // one keep value, everywhere. No hidden floors or ceilings — panelGlass 0
    // paints the panels in their full theme fill, panelGlass 100 leaves the
    // structural fills fully transparent.
    const pct = (value, fallback) => {
      const n = Number(value)
      return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : fallback
    }
    const keep = 100 - pct(glassTransparency, 10)
    // Floating text sits over other text, so it retains a readable veil while
    // still revealing the wallpaper. It follows the main lever above 70% fill.
    const floatingKeep = Math.max(keep, 70)
    const bubbleKeep = pct(bubbleOpacity, 100)
    const composerBlur = Math.min(20, Math.max(0, pct(composerFrost, 10)))
    const surfaceBlur = Math.min(20, Math.max(0, pct(surfaceFrost, 8)))

    // Frosted glass samples the wallpaper behind a surface; blur(0) would still
    // promote a composited layer, so the frost vars stay `none` when off.
    const frost = surfaceBlur > 0 ? `blur(${surfaceBlur}px)` : 'none'
    const composerFrostCss = composerBlur > 0 ? `blur(${composerBlur}px)` : 'none'

    // Terminal: xterm resolves --ui-terminal-surface-background to a concrete
    // color for its WebGL canvas, and the persistent host paints the same var
    // inline. With the host default (allowTransparency: false) an alpha color
    // would paint opaque glyph-cell plates over a translucent viewport, so the
    // var is pinned to the opaque chrome mix (the host's own glass mode does
    // exactly this) and the terminal reads solid — no fake blend-mode
    // transparency. Hosts patched by patches/hermes-desktop-terminal-alpha.patch
    // advertise via the data-hermes-terminal-alpha attribute and get a real
    // translucent mix. That mix must be a comma-form rgba() literal resolved
    // through a live probe: the raw color-mix chain would reach xterm as
    // "color(srgb …)" and paint the canvas black, and probing --ui-bg-chrome
    // keeps the value tracking the official light/dark mode on every sync.
    const terminalAlpha = root.dataset?.hermesTerminalAlpha === 'true'
    let terminalSurface = 'var(--ui-bg-chrome)'
    if (terminalAlpha && document.body) {
      const probe = document.createElement('span')
      probe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;background-color:var(--ui-bg-chrome);'
      document.body.appendChild(probe)
      const base = parseSerializedColor(getComputedStyle(probe).backgroundColor)
      probe.remove()
      if (base) terminalSurface = `rgba(${base.r}, ${base.g}, ${base.b}, ${keep / 100})`
    }

    root.setAttribute('data-hermes-skins-active', 'true')
    this.styleEl.textContent = `
      :root[data-hermes-skins-active="true"] {
        --hermes-skins-keep: ${keep}%;
        --hermes-skins-chrome-tint: color-mix(in srgb, var(--ui-bg-chrome) var(--hermes-skins-keep), transparent);
        --hermes-skins-sidebar-tint: var(--hermes-skins-chrome-tint);
        --hermes-skins-editor-tint: var(--hermes-skins-chrome-tint);
        --hermes-skins-floating-tint: color-mix(in srgb, var(--ui-bg-chrome) ${floatingKeep}%, transparent);
        --hermes-skins-frost: ${frost};
        --hermes-skins-composer-frost: ${composerFrostCss};
        /* Bubble fill share. !important is required to outrank the host's own
           bubble-transparency lever, which publishes the same custom property
           as an inline style on <html>; while a wallpaper is showing this
           plugin's 0-100 lever is authoritative, and removing it (disable or
           unload) hands control straight back. 0% keeps only the text. */
        --user-bubble-keep: ${bubbleKeep}% !important;
        --ui-chat-surface-background: var(--hermes-skins-chrome-tint);
        --ui-sidebar-surface-background: var(--hermes-skins-sidebar-tint);
        --ui-editor-surface-background: var(--hermes-skins-editor-tint);
        /* --ui-bg-editor feeds --dt-card, which paints every bg-card surface
           (markdown code cards, file cards, the composer backing's stock
           fill). Left opaque it reads as solid white/black plates floating on
           the glass; routed through the editor tint it joins the one material.
           Floating interaction layers use a stronger translucent veil through
           their own token so they keep their content hierarchy. */
        --ui-bg-editor: var(--hermes-skins-editor-tint);
        --ui-bg-elevated: var(--hermes-skins-floating-tint);
        --dt-popover: var(--hermes-skins-floating-tint);
        /* --dt-background paints bg-background — most visibly the active
           segment of every segmented control, whose full-opacity white/black
           pill is the harshest leftover plate on a glass page. */
        --dt-background: var(--hermes-skins-chrome-tint);
        --ui-terminal-surface-background: ${terminalSurface};
      }
      /* The wallpaper is a fixed child of body. The host also paints body with
         the chat token, then paints the chat/sidebars again. That makes a 55%
         panel behave like two 45% veils (about 70% fill). Keep body clear and
         let each actual surface own exactly one tint. */
      :root[data-hermes-skins-active="true"] body {
        background: transparent !important;
      }
      /* Surfaces that mask sibling content keep their real paint (host
         contract — a see-through mask reads as text bleeding through text). */
      :root[data-hermes-skins-active="true"] [data-glass-opaque] {
        --ui-chat-surface-background: var(--ui-bg-chrome);
        --ui-editor-surface-background: var(--ui-bg-chrome);
        --ui-sidebar-surface-background: var(--ui-bg-sidebar);
        --ui-bg-editor: var(--ui-bg-chrome);
        --dt-background: var(--ui-bg-chrome);
      }
      /* The full-window painters between <body> and every surface step aside
         so the wallpaper layer is the only backdrop. The shell also opts out
         of the shared frost below: it spans the whole window, and a
         backdrop-filter here would blur the wallpaper itself instead of a
         surface above it. !important — the shell paints the chrome token
         through the same utility class the frost rule matches on, and the
         two selectors tie at (0,3,0). */
      :root[data-hermes-skins-active="true"] [data-contrib-shell] {
        position: relative;
        z-index: 1;
        background-color: transparent !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
      }
      :root[data-hermes-skins-active="true"] [data-slot="sidebar-wrapper"] {
        background-color: transparent !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
      }
      /* ChatRuntimeBoundary's message viewport repeats the outer chat fill and
         spans the whole chat column: restating either tint or frost here would
         stack a second veil / blur over everything inside. */
      :root[data-hermes-skins-active="true"] [data-chat-surface] [data-slot="composer-bounds"] {
        background-color: transparent !important;
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
      }
      /* Shared frost: every surface that paints one of the structural tokens
         through a Tailwind utility gets exactly one blur. Covers the chat
         column, the right file/review columns, collapsed rails, pane headers
         and the status bar — the surfaces that used to frost only on some
         panes, which read as a different material on every region. None of
         them contain fixed-position descendants (verified against the running
         host: tooltips, popovers and floating composers portal out), so a
         backdrop-filter cannot re-anchor anything. bg-background surfaces
         (segmented-control active pills and friends) join the same treatment:
         a frosted pill keeps its selected-state affordance through the blur
         even at low keeps. */
      :root[data-hermes-skins-active="true"] [class*="bg-(--ui-sidebar-surface-background)"],
      :root[data-hermes-skins-active="true"] [class*="bg-(--ui-chat-surface-background)"],
      :root[data-hermes-skins-active="true"] [class*="bg-(--ui-editor-surface-background)"],
      :root[data-hermes-skins-active="true"] [class*="bg-(--ui-bg-chrome)"],
      :root[data-hermes-skins-active="true"] [class*="bg-background"] {
        backdrop-filter: var(--hermes-skins-frost);
        -webkit-backdrop-filter: var(--hermes-skins-frost);
      }
      /* Status bar chips (gateway status, session info) repaint the bar's own
         surface token on top of it — a 12% veil becomes ~23% patches inside
         the strip. The bar is the single fill; chips stay transparent. */
      :root[data-hermes-skins-active="true"] [data-slot="statusbar"] [class*="bg-(--ui-sidebar-surface-background)"],
      :root[data-hermes-skins-active="true"] [data-slot="statusbar"] [class*="bg-(--ui-bg-chrome)"] {
        background-color: transparent !important;
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
      }
      /* Structural panels that paint with opaque Tailwind utilities (bg-sidebar
         & co. resolve to fixed theme colors, not the surface tokens) need their
         fill restated. Everything routes through the same tint vars, so
         light/dark only changes the theme seed underneath. */
      :root[data-hermes-skins-active="true"] [data-slot="sidebar"] {
        background-color: var(--hermes-skins-sidebar-tint) !important;
        backdrop-filter: var(--hermes-skins-frost);
        -webkit-backdrop-filter: var(--hermes-skins-frost);
      }
      /* Frameless-window title bar: the popout shell declares --titlebar-height
         and its aria-hidden first child paints the opaque chrome strip. */
      :root[data-hermes-skins-active="true"] [data-contrib-shell][style*="--titlebar-height"] > div[aria-hidden="true"] {
        background-color: var(--hermes-skins-chrome-tint) !important;
        backdrop-filter: var(--hermes-skins-frost);
        -webkit-backdrop-filter: var(--hermes-skins-frost);
      }
      /* Token-painted structural surfaces (status bar, pane headers) restated
         for builds that paint them without the utility class; the frost is the
         shared one. Painting the tint twice on one box would stack two
         translucent fills, so these stay the only extra tint rules. */
      :root[data-hermes-skins-active="true"] [data-slot="statusbar"],
      :root[data-hermes-skins-active="true"] [data-panel-header] {
        /* Native Glass sidebar scope sets an opaque token on the footer.
           Override it locally as well as painting the outer surface, so
           descendants cannot inherit a different material. */
        --ui-sidebar-surface-background: var(--hermes-skins-sidebar-tint) !important;
        background-color: var(--hermes-skins-chrome-tint) !important;
        backdrop-filter: var(--hermes-skins-frost);
        -webkit-backdrop-filter: var(--hermes-skins-frost);
      }
      /* Pane tab strip: the pane header behind it is the single structural
         fill. The strip's own utility fill — and the inactive-tab fill it
         publishes through --pane-tab-strip-bg — would stack a second (active
         tabs a third) veil on the same box and read as a brighter, harder top
         bar. The active underline and hover darken stay as the affordances. */
      :root[data-hermes-skins-active="true"] [data-panel-header] [class*="group/pane-header"] {
        background-color: transparent !important;
        --pane-tab-strip-bg: transparent;
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
      }
      /* Plugin SDK cards use bg-card/bg-background, not Hermes' surface
         tokens. These are the large white plates visible in Skin Center.
         Scope the fix to our marked cards so other apps' readability is not
         changed; nested wallpaper thumbnails do not stack another veil. */
      :root[data-hermes-skins-active="true"] [data-hermes-skins-surface] {
        background-color: var(--hermes-skins-editor-tint) !important;
        backdrop-filter: var(--hermes-skins-frost);
        -webkit-backdrop-filter: var(--hermes-skins-frost);
      }
      :root[data-hermes-skins-active="true"] [data-hermes-skins-surface] [data-hermes-skins-surface] {
        background-color: transparent !important;
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
      }
      /* A plugin page already sits on the host's structural pane fill. Its
         cards and heading define groups through borders, not a second veil.
         Limit this to our page; raised menus and opaque masks keep their paint. */
      :root[data-hermes-skins-active="true"] [data-hermes-skins-page] [data-hermes-skins-surface],
      :root[data-hermes-skins-active="true"] [data-hermes-skins-page] > header,
      :root[data-hermes-skins-active="true"] [data-chat-surface] [data-panel-header],
      :root[data-hermes-skins-active="true"] [data-slot="sidebar"] [data-panel-header] {
        background-color: transparent !important;
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
      }
      /* A pane body already owns the tint. Clearing only plugin cards missed
         the real app: a conversation/sidebar inside PaneBody painted it again
         (20% + 20% = 36%), while the footer stayed at 20%. Apply the same rule
         to all structural descendants, including nested file views. Masks and
         raised/portaled interaction layers remain independent painters. */
      :root[data-hermes-skins-active="true"] ${PANE_SURFACE} ${NESTED_SURFACES}${PROTECTED_SURFACES} {
        background-color: transparent !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
      }
      /* Shared floating material: SDK menus use hard-coded 92/96% mixes and
         some status-bar panels use bg-popover. Restate the actual outer box,
         not just the token. Color-category chips, selection highlights and
         deliberate primary/accent surfaces keep their semantic colors. */
      :root[data-hermes-skins-active="true"] ${FLOATING_SURFACES}:not([class*="dt-primary-solid"], [class*="bg-black"]) {
        --popover-surface: var(--hermes-skins-floating-tint) !important;
        --dt-popover: var(--hermes-skins-floating-tint);
        --dt-muted-foreground: var(--ui-text-primary);
        background-color: var(--hermes-skins-floating-tint) !important;
        backdrop-filter: var(--hermes-skins-frost) !important;
        -webkit-backdrop-filter: var(--hermes-skins-frost) !important;
        color: var(--ui-text-primary) !important;
      }
      /* A nested cmdk list/card belongs to its popover; it must not paint a
         second veil. Arrow shapes still receive --popover-surface separately. */
      :root[data-hermes-skins-active="true"] ${FLOATING_SURFACES} :is([data-slot="command"], [class~="bg-popover"], [class~="bg-card"], [class~="bg-background"]):not(${FLOATING_SURFACES}) {
        background-color: transparent !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
      }
      :root[data-hermes-skins-active="true"] .tooltip-bubble [data-slot="tooltip-arrow"] {
        fill: var(--hermes-skins-floating-tint);
      }
      /* Terminal surfaces resolve through --ui-terminal-surface-background: the
         fixed persistent host paints it inline and the xterm canvas paints the
         resolved theme background, so the plugin never restates the fill here —
         only the shared frost. On unpatched hosts the var is opaque and the
         canvas is a solid plate; patched hosts get the translucent literal.
         Remote-screen sharing must keep its real paint. */
      :root[data-hermes-skins-active="true"] [data-persistent-terminal],
      :root[data-hermes-skins-active="true"] [data-terminal]:not([data-remote-screen]) {
        backdrop-filter: var(--hermes-skins-frost);
        -webkit-backdrop-filter: var(--hermes-skins-frost);
      }
      :root[data-hermes-skins-active="true"] [data-persistent-terminal] :is(.xterm, .xterm-screen, .xterm-viewport),
      :root[data-hermes-skins-active="true"] [data-terminal]:not([data-remote-screen]) :is(.xterm, .xterm-screen, .xterm-viewport) {
        background-color: transparent !important;
      }
      ${terminalAlpha ? `
      /* xterm's alpha canvas owns the tint. Its two outer wrappers must not
         paint the same tint again or a 45% fill becomes an 83% solid plate. */
      :root[data-hermes-skins-active="true"] [data-persistent-terminal],
      :root[data-hermes-skins-active="true"] [data-terminal]:not([data-remote-screen]) {
        background-color: transparent !important;
      }` : ''}
      /* Composer: the fill joins the structural keep (one lever), and the
         frost sits ON the composer surface itself — backdrop-filter never
         touches an element's own content, so placeholder and typed text stay
         sharp while the wallpaper shows through the blur. The previous fixed
         overlay layer competed in the root stacking context at a positive
         z-index and frosted the card and its text along with everything else;
         it is gone. The host composer has no fixed-position descendants
         (completion drawers are absolute, tooltips portal out), so the filter
         cannot re-anchor anything. */
      :root[data-hermes-skins-active="true"] [data-slot="composer-root"] {
        --composer-fill: color-mix(in srgb, var(--ui-bg-chrome) var(--hermes-skins-keep), transparent);
      }
      :root[data-hermes-skins-active="true"] [data-hud-shell] [data-slot="composer-root"] {
        /* HUD mode pins an opaque dock fill so its overlay bar and everything
           docked to it stay readable — keep the host's intent. */
        --composer-fill: var(--dt-card);
      }
      :root[data-hermes-skins-active="true"] [data-slot="composer-surface"] {
        backdrop-filter: var(--hermes-skins-composer-frost);
        -webkit-backdrop-filter: var(--hermes-skins-composer-frost);
      }
    `
    this.syncTerminalRefitWatcher()
  }

  /** xterm's WebGL canvas keeps its last fitted size; when a terminal pane
   *  grows (tab switch, split, window resize) the freshly exposed area shows
   *  raw wallpaper while the old canvas area keeps its tint — the split
   *  surface users report as a broken terminal. Nudge the host's resize
   *  handling whenever a terminal box actually changes size. The dispatch is
   *  debounced and ResizeObserver only fires on real size changes, so the
   *  loop terminates. */
  syncTerminalRefitWatcher() {
    if (typeof document === 'undefined' || typeof ResizeObserver !== 'function') return
    if (!this.refitObserver) {
      this.refitObserver = new ResizeObserver(() => this.queueRefitNudge())
    }
    const terminals = document.querySelectorAll('[data-terminal]:not([data-remote-screen]), [data-persistent-terminal]')
    const seen = new Set()
    for (const el of terminals) {
      seen.add(el)
      if (!this.refitTargets.has(el)) {
        this.refitTargets.add(el)
        this.refitObserver.observe(el)
      }
    }
    for (const el of [...this.refitTargets]) {
      if (!seen.has(el)) {
        this.refitTargets.delete(el)
        this.refitObserver.unobserve(el)
      }
    }
  }

  queueRefitNudge() {
    if (this.refitQueued) return
    this.refitQueued = true
    setTimeout(() => {
      this.refitQueued = false
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('resize'))
    }, 150)
  }

  releaseRefitWatcher() {
    this.refitObserver?.disconnect()
    this.refitObserver = null
    this.refitTargets.clear()
    this.refitQueued = false
  }

  destroy() {
    this.releaseRefitWatcher()
    this.update({ enabled: false })
  }
}

// ─── Submodule: Global Range Controller ──────────────────────
const RANGE_STYLE_ID = 'hermes-skins-range-css'
const RANGE_PROGRESS = '--hermes-range-progress'

/** Read the input's live property, not its sometimes stale value attribute. */
function rangeProgress(input) {
  const min = input.min === '' ? 0 : Number(input.min)
  const max = input.max === '' ? 100 : Number(input.max)
  const value = input.valueAsNumber
  if (![min, max, value].every(Number.isFinite) || max <= min) return 0
  return Math.min(100, Math.max(0, (value - min) / (max - min) * 100))
}

/** Global range painting has its own lifetime: it does not depend on wallpaper. */
class RangeController {
  constructor() {
    this.styleEl = null
    this.observer = null
    this.inputs = new Map()
    this.pending = new Set()
    this.queued = false
    this.active = false
    this.onInput = event => {
      if (event.target?.matches?.('input[type="range"]')) this.sync(event.target)
    }
  }

  start() {
    if (this.active || typeof document === 'undefined') return
    this.active = true
    this.styleEl = document.createElement('style')
    this.styleEl.id = RANGE_STYLE_ID
    this.styleEl.dataset.plugin = 'hermes-skins'
    this.styleEl.textContent = `
      :root input[type="range"] {
        --hermes-range-accent: var(--dt-primary-solid, var(--theme-primary, var(--ui-accent, #3b82f6)));
        --hermes-range-rest: color-mix(in srgb, var(--ui-bg-chrome, #fff) 80%, var(--ui-text-primary, #64748b));
        --hermes-range-direction: to right;
        appearance: none;
        -webkit-appearance: none;
        min-height: 1.25rem;
        padding: 0;
        border: 0;
        background: transparent !important;
        cursor: pointer;
        vertical-align: middle;
      }
      :root input[type="range"]:dir(rtl) {
        --hermes-range-direction: to left;
      }
      :root input[type="range"]::-webkit-slider-runnable-track {
        height: 0.375rem;
        border-radius: 9999px;
        background: linear-gradient(var(--hermes-range-direction),
          var(--hermes-range-accent) 0 var(--hermes-range-progress, 0%),
          var(--hermes-range-rest) var(--hermes-range-progress, 0%) 100%);
      }
      :root input[type="range"]::-webkit-slider-thumb {
        appearance: none;
        -webkit-appearance: none;
        width: 1rem;
        height: 1rem;
        margin-top: -0.3125rem;
        border-radius: 9999px;
        border: 2px solid var(--ui-bg-chrome, #fff);
        background: var(--hermes-range-accent);
        box-shadow: 0 0 0 1px color-mix(in srgb, var(--ui-text-primary, #64748b) 25%, transparent);
      }
      :root input[type="range"]::-moz-range-track {
        height: 0.375rem;
        border-radius: 9999px;
        background: var(--hermes-range-rest);
      }
      :root input[type="range"]::-moz-range-progress {
        height: 0.375rem;
        border-radius: 9999px;
        background: var(--hermes-range-accent);
      }
      :root input[type="range"]::-moz-range-thumb {
        width: 0.75rem;
        height: 0.75rem;
        border-radius: 9999px;
        border: 2px solid var(--ui-bg-chrome, #fff);
        background: var(--hermes-range-accent);
      }
      :root input[type="range"]:focus-visible {
        outline: 2px solid var(--hermes-range-accent);
        outline-offset: 3px;
        border-radius: 9999px;
      }
      :root input[type="range"]:disabled {
        --hermes-range-accent: color-mix(in srgb, var(--ui-text-primary, #64748b) 45%, var(--ui-bg-chrome, #fff));
        opacity: 0.55;
        cursor: not-allowed;
      }
    `
    document.head.appendChild(this.styleEl)
    this.scan(document)
    for (const event of ['input', 'change', 'focusin']) {
      document.addEventListener(event, this.onInput, true)
    }
    if (typeof MutationObserver === 'function') {
      this.observer = new MutationObserver(records => {
        for (const record of records) {
          if (record.type === 'attributes') this.pending.add(record.target)
          else {
            for (const node of record.addedNodes) this.pending.add(node)
            // Restore and release removed inputs; a node moved within the
            // document stays connected and keeps its original saved value.
            for (const node of record.removedNodes) this.pending.add(node)
          }
        }
        this.queueFlush()
      })
      // Our own style writes are deliberately excluded: they cannot feed a loop.
      this.observer.observe(document.documentElement, {
        subtree: true, childList: true, attributes: true,
        attributeFilter: ['type', 'value', 'min', 'max']
      })
    }
  }

  scan(node) {
    if (node.matches?.('input[type="range"]')) this.sync(node)
    for (const input of node.querySelectorAll?.('input[type="range"]') || []) this.sync(input)
  }

  sync(input) {
    if (!this.active || !input.isConnected) return
    if (!this.inputs.has(input)) {
      this.inputs.set(input, {
        value: input.style.getPropertyValue(RANGE_PROGRESS),
        priority: input.style.getPropertyPriority(RANGE_PROGRESS)
      })
    }
    const progress = `${Number(rangeProgress(input).toFixed(4))}%`
    if (input.style.getPropertyValue(RANGE_PROGRESS) !== progress) {
      input.style.setProperty(RANGE_PROGRESS, progress)
    }
  }

  queueFlush() {
    if (this.queued || !this.active) return
    this.queued = true
    queueMicrotask(() => {
      this.queued = false
      if (!this.active) return
      for (const node of this.pending) {
        if (node.isConnected) this.scan(node)
      }
      this.pending.clear()
      for (const input of this.inputs.keys()) {
        if (!input.isConnected || !input.matches('input[type="range"]')) this.restore(input)
      }
    })
  }

  restore(input) {
    const original = this.inputs.get(input)
    if (!original) return
    if (original.value) input.style.setProperty(RANGE_PROGRESS, original.value, original.priority)
    else input.style.removeProperty(RANGE_PROGRESS)
    this.inputs.delete(input)
  }

  destroy() {
    this.active = false
    this.observer?.disconnect()
    this.observer = null
    if (typeof document !== 'undefined') {
      for (const event of ['input', 'change', 'focusin']) {
        document.removeEventListener(event, this.onInput, true)
      }
    }
    for (const input of this.inputs.keys()) this.restore(input)
    this.pending.clear()
    this.queued = false
    this.styleEl?.remove()
    this.styleEl = null
  }
}

// ─── Submodule: Storage ───────────────────────────────────────
const DEFAULT_CONFIG = {
  schemaVersion: 4,
  activeSkinId: 'default',
  previousTheme: null,
  wallpaperEnabled: false,
  wallpaperType: 'image',
  wallpaperMode: 'live',
  wallpaperFit: 'cover',
  wallpaperSource: '',
  wallpaperBlur: 0,
  maskOcclusion: 35,
  wallpaperOpacity: 100,
  pauseOnHidden: true,
  wallpaperSound: false,
  wallpaperVolume: 100,
  panelGlass: 10,
  bubbleOpacity: 55,
  composerFrost: 10,
  surfaceFrost: 8,
  weRoots: [],
  weSelection: null,
  customSkins: []
}

/**
 * The single parameter contract. UI sliders, normalization, rendering and the
 * i18n copy all read these ranges — no other file may clamp a stored value.
 *
 * Percent fields are true 0-100 levers with exact endpoint semantics:
 *   maskOcclusion 100 = the veil fully hides the wallpaper (DSH's own UI caps
 *     the same lever at 90; user request for Hermes is 100, so the endpoint is
 *     real, not a re-clamped 0.9 alpha),
 *   wallpaperOpacity 0 = the wallpaper media is invisible,
 *   panelGlass 100 = structural panel fills fully transparent,
 *   bubbleOpacity 0 = bubble fill transparent while text keeps its own opacity,
 *   wallpaperVolume 0 = silent.
 * Pixel fields follow the dsh-skins reference (commit 82f42bd3):
 *   wallpaperBlur = DSH wallpaperBlur (media layer, 0-60px, default 0),
 *   composerFrost = DSH inputCardBlur (composer card, 0-20px, default 10).
 * surfaceFrost is a Hermes extension: frosted blur behind the structural
 * panels (title bar, sidebars, panel headers, status bar, terminal). DSH has
 * no identical field — its closest relatives are the per-state backdrop blurs,
 * which this plugin does not expose as separate levers.
 */
const PARAM_RANGES = {
  wallpaperBlur: { min: 0, max: 60, unit: 'px' },
  maskOcclusion: { min: 0, max: 100, unit: '%' },
  wallpaperOpacity: { min: 0, max: 100, unit: '%' },
  panelGlass: { min: 0, max: 100, unit: '%' },
  bubbleOpacity: { min: 0, max: 100, unit: '%' },
  composerFrost: { min: 0, max: 20, unit: 'px' },
  surfaceFrost: { min: 0, max: 20, unit: 'px' },
  wallpaperVolume: { min: 0, max: 100, unit: '%' }
}

/** Clamp one contract field. A missing/NaN field falls back to its default;
 *  a legal 0 (or any endpoint) is stored as 0, never mistaken for "unset". */
function paramInRange(key, value) {
  const range = PARAM_RANGES[key]
  if (!range) throw new Error(`Unknown parameter: ${key}`)
  if (!Number.isFinite(value)) return DEFAULT_CONFIG[key]
  return Math.min(range.max, Math.max(range.min, value))
}

const validPalette = colors => colors && typeof colors === 'object' &&
  ['background', 'foreground', 'primary'].every(key => /^#[0-9a-f]{6}$/i.test(colors[key] || '')) &&
  Object.values(colors).every(value => typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value))

const validCustomSkin = skin => skin && typeof skin.id === 'string' && /^custom-[\w-]+$/.test(skin.id) &&
  typeof skin.name === 'string' && skin.name.length > 0 && skin.name.length <= 80 &&
  validPalette(skin.colors) && (!skin.darkColors || validPalette(skin.darkColors))

function normalizeConfig(value) {
  const raw = value && typeof value === 'object' && !Array.isArray(value) ? value : {}
  // Schema 3 shipped bubbleOpacity default 100 — "keep the stock bubble fill",
  // which over a wallpaper reads as the solid white/black plates users report
  // as a bug. v4 moves the untouched default to a glassy 55; a 100 stored on
  // schema 4+ is a deliberate user choice and stays.
  const legacyBubbleDefault = (raw.schemaVersion ?? 3) < 4 && raw.bubbleOpacity === 100
  return {
    schemaVersion: 4,
    activeSkinId: typeof raw.activeSkinId === 'string' ? raw.activeSkinId : DEFAULT_CONFIG.activeSkinId,
    previousTheme: typeof raw.previousTheme === 'string' ? raw.previousTheme : null,
    wallpaperEnabled: typeof raw.wallpaperEnabled === 'boolean' ? raw.wallpaperEnabled : DEFAULT_CONFIG.wallpaperEnabled,
    wallpaperType: ['video', 'scene', 'web'].includes(raw.wallpaperType) ? raw.wallpaperType : 'image',
    wallpaperMode: raw.wallpaperMode === 'frame' ? 'frame' : 'live',
    wallpaperFit: ['cover', 'contain', 'fill'].includes(raw.wallpaperFit) ? raw.wallpaperFit : 'cover',
    wallpaperSource: typeof raw.wallpaperSource === 'string' ? raw.wallpaperSource.slice(0, 16384) : '',
    wallpaperBlur: paramInRange('wallpaperBlur', raw.wallpaperBlur),
    maskOcclusion: paramInRange('maskOcclusion', raw.maskOcclusion),
    wallpaperOpacity: paramInRange('wallpaperOpacity', raw.wallpaperOpacity),
    pauseOnHidden: typeof raw.pauseOnHidden === 'boolean' ? raw.pauseOnHidden : DEFAULT_CONFIG.pauseOnHidden,
    wallpaperSound: typeof raw.wallpaperSound === 'boolean' ? raw.wallpaperSound : DEFAULT_CONFIG.wallpaperSound,
    wallpaperVolume: paramInRange('wallpaperVolume', raw.wallpaperVolume),
    // Upgrades keep stored numbers: widening panelGlass to 0-100 makes every
    // previously legal value (including the schema-1 default 80) legal as-is,
    // so no legacy mapping may rewrite 80 into 15.
    panelGlass: paramInRange('panelGlass', raw.panelGlass),
    bubbleOpacity: legacyBubbleDefault ? 55 : paramInRange('bubbleOpacity', raw.bubbleOpacity),
    composerFrost: paramInRange('composerFrost', raw.composerFrost),
    surfaceFrost: paramInRange('surfaceFrost', raw.surfaceFrost),
    weRoots: Array.isArray(raw.weRoots)
      ? [...new Set(raw.weRoots.filter(root => typeof root === 'string' && /^[A-Za-z]:[\\/]/.test(root) && root.length <= 1024))].slice(0, 8)
      : [],
    weSelection: raw.weSelection && typeof raw.weSelection === 'object' &&
      typeof raw.weSelection.id === 'string' && typeof raw.weSelection.title === 'string'
      ? { id: raw.weSelection.id.slice(0, 1024), title: raw.weSelection.title.slice(0, 120),
          kind: String(raw.weSelection.kind || '').slice(0, 20), staticFallback: Boolean(raw.weSelection.staticFallback),
          framePath: typeof raw.weSelection.framePath === 'string' ? raw.weSelection.framePath.slice(0, 1024) : null,
          previewPath: typeof raw.weSelection.previewPath === 'string' ? raw.weSelection.previewPath.slice(0, 1024) : null }
      : null,
    customSkins: Array.isArray(raw.customSkins)
      ? raw.customSkins.filter(validCustomSkin).slice(0, 50)
      : []
  }
}

const rgb = hex => [1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16) / 255)
const channel = value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
const luminance = hex => rgb(hex).map(channel).reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0)

function contrastRatio(first, second) {
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a)
  return (values[0] + 0.05) / (values[1] + 0.05)
}

function readable(foreground, background) {
  if (contrastRatio(foreground, background) >= 4.5) return foreground
  const light = '#ffffff'
  const dark = '#000000'
  return contrastRatio(light, background) >= contrastRatio(dark, background) ? light : dark
}

/** Correct only text colors that fail normal-size WCAG AA contrast. */
function ensurePaletteContrast(colors) {
  const result = { ...colors }
  const pairs = [
    ['foreground', 'background'], ['cardForeground', 'card'],
    ['mutedForeground', 'muted'], ['popoverForeground', 'popover'],
    ['primaryForeground', 'primary'], ['secondaryForeground', 'secondary'],
    ['accentForeground', 'accent'], ['destructiveForeground', 'destructive']
  ]
  for (const [foreground, background] of pairs) {
    if (result[foreground] && result[background]) {
      result[foreground] = readable(result[foreground], result[background])
    }
  }
  return result
}

function toThemeContribution(skin) {
  const complete = colors => ensurePaletteContrast({
    ...colors,
    destructive: colors.destructive || '#dc2626',
    destructiveForeground: colors.destructiveForeground || '#ffffff'
  })
  return {
    name: skin.id,
    label: skin.name || skin.nameEn || skin.id,
    description: skin.tagline || skin.description || '',
    colors: complete(skin.colors),
    darkColors: complete(skin.darkColors || skin.colors)
  }
}

function createSkinStore(ctx) {
  const $config = atom(normalizeConfig(ctx.storage.get('config', {})))
  const $tryOnSkin = atom(null)
  const $tryOnBaseTheme = atom(null)

  function saveConfig(updater) {
    const prev = $config.get()
    const next = normalizeConfig(typeof updater === 'function' ? updater(prev) : { ...prev, ...updater })
    ctx.storage.set('config', next)
    $config.set(next)
    return next
  }

  function startTryOn(skin, themeName) {
    if (!$tryOnSkin.get()) $tryOnBaseTheme.set(themeName)
    $tryOnSkin.set(skin)
  }

  function exitTryOn() {
    $tryOnSkin.set(null)
    $tryOnBaseTheme.set(null)
  }

  function addCustomSkin(skin) {
    ctx.register({ id: `theme-${skin.id}`, area: 'themes', data: toThemeContribution(skin) })
    saveConfig(prev => ({ ...prev, customSkins: [skin, ...prev.customSkins] }))
  }

  return { $config, $tryOnSkin, $tryOnBaseTheme, saveConfig, startTryOn, exitTryOn, addCustomSkin }
}

// ─── Submodule: Skin Controller ───────────────────────────────
/** Keeps Hermes' selected theme authoritative and owns every cosmetic effect. */
class SkinController {
  constructor(store, skins, backdrop, glass) {
    this.store = store
    this.skins = skins
    this.backdrop = backdrop
    this.glass = glass
    this.lastTheme = null
    this.lastMode = 'dark'
    this.previewCleanup = null
    this.backdrop.onVisibilityChange = () => this.sync()
  }

  findSkin(id) {
    return [...this.skins, ...this.store.$config.get().customSkins].find(s => s.id === id)
  }

  sync(themeName = this.lastTheme, renderedMode = this.lastMode) {
    this.lastTheme = themeName
    this.lastMode = renderedMode
    const preview = this.store.$tryOnSkin.get()
    if (preview && this.store.$tryOnBaseTheme.get() !== themeName) {
      this.previewCleanup?.()
      this.previewCleanup = null
      this.store.exitTryOn()
    }
    const activePreview = this.store.$tryOnSkin.get()
    const skin = activePreview || this.findSkin(themeName)
    const config = this.store.$config.get()
    const customSource = !activePreview && config.wallpaperSource && !config.wallpaperSource.startsWith('data:image/svg+xml')
    const source = customSource ? config.wallpaperSource : skin?.wallpaper
    const enabled = Boolean(source && (activePreview || config.wallpaperEnabled) && (skin || customSource))
    const showing = this.backdrop.update({
      enabled,
      type: customSource ? config.wallpaperType : (skin?.wallpaperType || 'image'),
      src: source,
      sceneFrame: config.wallpaperType === 'scene' ? config.weSelection?.framePath : null,
      webPreview: config.wallpaperType === 'web' ? config.weSelection?.previewPath : null,
      mode: config.wallpaperMode,
      fit: config.wallpaperFit,
      opacity: config.wallpaperOpacity,
      pauseOnHidden: config.pauseOnHidden,
      sound: config.wallpaperSound,
      volume: config.wallpaperVolume,
      blur: activePreview?.defaultBlur ?? config.wallpaperBlur,
      occlusion: activePreview?.defaultOcclusion ?? config.maskOcclusion,
      isDark: renderedMode === 'dark'
    })
    this.glass.update({ enabled: showing, glassTransparency: config.panelGlass,
      bubbleOpacity: config.bubbleOpacity, composerFrost: config.composerFrost,
      surfaceFrost: config.surfaceFrost })
  }

  tryOn(skin, theme) {
    this.store.startTryOn(skin, theme.themeName)
    this.previewCleanup = theme.clearThemePreview
    theme.previewTheme(skin.id, theme.renderedMode)
    this.sync(theme.themeName, theme.renderedMode)
  }

  exitTryOn(theme) {
    theme.clearThemePreview()
    this.previewCleanup = null
    this.store.exitTryOn()
    this.sync(theme.themeName, theme.renderedMode)
  }

  apply(skin, theme) {
    const previousTheme = this.findSkin(theme.themeName)
      ? this.store.$config.get().previousTheme
      : theme.themeName
    this.store.saveConfig(prev => ({
      ...prev,
      previousTheme: previousTheme || 'nous',
      activeSkinId: skin.id,
      wallpaperEnabled: Boolean(prev.wallpaperSource || skin.wallpaper),
      wallpaperType: prev.wallpaperSource ? prev.wallpaperType : (skin.wallpaperType || 'image'),
      wallpaperSource: prev.wallpaperSource,
      wallpaperBlur: skin.defaultBlur ?? prev.wallpaperBlur,
      maskOcclusion: skin.defaultOcclusion ?? prev.maskOcclusion
    }))
    theme.clearThemePreview()
    this.previewCleanup = null
    this.store.exitTryOn()
    theme.setTheme(skin.id)
    this.sync(skin.id, theme.renderedMode)
  }

  restore(theme) {
    const previous = this.store.$config.get().previousTheme
    const target = previous && !this.findSkin(previous) ? previous : 'nous'
    this.store.saveConfig(prev => ({ ...prev, activeSkinId: 'default', wallpaperEnabled: Boolean(prev.wallpaperSource) }))
    theme.clearThemePreview()
    this.previewCleanup = null
    this.store.exitTryOn()
    theme.setTheme(target)
    this.sync(target, theme.renderedMode)
  }

  changeConfig(change) {
    this.store.saveConfig(change)
    this.sync()
  }

  destroy() {
    this.previewCleanup?.()
    this.previewCleanup = null
    this.backdrop.destroy()
    this.glass.destroy()
  }
}

// ─── Submodule: Root-Theme Watcher ────────────────────────────
/**
 * Root-theme runtime sync.
 *
 * The removed status-bar chip used to keep a React effect mounted at all times
 * so theme repaints re-synced the backdrop. This watcher replaces that with a
 * runtime that runs whether or not a plugin page is open and regardless of the
 * status bar's visibility. It observes ONLY the root theme attributes the host
 * repaints (themes/context.tsx applyTheme rewrites data-hermes-theme,
 * data-hermes-mode and the .dark class on every paint), coalesces a burst of
 * mutations into one sync via a microtask, dedupes no-op repaints, never
 * polls, and disconnects completely on dispose.
 *
 * Committed vs try-on themes: applyTheme stamps data-hermes-theme with the
 * PAINTED name — during a try-on that is the previewed skin, not the committed
 * one. sync() compares its theme-name argument against the try-on base theme
 * to decide the preview went stale, so forwarding the painted name here would
 * tear the try-on down on every repaint. While a preview is active the
 * committed name therefore stays whatever sync last recorded and only the mode
 * is refreshed; the try-on lifecycle itself syncs explicitly.
 */
const THEME_ATTRS = ['class', 'data-hermes-mode', 'data-hermes-theme', 'data-hermes-terminal-alpha']

function watchRootTheme(store, controller) {
  if (typeof document === 'undefined' || typeof MutationObserver !== 'function') return () => {}
  const root = document.documentElement
  const stateKey = () => {
    const previewing = Boolean(store.$tryOnSkin.get())
    const themeName = previewing ? '~preview' : (root.dataset.hermesTheme || null)
    return `${themeName}:${root.dataset.hermesMode || 'dark'}:${root.dataset.hermesTerminalAlpha || 'false'}`
  }

  let queued = false
  let disposed = false
  let lastKey = stateKey()

  const flush = () => {
    queued = false
    if (disposed) return
    const key = stateKey()
    if (key === lastKey) return
    lastKey = key
    const previewing = Boolean(store.$tryOnSkin.get())
    controller.sync(previewing ? undefined : (root.dataset.hermesTheme || null),
      root.dataset.hermesMode || 'dark')
  }

  const observer = new MutationObserver(() => {
    if (queued || disposed) return
    queued = true
    queueMicrotask(flush)
  })
  observer.observe(root, { attributes: true, attributeFilter: THEME_ATTRS })

  return () => {
    disposed = true
    observer.disconnect()
    queued = false
  }
}

// ─── Submodule: Wallpaper Engine Library ─────────────────────
/** Wallpaper Engine library discovery through Hermes Desktop's local file bridge. */
const STEAM_APP_ID = '431960'
const VIDEO_EXTENSIONS = /\.(mp4|webm|mov|mkv|avi)$/i
const IMAGE_EXTENSIONS = /\.(png|jpe?g|webp|gif|bmp)$/i

const joinLocalPath = (base, ...parts) =>
  [String(base).replace(/[\\/]+$/, ''), ...parts.map(part => String(part).replace(/^[\\/]+|[\\/]+$/g, ''))].join('\\')

function safeProjectPath(dir, relative) {
  if (typeof relative !== 'string' || !relative.trim()) return null
  const parts = relative.replace(/\\/g, '/').split('/')
  if (parts.some(part => !part || part === '.' || part === '..' || part.includes(':'))) return null
  return joinLocalPath(dir, ...parts)
}

function wallpaperMediaUrl(path, type) {
  if (type === 'video') return `hermes-media://stream/${encodeURIComponent(path)}`
  return path
}

async function entriesAt(bridge, path) {
  try {
    const result = await bridge.readDir(path)
    return !result?.error && Array.isArray(result?.entries) ? result.entries : null
  } catch {
    return null
  }
}

async function textAt(bridge, path) {
  try {
    const result = await bridge.readFileText(path)
    return result?.truncated ? null : result?.text || null
  } catch {
    return null
  }
}

async function existsAt(bridge, path) {
  const normalized = String(path).replace(/\//g, '\\')
  const index = normalized.lastIndexOf('\\')
  if (index < 0) return false
  const parent = await entriesAt(bridge, normalized.slice(0, index))
  return Boolean(parent?.some(entry => entry.name.toLowerCase() === normalized.slice(index + 1).toLowerCase()))
}

async function mapLimit(items, limit, fn) {
  let cursor = 0
  const results = new Array(items.length)
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++
      results[index] = await fn(items[index])
    }
  }))
  return results
}

async function readWallpaperProject(bridge, dir, source = 'manual') {
  const entries = await entriesAt(bridge, dir)
  if (!entries?.some(entry => entry.name.toLowerCase() === 'project.json')) return null
  const text = await textAt(bridge, joinLocalPath(dir, 'project.json'))
  if (!text) return null
  let project
  try { project = JSON.parse(text.replace(/^\uFEFF/, '')) } catch { return null }
  if (!project || typeof project !== 'object') return null

  const kind = String(project.type || '').toLowerCase()
  const mainPath = safeProjectPath(dir, project.file)
  const candidatePreview = safeProjectPath(dir, project.preview)
  const previewPath = candidatePreview && IMAGE_EXTENSIONS.test(candidatePreview) ? candidatePreview : null
  const [mainExists, previewExists] = await Promise.all([
    mainPath ? existsAt(bridge, mainPath) : false,
    previewPath ? existsAt(bridge, previewPath) : false
  ])
  const canPlayVideo = kind === 'video' && mainExists && VIDEO_EXTENSIONS.test(mainPath)
  const canShowImage = kind === 'image' && mainExists && IMAGE_EXTENSIONS.test(mainPath)
  const canShowWeb = kind === 'web' && mainExists && /\.html?$/i.test(mainPath)
  const mediaType = canPlayVideo ? 'video' : canShowWeb ? 'web' : 'image'
  const mediaPath = canPlayVideo || canShowImage || canShowWeb ? mainPath : (previewExists ? previewPath : null)
  if (!mediaPath) return null
  const title = typeof project.title === 'string' && project.title.trim()
    ? project.title.trim().slice(0, 120) : dir.split(/[\\/]/).at(-1)
  return {
    id: dir.toLowerCase(),
    title,
    kind,
    source,
    dir,
    mediaPath,
    mediaType,
    previewPath: previewExists ? previewPath : mediaPath,
    staticFallback: !canPlayVideo && !canShowImage && !canShowWeb,
    workshopId: typeof project.workshopid === 'string' ? project.workshopid : null
  }
}

async function scanContainer(bridge, root, source) {
  const entries = await entriesAt(bridge, root)
  if (!entries) return []
  if (entries.some(entry => entry.name.toLowerCase() === 'project.json')) {
    const project = await readWallpaperProject(bridge, root, source)
    return project ? [project] : []
  }
  const dirs = entries.filter(entry => entry.isDirectory).slice(0, 1000)
  return (await mapLimit(dirs, 8, entry => readWallpaperProject(bridge, entry.path || joinLocalPath(root, entry.name), source)))
    .filter(Boolean)
}

function parseSteamLibraryFolders(text) {
  if (typeof text !== 'string') return []
  const paths = []
  const pattern = /"path"\s*"((?:\\.|[^"\\])*)"/g
  for (const match of text.matchAll(pattern)) {
    const path = match[1].replace(/\\\\/g, '\\').replace(/\//g, '\\')
    if (/^[A-Za-z]:\\/.test(path)) paths.push(path)
  }
  return [...new Set(paths)]
}

async function scanWallpaperEngine(bridge, manualRoots = []) {
  if (!bridge?.readDir || !bridge?.readFileText) {
    return { items: [], libraries: [], error: 'Hermes Desktop local file bridge unavailable' }
  }
  const probes = []
  for (const drive of ['C', 'D', 'E', 'F', 'G', 'H']) {
    for (const suffix of ['Program Files (x86)\\Steam', 'Program Files\\Steam', 'Steam', 'SteamLibrary']) {
      probes.push(`${drive}:\\${suffix}`)
    }
  }
  const validManual = manualRoots.filter(root => typeof root === 'string' && /^[A-Za-z]:[\\/]/.test(root))
  const candidates = [...new Set([...validManual, ...probes])]
  const found = await mapLimit(candidates, 8, async root => {
    const steamapps = joinLocalPath(root, 'steamapps')
    return (await entriesAt(bridge, steamapps)) ? root : null
  })
  const libraries = new Set(found.filter(Boolean))
  for (const root of [...libraries]) {
    const vdf = await textAt(bridge, joinLocalPath(root, 'steamapps', 'libraryfolders.vdf'))
    for (const library of parseSteamLibraryFolders(vdf)) libraries.add(library)
  }
  const containers = []
  for (const root of libraries) {
    containers.push([joinLocalPath(root, 'steamapps', 'workshop', 'content', STEAM_APP_ID), 'workshop'])
    const projects = joinLocalPath(root, 'steamapps', 'common', 'wallpaper_engine', 'projects')
    containers.push([joinLocalPath(projects, 'myprojects'), 'local'])
    containers.push([joinLocalPath(projects, 'defaultprojects'), 'built-in'])
  }
  for (const root of validManual) {
    containers.push([root, 'manual'])
    containers.push([joinLocalPath(root, STEAM_APP_ID), 'manual'])
    containers.push([joinLocalPath(root, 'myprojects'), 'manual'])
    containers.push([joinLocalPath(root, 'defaultprojects'), 'manual'])
    containers.push([joinLocalPath(root, 'projects', 'myprojects'), 'manual'])
    containers.push([joinLocalPath(root, 'projects', 'defaultprojects'), 'manual'])
    containers.push([joinLocalPath(root, 'workshop', 'content', STEAM_APP_ID), 'manual'])
    containers.push([joinLocalPath(root, 'common', 'wallpaper_engine', 'projects', 'myprojects'), 'manual'])
    containers.push([joinLocalPath(root, 'common', 'wallpaper_engine', 'projects', 'defaultprojects'), 'manual'])
  }
  const uniqueContainers = [...new Map(containers.map(([path, source]) => [path.toLowerCase(), [path, source]])).values()]
  const scanned = await mapLimit(uniqueContainers, 4, ([path, source]) => scanContainer(bridge, path, source))
  const items = [...new Map(scanned.flat().map(item => [item.id, item])).values()]
    .sort((a, b) => a.title.localeCompare(b.title, 'zh'))
  return { items, libraries: [...libraries], error: null }
}

// ─── Explicitly MIT-marked WebGL player from dsh-skins ──────
/**
 * @license MIT
 * Self-contained WebGL Scene Player runtime page for Wallpaper Engine scenes.
 * Renders 2D layered scenes, post-processing shaders (reflection, waterwaves,
 * foliagesway, tint), and GPU/CPU particle systems (shooting stars, fireflies).
 */

const WE_SCENE_PLAYER_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
<title>Wallpaper Engine Scene Player</title>
<style>
  html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: transparent;
  }
  canvas {
    display: block;
    width: 100%;
    height: 100%;
    position: absolute;
    inset: 0;
  }
</style>
</head>
<body>
<canvas id="canvas"></canvas>
<script>
(function() {
  'use strict';

  const canvas = document.getElementById('canvas');
  const gl = canvas.getContext('webgl', { alpha: true, depth: true, antialias: true, premultipliedAlpha: false }) ||
             canvas.getContext('experimental-webgl', { alpha: true, depth: true });
  if (!gl) return;

  let sceneData = null;
  let isPaused = false;
  let contextLost = false;
  let fitMode = 'cover';
  let startTime = performance.now();
  let lastTime = performance.now();
  let textureCache = new Map();
  let videoTextureCache = new Map();
  let activeParticles = [];
  let mouseX = 0.5, mouseY = 0.5;
  let curRotX = 0, curRotY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX / window.innerWidth;
    mouseY = e.clientY / window.innerHeight;
  });

  // 3D Shaders
  const vs3D = \`
    attribute vec3 a_pos;
    attribute vec3 a_norm;
    attribute vec2 a_uv;
    attribute vec2 a_uv2;
    uniform mat4 u_proj;
    uniform mat4 u_view;
    uniform mat4 u_model;
    uniform mat3 u_normMat;
    uniform float u_time;
    uniform int u_isJet;
    uniform int u_isAurora;
    uniform int u_isThunder;
    uniform int u_isBg;
    uniform int u_isNeonSun;
    varying vec3 v_norm;
    varying vec3 v_worldPos;
    varying vec2 v_uv;
    varying vec2 v_uv2;
    varying vec4 v_uv4;
    varying float v_alpha;
    void main() {
      v_uv = a_uv;
      v_uv2 = a_uv2;
      v_uv4 = a_uv.xyxy;
      v_alpha = 1.0;
      vec3 pos = a_pos;
      // WE ricepodjet shader: flame pulse along the jet cone.
      if (u_isJet == 1) {
        float outside = step(0.5, a_uv.x);
        float pulseSpeed = 5.0 + outside * 10.0;
        float pulseAmount = 1.0 - a_uv.y;
        float pulseStrong = sin(u_time * pulseSpeed);
        pos.xy *= mix(1.0, pulseStrong * 0.05 + 1.0, pulseAmount);
        pos.z += pulseAmount * (cos(u_time * pulseSpeed) * 0.02 + 0.02);
        v_alpha = pulseStrong * 0.25 + 0.75;
      }
      // WE ricepodorbitalaurora: swaying curtain with scrolled multi-sample UVs.
      if (u_isAurora == 1) {
        pos.x += sin(0.1 * u_time + a_uv.x * 5.0) * 0.05;
        pos.y += sin(0.1 * u_time + a_uv.x * 3.0) * 0.02;
        v_uv4.xy = a_uv;
        v_uv4.x *= 5.7;
        v_uv4.x += fract(u_time * 0.05);
        v_uv4.zw = a_uv.xx;
        v_uv4.z *= 0.5;
        v_uv4.w *= 8.3;
        v_uv4.z += fract(u_time * 0.04);
        v_uv4.w -= fract(u_time * 0.03);
        v_alpha = smoothstep(0.0, 0.1, a_uv.x) * smoothstep(1.0, 0.9, a_uv.x) * 0.6;
      }
      // WE ricepodorbitalthunder: sparkle cells with drifting sample offsets.
      if (u_isThunder == 1) {
        v_uv4.xy = a_uv * 0.777;
        v_uv4.wz = a_uv * 0.3; // wz swizzle: w = x*0.3, z = y*0.3
        v_uv4.z += sin((1.7 + u_time) * 0.1);
        v_uv4.w += cos(u_time * 0.22);
      }
      // WE bg.vert: fullscreen background quad, position from UV directly.
      if (u_isBg == 1) {
        v_uv4 = vec4(a_uv + u_time * 0.03, a_uv.x * 2.0 - u_time * 0.0111, a_uv.y * 2.0 - u_time * 0.0111);
        gl_Position = vec4(a_uv * 2.0 - 1.0, 0.5, 1.0);
        return;
      }
      // WE neonsun.vert: procedural sun, uv remapped to a small disc space.
      if (u_isNeonSun == 1) {
        v_uv = (a_uv * 2.0 - 1.0) * 0.3;
      }
      vec4 worldPos = u_model * vec4(pos, 1.0);
      v_worldPos = worldPos.xyz;
      v_norm = normalize(u_normMat * a_norm);
      gl_Position = u_proj * u_view * worldPos;
    }
  \`;

  const fs3D = \`
    precision mediump float;
    varying vec3 v_norm;
    varying vec3 v_worldPos;
    varying vec2 v_uv;
    varying vec2 v_uv2;
    varying vec4 v_uv4;
    varying float v_alpha;
    uniform sampler2D u_tex;
    uniform int u_hasTex;
    uniform int u_isCarBody;
    uniform int u_isGlass;
    uniform int u_isDome;
    uniform int u_isShadow;
    uniform int u_isGrid;
    uniform int u_isSkybox;
    uniform int u_isSelfIllum;
    uniform highp int u_isJet;
    uniform highp int u_isAurora;
    uniform highp int u_isThunder;
    uniform highp int u_isBg;
    uniform highp int u_isNeonSun;
    uniform int u_gradFade;
    uniform int u_sceneStd;
    uniform vec3 u_jetPos[4];
    uniform int u_jetCount;
    uniform vec3 u_color;
    uniform vec3 u_paintColor;
    uniform vec3 u_stripeColor;
    uniform vec3 u_ambientColor;
    uniform vec3 u_cameraPos;
    uniform vec3 u_lightDir;
    uniform float u_specStrength;
    uniform float u_specPower;
    uniform highp float u_time;
    uniform int u_hasTint;
    uniform vec3 u_tint;
    uniform vec3 u_tint2;
    uniform sampler2D u_tex2;
    uniform sampler2D u_lightmap;
    uniform int u_hasLightmap;
    uniform vec3 u_lightPos[4];
    uniform vec4 u_lightColorRadius[4];
    uniform int u_lightCount;
    uniform vec3 u_skyLightColor;
    uniform sampler2D u_reflTex;
    uniform vec2 u_resolution;
    uniform int u_hasReflTex;
    void main() {
      // Skybox: textured background sphere (no lighting)
      if (u_isSkybox == 1) {
        vec3 col = u_hasTex == 1 ? texture2D(u_tex, v_uv).rgb : u_ambientColor * 0.5;
        gl_FragColor = vec4(col, 1.0);
        return;
      }
      // Dome: gradient sphere background (car scenes)
      if (u_isDome == 1) {
        vec3 tint = u_ambientColor;
        float h = normalize(v_worldPos).y * 0.5 + 0.5;
        vec3 col = mix(tint * 0.35, tint, h);
        gl_FragColor = vec4(col, 1.0);
        return;
      }
      // Shadow: smooth radial gradient under car
      if (u_isShadow == 1) {
        float d = length(v_worldPos.xz);
        float radial = 1.0 - smoothstep(0.0, 1.8, d);
        float yFade = pow(clamp(1.0 - v_uv.y, 0.0, 1.0), 1.5);
        float a = radial * yFade * 0.65;
        gl_FragColor = vec4(0.0, 0.0, 0.0, a);
        return;
      }
      // Grid floor: screen-space reflection from FBO
      if (u_isGrid == 1) {
        vec3 norm = normalize(v_norm);
        vec3 lightDir = normalize(u_lightDir);
        vec3 viewDir = normalize(u_cameraPos - v_worldPos);
        // Base grid color
        vec3 gridColor = u_ambientColor * 0.6;
        // Screen-space reflection from the mirrored-camera FBO
        vec3 reflColor = vec3(0.0);
        if (u_hasReflTex == 1) {
          vec2 screenUV = gl_FragCoord.xy / u_resolution;
          reflColor = texture2D(u_reflTex, screenUV).rgb;
        }
        // Distance-based fade for reflection
        float dist = length(v_worldPos.xz);
        float fade = 1.0 - smoothstep(0.0, 3.5, dist);
        // Fresnel for reflectivity at grazing angles
        float fresnel = 1.0 - max(dot(norm, viewDir), 0.0);
        fresnel = pow(fresnel, 2.0);
        // Specular highlight
        vec3 halfDir = normalize(lightDir + viewDir);
        float gridSpec = pow(max(dot(norm, halfDir), 0.0), 100.0) * 0.2;
        // Mix reflection with base color
        float reflStrength = fade * 0.55 + fresnel * 0.3;
        vec3 result = mix(gridColor, reflColor, reflStrength) + gridSpec;
        float alpha = 0.9 * fade + 0.1;
        gl_FragColor = vec4(result, alpha);
        return;
      }
      // Self-illuminated: emissive glow (jet engines, taillights with selfillum combo)
      if (u_isSelfIllum == 1) {
        vec3 col = u_hasTex == 1 ? texture2D(u_tex, v_uv).rgb : u_color;
        if (u_hasTint == 1) {
          // WE tinted-glow shaders (technoglow): pow falloff, scheme-color
          // tint, gentle pulse.
          float pulse = sin(u_time) * 0.25 + 0.75;
          col = col * col * u_tint * 3.0 * pulse;
          gl_FragColor = vec4(col, u_hasTex == 1 ? texture2D(u_tex, v_uv).a : 1.0);
        } else {
          gl_FragColor = vec4(col * 1.5, 1.0);
        }
        return;
      }
      // WE neonsun fragment: procedural retrowave sun (gradient disc, scanline
      // cutouts, glow halo). u_tint = colorsuntop, u_tint2 = colorsunbottom.
      if (u_isNeonSun == 1) {
        float sunSize = 0.05;
        float sunSizeSqrt = sqrt(sunSize);
        float blendSunColor = (v_uv.y + sunSize * 2.5) / sunSizeSqrt;
        vec4 colorSun = vec4(mix(u_tint, u_tint2, blendSunColor), 0.0);
        float sunRadius = dot(v_uv.xy, v_uv.xy);
        colorSun.a = 1.0 - step(0.05, sunRadius);
        float glowAlpha = pow(smoothstep(0.08, 0.045, sunRadius), 2.0);
        float barPos = v_uv.y + 0.1;
        float sunCutOut = 1.0 - clamp(smoothstep(0.0, 0.005, barPos) * smoothstep(1.0 - barPos * 9.0, 1.0 - barPos * 8.0, sin(barPos * 200.0 + u_time)), 0.0, 1.0);
        float sunCutOutSmooth = 1.0 - clamp(smoothstep(0.0, 0.05, barPos) * smoothstep(-1.0 - barPos * 8.0, 1.0 - barPos * 8.0, sin(barPos * 200.0 + u_time)), 0.0, 1.0);
        vec3 rgb = mix(u_tint2, colorSun.rgb, colorSun.a * sunCutOut);
        float sunA = max(glowAlpha * sunCutOutSmooth, colorSun.a * sunCutOut);
        gl_FragColor = vec4(rgb, sunA);
        return;
      }
      // WE ricepodjet fragment: flame texture fades along uv.y with pulse alpha.
      if (u_isJet == 1) {
        vec3 col = u_hasTex == 1 ? texture2D(u_tex, v_uv).rgb : u_color;
        col *= v_uv.y * v_alpha;
        gl_FragColor = vec4(col, 1.0);
        return;
      }
      // WE bg fragment: fullscreen tinted clouds + pattern background.
      if (u_isBg == 1) {
        float clouds = texture2D(u_tex, v_uv4.xy).a * texture2D(u_tex, v_uv4.zw).a * 1.4;
        clouds = clouds * clouds;
        float vignette = smoothstep(1.2, 0.0, length(v_uv - 0.5)) * 2.0;
        float pattern = texture2D(u_tex2, v_uv * 50.0).a * 0.1;
        pattern *= smoothstep(0.1, 0.7, length(v_uv - 0.5));
        vec3 albedo = mix(u_tint, u_tint2, v_uv.y * v_uv.y) * (clouds + pattern) * vignette;
        float bgAlpha = 1.0;
        if (u_gradFade == 1) {
          bgAlpha = smoothstep(0.2, 0.45, abs(v_uv.y - 0.5));
        }
        gl_FragColor = vec4(albedo, bgAlpha);
        return;
      }
      // WE ricepodorbitalaurora fragment: layered scrolling aurora curtains.
      if (u_isAurora == 1) {
        vec3 color = texture2D(u_tex, v_uv4.xy).rgb;
        vec3 color2 = texture2D(u_tex, v_uv4.wy).rgb;
        vec3 blend = texture2D(u_tex, v_uv4.zy).rgb;
        color = mix(color * color2, blend, blend.r);
        gl_FragColor = vec4(color, v_alpha);
        return;
      }
      // WE ricepodorbitalthunder fragment: sparkling blue cells.
      if (u_isThunder == 1) {
        float amt = texture2D(u_tex, v_uv4.xy).r;
        amt *= texture2D(u_tex, v_uv4.zw).r;
        vec3 color = mix(vec3(0.6, 0.5, 0.4), vec3(0.1, 0.3, 1.0), amt);
        gl_FragColor = vec4(color, amt);
        return;
      }

      vec4 baseColor = u_hasTex == 1 ? texture2D(u_tex, v_uv) : vec4(u_color, 1.0);
      float alpha = 1.0;

      // Car body paintwork: mix(paintColor, stripesColor, R) * G
      if (u_isCarBody == 1 && u_hasTex == 1) {
        vec3 bodyColor = mix(u_paintColor, u_stripeColor, baseColor.r) * baseColor.g;
        baseColor = vec4(bodyColor, 1.0);
      } else if (u_isGlass == 1) {
        alpha = u_hasTex == 1 ? baseColor.a * 0.6 : 0.3;
        baseColor.rgb = u_hasTex == 1 ? baseColor.rgb : vec3(0.15, 0.2, 0.28);
      }

      vec3 norm = normalize(v_norm);
      vec3 lightDir = normalize(u_lightDir);
      vec3 viewDir = normalize(u_cameraPos - v_worldPos);
      vec3 halfDir = normalize(lightDir + viewDir);

      if (u_sceneStd == 1) {
        // Wallpaper Engine generic.frag: authored point lights, black-capable
        // ambient/skylight, and the first light attenuated by the baked map.
        vec3 lighting = u_ambientColor;
        vec3 specularResult = vec3(0.0);
        for (int li = 0; li < 4; li++) {
          if (li < u_lightCount) {
            vec3 delta = u_lightPos[li] - v_worldPos;
            float distanceToLight = length(delta);
            vec3 pointDir = delta / max(distanceToLight, 0.0001);
            float attenuation = clamp((u_lightColorRadius[li].w - distanceToLight) / u_lightColorRadius[li].w, 0.0, 1.0);
            vec3 pointColor = u_lightColorRadius[li].rgb;
            float diffuse = max(dot(norm, pointDir), 0.0) * attenuation * attenuation;
            vec3 diffuseLight = pointColor * diffuse;
            if (li == 0 && u_hasLightmap == 1) {
              diffuseLight *= texture2D(u_lightmap, v_uv2).rgb;
            }
            lighting += diffuseLight;
            vec3 pointHalf = normalize(pointDir + viewDir);
            specularResult += pointColor * pow(max(dot(norm, pointHalf), 0.0), u_specPower) * u_specStrength * attenuation;
          }
        }
        lighting += max(dot(norm, vec3(0.0, -1.0, 0.0)), 0.0) * u_skyLightColor;
        float boostAmt = 0.0;
        for (int i = 0; i < 4; i++) {
          if (i < u_jetCount) {
            boostAmt += 1.0 - min(1.0, 2.0 * length(u_jetPos[i] - v_worldPos));
          }
        }
        vec3 boost = vec3(3.0, 1.2, 0.2) * boostAmt;
        gl_FragColor = vec4(baseColor.rgb * (lighting + boost) + specularResult, alpha);
        return;
      }

      // Key light (squared falloff for car, linear for generic)
      float NdotL = max(dot(norm, lightDir), 0.0);
      float lighting = u_isCarBody == 1 ? NdotL * NdotL * 0.9 : NdotL * 1.1;

      // Fill light from opposite side
      vec3 fillDir = normalize(vec3(-lightDir.x, 0.3, -lightDir.z));
      float fillNdotL = max(dot(norm, fillDir), 0.0);
      lighting += fillNdotL * 0.25;

      // Sky light from below for generic scenes
      float skyLight = max(dot(norm, vec3(0.0, -1.0, 0.0)), 0.0);
      lighting += skyLight * 0.15;

      // Rim light
      float rim = 1.0 - max(dot(norm, viewDir), 0.0);
      rim = pow(rim, 3.0) * 0.3;

      // Specular
      float specBase = max(dot(halfDir, norm), 0.0);
      float spec = pow(specBase, u_specPower);
      if (u_isCarBody == 1) {
        spec = spec * smoothstep(0.0, 0.1, sin(spec * 12.0));
      }
      float specular = spec * u_specStrength;

      // Ricepod shader: specular += pow(specBase, 25 + 100 * smoothstep(0.3, 0.15, color.r)) * 2
      // Generic scenes get extra specular for metallic look
      if (u_isCarBody == 0 && u_isGlass == 0) {
        float extraSpec = pow(specBase, 25.0 + 100.0 * smoothstep(0.3, 0.15, baseColor.r)) * 2.0;
        specular += extraSpec * u_specStrength;
      }

      vec3 result = (u_ambientColor * 0.5 + lighting) * baseColor.rgb + specular + rim * u_ambientColor * 0.5;

      gl_FragColor = vec4(result, alpha);
    }
  \`;

  // Vertex shader for basic 2D quads
  const vsBasic = \`
    attribute vec2 a_pos;
    attribute vec2 a_uv;
    uniform mat4 u_proj;
    uniform mat4 u_model;
    uniform vec4 u_uvRect;
    varying vec2 v_uv;
    void main() {
      v_uv = u_uvRect.xy + a_uv * (u_uvRect.zw - u_uvRect.xy);
      gl_Position = u_proj * u_model * vec4(a_pos, 0.0, 1.0);
    }
  \`;

  // Fragment shader for standard textures
  const fsBasic = \`
    precision mediump float;
    varying vec2 v_uv;
    uniform sampler2D u_tex;
    uniform float u_alpha;
    uniform vec3 u_tint;
    uniform float u_bright;
    uniform float u_power;
    void main() {
      vec4 col = texture2D(u_tex, v_uv);
      col.rgb *= u_tint;
      col.rgb *= u_bright;
      col.rgb = pow(col.rgb, vec3(u_power));
      col.a *= u_alpha;
      gl_FragColor = col;
    }
  \`;

  // Fragment shader for water reflection
  const fsReflection = \`
    precision mediump float;
    varying vec2 v_uv;
    uniform sampler2D u_fbo;
    uniform sampler2D u_mask;
    uniform float u_time;
    uniform float u_alpha;
    // Scene-uv rect of the reflection quad: (leftU, topV, scaleU, scaleV);
    // (0,0,1,1) for a fullscreen layer. Scene v grows downward (0 at the top).
    uniform vec4 u_rect;
    // Data-driven water surface from the scene object (legacy default 0.65).
    uniform float u_waterLine;
    // Reflection sample window: start + puddleDepth * span (legacy 0.42/0.38).
    uniform vec2 u_reflectRange;
    void main() {
      float mask = texture2D(u_mask, v_uv).r;
      vec2 sceneUv = u_rect.xy + v_uv * u_rect.zw;
      if (mask < 0.05 || sceneUv.y < u_waterLine) {
        discard;
      }
      float puddleDepth = (sceneUv.y - u_waterLine) / max(1.0 - u_waterLine, 0.0001);
      vec2 uvReflect = vec2(sceneUv.x, u_reflectRange.x + puddleDepth * u_reflectRange.y);
      // water wave ripple perturbation
      float wave = sin(v_uv.y * 120.0 + u_time * 2.8) * 0.002 +
                   cos(v_uv.x * 90.0 + u_time * 1.9) * 0.0015;
      uvReflect.x += wave * mask;
      uvReflect.y += wave * mask;
      vec4 reflected = texture2D(u_fbo, clamp(uvReflect, 0.0, 1.0));
      reflected.rgb *= vec3(0.70, 0.75, 0.90);
      gl_FragColor = vec4(reflected.rgb, mask * u_alpha * 0.28);
    }
  \`;

  // WE flag shader (TINT combo): rippling cloth via two scrolling normal
  // samples, region colors remapped through texture channels.
  const fsFlag = \`
    precision mediump float;
    varying vec2 v_uv;
    uniform sampler2D u_tex;
    uniform sampler2D u_normal;
    uniform sampler2D u_cloth;
    uniform float u_time;
    uniform float u_speed;
    uniform float u_strength;
    uniform vec3 u_color1;
    uniform vec3 u_color2;
    uniform vec3 u_color3;
    void main() {
      vec2 nc1 = v_uv * vec2(1.0, 0.3) * 0.7;
      nc1.x -= u_time * u_speed;
      nc1.x -= ((0.5 - v_uv.x) * (1.0 - v_uv.y)) * 3.0;
      nc1.x += 2.0 * pow(v_uv.y - 0.1, 3.0) * pow(v_uv.x, 2.0);
      vec2 nc2 = v_uv * vec2(1.0, 0.7) * 0.3;
      nc2.x -= u_time * u_speed * 0.5;
      nc2.x -= ((1.0 - v_uv.x) * (1.0 - v_uv.y)) * 2.0;
      vec3 normal = texture2D(u_normal, nc1).rgb * 2.0 - 1.0;
      normal *= texture2D(u_normal, nc2).rgb * 2.0 - 1.0;
      normal = mix(vec3(0.0, 0.0, 1.0), normal, u_strength);
      normal = normalize(normal);
      vec2 baseCoords = v_uv + normal.xy * 0.02;
      vec3 albedo = texture2D(u_tex, baseCoords).rgb;
      float cloth = texture2D(u_cloth, baseCoords * 4.0).r;
      vec3 color = mix(u_color1, u_color2, albedo.r);
      color = mix(color, u_color3, albedo.g);
      color *= albedo.b * cloth;
      color += cloth * 0.1;
      float light = 0.2 + dot(vec3(0.707, 0.707, 0.0), normal) * 0.5 + 0.5;
      light += pow(light, 5.0) * 0.5;
      color *= light + light * clamp(cloth * 2.0 - 1.0, 0.0, 1.0);
      gl_FragColor = vec4(color, 1.0);
    }
  \`;

  // Fragment shader for particles
  const fsParticle = \`
    precision mediump float;
    varying vec2 v_uv;
    uniform sampler2D u_tex;
    uniform vec4 u_color;
    void main() {
      vec4 tex = texture2D(u_tex, v_uv);
      gl_FragColor = tex * u_color;
    }
  \`;

  // WE flowimage shader: 3 content layers cross-faded while their UVs drift
  // along the flow mask (deep_space nebula background).
  const fsFlow = \`
    precision mediump float;
    varying vec2 v_uv;
    uniform sampler2D u_mask;
    uniform sampler2D u_l1;
    uniform sampler2D u_l2;
    uniform sampler2D u_l3;
    uniform float u_time;
    uniform vec3 u_speeds;
    uniform float u_amp;
    uniform float u_bright;
    void main() {
      vec3 flowColors = texture2D(u_mask, v_uv).rgb;
      vec2 flowMask = (flowColors.rg - vec2(0.5, 0.5)) * 2.0;
      float c0 = fract(u_time * u_speeds.x);
      float c0b = fract(u_time * u_speeds.x + 0.5);
      float c1 = fract(u_time * u_speeds.y);
      float c1b = fract(u_time * u_speeds.y + 0.5);
      float c2 = fract(u_time * u_speeds.z);
      float c2b = fract(u_time * u_speeds.z + 0.5);
      float b0 = 2.0 * abs(c0 - 0.5);
      float b1 = 2.0 * abs(c1 - 0.5);
      float b2 = 2.0 * abs(c2 - 0.5);
      vec2 cuv = v_uv;
      vec4 albedo = mix(texture2D(u_l1, cuv + flowMask * u_amp * 0.1 * c0),
                        texture2D(u_l1, cuv + flowMask * u_amp * 0.1 * c0b), b0);
      vec4 s1 = mix(texture2D(u_l2, cuv + flowMask * u_amp * 0.1 * c1),
                    texture2D(u_l2, cuv + flowMask * u_amp * 0.1 * c1b), b1);
      albedo.rgb = mix(albedo.rgb, s1.rgb, s1.a);
      albedo.a = max(albedo.a, s1.a);
      vec4 s2 = mix(texture2D(u_l3, cuv + flowMask * u_amp * 0.1 * c2),
                    texture2D(u_l3, cuv + flowMask * u_amp * 0.1 * c2b), b2);
      albedo.rgb = mix(albedo.rgb, s2.rgb, s2.a);
      albedo.a = max(albedo.a, s2.a);
      albedo.rgb *= u_bright;
      gl_FragColor = albedo;
    }
  \`;

  function createShader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error('we-scene-player shader compile failed:', gl.getShaderInfoLog(s));
    }
    return s;
  }

  function createProgram(vsSrc, fsSrc) {
    const p = gl.createProgram();
    gl.attachShader(p, createShader(gl.VERTEX_SHADER, vsSrc));
    gl.attachShader(p, createShader(gl.FRAGMENT_SHADER, fsSrc));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      console.error('we-scene-player program link failed:', gl.getProgramInfoLog(p));
    }
    return p;
  }

  const progBasic = createProgram(vsBasic, fsBasic);
  const progReflection = createProgram(vsBasic, fsReflection);
  const progParticle = createProgram(vsBasic, fsParticle);
  const progFlow = createProgram(vsBasic, fsFlow);
  const progFlag = createProgram(vsBasic, fsFlag);
  const prog3D = createProgram(vs3D, fs3D);

  // Camera-facing 3D billboard (sun sprites, 3D particle streaks). The quad is
  // offset in view space along two CPU-computed axes so streaks can stretch
  // along the velocity direction (WE spritetrail renderer).
  const vsSprite = \`
    attribute vec2 a_corner;
    attribute vec2 a_uv;
    uniform mat4 u_proj;
    uniform mat4 u_view;
    uniform vec3 u_center;
    uniform vec2 u_axisX;
    uniform vec2 u_axisY;
    varying vec2 v_uv;
    void main() {
      v_uv = a_uv;
      vec4 centerView = u_view * vec4(u_center, 1.0);
      gl_Position = u_proj * vec4(centerView.xy + a_corner.x * u_axisX + a_corner.y * u_axisY, centerView.zw);
    }
  \`;
  const fsSprite = \`
    precision mediump float;
    varying vec2 v_uv;
    uniform sampler2D u_tex;
    uniform int u_hasTex;
    uniform vec4 u_color;
    void main() {
      vec4 t = u_hasTex == 1 ? texture2D(u_tex, v_uv) : vec4(1.0);
      gl_FragColor = vec4(t.rgb * u_color.rgb, t.a * u_color.a);
    }
  \`;
  const progSprite = createProgram(vsSprite, fsSprite);

  // WE neongrid shader: procedural scrolling retrowave grid with fbm mountains.
  // Needs OES_standard_derivatives for the screen-space normal.
  const derivExt = gl.getExtension('OES_standard_derivatives');
  const vsNeonGrid = \`
    attribute vec3 a_pos;
    attribute vec2 a_uv;
    uniform mat4 u_proj;
    uniform mat4 u_view;
    uniform mat4 u_model;
    uniform float u_time;
    uniform float u_mountainScale;
    varying vec4 v_tc;
    varying vec4 v_vars;
    varying vec3 v_pos;
    float rand2(vec2 n) { return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453); }
    float noise2(vec2 p) {
      vec2 ip = floor(p);
      vec2 u = fract(p);
      u = u * u * (3.0 - 2.0 * u);
      float res = mix(mix(rand2(ip), rand2(ip + vec2(1.0, 0.0)), u.x), mix(rand2(ip + vec2(0.0, 1.0)), rand2(ip + vec2(1.0, 1.0)), u.x), u.y);
      return res * res;
    }
    float fbm(vec2 x) {
      float v = 0.0;
      float a = 0.5;
      vec2 shift = vec2(100.0);
      mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
      for (int i = 0; i < 5; ++i) {
        v += a * noise2(x);
        x = x * rot * 2.0 + shift;
        a *= 0.5;
      }
      return v;
    }
    void main() {
      v_vars = vec4(0.0);
      float speed = u_time * 2.0;
      vec3 localPos = a_pos;
      vec2 gridPos = floor(a_uv * 50.0 + vec2(0.0, speed));
      float dampenDistance = abs(a_uv.x * 2.0 - 1.0);
      float fallOffSides = pow(1.05 - dampenDistance, 0.5);
      float fallOffCenter = (0.2 + 0.8 * pow(dampenDistance, 2.0));
      float speedFrac = fract(speed) / 50.0;
      v_vars.x = a_uv.y - speedFrac;
      float dampenY = a_uv.y - speedFrac;
      float clipCenter = clamp(0.8 - dampenDistance, 0.0, 1.0);
      float offsetY = max(0.0, fbm(gridPos * 0.1) * 2.0 - clipCenter) * fallOffCenter * u_mountainScale;
      float maskUVSmoothing = step(0.005, offsetY);
      offsetY = offsetY * fallOffSides * dampenY + pow(dampenDistance, 2.0) * 0.02;
      localPos.z -= speedFrac * 2.0;
      localPos.y += offsetY;
      vec4 worldPos = u_model * vec4(localPos, 1.0);
      v_pos = worldPos.xyz;
      gl_Position = u_proj * u_view * worldPos;
      v_tc.xy = a_uv;
      v_tc.zw = a_uv * 50.0;
      float dampenUVSmoothing = clamp(abs(a_uv.x - 0.5) * 2.0 + maskUVSmoothing, 0.0, 1.0);
      v_vars.yz = vec2(0.45) - v_tc.y * vec2(0.05, 0.75 - dampenUVSmoothing * 0.7);
    }
  \`;
  const fsNeonGrid = (derivExt ? '#extension GL_OES_standard_derivatives : enable\\n' : '') + \`
    precision mediump float;
    varying vec4 v_tc;
    varying vec4 v_vars;
    varying vec3 v_pos;
    uniform vec3 u_gridNear;
    uniform vec3 u_gridFar;
    uniform vec3 u_gridBg;
    void main() {
      vec3 n = vec3(0.0, 1.0, 0.0);
      #ifdef GL_OES_standard_derivatives
      vec3 dx = dFdx(v_pos);
      vec3 dy = dFdy(v_pos);
      n = normalize(cross(dy, dx));
      #endif
      vec3 lightDir = normalize(vec3(0.0, -0.15, -2.0) - v_pos);
      vec2 grid = abs(fract(v_tc.zw) - 0.5);
      vec2 gridBlend = smoothstep(v_vars.yz, vec2(0.5), grid);
      float gridAlpha = gridBlend.x + gridBlend.y;
      gridBlend = smoothstep(vec2(0.0), vec2(1.0), grid);
      gridAlpha += (gridBlend.x + gridBlend.y) * clamp(0.3 - v_tc.y, 0.0, 1.0);
      float alphaDistanceFade = smoothstep(1.0, 0.9, v_vars.x);
      float colorDistanceBlend = pow(v_tc.y, 0.8);
      float shadingNear = dot(vec3(0.0, 0.0, 1.0), n);
      float shadingFar = dot(lightDir, n);
      vec3 shadingColor = clamp(shadingNear, 0.0, 1.0) * u_gridNear * (1.0 - colorDistanceBlend)
                        + clamp(shadingFar, 0.0, 1.0) * u_gridFar;
      vec3 colorGrid = u_gridBg + shadingColor;
      vec3 resultColor = mix(colorGrid, mix(u_gridNear, u_gridFar, colorDistanceBlend), gridAlpha * alphaDistanceFade);
      gl_FragColor = vec4(resultColor, alphaDistanceFade);
    }
  \`;
  const progNeonGrid = createProgram(vsNeonGrid, fsNeonGrid);

  function drawNeonGrid(model, mesh, proj, view, elapsed) {
    const uc = mesh.userColors || {};
    const un = mesh.userNums || {};
    gl.useProgram(progNeonGrid);
    gl.uniformMatrix4fv(gl.getUniformLocation(progNeonGrid, 'u_proj'), false, proj);
    gl.uniformMatrix4fv(gl.getUniformLocation(progNeonGrid, 'u_view'), false, view);
    gl.uniformMatrix4fv(gl.getUniformLocation(progNeonGrid, 'u_model'), false, mat4Transform3D(model.origin, model.angles, model.scale));
    gl.uniform1f(gl.getUniformLocation(progNeonGrid, 'u_time'), elapsed);
    gl.uniform1f(gl.getUniformLocation(progNeonGrid, 'u_mountainScale'), un.mountainscale != null ? un.mountainscale : 1);
    const near = uc.gridnear || [1, 0, 0.2];
    const far = uc.gridfar || [0, 0, 1];
    const bgc = uc.gridbackground || [0.1, 0, 0.1];
    gl.uniform3f(gl.getUniformLocation(progNeonGrid, 'u_gridNear'), near[0], near[1], near[2]);
    gl.uniform3f(gl.getUniformLocation(progNeonGrid, 'u_gridFar'), far[0], far[1], far[2]);
    gl.uniform3f(gl.getUniformLocation(progNeonGrid, 'u_gridBg'), bgc[0], bgc[1], bgc[2]);
    const gpu = getGpuMesh(mesh);
    const gPos = gl.getAttribLocation(progNeonGrid, 'a_pos');
    const gUv = gl.getAttribLocation(progNeonGrid, 'a_uv');
    gl.enableVertexAttribArray(gPos);
    gl.enableVertexAttribArray(gUv);
    gl.bindBuffer(gl.ARRAY_BUFFER, gpu.posBuf);
    gl.vertexAttribPointer(gPos, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, gpu.uvBuf);
    gl.vertexAttribPointer(gUv, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gpu.idxBuf);
    gl.drawElements(gl.TRIANGLES, gpu.iCount, gpu.idxType, 0);
  }

  // WE cloudsbg shader: fullscreen scrolling clouds + horizon glow.
  const vsCloudsBg = \`
    attribute vec2 a_corner;
    attribute vec2 a_uv;
    uniform float u_time;
    uniform float u_aspect;
    varying vec2 v_uv;
    varying vec4 v_tcClouds;
    void main() {
      gl_Position = vec4(a_corner * 2.0, 0.0, 1.0);
      v_uv = a_uv;
      v_tcClouds.xy = (a_uv + u_time * 0.0007) * vec2(1.1, 1.1);
      v_tcClouds.zw = (a_uv - u_time * 0.0011) * vec2(0.7, 0.7);
      v_tcClouds.xz *= u_aspect;
      v_tcClouds.zw = vec2(-v_tcClouds.w, v_tcClouds.z);
    }
  \`;
  const fsCloudsBg = \`
    precision mediump float;
    varying vec2 v_uv;
    varying vec4 v_tcClouds;
    uniform sampler2D u_tex;
    uniform int u_hasTex;
    uniform vec3 u_color1;
    uniform vec3 u_colorHorizon;
    void main() {
      float cloud0 = u_hasTex == 1 ? texture2D(u_tex, v_tcClouds.xy).r : 0.0;
      float cloud1 = u_hasTex == 1 ? texture2D(u_tex, v_tcClouds.zw).r : 0.0;
      float cloudBlend = cloud0 * cloud1;
      vec3 albedo = u_color1 * cloudBlend;
      albedo += (u_color1 * 0.5 + albedo) * pow(smoothstep(0.5, 0.0, v_uv.y), 2.0) * 2.0;
      float horizonBend = 1.0 - cos(clamp(v_uv.x * 2.0 - 0.5, 0.0, 1.0) * 2.0 * 3.14159265);
      vec2 horizonDelta = (v_uv - vec2(0.5, 0.6)) * vec2(0.5, 1.5 - horizonBend * 0.3);
      albedo += u_colorHorizon * pow(smoothstep(0.5, 0.0, length(horizonDelta)), 2.0) * 2.0;
      gl_FragColor = vec4(albedo, 1.0);
    }
  \`;
  const progCloudsBg = createProgram(vsCloudsBg, fsCloudsBg);

  function drawCloudsBgLayer(layer, elapsed, width, height) {
    gl.useProgram(progCloudsBg);
    gl.bindBuffer(gl.ARRAY_BUFFER, spriteBuf);
    const cPos = gl.getAttribLocation(progCloudsBg, 'a_corner');
    const cUv = gl.getAttribLocation(progCloudsBg, 'a_uv');
    gl.enableVertexAttribArray(cPos);
    gl.enableVertexAttribArray(cUv);
    gl.vertexAttribPointer(cPos, 2, gl.FLOAT, false, 16, 0);
    gl.vertexAttribPointer(cUv, 2, gl.FLOAT, false, 16, 8);
    gl.uniform1f(gl.getUniformLocation(progCloudsBg, 'u_time'), elapsed);
    gl.uniform1f(gl.getUniformLocation(progCloudsBg, 'u_aspect'), width / Math.max(height, 1));
    const uc = layer.userColors || {};
    const c1 = uc.clouds || [0.05, 0.15, 0.4];
    const ch = uc.horizon || [0.05, 0.15, 0.4];
    gl.uniform3f(gl.getUniformLocation(progCloudsBg, 'u_color1'), c1[0], c1[1], c1[2]);
    gl.uniform3f(gl.getUniformLocation(progCloudsBg, 'u_colorHorizon'), ch[0], ch[1], ch[2]);
    if (layer.texUrl) {
      const texRec = loadTexture(layer.texUrl, true);
      if (texRec.loaded) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texRec.texture);
        gl.uniform1i(gl.getUniformLocation(progCloudsBg, 'u_tex'), 0);
        gl.uniform1i(gl.getUniformLocation(progCloudsBg, 'u_hasTex'), 1);
      } else {
        gl.uniform1i(gl.getUniformLocation(progCloudsBg, 'u_hasTex'), 0);
      }
    } else {
      gl.uniform1i(gl.getUniformLocation(progCloudsBg, 'u_hasTex'), 0);
    }
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  const spriteBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, spriteBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -0.5, -0.5, 0.0, 0.0,
     0.5, -0.5, 1.0, 0.0,
    -0.5,  0.5, 0.0, 1.0,
     0.5,  0.5, 1.0, 1.0,
  ]), gl.STATIC_DRAW);

  function drawBillboard(center, axisX, axisY, texUrl, color, proj, view) {
    gl.useProgram(progSprite);
    gl.uniformMatrix4fv(gl.getUniformLocation(progSprite, 'u_proj'), false, proj);
    gl.uniformMatrix4fv(gl.getUniformLocation(progSprite, 'u_view'), false, view);
    gl.bindBuffer(gl.ARRAY_BUFFER, spriteBuf);
    const cPos = gl.getAttribLocation(progSprite, 'a_corner');
    const cUv = gl.getAttribLocation(progSprite, 'a_uv');
    gl.enableVertexAttribArray(cPos);
    gl.enableVertexAttribArray(cUv);
    gl.vertexAttribPointer(cPos, 2, gl.FLOAT, false, 16, 0);
    gl.vertexAttribPointer(cUv, 2, gl.FLOAT, false, 16, 8);
    gl.uniform3f(gl.getUniformLocation(progSprite, 'u_center'), center[0], center[1], center[2]);
    gl.uniform2f(gl.getUniformLocation(progSprite, 'u_axisX'), axisX[0], axisX[1]);
    gl.uniform2f(gl.getUniformLocation(progSprite, 'u_axisY'), axisY[0], axisY[1]);
    gl.uniform4f(gl.getUniformLocation(progSprite, 'u_color'), color[0], color[1], color[2], color[3]);
    if (texUrl) {
      const texRec = loadTexture(texUrl);
      if (texRec.loaded) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texRec.texture);
        gl.uniform1i(gl.getUniformLocation(progSprite, 'u_tex'), 0);
        gl.uniform1i(gl.getUniformLocation(progSprite, 'u_hasTex'), 1);
      } else {
        gl.uniform1i(gl.getUniformLocation(progSprite, 'u_hasTex'), 0);
      }
    } else {
      gl.uniform1i(gl.getUniformLocation(progSprite, 'u_hasTex'), 0);
    }
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  // 3D particle system state, seeded from manifest.particles3d
  const particles3dState = new Map();
  function getParticles3d(sys) {
    if (!particles3dState.has(sys)) particles3dState.set(sys, { list: [], acc: 0 });
    return particles3dState.get(sys);
  }
  function updateParticles3d(sys, dt) {
    const st = getParticles3d(sys);
    st.acc += sys.rate * dt;
    while (st.acc >= 1 && st.list.length < sys.maxCount) {
      st.acc -= 1;
      // Random point on a sphere shell around the emitter origin.
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      const r = sys.distMin + Math.random() * (sys.distMax - sys.distMin);
      const lerp = (a, b) => a + Math.random() * (b - a);
      st.list.push({
        x: sys.origin[0] + r * Math.sin(ph) * Math.cos(th),
        y: sys.origin[1] + r * Math.sin(ph) * Math.sin(th),
        z: sys.origin[2] + r * Math.cos(ph),
        vx: lerp(sys.velMin[0], sys.velMax[0]),
        vy: lerp(sys.velMin[1], sys.velMax[1]),
        vz: lerp(sys.velMin[2], sys.velMax[2]),
        size: lerp(sys.sizeMin, sys.sizeMax),
        life: 0,
        maxLife: lerp(sys.lifeMin, sys.lifeMax),
        color: [lerp(sys.colorMin[0], sys.colorMax[0]), lerp(sys.colorMin[1], sys.colorMax[1]), lerp(sys.colorMin[2], sys.colorMax[2])],
      });
    }
    st.acc = Math.min(st.acc, 4);
    for (let i = st.list.length - 1; i >= 0; i--) {
      const p = st.list[i];
      p.life += dt;
      if (p.life >= p.maxLife) { st.list.splice(i, 1); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
    }
  }

  // Shared unit quad geometry (-0.5 to 0.5)
  const quadBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -0.5, -0.5, 0.0, 1.0,
     0.5, -0.5, 1.0, 1.0,
    -0.5,  0.5, 0.0, 0.0,
     0.5,  0.5, 1.0, 0.0,
  ]), gl.STATIC_DRAW);

  function loadTexture(url, repeat) {
    const key = repeat ? url + '|repeat' : url;
    if (textureCache.has(key)) return textureCache.get(key);
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0,0,0,0]));
    const record = { texture: tex, loaded: false, width: 1, height: 1 };
    textureCache.set(key, record);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      const wrap = repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE;
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
      record.loaded = true;
      record.width = img.width;
      record.height = img.height;
    };
    img.src = url;
    return record;
  }

  function activeTimePeriod(schedule, date) {
    if (!schedule) return null;
    const hour = date.getHours() + date.getMinutes() / 60;
    if (hour >= schedule.morning && hour < schedule.day) return 'morning';
    if (hour >= schedule.day && hour < schedule.dusk) return 'day';
    if (hour >= schedule.dusk && hour < schedule.night) return 'dusk';
    return 'night';
  }

  function layerEnabledByTime(layer, period) {
    return !layer.timePeriod || layer.timePeriod === period || (layer.timePeriod === 'manual' && period === null);
  }

  function loadVideoTexture(layer, enabled) {
    let record = videoTextureCache.get(layer.videoUrl);
    if (!record) {
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0,0,0,0]));
      const video = document.createElement('video');
      // The player iframe is sandboxed without allow-same-origin, so every
      // texture load is a cross-origin fetch from an opaque origin. Without
      // CORS mode the video taints the WebGL texture and texImage2D throws a
      // SecurityError, leaving the canvas blank (the scene-resource route
      // answers Origin: null with access-control-allow-origin: null).
      video.crossOrigin = 'anonymous';
      video.src = layer.videoUrl;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.preload = 'auto';
      record = { texture, video, loaded: false };
      video.addEventListener('loadeddata', () => { record.loaded = true; });
      videoTextureCache.set(layer.videoUrl, record);
    }
    if (enabled && !isPaused) { void record.video.play().catch(() => {}); }
    else record.video.pause();
    if (enabled && record.loaded && record.video.readyState >= 2) {
      gl.bindTexture(gl.TEXTURE_2D, record.texture);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, record.video);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }
    return record;
  }

  // FBO setup for reflection passes
  let fbo = null, fboTex = null, fboWidth = 0, fboHeight = 0;
  function ensureFbo(w, h) {
    if (fbo && fboWidth === w && fboHeight === h) return;
    fboWidth = w; fboHeight = h;
    if (fbo) gl.deleteFramebuffer(fbo);
    if (fboTex) gl.deleteTexture(fboTex);
    fbo = gl.createFramebuffer();
    fboTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, fboTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fboTex, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  function mat4Ortho(left, right, bottom, top, near, far) {
    const lr = 1 / (left - right);
    const bt = 1 / (bottom - top);
    const nf = 1 / (near - far);
    return new Float32Array([
      -2 * lr, 0, 0, 0,
      0, -2 * bt, 0, 0,
      0, 0, 2 * nf, 0,
      (left + right) * lr, (top + bottom) * bt, (far + near) * nf, 1
    ]);
  }

  function mat4Perspective(fovRad, aspect, near, far) {
    const f = 1.0 / Math.tan(fovRad / 2);
    const nf = 1.0 / (near - far);
    return new Float32Array([
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (far + near) * nf, -1,
      0, 0, 2 * far * near * nf, 0
    ]);
  }

  function mat4LookAt(eye, center, up) {
    let zx = eye[0] - center[0], zy = eye[1] - center[1], zz = eye[2] - center[2];
    let len = Math.hypot(zx, zy, zz) || 1;
    zx /= len; zy /= len; zz /= len;

    let xx = up[1] * zz - up[2] * zy, xy = up[2] * zx - up[0] * zz, xz = up[0] * zy - up[1] * zx;
    len = Math.hypot(xx, xy, xz) || 1;
    xx /= len; xy /= len; xz /= len;

    let yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;

    return new Float32Array([
      xx, yx, zx, 0,
      xy, yy, zy, 0,
      xz, yz, zz, 0,
      -(xx * eye[0] + xy * eye[1] + xz * eye[2]),
      -(yx * eye[0] + yy * eye[1] + yz * eye[2]),
      -(zx * eye[0] + zy * eye[1] + zz * eye[2]),
      1
    ]);
  }

  function mat4Transform3D(origin, angles, scale) {
    const ox = origin[0] || 0, oy = origin[1] || 0, oz = origin[2] || 0;
    const sx = scale[0] || 1, sy = scale[1] || 1, sz = scale[2] || 1;
    const ax = (angles[0] || 0) * Math.PI / 180;
    const ay = (angles[1] || 0) * Math.PI / 180;
    const az = (angles[2] || 0) * Math.PI / 180;

    const cx = Math.cos(ax), sxn = Math.sin(ax);
    const cy = Math.cos(ay), syn = Math.sin(ay);
    const cz = Math.cos(az), szn = Math.sin(az);

    const m00 = (cy * cz) * sx;
    const m01 = (cx * szn + sxn * syn * cz) * sx;
    const m02 = (sxn * szn - cx * syn * cz) * sx;

    const m10 = (-cy * szn) * sy;
    const m11 = (cx * cz - sxn * syn * szn) * sy;
    const m12 = (sxn * cz + cx * syn * szn) * sy;

    const m20 = syn * sz;
    const m21 = (-sxn * cy) * sz;
    const m22 = (cx * cy) * sz;

    return new Float32Array([
      m00, m01, m02, 0,
      m10, m11, m12, 0,
      m20, m21, m22, 0,
      ox,  oy,  oz,  1
    ]);
  }

  function mat3NormalMatrix(m4) {
    return new Float32Array([
      m4[0], m4[1], m4[2],
      m4[4], m4[5], m4[6],
      m4[8], m4[9], m4[10]
    ]);
  }

  const modelGpuCache = new Map();
  function getGpuMesh(mesh) {
    if (modelGpuCache.has(mesh)) return modelGpuCache.get(mesh);

    function b64ToF32(b64) {
      const bin = atob(b64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return new Float32Array(bytes.buffer);
    }
    function b64ToU16(b64) {
      const bin = atob(b64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return new Uint16Array(bytes.buffer);
    }
    function b64ToU32(b64) {
      const bin = atob(b64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return new Uint32Array(bytes.buffer);
    }
    // Meshes above 65535 vertices carry u32 indices (mesh.idx32), which
    // WebGL1 only exposes via OES_element_index_uint.
    const uintIndexExt = gl.getExtension('OES_element_index_uint');

    const posBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(gl.ARRAY_BUFFER, b64ToF32(mesh.posB64), gl.STATIC_DRAW);

    const normBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normBuf);
    gl.bufferData(gl.ARRAY_BUFFER, b64ToF32(mesh.normB64), gl.STATIC_DRAW);

    const uvBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
    gl.bufferData(gl.ARRAY_BUFFER, b64ToF32(mesh.uvB64), gl.STATIC_DRAW);

    const uv2Buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uv2Buf);
    gl.bufferData(gl.ARRAY_BUFFER, b64ToF32(mesh.uv2B64 || mesh.uvB64), gl.STATIC_DRAW);

    const idxBuf = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
    const idx32 = Boolean(mesh.idx32) && uintIndexExt;
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx32 ? b64ToU32(mesh.indicesB64) : b64ToU16(mesh.indicesB64), gl.STATIC_DRAW);

    const gpu = { posBuf, normBuf, uvBuf, uv2Buf, idxBuf, iCount: mesh.iCount, idxType: idx32 ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT };
    modelGpuCache.set(mesh, gpu);
    return gpu;
  }

  function mat4Transform2D(x, y, w, h, angleRad) {
    const c = Math.cos(angleRad || 0);
    const s = Math.sin(angleRad || 0);
    return new Float32Array([
      w * c,  w * s,  0, 0,
     -h * s,  h * c,  0, 0,
      0,      0,      1, 0,
      x,      y,      0, 1
    ]);
  }

  function spawnParticle(emitter, system) {
    const lifeMin = system.lifeMin || 3;
    const lifeMax = system.lifeMax || 5;
    const lifetime = lifeMin + Math.random() * (lifeMax - lifeMin);

    // Position
    let x = 0, y = 0, vx = 0, vy = 0;
    if (system.type === 'meteor') {
      x = 500 + Math.random() * 3000;
      y = 1200 + Math.random() * 800;
      const speed = 700 + Math.random() * 500;
      vx = -speed * 0.85;
      vy = -speed * 0.52;
    } else { // fireflies / sparkles
      x = 200 + Math.random() * 3440;
      y = 100 + Math.random() * 900;
      vx = (Math.random() - 0.5) * 25;
      vy = 10 + Math.random() * 20;
    }

    const size = system.size || (15 + Math.random() * 20);
    activeParticles.push({
      system,
      x, y, vx, vy,
      size,
      life: 0,
      maxLife: lifetime,
      color: system.color || [1, 1, 0.8, 1],
      trail: []
    });
  }

  function updateParticles(dt) {
    for (let i = activeParticles.length - 1; i >= 0; i--) {
      const p = activeParticles[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        activeParticles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.system.type === 'meteor') {
        p.trail.push({ x: p.x, y: p.y, life: p.life });
        if (p.trail.length > 8) p.trail.shift();
      } else {
        // Floating wander
        p.vx += (Math.random() - 0.5) * 15 * dt;
        p.vy += (Math.random() - 0.5) * 15 * dt;
      }
    }
  }
  // FBO for screen-space reflection (grid floor)
  let reflFbo = null;
  let reflTex = null;
  let reflDepth = null;
  let reflW = 0, reflH = 0;
  function ensureReflFbo(w, h) {
    if (reflW === w && reflH === h && reflFbo) return;
    if (reflFbo) { gl.deleteFramebuffer(reflFbo); gl.deleteTexture(reflTex); gl.deleteRenderbuffer(reflDepth); }
    reflFbo = gl.createFramebuffer();
    reflTex = gl.createTexture();
    reflDepth = gl.createRenderbuffer();
    gl.bindTexture(gl.TEXTURE_2D, reflTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindRenderbuffer(gl.RENDERBUFFER, reflDepth);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, w, h);
    gl.bindFramebuffer(gl.FRAMEBUFFER, reflFbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, reflTex, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, reflDepth);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    reflW = w; reflH = h;
  }

  function renderFrame(now) {
    if (!sceneData) {
      requestAnimationFrame(render);
      return;
    }

    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;
    const elapsed = (now - startTime) / 1000;

    if (!isPaused) {
      // Spawn particles periodically
      if (sceneData.hasMeteors && Math.random() < dt * 1.8) {
        spawnParticle({}, { type: 'meteor', lifeMin: 1.2, lifeMax: 2.2, size: 28, color: [1, 0.95, 0.85, 1], texUrl: sceneData.meteorTex });
      }
      if (sceneData.hasFireflies && activeParticles.filter(p => p.system.type === 'firefly').length < 35) {
        spawnParticle({}, { type: 'firefly', lifeMin: 4, lifeMax: 8, size: 14, color: [0.8, 1.0, 0.5, 0.85], texUrl: sceneData.sparkleTex });
      }
      updateParticles(dt);
    }

    // Size the backing store in device pixels: on HiDPI displays a CSS-pixel
    // canvas is upscaled by the compositor and the wallpaper looks soft
    // (capped at 2x to bound GPU cost on very high DPR screens).
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(window.innerWidth * dpr));
    const height = Math.max(1, Math.round(window.innerHeight * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    // Some WE scenes mark the project as 3D solely because they contain 3D
    // particle systems while their visual base is still ordinary image layers.
    // Route those mixed scenes through the 2D compositor and draw the decoded
    // artwork; the 3D-only branch otherwise clears an opaque canvas and shows
    // only particles over a gradient.
    if (sceneData.is3D && sceneData.models && sceneData.models.length > 0) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, width, height);
      const bg = sceneData.clearColor || [0.1, 0.1, 0.15];
      gl.clearColor(bg[0] * 0.4, bg[1] * 0.4, bg[2] * 0.4, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);
      gl.disable(gl.CULL_FACE);

      const isCarScene = Boolean(sceneData.carBodyColor);
      const aspect = width / height;
      const cam = sceneData.camera || { eye: [2.18, 1.98, 4.63], center: [0, 0.45, 0], up: [0, 1, 0], fov: 50 };
      const proj3D = mat4Perspective((cam.fov || 50) * Math.PI / 180, aspect, 0.1, 1000.0);

      // Camera animation: use scene-specific paths if available, otherwise slow orbit
      const camPaths = sceneData.cameraPaths;
      let eye, center, upVec;
      if (camPaths && camPaths.length > 0) {
        const totalDur = camPaths.reduce((s, p) => s + p.d, 0);
        const cycleTime = elapsed % totalDur;
        let accum = 0, seg = camPaths[0], segT = 0;
        for (const p of camPaths) {
          if (cycleTime < accum + p.d) { seg = p; segT = (cycleTime - accum) / p.d; break; }
          accum += p.d;
        }
        segT = segT * segT * (3 - 2 * segT);
        const lerp3 = (a, b, t) => [a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t, a[2]+(b[2]-a[2])*t];
        eye = lerp3(seg.e0, seg.e1, segT);
        center = lerp3(seg.c0, seg.c1, segT);
        upVec = lerp3(seg.u0, seg.u1, segT);
      } else if (sceneData.cameraStatic) {
        // Fixed scene camera (no animation paths)
        eye = [cam.eye[0], cam.eye[1], cam.eye[2]];
        center = [cam.center[0], cam.center[1], cam.center[2]];
        upVec = [cam.up[0], cam.up[1], cam.up[2]];
      } else {
        const cx = cam.center[0], cy = cam.center[1], cz = cam.center[2];
        const dx = cam.eye[0] - cx, dy = cam.eye[1] - cy, dz = cam.eye[2] - cz;
        const radius = Math.hypot(dx, dy, dz) || 4.5;
        const baseAngle = Math.atan2(dx, dz);
        const pitchAngle = Math.atan2(dy, Math.hypot(dx, dz));
        const yaw = baseAngle + elapsed * 0.05;
        const pitch = pitchAngle;
        eye = [cx + Math.sin(yaw) * Math.cos(pitch) * radius, cy + Math.sin(pitch) * radius, cz + Math.cos(yaw) * Math.cos(pitch) * radius];
        center = [cx, cy, cz];
        upVec = [0, 1, 0];
      }
      // Mouse parallax
      const targetYaw = (mouseX - 0.5) * 0.6;
      const targetPitch = (mouseY - 0.5) * 0.3;
      curRotY += (targetYaw - curRotY) * 0.04;
      curRotX += (targetPitch - curRotX) * 0.04;
      eye[0] += curRotY * 0.5;
      eye[1] += curRotX * 0.3;

      const view3D = mat4LookAt(eye, center, upVec);
      // Planar reflection: the FBO pass renders from a camera mirrored below
      // the floor plane (y=0), so the grid can sample it 1:1 by screen UV.
      const view3DRefl = mat4LookAt(
        [eye[0], -eye[1], eye[2]],
        [center[0], -center[1], center[2]],
        [upVec[0], -upVec[1], upVec[2]]);
      const bodyCol = sceneData.carBodyColor || [1, 0, 0];

      // (Re-)bind prog3D with all scene uniforms. Must be re-invoked after any
      // pass that switches to another program (bgLayers, billboards).
      function bindProg3D(viewOverride) {
        gl.useProgram(prog3D);
        gl.uniformMatrix4fv(gl.getUniformLocation(prog3D, 'u_proj'), false, proj3D);
        gl.uniformMatrix4fv(gl.getUniformLocation(prog3D, 'u_view'), false, viewOverride || view3D);
        gl.uniform3f(gl.getUniformLocation(prog3D, 'u_cameraPos'), eye[0], eye[1], eye[2]);
        gl.uniform1f(gl.getUniformLocation(prog3D, 'u_time'), elapsed);
        // WE-standard scene shading for generic scenes; car scenes keep their
        // dedicated paint/grid pipeline.
        gl.uniform1i(gl.getUniformLocation(prog3D, 'u_sceneStd'), isCarScene ? 0 : 1);
        // Engine-glow boost positions: origins of jet models (ricepod.vert).
        const jetPos = [];
        for (const model of sceneData.models) {
          const mName = (model.name || '').toLowerCase();
          const jetLike = mName.includes('jet') || (model.meshes || []).some((mm) => (mm.shader || '').toLowerCase().includes('jet'));
          if (jetLike && jetPos.length < 4) jetPos.push(model.origin || [0, 0, 0]);
        }
        gl.uniform1i(gl.getUniformLocation(prog3D, 'u_jetCount'), jetPos.length);
        for (let ji = 0; ji < 4; ji++) {
          const jp = jetPos[ji] || [0, 0, 0];
          gl.uniform3f(gl.getUniformLocation(prog3D, 'u_jetPos[' + ji + ']'), jp[0], jp[1], jp[2]);
        }
        const pointLights = sceneData.pointLights || [];
        gl.uniform1i(gl.getUniformLocation(prog3D, 'u_lightCount'), pointLights.length);
        for (let li = 0; li < 4; li++) {
          const light = pointLights[li] || { origin: [0, 0, 0], color: [0, 0, 0], radius: 1 };
          gl.uniform3f(gl.getUniformLocation(prog3D, 'u_lightPos[' + li + ']'), light.origin[0], light.origin[1], light.origin[2]);
          gl.uniform4f(gl.getUniformLocation(prog3D, 'u_lightColorRadius[' + li + ']'), light.color[0], light.color[1], light.color[2], light.radius);
        }
        const sky = sceneData.skyLightColor || [0, 0, 0];
        gl.uniform3f(gl.getUniformLocation(prog3D, 'u_skyLightColor'), sky[0], sky[1], sky[2]);
        // Ricepod uses lightDir (-0.577, 0.577, 0.577), car uses (0.577, 0.577, 0.577)
        gl.uniform3f(gl.getUniformLocation(prog3D, 'u_lightDir'), isCarScene ? 0.577 : -0.577, 0.577, 0.577);
        const amb = sceneData.clearColor || [0.1, 0.1, 0.15];
        // Generic scenes must preserve authored black ambient. Artificially
        // lifting it illuminated distant geometry that WE intentionally hides.
        const ambColor = isCarScene ? amb : (sceneData.ambientColor || [0, 0, 0]);
        gl.uniform3f(gl.getUniformLocation(prog3D, 'u_ambientColor'), ambColor[0], ambColor[1], ambColor[2]);
        gl.uniform3f(gl.getUniformLocation(prog3D, 'u_paintColor'), bodyCol[0], bodyCol[1], bodyCol[2]);
      }
      bindProg3D();

      const locPos = gl.getAttribLocation(prog3D, 'a_pos');
      const locNorm = gl.getAttribLocation(prog3D, 'a_norm');
      const locUv = gl.getAttribLocation(prog3D, 'a_uv');
      const locUv2 = gl.getAttribLocation(prog3D, 'a_uv2');
      gl.enableVertexAttribArray(locPos);
      gl.enableVertexAttribArray(locNorm);
      gl.enableVertexAttribArray(locUv);
      gl.enableVertexAttribArray(locUv2);

      // Per-submesh specular params (from WE material JSONs)
      const specMap = {
        body: [0.4, 6], glass: [5, 50], interior: [0.2, 15],
        matte: [0.5, 10], taillights: [0.25, 10], wheel: [1, 10],
      };
      function getSpecParams(texUrl) {
        if (!texUrl) return [0.3, 10];
        for (const [k, v] of Object.entries(specMap)) {
          if (texUrl.includes(k)) return v;
        }
        return [0.3, 10];
      }

      // Render in correct order: skybox/dome, opaque, shadow, grid, glass/additive
      const skyboxModels = [];
      const domeModels = [];
      const opaqueModels = [];
      const shadowModels = [];
      const gridModels = [];
      const glassQueue = [];
      const additiveQueue = [];
      const translucentQueue = [];
      const neonGridQueue = [];

      for (const model of sceneData.models) {
        const mName = (model.name || '').toLowerCase();
        if (mName === 'skybox') { skyboxModels.push(model); continue; }
        if (mName === 'dome') { domeModels.push(model); continue; }
        if (mName === 'shadow') { shadowModels.push(model); continue; }
        if (mName === 'grid') { gridModels.push(model); continue; }
        // Material blending flags decide the queue per mesh; the model name
        // 'jet' heuristic stays as a fallback for legacy manifests.
        const opaqueMeshes = [];
        for (const mesh of model.meshes) {
          const shName = (mesh.shader || '').toLowerCase();
          if (shName === 'neongrid') neonGridQueue.push({ model, mesh });
          else if (mesh.additive || mName.includes('jet')) additiveQueue.push({ model, mesh });
          else if (mesh.translucent) translucentQueue.push({ model, mesh });
          else opaqueMeshes.push(mesh);
        }
        if (opaqueMeshes.length > 0) opaqueModels.push({ ...model, meshes: opaqueMeshes });
      }

      // Helper to draw a mesh with given uniforms
      function drawMesh(model, mesh, flags) {
        let modelMat = mat4Transform3D(model.origin, model.angles, model.scale);
        // Skybox/aurora/thunder follow the camera position (WE shaders add
        // g_EyePosition to the vertex instead of a model transform).
        if (flags.skybox || flags.followEye) {
          modelMat = mat4Transform3D([eye[0], eye[1], eye[2]], model.angles, model.scale);
        }
        gl.uniformMatrix4fv(gl.getUniformLocation(prog3D, 'u_model'), false, modelMat);
        const normMat = mat3NormalMatrix(modelMat);
        gl.uniformMatrix3fv(gl.getUniformLocation(prog3D, 'u_normMat'), false, normMat);

        const gpu = getGpuMesh(mesh);
        gl.bindBuffer(gl.ARRAY_BUFFER, gpu.posBuf);
        gl.vertexAttribPointer(locPos, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, gpu.normBuf);
        gl.vertexAttribPointer(locNorm, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, gpu.uvBuf);
        gl.vertexAttribPointer(locUv, 2, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, gpu.uv2Buf);
        gl.vertexAttribPointer(locUv2, 2, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gpu.idxBuf);

        gl.uniform1i(gl.getUniformLocation(prog3D, 'u_isDome'), flags.dome ? 1 : 0);
        gl.uniform1i(gl.getUniformLocation(prog3D, 'u_isShadow'), flags.shadow ? 1 : 0);
        gl.uniform1i(gl.getUniformLocation(prog3D, 'u_isGrid'), flags.grid ? 1 : 0);
        gl.uniform1i(gl.getUniformLocation(prog3D, 'u_isSkybox'), flags.skybox ? 1 : 0);
        gl.uniform1i(gl.getUniformLocation(prog3D, 'u_isSelfIllum'), flags.selfIllum ? 1 : 0);
        gl.uniform1i(gl.getUniformLocation(prog3D, 'u_isCarBody'), flags.body ? 1 : 0);
        gl.uniform1i(gl.getUniformLocation(prog3D, 'u_isGlass'), flags.glass ? 1 : 0);
        gl.uniform1i(gl.getUniformLocation(prog3D, 'u_isJet'), flags.jet ? 1 : 0);
        gl.uniform1i(gl.getUniformLocation(prog3D, 'u_isAurora'), flags.aurora ? 1 : 0);
        gl.uniform1i(gl.getUniformLocation(prog3D, 'u_isThunder'), flags.thunder ? 1 : 0);
        gl.uniform1i(gl.getUniformLocation(prog3D, 'u_isBg'), flags.bg ? 1 : 0);
        gl.uniform1i(gl.getUniformLocation(prog3D, 'u_isNeonSun'), flags.neonSun ? 1 : 0);
        gl.uniform1i(gl.getUniformLocation(prog3D, 'u_gradFade'), mesh.gradFade ? 1 : 0);
        gl.uniform1i(gl.getUniformLocation(prog3D, 'u_hasTint'), mesh.tint || flags.neonSun ? 1 : 0);
        const uc = mesh.userColors || {};
        let tintCol = mesh.tint || [1, 1, 1];
        let tint2Col = mesh.tint2 || tintCol;
        if (flags.neonSun) {
          tintCol = uc.colorsuntop || tintCol;
          tint2Col = uc.colorsunbottom || tint2Col;
        }
        gl.uniform3f(gl.getUniformLocation(prog3D, 'u_tint'), tintCol[0], tintCol[1], tintCol[2]);
        gl.uniform3f(gl.getUniformLocation(prog3D, 'u_tint2'), tint2Col[0], tint2Col[1], tint2Col[2]);
        gl.uniform1i(gl.getUniformLocation(prog3D, 'u_hasLightmap'), 0);
        if (mesh.lightmapUrl) {
          const lightmapRec = loadTexture(mesh.lightmapUrl, false);
          if (lightmapRec.loaded) {
            gl.activeTexture(gl.TEXTURE2);
            gl.bindTexture(gl.TEXTURE_2D, lightmapRec.texture);
            gl.uniform1i(gl.getUniformLocation(prog3D, 'u_lightmap'), 2);
            gl.uniform1i(gl.getUniformLocation(prog3D, 'u_hasLightmap'), 1);
            gl.activeTexture(gl.TEXTURE0);
          }
        }
        // Second pass texture (normal/pattern slot), repeat-wrapped like bg clouds.
        if (mesh.texUrl2) {
          const tex2Rec = loadTexture(mesh.texUrl2, true);
          if (tex2Rec.loaded) {
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, tex2Rec.texture);
            gl.uniform1i(gl.getUniformLocation(prog3D, 'u_tex2'), 1);
            gl.activeTexture(gl.TEXTURE0);
          }
        }

        // WE material depth flags (orbital glows disable both).
        if (mesh.noDepthTest) gl.disable(gl.DEPTH_TEST);
        if (mesh.noDepthWrite) gl.depthMask(false);

        const sp = getSpecParams(mesh.texUrl);
        gl.uniform1f(gl.getUniformLocation(prog3D, 'u_specStrength'), sp[0]);
        gl.uniform1f(gl.getUniformLocation(prog3D, 'u_specPower'), sp[1]);

        if (flags.body) {
          const strCol = sceneData.carStripesColor || [0, 0, 0];
          gl.uniform3f(gl.getUniformLocation(prog3D, 'u_paintColor'), bodyCol[0], bodyCol[1], bodyCol[2]);
          gl.uniform3f(gl.getUniformLocation(prog3D, 'u_stripeColor'), strCol[0], strCol[1], strCol[2]);
        }

        // Load texture for all meshes that have one (including skybox)
        if (mesh.texUrl && !flags.dome && !flags.shadow && !flags.grid) {
          const texRec = loadTexture(mesh.texUrl, Boolean(mesh.repeatBase || flags.aurora || flags.bg));
          if (texRec.loaded) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texRec.texture);
            gl.uniform1i(gl.getUniformLocation(prog3D, 'u_tex'), 0);
            gl.uniform1i(gl.getUniformLocation(prog3D, 'u_hasTex'), 1);
          } else {
            gl.uniform1i(gl.getUniformLocation(prog3D, 'u_hasTex'), 0);
            gl.uniform3f(gl.getUniformLocation(prog3D, 'u_color'), 0.7, 0.7, 0.75);
          }
        } else {
          gl.uniform1i(gl.getUniformLocation(prog3D, 'u_hasTex'), 0);
          gl.uniform3f(gl.getUniformLocation(prog3D, 'u_color'), 0.65, 0.68, 0.72);
        }

        gl.drawElements(gl.TRIANGLES, gpu.iCount, gpu.idxType, 0);

        if (mesh.noDepthTest) gl.enable(gl.DEPTH_TEST);
        if (mesh.noDepthWrite) gl.depthMask(true);
      }

      // --- Pass 1: Render to FBO for reflection source (if car scene with grid) ---
      const hasGrid = isCarScene && gridModels.length > 0;
      if (hasGrid) {
        bindProg3D(view3DRefl); // mirrored camera for the reflection pass
        ensureReflFbo(width, height);
        // Unbind the reflection texture before rendering into its own FBO
        // (avoids a framebuffer/texture feedback loop from the last frame).
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, reflFbo);
        gl.viewport(0, 0, width, height);
        gl.clearColor(bg[0] * 0.4, bg[1] * 0.4, bg[2] * 0.4, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Dome to FBO
        gl.depthMask(false);
        gl.uniform1i(gl.getUniformLocation(prog3D, 'u_hasReflTex'), 0);
        for (const model of domeModels) {
          for (const mesh of model.meshes) drawMesh(model, mesh, { dome: true });
        }
        gl.depthMask(true);

        // Opaque car to FBO
        gl.disable(gl.BLEND);
        for (const model of opaqueModels) {
          for (const mesh of model.meshes) {
            const isBody = Boolean(isCarScene && mesh.texUrl && mesh.texUrl.includes('body'));
            const isGlass = Boolean(mesh.texUrl && mesh.texUrl.includes('glass'));
            if (!isGlass) drawMesh(model, mesh, { body: isBody });
          }
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      }

      // --- Pass 2: Render to screen ---
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, width, height);
      gl.clearColor(bg[0] * 0.4, bg[1] * 0.4, bg[2] * 0.4, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      bindProg3D(); // restore the real camera after the reflection pass

      // 0. Fullscreen background layers (cloudsbg etc.), no depth
      const bgLayers = sceneData.bgLayers || [];
      if (bgLayers.length > 0) {
        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.BLEND);
        for (const layer of bgLayers) {
          if ((layer.shader || '') === 'cloudsbg') drawCloudsBgLayer(layer, elapsed, width, height);
        }
        gl.enable(gl.DEPTH_TEST);
        bindProg3D(); // drawCloudsBgLayer switched the bound program
      }

      // 1. Skybox / Dome: render first, no depth write
      gl.depthMask(false);
      gl.uniform1i(gl.getUniformLocation(prog3D, 'u_hasReflTex'), 0);
      for (const model of skyboxModels) {
        for (const mesh of model.meshes) drawMesh(model, mesh, { skybox: true });
      }
      for (const model of domeModels) {
        for (const mesh of model.meshes) drawMesh(model, mesh, { dome: true });
      }
      gl.depthMask(true);

      // 2. Opaque parts (bg shader meshes render as fullscreen background)
      gl.disable(gl.BLEND);
      for (const model of opaqueModels) {
        for (const mesh of model.meshes) {
          const isBody = Boolean(isCarScene && mesh.texUrl && mesh.texUrl.includes('body'));
          const isGlass = Boolean(mesh.texUrl && mesh.texUrl.includes('glass'));
          if (isGlass) {
            glassQueue.push({ model, mesh });
            continue;
          }
          drawMesh(model, mesh, { body: isBody, bg: (mesh.shader || '') === 'bg' });
        }
      }

      // 2b. Translucent overlays, far-to-near: neongrid floor first, then
      // bgfade/neonsun on top. Translucent passes never write depth so their
      // transparent pixels cannot occlude later geometry.
      if (translucentQueue.length > 0 || neonGridQueue.length > 0) {
        gl.enable(gl.BLEND);
        gl.depthMask(false);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        for (const { model, mesh } of neonGridQueue) {
          drawNeonGrid(model, mesh, proj3D, view3D, elapsed);
        }
        gl.useProgram(prog3D);
        for (const { model, mesh } of translucentQueue) {
          drawMesh(model, mesh, { bg: (mesh.shader || '') === 'bg', neonSun: (mesh.shader || '') === 'neonsun' });
        }
        gl.depthMask(true);
        gl.disable(gl.BLEND);
      }

      // 3. Shadow (blended)
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      for (const model of shadowModels) {
        for (const mesh of model.meshes) drawMesh(model, mesh, { shadow: true });
      }

      // 4. Grid floor with FBO reflection
      if (hasGrid && reflTex) {
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, reflTex);
        gl.uniform1i(gl.getUniformLocation(prog3D, 'u_reflTex'), 1);
        gl.uniform1i(gl.getUniformLocation(prog3D, 'u_hasReflTex'), 1);
        gl.uniform2f(gl.getUniformLocation(prog3D, 'u_resolution'), width, height);
      }
      for (const model of gridModels) {
        for (const mesh of model.meshes) drawMesh(model, mesh, { grid: true });
      }
      gl.uniform1i(gl.getUniformLocation(prog3D, 'u_hasReflTex'), 0);

      // 5. Glass (blended)
      for (const { model, mesh } of glassQueue) {
        drawMesh(model, mesh, { glass: true });
      }

      // 6. Additive glow queue (jets, orbital effects, self-illuminated)
      // SRC_ALPHA, ONE: shaped by the shader's output alpha (aurora fade,
      // thunder sparkle); jets output alpha 1 so they behave as pure additive.
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      for (const { model, mesh } of additiveQueue) {
        const shaderName = (mesh.shader || '').toLowerCase();
        const jetLike = shaderName.includes('jet') || (mesh.texUrl || '').toLowerCase().includes('jet');
        const isAurora = !jetLike && shaderName.includes('aurora');
        const isThunder = !jetLike && shaderName.includes('thunder');
        drawMesh(model, mesh, {
          jet: jetLike,
          aurora: isAurora,
          thunder: isThunder,
          selfIllum: !jetLike && !isAurora && !isThunder,
          followEye: isAurora || isThunder,
        });
      }

      // 7. 3D sprites (sun glow billboards) and particle streaks (starfield)
      const sprites3d = sceneData.sprites || [];
      const systems3d = sceneData.particles3d || [];
      if (sceneData.models && sceneData.models.length > 0 && (sprites3d.length > 0 || systems3d.length > 0)) {
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE); // additive, texture-alpha shaped
        for (const sp of sprites3d) {
          // View-space offset = camera-facing quad (WE sprite.vert semantics:
          // right*(u-0.5) + up*(v-0.5), scaled by 0.5 * object scale).
          const w = 0.5 * (sp.scale ? sp.scale[0] : 1);
          const h = 0.5 * (sp.scale ? sp.scale[1] : 1);
          drawBillboard(sp.origin, [w, 0], [0, h], sp.texUrl, [1, 1, 1, 1], proj3D, view3D);
        }
        for (const sys of systems3d) {
          if (!isPaused) updateParticles3d(sys, dt);
          const st = getParticles3d(sys);
          for (const p of st.list) {
            const fade = Math.min(1, Math.min(p.life, p.maxLife - p.life) / (0.2 * p.maxLife));
            // Streak: stretch the quad along the view-space velocity.
            const vv = [
              view3D[0] * p.vx + view3D[4] * p.vy + view3D[8] * p.vz,
              view3D[1] * p.vx + view3D[5] * p.vy + view3D[9] * p.vz,
            ];
            const speed = Math.hypot(vv[0], vv[1]);
            const halfLen = p.size * 0.5 * (1 + Math.min(speed * 0.08, 4));
            const halfWid = p.size * 0.5;
            let px = 1, py = 0;
            if (speed > 0.001) { px = vv[0] / speed; py = vv[1] / speed; }
            const axisX = [px * halfLen * 2, py * halfLen * 2];
            const axisY = [-py * halfWid * 2, px * halfWid * 2];
            drawBillboard([p.x, p.y, p.z], axisX, axisY, sys.texUrl, [p.color[0], p.color[1], p.color[2], fade], proj3D, view3D);
          }
        }
      }

      gl.disable(gl.DEPTH_TEST);
      gl.disable(gl.CULL_FACE);
      gl.disable(gl.BLEND);
      requestAnimationFrame(render);
      return;
    }

    const sceneW = sceneData.width || 3840;
    const sceneH = sceneData.height || 2160;

    let scale = 1;
    if (fitMode === 'cover') {
      scale = Math.max(width / sceneW, height / sceneH);
    } else if (fitMode === 'contain') {
      scale = Math.min(width / sceneW, height / sceneH);
    } // fill: viewport covers the whole canvas (non-uniform stretch)

    const vpW = fitMode === 'fill' ? width : Math.round(sceneW * scale);
    const vpH = fitMode === 'fill' ? height : Math.round(sceneH * scale);
    const vpX = fitMode === 'fill' ? 0 : Math.round((width - vpW) / 2);
    const vpY = fitMode === 'fill' ? 0 : Math.round((height - vpH) / 2);

    ensureFbo(Math.min(sceneW, 2048), Math.min(sceneH, 1080));

    // Projection matrix mapping scene coords (0..sceneW, 0..sceneH) to clip space (-1..1)
    const proj = mat4Ortho(0, sceneW, 0, sceneH, -1000, 1000);

    // WE serializes scene image objects in painter order: the base is first and
    // overlays/effect layers follow it. Preserve that order. Reversing it makes
    // an opaque base layer cover flow/sway shaders and every foreground component,
    // which presents live scenes as a wrongly cropped static texture.
    const currentPeriod = activeTimePeriod(sceneData.timeSchedule, new Date());
    const renderLayers = sceneData.layers.filter((layer) => layerEnabledByTime(layer, currentPeriod));
    // Pause inactive time-period videos immediately; only the author-selected
    // morning/day/dusk/night layer may consume decode resources.
    for (const layer of sceneData.layers) {
      if (layer.videoUrl) loadVideoTexture(layer, layerEnabledByTime(layer, currentPeriod));
    }

    // Pass 1: Render background and sky layers into FBO for reflections
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.viewport(0, 0, fboWidth, fboHeight);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    gl.useProgram(progBasic);
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
    const aPos = gl.getAttribLocation(progBasic, 'a_pos');
    const aUv = gl.getAttribLocation(progBasic, 'a_uv');
    gl.enableVertexAttribArray(aPos);
    gl.enableVertexAttribArray(aUv);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 16, 0);
    gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 16, 8);

    gl.uniformMatrix4fv(gl.getUniformLocation(progBasic, 'u_proj'), false, proj);
    gl.uniform1f(gl.getUniformLocation(progBasic, 'u_time'), elapsed);
    gl.uniform4f(gl.getUniformLocation(progBasic, 'u_uvRect'), 0, 0, 1, 1);
    gl.uniform1f(gl.getUniformLocation(progBasic, 'u_bright'), 1);
    gl.uniform1f(gl.getUniformLocation(progBasic, 'u_power'), 1);

    // Render sky & upper layers into FBO
    for (const layer of renderLayers) {
      if (layer.isGround || layer.isReflection) continue;
      const texRec = layer.videoUrl ? loadVideoTexture(layer, true) : loadTexture(layer.texUrl);
      if (!texRec.loaded) continue;

      const model = mat4Transform2D(layer.x, layer.y, layer.w, layer.h, layer.angle || 0);
      gl.uniformMatrix4fv(gl.getUniformLocation(progBasic, 'u_model'), false, model);
      gl.uniform1f(gl.getUniformLocation(progBasic, 'u_alpha'), layer.alpha != null ? layer.alpha : 1.0);
      gl.uniform3f(gl.getUniformLocation(progBasic, 'u_tint'), 1, 1, 1);
      gl.uniform1f(gl.getUniformLocation(progBasic, 'u_sway'), layer.sway || 0);
      gl.uniform1f(gl.getUniformLocation(progBasic, 'u_sway_speed'), layer.swaySpeed || 1.0);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texRec.texture);
      gl.uniform1i(gl.getUniformLocation(progBasic, 'u_tex'), 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    // Pass 2: Render to screen viewport
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(vpX, vpY, vpW, vpH);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Render all layers (Sky -> Ground -> Reflection -> Particles)
    for (const layer of renderLayers) {
      if (layer.isReflection) {
        // Water Reflection Pass
        const maskRec = loadTexture(layer.texUrl);
        if (!maskRec.loaded) continue;

        gl.useProgram(progReflection);
        gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
        const rPos = gl.getAttribLocation(progReflection, 'a_pos');
        const rUv = gl.getAttribLocation(progReflection, 'a_uv');
        gl.enableVertexAttribArray(rPos);
        gl.enableVertexAttribArray(rUv);
        gl.vertexAttribPointer(rPos, 2, gl.FLOAT, false, 16, 0);
        gl.vertexAttribPointer(rUv, 2, gl.FLOAT, false, 16, 8);

        // Draw the reflection quad at the layer's own rect (fullscreen for
        // legacy scene-wide reflection layers).
        const model = mat4Transform2D(layer.x, layer.y, layer.w, layer.h, layer.angle || 0);
        gl.uniformMatrix4fv(gl.getUniformLocation(progReflection, 'u_proj'), false, proj);
        gl.uniformMatrix4fv(gl.getUniformLocation(progReflection, 'u_model'), false, model);
        gl.uniform4f(gl.getUniformLocation(progReflection, 'u_uvRect'), 0, 0, 1, 1);
        gl.uniform1f(gl.getUniformLocation(progReflection, 'u_time'), elapsed);
        gl.uniform1f(gl.getUniformLocation(progReflection, 'u_alpha'), 0.85);

        // Scene-uv rect of the quad (scene v grows downward, 0 at the top).
        const rectLeftU = (layer.x - layer.w / 2) / sceneW;
        const rectTopV = 1 - (layer.y + layer.h / 2) / sceneH;
        gl.uniform4f(gl.getUniformLocation(progReflection, 'u_rect'),
          rectLeftU, rectTopV, layer.w / sceneW, layer.h / sceneH);
        // Water line follows the scene data when the parser resolved one;
        // otherwise keep the legacy 0.65 / 0.42 / 0.38 window.
        const waterLine = typeof layer.waterLine === 'number' ? layer.waterLine : 0.65;
        const depthScale = (1 - waterLine) / 0.35;
        gl.uniform1f(gl.getUniformLocation(progReflection, 'u_waterLine'), waterLine);
        gl.uniform2f(gl.getUniformLocation(progReflection, 'u_reflectRange'),
          waterLine - 0.23 * depthScale, 0.38 * depthScale);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, fboTex);
        gl.uniform1i(gl.getUniformLocation(progReflection, 'u_fbo'), 0);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, maskRec.texture);
        gl.uniform1i(gl.getUniformLocation(progReflection, 'u_mask'), 1);

        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        continue;
      }

      // WE flowimage layer (flowing nebula): mask + 3 cross-fading layers.
      // All four textures are sampled with the plain quad UV (WE stretches
      // mask and content over the whole quad); served PNGs are already
      // cropped to the image rect, and clamp wrapping matches clampuvs.
      if (layer.shader === 'flowimage' && layer.texUrls && layer.texUrls.length >= 4) {
        const recs = layer.texUrls.slice(0, 4).map((u) => loadTexture(u));
        if (!recs.every((r) => r.loaded)) continue;
        gl.useProgram(progFlow);
        gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
        const fPos = gl.getAttribLocation(progFlow, 'a_pos');
        const fUv = gl.getAttribLocation(progFlow, 'a_uv');
        gl.enableVertexAttribArray(fPos);
        gl.enableVertexAttribArray(fUv);
        gl.vertexAttribPointer(fPos, 2, gl.FLOAT, false, 16, 0);
        gl.vertexAttribPointer(fUv, 2, gl.FLOAT, false, 16, 8);
        const model = mat4Transform2D(layer.x, layer.y, layer.w, layer.h, layer.angle || 0);
        gl.uniformMatrix4fv(gl.getUniformLocation(progFlow, 'u_proj'), false, proj);
        gl.uniformMatrix4fv(gl.getUniformLocation(progFlow, 'u_model'), false, model);
        const fcrop = layer.uvCrop || [0, 0, 1, 1];
        gl.uniform4f(gl.getUniformLocation(progFlow, 'u_uvRect'), fcrop[0], fcrop[1], fcrop[2], fcrop[3]);
        gl.uniform1f(gl.getUniformLocation(progFlow, 'u_time'), elapsed);
        const nums = layer.nums || {};
        gl.uniform3f(gl.getUniformLocation(progFlow, 'u_speeds'),
          nums.Speed0 ?? 0.01, nums.Speed1 ?? 0.01, nums.Speed2 ?? 0.01);
        gl.uniform1f(gl.getUniformLocation(progFlow, 'u_amp'), nums.Amount ?? 1);
        gl.uniform1f(gl.getUniformLocation(progFlow, 'u_bright'), nums.Bright ?? 1);
        const units = ['u_mask', 'u_l1', 'u_l2', 'u_l3'];
        for (let ui = 0; ui < 4; ui++) {
          gl.activeTexture(gl.TEXTURE0 + ui);
          gl.bindTexture(gl.TEXTURE_2D, recs[ui].texture);
          gl.uniform1i(gl.getUniformLocation(progFlow, units[ui]), ui);
        }
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        gl.activeTexture(gl.TEXTURE0);
        continue;
      }

      // WE flag layer (rippling tinted cloth): eagleflag
      if (layer.shader === 'flag' && layer.texUrls && layer.texUrls.length >= 3) {
        const recs = layer.texUrls.slice(0, 3).map((u) => loadTexture(u, true));
        if (!recs.every((r) => r.loaded)) continue;
        gl.useProgram(progFlag);
        gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
        const flPos = gl.getAttribLocation(progFlag, 'a_pos');
        const flUv = gl.getAttribLocation(progFlag, 'a_uv');
        gl.enableVertexAttribArray(flPos);
        gl.enableVertexAttribArray(flUv);
        gl.vertexAttribPointer(flPos, 2, gl.FLOAT, false, 16, 0);
        gl.vertexAttribPointer(flUv, 2, gl.FLOAT, false, 16, 8);
        const model = mat4Transform2D(layer.x, layer.y, layer.w, layer.h, layer.angle || 0);
        gl.uniformMatrix4fv(gl.getUniformLocation(progFlag, 'u_proj'), false, proj);
        gl.uniformMatrix4fv(gl.getUniformLocation(progFlag, 'u_model'), false, model);
        const flcrop = layer.uvCrop || [0, 0, 1, 1];
        gl.uniform4f(gl.getUniformLocation(progFlag, 'u_uvRect'), flcrop[0], flcrop[1], flcrop[2], flcrop[3]);
        gl.uniform1f(gl.getUniformLocation(progFlag, 'u_time'), elapsed);
        const fnums = layer.nums || {};
        gl.uniform1f(gl.getUniformLocation(progFlag, 'u_speed'), fnums.Speed ?? 0.4);
        gl.uniform1f(gl.getUniformLocation(progFlag, 'u_strength'), fnums.Strength ?? 0.5);
        const fcols = layer.userColors || {};
        const fc1 = fcols.color1 || [0, 0, 0];
        const fc2 = fcols.color2 || [0, 0, 0];
        const fc3 = fcols.color3 || [1, 1, 1];
        gl.uniform3f(gl.getUniformLocation(progFlag, 'u_color1'), fc1[0], fc1[1], fc1[2]);
        gl.uniform3f(gl.getUniformLocation(progFlag, 'u_color2'), fc2[0], fc2[1], fc2[2]);
        gl.uniform3f(gl.getUniformLocation(progFlag, 'u_color3'), fc3[0], fc3[1], fc3[2]);
        const funits = ['u_tex', 'u_normal', 'u_cloth'];
        for (let ui = 0; ui < 3; ui++) {
          gl.activeTexture(gl.TEXTURE0 + ui);
          gl.bindTexture(gl.TEXTURE_2D, recs[ui].texture);
          gl.uniform1i(gl.getUniformLocation(progFlag, funits[ui]), ui);
        }
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        gl.activeTexture(gl.TEXTURE0);
        continue;
      }

      // Standard image or embedded-video layer.
      const texRec = layer.videoUrl ? loadVideoTexture(layer, true) : loadTexture(layer.texUrl);
      if (!texRec.loaded) continue;

      gl.useProgram(progBasic);
      gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 16, 0);
      gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 16, 8);

      const crop = layer.uvCrop || [0, 0, 1, 1];
      gl.uniform4f(gl.getUniformLocation(progBasic, 'u_uvRect'), crop[0], crop[1], crop[2], crop[3]);
      const lnums = layer.nums || {};
      gl.uniform1f(gl.getUniformLocation(progBasic, 'u_bright'), lnums.Bright ?? 1);
      gl.uniform1f(gl.getUniformLocation(progBasic, 'u_power'), lnums.Power ?? 1);

      const model = mat4Transform2D(layer.x, layer.y, layer.w, layer.h, layer.angle || 0);
      gl.uniformMatrix4fv(gl.getUniformLocation(progBasic, 'u_proj'), false, proj);
      gl.uniformMatrix4fv(gl.getUniformLocation(progBasic, 'u_model'), false, model);
      gl.uniform1f(gl.getUniformLocation(progBasic, 'u_time'), elapsed);
      gl.uniform1f(gl.getUniformLocation(progBasic, 'u_alpha'), layer.alpha != null ? layer.alpha : 1.0);
      gl.uniform3f(gl.getUniformLocation(progBasic, 'u_tint'), 1, 1, 1);
      gl.uniform1f(gl.getUniformLocation(progBasic, 'u_sway'), layer.sway || 0);
      gl.uniform1f(gl.getUniformLocation(progBasic, 'u_sway_speed'), layer.swaySpeed || 1.0);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texRec.texture);
      gl.uniform1i(gl.getUniformLocation(progBasic, 'u_tex'), 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    // Render Particles (Shooting Stars, Fireflies)
    if (activeParticles.length > 0) {
      gl.useProgram(progParticle);
      gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
      const pPos = gl.getAttribLocation(progParticle, 'a_pos');
      const pUv = gl.getAttribLocation(progParticle, 'a_uv');
      gl.enableVertexAttribArray(pPos);
      gl.enableVertexAttribArray(pUv);
      gl.vertexAttribPointer(pPos, 2, gl.FLOAT, false, 16, 0);
      gl.vertexAttribPointer(pUv, 2, gl.FLOAT, false, 16, 8);
      gl.uniformMatrix4fv(gl.getUniformLocation(progParticle, 'u_proj'), false, proj);
      gl.uniform4f(gl.getUniformLocation(progParticle, 'u_uvRect'), 0, 0, 1, 1);

      gl.blendFunc(gl.SRC_ALPHA, gl.ONE); // Additive luminous particles

      for (const p of activeParticles) {
        const progress = p.life / p.maxLife;
        const alpha = Math.sin(progress * Math.PI); // Fade in & out
        const texRec = p.system.texUrl ? loadTexture(p.system.texUrl) : null;
        if (texRec && texRec.loaded) {
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, texRec.texture);
          gl.uniform1i(gl.getUniformLocation(progParticle, 'u_tex'), 0);
        }

        // Draw trail if meteor
        if (p.trail && p.trail.length > 1) {
          for (let ti = 0; ti < p.trail.length; ti++) {
            const tp = p.trail[ti];
            const tRatio = (ti + 1) / p.trail.length;
            const tAlpha = alpha * tRatio * 0.6;
            const tModel = mat4Transform2D(tp.x, tp.y, p.size * tRatio * 1.5, p.size * 0.4, Math.atan2(p.vy, p.vx));
            gl.uniformMatrix4fv(gl.getUniformLocation(progParticle, 'u_model'), false, tModel);
            gl.uniform4f(gl.getUniformLocation(progParticle, 'u_color'), p.color[0], p.color[1], p.color[2], tAlpha);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
          }
        }

        const model = mat4Transform2D(p.x, p.y, p.size * (p.system.type === 'meteor' ? 3 : 1), p.size, Math.atan2(p.vy, p.vx));
        gl.uniformMatrix4fv(gl.getUniformLocation(progParticle, 'u_model'), false, model);
        gl.uniform4f(gl.getUniformLocation(progParticle, 'u_color'), p.color[0], p.color[1], p.color[2], alpha * p.color[3]);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    }

    requestAnimationFrame(render);
  }

  // Crash guard: a render exception must not freeze the wallpaper silently.
  function render(now) {
    try {
      if (contextLost) { requestAnimationFrame(render); return; }
      renderFrame(now);
    } catch (e) {
      if (!window.__weRenderErr) {
        window.__weRenderErr = 1;
        console.error('we-scene-player render error:', e && e.stack || String(e));
      }
      requestAnimationFrame(render);
    }
  }

  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    contextLost = true;
  });
  canvas.addEventListener('webglcontextrestored', () => {
    // WebGL objects are invalid after restoration. Ask the embedding
    // controller to rebuild this isolated renderer instead of drawing with
    // stale programs/textures. The player frame is sandboxed without
    // allow-same-origin, so the embedding page's origin is unknown here;
    // '*' delivers to the window the event source check identifies.
    window.parent.postMessage({ type: 'dsh-scene-needs-reload' }, '*');
  });

  // Load manifest
  const token = window.location.pathname.split('/').filter(Boolean).pop();
  fetch('/api/skin-center/we/scene-manifest/' + token)
    .then(res => res.json())
    .then(data => {
      if (data.ok && data.manifest) {
        sceneData = data.manifest;
      }
    })
    .catch(err => console.error('Failed to load scene manifest', err));

  // Listen for controller messages; only the embedding parent may steer the
  // player. Origin cannot filter here: the player runs sandboxed without
  // allow-same-origin, so an origin compare would be browser-dependent and
  // the parent's messages carry its real origin. Only the identity of the
  // sender (the exact embedding window) is trustworthy.
  window.addEventListener('message', (ev) => {
    if (ev.source !== window.parent) return;
    const msg = ev.data;
    if (!msg || typeof msg !== 'object') return;
    if (msg.type === 'dsh-set-fit' && msg.fit) {
      fitMode = msg.fit;
    } else if (msg.type === 'dsh-set-pause') {
      isPaused = !!msg.paused;
    } else if (msg.type === 'dsh-recover-renderer') {
      if (gl.isContextLost()) {
        const ext = gl.getExtension('WEBGL_lose_context');
        if (ext) ext.restoreContext();
        else window.parent.postMessage({ type: 'dsh-scene-needs-reload' }, '*');
      } else {
        // Force an immediate fresh frame after compositor/theme changes.
        renderFrame(performance.now());
      }
    }
  });

  requestAnimationFrame(render);
})();
</script>
</body>
</html>
`;

/**
 * The Wallpaper Engine Web API shim, served to web-type wallpaper iframes.
 *
 * Web wallpapers are authored against APIs that Wallpaper Engine injects
 * into its CEF host before the page scripts run: property listeners (user
 * customization values), the audio-level listener (64 stereo bands), and
 * LED/RGB hardware hooks. Inside the skin center there is no editor session
 * and no hardware, so the shim installs benign defaults: user properties are
 * seeded from the wallpaper's project.json defaults and delivered once the
 * page registers its listener, the audio listener registers but is fed
 * silence, and hardware APIs become no-ops. Wallpapers that never touch these
 * APIs are unaffected; wallpapers that do degrade to their non-reactive
 * visuals instead of crashing on undefined globals.
 * @module @linxin666/dsh-client-ui-skin-center/we-shim-source
 */

/** The shim source, injected ahead of every web wallpaper HTML document. */
const WE_SHIM_JS = [
  '(function () {',
  "  if (window.__dshWeShim) return;",
  "  window.__dshWeShim = true;",
  '  var props = {};',
  '  var defaults = window.__dshWeDefaultProps || {};',
  '  for (var dk in defaults) { props[dk] = defaults[dk]; }',
  '  window.wallpaperPropertyListener = {',
  '    applyUserProperties: function (p) {',
  '      if (p && typeof p === "object") { for (var k in p) { props[k] = p[k]; } }',
  '    },',
  '    applyGeneralProperties: function () {},',
  '    setUserProperty: function (k, v) { props[k] = v; },',
  '    getUserProperty: function (k) { return props[k]; }',
  '  };',
  '  // WE delivers the property defaults once the page listener is in place.',
  '  // Wallpapers typically replace wallpaperPropertyListener with their own',
  '  // object; frameworks (Angular etc.) bootstrap asynchronously and may not',
  '  // survive property delivery before their services are ready, so deliver',
  '  // at a few staggered points after load.',
  '  var deliver = function () {',
  '    try {',
  '      var l = window.wallpaperPropertyListener;',
  '      if (l && typeof l.applyUserProperties === "function" && Object.keys(defaults).length) {',
  '        l.applyUserProperties(defaults);',
  '      }',
  '    } catch (e) {}',
  '  };',
  '  var kick = function () {',
  '    var delays = [800, 2000, 4000];',
  '    for (var di = 0; di < delays.length; di++) {',
  '      setTimeout(deliver, delays[di]);',
  '    }',
  '  };',
  "  if (document.readyState === 'complete') { kick(); }",
  "  else { window.addEventListener('load', kick); }",
  '  var audioListener = null;',
  '  window.wallpaperRegisterAudioListener = function (cb) {',
  '    if (typeof cb === "function") audioListener = cb;',
  '  };',
  '  // Silence buffer WE wallpapers expect: 64 bands x 2 channels.',
  '  var silence = [];',
  '  for (var i = 0; i < 128; i++) silence.push(0);',
  '  window.__dshWeAudio = {',
  '    listener: function () { return audioListener; },',
  '    silence: silence,',
  '    pump: function () { if (audioListener) { try { audioListener(silence); } catch (e) {} } }',
  '  };',
  '  window.wallpaperRegisterLEDColorListener = function () {};',
  '  window.wallpaperRegisterFPSListener = function () {};',
  '})();',
  '',
].join('\n')

// ─── Scene Player Bridge ─────────────────────────────────────
/** Feed the DSH WebGL player through a sandboxed srcdoc instead of its DSH HTTP routes. */
function scenePlayerHtml(sound = false, volume = 100) {
  const audioSettings = `window.__hermesSceneSound=${Boolean(sound)};window.__hermesSceneVolume=${Math.min(100, Math.max(0, Number.isFinite(Number(volume)) ? Number(volume) : 100)) / 100};`
  const shim = `<script>
    (() => {
      let deliver;
      const manifest = new Promise(resolve => { deliver = resolve; });
      window.addEventListener('message', event => {
        if (event.source === window.parent && event.data?.type === 'hermes-scene-manifest') deliver(event.data.manifest);
      });
      const originalFetch = window.fetch.bind(window);
      window.fetch = (input, options) => String(input).startsWith('/api/skin-center/we/scene-manifest/')
        ? manifest.then(value => new Response(JSON.stringify({ ok: true, manifest: value }),
            { headers: { 'content-type': 'application/json' } }))
        : originalFetch(input, options);
    })();
  </script>`
  return WE_SCENE_PLAYER_HTML
    .replace('video.muted = true;', 'video.muted = !window.__hermesSceneSound; video.volume = window.__hermesSceneVolume;')
    .replace("} else if (msg.type === 'dsh-recover-renderer') {", `} else if (msg.type === 'dsh-set-audio') {
      window.__hermesSceneSound = !!msg.sound;
      window.__hermesSceneVolume = Math.max(0, Math.min(1, Number(msg.volume) / 100));
      for (const record of videoTextureCache.values()) {
        record.video.muted = !window.__hermesSceneSound;
        record.video.volume = window.__hermesSceneVolume;
      }
    } else if (msg.type === 'dsh-recover-renderer') {`)
    .replace('<script>', `<script>${audioSettings}</script>` + shim + '<script>')
}

function replaceResources(value, URLs) {
  if (typeof value === 'string') return URLs[value] || value
  if (Array.isArray(value)) return value.map(item => replaceResources(item, URLs))
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, replaceResources(item, URLs)]))
  }
  return value
}

async function loadSceneManifest(bridge, manifestPath) {
  if (!bridge?.readFileText || !bridge?.readFileDataUrl) throw new Error('Hermes local file bridge unavailable')
  const file = await bridge.readFileText(manifestPath)
  if (file?.truncated || !file?.text) throw new Error('Scene manifest is missing or truncated')
  const data = JSON.parse(file.text)
  if (!data.manifest || typeof data.resources !== 'object') throw new Error('Scene manifest is invalid')
  const paths = Object.entries(data.resources)
  const URLs = {}
  const objectUrls = []
  let totalBytes = 0
  try {
    // Read sequentially: several 100 MiB video layers can otherwise multiply
    // transient base64 and decoded buffers until the Hermes renderer runs OOM.
    for (const [url, path] of paths) {
      if (typeof path !== 'string') continue
      let data
      try { data = await bridge.readFileDataUrl(path) }
      catch {
        if (!bridge.readFileDataUrlForAttach) throw new Error('Scene resource exceeds the Hermes file-read limit')
        data = await bridge.readFileDataUrlForAttach(path)
      }
      const blob = await fetch(data).then(response => response.blob())
      totalBytes += blob.size
      if (totalBytes > 512 * 1024 * 1024) throw new Error('Scene resources exceed the 512 MiB renderer budget')
      const objectUrl = URL.createObjectURL(blob)
      objectUrls.push(objectUrl)
      URLs[url] = objectUrl
    }
    return { manifest: replaceResources(data.manifest, URLs), framePath: data.framePath,
      missing: data.missing || [], resourceCount: Object.keys(URLs).length,
      scripted: Boolean(data.scripted), objectUrls }
  } catch (error) {
    objectUrls.forEach(url => URL.revokeObjectURL(url))
    throw error
  }
}

// ─── Sandboxed Web Wallpaper Bridge ──────────────────────────
/** Build a sandboxed, self-contained Web Wallpaper document from local files. */
async function loadWebWallpaper(bridge, mainPath, shimSource = WE_SHIM_JS) {
  if (!bridge?.readDir || !bridge?.readFileText || !bridge?.readFileDataUrl) {
    throw new Error('Hermes local file bridge unavailable')
  }
  const root = mainPath.replace(/[\\/][^\\/]+$/, '')
  let count = 0
  const files = new Map()
  const queue = [{ dir: root, depth: 0 }]
  while (queue.length && count < 400) {
    const { dir, depth } = queue.shift()
    const listing = await bridge.readDir(dir)
    if (listing?.error) continue
    for (const entry of listing?.entries || []) {
      if (count >= 400) break
      const relative = entry.path.slice(root.length).replace(/^[\\/]+/, '').replace(/\\/g, '/')
      if (!relative || relative.includes('..') || !entry.path.toLowerCase().startsWith(root.toLowerCase())) continue
      if (entry.isDirectory) {
        if (depth < 4) queue.push({ dir: entry.path, depth: depth + 1 })
      } else {
        files.set(relative, entry.path)
        count++
      }
    }
  }
  const readText = async path => {
    let result = await bridge.readFileText(path)
    if (result?.truncated && bridge.readPluginSource) result = await bridge.readPluginSource(path)
    return result?.truncated ? null : result?.text || null
  }
  let html = await readText(mainPath)
  if (!html) throw new Error('Web Wallpaper HTML unavailable')
  const assets = new Map()
  const scripts = new Map()
  const styles = new Map()
  let dataBytes = 0
  for (const [relative, absolute] of files) {
    if (absolute.toLowerCase() === mainPath.toLowerCase()) continue
    if (/\.(js|mjs|json)$/i.test(relative)) {
      const text = await readText(absolute)
      if (text !== null) scripts.set(relative, text)
    } else if (/\.css$/i.test(relative)) {
      const text = await readText(absolute)
      if (text !== null) styles.set(relative, text)
    } else {
      try {
        const data = await bridge.readFileDataUrl(absolute)
        dataBytes += data.length
        if (dataBytes > 64 * 1024 * 1024) throw new Error('web wallpaper assets exceed 64 MiB')
        assets.set(relative, data)
      } catch { /* A decorative asset can be absent; the page still loads. */ }
    }
  }
  const basenameCounts = new Map()
  for (const key of assets.keys()) {
    const base = key.split('/').at(-1)
    basenameCounts.set(base, (basenameCounts.get(base) || 0) + 1)
  }
  const replaceAssets = source => {
    let result = source
    for (const [relative, data] of assets) {
      result = result.replaceAll(relative, data)
      const base = relative.split('/').at(-1)
      if (basenameCounts.get(base) === 1) result = result.replaceAll(base, data)
    }
    return result
  }
  for (const [relative, code] of scripts) {
    const escaped = replaceAssets(code).replace(/<\/script/gi, '<\\/script')
    const pattern = new RegExp(`<script([^>]*?)src=["'](?:\\./)?${relative.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']([^>]*)><\\/script>`, 'gi')
    html = html.replace(pattern, (_match, before, after) => `<script${before}${after}>${escaped}</script>`)
  }
  for (const [relative, css] of styles) {
    const escaped = replaceAssets(css).replace(/<\/style/gi, '<\\/style')
    const pattern = new RegExp(`<link([^>]*?)href=["'](?:\\./)?${relative.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']([^>]*)>`, 'gi')
    html = html.replace(pattern, () => `<style>${escaped}</style>`)
  }
  html = replaceAssets(html)
  let defaults = {}
  try {
    const projectPath = root + '\\project.json'
    const project = JSON.parse(await readText(projectPath))
    for (const [name, property] of Object.entries(project?.general?.properties || {})) {
      defaults[name] = { value: property?.value }
    }
  } catch { /* No editable project properties. */ }
  const seed = JSON.stringify(defaults).replace(/</g, '\\u003c')
  const prelude = `<script>window.__dshWeDefaultProps=${seed};</script><script>${shimSource}</script>`
  return /<head[^>]*>/i.test(html) ? html.replace(/<head[^>]*>/i, match => match + prelude) : prelude + html
}

// ─── Submodule: Try-On Banner ─────────────────────────────────
/**
 * Floating Try-On Banner
 * Shows status when user is currently trying on a skin.
 */




function TryOnBanner({ store, onApply, onExit }) {
  const t = usePluginI18n('hermes-skins')
  const tryOnSkin = useValue(store.$tryOnSkin)

  if (!tryOnSkin) return null

  const skinName = tryOnSkin.name || tryOnSkin.nameEn || tryOnSkin.id

  return jsxs('div', {
    className: 'mb-4 flex items-center justify-between rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 shadow-lg backdrop-blur-md',
    children: [
      jsxs('div', {
        className: 'flex items-center gap-3',
        children: [
          jsx('div', {
            className: 'flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/20 text-amber-500 font-bold',
            children: '✨'
          }),
          jsxs('div', {
            children: [
              jsx('div', {
                className: 'text-sm font-semibold text-foreground',
                children: t('tryOnBannerTitle', skinName)
              }),
              jsx('div', {
                className: 'text-xs text-muted-foreground',
                children: t('tryOnBannerDesc')
              })
            ]
          })
        ]
      }),
      jsxs('div', {
        className: 'flex items-center gap-2',
        children: [
          jsx(Button, {
            size: 'sm',
            variant: 'secondary',
            onClick: onExit,
            children: t('exitTryOnButton')
          }),
          jsx(Button, {
            size: 'sm',
            onClick: onApply,
            children: t('applyButton')
          })
        ]
      })
    ]
  })
}

// ─── Submodule: Custom Theme Studio ───────────────────────────
/**
 * Custom Theme Studio for Hermes Desktop
 * Allows users to craft their own palettes, pick wallpapers, and export/import skin JSON.
 */






function CustomThemeStudio({ store, onApplySkin }) {
  const t = usePluginI18n('hermes-skins')

  const [name, setName] = useState('')
  const [accent, setAccent] = useState('#6366f1')
  const [background, setBackground] = useState('#0b0f19')
  const [foreground, setForeground] = useState('#f8fafc')
  const [card, setCard] = useState('#111827')
  const [wallpaperUrl, setWallpaperUrl] = useState('')
  const [importError, setImportError] = useState('')
  const fileInputRef = useRef(null)
  const validColor = value => /^#[0-9a-f]{6}$/i.test(value)
  const valid = name.trim() && [accent, background, foreground, card].every(validColor) &&
    (!wallpaperUrl || normalizeMediaSource(wallpaperUrl, 'image'))
  const ink = parseInt(accent.slice(1, 3), 16) * 0.299 +
    parseInt(accent.slice(3, 5), 16) * 0.587 + parseInt(accent.slice(5, 7), 16) * 0.114 > 150
    ? '#111827' : '#ffffff'

  function handleSave() {
    if (!valid) return

    const customSkin = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      nameEn: name.trim(),
      author: 'You (Custom)',
      tagline: 'User-created bespoke palette & backdrop',
      description: 'Crafted in Hermes Theme Studio.',
      tags: ['art'],
      accent,
      wallpaper: wallpaperUrl || undefined,
      wallpaperType: 'image',
      defaultBlur: 4,
      defaultOcclusion: 30,
      colors: {
        background,
        foreground,
        card,
        cardForeground: foreground,
        muted: background,
        mutedForeground: '#94a3b8',
        popover: card,
        popoverForeground: foreground,
        primary: accent,
        primaryForeground: ink,
        secondary: card,
        secondaryForeground: foreground,
        accent,
        accentForeground: ink,
        border: '#1f2937',
        input: card,
        ring: accent,
        userBubble: card
      },
      darkColors: {
        background,
        foreground,
        card,
        cardForeground: foreground,
        muted: background,
        mutedForeground: '#94a3b8',
        popover: card,
        popoverForeground: foreground,
        primary: accent,
        primaryForeground: ink,
        secondary: card,
        secondaryForeground: foreground,
        accent,
        accentForeground: ink,
        border: '#1f2937',
        input: card,
        ring: accent,
        userBubble: card
      }
    }

    store.addCustomSkin(customSkin)
    onApplySkin(customSkin)
    setName('')
  }

  function handleExportJson() {
    const exportData = {
      skinManifestVersion: 2,
      id: name ? name.toLowerCase().replace(/\s+/g, '-') : 'custom-skin',
      name: name || 'Custom Skin',
      accent,
      colors: { background, foreground, card, accent },
      wallpaper: wallpaperUrl
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${exportData.id}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Import fills the form only; saving still registers the skin explicitly.
  function handleImportJson(file) {
    file.text().then(text => {
      const parsed = JSON.parse(text)
      const colors = parsed.colors || {}
      const color = value => {
        if (typeof value !== 'string' || !validColor(value)) throw new Error('invalid color')
        return value
      }
      const wallpaper = typeof parsed.wallpaper === 'string' ? parsed.wallpaper : ''
      if (wallpaper && !normalizeMediaSource(wallpaper, 'image')) throw new Error('invalid wallpaper')
      setName(typeof parsed.name === 'string' ? parsed.name : '')
      setAccent(color(parsed.accent ?? colors.accent))
      setBackground(color(colors.background))
      setForeground(color(colors.foreground))
      setCard(color(colors.card ?? colors.background))
      setWallpaperUrl(wallpaper)
      setImportError('')
    }).catch(() => setImportError(t('skinJsonInvalid')))
  }

  return jsxs('div', {
    className: 'flex flex-col gap-6 max-w-2xl',
    children: [
      jsxs('div', {
        className: 'flex flex-col gap-1',
        children: [
          jsx('h2', { className: 'text-lg font-semibold text-foreground', children: t('themeStudioTitle') }),
          jsx('p', { className: 'text-xs text-muted-foreground', children: t('themeStudioDesc') })
        ]
      }),
      jsxs('div', {
        'data-hermes-skins-surface': '',
        className: 'grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-md',
        children: [
          jsxs('div', {
            className: 'flex flex-col gap-2',
            children: [
              jsx('label', { className: 'text-xs font-medium text-foreground', children: t('customSkinName') }),
              jsx(Input, {
                value: name,
                onChange: e => setName(e.target.value),
                placeholder: t('customSkinNamePlaceholder')
              })
            ]
          }),
          jsxs('div', {
            className: 'flex flex-col gap-2',
            children: [
              jsx('label', { className: 'text-xs font-medium text-foreground', children: t('accentColor') }),
              jsxs('div', {
                className: 'flex items-center gap-2',
                children: [
                  jsx('input', {
                    type: 'color',
                    value: accent,
                    onChange: e => setAccent(e.target.value),
                    className: 'h-8 w-10 cursor-pointer rounded border border-border bg-transparent'
                  }),
                  jsx(Input, {
                    value: accent,
                    onChange: e => setAccent(e.target.value),
                    className: 'font-mono text-xs'
                  })
                ]
              })
            ]
          }),
          jsxs('div', {
            className: 'flex flex-col gap-2',
            children: [
              jsx('label', { className: 'text-xs font-medium text-foreground', children: t('backgroundColor') }),
              jsxs('div', {
                className: 'flex items-center gap-2',
                children: [
                  jsx('input', {
                    type: 'color',
                    value: background,
                    onChange: e => setBackground(e.target.value),
                    className: 'h-8 w-10 cursor-pointer rounded border border-border bg-transparent'
                  }),
                  jsx(Input, {
                    value: background,
                    onChange: e => setBackground(e.target.value),
                    className: 'font-mono text-xs'
                  })
                ]
              })
            ]
          }),
          jsxs('div', {
            className: 'flex flex-col gap-2',
            children: [
              jsx('label', { className: 'text-xs font-medium text-foreground', children: t('foregroundColor') }),
              jsxs('div', {
                className: 'flex items-center gap-2',
                children: [
                  jsx('input', {
                    type: 'color',
                    value: foreground,
                    onChange: e => setForeground(e.target.value),
                    className: 'h-8 w-10 cursor-pointer rounded border border-border bg-transparent'
                  }),
                  jsx(Input, {
                    value: foreground,
                    onChange: e => setForeground(e.target.value),
                    className: 'font-mono text-xs'
                  })
                ]
              })
            ]
          }),
          jsxs('div', {
            className: 'flex flex-col gap-2 md:col-span-2',
            children: [
              jsx('label', { className: 'text-xs font-medium text-foreground', children: t('wallpaperSource') }),
              jsx(Input, {
                value: wallpaperUrl,
                onChange: e => setWallpaperUrl(e.target.value),
                placeholder: t('wallpaperSourcePlaceholder')
              })
            ]
          })
        ]
      }),
      jsxs('div', {
        className: 'flex items-center justify-between gap-3',
        children: [
          jsxs('div', {
            className: 'flex items-center gap-2',
            children: [
              jsx(Button, {
                variant: 'outline',
                onClick: handleExportJson,
                children: t('exportSkinJson')
              }),
              jsx(Button, {
                variant: 'outline',
                onClick: () => fileInputRef.current?.click(),
                children: t('importSkinJson')
              }),
              jsx('input', {
                ref: fileInputRef, type: 'file', accept: '.json,application/json', style: { display: 'none' },
                onChange: event => {
                  const file = event.target.files?.[0]
                  if (file) handleImportJson(file)
                  event.target.value = ''
                }
              }),
              importError && jsx('span', { className: 'text-xs text-destructive', children: importError })
            ]
          }),
          jsx(Button, {
            onClick: handleSave,
            disabled: !valid,
            children: t('saveCustomSkin')
          })
        ]
      })
    ]
  })
}

// ─── Submodule: Wallpaper Engine Panel ───────────────────────
const PAGE_SIZE = 12

function WallpaperEnginePanel({ store, controller, preview, prepareScene }) {
  const t = usePluginI18n('hermes-skins')
  const config = useValue(store.$config)
  const [items, setItems] = useState([])
  const [libraries, setLibraries] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(0)
  const [previews, setPreviews] = useState({})
  const [importingId, setImportingId] = useState(null)
  const scanRevision = useRef(0)
  const bridge = typeof window !== 'undefined' ? window.hermesDesktop : null
  const rootsKey = config.weRoots.join('|')

  async function refresh() {
    const revision = ++scanRevision.current
    setLoading(true)
    setError('')
    try {
      const result = await scanWallpaperEngine(bridge, config.weRoots)
      if (revision !== scanRevision.current) return
      setItems(result.items)
      setLibraries(result.libraries)
      setPage(0)
      if (result.error) setError(result.error)
    } catch (cause) {
      if (revision === scanRevision.current) setError(String(cause?.message || cause))
    } finally {
      if (revision === scanRevision.current) setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
    return () => { scanRevision.current += 1 }
  }, [rootsKey])

  const filtered = items.filter(item => (filter === 'all' || item.kind === filter) &&
    (!query || item.title.toLocaleLowerCase().includes(query.toLocaleLowerCase())))
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const visible = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const visiblePaths = visible.map(item => item.previewPath).join('|')

  useEffect(() => {
    if (!bridge?.readFileDataUrl) return
    let cancelled = false
    const fetchPreviews = async () => {
      for (let start = 0; start < visible.length && !cancelled; start += 4) {
        await Promise.all(visible.slice(start, start + 4).map(async item => {
          if (previews[item.previewPath]) return
          try {
            const data = await bridge.readFileDataUrl(item.previewPath)
            if (!cancelled && typeof data === 'string' && data.startsWith('data:image/')) {
              setPreviews(current => ({ ...current, [item.previewPath]: data }))
            }
          } catch { /* A missing thumbnail must not block the inventory. */ }
        }))
      }
    }
    void fetchPreviews()
    return () => { cancelled = true }
  }, [visiblePaths])

  async function chooseFolder() {
    if (!bridge?.selectPaths) {
      setError(t('weBridgeUnavailable'))
      return
    }
    const paths = await bridge.selectPaths({ directories: true, multiple: false,
      defaultPath: libraries[0] || config.weRoots[0], title: t('weChooseFolder') })
    const selected = paths?.[0]
    if (selected && !config.weRoots.includes(selected)) {
      controller.changeConfig({ weRoots: [...config.weRoots, selected] })
    }
  }

  async function useWallpaper(item) {
    setError('')
    setImportingId(item.id)
    try {
      let source = wallpaperMediaUrl(item.mediaPath, item.mediaType)
      let type = item.mediaType
      let framePath = null
      let staticFallback = item.staticFallback
      if (item.kind === 'scene') {
        // Re-selecting the already-prepared scene must not depend on the
        // gateway: its unpacked manifest and preview frame are already on
        // disk and referenced by the current config.
        if (config.wallpaperType === 'scene' &&
            config.weSelection?.id === item.id && config.wallpaperSource &&
            !config.wallpaperSource.startsWith('data:')) {
          controller.changeConfig({ wallpaperEnabled: true })
          return
        }
        if (!prepareScene) throw new Error(t('weSceneBackendUnavailable'))
        const result = await prepareScene(item.dir)
        if (!result?.ok) throw new Error(result?.error || t('weSceneBackendUnavailable'))
        framePath = result.framePath || null
        if (result.manifest && result.manifestPath) {
          source = result.manifestPath
          type = 'scene'
          staticFallback = false
        } else if (result.videoPath) {
          source = wallpaperMediaUrl(result.videoPath, 'video')
          type = 'video'
          staticFallback = false
        } else if (framePath) {
          source = framePath
          type = 'image'
          staticFallback = true
        } else {
          throw new Error(t('weSceneUnsupported'))
        }
      }
      controller.changeConfig({
        wallpaperEnabled: true,
        wallpaperType: type,
        wallpaperSource: source,
        weSelection: { id: item.id, title: item.title, kind: item.kind, staticFallback,
          framePath, previewPath: item.previewPath }
      })
    } catch (cause) {
      // A blocked backend surfaces as an ipc 404 "Plugin not found" — map it
      // to the recovery action instead of the raw electron error text.
      const message = String(cause?.message || cause)
      setError(/Plugin not found|\b404\b/.test(message) ? t('weSceneBackendMissing') : message)
    } finally {
      setImportingId(null)
    }
  }

  const kindLabel = kind => t({ video: 'weTypeVideo', scene: 'weTypeScene', image: 'weTypeImage', web: 'weTypeWeb' }[kind] || 'weTypeOther')
  return jsxs('section', { 'data-hermes-skins-surface': '', className: 'rounded-xl border border-border bg-card p-5', children: [
    jsxs('div', { className: 'flex flex-wrap items-start justify-between gap-3', children: [
      jsxs('div', { className: 'space-y-1', children: [
        jsx('h2', { className: 'font-semibold text-foreground', children: t('weTitle') }),
        jsx('p', { className: 'text-xs text-muted-foreground', children: t('weDescription') })
      ] }),
      jsxs('div', { className: 'flex gap-2', children: [
        jsx(Button, { size: 'sm', variant: 'outline', onClick: chooseFolder, children: t('weChooseFolder') }),
        jsx(Button, { size: 'sm', variant: 'outline', onClick: refresh, disabled: loading,
          children: loading ? t('weScanning') : t('weRefresh') })
      ] })
    ] }),
    jsx('p', { className: 'mt-3 text-xs text-muted-foreground', children: loading ? t('weScanning') : t('weFound', items.length) }),
    error && jsx('p', { className: 'mt-2 text-xs text-destructive', children: error }),
    !loading && config.weSelection && items.length > 0 && !items.some(item => item.id === config.weSelection.id) &&
      jsx('p', { className: 'mt-2 text-xs text-amber-600', children: t('weMissing') }),
    jsxs('div', { className: 'mt-4 flex flex-wrap items-center gap-2', children: [
      jsx(Input, { value: query, onChange: event => { setQuery(event.target.value); setPage(0) },
        placeholder: t('weSearch'), className: 'max-w-64', 'aria-label': t('weSearch') }),
      ['all', 'video', 'scene', 'image', 'web'].map(value => jsx('button', {
        key: value, type: 'button', 'aria-pressed': filter === value,
        onClick: () => { setFilter(value); setPage(0) },
        className: `rounded-full px-2.5 py-1 text-xs ${filter === value ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground'}`,
        children: value === 'all' ? t('tagsAll') : kindLabel(value)
      }))
    ] }),
    !loading && items.length === 0 && jsx('p', { className: 'mt-4 text-sm text-muted-foreground', children: t('weEmpty') }),
    jsxs('div', { className: 'mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3', children: visible.map(item => {
      const selected = config.weSelection?.id === item.id
      return jsxs('article', { key: item.id, 'data-hermes-skins-surface': '', className: `overflow-hidden rounded-lg border bg-background ${selected ? 'border-primary' : 'border-border'}`, children: [
        previews[item.previewPath]
          ? jsx('img', { src: previews[item.previewPath], alt: '', loading: 'lazy', className: 'h-36 w-full object-cover' })
          : jsx('div', { className: 'h-36 bg-muted/40' }),
        jsxs('div', { className: 'space-y-2 p-3', children: [
          jsx('h3', { className: 'line-clamp-2 min-h-8 text-sm font-medium text-foreground', title: item.title, children: item.title }),
          jsx('p', { className: 'text-xs text-muted-foreground', children: item.kind === 'scene'
            ? `${kindLabel(item.kind)} · ${t('weSceneLive')}`
            : item.staticFallback ? `${kindLabel(item.kind)} · ${t('weStaticFallback')}` : kindLabel(item.kind) }),
          jsx(Button, { size: 'sm', className: 'w-full', disabled: Boolean(preview) || Boolean(importingId),
            variant: selected ? 'secondary' : 'default', onClick: () => void useWallpaper(item),
            children: importingId === item.id ? t('wePreparing') : selected ? t('weSelected') : t('weUse') })
        ] })
      ] })
    }) }),
    pages > 1 && jsxs('div', { className: 'mt-4 flex items-center justify-end gap-2 text-xs text-muted-foreground', children: [
      jsx(Button, { size: 'sm', variant: 'outline', disabled: page === 0,
        onClick: () => setPage(page - 1), children: '←' }),
      jsx('span', { children: `${page + 1} / ${pages}` }),
      jsx(Button, { size: 'sm', variant: 'outline', disabled: page + 1 >= pages,
        onClick: () => setPage(page + 1), children: '→' })
    ] })
  ] })
}

// ─── Submodule: Skin Center Page ──────────────────────────────
/** Browse position per tab plus the active tab itself, kept outside the
 *  component so leaving /skins for a conversation and coming back resumes
 *  where the user was. The page unmounts on route switches and the host gives
 *  no scroll restoration, so the memory has to outlive it (plugin lifetime). */
const viewMemory = { tab: 'gallery', gallery: 0, wallpaper: 0, studio: 0 }

function SkinCenterPage({ store, controller, prepareScene }) {
  const t = usePluginI18n('hermes-skins')
  const theme = useTheme()
  const config = useValue(store.$config)
  const preview = useValue(store.$tryOnSkin)
  const [tab, setTabState] = useState(viewMemory.tab)
  const setTab = id => { viewMemory.tab = id; setTabState(id) }
  const [tag, setTag] = useState('all')
  const [sourceDraft, setSourceDraft] = useState(config.wallpaperSource)
  const scrollRef = useRef(null)
  const skins = [...BUILTIN_SKINS, ...config.customSkins]
  const active = preview || controller.findSkin(theme.themeName)
  const customSourceValid = !sourceDraft || Boolean(normalizeMediaSource(sourceDraft, config.wallpaperType))

  useEffect(() => controller.sync(theme.themeName, theme.renderedMode),
    [controller, theme.themeName, theme.renderedMode, config, preview])
  useEffect(() => setSourceDraft(config.wallpaperSource), [config.wallpaperSource])
  useLayoutEffect(() => {
    const el = scrollRef.current
    const desired = viewMemory[tab] || 0
    if (!el || desired <= 0) return undefined
    el.scrollTop = desired
    // Wallpaper thumbnails grow the page asynchronously after mount, so the
    // first restore can be clamped by a still-short document. Re-apply for a
    // short window; the moment the user scrolls on their own, back off.
    if (el.scrollTop >= desired - 1) return undefined
    let cancelled = false
    let frames = 120
    const cancel = () => { cancelled = true }
    el.addEventListener('wheel', cancel, { passive: true, once: true })
    el.addEventListener('touchmove', cancel, { passive: true, once: true })
    const tick = () => {
      if (cancelled || !frames) return
      frames -= 1
      if (el.scrollTop >= desired - 1) return
      el.scrollTop = desired
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
    return cancel
  }, [tab])

  const commitSource = () => {
    if (customSourceValid && sourceDraft !== config.wallpaperSource) {
      controller.changeConfig({ wallpaperSource: sourceDraft, weSelection: null })
    }
  }

  // Slider bounds come from the single parameter contract in config.js, so the
  // UI can never offer a narrower range than normalization and rendering honor.
  const slider = (key, label, description, extraDisabled = false) => {
    const { min, max, unit } = PARAM_RANGES[key]
    return jsxs('label', {
      className: 'flex flex-col gap-1.5',
      children: [
        jsxs('span', { className: 'flex justify-between text-xs text-foreground', children: [
          jsx('span', { children: label }),
          jsx('span', { className: 'font-mono text-muted-foreground', children: `${config[key]}${unit}` })
        ] }),
        jsx('input', {
          type: 'range', min, max, step: 1, value: config[key],
          disabled: !(active || config.wallpaperSource) || Boolean(preview) || extraDisabled,
          onChange: event => controller.changeConfig({ [key]: Number(event.target.value) }),
          className: 'w-full accent-primary'
        }),
        jsx('span', { className: 'text-[11px] text-muted-foreground', children: description })
      ]
    })
  }

  const gallery = jsxs('div', { className: 'flex flex-col gap-5', children: [
    jsxs('div', { className: 'flex flex-wrap items-center gap-2', children: [
      jsx('span', { className: 'text-xs text-muted-foreground', children: t('filterByTag') }),
      ['all', 'art', 'anime', 'dark', 'light', 'cyber'].map(value => jsx('button', {
        key: value, type: 'button', onClick: () => setTag(value),
        'aria-pressed': tag === value,
        className: `rounded-full px-3 py-1 text-xs ${tag === value ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground hover:bg-accent/50'}`,
        children: t(`tags${value[0].toUpperCase()}${value.slice(1)}`)
      }))
    ] }),
    jsxs('div', { className: 'grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3', children: [
      jsxs('section', { 'data-hermes-skins-surface': '', className: 'flex flex-col justify-between gap-4 rounded-xl border border-border bg-card p-5', children: [
        jsxs('div', { className: 'space-y-2', children: [
          jsx('h2', { className: 'font-semibold text-foreground', children: t('resetToDefault') }),
          jsx('p', { className: 'text-xs text-muted-foreground', children: t('officialDefaultDesc') })
        ] }),
        jsx(Button, { variant: 'outline', onClick: () => controller.restore(theme),
          disabled: !active && !preview, children: t('resetToDefault') })
      ] }),
      skins.filter(s => tag === 'all' || s.tags?.includes(tag)).map(skin => {
        const isActive = theme.themeName === skin.id && !preview
        const isPreview = preview?.id === skin.id
        return jsxs('section', {
          key: skin.id,
          'data-hermes-skins-surface': '',
          className: 'flex flex-col overflow-hidden rounded-xl border border-border bg-card',
          children: [
            skin.wallpaper
              ? jsx('img', { src: skin.wallpaper, alt: '', className: 'h-32 w-full object-cover' })
              : jsx('div', { className: 'h-32', style: { background: skin.colors?.background || '#111827' } }),
            jsxs('div', { className: 'flex flex-1 flex-col gap-3 p-4', children: [
              jsxs('div', { className: 'flex items-center justify-between gap-2', children: [
                jsx('h2', { className: 'font-semibold text-foreground', children: skin.name }),
                isActive ? jsx(Badge, { children: t('activeBadge') }) :
                  isPreview ? jsx(Badge, { variant: 'secondary', children: t('tryOnBadge') }) : null
              ] }),
              jsx('p', { className: 'flex-1 text-xs text-muted-foreground', children: skin.tagline || skin.description }),
              jsxs('div', { className: 'flex gap-2', children: [
                jsx(Button, { size: 'sm', variant: 'secondary', className: 'flex-1',
                  onClick: () => controller.tryOn(skin, theme), children: t('tryOnButton') }),
                jsx(Button, { size: 'sm', className: 'flex-1', disabled: isActive,
                  onClick: () => controller.apply(skin, theme), children: t('applyButton') })
              ] })
            ] })
          ]
        })
      })
    ] })
  ] })

  const wallpaper = jsxs('div', { className: 'flex flex-col gap-5', children: [
    jsxs('section', { 'data-hermes-skins-surface': '', className: 'flex max-w-2xl flex-col gap-5 rounded-xl border border-border bg-card p-5', children: [
    jsxs('div', { className: 'flex items-center justify-between gap-4', children: [
      jsxs('div', { className: 'space-y-1', children: [
        jsx('h2', { className: 'font-semibold text-foreground', children: t('wallpaperControls') }),
        jsx('p', { className: 'text-xs text-muted-foreground', children: active || config.wallpaperSource ? t('enableWallpaperDesc') : t('selectSkinFirst') })
      ] }),
      jsx(Switch, { checked: Boolean((active || config.wallpaperSource) && (preview ? preview.wallpaper : config.wallpaperEnabled)), disabled: !(active || config.wallpaperSource) || Boolean(preview),
        'aria-label': t('enableWallpaper'), onCheckedChange: value => controller.changeConfig({ wallpaperEnabled: value }) })
    ] }),
    jsxs('label', { className: 'flex flex-col gap-2 text-xs text-foreground', children: [
      t('wallpaperType'),
      jsx(SegmentedControl, { value: config.wallpaperType, disabled: Boolean(preview),
        onChange: value => controller.changeConfig({ wallpaperType: value }),
        options: [
          { id: 'image', label: t('wallpaperTypeImage') },
          { id: 'video', label: t('wallpaperTypeVideo') },
          ...(config.wallpaperType === 'scene' ? [{ id: 'scene', label: t('weTypeScene') }] : []),
          ...(config.wallpaperType === 'web' ? [{ id: 'web', label: t('weTypeWeb') }] : [])
        ] })
    ] }),
    jsxs('label', { className: 'flex flex-col gap-2 text-xs text-foreground', children: [
      t('wallpaperMode'),
      jsx(SegmentedControl, { value: config.wallpaperMode, disabled: Boolean(preview),
        onChange: value => controller.changeConfig({ wallpaperMode: value }), options: [
          { id: 'live', label: t('wallpaperModeLive') },
          { id: 'frame', label: t('wallpaperModeFrame') }
        ] })
    ] }),
    jsxs('label', { className: 'flex flex-col gap-2 text-xs text-foreground', children: [
      t('wallpaperFit'),
      jsx(SegmentedControl, { value: config.wallpaperFit, disabled: Boolean(preview),
        onChange: value => controller.changeConfig({ wallpaperFit: value }), options: [
          { id: 'cover', label: t('wallpaperFitCover') },
          { id: 'contain', label: t('wallpaperFitContain') },
          { id: 'fill', label: t('wallpaperFitFill') }
        ] })
    ] }),
    jsxs('label', { className: 'flex flex-col gap-2 text-xs text-foreground', children: [
      t('wallpaperSource'),
      jsx(Input, { value: sourceDraft, disabled: Boolean(preview),
        onChange: event => setSourceDraft(event.target.value), onBlur: commitSource,
        onKeyDown: event => { if (event.key === 'Enter') commitSource() },
        placeholder: t('wallpaperSourcePlaceholder'), 'aria-invalid': !customSourceValid }),
      jsx('span', { className: 'text-[11px] text-muted-foreground', children: t('sourceCommitHint') }),
      !customSourceValid && jsx('span', { className: 'text-destructive', children: t('invalidWallpaperSource') })
    ] }),
    slider('wallpaperBlur', t('wallpaperBlur'), t('wallpaperBlurDesc')),
    slider('maskOcclusion', t('maskOcclusion'), t('maskOcclusionDesc')),
    slider('wallpaperOpacity', t('wallpaperOpacity'), t('wallpaperOpacityDesc')),
    slider('panelGlass', t('panelGlass'), t('panelGlassDesc')),
    slider('bubbleOpacity', t('bubbleOpacity'), t('bubbleOpacityDesc')),
    slider('composerFrost', t('composerFrost'), t('composerFrostDesc')),
    slider('surfaceFrost', t('surfaceFrost'), t('surfaceFrostDesc')),
    jsxs('label', { className: 'flex items-center justify-between gap-3 text-xs text-foreground', children: [
      t('pauseOnHidden'),
      jsx(Switch, { checked: config.pauseOnHidden, disabled: Boolean(preview),
        'aria-label': t('pauseOnHidden'), onCheckedChange: value => controller.changeConfig({ pauseOnHidden: value }) })
    ] }),
    config.wallpaperType === 'video' && jsxs('div', { className: 'flex flex-col gap-3', children: [
      jsxs('label', { className: 'flex items-center justify-between gap-3 text-xs text-foreground', children: [
        t('wallpaperSound'),
        jsx(Switch, { checked: config.wallpaperSound, disabled: Boolean(preview),
          'aria-label': t('wallpaperSound'), onCheckedChange: value => controller.changeConfig({ wallpaperSound: value }) })
      ] }),
      slider('wallpaperVolume', t('wallpaperVolume'), t('wallpaperVolumeDesc'), !config.wallpaperSound)
    ] })
    ] }),
    jsx(WallpaperEnginePanel, { store, controller, preview, prepareScene })
  ] })

  return jsxs('div', {
    'data-hermes-skins-page': '',
    ref: scrollRef,
    className: 'h-full w-full overflow-y-auto p-5 md:p-8',
    onScroll: event => { viewMemory[tab] = event.currentTarget.scrollTop },
    children: [
    jsxs('header', { className: 'mb-5 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4', children: [
      jsxs('div', { children: [
        jsx('h1', { className: 'text-2xl font-bold text-foreground', children: t('pluginName') }),
        jsx('p', { className: 'text-xs text-muted-foreground', children: t('pluginDesc') })
      ] }),
      jsx(SegmentedControl, { value: tab, onChange: setTab, options: [
        { id: 'gallery', label: t('tabGallery') },
        { id: 'wallpaper', label: t('tabWallpaper') },
        { id: 'studio', label: t('tabStudio') }
      ] })
    ] }),
    jsx(TryOnBanner, { store, onApply: () => preview && controller.apply(preview, theme),
      onExit: () => controller.exitTryOn(theme) }),
    tab === 'gallery' ? gallery : tab === 'wallpaper' ? wallpaper :
      jsx(CustomThemeStudio, { store, onApplySkin: skin => controller.apply(skin, theme) })
  ] })
}

// ─── Plugin Registration Entry ────────────────────────────────
const PLUGIN_ID = 'hermes-skins'

export default {
  id: PLUGIN_ID,
  name: 'Hermes Skin Center',
  defaultEnabled: true,

  register(ctx) {
    // 1. Register I18N
    ctx.i18n.register(I18N_DICTIONARY)

    // 2. Initialize engines & state
    const store = createSkinStore(ctx)
    const backdropManager = new BackdropManager()
    const glassController = new GlassController()
    const rangeController = new RangeController()
    rangeController.start()
    const controller = new SkinController(store, BUILTIN_SKINS, backdropManager, glassController)

    // 3. Register themes to core THEMES_AREA
    for (const skin of BUILTIN_SKINS) {
      ctx.register({
        id: `theme-${skin.id}`,
        area: THEMES_AREA,
        data: toThemeContribution(skin)
      })
    }
    for (const skin of store.$config.get().customSkins) {
      ctx.register({ id: `theme-${skin.id}`, area: THEMES_AREA, data: toThemeContribution(skin) })
    }

    // 4. Register Full Page Route (/skins)
    ctx.register({
      id: 'page',
      area: ROUTES_AREA,
      data: { path: '/skins' },
      render: () => jsx(SkinCenterPage, { store, controller,
        prepareScene: dir => ctx.rest('/scene/prepare', { method: 'POST', body: { dir } }) })
    })

    // 5. Register Sidebar Navigation Entry
    ctx.register({
      id: 'sidebar-nav',
      area: SIDEBAR_NAV_AREA,
      order: 85,
      data: {
        path: '/skins',
        label: '皮肤中心',
        codicon: 'symbol-color'
      }
    })

    // 6. Runtime theme watcher. The old status-bar chip carried this sync in a
    //    React effect; the watcher runs independent of any page or status-bar
    //    visibility, watches only the root theme attributes, and is disposed
    //    with the plugin. The bottom bar keeps no skin entry at all — the skin
    //    center page and the command palette remain the entries.
    const disposeThemeWatcher = watchRootTheme(store, controller)

    // 7. Register Command Palette actions
    ctx.register({
      id: 'cmd-open-skins',
      area: PALETTE_AREA,
      data: {
        id: 'hermes-skins.open-gallery',
        title: 'Skin Center: Open Gallery / 皮肤中心: 打开画廊',
        keywords: ['skin', 'theme', 'wallpaper', 'gallery', '换肤', '皮肤', '壁纸'],
        run: () => host.navigate('/skins')
      }
    })

    ctx.register({
      id: 'cmd-toggle-wallpaper',
      area: PALETTE_AREA,
      data: {
        id: 'hermes-skins.toggle-wallpaper',
        title: 'Skin Center: Toggle Wallpaper / 皮肤中心: 切换壁纸开关',
        keywords: ['skin', 'wallpaper', 'toggle', '壁纸'],
        run: () => {
          const next = !store.$config.get().wallpaperEnabled
          controller.changeConfig({ wallpaperEnabled: next })
          host.notify({
            kind: 'info',
            message: next ? 'Custom wallpaper enabled' : 'Custom wallpaper disabled'
          })
        }
      }
    })

    // Hermes owns the selected theme. A stored plugin selection never overrides it.
    if (typeof document !== 'undefined') {
      controller.sync(document.documentElement.dataset.hermesTheme || null,
        document.documentElement.dataset.hermesMode || 'dark')
    }

    // 9. Teardown on plugin reload / dispose: backdrop DOM, runtime CSS, the
    //    composer frost layer and the theme watcher all release together.
    if (typeof ctx.onDispose === 'function') {
      ctx.onDispose(() => {
        disposeThemeWatcher()
        rangeController.destroy()
        controller.destroy()
      })
    }
  }
}
