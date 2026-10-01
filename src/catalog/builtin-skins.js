/**
 * Built-in curated skins for Hermes Desktop.
 * Inspired by the best of dsh-skins (Blue Fantasy, Whale Song, Maid Atelier)
 * and tailored for Hermes desktop's glass & tailwind architecture.
 */

// High quality embedded SVG wallpaper generators (offline-first, zero external latency)
export const WALLPAPER_PRESETS = {
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

export const BUILTIN_SKINS = [
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
