/**
 * Hermes Skin Center (hermes-skins)
 * Version: 1.0.0
 * Author: CaptainMusX (inspired by dsh-skins)
 * 
 * Standalone Desktop Plugin for Hermes Desktop.
 * Provides skin gallery, custom wallpaper/video engine, glassmorphism translucency,
 * try-on/apply workflows, and theme studio.
 */

import {
  atom, Badge, Button, Codicon, haptic, host, Input,
  PALETTE_AREA, Popover, PopoverContent, PopoverTrigger,
  ROUTES_AREA, SegmentedControl, SIDEBAR_NAV_AREA,
  STATUSBAR_AREAS, Switch, THEMES_AREA, Tip,
  usePluginI18n, useTheme, useValue
} from '@hermes/plugin-sdk'
import { useState, useEffect } from 'react'
import { jsx, jsxs } from 'react/jsx-runtime'

// ─── Submodule: i18n ──────────────────────────────────────────
const I18N_DICTIONARY = {
  en: {
    pluginName: 'Hermes Skin Center',
    pluginDesc: 'Theme customization, skin gallery and custom wallpaper engine for Hermes Desktop',
    tabGallery: 'Skin Gallery',
    tabWallpaper: 'Wallpaper & Glass',
    tabStudio: 'Theme Studio',
    activeBadge: 'Active',
    tryOnBadge: 'Trying On',
    applyButton: 'Apply Skin',
    tryOnButton: 'Try On',
    exitTryOnButton: 'Exit Try-on',
    resetToDefault: 'Official Default',
    officialDefaultDesc: 'Reset to Hermes original look and default transparent theme.',
    tryOnBannerTitle: '✨ You are trying on skin: {name}',
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
    wallpaperBlurDesc: 'Gaussian blur applied to the wallpaper (0px - 30px)',
    maskOcclusion: 'Backdrop Occlusion Mask',
    maskOcclusionDesc: 'Dark/Light scrim overlay opacity to ensure high readability of text (0% - 100%)',
    panelGlass: 'Panel Glass Transparency',
    panelGlassDesc: 'Make chat viewport, sidebar and surfaces translucent over the wallpaper (0% - 100%)',
    bubbleOpacity: 'Message Bubble Opacity',
    bubbleOpacityDesc: 'Translucency of user and assistant chat bubbles (0% - 100%)',
    composerFrost: 'Composer Frost Blur',
    composerFrostDesc: 'Frosted glass backdrop-filter behind message input box (0px - 25px)',
    themeStudioTitle: 'Custom Theme Studio',
    themeStudioDesc: 'Create and customize your personalized color palette and typography',
    accentColor: 'Accent Color',
    backgroundColor: 'Background Color',
    foregroundColor: 'Foreground Color',
    cardColor: 'Card / Surface Color',
    saveCustomSkin: 'Save as Custom Skin',
    exportSkinJson: 'Export Skin JSON',
    importSkinJson: 'Import Skin JSON',
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
    pluginDesc: '为 Hermes Desktop 提供主题定制、皮肤画廊与自定义壁纸/毛玻璃引擎',
    tabGallery: '皮肤画廊',
    tabWallpaper: '壁纸与背景控制',
    tabStudio: '主题工坊',
    activeBadge: '当前使用',
    tryOnBadge: '正在试穿',
    applyButton: '应用皮肤',
    tryOnButton: '试穿',
    exitTryOnButton: '退出试穿',
    resetToDefault: '官方默认',
    officialDefaultDesc: '恢复 Hermes 官方原生极简外观，清空自定义壁纸与增强样式。',
    tryOnBannerTitle: '✨ 正在试穿皮肤：{name}',
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
    wallpaperBlurDesc: '平滑模糊背景壁纸，减少背景噪点干扰 (0px - 30px)',
    maskOcclusion: '防遮挡遮罩不透明度',
    maskOcclusionDesc: '在壁纸上方覆盖深色/浅色自适应半透明遮罩，保证文字极高可读性 (0% - 100%)',
    panelGlass: '面板透光与毛玻璃强度',
    panelGlassDesc: '使主聊天视口、侧边栏及卡片呈现半透明透光效果 (0% - 100%)',
    bubbleOpacity: '消息气泡不透明度',
    bubbleOpacityDesc: '调节对话气泡的半透明磨砂质感 (0% - 100%)',
    composerFrost: '输入框磨砂毛玻璃',
    composerFrostDesc: '输入框底部专属磨砂滤镜，防止输入文字与壁纸重叠 (0px - 25px)',
    themeStudioTitle: '自定义主题工坊',
    themeStudioDesc: '自由调节专属配色方案，支持实时预览与保存为独立皮肤',
    accentColor: '主强调色 (Accent)',
    backgroundColor: '背景底色 (Background)',
    foregroundColor: '主要文字色 (Foreground)',
    cardColor: '卡片/表面色 (Card)',
    saveCustomSkin: '保存为自定义皮肤',
    exportSkinJson: '导出皮肤配置 (JSON)',
    importSkinJson: '导入皮肤配置 (JSON)',
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
/**
 * Backdrop & Wallpaper Engine for Hermes Desktop
 * Manages the fixed wallpaper layer, blur filters, occlusion masks and crossfades.
 */

const BACKDROP_ROOT_ID = 'hermes-skins-backdrop-root'
const BACKDROP_MEDIA_ID = 'hermes-skins-backdrop-media'
const BACKDROP_MASK_ID = 'hermes-skins-backdrop-mask'

class BackdropManager {
  constructor() {
    this.root = null
    this.mediaEl = null
    this.maskEl = null
    this.currentSrc = null
    this.currentType = null
  }

  ensureElements() {
    if (typeof document === 'undefined') return

    if (!this.root || !document.body.contains(this.root)) {
      let root = document.getElementById(BACKDROP_ROOT_ID)
      if (!root) {
        root = document.createElement('div')
        root.id = BACKDROP_ROOT_ID
        root.setAttribute('aria-hidden', 'true')
        root.style.cssText = `
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          z-index: -9999;
          pointer-events: none;
          overflow: hidden;
          contain: strict;
          transition: opacity 0.3s ease;
        `
        document.body.prepend(root)
      }
      this.root = root
    }

    if (!this.mediaEl || !this.root.contains(this.mediaEl)) {
      let mediaContainer = document.getElementById(BACKDROP_MEDIA_ID)
      if (!mediaContainer) {
        mediaContainer = document.createElement('div')
        mediaContainer.id = BACKDROP_MEDIA_ID
        mediaContainer.style.cssText = `
          position: absolute;
          inset: -30px;
          width: calc(100% + 60px);
          height: calc(100% + 60px);
          transition: filter 0.25s ease, opacity 0.4s ease;
          background-position: center;
          background-size: cover;
          background-repeat: no-repeat;
          will-change: filter, transform;
        `
        this.root.appendChild(mediaContainer)
      }
      this.mediaEl = mediaContainer
    }

    if (!this.maskEl || !this.root.contains(this.maskEl)) {
      let mask = document.getElementById(BACKDROP_MASK_ID)
      if (!mask) {
        mask = document.createElement('div')
        mask.id = BACKDROP_MASK_ID
        mask.style.cssText = `
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          transition: background-color 0.25s ease, opacity 0.3s ease;
          pointer-events: none;
        `
        this.root.appendChild(mask)
      }
      this.maskEl = mask
    }
  }

  update({ enabled, type, src, blur = 0, occlusion = 30, isDark = true }) {
    this.ensureElements()
    if (!this.root || !this.mediaEl || !this.maskEl) return

    if (!enabled || !src) {
      this.root.style.opacity = '0'
      this.root.style.visibility = 'hidden'
      return
    }

    this.root.style.visibility = 'visible'
    this.root.style.opacity = '1'

    // Update blur
    this.mediaEl.style.filter = blur > 0 ? `blur(${blur}px)` : 'none'

    // Update occlusion mask
    const maskAlpha = Math.min(Math.max(occlusion / 100, 0), 0.95)
    if (isDark) {
      this.maskEl.style.backgroundColor = `rgba(0, 0, 0, ${maskAlpha})`
    } else {
      this.maskEl.style.backgroundColor = `rgba(255, 255, 255, ${maskAlpha})`
    }

    // Media update
    if (this.currentSrc !== src || this.currentType !== type) {
      this.currentSrc = src
      this.currentType = type

      // Clear existing content
      this.mediaEl.innerHTML = ''
      this.mediaEl.style.backgroundImage = 'none'

      if (type === 'video') {
        const video = document.createElement('video')
        video.src = src
        video.autoplay = true
        video.loop = true
        video.muted = true
        video.playsInline = true
        video.style.cssText = `
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        `
        video.play().catch(() => {})
        this.mediaEl.appendChild(video)
      } else {
        // Image or Data URI / SVG
        this.mediaEl.style.backgroundImage = `url("${src}")`
      }
    }
  }

  destroy() {
    if (this.root && this.root.parentNode) {
      this.root.parentNode.removeChild(this.root)
    }
    this.root = null
    this.mediaEl = null
    this.maskEl = null
    this.currentSrc = null
  }
}

// ─── Submodule: Glass Controller ──────────────────────────────
/**
 * Glass & Style Controller for Hermes Desktop
 * Manages scoped runtime CSS, glassmorphism transparency, bubble opacity and composer frost.
 */

const STYLE_ID = 'hermes-skins-runtime-css'

class GlassController {
  constructor() {
    this.styleEl = null
  }

  ensureStyleElement() {
    if (typeof document === 'undefined') return
    if (!this.styleEl || !document.head.contains(this.styleEl)) {
      let el = document.getElementById(STYLE_ID)
      if (!el) {
        el = document.createElement('style')
        el.id = STYLE_ID
        el.dataset.plugin = 'hermes-skins'
        document.head.appendChild(el)
      }
      this.styleEl = el
    }
  }

  update({
    enabled,
    glassTransparency = 80,
    bubbleOpacity = 90,
    composerFrost = 12,
    customCSS = '',
    isDark = true
  }) {
    if (typeof document === 'undefined') return
    this.ensureStyleElement()

    const root = document.documentElement

    if (!enabled) {
      root.removeAttribute('data-hermes-skins-active')
      if (this.styleEl) {
        this.styleEl.textContent = ''
      }
      return
    }

    root.setAttribute('data-hermes-skins-active', 'true')

    const glassKeep = Math.min(Math.max(100 - glassTransparency, 0), 100)
    const bubbleKeep = Math.min(Math.max(bubbleOpacity, 0), 100)
    const frostBlur = Math.min(Math.max(composerFrost, 0), 30)

    const baseChrome = isDark ? 'rgba(10, 15, 28, 0.45)' : 'rgba(255, 255, 255, 0.55)'
    const sidebarChrome = isDark ? 'rgba(8, 12, 22, 0.65)' : 'rgba(248, 250, 252, 0.72)'
    const cardChrome = isDark ? 'rgba(19, 29, 56, 0.6)' : 'rgba(255, 255, 255, 0.75)'

    const css = `
      /* Root variables driven by Hermes Skins */
      :root[data-hermes-skins-active="true"] {
        --user-bubble-keep: ${bubbleKeep}%;
        --translucency-glass-keep: ${glassKeep}%;
        --ui-chat-surface-background: ${glassKeep === 0 ? 'transparent' : `color-mix(in srgb, var(--ui-bg-chrome, #0d1117) ${glassKeep}%, transparent)`};
        --ui-editor-surface-background: ${glassKeep === 0 ? 'transparent' : `color-mix(in srgb, var(--ui-bg-editor, #0d1117) ${glassKeep}%, transparent)`};
      }

      /* Chat container and transcript translucency */
      :root[data-hermes-skins-active="true"] [data-contrib-shell],
      :root[data-hermes-skins-active="true"] [data-slot="sidebar-wrapper"] {
        background-color: transparent !important;
      }

      /* Translucent Sidebar */
      :root[data-hermes-skins-active="true"] [data-slot="sidebar"] {
        background: ${sidebarChrome} !important;
        backdrop-filter: blur(16px) saturate(180%);
        -webkit-backdrop-filter: blur(16px) saturate(180%);
      }

      /* Chat viewport frosted glass cards */
      :root[data-hermes-skins-active="true"] .hermes-skins-card-translucent {
        background: ${cardChrome};
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      /* Composer Rich Input Frost Glass */
      :root[data-hermes-skins-active="true"] [data-slot="composer-rich-input"] {
        backdrop-filter: blur(${frostBlur}px) saturate(150%);
        -webkit-backdrop-filter: blur(${frostBlur}px) saturate(150%);
        background: ${baseChrome} !important;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }

      /* Chat messages bubble alpha adaptation */
      :root[data-hermes-skins-active="true"] [data-slot="aui_user-message-root"] button,
      :root[data-hermes-skins-active="true"] [data-slot="aui_user-message-root"] [data-glass-raised] {
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
      }

      /* Custom CSS from skin author */
      ${customCSS || ''}
    `

    this.styleEl.textContent = css
  }

  destroy() {
    if (typeof document !== 'undefined') {
      document.documentElement.removeAttribute('data-hermes-skins-active')
      if (this.styleEl && this.styleEl.parentNode) {
        this.styleEl.parentNode.removeChild(this.styleEl)
      }
    }
    this.styleEl = null
  }
}

// ─── Submodule: Storage ───────────────────────────────────────
/**
 * State & Persistence Manager for Hermes Skin Center
 * Powered by nanostores atoms and ctx.storage.
 */



const DEFAULT_CONFIG = {
  activeSkinId: 'blue-fantasy',
  wallpaperEnabled: true,
  wallpaperType: 'image',
  wallpaperSource: '',
  wallpaperBlur: 4,
  maskOcclusion: 32,
  panelGlass: 80,
  bubbleOpacity: 90,
  composerFrost: 12,
  customSkins: []
}

function createSkinStore(ctx) {
  const stored = ctx.storage.get('config', {})
  const initial = { ...DEFAULT_CONFIG, ...stored }

  // Core state atoms
  const $config = atom(initial)
  const $tryOnSkin = atom(null) // null if not trying on
  const $tryOnBackup = atom(null) // backup config to restore on exit

  function saveConfig(updater) {
    const prev = $config.get()
    const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
    $config.set(next)
    ctx.storage.set('config', next)
  }

  function startTryOn(skin) {
    if (!$tryOnBackup.get()) {
      $tryOnBackup.set({
        config: $config.get()
      })
    }
    $tryOnSkin.set(skin)
  }

  function exitTryOn() {
    const backup = $tryOnBackup.get()
    if (backup) {
      $config.set(backup.config)
      ctx.storage.set('config', backup.config)
      $tryOnBackup.set(null)
    }
    $tryOnSkin.set(null)
  }

  function applyTryOn() {
    const skin = $tryOnSkin.get()
    if (skin) {
      saveConfig(prev => ({
        ...prev,
        activeSkinId: skin.id,
        wallpaperEnabled: true,
        wallpaperType: skin.wallpaperType || 'image',
        wallpaperSource: skin.wallpaper || prev.wallpaperSource,
        wallpaperBlur: skin.defaultBlur !== undefined ? skin.defaultBlur : prev.wallpaperBlur,
        maskOcclusion: skin.defaultOcclusion !== undefined ? skin.defaultOcclusion : prev.maskOcclusion
      }))
    }
    $tryOnBackup.set(null)
    $tryOnSkin.set(null)
  }

  return {
    $config,
    $tryOnSkin,
    $tryOnBackup,
    saveConfig,
    startTryOn,
    exitTryOn,
    applyTryOn
  }
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
                children: t('tryOnBannerTitle', { name: skinName })
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





function CustomThemeStudio({ store, onApplySkin, onTryOnSkin }) {
  const t = usePluginI18n('hermes-skins')
  const config = useValue(store.$config)

  const [name, setName] = useState('')
  const [accent, setAccent] = useState('#6366f1')
  const [background, setBackground] = useState('#0b0f19')
  const [foreground, setForeground] = useState('#f8fafc')
  const [card, setCard] = useState('#111827')
  const [wallpaperUrl, setWallpaperUrl] = useState('')

  function handleSave() {
    if (!name.trim()) return

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
        primaryForeground: '#ffffff',
        secondary: card,
        secondaryForeground: foreground,
        accent,
        accentForeground: '#ffffff',
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
        primaryForeground: '#ffffff',
        secondary: card,
        secondaryForeground: foreground,
        accent,
        accentForeground: '#ffffff',
        border: '#1f2937',
        input: card,
        ring: accent,
        userBubble: card
      }
    }

    store.saveConfig(prev => ({
      ...prev,
      customSkins: [customSkin, ...(prev.customSkins || [])]
    }))

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
        className: 'flex items-center justify-between',
        children: [
          jsx(Button, {
            variant: 'outline',
            onClick: handleExportJson,
            children: t('exportSkinJson')
          }),
          jsxs('div', {
            className: 'flex items-center gap-2',
            children: [
              jsx(Button, {
                variant: 'secondary',
                onClick: () => {
                  onTryOnSkin({
                    id: 'custom-preview',
                    name: name || 'Preview',
                    accent,
                    wallpaper: wallpaperUrl,
                    colors: { background, foreground, card, accent }
                  })
                },
                children: t('tryOnButton')
              }),
              jsx(Button, {
                onClick: handleSave,
                disabled: !name.trim(),
                children: t('saveCustomSkin')
              })
            ]
          })
        ]
      })
    ]
  })
}

// ─── Submodule: Skin Center Page ──────────────────────────────
/**
 * Main Skin Center Page for Hermes Desktop
 * Route: /skins (or accessible via sidebar nav & palette)
 */








function SkinCenterPage({ store, backdropManager, glassController }) {
  const t = usePluginI18n('hermes-skins')
  const { setTheme, themeName } = useTheme()
  const config = useValue(store.$config)
  const tryOnSkin = useValue(store.$tryOnSkin)

  const [activeTab, setActiveTab] = useState('gallery')
  const [selectedTag, setSelectedTag] = useState('all')

  const allSkins = [...BUILTIN_SKINS, ...(config.customSkins || [])]

  const filteredSkins = allSkins.filter(skin => {
    if (selectedTag === 'all') return true
    return skin.tags && skin.tags.includes(selectedTag)
  })

  // Action handlers
  function handleTryOn(skin) {
    store.startTryOn(skin)
    if (skin.id !== 'official-default') {
      setTheme(skin.id)
      backdropManager.update({
        enabled: true,
        type: skin.wallpaperType || 'image',
        src: skin.wallpaper,
        blur: skin.defaultBlur !== undefined ? skin.defaultBlur : config.wallpaperBlur,
        occlusion: skin.defaultOcclusion !== undefined ? skin.defaultOcclusion : config.maskOcclusion,
        isDark: true
      })
      glassController.update({
        enabled: true,
        glassTransparency: config.panelGlass,
        bubbleOpacity: config.bubbleOpacity,
        composerFrost: config.composerFrost,
        customCSS: skin.customCSS,
        isDark: true
      })
    }
  }

  function handleExitTryOn() {
    store.exitTryOn()
    const active = allSkins.find(s => s.id === config.activeSkinId)
    if (active) {
      setTheme(active.id)
      backdropManager.update({
        enabled: config.wallpaperEnabled,
        type: config.wallpaperType,
        src: config.wallpaperSource || active.wallpaper,
        blur: config.wallpaperBlur,
        occlusion: config.maskOcclusion,
        isDark: true
      })
      glassController.update({
        enabled: true,
        glassTransparency: config.panelGlass,
        bubbleOpacity: config.bubbleOpacity,
        composerFrost: config.composerFrost,
        customCSS: active.customCSS,
        isDark: true
      })
    } else {
      setTheme('default')
      backdropManager.update({ enabled: false })
      glassController.update({ enabled: false })
    }
  }

  function handleApply(skin) {
    store.saveConfig(prev => ({
      ...prev,
      activeSkinId: skin.id,
      wallpaperEnabled: true,
      wallpaperType: skin.wallpaperType || 'image',
      wallpaperSource: skin.wallpaper || prev.wallpaperSource,
      wallpaperBlur: skin.defaultBlur !== undefined ? skin.defaultBlur : prev.wallpaperBlur,
      maskOcclusion: skin.defaultOcclusion !== undefined ? skin.defaultOcclusion : prev.maskOcclusion
    }))

    setTheme(skin.id)
    backdropManager.update({
      enabled: true,
      type: skin.wallpaperType || 'image',
      src: skin.wallpaper,
      blur: skin.defaultBlur !== undefined ? skin.defaultBlur : config.wallpaperBlur,
      occlusion: skin.defaultOcclusion !== undefined ? skin.defaultOcclusion : config.maskOcclusion,
      isDark: true
    })
    glassController.update({
      enabled: true,
      glassTransparency: config.panelGlass,
      bubbleOpacity: config.bubbleOpacity,
      composerFrost: config.composerFrost,
      customCSS: skin.customCSS,
      isDark: true
    })

    store.$tryOnSkin.set(null)
    store.$tryOnBackup.set(null)
  }

  function handleResetDefault() {
    store.saveConfig(prev => ({
      ...prev,
      activeSkinId: 'default',
      wallpaperEnabled: false
    }))
    setTheme('default')
    backdropManager.update({ enabled: false })
    glassController.update({ enabled: false })
    store.$tryOnSkin.set(null)
    store.$tryOnBackup.set(null)
  }

  return jsxs('div', {
    className: 'flex h-full w-full flex-col overflow-y-auto p-6 md:p-8',
    children: [
      // Header Section
      jsxs('div', {
        className: 'mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/40 pb-5',
        children: [
          jsxs('div', {
            className: 'flex flex-col gap-1',
            children: [
              jsx('h1', {
                className: 'text-2xl font-bold tracking-tight text-foreground',
                children: t('pluginName')
              }),
              jsx('p', {
                className: 'text-xs text-muted-foreground',
                children: t('pluginDesc')
              })
            ]
          }),
          jsx('div', {
            className: 'w-fit',
            children: jsx(SegmentedControl, {
              value: activeTab,
              onValueChange: setActiveTab,
              options: [
                { id: 'gallery', label: t('tabGallery') },
                { id: 'wallpaper', label: t('tabWallpaper') },
                { id: 'studio', label: t('tabStudio') }
              ]
            })
          })
        ]
      }),

      // Floating Try-On Banner
      jsx(TryOnBanner, {
        store,
        onApply: () => {
          if (tryOnSkin) handleApply(tryOnSkin)
        },
        onExit: handleExitTryOn
      }),

      // TAB 1: Gallery View
      activeTab === 'gallery' && jsxs('div', {
        className: 'flex flex-col gap-6',
        children: [
          // Filter Tags Bar
          jsxs('div', {
            className: 'flex flex-wrap items-center gap-2',
            children: [
              jsx('span', { className: 'text-xs text-muted-foreground mr-1', children: t('filterByTag') + ':' }),
              ['all', 'art', 'anime', 'dark', 'light', 'cyber'].map(tag => (
                jsx('button', {
                  key: tag,
                  type: 'button',
                  onClick: () => setSelectedTag(tag),
                  className: `rounded-full px-3 py-1 text-xs font-medium transition-all ${
                    selectedTag === tag
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`,
                  children: t(`tags${tag.charAt(0).toUpperCase() + tag.slice(1)}`)
                })
              ))
            ]
          }),

          // Cards Grid
          jsxs('div', {
            className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6',
            children: [
              // Official Default Card
              jsxs('div', {
                className: `group relative flex flex-col justify-between overflow-hidden rounded-xl border bg-card/60 p-5 backdrop-blur-md transition-all hover:border-primary/50 hover:shadow-lg ${
                  config.activeSkinId === 'default' && !tryOnSkin ? 'border-primary ring-1 ring-primary/40' : 'border-border/60'
                }`,
                children: [
                  jsxs('div', {
                    className: 'flex flex-col gap-3',
                    children: [
                      jsxs('div', {
                        className: 'flex items-center justify-between',
                        children: [
                          jsx('div', {
                            className: 'h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-lg font-bold text-foreground',
                            children: '⚪'
                          }),
                          config.activeSkinId === 'default' && !tryOnSkin && (
                            jsx(Badge, { variant: 'default', children: t('activeBadge') })
                          )
                        ]
                      }),
                      jsxs('div', {
                        className: 'flex flex-col gap-1',
                        children: [
                          jsx('h3', { className: 'text-base font-semibold text-foreground', children: t('resetToDefault') }),
                          jsx('p', { className: 'text-xs text-muted-foreground line-clamp-2', children: t('officialDefaultDesc') })
                        ]
                      })
                    ]
                  }),
                  jsx('div', {
                    className: 'mt-5 pt-3 border-t border-border/40',
                    children: jsx(Button, {
                      variant: config.activeSkinId === 'default' ? 'secondary' : 'outline',
                      size: 'sm',
                      className: 'w-full',
                      disabled: config.activeSkinId === 'default' && !tryOnSkin,
                      onClick: handleResetDefault,
                      children: t('resetToDefault')
                    })
                  })
                ]
              }),

              // Built-in & Custom Skins Cards
              filteredSkins.map(skin => {
                const isActive = config.activeSkinId === skin.id && !tryOnSkin
                const isTryingOn = tryOnSkin && tryOnSkin.id === skin.id

                return jsxs('div', {
                  key: skin.id,
                  className: `group relative flex flex-col justify-between overflow-hidden rounded-xl border bg-card/60 backdrop-blur-md transition-all hover:border-primary/50 hover:shadow-xl ${
                    isActive ? 'border-primary ring-2 ring-primary/30 shadow-md' : 'border-border/60'
                  } ${isTryingOn ? 'ring-2 ring-amber-500/50' : ''}`,
                  children: [
                    // Card Top Preview
                    jsxs('div', {
                      className: 'relative h-32 w-full overflow-hidden border-b border-border/40 bg-muted/40',
                      children: [
                        skin.wallpaper ? (
                          jsx('img', {
                            src: skin.wallpaper,
                            alt: skin.name,
                            className: 'h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
                          })
                        ) : (
                          jsx('div', {
                            className: 'h-full w-full flex items-center justify-center font-mono text-xs text-muted-foreground',
                            style: { background: `linear-gradient(135deg, ${skin.accent}33, ${skin.colors?.background || '#000'})` },
                            children: skin.name
                          })
                        ),
                        // Badges in preview
                        jsx('div', {
                          className: 'absolute top-2 right-2 flex items-center gap-1.5',
                          children: [
                            isActive && jsx(Badge, { key: 'act', variant: 'default', children: t('activeBadge') }),
                            isTryingOn && jsx(Badge, { key: 'try', variant: 'secondary', className: 'bg-amber-500 text-black', children: t('tryOnBadge') })
                          ]
                        }),
                        // Color swatch dot
                        jsx('div', {
                          className: 'absolute bottom-2 left-2 flex items-center gap-1.5 rounded-full bg-background/80 px-2 py-0.5 backdrop-blur-sm',
                          children: [
                            jsx('span', {
                              className: 'h-2.5 w-2.5 rounded-full shadow-sm',
                              style: { backgroundColor: skin.accent }
                            }),
                            jsx('span', {
                              className: 'font-mono text-[10px] text-foreground font-medium',
                              children: skin.accent
                            })
                          ]
                        })
                      ]
                    }),

                    // Card Content
                    jsxs('div', {
                      className: 'flex flex-1 flex-col justify-between p-4',
                      children: [
                        jsxs('div', {
                          className: 'flex flex-col gap-1.5',
                          children: [
                            jsx('h3', {
                              className: 'text-sm font-semibold text-foreground group-hover:text-primary transition-colors',
                              children: skin.name
                            }),
                            jsx('div', {
                              className: 'text-[11px] text-muted-foreground line-clamp-1',
                              children: skin.tagline || skin.description
                            }),
                            jsx('div', {
                              className: 'text-[10px] text-muted-foreground/75 mt-1',
                              children: `${t('author')}: ${skin.author}`
                            })
                          ]
                        }),
                        // Card Action Buttons
                        jsxs('div', {
                          className: 'mt-4 flex items-center gap-2 pt-3 border-t border-border/30',
                          children: [
                            jsx(Button, {
                              variant: 'secondary',
                              size: 'sm',
                              className: 'flex-1 text-xs',
                              onClick: () => handleTryOn(skin),
                              children: t('tryOnButton')
                            }),
                            jsx(Button, {
                              size: 'sm',
                              className: 'flex-1 text-xs',
                              disabled: isActive,
                              onClick: () => handleApply(skin),
                              children: t('applyButton')
                            })
                          ]
                        })
                      ]
                    })
                  ]
                })
              })
            ]
          })
        ]
      }),

      // TAB 2: Wallpaper Controls View
      activeTab === 'wallpaper' && jsxs('div', {
        className: 'flex flex-col gap-6 max-w-2xl',
        children: [
          jsxs('div', {
            className: 'flex flex-col gap-1',
            children: [
              jsx('h2', { className: 'text-lg font-semibold text-foreground', children: t('wallpaperControls') }),
              jsx('p', { className: 'text-xs text-muted-foreground', children: t('enableWallpaperDesc') })
            ]
          }),

          jsxs('div', {
            className: 'flex flex-col gap-5 rounded-xl border border-border/60 bg-card/60 p-5 backdrop-blur-md',
            children: [
              // Toggle Enable Wallpaper
              jsxs('div', {
                className: 'flex items-center justify-between',
                children: [
                  jsxs('div', {
                    className: 'flex flex-col gap-0.5',
                    children: [
                      jsx('span', { className: 'text-sm font-medium text-foreground', children: t('enableWallpaper') }),
                      jsx('span', { className: 'text-xs text-muted-foreground', children: t('enableWallpaperDesc') })
                    ]
                  }),
                  jsx(Switch, {
                    checked: config.wallpaperEnabled,
                    onCheckedChange: val => {
                      store.saveConfig({ wallpaperEnabled: val })
                      backdropManager.update({
                        enabled: val,
                        type: config.wallpaperType,
                        src: config.wallpaperSource,
                        blur: config.wallpaperBlur,
                        occlusion: config.maskOcclusion
                      })
                      glassController.update({
                        enabled: val,
                        glassTransparency: config.panelGlass,
                        bubbleOpacity: config.bubbleOpacity,
                        composerFrost: config.composerFrost
                      })
                    }
                  })
                ]
              }),

              // Wallpaper Type Selector
              jsxs('div', {
                className: 'flex flex-col gap-2',
                children: [
                  jsx('label', { className: 'text-xs font-medium text-foreground', children: t('wallpaperType') }),
                  jsx(SegmentedControl, {
                    value: config.wallpaperType,
                    onValueChange: val => {
                      store.saveConfig({ wallpaperType: val })
                      backdropManager.update({
                        enabled: config.wallpaperEnabled,
                        type: val,
                        src: config.wallpaperSource,
                        blur: config.wallpaperBlur,
                        occlusion: config.maskOcclusion
                      })
                    },
                    options: [
                      { id: 'image', label: t('wallpaperTypeImage') },
                      { id: 'video', label: t('wallpaperTypeVideo') }
                    ]
                  })
                ]
              }),

              // Wallpaper Source Input
              jsxs('div', {
                className: 'flex flex-col gap-2',
                children: [
                  jsx('label', { className: 'text-xs font-medium text-foreground', children: t('wallpaperSource') }),
                  jsxs('div', {
                    className: 'flex gap-2',
                    children: [
                      jsx(Input, {
                        value: config.wallpaperSource,
                        onChange: e => {
                          const val = e.target.value
                          store.saveConfig({ wallpaperSource: val })
                          backdropManager.update({
                            enabled: config.wallpaperEnabled,
                            type: config.wallpaperType,
                            src: val,
                            blur: config.wallpaperBlur,
                            occlusion: config.maskOcclusion
                          })
                        },
                        placeholder: t('wallpaperSourcePlaceholder'),
                        className: 'flex-1'
                      })
                    ]
                  })
                ]
              }),

              // Sliders Section
              // 1. Backdrop Blur Slider
              jsxs('div', {
                className: 'flex flex-col gap-1.5',
                children: [
                  jsxs('div', {
                    className: 'flex items-center justify-between',
                    children: [
                      jsx('span', { className: 'text-xs font-medium text-foreground', children: t('wallpaperBlur') }),
                      jsx('span', { className: 'text-xs font-mono text-muted-foreground', children: `${config.wallpaperBlur}px` })
                    ]
                  }),
                  jsx('input', {
                    type: 'range',
                    min: 0,
                    max: 30,
                    step: 1,
                    value: config.wallpaperBlur,
                    onChange: e => {
                      const val = parseInt(e.target.value, 10)
                      store.saveConfig({ wallpaperBlur: val })
                      backdropManager.update({
                        enabled: config.wallpaperEnabled,
                        type: config.wallpaperType,
                        src: config.wallpaperSource,
                        blur: val,
                        occlusion: config.maskOcclusion
                      })
                    },
                    className: 'w-full accent-primary cursor-pointer'
                  }),
                  jsx('span', { className: 'text-[11px] text-muted-foreground', children: t('wallpaperBlurDesc') })
                ]
              }),

              // 2. Occlusion Mask Slider
              jsxs('div', {
                className: 'flex flex-col gap-1.5',
                children: [
                  jsxs('div', {
                    className: 'flex items-center justify-between',
                    children: [
                      jsx('span', { className: 'text-xs font-medium text-foreground', children: t('maskOcclusion') }),
                      jsx('span', { className: 'text-xs font-mono text-muted-foreground', children: `${config.maskOcclusion}%` })
                    ]
                  }),
                  jsx('input', {
                    type: 'range',
                    min: 0,
                    max: 100,
                    step: 2,
                    value: config.maskOcclusion,
                    onChange: e => {
                      const val = parseInt(e.target.value, 10)
                      store.saveConfig({ maskOcclusion: val })
                      backdropManager.update({
                        enabled: config.wallpaperEnabled,
                        type: config.wallpaperType,
                        src: config.wallpaperSource,
                        blur: config.wallpaperBlur,
                        occlusion: val
                      })
                    },
                    className: 'w-full accent-primary cursor-pointer'
                  }),
                  jsx('span', { className: 'text-[11px] text-muted-foreground', children: t('maskOcclusionDesc') })
                ]
              }),

              // 3. Panel Glass Transparency Slider
              jsxs('div', {
                className: 'flex flex-col gap-1.5',
                children: [
                  jsxs('div', {
                    className: 'flex items-center justify-between',
                    children: [
                      jsx('span', { className: 'text-xs font-medium text-foreground', children: t('panelGlass') }),
                      jsx('span', { className: 'text-xs font-mono text-muted-foreground', children: `${config.panelGlass}%` })
                    ]
                  }),
                  jsx('input', {
                    type: 'range',
                    min: 0,
                    max: 100,
                    step: 5,
                    value: config.panelGlass,
                    onChange: e => {
                      const val = parseInt(e.target.value, 10)
                      store.saveConfig({ panelGlass: val })
                      glassController.update({
                        enabled: config.wallpaperEnabled,
                        glassTransparency: val,
                        bubbleOpacity: config.bubbleOpacity,
                        composerFrost: config.composerFrost
                      })
                    },
                    className: 'w-full accent-primary cursor-pointer'
                  }),
                  jsx('span', { className: 'text-[11px] text-muted-foreground', children: t('panelGlassDesc') })
                ]
              }),

              // 4. Bubble Opacity Slider
              jsxs('div', {
                className: 'flex flex-col gap-1.5',
                children: [
                  jsxs('div', {
                    className: 'flex items-center justify-between',
                    children: [
                      jsx('span', { className: 'text-xs font-medium text-foreground', children: t('bubbleOpacity') }),
                      jsx('span', { className: 'text-xs font-mono text-muted-foreground', children: `${config.bubbleOpacity}%` })
                    ]
                  }),
                  jsx('input', {
                    type: 'range',
                    min: 10,
                    max: 100,
                    step: 5,
                    value: config.bubbleOpacity,
                    onChange: e => {
                      const val = parseInt(e.target.value, 10)
                      store.saveConfig({ bubbleOpacity: val })
                      glassController.update({
                        enabled: config.wallpaperEnabled,
                        glassTransparency: config.panelGlass,
                        bubbleOpacity: val,
                        composerFrost: config.composerFrost
                      })
                    },
                    className: 'w-full accent-primary cursor-pointer'
                  }),
                  jsx('span', { className: 'text-[11px] text-muted-foreground', children: t('bubbleOpacityDesc') })
                ]
              }),

              // 5. Composer Frost Blur Slider
              jsxs('div', {
                className: 'flex flex-col gap-1.5',
                children: [
                  jsxs('div', {
                    className: 'flex items-center justify-between',
                    children: [
                      jsx('span', { className: 'text-xs font-medium text-foreground', children: t('composerFrost') }),
                      jsx('span', { className: 'text-xs font-mono text-muted-foreground', children: `${config.composerFrost}px` })
                    ]
                  }),
                  jsx('input', {
                    type: 'range',
                    min: 0,
                    max: 25,
                    step: 1,
                    value: config.composerFrost,
                    onChange: e => {
                      const val = parseInt(e.target.value, 10)
                      store.saveConfig({ composerFrost: val })
                      glassController.update({
                        enabled: config.wallpaperEnabled,
                        glassTransparency: config.panelGlass,
                        bubbleOpacity: config.bubbleOpacity,
                        composerFrost: val
                      })
                    },
                    className: 'w-full accent-primary cursor-pointer'
                  }),
                  jsx('span', { className: 'text-[11px] text-muted-foreground', children: t('composerFrostDesc') })
                ]
              })
            ]
          })
        ]
      }),

      // TAB 3: Theme Studio View
      activeTab === 'studio' && jsx(CustomThemeStudio, {
        store,
        onApplySkin: handleApply,
        onTryOnSkin: handleTryOn
      })
    ]
  })
}

// ─── Submodule: Status Bar Chip ───────────────────────────────
/**
 * Status Bar Chip & Quick Popover for Hermes Desktop
 * Area: statusBar.right
 */





function StatusBarChip({ store, backdropManager, glassController }) {
  const t = usePluginI18n('hermes-skins')
  const { setTheme } = useTheme()
  const config = useValue(store.$config)
  const tryOnSkin = useValue(store.$tryOnSkin)

  const activeId = tryOnSkin ? tryOnSkin.id : config.activeSkinId
  const allSkins = [...BUILTIN_SKINS, ...(config.customSkins || [])]
  const currentSkin = allSkins.find(s => s.id === activeId)
  const skinName = currentSkin ? (currentSkin.name || currentSkin.nameEn) : t('resetToDefault')
  const skinAccent = currentSkin ? currentSkin.accent : 'var(--ui-accent)'

  function handleQuickSwitch(e) {
    const targetId = e.target.value
    if (targetId === 'default') {
      store.saveConfig({ activeSkinId: 'default', wallpaperEnabled: false })
      setTheme('default')
      backdropManager.update({ enabled: false })
      glassController.update({ enabled: false })
      return
    }
    const skin = allSkins.find(s => s.id === targetId)
    if (skin) {
      store.saveConfig(prev => ({
        ...prev,
        activeSkinId: skin.id,
        wallpaperEnabled: true,
        wallpaperType: skin.wallpaperType || 'image',
        wallpaperSource: skin.wallpaper || prev.wallpaperSource,
        wallpaperBlur: skin.defaultBlur !== undefined ? skin.defaultBlur : prev.wallpaperBlur,
        maskOcclusion: skin.defaultOcclusion !== undefined ? skin.defaultOcclusion : prev.maskOcclusion
      }))
      setTheme(skin.id)
      backdropManager.update({
        enabled: true,
        type: skin.wallpaperType || 'image',
        src: skin.wallpaper,
        blur: skin.defaultBlur !== undefined ? skin.defaultBlur : config.wallpaperBlur,
        occlusion: skin.defaultOcclusion !== undefined ? skin.defaultOcclusion : config.maskOcclusion
      })
      glassController.update({
        enabled: true,
        glassTransparency: config.panelGlass,
        bubbleOpacity: config.bubbleOpacity,
        composerFrost: config.composerFrost,
        customCSS: skin.customCSS
      })
    }
  }

  return jsx(Popover, {
    children: [
      jsx(PopoverTrigger, {
        asChild: true,
        children: jsx(Tip, {
          label: t('statusBarTooltip'),
          children: jsxs('button', {
            type: 'button',
            onClick: () => haptic('tap'),
            className: 'inline-flex h-full items-center gap-1.5 px-2 text-[0.6875rem] font-medium transition-colors text-muted-foreground hover:bg-muted/60 hover:text-foreground',
            children: [
              jsx('span', {
                className: 'h-2 w-2 rounded-full shadow-xs',
                style: { backgroundColor: skinAccent }
              }),
              jsx('span', {
                className: 'max-w-[80px] truncate',
                children: skinName
              })
            ]
          })
        })
      }),
      jsx(PopoverContent, {
        align: 'end',
        side: 'top',
        className: 'w-72 p-4 shadow-xl border border-border/70 bg-popover/95 backdrop-blur-xl',
        children: jsxs('div', {
          className: 'flex flex-col gap-3',
          children: [
            // Top Bar
            jsxs('div', {
              className: 'flex items-center justify-between border-b border-border/40 pb-2',
              children: [
                jsx('span', {
                  className: 'text-xs font-semibold text-foreground',
                  children: t('quickSwitchSkin')
                }),
                jsx('button', {
                  type: 'button',
                  onClick: () => host.navigate('/skins'),
                  className: 'text-[11px] text-primary hover:underline font-medium',
                  children: '→ ' + t('tabGallery')
                })
              ]
            }),

            // Skin Select dropdown
            jsxs('div', {
              className: 'flex flex-col gap-1',
              children: [
                jsx('label', { className: 'text-[11px] text-muted-foreground', children: t('tabGallery') }),
                jsx('select', {
                  value: activeId,
                  onChange: handleQuickSwitch,
                  className: 'h-8 w-full rounded border border-border bg-card px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary',
                  children: [
                    jsx('option', { value: 'default', children: `⚪ ${t('resetToDefault')}` }),
                    allSkins.map(s => (
                      jsx('option', { key: s.id, value: s.id, children: `🎨 ${s.name || s.nameEn}` })
                    ))
                  ]
                })
              ]
            }),

            // Quick Wallpaper Switch
            jsxs('div', {
              className: 'flex items-center justify-between pt-1',
              children: [
                jsx('span', { className: 'text-xs text-foreground', children: t('enableWallpaper') }),
                jsx(Switch, {
                  checked: config.wallpaperEnabled,
                  onCheckedChange: val => {
                    store.saveConfig({ wallpaperEnabled: val })
                    backdropManager.update({
                      enabled: val,
                      type: config.wallpaperType,
                      src: config.wallpaperSource,
                      blur: config.wallpaperBlur,
                      occlusion: config.maskOcclusion
                    })
                    glassController.update({
                      enabled: val,
                      glassTransparency: config.panelGlass,
                      bubbleOpacity: config.bubbleOpacity,
                      composerFrost: config.composerFrost
                    })
                  }
                })
              ]
            }),

            // Quick Blur Slider
            jsxs('div', {
              className: 'flex flex-col gap-1 pt-1',
              children: [
                jsxs('div', {
                  className: 'flex items-center justify-between text-[11px] text-muted-foreground',
                  children: [
                    jsx('span', { children: t('wallpaperBlur') }),
                    jsx('span', { className: 'font-mono', children: `${config.wallpaperBlur}px` })
                  ]
                }),
                jsx('input', {
                  type: 'range',
                  min: 0,
                  max: 20,
                  step: 1,
                  value: config.wallpaperBlur,
                  onChange: e => {
                    const val = parseInt(e.target.value, 10)
                    store.saveConfig({ wallpaperBlur: val })
                    backdropManager.update({
                      enabled: config.wallpaperEnabled,
                      type: config.wallpaperType,
                      src: config.wallpaperSource,
                      blur: val,
                      occlusion: config.maskOcclusion
                    })
                  },
                  className: 'w-full accent-primary h-1.5 cursor-pointer'
                })
              ]
            }),

            // Full Settings Button
            jsx(Button, {
              size: 'sm',
              variant: 'outline',
              className: 'mt-1 w-full text-xs',
              onClick: () => host.navigate('/skins'),
              children: t('pluginName')
            })
          ]
        })
      })
    ]
  })
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

    // 3. Register themes to core THEMES_AREA
    for (const skin of BUILTIN_SKINS) {
      ctx.register({
        id: `theme-${skin.id}`,
        area: THEMES_AREA,
        data: {
          name: skin.id,
          label: skin.name,
          description: skin.tagline || skin.description,
          colors: skin.colors,
          darkColors: skin.darkColors,
          customCSS: skin.customCSS
        }
      })
    }

    // 4. Register Full Page Route (/skins)
    ctx.register({
      id: 'page',
      area: ROUTES_AREA,
      data: { path: '/skins' },
      render: () => jsx(SkinCenterPage, { store, backdropManager, glassController })
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

    // 6. Register Status Bar Chip
    ctx.register({
      id: 'status-chip',
      area: STATUSBAR_AREAS.right,
      order: 140,
      render: () => jsx(StatusBarChip, { store, backdropManager, glassController })
    })

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
          const conf = store.$config.get()
          const next = !conf.wallpaperEnabled
          store.saveConfig({ wallpaperEnabled: next })
          backdropManager.update({
            enabled: next,
            type: conf.wallpaperType,
            src: conf.wallpaperSource,
            blur: conf.wallpaperBlur,
            occlusion: conf.maskOcclusion
          })
          glassController.update({
            enabled: next,
            glassTransparency: conf.panelGlass,
            bubbleOpacity: conf.bubbleOpacity,
            composerFrost: conf.composerFrost
          })
          host.notify({
            kind: 'info',
            message: next ? 'Custom wallpaper enabled' : 'Custom wallpaper disabled'
          })
        }
      }
    })

    // 8. Boot-time restoration (Anti-FOUC)
    const initialConfig = store.$config.get()
    if (initialConfig.activeSkinId && initialConfig.activeSkinId !== 'default') {
      const activeSkin = BUILTIN_SKINS.find(s => s.id === initialConfig.activeSkinId)
      if (activeSkin) {
        backdropManager.update({
          enabled: initialConfig.wallpaperEnabled,
          type: initialConfig.wallpaperType,
          src: initialConfig.wallpaperSource || activeSkin.wallpaper,
          blur: initialConfig.wallpaperBlur,
          occlusion: initialConfig.maskOcclusion,
          isDark: true
        })
        glassController.update({
          enabled: true,
          glassTransparency: initialConfig.panelGlass,
          bubbleOpacity: initialConfig.bubbleOpacity,
          composerFrost: initialConfig.composerFrost,
          customCSS: activeSkin.customCSS,
          isDark: true
        })
      }
    }

    // 9. Teardown on plugin reload / dispose
    if (typeof ctx.onDispose === 'function') {
      ctx.onDispose(() => {
        backdropManager.destroy()
        glassController.destroy()
      })
    }
  }
}
