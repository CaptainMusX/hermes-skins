/**
 * Hermes Wallpaper Engine (hermes-skins)
 * Version: 2.0.0
 * Author: CaptainMusX
 *
 * Standalone Desktop Plugin for Hermes Desktop.
 * Provides the Wallpaper Engine library, Scene/Web/video/image rendering and
 * liquid-glass surfaces, exposed from Settings ▸ Appearance.
 *
 * Third-party portions: WebWallGL 3.0.1 (MIT, oneincase), the renderer page and
 * layer/pointer/pause lifecycle adapted from dsh-wallpaper-engine (MIT, elysia395),
 * and the legacy dsh-skins parser vendored for compatibility (82f42bd3).
 * Changes in this generated file: third-party imports/exports removed and modules
 * concatenated; scene rendering moved to the signed WebWallGL media origin.
 * See LICENSING.md, THIRD-PARTY-NOTICES.md and the accompanying complete license texts.
 */

import {
  APPEARANCE_AREAS, atom, Button, host, Input, pluginSettingsHref, SegmentedControl, Switch,
  setAccentOverride, usePluginI18n, useValue
} from '@hermes/plugin-sdk'
import { useEffect, useRef, useState } from 'react'
import { jsx, jsxs } from 'react/jsx-runtime'

// ─── Submodule: i18n ──────────────────────────────────────────
const I18N_DICTIONARY = {
  en: {
    pluginName: 'Hermes Wallpaper Engine',
    pluginDesc: 'Scene, Web, video and image wallpapers with liquid-glass surfaces',
    wallpaperEngineTitle: 'Wallpaper Engine',
    wallpaperEngineDesc: 'Scene, Web, video and image wallpapers behind Hermes, with liquid-glass surfaces.',
    selectWallpaperFirst: 'Choose a wallpaper below to enable it.',
    sectionGlass: 'Liquid glass',
    sectionGlassDesc: 'Transparency, frost, tint and specular edges for Hermes surfaces.',
    sectionPlayback: 'Playback',
    sectionPlaybackDesc: 'Scene quality, frame cap and power-saving pause rules.',
    sectionLibrary: 'Wallpaper library',
    sectionLibraryDesc: 'Browse local Wallpaper Engine projects, videos and previews.',
    sectionSystem: 'System',
    sectionSystemDesc: 'Import or export the appearance/playback settings for another device.',
    exportPreset: 'Export preset',
    importPreset: 'Import preset',
    presetExported: 'Preset exported.',
    presetImported: 'Preset applied.',
    presetInvalid: 'This file does not contain a valid Hermes wallpaper preset.',
    defaultValue: 'Default',
    sectionTypography: 'Typography',
    sectionTypographyDesc: 'Global font family, size, weight, spacing and caret colour.',
    fontCustom: 'Custom typography',
    fontFamily: 'Font family',
    fontFamilyPlaceholder: 'Inter, "Microsoft YaHei", sans-serif',
    scanFonts: 'Scan system fonts',
    fontScanning: 'Scanning fonts…',
    fontSize: 'Chat font size',
    fontWeight: 'Font weight',
    letterSpacing: 'Letter spacing',
    caretColor: 'Caret colour',
    sectionFx: 'Click & trail',
    sectionFxDesc: 'Pointer ripple and cursor trail drawn above the wallpaper and UI.',
    fxEnabled: 'Enable pointer effects',
    fxClick: 'Click effect',
    fxClickStyle: 'Click style',
    fxStyleRipple: 'Ripple',
    fxStyleSpark: 'Spark',
    fxClickSize: 'Click size',
    fxClickGlow: 'Click glow',
    fxTrail: 'Cursor trail',
    fxTrailStyle: 'Trail style',
    fxTrailComet: 'Comet',
    fxTrailSparkle: 'Sparkle',
    fxTrailLength: 'Trail lifetime',
    fxTrailWidth: 'Trail width',
    fxTrailGlow: 'Trail glow',
    fxOpacity: 'Effect opacity',
    fxBlend: 'Blend mode',
    fxBlendScreen: 'Screen',
    fxBlendNormal: 'Normal',
    fxColorMode: 'Colour source',
    fxColorAccent: 'Accent',
    fxColorCustom: 'Custom',
    fxColor: 'Effect colour',
    sectionParallax: '3D parallax',
    sectionParallaxDesc: 'Pointer-driven depth for the wallpaper and optional UI surfaces.',
    parallaxEnabled: 'Enable 3D parallax',
    parallaxBgDepth: 'Wallpaper depth',
    parallaxUi: 'UI parallax',
    parallaxUiChat: 'Chat depth',
    parallaxUiComposer: 'Composer depth',
    parallaxUiSidebar: 'Sidebar depth',
    parallaxSmooth: 'Smoothing',
    rotationEnabled: 'Auto rotation',
    rotationInterval: 'Rotation interval',
    rotationHint: 'Rotates through non-hidden library wallpapers while Hermes is running.',
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
    weSceneBackendMissing: 'The scene backend is disabled or its API has not loaded. Enable the scene backend below; an already playing video or cached scene does not require this API.',
    weSceneBackendEnable: 'Enable scene backend',
    weSceneBackendEnabling: 'Enabling scene backend…',
    weSceneBackendRestartRequired: 'The scene backend is enabled. Restart Hermes after current tasks finish to load its scene API, then select the wallpaper again.',
    weSceneUnsupported: 'This scene has no supported renderable layers or video.',
    weUse: 'Use as wallpaper',
    weHide: 'Hide',
    weRestore: 'Restore',
    weRestoreAndUse: 'Restore & use',
    weShowHidden: count => `Hidden (${count})`,
    weShowVisible: count => `Wallpapers (${count} hidden)`,
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
    wallpaperTransition: 'Wallpaper switch transition',
    transitionCut: 'Cut',
    transitionFade: 'Fade',
    transitionSlide: 'Slide',
    transitionZoom: 'Zoom',
    wallpaperOpacity: 'Wallpaper opacity',
    wallpaperOpacityDesc: 'Opacity of the wallpaper media layer (0% - 100%).',
    pauseOnHidden: 'Pause while Hermes is hidden',
    pauseOnBlur: 'Pause when the window loses focus',
    pauseOnBattery: 'Pause while on battery power',
    sceneLive: 'Real-time scene rendering',
    sceneLiveDesc: 'Render Scene and Web projects with WebWallGL instead of a static frame.',
    sceneLiveFps: 'Scene frame-rate cap',
    sceneAutoQuality: 'Automatic quality',
    sceneAutoQualityDesc: 'Lower post-processing, particles and AA when the GPU cannot hold the frame cap.',
    sceneRenderDpr: 'Render resolution',
    sceneRenderDprAuto: 'Auto',
    sceneVideoTexScale: 'Video texture scale',
    sceneVideoTexScaleAuto: 'Auto',
    sceneVideoTexScaleHalf: 'Half',
    sceneVideoTexScaleFull: 'Full',
    glassSaturation: 'Glass saturation',
    glassSaturationDesc: 'Colour richness of the frosted surfaces (100% - 200%).',
    glassBorder: 'Glass edge strength',
    glassBorderDesc: 'Specular rim on structural glass surfaces (0% - 100%).',
    glassHighlight: 'Glass top highlight',
    wallpaperSound: 'Play video sound',
    wallpaperVolume: 'Video volume',
    wallpaperVolumeDesc: 'Volume for standalone video wallpapers.',
    videoPlaybackRate: 'Video playback speed',
    tagsAll: 'All'
  },
  zh: {
    pluginName: 'Hermes 壁纸引擎',
    pluginDesc: 'Scene / Web / 视频 / 图片壁纸与液态玻璃界面',
    wallpaperEngineTitle: '壁纸引擎',
    wallpaperEngineDesc: '把 Scene、Web、视频与图片壁纸放到 Hermes 背后，并在界面表面叠加液态玻璃。',
    selectWallpaperFirst: '请先在下方选择一张壁纸。',
    sectionGlass: '液态玻璃',
    sectionGlassDesc: '控制 Hermes 表面的透光、磨砂、染色与高光边缘。',
    sectionPlayback: '播放',
    sectionPlaybackDesc: '场景画质、帧率上限与省电暂停策略。',
    sectionLibrary: '壁纸库',
    sectionLibraryDesc: '浏览本机 Wallpaper Engine 工程、视频与预览。',
    sectionSystem: '系统',
    sectionSystemDesc: '导出或导入外观/播放设置，便于迁移到另一台设备。',
    exportPreset: '导出预设',
    importPreset: '导入预设',
    presetExported: '预设已导出。',
    presetImported: '预设已应用。',
    presetInvalid: '这个文件不是有效的 Hermes 壁纸预设。',
    defaultValue: '默认',
    sectionTypography: '字体与排版',
    sectionTypographyDesc: '全局字体、字号、字重、字距与光标颜色。',
    fontCustom: '启用自定义排版',
    fontFamily: '字体族',
    fontFamilyPlaceholder: 'Inter, "Microsoft YaHei", sans-serif',
    scanFonts: '扫描系统字体',
    fontScanning: '正在扫描字体…',
    fontSize: '聊天字号',
    fontWeight: '字重',
    letterSpacing: '字距',
    caretColor: '光标颜色',
    sectionFx: '点击与拖尾',
    sectionFxDesc: '在壁纸和界面之上绘制鼠标点击波纹与拖尾。',
    fxEnabled: '启用指针特效',
    fxClick: '点击特效',
    fxClickStyle: '点击样式',
    fxStyleRipple: '波纹',
    fxStyleSpark: '火花',
    fxClickSize: '点击尺寸',
    fxClickGlow: '点击辉光',
    fxTrail: '鼠标拖尾',
    fxTrailStyle: '拖尾样式',
    fxTrailComet: '彗星',
    fxTrailSparkle: '星点',
    fxTrailLength: '拖尾存留',
    fxTrailWidth: '拖尾宽度',
    fxTrailGlow: '拖尾辉光',
    fxOpacity: '特效不透明度',
    fxBlend: '混合模式',
    fxBlendScreen: '滤色',
    fxBlendNormal: '正常',
    fxColorMode: '颜色来源',
    fxColorAccent: '主题色',
    fxColorCustom: '自定义',
    fxColor: '特效颜色',
    sectionParallax: '3D 视差',
    sectionParallaxDesc: '用鼠标驱动壁纸与可选界面表面的纵深位移。',
    parallaxEnabled: '启用 3D 视差',
    parallaxBgDepth: '壁纸深度',
    parallaxUi: '界面视差',
    parallaxUiChat: '聊天区深度',
    parallaxUiComposer: '输入区深度',
    parallaxUiSidebar: '侧栏深度',
    parallaxSmooth: '平滑度',
    rotationEnabled: '自动轮换',
    rotationInterval: '轮换间隔',
    rotationHint: '在 Hermes 运行期间，从未隐藏的壁纸库中依次切换。',
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
    weSceneBackendMissing: '场景后端已禁用，或场景接口尚未加载。请点击下方“启用场景后端”；已播放的视频或缓存场景不需要此接口。',
    weSceneBackendEnable: '启用场景后端',
    weSceneBackendEnabling: '正在启用场景后端…',
    weSceneBackendRestartRequired: '场景后端已启用。请等待当前任务结束后重启 Hermes，以加载场景接口，再重新选择壁纸。',
    weSceneUnsupported: '此场景没有可支持的图层或视频。',
    weUse: '设为壁纸',
    weHide: '隐藏',
    weRestore: '恢复',
    weRestoreAndUse: '恢复并应用',
    weShowHidden: count => `已隐藏 (${count})`,
    weShowVisible: count => `返回壁纸 (${count} 张已隐藏)`,
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
    wallpaperTransition: '壁纸切换过场',
    transitionCut: '直接切换',
    transitionFade: '淡入淡出',
    transitionSlide: '横向推移',
    transitionZoom: '缩放',
    wallpaperOpacity: '壁纸不透明度',
    wallpaperOpacityDesc: '调整壁纸素材层的不透明度 (0% - 100%)。',
    pauseOnHidden: 'Hermes 隐藏时暂停动画',
    pauseOnBlur: '窗口失焦时暂停',
    pauseOnBattery: '电池供电时暂停',
    sceneLive: '场景实时渲染',
    sceneLiveDesc: '使用 WebWallGL 实时渲染 Scene / Web 工程，而不是静态帧。',
    sceneLiveFps: '场景帧率上限',
    sceneAutoQuality: '自动画质',
    sceneAutoQualityDesc: 'GPU 压不住帧率时自动降低后处理、粒子与抗锯齿。',
    sceneRenderDpr: '渲染分辨率',
    sceneRenderDprAuto: '自动',
    sceneVideoTexScale: '视频纹理缩放',
    sceneVideoTexScaleAuto: '自动',
    sceneVideoTexScaleHalf: '一半',
    sceneVideoTexScaleFull: '完整',
    glassSaturation: '玻璃饱和度',
    glassSaturationDesc: '磨砂表面的色彩浓度（100% - 200%）。',
    glassBorder: '玻璃边缘强度',
    glassBorderDesc: '结构玻璃表面的高光描边强度（0% - 100%）。',
    glassHighlight: '玻璃顶部高光',
    wallpaperSound: '播放视频声音',
    wallpaperVolume: '视频音量',
    wallpaperVolumeDesc: '调整独立视频壁纸音量。',
    videoPlaybackRate: '视频播放速度',
    tagsAll: '全部风格'
  }
}

// ─── Submodule: Backdrop Manager ──────────────────────────────
/**
 * Thin client for the signed WebWallGL media service.
 *
 * The backend returns a tokenised project base; this module only builds the
 * renderer URL and caches `open` results so a slider drag never re-signs the
 * same project directory. No filesystem path reaches the iframe.
 */
const OPEN_TTL_MS = 10 * 60 * 1000
const opened = new Map()
let backendOriginCache = null

const encodePath = value => String(value || 'index.html').replace(/\\/g, '/')
  .split('/').filter(Boolean).map(encodeURIComponent).join('/')

async function resolveBackendOrigin() {
  if (backendOriginCache) return backendOriginCache
  try {
    const connection = await window.hermesDesktop?.getConnection?.()
    if (connection?.baseUrl) {
      backendOriginCache = String(connection.baseUrl).replace(/\/+$/, '')
      return backendOriginCache
    }
  } catch { /* Plain browser / older host. */ }
  backendOriginCache = typeof location !== 'undefined' && location.protocol !== 'file:'
    ? location.origin : ''
  return backendOriginCache
}

async function openLiveProject(openScene, { dir = null, manifestPath = null } = {}) {
  if (typeof openScene !== 'function') throw new Error('Scene backend is unavailable')
  const key = `${dir || ''}|${manifestPath || ''}`
  const cached = opened.get(key)
  if (cached && Date.now() - cached.at < OPEN_TTL_MS) return cached.value
  const value = await openScene({ dir, manifestPath })
  if (!value?.ok || !value.base || !value.token) {
    throw new Error(value?.error || 'Scene backend refused this wallpaper')
  }
  opened.set(key, { at: Date.now(), value })
  while (opened.size > 24) opened.delete(opened.keys().next().value)
  return value
}

function liveSceneUrl(project, options = {}) {
  if (!project?.token) throw new Error('Scene project has no media token')
  const origin = project.mediaOrigin || options.origin ||
    (typeof location !== 'undefined' && location.protocol !== 'file:' ? location.origin : '')
  if (!origin) throw new Error('Hermes backend origin is unavailable')
  const params = new URLSearchParams({
    type: 'scene',
    fit: options.fit || 'cover',
    sceneFps: String(options.fps || 30),
    muted: options.muted ? 'true' : 'false',
    src: project.token,
    mediaBase: `${origin}/api/plugins/hermes-skins/scene/files`
  })
  if (options.autoQuality === false) params.set('autoq', '0')
  if (Number(options.renderDpr) > 0) params.set('renderDpr', String(options.renderDpr))
  if (Number(options.videoTexScale) > 0) params.set('vidscale', String(options.videoTexScale))
  return `${origin}/api/plugins/hermes-skins/scene/live/index.html?${params.toString()}`
}

function liveWebUrl(project, file, options = {}) {
  if (!project?.base) throw new Error('Web project has no media base')
  const origin = project.mediaOrigin || options.origin ||
    (typeof location !== 'undefined' && location.protocol !== 'file:' ? location.origin : '')
  if (!origin) throw new Error('Hermes backend origin is unavailable')
  const base = /^https?:\/\//i.test(project.base) ? project.base : `${origin}${project.base}`
  const entry = `${base}/${encodePath(file)}`
  const params = new URLSearchParams({
    type: 'web',
    fit: options.fit || 'cover',
    sceneFps: String(options.fps || 30),
    muted: options.muted ? 'true' : 'false',
    src: entry,
    mediaBase: `${origin}/api/plugins/hermes-skins/scene/files`
  })
  if (options.autoQuality === false) params.set('autoq', '0')
  return `${origin}/api/plugins/hermes-skins/scene/live/index.html?${params.toString()}`
}

function clearLiveProjectCache() {
  opened.clear()
}

const ROOT_ID = 'hermes-skins-backdrop-root'
const LIVE_READY_CLASS = 'hs-backdrop-live-ready'
const LIVE_FADE_MS = 1200
const LIVE_FIRST_FRAME_MS = 30000
const TRANSITION_BASE_MS = {
  cut: 0, fade: 1800, push: 700, wipe: 700, iris: 800, zoom: 900, bars: 800
}
const TRANSITION_SPEED_FACTOR = { fast: 0.6, normal: 1, slow: 1.6 }
const BARS_TEETH = 9

const clamp = (value, min, max, fallback) => {
  const number = Number(value)
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback
}

function barsPolygon(direction, progress) {
  const horizontal = direction === 'left' || direction === 'right'
  const fromEnd = direction === 'left' || direction === 'up'
  const outer = fromEnd ? 1 : 0
  const inward = fromEnd ? -1 : 1
  const period = 1 / BARS_TEETH
  const depth = clamp(progress, 0, 1, 0)
  const spine = Math.min(0.004, depth)
  const slat = depth / BARS_TEETH
  const point = (a, t) => horizontal ? [outer + inward * a, t] : [t, outer + inward * a]
  const points = [point(0, 0)]
  for (let index = 0; index < BARS_TEETH; index += 1) {
    const start = index * period
    points.push(point(depth, start))
    points.push(point(depth, start + slat))
    if (index < BARS_TEETH - 1) {
      points.push(point(spine, start + slat))
      points.push(point(spine, start + period))
    }
  }
  points.push(point(spine, 1))
  points.push(point(0, 1))
  return `polygon(${points.map(([x, y]) => `${(x * 100).toFixed(2)}% ${(y * 100).toFixed(2)}%`).join(', ')})`
}

function wipeInset(direction) {
  return {
    left: 'inset(0 100% 0 0)',
    right: 'inset(0 0 0 100%)',
    up: 'inset(100% 0 0 0)',
    down: 'inset(0 0 100% 0)'
  }[direction] || 'inset(0 100% 0 0)'
}

function pushOffset(direction, incoming = true) {
  const sign = incoming ? 1 : -1
  return {
    left: `translate3d(${100 * sign}%, 0, 0)`,
    right: `translate3d(${-100 * sign}%, 0, 0)`,
    up: `translate3d(0, ${100 * sign}%, 0)`,
    down: `translate3d(0, ${-100 * sign}%, 0)`
  }[direction] || `translate3d(${100 * sign}%, 0, 0)`
}

function normalizeMediaSource(input, type = 'image') {
  if (typeof input !== 'string' || !input.trim()) return null
  const source = input.trim()
  if (/^https?:\/\//i.test(source)) return source
  if (type === 'image' && /^data:image\/(svg\+xml|png|jpeg|webp|gif);/i.test(source)) return source
  if (type === 'video' && /^hermes-media:\/\/stream\/[^\s?#]+$/i.test(source)) return source
  if (/^file:\/\/\//i.test(source)) return source
  if (/^[a-zA-Z]:[\\/]/.test(source)) {
    const normalized = source.replace(/\\/g, '/')
    if (type === 'video') return `hermes-media://stream/${encodeURIComponent(source)}`
    return `file:///${normalized.split('/').map((part, index) => index === 0 ? part : encodeURIComponent(part)).join('/')}`
  }
  return null
}

const isScenePath = value => typeof value === 'string' && /^[a-zA-Z]:[\\/]/.test(value)

function projectDirectory(value) {
  if (typeof value !== 'string' || !value) return null
  let path = value
  if (/^file:\/\//i.test(path)) {
    try {
      path = decodeURIComponent(new URL(path).pathname)
      if (/^\/[A-Za-z]:/.test(path)) path = path.slice(1)
    } catch {
      return null
    }
  }
  path = path.replace(/\//g, '\\')
  if (/\.(json|html?)$/i.test(path)) path = path.replace(/\\[^\\]+$/, '')
  return /^[A-Za-z]:\\/.test(path) ? path : null
}

/**
 * Wallpaper backdrop with a WebWallGL live renderer.
 *
 * Layer ownership is exclusive to this class. A switch builds the next layer
 * beside the current one, fades it in, then retires the old iframe/video; the
 * app never sees a transparent gap that would make glass lose its backdrop.
 */
class BackdropManager {
  constructor({ prepareScene = null, openScene = null } = {}) {
    this.prepareScene = prepareScene
    this.openScene = openScene
    this.root = null
    this.layers = null
    this.scrim = null
    this.layer = null
    this.previousLayer = null
    this.sceneIframe = null
    this.sceneProject = null
    this.sceneType = null
    this.liveReady = false
    this.liveFailed = false
    this.liveStarting = false
    this.liveWatchdog = null
    this.liveStats = null
    this.currentKey = null
    this.currentOptions = null
    this.failedKeys = new Set()
    this.onVisibilityChange = null
    this.onLiveState = null
    this.onMediaEnd = null
    this.pointerFrame = null
    this.pendingPointer = null
    this.pointerInitialized = false
    this.cursorForwardInit = false
    this.pauseReasons = new Set()
    this.battery = null
    this.batteryPending = false
    this.lastMaskColor = null
    this.mediaSnapshot = null
    this.handleSceneMessage = event => {
      if (!this.sceneIframe || event.source !== this.sceneIframe.contentWindow) return
      const data = event.data
      if (!data || data.source !== 'hermes-skins-scene') return
      if (data.type === 'ready') {
        this.liveReady = true
        this.liveFailed = false
        if (this.liveWatchdog !== null) clearTimeout(this.liveWatchdog)
        this.liveWatchdog = null
        this.layer?.classList.add(LIVE_READY_CLASS)
        this.applyLiveOptions(true)
        this.pushMediaSnapshot()
        this.onLiveState?.({ ready: true, type: this.sceneType })
      } else if (data.type === 'error') {
        this.liveFailed = true
        if (this.liveWatchdog !== null) clearTimeout(this.liveWatchdog)
        this.liveWatchdog = null
        this.onLiveState?.({ ready: false, error: data.message || 'Scene renderer failed' })
      } else if (data.type === 'stats') {
        this.liveStats = data
      }
    }
    this.handleVisibility = () => {
      if (document.hidden) this.pointerLeave()
      this.syncPlayback()
      this.onVisibilityChange?.()
      if (!document.hidden) this.resumeDeferredLive()
    }
    this.handleFocus = () => {
      this.syncPlayback()
      this.onVisibilityChange?.()
      this.resumeDeferredLive()
    }
    this.handleBlur = () => {
      this.pointerLeave()
      this.syncPlayback()
      this.onVisibilityChange?.()
    }
    this.handleBattery = () => {
      this.syncPlayback()
      this.onVisibilityChange?.()
    }
  }

  ensureElements() {
    if (typeof document === 'undefined' || !document.body) return
    if (this.root?.isConnected) return
    this.root = document.getElementById(ROOT_ID) || document.createElement('div')
    this.root.id = ROOT_ID
    this.root.setAttribute('aria-hidden', 'true')
    this.root.style.cssText = 'position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;contain:strict;'
    this.layers = document.createElement('div')
    this.layers.style.cssText = 'position:absolute;inset:0;overflow:hidden;'
    this.scrim = document.createElement('div')
    this.scrim.style.cssText = 'position:absolute;inset:0;pointer-events:none;'
    this.root.replaceChildren(this.layers, this.scrim)
    document.body.prepend(this.root)
    this.ensureListeners()
  }

  ensureListeners() {
    if (this.pointerInitialized || typeof window === 'undefined') return
    this.pointerInitialized = true
    this.cursorForwardInit = true
    this.onPointerMove = event => {
      if (!this.sceneIframe || this.liveFailed || document.hidden) return
      this.pendingPointer = {
        x: event.clientX, y: event.clientY, buttons: event.buttons || 0,
        mods: { shift: event.shiftKey, ctrl: event.ctrlKey, alt: event.altKey, meta: event.metaKey }
      }
      if (this.pointerFrame !== null) return
      this.pointerFrame = window.requestAnimationFrame(() => {
        this.pointerFrame = null
        const sample = this.pendingPointer
        this.pendingPointer = null
        if (sample) this.forwardPointer(sample, true)
      })
    }
    this.onPointerDown = event => {
      if (!this.sceneIframe || this.liveFailed) return
      this.forwardPointer({
        x: event.clientX, y: event.clientY, buttons: event.buttons || 0,
        mods: { shift: event.shiftKey, ctrl: event.ctrlKey, alt: event.altKey, meta: event.metaKey }
      }, true)
    }
    this.onPointerUp = this.onPointerDown
    this.onPointerLeave = () => this.pointerLeave()
    this.onWheel = event => {
      if (!this.sceneIframe || this.liveFailed) return
      this.postScene({ type: 'wheel', dx: event.deltaX, dy: event.deltaY, mode: event.deltaMode,
        mods: { shift: event.shiftKey, ctrl: event.ctrlKey, alt: event.altKey, meta: event.metaKey } })
    }
    window.addEventListener('pointermove', this.onPointerMove, { passive: true, capture: true })
    window.addEventListener('pointerdown', this.onPointerDown, { passive: true, capture: true })
    window.addEventListener('pointerup', this.onPointerUp, { passive: true, capture: true })
    window.addEventListener('pointerleave', this.onPointerLeave)
    document.addEventListener('pointerleave', this.onPointerLeave)
    window.addEventListener('blur', this.handleBlur)
    window.addEventListener('focus', this.handleFocus)
    window.addEventListener('wheel', this.onWheel, { passive: true, capture: true })
    document.addEventListener('visibilitychange', this.handleVisibility)
    window.addEventListener('message', this.handleSceneMessage)
    if (typeof navigator !== 'undefined' && navigator.getBattery) {
      this.batteryPending = true
      navigator.getBattery().then(battery => {
        this.battery = battery
        battery.addEventListener('chargingchange', this.handleBattery)
        battery.addEventListener('levelchange', this.handleBattery)
        this.batteryPending = false
        this.syncPlayback()
      }).catch(() => { this.batteryPending = false })
    }
  }

  /** Compatibility alias for the pre-WebWallGL backdrop tests. */
  ensureCursorForwarding() {
    this.ensureListeners()
  }

  /** Compatibility shim: forward a normalized pointer sample. */
  forwardCursor(x, y, active = true) {
    this.postScene({ type: 'pointer', u: x, v: y, buttons: active ? 1 : 0, mods: {} })
  }

  postScene(message) {
    try {
      this.sceneIframe?.contentWindow?.postMessage({ source: 'hermes-skins-host', ...message }, '*')
    } catch { /* The frame may still be loading. */ }
  }

  forwardPointer(sample, active) {
    const rect = this.sceneIframe?.getBoundingClientRect?.()
    if (!rect?.width || !rect?.height) return
    const u = Math.min(1, Math.max(0, (sample.x - rect.left) / rect.width))
    const v = Math.min(1, Math.max(0, (sample.y - rect.top) / rect.height))
    const inside = active && sample.x >= rect.left && sample.x <= rect.right &&
      sample.y >= rect.top && sample.y <= rect.bottom
    this.postScene({ type: 'pointer', u, v, buttons: inside ? sample.buttons : 0, mods: sample.mods })
  }

  pointerLeave() {
    if (this.pointerFrame !== null) window.cancelAnimationFrame(this.pointerFrame)
    this.pointerFrame = null
    this.pendingPointer = null
    this.postScene({ type: 'pointer-leave' })
  }

  setMediaSnapshot(media) {
    this.mediaSnapshot = media && typeof media === 'object' ? media : null
    this.pushMediaSnapshot()
  }

  pushMediaSnapshot() {
    if (!this.sceneIframe) return
    const media = this.mediaSnapshot
    if (!media?.ok) {
      this.postScene({ type: 'command', command: 'setMedia', args: [null] })
      return
    }
    const status = String(media.playing || '').toLowerCase()
    this.postScene({
      type: 'command',
      command: 'setMedia',
      args: [{
        hasMedia: true,
        title: media.title || '',
        artist: media.artist || '',
        album: media.album || '',
        playing: status === 'playing',
        state: status === 'playing' ? 1 : status === 'paused' ? 2 : 0,
        position: Number(media.position) || 0,
        duration: Number(media.duration) || 0
      }]
    })
  }

  update(options) {
    const {
      enabled, type = 'image', src, sceneDir = null, sceneManifest = null,
      sceneFrame = null, webPreview = null, blur = 0, occlusion = 35,
      isDark = true, mode = 'live', fit = 'cover', opacity = 100,
      pauseOnHidden = true, pauseOnBlur = false, pauseOnBattery = false,
      sound = false, volume = 100, playbackRate = 1,
      sceneLive = true, sceneLiveFps = 30, sceneAutoQuality = true,
      sceneRenderDpr = 0, sceneVideoTexScale = 0,
      slides = null, slideIntervalMs = null,
      transition = 'fade', transitionDir = 'left', transitionSpeed = 'normal',
      brightness = 100, contrast = 100, saturate = 100, flip = false,
      layerPositionX = 50, layerPositionY = 50, layerScale = 100,
      loop = true, userProps = null
    } = options

    const source = type === 'scene'
      ? (isScenePath(sceneDir) ? sceneDir : (isScenePath(sceneManifest) ? sceneManifest : (isScenePath(src) ? src : null)))
      : (enabled ? normalizeMediaSource(src, type) : null)
    if (!enabled || !source) {
      this.hide()
      return false
    }
    const key = `${type}:${source}:${mode === 'frame' ? 'frame' : 'live'}`
    if (this.failedKeys.has(key)) {
      this.hide()
      return false
    }
    this.ensureElements()
    if (!this.root) return false
    this.root.style.display = 'block'
    this.currentOptions = {
      type, src: source, sceneDir, sceneManifest, sceneFrame, webPreview,
      blur, occlusion, isDark, mode, fit, opacity, pauseOnHidden, pauseOnBlur,
      pauseOnBattery, sound, volume, playbackRate, sceneLive,
      sceneLiveFps, sceneAutoQuality, sceneRenderDpr, sceneVideoTexScale,
      slides, slideIntervalMs,
      transition, transitionDir, transitionSpeed,
      brightness, contrast, saturate, flip,
      layerPositionX, layerPositionY, layerScale, loop
      , userProps
    }
    this.updateScrim(isDark, occlusion)
    if (key === this.currentKey && this.layer) {
      this.applyOptionsToLayer(this.layer)
      this.applyLiveOptions(false)
      this.syncPlayback()
      return true
    }
    this.currentKey = key
    this.buildNextLayer(this.currentOptions, key)
    return true
  }

  updateScrim(isDark, occlusion) {
    const alpha = clamp(occlusion, 0, 100, 35) / 100
    const color = isDark ? `rgba(0,0,0,${alpha})` : `rgba(255,255,255,${alpha})`
    if (this.lastMaskColor !== color) this.scrim.style.backgroundColor = color
    this.lastMaskColor = color
  }

  buildLayer() {
    const layer = document.createElement('div')
    layer.className = 'hs-backdrop-layer'
    layer.style.cssText = 'position:absolute;inset:0;overflow:hidden;opacity:0;'
    const surface = document.createElement('div')
    surface.className = 'hs-backdrop-surface'
    surface.style.cssText = 'position:absolute;inset:0;transform-origin:center;'
    const poster = document.createElement('div')
    poster.className = 'hs-backdrop-poster'
    poster.style.cssText = 'position:absolute;inset:0;background-size:cover;background-position:center;background-repeat:no-repeat;'
    const media = document.createElement('div')
    media.className = 'hs-backdrop-media'
    media.style.cssText = 'position:absolute;inset:0;overflow:hidden;'
    surface.appendChild(poster)
    surface.appendChild(media)
    layer.appendChild(surface)
    layer._surface = surface
    layer._poster = poster
    layer._media = media
    return layer
  }

  applyOptionsToLayer(layer) {
    const options = this.currentOptions
    const blur = clamp(options.blur, 0, 60, 0)
    const surface = layer._surface
    const media = layer._media
    const brightness = clamp(options.brightness, 40, 160, 100)
    const contrast = clamp(options.contrast, 40, 200, 100)
    const saturate = clamp(options.saturate, 0, 200, 100)
    const filters = []
    if (blur > 0) filters.push(`blur(${blur}px)`)
    if (brightness !== 100) filters.push(`brightness(${brightness}%)`)
    if (contrast !== 100) filters.push(`contrast(${contrast}%)`)
    if (saturate !== 100) filters.push(`saturate(${saturate}%)`)
    surface.style.filter = filters.length ? filters.join(' ') : 'none'
    surface.style.inset = blur > 0 ? `-${blur + 8}px` : '0'
    const x = (50 - clamp(options.layerPositionX, 0, 100, 50)) / 2
    const y = (50 - clamp(options.layerPositionY, 0, 100, 50)) / 2
    const scale = clamp(options.layerScale, 50, 150, 100) / 100
    const flip = options.flip ? ' scaleX(-1)' : ''
    layer.style.transform = 'none'
    surface.style.transform = `translate3d(${x.toFixed(2)}%, ${y.toFixed(2)}%, 0) scale(${scale.toFixed(3)})${flip}`
    media.style.opacity = String(clamp(options.opacity, 0, 100, 100) / 100)
    layer._poster.style.opacity = String(clamp(options.opacity, 0, 100, 100) / 100)
    const images = media.querySelectorAll
      ? [...media.querySelectorAll('img')]
      : [media.querySelector('img')].filter(Boolean)
    const objectFit = options.fit === 'center' ? 'none' : options.fit
    images.forEach(image => {
      image.style.objectFit = objectFit
      image.style.objectPosition = 'center'
    })
    const video = media.querySelector('video')
    if (video) {
      video.style.objectFit = objectFit
      video.style.objectPosition = 'center'
      video.muted = !options.sound
      video.volume = clamp(options.volume, 0, 100, 100) / 100
      video.playbackRate = clamp(options.playbackRate, 0.25, 2, 1)
      video.loop = options.loop !== false
    }
  }

  buildNextLayer(options, key) {
    const next = this.buildLayer()
    this.applyOptionsToLayer(next)
    this.applyPoster(next, options)
    this.appendContent(next, options, key)
    this.transitionTo(next, options, key)
  }

  applyPoster(layer, options) {
    const path = options.type === 'scene' ? options.sceneFrame : options.webPreview
    if (!path) return
    const bridge = typeof window !== 'undefined' ? window.hermesDesktop : null
    if (!bridge?.readFileDataUrl) return
    const image = document.createElement('img')
    image.alt = ''
    image.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;'
    image.onerror = () => image.remove()
    bridge.readFileDataUrl(path).then(data => {
      if (typeof data === 'string' && data.startsWith('data:image/')) image.src = data
    }).catch(() => image.remove())
    layer._poster.appendChild(image)
  }

  appendContent(layer, options, key) {
    if (options.type === 'scene' || options.type === 'web') {
      if (options.mode !== 'frame' && options.sceneLive) {
        if (document.hidden) layer.dataset.liveState = 'deferred'
        else void this.showLive(layer, options, key)
      }
      return
    }
    if (options.type === 'video') {
      this.showVideo(layer, options, key)
      return
    }
    this.showImage(layer, options, key)
  }

  showImage(layer, options, key) {
    if (Array.isArray(options.slides) && options.slides.length > 1) {
      const wrap = document.createElement('div')
      wrap.style.cssText = 'position:absolute;inset:0;overflow:hidden;'
      const first = document.createElement('img')
      const second = document.createElement('img')
      for (const image of [first, second]) {
        image.alt = ''
        const fit = options.fit === 'center' ? 'none' : options.fit
        image.style.cssText = `position:absolute;inset:0;width:100%;height:100%;object-fit:${fit};object-position:center;display:block;transition:opacity 800ms ease;`
        wrap.appendChild(image)
      }
      first.src = normalizeMediaSource(options.slides[0], 'image') || options.slides[0]
      first.style.opacity = '1'
      second.style.opacity = '0'
      layer._media.appendChild(wrap)
      let index = 0
      const interval = clamp(options.slideIntervalMs, 1000, 24 * 60 * 60 * 1000, 60_000)
      layer._slideTimer = setInterval(() => {
        if (this.currentKey !== key) return
        index += 1
        const incoming = index % 2 === 0 ? first : second
        const outgoing = index % 2 === 0 ? second : first
        incoming.onload = () => {
          if (this.currentKey !== key) return
          incoming.style.opacity = '1'
          outgoing.style.opacity = '0'
        }
        incoming.src = normalizeMediaSource(options.slides[index % options.slides.length], 'image') ||
          options.slides[index % options.slides.length]
      }, interval)
      return
    }
    const image = document.createElement('img')
    image.alt = ''
    const fit = options.fit === 'center' ? 'none' : options.fit
    image.style.cssText = `width:100%;height:100%;object-fit:${fit};object-position:center;display:block;`
    let triedBridge = false
    image.onerror = async () => {
      const local = /^[a-zA-Z]:[\\/]/.test(options.src) || /^file:\/\/\//i.test(options.src)
      const bridge = typeof window !== 'undefined' ? window.hermesDesktop : null
      if (!triedBridge && local && bridge?.readFileDataUrl) {
        triedBridge = true
        try {
          const data = await bridge.readFileDataUrl(options.src)
          if (this.currentKey === key && typeof data === 'string' && data.startsWith('data:image/')) {
            image.src = data
            return
          }
        } catch { /* Invalid or oversized local image. */ }
      }
      this.fail(key)
    }
    image.src = options.src
    layer._media.appendChild(image)
  }

  showVideo(layer, options, key) {
    const video = document.createElement('video')
    video.autoplay = true
    video.loop = options.loop !== false
    video.playsInline = true
    video.preload = 'auto'
    video.muted = !options.sound
    video.volume = clamp(options.volume, 0, 100, 100) / 100
    video.playbackRate = clamp(options.playbackRate, 0.25, 2, 1)
    const fit = options.fit === 'center' ? 'none' : options.fit
    video.style.cssText = `width:100%;height:100%;object-fit:${fit};object-position:center;display:block;`
    video.onerror = () => this.fail(key)
    video.onended = () => {
      if (this.currentKey === key && options.loop === false) this.onMediaEnd?.()
    }
    video.src = options.src
    layer._media.appendChild(video)
    if (options.mode === 'frame') {
      video.addEventListener('loadeddata', () => {
        if (this.currentKey !== key) return
        try {
          const canvas = document.createElement('canvas')
          const scale = Math.min(1, 1920 / Math.max(video.videoWidth, video.videoHeight))
          canvas.width = Math.max(1, Math.round(video.videoWidth * scale))
          canvas.height = Math.max(1, Math.round(video.videoHeight * scale))
          canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height)
          const image = document.createElement('img')
          image.src = canvas.toDataURL('image/jpeg', 0.9)
          image.style.cssText = `width:100%;height:100%;object-fit:${options.fit === 'center' ? 'none' : options.fit};object-position:center;display:block;`
          if (this.currentKey === key) layer._media.replaceChildren(image)
        } catch { /* Keep the live video if capture is blocked. */ }
        finally { video.pause() }
      }, { once: true })
    }
    void video.play().catch(error => {
      // Chromium rejects play() with AbortError when a hidden/occluded window
      // pauses background media to save power; that is not a broken wallpaper.
      if (error?.name === 'AbortError' || error?.name === 'NotAllowedError') return
      if (this.currentKey === key) this.fail(key)
    })
  }

  async showLive(layer, options, key) {
    if (document.hidden) {
      layer.dataset.liveState = 'deferred'
      return
    }
    if (this.liveStarting) return
    this.liveStarting = true
    layer.dataset.liveState = 'starting'
    if (typeof this.openScene !== 'function') {
      this.liveFailed = true
      layer.dataset.liveState = 'error:no-backend'
      this.liveStarting = false
      return
    }
    this.liveReady = false
    this.liveFailed = false
    try {
      const project = await openLiveProject(this.openScene, {
        dir: options.sceneDir || projectDirectory(options.src),
        manifestPath: options.sceneManifest
      })
      if (this.currentKey !== key) return
      layer.dataset.liveState = 'opened'
      this.sceneProject = project
      this.sceneType = options.type
      const origin = project.mediaOrigin || await resolveBackendOrigin()
      const muted = !options.sound || clamp(options.volume, 0, 100, 100) <= 0
      const url = options.type === 'scene'
        ? liveSceneUrl(project, {
            origin,
            fit: options.fit, fps: options.sceneLiveFps, muted,
            autoQuality: options.sceneAutoQuality, renderDpr: options.sceneRenderDpr,
            videoTexScale: options.sceneVideoTexScale
          })
        : liveWebUrl(project, project.file, {
            origin,
            fit: options.fit, fps: options.sceneLiveFps, muted,
            autoQuality: options.sceneAutoQuality
          })
      const frame = document.createElement('iframe')
      frame.setAttribute('sandbox', 'allow-scripts allow-same-origin')
      frame.setAttribute('allow', 'autoplay; fullscreen')
      frame.setAttribute('aria-hidden', 'true')
      frame.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0;background:transparent;opacity:0;transition:opacity 1200ms ease;'
      frame.onload = () => {
        if (this.sceneIframe !== frame) return
        this.applyLiveOptions(true)
        this.syncPlayback()
      }
      this.sceneIframe = frame
      this.liveWatchdog = setTimeout(() => {
        this.liveWatchdog = null
        if (this.sceneIframe !== frame || this.liveReady) return
        this.liveFailed = true
        this.onLiveState?.({ ready: false, error: 'Scene renderer did not produce a frame in time' })
      }, LIVE_FIRST_FRAME_MS)
      frame.src = url
      layer._media.appendChild(frame)
      layer.dataset.liveState = 'framed'
    } catch (error) {
      this.liveFailed = true
      layer.dataset.liveState = `error:${String(error?.message || error).slice(0, 120)}`
      this.onLiveState?.({ ready: false, error: String(error?.message || error) })
    } finally {
      this.liveStarting = false
    }
  }

  resumeDeferredLive() {
    const options = this.currentOptions
    const layer = this.layer
    if (!options || !layer || !this.currentKey || document.hidden) return
    if (options.type !== 'scene' && options.type !== 'web') return
    if (!options.sceneLive || options.mode === 'frame' || this.sceneIframe) return
    if (layer.dataset.liveState !== 'deferred' && layer.dataset.liveState !== 'idle') return
    void this.showLive(layer, options, this.currentKey)
  }

  applyLiveOptions(force = false) {
    if (!this.sceneIframe || (!this.liveReady && !force)) return
    const options = this.currentOptions
    const muted = !options.sound || clamp(options.volume, 0, 100, 100) <= 0
    this.postScene({ type: 'command', command: 'setFit', args: [options.fit] })
    this.postScene({ type: 'command', command: 'setSceneFps', args: [options.sceneLiveFps] })
    this.postScene({ type: 'command', command: 'setVolume', args: [muted ? 0 : clamp(options.volume, 0, 100, 100) / 100] })
    this.postScene({ type: 'command', command: 'setRenderDpr', args: [options.sceneRenderDpr] })
    if (!options.sceneAutoQuality) this.postScene({ type: 'command', command: 'setQuality', args: [{ autoQuality: false }] })
    if (options.userProps && typeof options.userProps === 'object') {
      this.postScene({ type: 'command', command: 'updateWebProps', args: [options.userProps] })
    }
    if (this.liveReady) {
      this.sceneIframe.style.opacity = String(clamp(options.opacity, 0, 100, 100) / 100)
      this.layer?.classList.add(LIVE_READY_CLASS)
      const poster = this.layer?._poster
      if (poster) {
        poster.style.transition = `opacity 300ms ease ${LIVE_FADE_MS}ms`
        poster.style.opacity = '0'
      }
    }
    this.pushMediaSnapshot()
  }

  syncPlayback() {
    if (typeof document === 'undefined') return
    const options = this.currentOptions
    if (!options) return
    const hiddenPaused = options.pauseOnHidden && document.hidden
    const blurPaused = options.pauseOnBlur && typeof document.hasFocus === 'function' && !document.hasFocus()
    const batteryPaused = options.pauseOnBattery && this.battery && !this.battery.charging
    const paused = Boolean(hiddenPaused || blurPaused || batteryPaused)
    const video = this.layer?._media?.querySelector('video')
    if (video) {
      if (paused) video.pause()
      else void video.play().catch(() => {})
    }
    if (this.sceneIframe) {
      this.postScene({ type: 'command', command: paused ? 'pause' : 'resume', args: [] })
    }
    this.pauseReasons.clear()
    if (hiddenPaused) this.pauseReasons.add('hidden')
    if (blurPaused) this.pauseReasons.add('blur')
    if (batteryPaused) this.pauseReasons.add('battery')
  }

  transitionTo(next, options, key) {
    const transition = options.transition || 'fade'
    const duration = Math.round((TRANSITION_BASE_MS[transition] || 700) *
      (TRANSITION_SPEED_FACTOR[options.transitionSpeed] || 1))
    const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
    const ms = reduced || transition === 'cut' ? 0 : clamp(duration, 0, 2000, 700)
    const old = this.layer
    this.layer = next
    this.sceneIframe = next._media.querySelector('iframe') || null
    this.layers.appendChild(next)
    if (!old) {
      next.style.transition = 'none'
      next.style.opacity = '1'
      this.applyOptionsToLayer(next)
      this.syncPlayback()
      return
    }
    this.previousLayer = old
    const ease = 'cubic-bezier(0.22, 0.61, 0.36, 1)'
    if (ms === 0) {
      this.retireLayer(old)
      next.style.opacity = '1'
      this.previousLayer = null
      this.applyOptionsToLayer(next)
      this.syncPlayback()
      return
    }
    const direction = options.transitionDir || 'left'
    let incoming = { opacity: '0' }
    let outgoing = {}
    if (transition === 'fade') incoming = { opacity: '0' }
    else if (transition === 'push') {
      incoming = { transform: pushOffset(direction, true) }
      outgoing = { transform: pushOffset(direction, false) }
    } else if (transition === 'wipe') {
      incoming = { clipPath: wipeInset(direction) }
      outgoing = {}
    } else if (transition === 'iris') {
      incoming = { clipPath: 'circle(0% at 50% 50%)' }
      outgoing = {}
    } else if (transition === 'zoom') {
      incoming = { transform: 'scale(1.06)', opacity: '0' }
      outgoing = { transform: 'scale(1.04)' }
    } else if (transition === 'bars') {
      incoming = { clipPath: barsPolygon(direction, 0) }
      outgoing = {}
    }
    next.style.transition = 'none'
    next.style.willChange = 'opacity, transform'
    Object.assign(next.style, incoming)
    old.style.transition = 'none'
    old.style.willChange = 'opacity, transform'
    old.style.opacity = '1'
    old.style.transform = 'none'
    requestAnimationFrame(() => {
      next.style.transition = `opacity ${ms}ms ${ease}, transform ${ms}ms ${ease}, clip-path ${ms}ms ${ease}`
      old.style.transition = `opacity ${ms}ms ${ease}, transform ${ms}ms ${ease}, clip-path ${ms}ms ${ease}`
      if (outgoing.opacity !== undefined) old.style.opacity = outgoing.opacity
      if (outgoing.transform !== undefined) old.style.transform = outgoing.transform
      if (outgoing.clipPath !== undefined) old.style.clipPath = outgoing.clipPath
      next.style.opacity = '1'
      next.style.transform = 'none'
      next.style.clipPath = transition === 'iris' ? 'circle(75% at 50% 50%)'
        : transition === 'bars' ? barsPolygon(direction, 1) : 'inset(0)'
      this.applyOptionsToLayer(next)
      this.syncPlayback()
    })
    setTimeout(() => {
      if (this.previousLayer === old) this.previousLayer = null
      next.style.willChange = ''
      if (this.currentKey === key) {
        old.style.willChange = ''
        this.retireLayer(old)
      }
    }, ms + 60)
  }

  fail(key) {
    if (this.currentKey !== key) return
    this.failedKeys.add(key)
    this.hide()
    this.onVisibilityChange?.()
  }

  hide() {
    if (this.root) this.root.style.display = 'none'
    this.releaseLayers()
    this.currentKey = null
    this.currentOptions = null
  }

  releaseLayers() {
    for (const layer of this.layers?.children || []) {
      this.retireLayer(layer)
    }
    this.layer = null
    this.previousLayer = null
    this.sceneIframe = null
    this.sceneProject = null
    this.liveReady = false
    this.liveFailed = false
    if (this.liveWatchdog !== null) clearTimeout(this.liveWatchdog)
    this.liveWatchdog = null
  }

  retireLayer(layer) {
    if (!layer) return
    const frame = layer._media?.querySelector('iframe')
    try { frame?.contentWindow?.postMessage({ source: 'hermes-skins-host', type: 'command', command: 'destroy', args: [] }, '*') } catch {}
    const video = layer._media?.querySelector('video')
    if (video) {
      video.pause()
      video.removeAttribute('src')
      video.load()
    }
    if (layer._slideTimer) {
      clearInterval(layer._slideTimer)
      layer._slideTimer = null
    }
    layer.remove()
  }

  /** Compatibility alias for callers that release the current media only. */
  releaseMedia() {
    this.pointerLeave()
    this.releaseLayers()
  }

  destroy() {
    this.pointerLeave()
    if (this.pointerInitialized) {
      window.removeEventListener('pointermove', this.onPointerMove, { capture: true })
      window.removeEventListener('pointerdown', this.onPointerDown, { capture: true })
      window.removeEventListener('pointerup', this.onPointerUp, { capture: true })
      window.removeEventListener('pointerleave', this.onPointerLeave)
      document.removeEventListener('pointerleave', this.onPointerLeave)
      window.removeEventListener('blur', this.handleBlur)
      window.removeEventListener('focus', this.handleFocus)
      window.removeEventListener('wheel', this.onWheel, { capture: true })
      document.removeEventListener('visibilitychange', this.handleVisibility)
      window.removeEventListener('message', this.handleSceneMessage)
      if (this.battery) {
        this.battery.removeEventListener('chargingchange', this.handleBattery)
        this.battery.removeEventListener('levelchange', this.handleBattery)
      }
      this.pointerInitialized = false
      this.cursorForwardInit = false
    }
    this.releaseLayers()
    this.root?.remove()
    this.root = null
    this.layers = null
    this.scrim = null
    this.currentKey = null
    this.currentOptions = null
    this.failedKeys.clear()
  }
}

function isLiveWallpaperSupported() {
  if (typeof WebGL2RenderingContext === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2'))
  } catch {
    return false
  }
}

// ─── Submodule: Glass Controller ──────────────────────────────
/** Only changes the shell surfaces needed to show a wallpaper. */
const STYLE_ID = 'hermes-skins-runtime-css'
// PaneBody is the first structural painter in the current Hermes layout.
// Sidebar, conversation and file views mount INSIDE it rather than beside it.
const PANE_SURFACE = '[class*="bg-(--ui-editor-surface-background)"]'
const NESTED_SURFACES = ':is([data-chat-surface], [data-slot="sidebar"], [data-panel-header], [class*="bg-(--ui-editor-surface-background)"], [class*="bg-(--ui-sidebar-surface-background)"], [class*="bg-(--ui-chat-surface-background)"])'
const MESSAGE_BUBBLES = ':is(.composer-human-message, .standalone-glass, [class*="bg-(--dt-user-bubble)"], [class*="bg-(--ui-chat-bubble-background)"])'
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

const TRANSPARENT_TERMINAL = 'rgba(0, 0, 0, 0)'
const TERMINAL_SELECTION = '#4f8cff59'
const TERMINAL_SELECTION_RGBA = 0x4f8cff59
const TERMINAL_SELECTION_OPAQUE = '#c8dcff'
const TERMINAL_SELECTION_OPAQUE_RGBA = 0xc8dcffff
const TERMINAL_SELECTION_INACTIVE_OPAQUE = '#dbe7ff'
const TERMINAL_SELECTION_INACTIVE_OPAQUE_RGBA = 0xdbe7ffff

function terminalSelectionColor(opacity = 'transparent') {
  if (opacity === 'opaque') {
    return { css: TERMINAL_SELECTION_OPAQUE, rgba: TERMINAL_SELECTION_OPAQUE_RGBA }
  }
  if (opacity === 'inactive') {
    return { css: TERMINAL_SELECTION_INACTIVE_OPAQUE, rgba: TERMINAL_SELECTION_INACTIVE_OPAQUE_RGBA }
  }
  return { css: TERMINAL_SELECTION, rgba: TERMINAL_SELECTION_RGBA }
}

function isXtermTerminal(value) {
  return Boolean(
    value && typeof value === 'object' &&
    value.options && value._core && typeof value.refresh === 'function' &&
    value._core.optionsService &&
    typeof value._core.optionsService.onSpecificOptionChange === 'function'
  )
}

function isXtermAddon(value) {
  return Boolean(
    value && typeof value === 'object' &&
    value._terminal && '_renderer' in value && typeof value.dispose === 'function'
  )
}

/**
 * Hermes constructs xterm with allowTransparency:false. Its public React tree
 * still keeps both the Terminal and WebGL addon in refs, which is the only
 * supported way to change the already-created renderer without rebuilding the
 * host. Walk the owning fiber's hook list rather than guessing at minified
 * component names, so a host refactor keeps working as long as the refs do.
 */
function findXtermTerminal(host) {
  if (!host || typeof host !== 'object') return null
  const fiberKey = Object.keys(host).find(name => name.startsWith('__reactFiber$'))
  if (!fiberKey) return null
  let fiber = host[fiberKey]
  const seenFibers = new Set()
  let terminal = null
  let addon = null
  for (let depth = 0; fiber && depth < 14; depth++, fiber = fiber.return) {
    for (const candidate of [fiber, fiber.alternate]) {
      if (!candidate || seenFibers.has(candidate)) continue
      seenFibers.add(candidate)
      let hook = candidate.memoizedState
      for (let index = 0; hook && index < 80; index++, hook = hook.next) {
        const value = hook.memoizedState?.current
        if (!terminal && isXtermTerminal(value)) terminal = value
        if (!addon && isXtermAddon(value)) addon = value
        if (terminal && addon) return { terminal, addon }
      }
    }
  }
  return terminal ? { terminal, addon } : null
}

class GlassController {
  constructor() {
    this.styleEl = null
    this.refitObserver = null
    this.refitTargets = new Set()
    this.refitQueued = false
    this.refitTimer = null
    this.materialRule = null
    this.lastMaterialKey = null
    this.terminalThemeKey = null
    this.terminalBase = null
    this.terminalObserver = null
    this.terminalRecords = new Map()
    this.terminalHostStyles = new Map()
  }

  update({
    enabled, glassTransparency = 10, bubbleOpacity = 100, composerFrost = 10,
    surfaceFrost = 8, saturation = 150, border = 35, highlight = true,
    accent = '#4f8cff', glassColor = null, glassDarkSeparate = false,
    glassFidelity = 100, chatGlassFidelity = 100,
    settingsWindowTransparency = 20, settingsWindowBlur = 16,
    sidebarGlass = true, sidebarFollowGlobal = true, sidebarBlur = 16,
    sidebarAlpha = 60, sidebarColor = '#ffffff', leftSidebarGlass = true,
    leftSidebarCornerRadius = 'native', leftSidebarSquareTL = false,
    leftSidebarSquareTR = false, leftSidebarSquareBR = false, leftSidebarSquareBL = false,
    rightSidebarCornerRadius = 'native', rightSidebarSquareTL = false,
    rightSidebarSquareTR = false, rightSidebarSquareBR = false, rightSidebarSquareBL = false,
    titlebarGlass = true, isDark = true
  }) {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    if (!enabled) {
      root.removeAttribute('data-hermes-skins-active')
      const styleEl = this.styleEl || document.getElementById(STYLE_ID)
      styleEl?.remove()
      this.styleEl = null
      this.materialRule = null
      this.lastMaterialKey = null
      this.terminalThemeKey = null
      this.releaseTerminalObserver()
      this.releaseRefitWatcher()
      return
    }
    if (!this.styleEl || !document.head.contains(this.styleEl)) {
      this.materialRule = null
      this.lastMaterialKey = null
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
    const fidelity = Math.min(1, Math.max(0, Number(glassFidelity) / 100))
    const chatFidelity = Math.min(1, Math.max(0, Number(chatGlassFidelity) / 100))
    const keep = (100 - pct(glassTransparency, 10)) * (0.4 + 0.6 * fidelity)
    // Floating text sits over other text, so it retains a readable veil while
    // still revealing the wallpaper. It follows the main lever above 70% fill.
    const floatingKeep = Math.max(keep, 70)
    const overlayKeep = Math.min(100, Math.max(25, 100 - pct(settingsWindowTransparency, 20)))
    const bubbleKeep = pct(bubbleOpacity, 100) * (0.5 + 0.5 * chatFidelity)
    const composerBlur = Math.min(20, Math.max(0, pct(composerFrost, 10)))
    const surfaceBlur = Math.min(20, Math.max(0, pct(surfaceFrost, 8)))
    const overlayBlur = Math.min(60, Math.max(0, pct(settingsWindowBlur, 16)))

    // Frosted glass samples the wallpaper behind a surface; blur(0) would still
    // promote a composited layer, so the frost vars stay `none` when off.
    const saturate = Math.min(200, Math.max(100, Number.isFinite(Number(saturation)) ? Number(saturation) : 150))
    const borderAlpha = Math.min(1, Math.max(0, (Number.isFinite(Number(border)) ? Number(border) : 35) / 100))
    const highlightAlpha = highlight ? 0.16 : 0
    const frost = surfaceBlur > 0 ? `saturate(${saturate}%) blur(${surfaceBlur}px)` : 'none'
    const overlayFrost = overlayBlur > 0 ? `saturate(${saturate}%) blur(${overlayBlur}px)` : 'none'
    const overlayScrimFrost = 'none'
    const composerFrostCss = composerBlur > 0 ? `saturate(${saturate}%) blur(${composerBlur}px)` : 'none'
    const chosenGlassColor = glassColor && typeof glassColor === 'object'
      ? (isDark && glassDarkSeparate ? glassColor.dark : glassColor.light)
      : null
    const customTint = /^#[0-9a-f]{6}$/i.test(chosenGlassColor || '') &&
      String(chosenGlassColor).toLowerCase() !== '#ffffff'
      ? `color-mix(in srgb, ${chosenGlassColor} ${keep}%, transparent)`
      : null
    const chromeTint = customTint || `color-mix(in srgb, var(--ui-bg-chrome) ${keep}%, transparent)`
    const sidebarKeep = sidebarFollowGlobal ? keep : 100 - pct(sidebarAlpha, 60)
    const sidebarTint = !sidebarGlass || !leftSidebarGlass
      ? 'var(--ui-bg-sidebar)'
      : sidebarFollowGlobal
        ? chromeTint
        : `color-mix(in srgb, ${sidebarColor} ${sidebarKeep}%, transparent)`
    const sidebarFrost = sidebarFollowGlobal
      ? frost
      : sidebarBlur > 0 ? `saturate(${saturate}%) blur(${Math.min(60, sidebarBlur)}px)` : 'none'
    const titlebarTint = titlebarGlass ? chromeTint : 'var(--ui-bg-chrome)'
    const titlebarFrost = titlebarGlass ? frost : 'none'
    const cornerOf = (mode, square) => square ? '0px'
      : mode === 'native' ? 'var(--radius-lg, 12px)' : `${mode}px`
    const nativeCorners = leftSidebarCornerRadius === 'native' &&
      !leftSidebarSquareTL && !leftSidebarSquareTR &&
      !leftSidebarSquareBR && !leftSidebarSquareBL
    const sidebarRadius = nativeCorners ? 'revert'
      : `${cornerOf(leftSidebarCornerRadius, leftSidebarSquareTL)}
        ${cornerOf(leftSidebarCornerRadius, leftSidebarSquareTR)}
        ${cornerOf(leftSidebarCornerRadius, leftSidebarSquareBR)}
        ${cornerOf(leftSidebarCornerRadius, leftSidebarSquareBL)}`

    // Terminal: xterm resolves --ui-terminal-surface-background to a concrete
    // color for its WebGL canvas, and the persistent host paints the same var
    // inline. Unpatched hosts construct xterm with allowTransparency:false, so
    // CSS alone can only cover that opaque canvas, never reveal the wallpaper
    // through it. applyTerminalSurface() flips the live renderer to alpha and
    // the inner [data-terminal] owns the single glass fill; the outer persistent
    // wrapper stays clear so the 45% tint is not compounded into ~70% white.
    // Both literals come from the live --ui-bg-chrome probe because xterm
    // rejects color-mix/color(srgb) backgrounds.
    const terminalAlpha = root.dataset?.hermesTerminalAlpha === 'true'
    const themeKey = `${root.dataset?.hermesTheme}:${root.dataset?.hermesMode}:${root.className}:${root.style?.cssText || ''}`
    const terminalCanvasBlend = isDark ? 'screen' : 'multiply'
    const materialKey = `${keep}:${overlayKeep}:${bubbleKeep}:${composerBlur}:${surfaceBlur}:${overlayBlur}:${saturate}:${borderAlpha}:${highlightAlpha}:${terminalAlpha}:${terminalCanvasBlend}:${accent}:${chosenGlassColor}:${fidelity}:${chatFidelity}:${sidebarGlass}:${sidebarFollowGlobal}:${sidebarBlur}:${sidebarAlpha}:${sidebarColor}:${leftSidebarGlass}:${leftSidebarCornerRadius}:${leftSidebarSquareTL}:${leftSidebarSquareTR}:${leftSidebarSquareBR}:${leftSidebarSquareBL}:${rightSidebarCornerRadius}:${rightSidebarSquareTL}:${rightSidebarSquareTR}:${rightSidebarSquareBR}:${rightSidebarSquareBL}:${titlebarGlass}:${themeKey}`
    if (this.lastMaterialKey === materialKey && this.styleEl.isConnected) return
    let terminalSurface = 'var(--ui-bg-chrome)'
    let terminalTint = `color-mix(in srgb, var(--ui-bg-chrome) ${Math.max(32, keep)}%, transparent)`
    if (document.body) {
      // The resolved theme color only changes with the host theme. Reusing it
      // avoids an append -> getComputedStyle -> remove flush on every drag.
      if (this.terminalThemeKey !== themeKey) {
        const probe = document.createElement('span')
        probe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;background-color:var(--ui-bg-chrome);'
        document.body.appendChild(probe)
        this.terminalBase = parseSerializedColor(getComputedStyle(probe).backgroundColor)
        probe.remove()
        this.terminalThemeKey = themeKey
      }
      const base = this.terminalBase
      if (base) {
        terminalTint = `rgba(${base.r}, ${base.g}, ${base.b}, ${keep / 100})`
        terminalSurface = `rgba(${base.r}, ${base.g}, ${base.b}, ${keep / 100})`
      }
    }

    if (root.getAttribute?.('data-hermes-skins-active') !== 'true') root.setAttribute('data-hermes-skins-active', 'true')
    if (this.materialRule) {
      // Keep the large selector sheet parsed and change only its material
      // properties. CSSOM edits do not enqueue childList mutation scans.
      const properties = {
        '--hermes-skins-keep': `${keep}%`,
        '--hermes-skins-floating-tint': `color-mix(in srgb, var(--ui-bg-chrome) ${floatingKeep}%, transparent)`,
        '--hermes-skins-overlay-tint': `color-mix(in srgb, var(--ui-bg-chrome) ${overlayKeep}%, transparent)`,
        '--hermes-skins-overlay-sidebar-tint': `color-mix(in srgb, var(--ui-bg-sidebar) ${Math.max(25, overlayKeep - 40)}%, transparent)`,
        '--hermes-skins-chrome-tint': chromeTint,
        '--hermes-skins-sidebar-tint': sidebarTint,
        '--hermes-skins-editor-tint': chromeTint,
        '--hermes-skins-frost': frost,
        '--hermes-skins-sidebar-frost': sidebarFrost,
        '--hermes-skins-terminal-tint': terminalTint,
        '--hermes-skins-terminal-canvas-blend': terminalCanvasBlend,
        '--hermes-skins-titlebar-tint': titlebarTint,
        '--hermes-skins-titlebar-frost': titlebarFrost,
        '--hermes-skins-overlay-frost': overlayFrost,
        '--hermes-skins-overlay-scrim-frost': overlayScrimFrost,
        '--hermes-skins-composer-frost': composerFrostCss,
        '--hermes-skins-glass-border': String(borderAlpha),
        '--hermes-skins-glass-highlight': String(highlightAlpha),
        '--hermes-skins-accent': accent,
        '--we-accent': accent,
        '--hermes-skins-fidelity': String(fidelity),
        '--hermes-skins-chat-fidelity': String(chatFidelity),
        '--hermes-skins-sidebar-radius': sidebarRadius,
        '--user-bubble-keep': `${bubbleKeep}%`,
        '--ui-terminal-surface-background': terminalSurface
      }
      for (const [name, value] of Object.entries(properties)) {
        if (this.materialRule.getPropertyValue(name).trim() !== value) {
          this.materialRule.setProperty(name, value, name === '--user-bubble-keep' ? 'important' : '')
        }
      }
      this.lastMaterialKey = materialKey
      return
    }
    const css = `
      :root[data-hermes-skins-active="true"] {
        --hermes-skins-keep: ${keep}%;
        --hermes-skins-chrome-tint: ${chromeTint};
        --hermes-skins-sidebar-tint: ${sidebarTint};
        --hermes-skins-editor-tint: ${chromeTint};
        --hermes-skins-floating-tint: color-mix(in srgb, var(--ui-bg-chrome) ${floatingKeep}%, transparent);
        --hermes-skins-overlay-tint: color-mix(in srgb, var(--ui-bg-chrome) ${overlayKeep}%, transparent);
        --hermes-skins-overlay-sidebar-tint: color-mix(in srgb, var(--ui-bg-sidebar) ${Math.max(25, overlayKeep - 40)}%, transparent);
        --hermes-skins-frost: ${frost};
        --hermes-skins-sidebar-frost: ${sidebarFrost};
        --hermes-skins-terminal-tint: ${terminalTint};
        --hermes-skins-terminal-canvas-blend: ${terminalCanvasBlend};
        --hermes-skins-titlebar-tint: ${titlebarTint};
        --hermes-skins-titlebar-frost: ${titlebarFrost};
        --hermes-skins-overlay-frost: ${overlayFrost};
        --hermes-skins-overlay-scrim-frost: ${overlayScrimFrost};
        --hermes-skins-composer-frost: ${composerFrostCss};
        --hermes-skins-glass-border: ${borderAlpha};
        --hermes-skins-glass-highlight: ${highlightAlpha};
        --hermes-skins-accent: ${accent};
        --we-accent: ${accent};
        --hermes-skins-fidelity: ${fidelity};
        --hermes-skins-chat-fidelity: ${chatFidelity};
        --hermes-skins-sidebar-radius: ${sidebarRadius};
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
        --dt-user-bubble: transparent;
      }
      /* Chat messages sit inside a pane that already owns the shared glass
         fill. Painting the message bubble again stacks a second 45% veil,
         which reads as a different material from the terminal and file panes.
         Keep the bubble border/shadow as its affordance and inherit the one
         structural fill beneath it. */
      :root[data-hermes-skins-active="true"] [data-chat-surface] ${MESSAGE_BUBBLES} {
        background-color: transparent !important;
        background-image: none !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
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
        backdrop-filter: var(--hermes-skins-sidebar-frost);
        -webkit-backdrop-filter: var(--hermes-skins-sidebar-frost);
        border-radius: var(--hermes-skins-sidebar-radius, revert);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, var(--hermes-skins-glass-highlight)),
          inset 0 0 0 1px rgba(255, 255, 255, var(--hermes-skins-glass-border));
      }
      /* Frameless-window title bar: the popout shell declares --titlebar-height
         and its aria-hidden first child paints the opaque chrome strip. */
      :root[data-hermes-skins-active="true"] [data-contrib-shell][style*="--titlebar-height"] > div[aria-hidden="true"] {
        background-color: var(--hermes-skins-titlebar-tint) !important;
        backdrop-filter: var(--hermes-skins-titlebar-frost);
        -webkit-backdrop-filter: var(--hermes-skins-titlebar-frost);
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
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, var(--hermes-skins-glass-highlight));
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
         tokens. These are the large white plates visible in the plugin settings.
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
      /* Overlay modal cards (Settings, Command Center, Profiles) and raised glass surfaces:
         instead of opaque 94-100% white/black slabs, they join the frosted glass style
         with clean text readability and wallpaper translucency. */
      :root[data-hermes-skins-active="true"] [data-overlay-surface] {
        background-color: color-mix(in srgb, #000 18%, transparent) !important;
        backdrop-filter: var(--hermes-skins-overlay-scrim-frost) !important;
        -webkit-backdrop-filter: var(--hermes-skins-overlay-scrim-frost) !important;
      }
      :root[data-hermes-skins-active="true"] [data-glass-raised] {
        --ui-chat-surface-background: var(--hermes-skins-overlay-tint) !important;
        --ui-sidebar-surface-background: var(--hermes-skins-overlay-sidebar-tint) !important;
        --ui-editor-surface-background: var(--hermes-skins-overlay-tint) !important;
        background-color: var(--hermes-skins-overlay-tint) !important;
        backdrop-filter: var(--hermes-skins-overlay-frost) !important;
        -webkit-backdrop-filter: var(--hermes-skins-overlay-frost) !important;
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.2),
          0 0 0 1px color-mix(in srgb, var(--dt-border) 40%, transparent),
          inset 0 1px 0 rgba(255, 255, 255, var(--hermes-skins-glass-highlight)) !important;
      }
      /* Left sidebar in overlay cards: single layer translucency to avoid double-darkening */
      :root[data-hermes-skins-active="true"] [data-glass-raised] aside,
      :root[data-hermes-skins-active="true"] [data-glass-raised] [class*="bg-(--ui-sidebar-surface-background)"] {
        background-color: var(--hermes-skins-overlay-sidebar-tint) !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
        border-right: 1px solid color-mix(in srgb, var(--ui-stroke-secondary) 50%, transparent) !important;
      }
      :root[data-hermes-skins-active="true"] [data-glass-raised] main {
        background-color: transparent !important;
      }
      /* Titlebar pill buttons (like Search) and opaque badges in overlays */
      :root[data-hermes-skins-active="true"] [data-overlay-surface] [data-glass-opaque] {
        background-color: color-mix(in srgb, var(--ui-bg-chrome) 60%, transparent) !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
        border-color: color-mix(in srgb, var(--ui-stroke-secondary) 60%, transparent) !important;
      }
      /* Radix dialogs and floating dialog contents */
      :root[data-hermes-skins-active="true"] [role="dialog"]:not([data-overlay-surface]),
      :root[data-hermes-skins-active="true"] [data-slot="dialog-content"] {
        background-color: var(--hermes-skins-overlay-tint) !important;
        backdrop-filter: var(--hermes-skins-overlay-frost) !important;
        -webkit-backdrop-filter: var(--hermes-skins-overlay-frost) !important;
      }
      /* The persistent terminal host paints its opaque token inline and seals
         the box with contain:size layout paint. Remove that isolation, keep
         the outer positioning wrapper clear, and let the inner terminal own
         exactly one glass fill. Stacking the same 45% tint on both wrappers
         turns the panel into an almost-solid white plate. Remote-screen
         sharing keeps its real paint. */
      :root[data-hermes-skins-active="true"] [data-persistent-terminal] {
        background-color: transparent !important;
        border-radius: 10px;
        contain: size layout !important;
        isolation: auto !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
      }
      :root[data-hermes-skins-active="true"] [data-terminal]:not([data-remote-screen]) {
        background-color: var(--hermes-skins-terminal-tint, var(--hermes-skins-chrome-tint)) !important;
        border-radius: 10px;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, var(--hermes-skins-glass-highlight)),
          inset 0 0 0 1px rgba(255, 255, 255, var(--hermes-skins-glass-border));
        contain: size layout !important;
        isolation: auto !important;
        /* The rest of the Hermes surface stack does not carry this extra
           blur. A terminal-only blur turns the same 45% tint into a milky
           plate and visibly separates the terminal from the sidebars. */
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
      }
      /* The persistent terminal is a fixed overlay on top of the editor pane,
         and that pane already paints the shared 45% glass. Painting the same
         tint again here compounds two 45% veils into ~70% white. Keep only the
         parent pane's single fill; the xterm canvas above it is transparent. */
      :root[data-hermes-skins-active="true"] [data-persistent-terminal] [data-terminal]:not([data-remote-screen]) {
        background-color: transparent !important;
      }
      /* WebGL xterm draws selections as opaque cell rectangles. A transparent
         renderer needs a soft, high-contrast selection tint that does not read
         as a second solid plate over the wallpaper. */
      :root[data-hermes-skins-active="true"] [data-terminal] ::selection,
      :root[data-hermes-skins-active="true"] [data-persistent-terminal] ::selection {
        background: ${TERMINAL_SELECTION_OPAQUE} !important;
        color: inherit !important;
      }
      :root[data-hermes-skins-active="true"] [data-persistent-terminal] :is(.xterm, .xterm-screen, .xterm-viewport, .xterm-scrollable-element),
      :root[data-hermes-skins-active="true"] [data-terminal]:not([data-remote-screen]) :is(.xterm, .xterm-screen, .xterm-viewport, .xterm-scrollable-element),
      :root[data-hermes-skins-active="true"] [class*="bg-(--ui-terminal-surface-background)"]:not([data-terminal]):not([data-persistent-terminal]),
      :root[data-hermes-skins-active="true"] [class*="[&_.xterm-screen]"][class*="bg-(--ui-terminal-surface-background)"],
      :root[data-hermes-skins-active="true"] [class*="[&_.xterm-viewport]"][class*="bg-(--ui-terminal-surface-background)"] {
        background-color: transparent !important;
      }
      :root[data-hermes-skins-active="true"] [data-persistent-terminal] :is(.xterm-screen, .xterm-viewport) :is(canvas, .xterm-link-layer),
      :root[data-hermes-skins-active="true"] [data-terminal]:not([data-remote-screen]) :is(.xterm-screen, .xterm-viewport) :is(canvas, .xterm-link-layer) {
        mix-blend-mode: var(--hermes-skins-terminal-canvas-blend, normal) !important;
      }
      :root[data-hermes-skins-active="true"] [data-persistent-terminal] .xterm-link-layer,
      :root[data-hermes-skins-active="true"] [data-terminal]:not([data-remote-screen]) .xterm-link-layer {
        mix-blend-mode: normal !important;
      }
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
    if (this.styleEl.textContent !== css) this.styleEl.textContent = css
    this.materialRule = this.styleEl.sheet?.cssRules?.[0]?.style || null
    this.lastMaterialKey = materialKey
    this.syncTerminalObserver()
    this.syncTerminalRefitWatcher()
  }

  /** Hermes writes terminal backgrounds inline and xterm can replace its
   *  canvases after mount. Reapply the two authoritative rules whenever that
   *  subtree changes, so a hot reload cannot leave a white terminal plate. */
  syncTerminalObserver() {
    if (typeof MutationObserver !== 'function' || typeof document === 'undefined') return
    if (this.terminalObserver) return
    this.terminalObserver = new MutationObserver(entries => {
      for (const entry of entries) {
        const target = entry.target
        if (!target || target.nodeType !== 1) continue
        this.applyTerminalSurface(target)
      }
    })
    this.terminalObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ['style', 'class'],
      childList: true,
      subtree: true
    })
    this.applyTerminalSurface(document.body)
  }

  applyTerminalSurface(root) {
    if (typeof document === 'undefined' || !root || typeof root.querySelectorAll !== 'function') return
    const active = document.documentElement.getAttribute?.('data-hermes-skins-active') === 'true'
    const blend = getComputedStyle(document.documentElement)
      .getPropertyValue('--hermes-skins-terminal-canvas-blend').trim() || 'normal'
    const hosts = []
    if (root.matches?.('[data-terminal]:not([data-remote-screen]), [data-persistent-terminal]')) hosts.push(root)
    hosts.push(...(root.querySelectorAll?.('[data-terminal]:not([data-remote-screen]), [data-persistent-terminal]') || []))
    for (const host of hosts) {
      if (!host?.style || typeof host.querySelectorAll !== 'function') continue
      if (host.dataset.hsTerminalOwned !== 'true') {
        if (typeof host.style.getPropertyValue === 'function') {
          this.terminalHostStyles.set(host, {
            contain: host.style.getPropertyValue('contain'),
            containPriority: host.style.getPropertyPriority('contain'),
            isolation: host.style.getPropertyValue('isolation'),
            isolationPriority: host.style.getPropertyPriority('isolation')
          })
        }
        host.dataset.hsTerminalOwned = 'true'
        host.style.setProperty('contain', 'size layout', 'important')
        host.style.setProperty('isolation', 'auto', 'important')
      }
      const alpha = this.ensureTerminalTransparency(host)
      const surfaces = host.querySelectorAll?.('.xterm, .xterm-screen, .xterm-viewport, .xterm-scrollable-element') || []
      for (const surface of surfaces) {
        if (active) surface.style.setProperty('background-color', 'transparent', 'important')
        else surface.style.removeProperty('background-color')
      }
      const canvases = host.querySelectorAll?.('.xterm-screen canvas') || []
      for (const canvas of canvases) {
        if (active) canvas.style.setProperty('mix-blend-mode',
          canvas.classList.contains('xterm-link-layer') || alpha ? 'normal' : blend, 'important')
        else canvas.style.removeProperty('mix-blend-mode')
      }
    }
    const shellSurfaces = []
    if (root.matches?.('[class*="bg-(--ui-terminal-surface-background)"]') &&
        !root.matches?.('[data-terminal], [data-persistent-terminal]')) shellSurfaces.push(root)
    shellSurfaces.push(...(root.querySelectorAll?.('[class*="bg-(--ui-terminal-surface-background)"]') || []))
    for (const surface of shellSurfaces) {
      if (surface.matches?.('[data-terminal], [data-persistent-terminal]')) continue
      if (active) surface.style.setProperty('background-color', 'transparent', 'important')
      else surface.style.removeProperty('background-color')
    }
  }

  ensureTerminalTransparency(host) {
    const found = findXtermTerminal(host)
    if (!found?.terminal) return false
    const { terminal, addon } = found
    let record = this.terminalRecords.get(terminal)
    if (!record) {
      record = {
        terminal,
        addon: null,
        hostTheme: { ...(terminal.options?.theme || {}) },
        originalAllowTransparency: terminal.options?.allowTransparency,
        originalMinimumContrastRatio: terminal.options?.minimumContrastRatio,
        unsubscribe: null,
        enforcing: false,
        restoring: false
      }
      const optionsService = terminal._core?.optionsService
      const subscription = optionsService?.onSpecificOptionChange?.('theme', () => {
        if (record.restoring) return
        const liveTheme = terminal.options?.theme
        if (liveTheme && !record.enforcing) record.hostTheme = { ...liveTheme }
        this.applyTerminalTransparency(record)
      })
      record.unsubscribe = typeof subscription === 'function'
        ? subscription
        : () => subscription?.dispose?.()
      this.terminalRecords.set(terminal, record)
    }
    if (addon) record.addon = addon
    this.applyTerminalTransparency(record)
    host.dataset.hsTerminalAlpha = 'true'
    return true
  }

  applyTerminalTransparency(record) {
    if (!record || record.restoring || record.enforcing) return
    const { terminal } = record
    record.enforcing = true
    let changed = false
    try {
      try {
        if (terminal.options?.allowTransparency !== true) {
          terminal.options.allowTransparency = true
          changed = true
        }
      } catch {}
      try {
        if (terminal.options?.minimumContrastRatio !== 1) {
          terminal.options.minimumContrastRatio = 1
          changed = true
        }
      } catch {}
      const theme = terminal.options?.theme || {}
      if (
        theme.background !== TRANSPARENT_TERMINAL ||
        theme.cursorAccent !== TRANSPARENT_TERMINAL ||
        theme.selectionBackground !== TERMINAL_SELECTION ||
        theme.selectionInactiveBackground !== TERMINAL_SELECTION ||
        theme.selectionForeground !== undefined
      ) {
        terminal.options.theme = {
          ...theme,
          background: TRANSPARENT_TERMINAL,
          cursorAccent: TRANSPARENT_TERMINAL,
          selectionBackground: TERMINAL_SELECTION,
          selectionInactiveBackground: TERMINAL_SELECTION,
          selectionForeground: undefined
        }
        changed = true
      }
      const renderer = record.addon?._renderer || terminal._core?._renderService?._renderer?.value
      const colors = renderer?._themeService?._colors
      if (colors) {
        const selectionColors = {
          selectionBackgroundTransparent: terminalSelectionColor(),
          selectionBackgroundOpaque: terminalSelectionColor('opaque'),
          selectionInactiveBackgroundTransparent: terminalSelectionColor(),
          selectionInactiveBackgroundOpaque: terminalSelectionColor('inactive')
        }
        for (const [name, color] of Object.entries(selectionColors)) {
          if (colors[name]?.rgba !== color.rgba) {
            colors[name] = { ...color }
            changed = true
          }
        }
      }
      const atlasConfig = renderer?._charAtlas?._config
      if (atlasConfig && atlasConfig.allowTransparency !== true) {
        atlasConfig.allowTransparency = true
        changed = true
      }
      const rectangleRenderer = renderer?._rectangleRenderer?.value || renderer?._rectangleRenderer
      if (rectangleRenderer?._bgFloat?.[3] !== undefined && rectangleRenderer._bgFloat[3] !== 0) {
        rectangleRenderer._bgFloat[3] = 0
        changed = true
      }
      if (changed) {
        try { record.addon?.clearTextureAtlas?.() } catch {}
        try { terminal.refresh(0, Math.max(0, terminal.rows - 1)) } catch {}
      }
    } finally {
      record.enforcing = false
    }
  }

  restoreTerminalTransparency() {
    for (const record of this.terminalRecords.values()) {
      record.restoring = true
      try {
        record.unsubscribe?.()
        const { terminal } = record
        try {
          if (record.hostTheme && Object.keys(record.hostTheme).length) {
            terminal.options.theme = { ...record.hostTheme }
          }
          terminal.options.allowTransparency = record.originalAllowTransparency
          terminal.options.minimumContrastRatio = record.originalMinimumContrastRatio
        } catch {}
        const renderer = record.addon?._renderer || terminal._core?._renderService?._renderer?.value
        if (renderer?._charAtlas?._config) {
          renderer._charAtlas._config.allowTransparency = record.originalAllowTransparency === true
        }
        try { record.addon?.clearTextureAtlas?.() } catch {}
        try { terminal.refresh(0, Math.max(0, terminal.rows - 1)) } catch {}
      } finally {
        record.restoring = false
      }
    }
    this.terminalRecords.clear()
  }

  releaseTerminalObserver() {
    this.terminalObserver?.disconnect()
    this.terminalObserver = null
    this.restoreTerminalTransparency()
    if (typeof document === 'undefined' || typeof document.querySelectorAll !== 'function') return
    if (typeof document !== 'undefined') {
      const restoreProperty = (host, name, value, priority) => {
        if (value) host.style?.setProperty?.(name, value, priority)
        else host.style?.removeProperty?.(name)
      }
      for (const [host, original] of this.terminalHostStyles) {
        restoreProperty(host, 'contain', original.contain, original.containPriority)
        restoreProperty(host, 'isolation', original.isolation, original.isolationPriority)
      }
      this.terminalHostStyles.clear()
      for (const host of document.querySelectorAll('[data-hs-terminal-owned]')) {
        delete host.dataset.hsTerminalOwned
        delete host.dataset.hsTerminalAlpha
      }
      for (const surface of document.querySelectorAll('[data-terminal] .xterm, [data-terminal] .xterm-screen, [data-terminal] .xterm-viewport, [data-terminal] .xterm-scrollable-element, [data-persistent-terminal] .xterm, [data-persistent-terminal] .xterm-screen, [data-persistent-terminal] .xterm-viewport, [data-persistent-terminal] .xterm-scrollable-element')) {
        surface.style?.removeProperty?.('background-color')
      }
      for (const surface of document.querySelectorAll('[class*="bg-(--ui-terminal-surface-background)"]:not([data-terminal]):not([data-persistent-terminal])')) {
        surface.style?.removeProperty?.('background-color')
      }
      for (const canvas of document.querySelectorAll('[data-terminal] .xterm-screen canvas, [data-persistent-terminal] .xterm-screen canvas')) {
        canvas.style?.removeProperty?.('mix-blend-mode')
      }
    }
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
    this.refitTimer = setTimeout(() => {
      this.refitTimer = null
      this.refitQueued = false
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('resize'))
    }, 150)
  }

  releaseRefitWatcher() {
    if (this.refitTimer !== null) clearTimeout(this.refitTimer)
    this.refitTimer = null
    this.refitObserver?.disconnect()
    this.refitObserver = null
    this.refitTargets.clear()
    this.refitQueued = false
  }

  destroy() {
    this.releaseTerminalObserver()
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
    this.frame = null
    this.needsCleanup = false
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
          if (record.type === 'attributes') {
            // min/value/type changes on non-range host widgets need no work.
            if (this.inputs.has(record.target) || record.target.matches?.('input[type="range"]')) this.pending.add(record.target)
          }
          else {
            for (const node of record.addedNodes) {
              // Token streams commonly add text nodes. They cannot own inputs.
              if (node.nodeType === undefined || node.nodeType === 1) this.pending.add(node)
            }
            // Restore and release removed inputs; a node moved within the
            // document stays connected and keeps its original saved value.
            if (record.removedNodes.length && this.inputs.size) this.needsCleanup = true
          }
        }
        if (this.pending.size || this.needsCleanup) this.queueFlush()
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
    const flush = () => {
      this.frame = null
      this.queued = false
      if (!this.active) return
      const started = performance.now()
      for (const node of this.pending) {
        let covered = false
        for (let parent = node.parentNode; parent; parent = parent.parentNode) {
          if (this.pending.has(parent)) { covered = true; break }
        }
        if (covered || !node.isConnected) this.pending.delete(node)
      }
      for (const node of this.pending) {
        this.scan(node)
        this.pending.delete(node)
        if (performance.now() - started > 4) break
      }
      // Only tracked controls need cleanup. Never rescan the whole document.
      if (this.needsCleanup || this.inputs.size) {
        this.needsCleanup = false
        for (const input of this.inputs.keys()) {
          if (!input.isConnected || !input.matches('input[type="range"]')) this.restore(input)
        }
      }
      if (this.pending.size) this.queueFlush()
    }
    // Yield to the host's chat rendering; a MutationObserver microtask must
    // not scan DOM before every token has had a chance to paint.
    if (typeof window !== 'undefined' && window.requestAnimationFrame) this.frame = window.requestAnimationFrame(flush)
    else queueMicrotask(flush)
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
    if (this.frame !== null) window.cancelAnimationFrame(this.frame)
    this.frame = null
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
const ROTATION_INTERVAL_MIN = 1
const ROTATION_INTERVAL_MAX = 1440
const ROTATION_TRIGGER_VALUES = ['interval', 'videoEnd']
const ROTATION_ORDER_VALUES = ['sequence', 'random']
const TRANSITION_VALUES = ['cut', 'fade', 'push', 'wipe', 'iris', 'zoom', 'bars']
const TRANSITION_DIRECTIONS = ['left', 'right', 'up', 'down']
const TRANSITION_SPEEDS = ['fast', 'normal', 'slow']
const WALLPAPER_TYPES = ['video', 'web', 'image', 'scene']
const CONTENT_RATINGS = ['everyone', 'pg13', 'mature', 'unrated']
const ORIENTATION_FILTERS = ['all', 'landscape', 'portrait']
const PICKER_LAYOUTS = ['classic', 'fixed']
const FX_CLICK_STYLES = ['ripple', 'spark', 'both']
const FX_TRAIL_STYLES = ['comet', 'dust']
const FX_BLEND_VALUES = ['screen', 'normal', 'overlay', 'multiply', 'lighten']
const FX_COLOR_MODES = ['accent', 'rainbow', 'custom']
const FONT_SET_KEYS = [
  'themeColors', 'themeDarkSeparate', 'themeSize', 'themeWeight',
  'themeFamily', 'globalFamily', 'componentFonts'
]
const THEME_COLOR_ROLE_IDS = ['primary', 'secondary', 'tertiary', 'caption', 'dimmed']
const TYPE_ROLE_IDS = [
  'markdown-h1', 'markdown-h2', 'markdown-h3', 'markdown-h4',
  'markdown-base', 'markdown-small', 'markdown-code', 'markdown-code-block',
  'markdown-table', 'markdown-table-head', 'xs-13', 'xxs-12'
]
const COMPONENT_FONT_TARGETS = [
  { id: 'markdown', label: '对话正文' },
  { id: 'codeBlock', label: '代码块' },
  { id: 'terminal', label: '终端块' },
  { id: 'table', label: '表格' }
]

const DEFAULT_CONFIG = {
  schemaVersion: 7,

  wallpaperEnabled: false,
  wallpaperType: 'image',
  wallpaperMode: 'live',
  wallpaperFit: 'cover',
  wallpaperSource: '',
  wallpaperBlur: 0,
  maskOcclusion: 25,
  wallpaperOpacity: 100,
  backgroundBrightness: 100,
  backgroundContrast: 100,
  backgroundSaturate: 100,
  wallpaperFlip: false,
  wallpaperTransition: 'cut',
  wallpaperTransitionDir: 'left',
  wallpaperTransitionSpeed: 'normal',

  pauseOnHidden: true,
  pauseOnBlur: false,
  pauseOnBattery: false,
  wallpaperSound: false,
  wallpaperVolume: 100,
  videoPlaybackRate: 1,
  sceneLive: true,
  sceneLiveFps: 30,
  sceneAutoQuality: true,
  sceneRenderDpr: 0,
  sceneVideoTexScale: 0,
  liveBootDelay: 3,
  pictureSlideSeconds: 0,

  hiddenWallpaperIds: [],
  userProps: {},
  contentRatingFilter: ['everyone'],
  typeFilter: [...WALLPAPER_TYPES],
  folderFilter: 'all',
  orientationFilter: 'all',
  pickerLayout: 'fixed',

  rotationEnabled: false,
  rotationGroupId: '',
  rotationGroups: [],
  rotationSeeded: false,
  rotationMinutes: 30,

  fontCustom: false,
  fontSets: [],
  fontSetId: '',
  themeColors: {},
  themeDarkSeparate: false,
  themeSize: {},
  themeWeight: {},
  themeFamily: {},
  globalFamily: '',
  componentFonts: {},
  caretColor: '',

  accent: '#4f8cff',
  uiColorCustom: false,
  uiColorSend: '',
  uiColorLink: '',
  uiColorFileIcon: '',
  uiColorTab: '',
  uiColorDeepDiving: '',
  themeFollow: false,

  fxEnabled: false,
  fxClick: true,
  fxClickStyle: 'ripple',
  fxClickSize: 140,
  fxClickGlow: 60,
  fxTrail: true,
  fxTrailStyle: 'comet',
  fxTrailLength: 420,
  fxTrailWidth: 3,
  fxTrailGlow: 60,
  fxOpacity: 85,
  fxBlend: 'screen',
  fxColorMode: 'accent',
  fxColor: '#4f8cff',

  parallaxEnabled: false,
  parallaxBg: 1,
  parallaxUi: false,
  parallaxPlugin: false,
  parallaxUiChatDepth: 1.2,
  parallaxUiComposerDepth: 1.8,
  parallaxUiSidebarDepth: 1.6,
  parallaxUiBubbleDepth: 1.4,
  parallaxPluginDepths: {},
  parallaxSmooth: 85,

  layerPositionX: 50,
  layerPositionY: 50,
  layerScale: 100,

  panelGlass: 10,
  bubbleOpacity: 55,
  composerFrost: 10,
  surfaceFrost: 8,
  glassSaturation: 150,
  glassBorder: 35,
  glassHighlight: true,
  glassColor: { light: '#ffffff', dark: '#ffffff' },
  glassDarkSeparate: false,
  glassFidelity: 100,
  chatGlassFidelity: 100,
  settingsWindowTransparency: 20,
  settingsWindowBlur: 16,
  sidebarGlass: true,
  sidebarFollowGlobal: true,
  sidebarBlur: 16,
  sidebarAlpha: 60,
  sidebarColor: '#ffffff',
  leftSidebarGlass: true,
  leftSidebarCornerRadius: 'native',
  leftSidebarSquareTL: false,
  leftSidebarSquareTR: false,
  leftSidebarSquareBR: false,
  leftSidebarSquareBL: false,
  rightSidebarCornerRadius: 'native',
  rightSidebarSquareTL: false,
  rightSidebarSquareTR: false,
  rightSidebarSquareBR: false,
  rightSidebarSquareBL: false,
  titlebarGlass: true,

  weRoots: [],
  weSelection: null
}

const PARAM_RANGES = {
  wallpaperBlur: { min: 0, max: 60, unit: 'px' },
  maskOcclusion: { min: 0, max: 100, unit: '%' },
  wallpaperOpacity: { min: 0, max: 100, unit: '%' },
  backgroundBrightness: { min: 40, max: 160, unit: '%' },
  backgroundContrast: { min: 40, max: 200, unit: '%' },
  backgroundSaturate: { min: 0, max: 200, unit: '%' },
  layerPositionX: { min: 0, max: 100, unit: '%' },
  layerPositionY: { min: 0, max: 100, unit: '%' },
  layerScale: { min: 50, max: 150, unit: '%' },
  panelGlass: { min: 0, max: 100, unit: '%' },
  bubbleOpacity: { min: 0, max: 100, unit: '%' },
  composerFrost: { min: 0, max: 20, unit: 'px' },
  surfaceFrost: { min: 0, max: 20, unit: 'px' },
  wallpaperVolume: { min: 0, max: 100, unit: '%' },
  glassSaturation: { min: 100, max: 200, unit: '%' },
  glassBorder: { min: 0, max: 100, unit: '%' },
  glassFidelity: { min: 0, max: 100, unit: '%' },
  chatGlassFidelity: { min: 0, max: 100, unit: '%' },
  settingsWindowTransparency: { min: 0, max: 100, unit: '%' },
  settingsWindowBlur: { min: 0, max: 60, unit: 'px' },
  sidebarBlur: { min: 0, max: 60, unit: 'px' },
  sidebarAlpha: { min: 0, max: 100, unit: '%' },
  fxClickSize: { min: 40, max: 400, unit: 'px' },
  fxClickGlow: { min: 0, max: 100, unit: '%' },
  fxTrailLength: { min: 80, max: 2000, unit: 'ms' },
  fxTrailWidth: { min: 1, max: 12, unit: 'px' },
  fxTrailGlow: { min: 0, max: 100, unit: '%' },
  fxOpacity: { min: 10, max: 100, unit: '%' },
  parallaxBg: { min: 0, max: 10, unit: '%' },
  parallaxUiChatDepth: { min: 0, max: 10, unit: '%' },
  parallaxUiComposerDepth: { min: 0, max: 10, unit: '%' },
  parallaxUiSidebarDepth: { min: 0, max: 10, unit: '%' },
  parallaxUiBubbleDepth: { min: 0, max: 10, unit: '%' },
  parallaxSmooth: { min: 0, max: 98, unit: '%' }
}

const HEX_RE = /^#[0-9a-f]{6}$/i
const GROUP_ID_RE = /^[A-Za-z0-9_-]{1,64}$/
const FONT_SET_ID_RE = /^[A-Za-z0-9_-]{1,64}$/

function clampNum(value, min, max, fallback) {
  const number = Number(value)
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback
}

function paramInRange(key, value) {
  const range = PARAM_RANGES[key]
  if (!range) throw new Error(`Unknown parameter: ${key}`)
  return clampNum(value, range.min, range.max, DEFAULT_CONFIG[key])
}

const hex = (value, fallback = '') => typeof value === 'string' && HEX_RE.test(value) ? value : fallback
const text = (value, max = 200) => typeof value === 'string' ? value.slice(0, max) : ''

function uniqueStrings(value, maxItems = 5000, maxLength = 1024) {
  return Array.isArray(value)
    ? [...new Set(value.filter(item => typeof item === 'string' && item.length > 0 && item.length <= maxLength))]
      .slice(0, maxItems)
    : []
}

function enumArray(value, allowed, fallback) {
  if (!Array.isArray(value)) return [...fallback]
  const filtered = [...new Set(value.filter(item => allowed.includes(item)))]
  return filtered.length ? filtered : [...fallback]
}

function normalizeRotationGroup(raw) {
  if (!raw || typeof raw !== 'object') return null
  const id = typeof raw.id === 'string' && GROUP_ID_RE.test(raw.id) ? raw.id : ''
  if (!id) return null
  return {
    id,
    name: typeof raw.name === 'string' && raw.name.trim() ? raw.name.trim().slice(0, 80) : '轮播列表',
    interval: Math.round(clampNum(raw.interval, ROTATION_INTERVAL_MIN, ROTATION_INTERVAL_MAX, DEFAULT_CONFIG.rotationMinutes)),
    order: ROTATION_ORDER_VALUES.includes(raw.order) ? raw.order : 'sequence',
    trigger: ROTATION_TRIGGER_VALUES.includes(raw.trigger) ? raw.trigger : 'interval',
    wallpaperIds: uniqueStrings(raw.wallpaperIds, 5000, 1024)
  }
}

function normalizeRotationGroups(value) {
  if (!Array.isArray(value)) return []
  return value.map(normalizeRotationGroup).filter(Boolean).slice(0, 100)
}

function sanitizeThemeColors(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const out = {}
  for (const role of THEME_COLOR_ROLE_IDS) {
    const pair = value[role]
    if (!pair || typeof pair !== 'object' || Array.isArray(pair)) continue
    const light = hex(pair.light)
    const dark = hex(pair.dark || pair.light)
    if (light && dark) out[role] = { light, dark }
  }
  return out
}

function sanitizeTypographyMap(value, allowed, min, max) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const out = {}
  for (const key of allowed) {
    if (value[key] === undefined || value[key] === '') continue
    out[key] = Math.round(clampNum(value[key], min, max, min))
  }
  return out
}

function sanitizeFamilyMap(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const out = {}
  for (const key of TYPE_ROLE_IDS) {
    const family = text(value[key], 200).trim()
    if (family) out[key] = family
  }
  return out
}

function sanitizeComponentFonts(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const out = {}
  const ids = new Set(COMPONENT_FONT_TARGETS.map(target => target.id))
  for (const [id, raw] of Object.entries(value)) {
    if (!ids.has(id) || !raw || typeof raw !== 'object' || Array.isArray(raw)) continue
    const entry = {}
    if (raw.size !== undefined && raw.size !== '') entry.size = Math.round(clampNum(raw.size, 8, 48, 14))
    if (raw.weight !== undefined && raw.weight !== '') entry.weight = Math.round(clampNum(raw.weight, 100, 900, 400))
    const family = text(raw.family, 200).trim()
    if (family) entry.family = family
    if (Object.keys(entry).length) out[id] = entry
  }
  return out
}

function sanitizeFontValues(raw) {
  const src = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {}
  return {
    themeColors: sanitizeThemeColors(src.themeColors),
    themeDarkSeparate: src.themeDarkSeparate === true,
    themeSize: sanitizeTypographyMap(src.themeSize, TYPE_ROLE_IDS, 8, 48),
    themeWeight: sanitizeTypographyMap(src.themeWeight, TYPE_ROLE_IDS, 100, 900),
    themeFamily: sanitizeFamilyMap(src.themeFamily),
    globalFamily: text(src.globalFamily, 200).trim(),
    componentFonts: sanitizeComponentFonts(src.componentFonts)
  }
}

function sanitizeFontSets(value) {
  if (!Array.isArray(value)) return []
  const out = []
  for (const raw of value) {
    if (!raw || typeof raw !== 'object') continue
    const id = typeof raw.id === 'string' && FONT_SET_ID_RE.test(raw.id) ? raw.id : ''
    if (!id || out.some(item => item.id === id)) continue
    out.push({
      id,
      name: typeof raw.name === 'string' && raw.name.trim() ? raw.name.trim().slice(0, 80) : '字体集',
      values: sanitizeFontValues(raw.values)
    })
    if (out.length >= 100) break
  }
  return out
}

function sanitizePluginDepths(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const out = {}
  for (const [slot, depth] of Object.entries(value)) {
    if (typeof slot !== 'string' || !slot || slot.length > 120) continue
    out[slot] = clampNum(depth, 0, 10, 1)
  }
  return out
}

function scalarValue(value) {
  return value === null || ['string', 'number', 'boolean'].includes(typeof value)
    ? (typeof value === 'string' ? value.slice(0, 2048) : value)
    : null
}

function sanitizeUserProps(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const out = {}
  for (const [id, props] of Object.entries(value)) {
    if (typeof id !== 'string' || !id || id.length > 1024 ||
        !props || typeof props !== 'object' || Array.isArray(props)) continue
    const clean = {}
    for (const [name, propValue] of Object.entries(props)) {
      if (typeof name !== 'string' || !name || name.length > 120) continue
      const scalar = scalarValue(propValue)
      if (scalar !== null) clean[name] = scalar
    }
    if (Object.keys(clean).length) out[id] = clean
  }
  return out
}

function sanitizeSelectionProperties(value) {
  if (!Array.isArray(value)) return []
  return value.filter(property => property && typeof property === 'object' &&
      typeof property.name === 'string' && typeof property.type === 'string')
    .slice(0, 100)
    .map(property => {
      const entry = {
        name: property.name.slice(0, 120),
        type: property.type.slice(0, 20),
        text: text(property.text, 240),
        order: Number(property.order) || 0,
        value: scalarValue(property.value),
        hidden: property.hidden === true
      }
      if (Array.isArray(property.options)) {
        entry.options = property.options.filter(option => option && typeof option === 'object')
          .slice(0, 200)
          .map(option => ({
            label: text(option.label, 160),
            value: scalarValue(option.value)
          }))
      }
      for (const key of ['min', 'max', 'step', 'precision']) {
        if (Number.isFinite(Number(property[key]))) entry[key] = Number(property[key])
      }
      if (typeof property.fileType === 'string') entry.fileType = property.fileType.slice(0, 20)
      return entry
    })
}

function normalizeConfig(value) {
  const raw = value && typeof value === 'object' && !Array.isArray(value) ? value : {}
  const schemaVersion = Math.max(7, Number(raw.schemaVersion) || 0)
  const rotationGroups = normalizeRotationGroups(raw.rotationGroups)
  const rotationGroupId = rotationGroups.some(group => group.id === raw.rotationGroupId)
    ? raw.rotationGroupId : ''
  const transition = raw.wallpaperTransition === 'slide' ? 'push'
    : TRANSITION_VALUES.includes(raw.wallpaperTransition) ? raw.wallpaperTransition : DEFAULT_CONFIG.wallpaperTransition
  const fontSets = sanitizeFontSets(raw.fontSets)
  const fontSetId = fontSets.some(item => item.id === raw.fontSetId) ? raw.fontSetId : ''
  const sourceType = WALLPAPER_TYPES.includes(raw.wallpaperType) ? raw.wallpaperType : DEFAULT_CONFIG.wallpaperType
  const fit = ['cover', 'contain', 'center', 'fill'].includes(raw.wallpaperFit)
    ? raw.wallpaperFit : DEFAULT_CONFIG.wallpaperFit
  const typeFilter = typeof raw.typeFilter === 'string'
    ? (raw.typeFilter === 'all' ? [...WALLPAPER_TYPES] : [raw.typeFilter].filter(item => WALLPAPER_TYPES.includes(item)))
    : enumArray(raw.typeFilter, WALLPAPER_TYPES, WALLPAPER_TYPES)
  const legacyBubbleDefault = (Number(raw.schemaVersion ?? 3) < 4) && raw.bubbleOpacity === 100

  return {
    schemaVersion,

    wallpaperEnabled: raw.wallpaperEnabled === true,
    wallpaperType: sourceType,
    wallpaperMode: raw.wallpaperMode === 'frame' ? 'frame' : 'live',
    wallpaperFit: fit,
    wallpaperSource: text(raw.wallpaperSource, 16384),
    wallpaperBlur: paramInRange('wallpaperBlur', raw.wallpaperBlur),
    maskOcclusion: paramInRange('maskOcclusion', raw.maskOcclusion),
    wallpaperOpacity: paramInRange('wallpaperOpacity', raw.wallpaperOpacity),
    backgroundBrightness: paramInRange('backgroundBrightness', raw.backgroundBrightness),
    backgroundContrast: paramInRange('backgroundContrast', raw.backgroundContrast),
    backgroundSaturate: paramInRange('backgroundSaturate', raw.backgroundSaturate),
    wallpaperFlip: raw.wallpaperFlip === true,
    wallpaperTransition: transition,
    wallpaperTransitionDir: TRANSITION_DIRECTIONS.includes(raw.wallpaperTransitionDir)
      ? raw.wallpaperTransitionDir : DEFAULT_CONFIG.wallpaperTransitionDir,
    wallpaperTransitionSpeed: TRANSITION_SPEEDS.includes(raw.wallpaperTransitionSpeed)
      ? raw.wallpaperTransitionSpeed : DEFAULT_CONFIG.wallpaperTransitionSpeed,

    pauseOnHidden: typeof raw.pauseOnHidden === 'boolean' ? raw.pauseOnHidden : DEFAULT_CONFIG.pauseOnHidden,
    pauseOnBlur: typeof raw.pauseOnBlur === 'boolean' ? raw.pauseOnBlur : DEFAULT_CONFIG.pauseOnBlur,
    pauseOnBattery: typeof raw.pauseOnBattery === 'boolean' ? raw.pauseOnBattery : DEFAULT_CONFIG.pauseOnBattery,
    wallpaperSound: typeof raw.wallpaperSound === 'boolean' ? raw.wallpaperSound : DEFAULT_CONFIG.wallpaperSound,
    wallpaperVolume: paramInRange('wallpaperVolume', raw.wallpaperVolume),
    videoPlaybackRate: clampNum(raw.videoPlaybackRate, 0.5, 2, DEFAULT_CONFIG.videoPlaybackRate),
    sceneLive: typeof raw.sceneLive === 'boolean' ? raw.sceneLive : DEFAULT_CONFIG.sceneLive,
    sceneLiveFps: [15, 30, 60].includes(Number(raw.sceneLiveFps)) ? Number(raw.sceneLiveFps) : DEFAULT_CONFIG.sceneLiveFps,
    sceneAutoQuality: typeof raw.sceneAutoQuality === 'boolean' ? raw.sceneAutoQuality : DEFAULT_CONFIG.sceneAutoQuality,
    sceneRenderDpr: [0, 1, 1.5, 2].includes(Number(raw.sceneRenderDpr)) ? Number(raw.sceneRenderDpr) : DEFAULT_CONFIG.sceneRenderDpr,
    sceneVideoTexScale: [0, 0.5, 1].includes(Number(raw.sceneVideoTexScale))
      ? Number(raw.sceneVideoTexScale) : DEFAULT_CONFIG.sceneVideoTexScale,
    liveBootDelay: clampNum(raw.liveBootDelay, 0, 30, DEFAULT_CONFIG.liveBootDelay),
    pictureSlideSeconds: Math.round(clampNum(raw.pictureSlideSeconds, 0, 3600, DEFAULT_CONFIG.pictureSlideSeconds)),

    hiddenWallpaperIds: uniqueStrings(raw.hiddenWallpaperIds),
    userProps: sanitizeUserProps(raw.userProps),
    contentRatingFilter: enumArray(raw.contentRatingFilter, CONTENT_RATINGS, ['everyone']),
    typeFilter,
    folderFilter: text(raw.folderFilter, 200) || 'all',
    orientationFilter: ORIENTATION_FILTERS.includes(raw.orientationFilter)
      ? raw.orientationFilter : DEFAULT_CONFIG.orientationFilter,
    pickerLayout: PICKER_LAYOUTS.includes(raw.pickerLayout) ? raw.pickerLayout : DEFAULT_CONFIG.pickerLayout,

    rotationEnabled: raw.rotationEnabled === true,
    rotationGroupId,
    rotationGroups,
    rotationSeeded: raw.rotationSeeded === true,
    rotationMinutes: Math.round(clampNum(raw.rotationMinutes, ROTATION_INTERVAL_MIN, ROTATION_INTERVAL_MAX,
      DEFAULT_CONFIG.rotationMinutes)),

    fontCustom: raw.fontCustom === true,
    fontSets,
    fontSetId,
    themeColors: sanitizeThemeColors(raw.themeColors),
    themeDarkSeparate: raw.themeDarkSeparate === true,
    themeSize: sanitizeTypographyMap(raw.themeSize, TYPE_ROLE_IDS, 8, 48),
    themeWeight: sanitizeTypographyMap(raw.themeWeight, TYPE_ROLE_IDS, 100, 900),
    themeFamily: sanitizeFamilyMap(raw.themeFamily),
    globalFamily: text(raw.globalFamily || raw.fontFamily, 200).trim(),
    componentFonts: sanitizeComponentFonts(raw.componentFonts),
    caretColor: hex(raw.caretColor),

    accent: hex(raw.accent, DEFAULT_CONFIG.accent),
    uiColorCustom: raw.uiColorCustom === true,
    uiColorSend: hex(raw.uiColorSend),
    uiColorLink: hex(raw.uiColorLink),
    uiColorFileIcon: hex(raw.uiColorFileIcon),
    uiColorTab: hex(raw.uiColorTab),
    uiColorDeepDiving: hex(raw.uiColorDeepDiving),
    themeFollow: raw.themeFollow === true,

    fxEnabled: raw.fxEnabled === true,
    fxClick: raw.fxClick !== false,
    fxClickStyle: FX_CLICK_STYLES.includes(raw.fxClickStyle) ? raw.fxClickStyle : DEFAULT_CONFIG.fxClickStyle,
    fxClickSize: paramInRange('fxClickSize', raw.fxClickSize),
    fxClickGlow: paramInRange('fxClickGlow', raw.fxClickGlow),
    fxTrail: raw.fxTrail !== false,
    fxTrailStyle: raw.fxTrailStyle === 'sparkle' ? 'dust'
      : FX_TRAIL_STYLES.includes(raw.fxTrailStyle) ? raw.fxTrailStyle : DEFAULT_CONFIG.fxTrailStyle,
    fxTrailLength: paramInRange('fxTrailLength', raw.fxTrailLength),
    fxTrailWidth: paramInRange('fxTrailWidth', raw.fxTrailWidth),
    fxTrailGlow: paramInRange('fxTrailGlow', raw.fxTrailGlow),
    fxOpacity: paramInRange('fxOpacity', raw.fxOpacity),
    fxBlend: FX_BLEND_VALUES.includes(raw.fxBlend) ? raw.fxBlend : DEFAULT_CONFIG.fxBlend,
    fxColorMode: FX_COLOR_MODES.includes(raw.fxColorMode) ? raw.fxColorMode : DEFAULT_CONFIG.fxColorMode,
    fxColor: hex(raw.fxColor, DEFAULT_CONFIG.fxColor),

    parallaxEnabled: raw.parallaxEnabled === true,
    parallaxBg: paramInRange('parallaxBg', raw.parallaxBg),
    parallaxUi: raw.parallaxUi === true,
    parallaxPlugin: raw.parallaxPlugin === true,
    parallaxUiChatDepth: paramInRange('parallaxUiChatDepth', raw.parallaxUiChatDepth),
    parallaxUiComposerDepth: paramInRange('parallaxUiComposerDepth', raw.parallaxUiComposerDepth),
    parallaxUiSidebarDepth: paramInRange('parallaxUiSidebarDepth', raw.parallaxUiSidebarDepth),
    parallaxUiBubbleDepth: paramInRange('parallaxUiBubbleDepth', raw.parallaxUiBubbleDepth),
    parallaxPluginDepths: sanitizePluginDepths(raw.parallaxPluginDepths),
    parallaxSmooth: paramInRange('parallaxSmooth', raw.parallaxSmooth),

    layerPositionX: paramInRange('layerPositionX', raw.layerPositionX),
    layerPositionY: paramInRange('layerPositionY', raw.layerPositionY),
    layerScale: paramInRange('layerScale', raw.layerScale),

    panelGlass: paramInRange('panelGlass', raw.panelGlass),
    bubbleOpacity: legacyBubbleDefault ? 55 : paramInRange('bubbleOpacity', raw.bubbleOpacity),
    composerFrost: paramInRange('composerFrost', raw.composerFrost),
    surfaceFrost: paramInRange('surfaceFrost', raw.surfaceFrost),
    glassSaturation: paramInRange('glassSaturation', raw.glassSaturation),
    glassBorder: paramInRange('glassBorder', raw.glassBorder),
    glassHighlight: raw.glassHighlight !== false,
    glassColor: {
      light: hex(raw.glassColor?.light, DEFAULT_CONFIG.glassColor.light),
      dark: hex(raw.glassColor?.dark, DEFAULT_CONFIG.glassColor.dark)
    },
    glassDarkSeparate: raw.glassDarkSeparate === true,
    glassFidelity: paramInRange('glassFidelity', raw.glassFidelity),
    chatGlassFidelity: paramInRange('chatGlassFidelity', raw.chatGlassFidelity),
    settingsWindowTransparency: paramInRange('settingsWindowTransparency', raw.settingsWindowTransparency),
    settingsWindowBlur: paramInRange('settingsWindowBlur', raw.settingsWindowBlur),
    sidebarGlass: raw.sidebarGlass !== false,
    sidebarFollowGlobal: raw.sidebarFollowGlobal !== false,
    sidebarBlur: paramInRange('sidebarBlur', raw.sidebarBlur),
    sidebarAlpha: paramInRange('sidebarAlpha', raw.sidebarAlpha),
    sidebarColor: hex(raw.sidebarColor, DEFAULT_CONFIG.sidebarColor),
    leftSidebarGlass: typeof raw.leftSidebarGlass === 'boolean'
      ? raw.leftSidebarGlass : DEFAULT_CONFIG.leftSidebarGlass,
    leftSidebarCornerRadius: ['native', '6', '12', '20'].includes(raw.leftSidebarCornerRadius)
      ? raw.leftSidebarCornerRadius : DEFAULT_CONFIG.leftSidebarCornerRadius,
    leftSidebarSquareTL: raw.leftSidebarSquareTL === true,
    leftSidebarSquareTR: raw.leftSidebarSquareTR === true,
    leftSidebarSquareBR: raw.leftSidebarSquareBR === true,
    leftSidebarSquareBL: raw.leftSidebarSquareBL === true,
    rightSidebarCornerRadius: ['native', '6', '12', '20'].includes(raw.rightSidebarCornerRadius)
      ? raw.rightSidebarCornerRadius : DEFAULT_CONFIG.rightSidebarCornerRadius,
    rightSidebarSquareTL: raw.rightSidebarSquareTL === true,
    rightSidebarSquareTR: raw.rightSidebarSquareTR === true,
    rightSidebarSquareBR: raw.rightSidebarSquareBR === true,
    rightSidebarSquareBL: raw.rightSidebarSquareBL === true,
    titlebarGlass: typeof raw.titlebarGlass === 'boolean' ? raw.titlebarGlass : DEFAULT_CONFIG.titlebarGlass,

    weRoots: Array.isArray(raw.weRoots)
      ? [...new Set(raw.weRoots.filter(root => typeof root === 'string' && /^[A-Za-z]:[\\/]/.test(root) && root.length <= 1024))]
        .slice(0, 8)
      : [],
    weSelection: raw.weSelection && typeof raw.weSelection === 'object' &&
      typeof raw.weSelection.id === 'string' && typeof raw.weSelection.title === 'string'
      ? {
          id: raw.weSelection.id.slice(0, 1024),
          title: raw.weSelection.title.slice(0, 120),
          kind: String(raw.weSelection.kind || '').slice(0, 20),
          source: String(raw.weSelection.source || '').slice(0, 20),
          staticFallback: Boolean(raw.weSelection.staticFallback),
          dir: typeof raw.weSelection.dir === 'string' ? raw.weSelection.dir.slice(0, 1024) : null,
          manifestPath: typeof raw.weSelection.manifestPath === 'string' ? raw.weSelection.manifestPath.slice(0, 1024) : null,
          framePath: typeof raw.weSelection.framePath === 'string' ? raw.weSelection.framePath.slice(0, 1024) : null,
          previewPath: typeof raw.weSelection.previewPath === 'string' ? raw.weSelection.previewPath.slice(0, 1024) : null,
          slides: uniqueStrings(raw.weSelection.slides, 500, 1024),
          properties: sanitizeSelectionProperties(raw.weSelection.properties),
          slideIntervalMs: Number.isFinite(Number(raw.weSelection.slideIntervalMs))
            ? Math.min(24 * 60 * 60 * 1000, Math.max(1000, Number(raw.weSelection.slideIntervalMs))) : null
        }
      : null
  }
}

const cacheableItem = item => item && typeof item === 'object' &&
  typeof item.id === 'string' && typeof item.title === 'string' &&
  typeof item.dir === 'string' && typeof item.mediaPath === 'string'
  ? {
      id: item.id.slice(0, 1024), title: item.title.slice(0, 120),
      kind: String(item.kind || '').slice(0, 20), source: String(item.source || '').slice(0, 20),
      contentrating: typeof item.contentrating === 'string' ? item.contentrating.slice(0, 20) : null,
      dir: item.dir.slice(0, 1024), mediaPath: item.mediaPath.slice(0, 1024),
      mediaType: String(item.mediaType || '').slice(0, 20),
      previewPath: typeof item.previewPath === 'string' ? item.previewPath.slice(0, 1024) : null,
      slides: Array.isArray(item.slides)
        ? item.slides.filter(path => typeof path === 'string' && path.length <= 1024).slice(0, 200) : [],
      slideIntervalMs: Number.isFinite(Number(item.slideIntervalMs)) ? Number(item.slideIntervalMs) : null,
      staticFallback: Boolean(item.staticFallback),
      workshopId: typeof item.workshopId === 'string' ? item.workshopId.slice(0, 40) : null,
      properties: Array.isArray(item.properties) ? item.properties.slice(0, 100).map(property => ({
        name: String(property?.name || '').slice(0, 120),
        type: String(property?.type || 'other').slice(0, 20),
        text: String(property?.text || '').slice(0, 240),
        order: Number(property?.order) || 0,
        value: property?.value ?? null,
        hidden: property?.hidden === true,
        options: Array.isArray(property?.options) ? property.options.slice(0, 200).map(option => ({
          label: String(option?.label || '').slice(0, 160),
          value: option?.value ?? null
        })) : undefined,
        min: Number.isFinite(Number(property?.min)) ? Number(property.min) : undefined,
        max: Number.isFinite(Number(property?.max)) ? Number(property.max) : undefined,
        step: Number.isFinite(Number(property?.step)) ? Number(property.step) : undefined,
        precision: Number.isFinite(Number(property?.precision)) ? Number(property.precision) : undefined,
        fileType: typeof property?.fileType === 'string' ? property.fileType.slice(0, 20) : undefined
      })) : []
    }
  : null

function createAppearanceStore(ctx) {
  const $config = atom(normalizeConfig(ctx.storage.get('config', {})))
  const $weItems = atom((Array.isArray(ctx.storage.get('weCache', [])) ? ctx.storage.get('weCache', []) : [])
    .map(cacheableItem).filter(Boolean).slice(0, 1000))
  let saveTimer = null
  let pendingSave = null

  function flushPersistence() {
    if (saveTimer !== null) clearTimeout(saveTimer)
    saveTimer = null
    if (pendingSave) {
      ctx.storage.set('config', pendingSave)
      pendingSave = null
    }
  }

  function saveConfig(updater, { deferPersistence = false } = {}) {
    const prev = $config.get()
    if (typeof updater !== 'function' && Object.entries(updater).every(([key, value]) => Object.is(prev[key], value))) {
      if (!deferPersistence) flushPersistence()
      return prev
    }
    const next = normalizeConfig(typeof updater === 'function' ? updater(prev) : { ...prev, ...updater })
    pendingSave = next
    if (deferPersistence) {
      if (saveTimer !== null) clearTimeout(saveTimer)
      saveTimer = setTimeout(flushPersistence, 200)
    } else flushPersistence()
    $config.set(next)
    return next
  }

  function setWeItems(items) {
    const next = (Array.isArray(items) ? items : []).map(cacheableItem).filter(Boolean).slice(0, 1000)
    $weItems.set(next)
    ctx.storage.set('weCache', next)
  }

  if (typeof window !== 'undefined') window.addEventListener('pagehide', flushPersistence)
  function destroy() {
    flushPersistence()
    if (typeof window !== 'undefined') window.removeEventListener('pagehide', flushPersistence)
  }
  return { $config, $weItems, setWeItems, saveConfig, flushPersistence, destroy }
}

// ─── Submodule: Appearance Controller ─────────────────────────
/** Owns wallpaper and glass effects; Hermes itself owns the app theme. */
class AppearanceController {
  constructor(store, backdrop, glass, extras = []) {
    this.store = store
    this.backdrop = backdrop
    this.glass = glass
    this.extras = extras
    this.pendingConfig = null
    this.configFrame = null
    this.backdrop.onVisibilityChange = () => this.sync()
  }

  sync() {
    const config = this.store.$config.get()
    const source = config.wallpaperSource
    const enabled = Boolean(source && config.wallpaperEnabled)
    const isDark = (typeof document !== 'undefined'
      ? document.documentElement?.dataset?.hermesMode : 'dark') !== 'light'
    const rotationGroup = activeRotationGroup(config)
    const videoEndRotation = config.rotationEnabled && rotationGroup?.trigger === 'videoEnd' &&
      rotationGroup.wallpaperIds.includes(config.weSelection?.id)
    const slideIntervalMs = config.pictureSlideSeconds > 0
      ? config.pictureSlideSeconds * 1000
      : config.weSelection?.slideIntervalMs || null
    const propertyDefaults = Object.fromEntries((config.weSelection?.properties || [])
      .filter(property => property && property.name && property.type !== 'text' &&
        property.type !== 'group' && property.value !== null && property.value !== undefined)
      .map(property => [property.name, property.value]))
    const effectiveUserProps = {
      ...propertyDefaults,
      ...(config.userProps?.[config.weSelection?.id] || {})
    }
    const showing = this.backdrop.update({
      enabled,
      type: config.wallpaperType,
      src: source,
      sceneDir: config.weSelection?.dir || (config.wallpaperType === 'scene' &&
        /^[a-zA-Z]:[\\/]/.test(source) && !/\.json$/i.test(source) ? source : null),
      sceneManifest: config.weSelection?.manifestPath || (config.wallpaperType === 'scene' &&
        /\.json$/i.test(source) ? source : null),
      sceneFrame: config.wallpaperType === 'scene' ? config.weSelection?.framePath : null,
      webPreview: config.wallpaperType === 'web' || config.wallpaperType === 'scene'
        ? config.weSelection?.previewPath : null,
      slides: config.wallpaperType === 'image' ? (config.weSelection?.slides || []) : [],
      slideIntervalMs,
      mode: config.wallpaperMode,
      fit: config.wallpaperFit,
      opacity: config.wallpaperOpacity,
      pauseOnHidden: config.pauseOnHidden,
      pauseOnBlur: config.pauseOnBlur,
      pauseOnBattery: config.pauseOnBattery,
      sound: config.wallpaperSound,
      volume: config.wallpaperVolume,
      playbackRate: config.videoPlaybackRate,
      sceneLive: config.sceneLive,
      sceneLiveFps: config.sceneLiveFps,
      sceneAutoQuality: config.sceneAutoQuality,
      sceneRenderDpr: config.sceneRenderDpr,
      sceneVideoTexScale: config.sceneVideoTexScale,
      transition: config.wallpaperTransition,
      transitionDir: config.wallpaperTransitionDir,
      transitionSpeed: config.wallpaperTransitionSpeed,
      blur: config.wallpaperBlur,
      occlusion: config.maskOcclusion,
      brightness: config.backgroundBrightness,
      contrast: config.backgroundContrast,
      saturate: config.backgroundSaturate,
      flip: config.wallpaperFlip,
      layerPositionX: config.layerPositionX,
      layerPositionY: config.layerPositionY,
      layerScale: config.layerScale,
      loop: !videoEndRotation,
      userProps: Object.keys(effectiveUserProps).length ? effectiveUserProps : null,
      isDark
    })
    this.glass.update({
      enabled: showing,
      glassTransparency: config.panelGlass,
      bubbleOpacity: config.bubbleOpacity,
      composerFrost: config.composerFrost,
      surfaceFrost: config.surfaceFrost,
      saturation: config.glassSaturation,
      border: config.glassBorder,
      highlight: config.glassHighlight,
      accent: config.accent,
      glassColor: config.glassColor,
      glassDarkSeparate: config.glassDarkSeparate,
      glassFidelity: config.glassFidelity,
      chatGlassFidelity: config.chatGlassFidelity,
      sidebarGlass: config.sidebarGlass,
      sidebarFollowGlobal: config.sidebarFollowGlobal,
      sidebarBlur: config.sidebarBlur,
      sidebarAlpha: config.sidebarAlpha,
      sidebarColor: config.sidebarColor,
      leftSidebarGlass: config.leftSidebarGlass,
      leftSidebarCornerRadius: config.leftSidebarCornerRadius,
      leftSidebarSquareTL: config.leftSidebarSquareTL,
      leftSidebarSquareTR: config.leftSidebarSquareTR,
      leftSidebarSquareBR: config.leftSidebarSquareBR,
      leftSidebarSquareBL: config.leftSidebarSquareBL,
      rightSidebarCornerRadius: config.rightSidebarCornerRadius,
      rightSidebarSquareTL: config.rightSidebarSquareTL,
      rightSidebarSquareTR: config.rightSidebarSquareTR,
      rightSidebarSquareBR: config.rightSidebarSquareBR,
      rightSidebarSquareBL: config.rightSidebarSquareBL,
      titlebarGlass: config.titlebarGlass,
      settingsWindowTransparency: config.settingsWindowTransparency,
      settingsWindowBlur: config.settingsWindowBlur,
      isDark
    })
    for (const extra of this.extras) extra.update(config)
  }

  changeConfig(change) {
    this.flushConfig()
    this.store.saveConfig(change)
    this.sync()
  }

  scheduleConfig(change) {
    this.pendingConfig = { ...this.pendingConfig, ...change }
    if (this.configFrame !== null) return
    this.configFrame = requestAnimationFrame(() => {
      this.configFrame = null
      const pending = this.pendingConfig
      this.pendingConfig = null
      if (pending) {
        this.store.saveConfig(pending, { deferPersistence: true })
        this.sync()
      }
    })
  }

  flushConfig() {
    if (this.configFrame !== null) cancelAnimationFrame(this.configFrame)
    this.configFrame = null
    const pending = this.pendingConfig
    this.pendingConfig = null
    if (pending) {
      this.store.saveConfig(pending)
      this.sync()
    }
    this.store.flushPersistence?.()
  }

  destroy() {
    this.flushConfig()
    this.backdrop.destroy()
    this.glass.destroy()
    for (const extra of this.extras) extra.destroy()
  }
}

const FONT_STYLE_ID = 'hermes-skins-font-css'
const SURFACES = ':is([data-chat-surface], [data-slot="sidebar"], [data-slot="composer-root"], [data-panel-header], [data-slot="statusbar"])'
const COMPONENT_SELECTORS = {
  markdown: '[data-chat-surface]',
  codeBlock: '[data-chat-surface] :is(pre, code, kbd)',
  terminal: ':is([data-terminal], [data-persistent-terminal])',
  table: '[data-chat-surface] :is(table, th, td)'
}
const ROLE_SELECTORS = {
  'markdown-h1': '[data-chat-surface] h1',
  'markdown-h2': '[data-chat-surface] h2',
  'markdown-h3': '[data-chat-surface] h3',
  'markdown-h4': '[data-chat-surface] h4',
  'markdown-base': '[data-chat-surface]',
  'markdown-small': '[data-chat-surface] :is(small, [data-slot="caption"])',
  'markdown-code': '[data-chat-surface] :not(pre) > code',
  'markdown-code-block': '[data-chat-surface] :is(pre, pre code)',
  'markdown-table': '[data-chat-surface] :is(table, th, td)',
  'markdown-table-head': '[data-chat-surface] th',
  'xs-13': '[data-panel-header], [data-slot="statusbar"]',
  'xxs-12': '[data-chat-surface] :is(.text-xs, small)'
}
const TEXT_TOKEN_ROLES = {
  primary: '--ui-text-primary',
  secondary: '--ui-text-secondary',
  tertiary: '--ui-text-tertiary',
  caption: '--ui-text-quaternary',
  dimmed: '--ui-text-quaternary'
}

const safeFamily = value => typeof value === 'string'
  ? value.replace(/[;{}<>"'\\\u0000-\u001f\u007f]/g, '').trim().slice(0, 200)
  : ''

function fontFamilyStack(value) {
  const family = safeFamily(value)
  if (!family || family === 'inherit') return 'inherit'
  if (family.includes(',')) return family
  return `"${family}", var(--dt-font-sans, sans-serif)`
}

function roleCss(config) {
  const blocks = []
  for (const [role, selector] of Object.entries(ROLE_SELECTORS)) {
    const size = Number(config.themeSize?.[role]) || 0
    const weight = Number(config.themeWeight?.[role]) || 0
    const family = safeFamily(config.themeFamily?.[role])
    const declarations = []
    if (size >= 8 && size <= 48) declarations.push(`font-size:${size}px !important`)
    if (weight >= 100 && weight <= 900) declarations.push(`font-weight:${weight} !important`)
    if (family) declarations.push(`font-family:${fontFamilyStack(family)} !important`)
    if (declarations.length) blocks.push(`${selector}{${declarations.join(';')}}`)
  }
  return blocks.join('\n')
}

function componentCss(config) {
  const blocks = []
  for (const [id, selector] of Object.entries(COMPONENT_SELECTORS)) {
    const value = config.componentFonts?.[id]
    if (!value) continue
    const declarations = []
    if (Number(value.size) >= 8) declarations.push(`font-size:${Math.round(Number(value.size))}px !important`)
    if (Number(value.weight) >= 100) declarations.push(`font-weight:${Math.round(Number(value.weight))} !important`)
    const family = safeFamily(value.family)
    if (family) declarations.push(`font-family:${fontFamilyStack(family)} !important`)
    if (declarations.length) blocks.push(`${selector}{${declarations.join(';')}}`)
  }
  return blocks.join('\n')
}

function colorCss(config) {
  const blocks = []
  for (const mode of ['light', 'dark']) {
    const declarations = []
    for (const [role, token] of Object.entries(TEXT_TOKEN_ROLES)) {
      const pair = config.themeColors?.[role]
      const color = pair?.[config.themeDarkSeparate ? mode : 'light'] || pair?.dark || pair?.light
      if (/^#[0-9a-f]{6}$/i.test(color || '')) declarations.push(`${token}:${color}`)
    }
    if (declarations.length) {
      blocks.push(`:root[data-hermes-skins-text-colors="true"][data-hermes-mode="${mode}"]{${declarations.join(';')}}`)
    }
  }
  return blocks.join('\n')
}

function uiColorCss(config) {
  if (!config.uiColorCustom) return ''
  const accent = /^#[0-9a-f]{6}$/i.test(config.accent || '') ? config.accent : '#4f8cff'
  const send = /^#[0-9a-f]{6}$/i.test(config.uiColorSend || '') ? config.uiColorSend : accent
  const link = /^#[0-9a-f]{6}$/i.test(config.uiColorLink || '') ? config.uiColorLink : accent
  const file = /^#[0-9a-f]{6}$/i.test(config.uiColorFileIcon || '') ? config.uiColorFileIcon : link
  const tab = /^#[0-9a-f]{6}$/i.test(config.uiColorTab || '') ? config.uiColorTab : accent
  const deep = /^#[0-9a-f]{6}$/i.test(config.uiColorDeepDiving || '') ? config.uiColorDeepDiving : accent
  return `
    :root[data-hermes-skins-ui-colors="true"] {
      --we-accent:${accent};
      --ui-accent:${accent};
      --ui-accent-secondary:${accent};
      --theme-primary:${accent};
      --theme-midground:${accent};
      --ui-blue:${accent};
    }
    :root[data-hermes-skins-ui-colors="true"] [data-slot="composer-root"] button[type="submit"],
    :root[data-hermes-skins-ui-colors="true"] [data-slot="composer-root"] [data-primary] {
      background-color:${send} !important;
    }
    :root[data-hermes-skins-ui-colors="true"] [data-chat-surface] a,
    :root[data-hermes-skins-ui-colors="true"] [data-chat-surface] .text-primary {
      color:${link} !important;
    }
    :root[data-hermes-skins-ui-colors="true"] [data-presented-file] svg {
      color:${file} !important;
    }
    :root[data-hermes-skins-ui-colors="true"] [data-panel-header] [aria-selected="true"] {
      color:${tab} !important;
      border-color:${tab} !important;
    }
    :root[data-hermes-skins-ui-colors="true"] [data-deep-diving] {
      color:${deep} !important;
    }
  `
}

/** Applies custom typography without touching Hermes' theme registry. */
class FontController {
  constructor({ setAccentOverride = null } = {}) {
    this.styleEl = null
    this.lastKey = null
    this.setAccentOverride = setAccentOverride
    this.lastAccent = null
  }

  update(config) {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    const fontOn = config.fontCustom === true
    const colorsOn = fontOn && Object.keys(config.themeColors || {}).length > 0
    const uiColorsOn = config.uiColorCustom === true
    const caret = /^#[0-9a-f]{6}$/i.test(config.caretColor || '') ? config.caretColor : ''
    const globalFamily = safeFamily(config.globalFamily)
    const key = JSON.stringify({
      fontOn, colorsOn, uiColorsOn, caret, globalFamily,
      themeSize: config.themeSize, themeWeight: config.themeWeight,
      themeFamily: config.themeFamily, componentFonts: config.componentFonts,
      themeColors: config.themeColors, themeDarkSeparate: config.themeDarkSeparate,
      accent: config.accent, send: config.uiColorSend, link: config.uiColorLink,
      file: config.uiColorFileIcon, tab: config.uiColorTab, deep: config.uiColorDeepDiving
    })
    if (key === this.lastKey && this.styleEl?.isConnected) return
    this.lastKey = key

    if (fontOn) root.setAttribute('data-hermes-skins-font', 'true')
    else root.removeAttribute('data-hermes-skins-font')
    if (colorsOn) root.setAttribute('data-hermes-skins-text-colors', 'true')
    else root.removeAttribute('data-hermes-skins-text-colors')
    if (uiColorsOn) root.setAttribute('data-hermes-skins-ui-colors', 'true')
    else root.removeAttribute('data-hermes-skins-ui-colors')

    if (fontOn && globalFamily) root.style.setProperty('--hs-font-family', fontFamilyStack(globalFamily))
    else root.style.removeProperty('--hs-font-family')
    if (caret) root.style.setProperty('--hs-caret', caret)
    else root.style.removeProperty('--hs-caret')

    const baseSize = Number(config.themeSize?.['markdown-base']) || 0
    const smallSize = Number(config.themeSize?.['markdown-small']) || 0
    const codeSize = Number(config.themeSize?.['markdown-code-block']) || 0
    const tokenSizes = {
      '--conversation-text-base-size': baseSize,
      '--conversation-text-font-size': baseSize,
      '--conversation-caption-base-size': smallSize,
      '--conversation-caption-font-size': smallSize,
      '--conversation-tool-base-size': codeSize,
      '--conversation-tool-font-size': codeSize
    }
    for (const [name, value] of Object.entries(tokenSizes)) {
      if (fontOn && value >= 8) root.style.setProperty(name, `${value}px`)
      else root.style.removeProperty(name)
    }

    if (uiColorsOn) {
      const accent = /^#[0-9a-f]{6}$/i.test(config.accent || '') ? config.accent : null
      if (accent && accent !== this.lastAccent) {
        try { this.setAccentOverride?.(accent) } catch { /* SDK may be unavailable in isolated tests. */ }
        this.lastAccent = accent
      }
    } else if (this.lastAccent !== null) {
      try { this.setAccentOverride?.(null) } catch { /* ignored */ }
      this.lastAccent = null
    }

    const css = [
      fontOn ? `
        :root[data-hermes-skins-font="true"] ${SURFACES} {
          font-family:var(--hs-font-family, inherit) !important;
        }
        :root[data-hermes-skins-font="true"] [data-chat-surface] :is(input, textarea, [contenteditable="true"]),
        :root[data-hermes-skins-font="true"] [data-slot="composer-root"] :is(input, textarea, [contenteditable="true"]) {
          caret-color:var(--hs-caret, auto) !important;
        }
        ${roleCss(config)}
        ${componentCss(config)}
      ` : '',
      caret ? `
        :root :is(input, textarea, [contenteditable="true"]) {
          caret-color:${caret} !important;
        }
      ` : '',
      colorCss(config),
      uiColorCss(config)
    ].filter(Boolean).join('\n')

    if (!css.trim()) {
      this.styleEl?.remove()
      this.styleEl = null
      return
    }
    if (!this.styleEl || !this.styleEl.isConnected) {
      this.styleEl = document.getElementById(FONT_STYLE_ID) || document.createElement('style')
      this.styleEl.id = FONT_STYLE_ID
      this.styleEl.dataset.plugin = 'hermes-skins'
      if (!this.styleEl.isConnected) document.head.appendChild(this.styleEl)
    }
    this.styleEl.textContent = css
  }

  destroy() {
    this.update({ fontCustom: false, uiColorCustom: false, caretColor: '' })
    try { this.setAccentOverride?.(null) } catch { /* ignored */ }
  }
}

const HOST_ID = 'hermes-skins-fx-layer'
const CANVAS_ID = 'hermes-skins-fx'
const DPR_MAX = 2
const CLICK_LIFE_MS = 900
const TRAIL_STEP_PX = 3
const DUST_STEP_PX = 10
const SPARK_COUNT = 12
const POINT_MAX = 96
const CLICK_MAX = 24
const PERF_LEVELS = 3
const TRAIL_BANDS = [2, 4, 8]
const MIN_GAP = [33, 0, 0]
const SLOW_FRAME_MS = 24
const DOWN_RUN = 6
const UP_RUN = 90
const UI_SELECTOR = 'button, a, input, select, textarea, label, [role="button"], [contenteditable="true"], [role="dialog"], [role="menu"], [role="listbox"]'
const FALLBACK_COLOR = '#4f8cff'

const fxClamp = (value, min, max, fallback) => {
  const number = Number(value)
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback
}

/** Pointer click/trail effects drawn between the wallpaper and the app shell. */
class FxOverlay {
  constructor() {
    this.host = null
    this.canvas = null
    this.ctx = null
    this.config = null
    this.points = []
    this.clicks = []
    this.frame = null
    this.bound = false
    this.hue = 0
    this.seed = 0
    this.accent = ''
    this.perfLevel = PERF_LEVELS - 1
    this.slowRun = 0
    this.fastRun = 0
    this.lastFrameAt = 0
    this.lastDrawAt = 0
    this.lastWidth = 0
    this.lastHeight = 0
    this.onMove = event => {
      if (!this.config?.fxEnabled || !this.config.fxTrail) return
      const points = typeof event.getCoalescedEvents === 'function'
        ? (event.getCoalescedEvents() || []) : []
      const samples = points.length ? points : [event]
      for (const sample of samples) this.pushTrail(sample.clientX, sample.clientY)
      this.kick()
    }
    this.onDown = event => {
      if (!this.config?.fxEnabled || !this.config.fxClick) return
      const target = event.target
      try {
        if (target?.closest?.(UI_SELECTOR)) return
      } catch { /* Prefer drawing if the target cannot be inspected. */ }
      this.seed += 1
      this.clicks.push({
        x: event.clientX, y: event.clientY, t0: performance.now(),
        seed: this.seed, hue: this.nextHue()
      })
      if (this.clicks.length > CLICK_MAX) this.clicks.splice(0, this.clicks.length - CLICK_MAX)
      this.kick()
    }
    this.onResize = () => this.kick()
    this.onVisibility = () => {
      if (document.hidden) this.cancelFrame()
      else this.kick()
    }
  }

  nextHue() {
    this.hue = (this.hue + 24) % 360
    return this.hue
  }

  settings() {
    const config = this.config || {}
    return {
      on: config.fxEnabled === true,
      click: config.fxClick !== false,
      clickStyle: config.fxClickStyle === 'spark' || config.fxClickStyle === 'both'
        ? config.fxClickStyle : 'ripple',
      size: fxClamp(config.fxClickSize, 40, 400, 140),
      clickGlow: fxClamp(config.fxClickGlow, 0, 100, 60),
      trail: config.fxTrail !== false,
      trailStyle: config.fxTrailStyle === 'dust' ? 'dust' : 'comet',
      lifeMs: fxClamp(config.fxTrailLength, 80, 2000, 420),
      width: fxClamp(config.fxTrailWidth, 1, 12, 3),
      trailGlow: fxClamp(config.fxTrailGlow, 0, 100, 60),
      opacity: fxClamp(config.fxOpacity, 10, 100, 85) / 100,
      blend: ['screen', 'normal', 'overlay', 'multiply', 'lighten'].includes(config.fxBlend)
        ? config.fxBlend : 'screen',
      colorMode: ['accent', 'rainbow', 'custom'].includes(config.fxColorMode)
        ? config.fxColorMode : 'accent',
      color: /^#[0-9a-f]{6}$/i.test(config.fxColor || '') ? config.fxColor : FALLBACK_COLOR
    }
  }

  ensureHost() {
    if (this.host?.isConnected || typeof document === 'undefined' || !document.body) return
    this.host = document.createElement('div')
    this.host.id = HOST_ID
    this.host.setAttribute('aria-hidden', 'true')
    this.host.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:1;'
    this.canvas = document.createElement('canvas')
    this.canvas.id = CANVAS_ID
    this.canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;'
    this.host.appendChild(this.canvas)
    const shell = document.querySelector('[data-contrib-shell]')
    if (shell?.parentNode === document.body) document.body.insertBefore(this.host, shell)
    else document.body.appendChild(this.host)
    this.ctx = this.canvas.getContext('2d')
    this.bind()
  }

  removeHost() {
    this.host?.remove()
    this.host = null
    this.canvas = null
    this.ctx = null
    this.lastWidth = 0
    this.lastHeight = 0
  }

  bind() {
    if (this.bound || typeof document === 'undefined') return
    document.addEventListener('pointermove', this.onMove, { passive: true })
    document.addEventListener('pointerdown', this.onDown, { passive: true })
    document.addEventListener('visibilitychange', this.onVisibility, { passive: true })
    window.addEventListener('resize', this.onResize, { passive: true })
    this.bound = true
  }

  unbind() {
    if (!this.bound) return
    document.removeEventListener('pointermove', this.onMove)
    document.removeEventListener('pointerdown', this.onDown)
    document.removeEventListener('visibilitychange', this.onVisibility)
    window.removeEventListener('resize', this.onResize)
    this.bound = false
  }

  pushTrail(x, y) {
    const last = this.points.at(-1)
    if (last && Math.hypot(x - last.x, y - last.y) < TRAIL_STEP_PX) return
    this.points.push({ x, y, t: performance.now(), hue: this.nextHue() })
    if (this.points.length > POINT_MAX) this.points.splice(0, this.points.length - POINT_MAX)
  }

  update(config) {
    this.config = config
    if (typeof document === 'undefined') return
    const settings = this.settings()
    if (!settings.on || (!settings.click && !settings.trail)) {
      this.stop()
      return
    }
    this.accent = ''
    this.ensureHost()
    this.start()
  }

  accentColor() {
    if (this.accent) return this.accent
    try {
      const styles = getComputedStyle(document.documentElement)
      this.accent = styles.getPropertyValue('--we-accent').trim() ||
        styles.getPropertyValue('--dt-primary').trim() ||
        styles.getPropertyValue('--primary').trim() || FALLBACK_COLOR
    } catch {
      this.accent = FALLBACK_COLOR
    }
    return this.accent
  }

  effectColor(settings, hue, now) {
    if (settings.colorMode === 'custom') return settings.color
    if (settings.colorMode === 'rainbow') {
      const current = (((hue + now / 12) % 360) + 360) % 360
      return `hsl(${current.toFixed(1)}, 92%, 66%)`
    }
    return this.accentColor()
  }

  kick() {
    if (this.frame !== null || !this.host || document.hidden) return
    this.frame = requestAnimationFrame(now => this.draw(now))
  }

  cancelFrame() {
    if (this.frame !== null) cancelAnimationFrame(this.frame)
    this.frame = null
  }

  start() {
    this.kick()
  }

  stop() {
    this.cancelFrame()
    this.unbind()
    this.removeHost()
    this.points = []
    this.clicks = []
    this.accent = ''
    this.perfLevel = PERF_LEVELS - 1
    this.slowRun = 0
    this.fastRun = 0
    this.lastFrameAt = 0
    this.lastDrawAt = 0
  }

  resize() {
    const width = Math.max(1, Math.round(window.innerWidth || 1))
    const height = Math.max(1, Math.round(window.innerHeight || 1))
    const dpr = Math.min(DPR_MAX, window.devicePixelRatio || 1)
    const pixelWidth = Math.round(width * dpr)
    const pixelHeight = Math.round(height * dpr)
    if (this.canvas.width !== pixelWidth || this.canvas.height !== pixelHeight) {
      this.canvas.width = pixelWidth
      this.canvas.height = pixelHeight
      this.canvas.style.width = `${width}px`
      this.canvas.style.height = `${height}px`
    }
    this.ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)
    this.lastWidth = width
    this.lastHeight = height
  }

  setHostStyle(property, value) {
    if (this.host && this.host.style.getPropertyValue(property) !== value) {
      this.host.style.setProperty(property, value)
    }
  }

  updatePerformance(delta) {
    if (!(delta > 0)) return
    if (delta > SLOW_FRAME_MS) {
      this.slowRun += 1
      this.fastRun = 0
      if (this.slowRun >= DOWN_RUN && this.perfLevel > 0) {
        this.perfLevel -= 1
        this.slowRun = 0
      }
    } else {
      this.fastRun += 1
      this.slowRun = 0
      if (this.fastRun >= UP_RUN && this.perfLevel < PERF_LEVELS - 1) {
        this.perfLevel += 1
        this.fastRun = 0
      }
    }
  }

  sparkAngle(seed, index) {
    const noise = ((seed * 9301 + index * 49297) % 233280) / 233280
    return (index / SPARK_COUNT) * Math.PI * 2 + noise * 0.6
  }

  drawClicks(ctx, now, settings) {
    if (!settings.click) return
    ctx.lineCap = 'round'
    for (const click of this.clicks) {
      const progress = Math.min(1, Math.max(0, (now - click.t0) / CLICK_LIFE_MS))
      if (progress >= 1) continue
      const color = this.effectColor(settings, click.hue, now)
      if (settings.clickStyle !== 'spark') {
        for (let ring = 0; ring < 2; ring += 1) {
          const q = Math.min(1, progress - ring * 0.18)
          if (q <= 0) continue
          const fade = (1 - q) * (1 - q)
          ctx.globalAlpha = 0.9 * fade
          ctx.strokeStyle = color
          ctx.shadowColor = color
          ctx.shadowBlur = settings.clickGlow * 0.4 * fade
          ctx.lineWidth = Math.max(0.6, 3 * (1 - q))
          ctx.beginPath()
          const radius = Math.max(0.5, settings.size * (1 - Math.pow(1 - q, 3)) * (ring ? 0.78 : 1))
          ctx.arc(click.x, click.y, radius, 0, Math.PI * 2)
          ctx.stroke()
        }
      }
      if (settings.clickStyle !== 'ripple') {
        const ease = 1 - Math.pow(1 - progress, 3)
        const fade = (1 - progress) * (1 - progress)
        ctx.strokeStyle = color
        ctx.shadowColor = color
        ctx.shadowBlur = settings.clickGlow * 0.35 * fade
        ctx.lineWidth = Math.max(0.6, settings.width * 0.7 * (1 - progress))
        ctx.globalAlpha = 0.9 * fade
        ctx.beginPath()
        for (let index = 0; index < SPARK_COUNT; index += 1) {
          const angle = this.sparkAngle(click.seed, index)
          const reach = settings.size *
            (0.45 + 0.55 * (((click.seed * 31 + index * 37) % 100) / 100)) * ease
          const cos = Math.cos(angle)
          const sin = Math.sin(angle)
          ctx.moveTo(click.x + cos * reach * 0.7, click.y + sin * reach * 0.7)
          ctx.lineTo(click.x + cos * reach, click.y + sin * reach)
        }
        ctx.stroke()
        const flash = Math.max(0, 1 - progress * 3)
        if (flash > 0) {
          ctx.globalAlpha = 0.75 * flash
          ctx.fillStyle = '#ffffff'
          ctx.shadowColor = color
          ctx.shadowBlur = settings.clickGlow * 0.5 * flash
          ctx.beginPath()
          ctx.arc(click.x, click.y, Math.max(0.5, settings.width * 1.6 * flash + 1), 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }
  }

  drawTrail(ctx, now, settings) {
    if (!settings.trail || this.points.length < 2) return
    const life = settings.lifeMs
    const bands = TRAIL_BANDS[this.perfLevel] || TRAIL_BANDS[0]
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    if (settings.trailStyle === 'dust') {
      let distance = 0
      const buckets = []
      for (let index = 1; index < this.points.length; index += 1) {
        const point = this.points[index]
        const previous = this.points[index - 1]
        distance += Math.abs(point.x - previous.x) + Math.abs(point.y - previous.y)
        if (distance < DUST_STEP_PX) continue
        distance = 0
        const fade = 1 - (now - point.t) / life
        if (fade <= 0) continue
        const band = Math.min(bands - 1, Math.max(0, Math.floor((1 - fade) * bands)))
        if (!buckets[band]) buckets[band] = { points: [], fade: 0, count: 0 }
        buckets[band].points.push(point)
        buckets[band].fade += fade
        buckets[band].count += 1
      }
      for (const bucket of buckets) {
        if (!bucket) continue
        const fade = bucket.fade / bucket.count
        ctx.globalAlpha = Math.max(0, Math.min(1, fade * fade * 0.9))
        ctx.fillStyle = this.effectColor(settings, bucket.points[0].hue, now)
        ctx.shadowColor = ctx.fillStyle
        ctx.shadowBlur = settings.trailGlow * fade * 0.4
        const radius = Math.max(0.6, settings.width * (0.45 + fade * 0.75))
        ctx.beginPath()
        for (const point of bucket.points) {
          ctx.moveTo(point.x + radius, point.y)
          ctx.arc(point.x, point.y, radius, 0, Math.PI * 2)
        }
        ctx.fill()
      }
      return
    }
    const buckets = []
    for (let index = 1; index < this.points.length; index += 1) {
      const a = this.points[index - 1]
      const b = this.points[index]
      const fade = 1 - (now - b.t) / life
      if (fade <= 0) continue
      const band = Math.min(bands - 1, Math.max(0, Math.floor((1 - fade) * bands)))
      if (!buckets[band]) buckets[band] = { segments: [], fade: 0, count: 0, hue: b.hue }
      buckets[band].segments.push(a, b)
      buckets[band].fade += fade
      buckets[band].count += 1
    }
    for (const bucket of buckets) {
      if (!bucket) continue
      const fade = bucket.fade / bucket.count
      ctx.globalAlpha = Math.max(0, Math.min(1, fade * fade * 0.9))
      ctx.strokeStyle = this.effectColor(settings, bucket.hue, now)
      ctx.shadowColor = ctx.strokeStyle
      ctx.shadowBlur = settings.trailGlow * fade * 0.35
      ctx.lineWidth = Math.max(0.4, settings.width * (0.25 + fade * 0.75))
      ctx.beginPath()
      for (let index = 0; index < bucket.segments.length; index += 2) {
        ctx.moveTo(bucket.segments[index].x, bucket.segments[index].y)
        ctx.lineTo(bucket.segments[index + 1].x, bucket.segments[index + 1].y)
      }
      ctx.stroke()
    }
  }

  draw(now) {
    this.frame = null
    const settings = this.settings()
    if (!settings.on || !this.host || !this.canvas) return
    if (this.lastFrameAt) this.updatePerformance(now - this.lastFrameAt)
    this.lastFrameAt = now
    const gap = MIN_GAP[this.perfLevel] || 0
    if (gap > 0 && this.lastDrawAt && now - this.lastDrawAt < gap) {
      this.kick()
      return
    }
    this.lastDrawAt = now
    this.points = this.points.filter(point => now - point.t <= settings.lifeMs)
    this.clicks = this.clicks.filter(click => now - click.t0 <= CLICK_LIFE_MS)
    this.resize()
    this.setHostStyle('mix-blend-mode', settings.blend)
    this.setHostStyle('opacity', String(settings.opacity))
    const ctx = this.ctx
    if (!ctx) return
    ctx.clearRect(0, 0, this.lastWidth, this.lastHeight)
    const active = this.points.length > 1 || this.clicks.length > 0
    if (active) {
      ctx.globalCompositeOperation = 'lighter'
      this.drawTrail(ctx, now, settings)
      this.drawClicks(ctx, now, settings)
      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = 1
      ctx.shadowBlur = 0
      this.kick()
    }
  }

  destroy() {
    this.stop()
    this.config = null
  }
}

const FRAME_MS = 1000 / 60
const DT_MAX = 64
const SETTLE_VISIBLE_PX = 0.25
const IDLE_MS = 180
const IDLE_VISIBLE_PX = 1
const TARGETS_MS = 500
const BUBBLE_MAX = 24
const PLUGIN_DEFAULT_DEPTH = 1
const UI_SKIP_SCOPE = '[data-slot="settings.section"], [data-slot="plugins.bundle.config"]'
const UI_SKIP_PREFIX = ['settings.', 'plugins.', 'shell.']
const UI_SKIP = ['root', 'main', 'rightbar', 'conversation.view', 'sidebar', 'main.conversation']
const UI_GROUPS = {
  chat: '[data-chat-surface], [data-slot="conversation.view"]',
  composer: '[data-slot="composer-root"], [data-slot="composer-surface"]',
  sidebar: '[data-slot="sidebar"]',
  bubble: '[data-chat-flow-kind="user"], [data-chat-flow-kind="steering"], [data-message-role="user"]'
}

const parallaxClamp = (value, min, max, fallback) => {
  const number = Number(value)
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback
}

function hasFixedDescendant(element) {
  if (!element || typeof element.querySelectorAll !== 'function') return false
  let count = 0
  try {
    for (const node of element.querySelectorAll('*')) {
      if (++count > 400) break
      if (getComputedStyle(node).position === 'fixed') return true
    }
  } catch { /* Cross-origin or detached nodes are not movable. */ }
  return false
}

function writeTranslate(element, x, y, independent = true) {
  if (!element?.style) return false
  const value = `${x.toFixed(2)}px ${y.toFixed(2)}px`
  if (element.dataset.hsParallaxValue === value) return false
  element.dataset.hsParallaxValue = value
  if (independent && 'translate' in element.style) {
    element.style.translate = value
  } else {
    element.style.transform = `translate3d(${value}, 0)`
  }
  return true
}

function clearTranslate(element) {
  if (!element?.style) return
  if (element.style.translate) element.style.removeProperty('translate')
  if (element.dataset.hsParallaxTransform === '1') element.style.removeProperty('transform')
  delete element.dataset.hsParallaxValue
  delete element.dataset.hsParallaxTransform
  if (element.style.willChange === 'translate') element.style.removeProperty('will-change')
}

/** Pointer-driven background and optional surface parallax. */
class ParallaxController {
  constructor() {
    this.config = null
    this.x = 0
    this.y = 0
    this.targetX = 0
    this.targetY = 0
    this.frame = null
    this.bound = false
    this.seen = false
    this.lastMs = 0
    this.moveMs = 0
    this.viewportWidth = 0
    this.viewportHeight = 0
    this.dpr = 1
    this.backgroundTargets = []
    this.uiTargets = []
    this.pluginTargets = []
    this.targetsAt = 0
    this.onMove = event => {
      if (!this.config?.parallaxEnabled) return
      this.x = event.clientX
      this.y = event.clientY
      this.seen = true
      this.moveMs = performance.now()
      this.kick()
    }
    this.onLeave = () => {
      this.targetX = 0
      this.targetY = 0
      this.kick()
    }
    this.onResize = () => {
      this.readViewport()
      this.refreshTargets(true)
      this.kick()
    }
    this.onVisibility = () => {
      if (document.hidden) this.cancelFrame()
      else this.kick()
    }
  }

  readViewport() {
    this.viewportWidth = Math.max(1, window.innerWidth || 1)
    this.viewportHeight = Math.max(1, window.innerHeight || 1)
    this.dpr = Math.max(1, window.devicePixelRatio || 1)
  }

  bind() {
    if (this.bound) return
    document.addEventListener('pointermove', this.onMove, { passive: true })
    document.addEventListener('pointerleave', this.onLeave, { passive: true })
    document.addEventListener('visibilitychange', this.onVisibility, { passive: true })
    window.addEventListener('blur', this.onLeave)
    window.addEventListener('resize', this.onResize, { passive: true })
    this.bound = true
  }

  unbind() {
    if (!this.bound) return
    document.removeEventListener('pointermove', this.onMove)
    document.removeEventListener('pointerleave', this.onLeave)
    document.removeEventListener('visibilitychange', this.onVisibility)
    window.removeEventListener('blur', this.onLeave)
    window.removeEventListener('resize', this.onResize)
    this.bound = false
  }

  refreshTargets(force = false) {
    const now = performance.now()
    if (!force && this.targetsAt && now - this.targetsAt < TARGETS_MS) return
    this.targetsAt = now
    this.backgroundTargets = [...document.querySelectorAll('.hs-backdrop-surface')]
    const config = this.config || {}
    const uiTargets = []
    if (config.parallaxUi) {
      for (const [kind, selector] of Object.entries(UI_GROUPS)) {
        const elements = [...document.querySelectorAll(selector)]
        const limited = kind === 'bubble' ? elements.slice(-BUBBLE_MAX) : elements
        for (const element of limited) {
          if (uiTargets.some(record => record.element === element)) continue
          uiTargets.push({
            element,
            kind,
            depth: kind === 'chat' ? config.parallaxUiChatDepth
              : kind === 'composer' ? config.parallaxUiComposerDepth
              : kind === 'sidebar' ? config.parallaxUiSidebarDepth
              : config.parallaxUiBubbleDepth,
            blocked: hasFixedDescendant(element)
          })
        }
      }
    }
    this.uiTargets = uiTargets
    const pluginTargets = []
    if (config.parallaxPlugin) {
      const taken = new Set(uiTargets.map(record => record.element))
      for (const element of document.querySelectorAll('[data-slot]')) {
        const slot = element.getAttribute('data-slot') || ''
        if (!slot || UI_SKIP.includes(slot) || UI_SKIP_PREFIX.some(prefix => slot.startsWith(prefix))) continue
        try {
          if (element.closest(UI_SKIP_SCOPE)) continue
        } catch { continue }
        if ([...taken].some(node => node === element || node.contains?.(element) || element.contains?.(node))) continue
        if (!element.getBoundingClientRect().width || !element.getBoundingClientRect().height) continue
        const depth = config.parallaxPluginDepths?.[slot] ?? PLUGIN_DEFAULT_DEPTH
        if (!(Number(depth) > 0) || hasFixedDescendant(element)) continue
        pluginTargets.push({ element, kind: 'plugin', depth, blocked: false })
        taken.add(element)
      }
    }
    this.pluginTargets = pluginTargets
  }

  kick() {
    if (this.frame !== null || !this.config?.parallaxEnabled || document.hidden) return
    if (!this.viewportWidth || !this.viewportHeight) this.readViewport()
    this.refreshTargets(false)
    this.frame = requestAnimationFrame(now => this.tick(now))
  }

  cancelFrame() {
    if (this.frame !== null) cancelAnimationFrame(this.frame)
    this.frame = null
    this.lastMs = 0
  }

  start() {
    this.readViewport()
    this.bind()
    this.refreshTargets(true)
    this.kick()
  }

  stop() {
    this.cancelFrame()
    this.unbind()
    for (const element of this.backgroundTargets) {
      clearTranslate(element)
      element.style.removeProperty('scale')
    }
    for (const element of [...this.uiTargets, ...this.pluginTargets]) clearTranslate(element.element)
    this.backgroundTargets = []
    this.uiTargets = []
    this.pluginTargets = []
    this.x = 0
    this.y = 0
    this.targetX = 0
    this.targetY = 0
    this.seen = false
    this.lastMs = 0
    this.moveMs = 0
    this.targetsAt = 0
  }

  update(config) {
    this.config = config
    if (typeof document === 'undefined') return
    const root = document.documentElement
    if (!config.parallaxEnabled) {
      root.removeAttribute('data-hermes-skins-parallax')
      this.stop()
      return
    }
    root.setAttribute('data-hermes-skins-parallax', 'true')
    this.start()
  }

  tick(now = performance.now()) {
    this.frame = null
    const config = this.config
    if (!config?.parallaxEnabled) return
    if (!this.backgroundTargets.length && !this.uiTargets.length && !this.pluginTargets.length) {
      this.refreshTargets(true)
    }
    const width = this.viewportWidth
    const height = this.viewportHeight
    const cx = this.seen ? this.x : width / 2
    const cy = this.seen ? this.y : height / 2
    const targetX = -(cx - width / 2)
    const targetY = -(cy - height / 2)
    const smooth = parallaxClamp(config.parallaxSmooth, 0, 98, 85)
    const alpha = 1 - smooth / 100
    const dt = this.lastMs ? Math.min(DT_MAX, Math.max(1, now - this.lastMs)) : FRAME_MS
    this.lastMs = now
    const factor = alpha <= 0 ? 1 : 1 - Math.pow(1 - alpha, dt / FRAME_MS)
    this.targetX += (targetX - this.targetX) * factor
    this.targetY += (targetY - this.targetY) * factor

    const diagonal = Math.hypot(width, height)
    const bgDepth = parallaxClamp(config.parallaxBg, 0, 10, 1)
    const bgX = this.targetX / Math.max(1, width) * bgDepth * diagonal
    const bgY = this.targetY / Math.max(1, height) * bgDepth * diagonal
    const bgScale = 1 + bgDepth / 50
    for (const element of this.backgroundTargets) {
      if (!element.isConnected) continue
      writeTranslate(element, bgX, bgY)
      if (element.style.scale !== String(bgScale)) element.style.scale = String(bgScale)
    }

    const applyGroup = record => {
      const element = record.element
      if (!element?.isConnected) return
      const ratio = record.blocked ? 0 : parallaxClamp(record.depth, 0, 10, 1)
      let dx = this.targetX / Math.max(1, width) * ratio * diagonal
      let dy = this.targetY / Math.max(1, height) * ratio * diagonal
      dx = Math.round(dx * this.dpr) / this.dpr
      dy = Math.round(dy * this.dpr) / this.dpr
      if (Math.abs(dx) < 0.25 && Math.abs(dy) < 0.25) {
        clearTranslate(element)
      } else {
        element.style.willChange = 'translate'
        writeTranslate(element, dx, dy)
      }
    }
    for (const record of this.uiTargets) applyGroup(record)
    for (const record of this.pluginTargets) applyGroup(record)

    const idle = this.moveMs > 0 && now - this.moveMs >= IDLE_MS
    const remaining = Math.hypot(targetX - this.targetX, targetY - this.targetY) /
      Math.max(1, width) * diagonal
    if (remaining > (idle ? IDLE_VISIBLE_PX : SETTLE_VISIBLE_PX)) this.kick()
  }

  destroy() {
    this.stop()
    this.config = null
    if (typeof document !== 'undefined') {
      document.documentElement.removeAttribute('data-hermes-skins-parallax')
    }
  }
}

const THEME_FOLLOW_STYLE_ID = 'hermes-skins-theme-follow-css'

const rgbToHex = (r, g, b) => `#${[r, g, b]
  .map(value => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, '0'))
  .join('')}`

function adjustForAccent(r, g, b) {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  if (max < 48) return [127, 140, 170]
  if (max - min < 18) return [130, 145, 170]
  const scale = 190 / Math.max(1, max)
  return [r * scale, g * scale, b * scale]
}

/**
 * Samples the current wallpaper preview and publishes a restrained dominant
 * colour. Kept as a separate root stylesheet so disabling it restores the
 * accent chosen by the plugin/UI-colour layer immediately.
 */
class ThemeFollowController {
  constructor() {
    this.styleEl = null
    this.lastKey = ''
  }

  update(config) {
    if (typeof document === 'undefined') return
    if (!config.themeFollow) {
      document.documentElement.removeAttribute('data-hermes-skins-theme-follow')
      this.styleEl?.remove()
      this.styleEl = null
      this.lastKey = ''
      return
    }
    const source = config.weSelection?.previewPath ||
      (config.wallpaperType === 'image' ? config.wallpaperSource : '')
    if (!source) return
    const key = `${source}|${config.weSelection?.id || ''}`
    if (key === this.lastKey) return
    this.lastKey = key
    void this.sample(source).then(color => {
      if (!color || this.lastKey !== key || !document.documentElement) return
      if (!this.styleEl || !this.styleEl.isConnected) {
        this.styleEl = document.getElementById(THEME_FOLLOW_STYLE_ID) || document.createElement('style')
        this.styleEl.id = THEME_FOLLOW_STYLE_ID
        this.styleEl.dataset.plugin = 'hermes-skins'
        if (!this.styleEl.isConnected) document.head.appendChild(this.styleEl)
      }
      document.documentElement.setAttribute('data-hermes-skins-theme-follow', 'true')
      this.styleEl.textContent = `
        :root[data-hermes-skins-theme-follow="true"] {
          --we-accent:${color};
          --hs-theme-follow-accent:${color};
          --ui-accent:${color};
          --ui-accent-secondary:${color};
          --theme-primary:${color};
          --theme-midground:${color};
          --ui-blue:${color};
        }
      `
    })
  }

  async sample(source) {
    let url = source
    if (/^[A-Za-z]:[\\/]/.test(source)) {
      try {
        const data = await window.hermesDesktop?.readFileDataUrl?.(source)
        if (typeof data === 'string' && data.startsWith('data:image/')) url = data
        else return null
      } catch {
        return null
      }
    }
    if (!/^(https?:|data:image\/|file:\/\/)/i.test(url)) return null
    try {
      const image = new Image()
      image.decoding = 'async'
      if (/^https?:/i.test(url)) image.crossOrigin = 'anonymous'
      await new Promise((resolve, reject) => {
        let settled = false
        const finish = () => {
          if (settled) return
          settled = true
          resolve()
        }
        const fail = () => {
          if (settled) return
          settled = true
          reject(new Error('preview image failed'))
        }
        image.onload = finish
        image.onerror = fail
        image.src = url
        if (image.complete && image.naturalWidth > 0) finish()
        setTimeout(() => {
          if (!settled) fail()
        }, 5000)
      })
      const canvas = document.createElement('canvas')
      canvas.width = 48
      canvas.height = 27
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) return null
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data
      let r = 0
      let g = 0
      let b = 0
      let weight = 0
      for (let index = 0; index < pixels.length; index += 4) {
        if (pixels[index + 3] < 160) continue
        const max = Math.max(pixels[index], pixels[index + 1], pixels[index + 2])
        const min = Math.min(pixels[index], pixels[index + 1], pixels[index + 2])
        const saturation = max - min
        const current = 1 + saturation / 48
        r += pixels[index] * current
        g += pixels[index + 1] * current
        b += pixels[index + 2] * current
        weight += current
      }
      if (!weight) return null
      return rgbToHex(...adjustForAccent(r / weight, g / weight, b / weight))
    } catch {
      return null
    }
  }

  destroy() {
    this.lastKey = ''
    this.styleEl?.remove()
    this.styleEl = null
    if (typeof document !== 'undefined') {
      document.documentElement.removeAttribute('data-hermes-skins-theme-follow')
    }
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

function watchRootTheme(controller) {
  if (typeof document === 'undefined' || typeof MutationObserver !== 'function') return () => {}
  const root = document.documentElement
  const stateKey = () => `${root.dataset.hermesMode || 'dark'}:${root.dataset.hermesTerminalAlpha || 'false'}`

  let queued = false
  let disposed = false
  let lastKey = stateKey()

  const flush = () => {
    queued = false
    if (disposed) return
    const key = stateKey()
    if (key === lastKey) return
    lastKey = key
    controller.sync()
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

const SLIDE_SWITCH_MS = { 1: 60_000, 2: 300_000, 3: 600_000, 4: 1_800_000, 5: 3_600_000 }
const PROP_TYPES = new Set([
  'color', 'bool', 'slider', 'combo', 'text', 'textinput', 'file', 'directory', 'group', 'other'
])
const PROP_LANGS = ['zh-chs', 'zh-cht', 'en-us']

const stripHtml = value => typeof value !== 'string' ? '' : value
  .replace(/<br\s*\/?>/gi, '\n')
  .replace(/<[^>]*>/g, '')
  .replace(/&nbsp;/gi, ' ')
  .replace(/&amp;/gi, '&')
  .replace(/&lt;/gi, '<')
  .replace(/&gt;/gi, '>')
  .replace(/&quot;/gi, '"')
  .replace(/&#0?39;|&apos;/gi, "'")
  .trim()

function propertyText(project, key, fallback) {
  const table = project?.general?.localization
  if (table && typeof table === 'object') {
    for (const language of PROP_LANGS) {
      const entry = Object.entries(table).find(([name]) => name.toLowerCase() === language)?.[1]
      if (entry && typeof entry === 'object' && typeof entry[key] === 'string') {
        const localized = stripHtml(entry[key])
        if (localized) return localized
      }
    }
  }
  return stripHtml(key) || fallback
}

function propertyDefault(type, definition) {
  if (!definition || !('value' in definition)) return null
  const value = definition.value
  if (value === undefined || value === null) return null
  if (type === 'bool') return typeof value === 'boolean' ? value : null
  if (type === 'slider') return Number.isFinite(Number(value)) ? Number(value) : null
  if (type === 'combo') return value
  if (type === 'color') return typeof value === 'string' ? value : null
  return typeof value === 'string' ? value : JSON.stringify(value)
}

function parseProjectProperties(project) {
  const source = project?.general?.properties
  if (!source || typeof source !== 'object' || Array.isArray(source)) return []
  return Object.entries(source)
    .filter(([, definition]) => definition && typeof definition === 'object' &&
      typeof definition.type === 'string')
    .sort((left, right) => {
      const order = Number(left[1].order || 0) - Number(right[1].order || 0)
      return order || (left[0] < right[0] ? -1 : left[0] > right[0] ? 1 : 0)
    })
    .slice(0, 100)
    .map(([name, definition]) => {
      const rawType = String(definition.type || 'other').toLowerCase()
      const type = PROP_TYPES.has(rawType) ? rawType : 'other'
      const entry = {
        name: name.slice(0, 120),
        type,
        text: propertyText(project, typeof definition.text === 'string' ? definition.text : name, name).slice(0, 240),
        order: Number.isFinite(Number(definition.order)) ? Number(definition.order) : 0,
        value: propertyDefault(type, definition),
        hidden: definition.editable === false
      }
      if (Array.isArray(definition.options)) {
        entry.options = definition.options
          .filter(option => option && typeof option === 'object' && 'value' in option)
          .slice(0, 200)
          .map(option => ({
            label: propertyText(project, typeof option.label === 'string' ? option.label : '',
              String(option.value)).slice(0, 160),
            value: option.value
          }))
      }
      for (const key of ['min', 'max', 'step', 'precision']) {
        if (Number.isFinite(Number(definition[key]))) entry[key] = Number(definition[key])
      }
      if (typeof definition.fileType === 'string') entry.fileType = definition.fileType.slice(0, 20)
      return entry
    })
}

async function listPictures(bridge, dir, depth = 0) {
  if (depth > 3) return []
  const entries = await entriesAt(bridge, dir)
  if (!entries) return []
  const images = []
  const directories = []
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue
    const path = entry.path || joinLocalPath(dir, entry.name)
    if (entry.isDirectory) directories.push(path)
    else if (IMAGE_EXTENSIONS.test(entry.name)) images.push(path)
    if (images.length >= 200) break
  }
  for (const child of directories) {
    if (images.length >= 200) break
    images.push(...await listPictures(bridge, child, depth + 1))
  }
  return images
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .slice(0, 200)
}

async function readPictureSlides(bridge, dir, project) {
  const preset = project?.preset && typeof project.preset === 'object' ? project.preset : null
  if (!preset) return null
  const mode = Number(preset.wallpapermode)
  const custom = typeof preset.customdirectory === 'string' ? preset.customdirectory.trim() : ''
  const single = typeof preset.image === 'string' ? preset.image.trim() : ''
  let slides = []
  if (custom && (mode === 1 || mode === 2)) {
    const base = safeProjectPath(dir, custom)
    if (base) slides = await listPictures(bridge, base)
  } else if (single && IMAGE_EXTENSIONS.test(single)) {
    const path = safeProjectPath(dir, single)
    if (path && await existsAt(bridge, path)) slides = [path]
  }
  if (!slides.length) return null
  const interval = Number(preset.imageswitchtimes)
  return { slides, slideIntervalMs: SLIDE_SWITCH_MS[interval] || null }
}

async function readWallpaperProject(bridge, dir, source = 'manual', knownEntries = null) {
  const entries = knownEntries || await entriesAt(bridge, dir)
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
  const filenames = new Set(entries.map(entry => entry.name.toLowerCase()))
  const exists = async (path, relative) => {
    if (!path) return false
    // Most projects keep media beside project.json; its directory has already
    // been read. Only nested paths require another native bridge round-trip.
    if (!/[\\/]/.test(relative)) return filenames.has(relative.toLowerCase())
    return existsAt(bridge, path)
  }
  const [mainExists, previewExists] = await Promise.all([
    exists(mainPath, project.file), exists(previewPath, project.preview)
  ])
  const canPlayVideo = kind === 'video' && mainExists && VIDEO_EXTENSIONS.test(mainPath)
  const canShowImage = kind === 'image' && mainExists && IMAGE_EXTENSIONS.test(mainPath)
  const canShowWeb = kind === 'web' && mainExists && /\.html?$/i.test(mainPath)
  const picture = !canPlayVideo && !canShowWeb ? await readPictureSlides(bridge, dir, project) : null
  const mediaType = canPlayVideo ? 'video' : canShowWeb ? 'web' : 'image'
  const mediaPath = canPlayVideo || canShowImage || canShowWeb
    ? mainPath : (picture?.slides?.[0] || (previewExists ? previewPath : null))
  if (!mediaPath) return null
  const title = typeof project.title === 'string' && project.title.trim()
    ? project.title.trim().slice(0, 120) : dir.split(/[\\/]/).at(-1)
  return {
    id: dir.toLowerCase(),
    title,
    kind: picture ? 'image' : kind,
    source,
    contentrating: typeof project.contentrating === 'string' ? project.contentrating : null,
    dir,
    mediaPath,
    mediaType,
    slides: picture?.slides || (canShowImage ? [mainPath] : []),
    slideIntervalMs: picture?.slideIntervalMs || null,
    previewPath: previewExists ? previewPath : mediaPath,
    staticFallback: !canPlayVideo && !canShowImage && !canShowWeb && !picture,
    workshopId: typeof project.workshopid === 'string' ? project.workshopid : null,
    properties: parseProjectProperties(project)
  }
}

async function scanContainer(bridge, root, source) {
  const entries = await entriesAt(bridge, root)
  if (!entries) return []
  if (entries.some(entry => entry.name.toLowerCase() === 'project.json')) {
    const project = await readWallpaperProject(bridge, root, source, entries)
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

/** Turn one scanned Wallpaper Engine item into the config patch the controller applies. */
async function resolveWallpaperSelection(item, openScene) {
  if (!item || typeof item !== 'object') throw new Error('Invalid wallpaper item')
  let source = wallpaperMediaUrl(item.mediaPath, item.mediaType)
  let type = item.mediaType
  let framePath = null
  let staticFallback = Boolean(item.staticFallback)

  if (item.kind === 'scene' || item.kind === 'web') {
    if (typeof openScene !== 'function') throw new Error('Scene backend is unavailable')
    const opened = await openScene({ dir: item.dir })
    if (!opened?.ok) throw new Error(opened?.error || 'Scene backend refused this wallpaper')
    source = item.dir
    type = item.kind
    framePath = item.kind === 'scene' ? (item.previewPath || null) : null
    staticFallback = false
  }

  return {
    wallpaperEnabled: true,
    wallpaperType: type,
    wallpaperSource: source,
    weSelection: {
      id: item.id,
      title: item.title,
      kind: item.kind,
      source: item.source || '',
      staticFallback,
      dir: item.dir,
      manifestPath: null,
      framePath,
      previewPath: item.previewPath || null,
      slides: Array.isArray(item.slides) ? item.slides : [],
      slideIntervalMs: Number.isFinite(Number(item.slideIntervalMs)) ? Number(item.slideIntervalMs) : null,
      properties: Array.isArray(item.properties) ? item.properties : []
    }
  }
}

function activeRotationGroup(config) {
  const groups = Array.isArray(config?.rotationGroups) ? config.rotationGroups : []
  return groups.find(group => group.id === config?.rotationGroupId) || null
}

function groupWallpapers(items, group, hiddenIds = []) {
  const byId = new Map((Array.isArray(items) ? items : []).map(item => [item.id, item]))
  const hidden = new Set(hiddenIds)
  return (group?.wallpaperIds || [])
    .map(id => byId.get(id))
    .filter(item => item && item.id && item.dir && item.mediaPath && !hidden.has(item.id))
}

function rotationCandidates(items, hiddenIds = [], group = null) {
  const hidden = new Set(hiddenIds)
  const pool = group ? groupWallpapers(items, group, hiddenIds) : (Array.isArray(items) ? items : [])
  return pool.filter(item =>
    item && typeof item.id === 'string' && item.dir && item.mediaPath && !hidden.has(item.id))
}

function isSceneBackendMissing(error) {
  return /Plugin not found|\b404\b/.test(String(error?.message || error))
}

/** An explicit recovery action uses Hermes' activation authority, never config edits. */
async function enableSceneBackend(bridge) {
  if (!bridge?.api) throw new Error('Hermes plugin activation API unavailable')
  const result = await bridge.api({ path: '/api/dashboard/agent-plugins/hermes-skins/enable', method: 'POST' })
  if (!result?.ok || result.consent_required) throw new Error(result?.error || 'Scene backend could not be enabled')
  // Hermes' gateway_reloaded flag describes agent handlers, not dashboard API
  // routes. The route is mounted at server startup: verify it independently.
  try {
    const health = await bridge.api({ path: '/api/plugins/hermes-skins/scene/health' })
    if (!health?.ok) throw new Error('Scene helper or Node.js runtime unavailable')
    if (health.webwallgl === false) throw new Error('WebWallGL renderer files are missing from the backend package')
    return { ready: true, restartRequired: false }
  } catch (error) {
    if (!isSceneBackendMissing(error)) throw error
    return { ready: false, restartRequired: true }
  }
}

// ─── Submodule: Wallpaper rotation ───────────────────────────
const TICK_MS = 15000

/**
 * User-defined rotation groups. Each group has its own interval, order and
 * video-end trigger; hidden wallpapers and removed projects never become
 * candidates.
 */
class WallpaperRotation {
  constructor(store, openScene, controller, backdrop = null) {
    this.store = store
    this.openScene = openScene
    this.controller = controller
    this.backdrop = backdrop
    this.lastSwitch = Date.now()
    this.lastId = store.$config.get().weSelection?.id || null
    this.lastGroupId = store.$config.get().rotationGroupId || ''
    this.lastEnabled = false
    this.switching = false
    this.timer = typeof document === 'undefined' ? null : setInterval(() => void this.tick(), TICK_MS)
    this.handleVideoEnd = () => void this.advance(true)
    if (backdrop) backdrop.onMediaEnd = this.handleVideoEnd
  }

  currentGroup(config) {
    return activeRotationGroup(config)
  }

  candidates(config = this.store.$config.get()) {
    return rotationCandidates(this.store.$weItems.get(), config.hiddenWallpaperIds, this.currentGroup(config))
  }

  async advance(force = false) {
    const config = this.store.$config.get()
    if (!config.rotationEnabled || this.switching) return false
    const group = this.currentGroup(config)
    if (group?.trigger === 'videoEnd' && !force) return false
    const items = this.candidates(config)
    if (items.length < 2) return false
    const currentId = config.weSelection?.id || null
    let next
    if (group?.order === 'random') {
      const pool = items.filter(item => item.id !== currentId)
      next = pool[Math.floor(Math.random() * pool.length)] || null
    } else {
      const index = items.findIndex(item => item.id === currentId)
      next = items[index < 0 ? 0 : (index + 1) % items.length]
    }
    if (!next) return false
    this.switching = true
    try {
      const patch = await resolveWallpaperSelection(next, this.openScene)
      this.controller.changeConfig(patch)
      this.lastId = next.id
      this.lastSwitch = Date.now()
      return true
    } catch {
      // A broken project must not stop the timer. Move the anchor so the same
      // broken entry cannot pin every later tick to itself.
      this.lastSwitch = Date.now()
      return false
    } finally {
      this.switching = false
    }
  }

  async tick() {
    const config = this.store.$config.get()
    const currentId = config.weSelection?.id || null
    const groupId = config.rotationGroupId || ''
    if (currentId !== this.lastId || groupId !== this.lastGroupId) {
      this.lastId = currentId
      this.lastGroupId = groupId
      this.lastSwitch = Date.now()
    }
    if (config.rotationEnabled && !this.lastEnabled) this.lastSwitch = Date.now()
    this.lastEnabled = config.rotationEnabled
    if (!config.rotationEnabled) return
    const group = this.currentGroup(config)
    if (group?.trigger === 'videoEnd') return
    const items = this.candidates(config)
    if (items.length < 2) return
    const interval = Math.max(1, Number(group?.interval) || config.rotationMinutes || 30) * 60000
    if (Date.now() - this.lastSwitch < interval) return
    await this.advance(false)
  }

  destroy() {
    if (this.timer !== null) clearInterval(this.timer)
    this.timer = null
    if (this.backdrop?.onMediaEnd === this.handleVideoEnd) this.backdrop.onMediaEnd = null
  }
}

function nextRotationGroupId() {
  return `grp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

// ─── Submodule: Wallpaper Engine Panel ───────────────────────
const { WallpaperEnginePanel } = (() => {
const isZh = () => String(typeof document !== 'undefined'
  ? (document.documentElement?.lang || navigator.language || '')
  : (typeof navigator !== 'undefined' ? navigator.language : '')).toLowerCase().startsWith('zh')
const text = (zh, en) => isZh() ? zh : en

function ratingOf(item) {
  const value = String(item?.contentrating || '').toLowerCase()
  if (value.includes('mature')) return 'mature'
  if (value.includes('pg13') || value.includes('pg-13')) return 'pg13'
  if (value.includes('everyone')) return 'everyone'
  return 'unrated'
}

function orientationOf(item) {
  const width = Number(item?.width) || 0
  const height = Number(item?.height) || 0
  if (!width || !height) return 'all'
  return width > height ? 'landscape' : width < height ? 'portrait' : 'all'
}

function Chips({ values, selected, onToggle, label }) {
  return jsxs('div', { className: 'flex flex-wrap items-center gap-1.5', 'aria-label': label, children: values.map(value => {
    const active = selected.includes(value)
    return jsx('button', {
      type: 'button',
      'aria-pressed': active,
      onClick: () => onToggle(value),
      className: `rounded-full px-2.5 py-1 text-[11px] transition ${active
        ? 'bg-primary text-primary-foreground'
        : 'border border-border bg-background/60 text-muted-foreground hover:text-foreground'}`,
      children: value
    }, value)
  }) })
}

function WallpaperThumb({ item, bridge }) {
  const path = item.previewPath || (item.mediaType === 'image' ? item.mediaPath : null)
  const [src, setSrc] = useState(() => path ? normalizeMediaSource(path) : null)
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setSrc(path ? normalizeMediaSource(path) : null)
    setFailed(false)
    setLoaded(false)
  }, [path])

  const fallback = async () => {
    if (!path || !bridge?.readFileDataUrl || failed) {
      setFailed(true)
      return
    }
    try {
      const data = await bridge.readFileDataUrl(path)
      if (typeof data === 'string' && data.startsWith('data:image/')) {
        setSrc(data)
        return
      }
    } catch { /* Keep the no-preview placeholder. */ }
    setFailed(true)
  }

  if (!src || failed) {
    return jsx('span', {
      className: 'absolute inset-0 grid place-items-center text-[10px] text-muted-foreground',
      children: text('无预览', 'No preview')
    })
  }
  return jsx('img', {
    src,
    alt: item.title,
    loading: 'lazy',
    decoding: 'async',
    onLoad: () => setLoaded(true),
    onError: () => void fallback(),
    className: `absolute inset-0 size-full object-cover transition duration-300 group-hover:scale-[1.06] ${loaded ? 'opacity-100' : 'opacity-0'}`
  })
}

function WallpaperEnginePanel({
  store, controller, openScene, loadUploads, importUploads, importUrl, importBing, compact = false
}) {
  const t = usePluginI18n('hermes-skins')
  const config = useValue(store.$config)
  const [items, setItems] = useState([])
  const [libraries, setLibraries] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [showHidden, setShowHidden] = useState(false)
  const [importingId, setImportingId] = useState(null)
  const [backendMissing, setBackendMissing] = useState(false)
  const [recoveringBackend, setRecoveringBackend] = useState(false)
  const [urlDraft, setUrlDraft] = useState('')
  const [busyAction, setBusyAction] = useState('')
  const pendingScene = useRef(null)
  const scanRevision = useRef(0)
  const bridge = typeof window !== 'undefined' ? window.hermesDesktop : null
  const rootsKey = config.weRoots.join('|')

  async function refresh() {
    const revision = ++scanRevision.current
    setLoading(true)
    setError('')
    try {
      const [scan, uploads] = await Promise.all([
        scanWallpaperEngine(bridge, config.weRoots).catch(cause => ({
          items: [], libraries: [], error: String(cause?.message || cause)
        })),
        typeof loadUploads === 'function'
          ? loadUploads().catch(() => ({ items: [] }))
          : Promise.resolve({ items: [] })
      ])
      if (revision !== scanRevision.current) return
      const merged = [...(uploads?.items || []), ...(scan.items || [])]
      setItems(merged)
      store.setWeItems?.(merged)
      setLibraries(scan.libraries || [])
      if (scan.error) setError(scan.error)
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

  const hiddenIds = new Set(config.hiddenWallpaperIds || [])
  const typeFilter = Array.isArray(config.typeFilter) ? config.typeFilter : WALLPAPER_TYPES
  const ratingFilter = Array.isArray(config.contentRatingFilter) ? config.contentRatingFilter : ['everyone']
  const hiddenCount = items.filter(item => hiddenIds.has(item.id)).length
  const filtered = items.filter(item => {
    if (showHidden !== hiddenIds.has(item.id)) return false
    if (!typeFilter.includes(item.kind)) return false
    const rating = ratingOf(item)
    if (item.contentrating && !ratingFilter.includes(rating)) return false
    const orientationFilter = config.orientationFilter || 'all'
    if (orientationFilter !== 'all' && orientationOf(item) !== 'all' &&
      orientationOf(item) !== orientationFilter) return false
    if (config.folderFilter !== 'all' && item.source !== config.folderFilter) return false
    return !query || item.title.toLocaleLowerCase().includes(query.toLocaleLowerCase())
  })

  async function chooseFolder() {
    if (!bridge?.selectPaths) {
      setError(t('weBridgeUnavailable'))
      return
    }
    const paths = await bridge.selectPaths({
      directories: true, multiple: false,
      defaultPath: libraries[0] || config.weRoots[0], title: t('weChooseFolder')
    })
    const selected = paths?.[0]
    if (selected && !config.weRoots.includes(selected)) {
      controller.changeConfig({ weRoots: [...config.weRoots, selected] })
    }
  }

  async function addFiles() {
    if (!bridge?.selectPaths || typeof importUploads !== 'function') {
      setError(t('weBridgeUnavailable'))
      return
    }
    setBusyAction('files')
    setError('')
    try {
      const paths = await bridge.selectPaths({
        directories: false, multiple: true,
        title: text('选择图片或视频', 'Choose images or videos')
      })
      if (!paths?.length) return
      const result = await importUploads(paths)
      if (result?.rejected?.length) setError(result.rejected.map(row => row.error).join(' · '))
      await refresh()
    } catch (cause) {
      setError(String(cause?.message || cause))
    } finally {
      setBusyAction('')
    }
  }

  async function addUrl() {
    if (!urlDraft.trim() || typeof importUrl !== 'function') return
    setBusyAction('url')
    setError('')
    try {
      const result = await importUrl(urlDraft.trim())
      if (!result?.ok) throw new Error(result?.error || 'URL import failed')
      setUrlDraft('')
      await refresh()
    } catch (cause) {
      setError(String(cause?.message || cause))
    } finally {
      setBusyAction('')
    }
  }

  async function addBing() {
    if (typeof importBing !== 'function') return
    setBusyAction('bing')
    setError('')
    try {
      const result = await importBing()
      if (!result?.ok) throw new Error(result?.error || 'Bing download failed')
      await refresh()
    } catch (cause) {
      setError(String(cause?.message || cause))
    } finally {
      setBusyAction('')
    }
  }

  async function useWallpaper(item) {
    setError('')
    setBackendMissing(false)
    setImportingId(item.id)
    try {
      if (hiddenIds.has(item.id)) {
        const next = new Set(hiddenIds)
        next.delete(item.id)
        controller.changeConfig({ hiddenWallpaperIds: [...next] })
      }
      if ((item.kind === 'scene' || item.kind === 'web') &&
          config.weSelection?.id === item.id && config.weSelection?.dir === item.dir) {
        controller.changeConfig({ wallpaperEnabled: true })
        return
      }
      controller.changeConfig(await resolveWallpaperSelection(item, openScene))
    } catch (cause) {
      const message = String(cause?.message || cause)
      const missing = isSceneBackendMissing(cause)
      pendingScene.current = missing ? item : null
      setBackendMissing(missing)
      setError(missing ? t('weSceneBackendMissing') : message)
    } finally {
      setImportingId(null)
    }
  }

  function toggleHidden(item, hidden) {
    const next = new Set(config.hiddenWallpaperIds || [])
    if (hidden) next.add(item.id)
    else next.delete(item.id)
    controller.changeConfig({ hiddenWallpaperIds: [...next] })
  }

  async function recoverBackend() {
    setRecoveringBackend(true)
    try {
      const result = await enableSceneBackend(bridge)
      setBackendMissing(false)
      if (result.ready) {
        setError('')
        const item = pendingScene.current
        pendingScene.current = null
        if (item) await useWallpaper(item)
      } else setError(t('weSceneBackendRestartRequired'))
    } catch (cause) {
      setError(String(cause?.message || cause))
    } finally { setRecoveringBackend(false) }
  }

  const kindLabel = kind => t({ video: 'weTypeVideo', scene: 'weTypeScene', image: 'weTypeImage', web: 'weTypeWeb' }[kind] || 'weTypeOther')
  const toggleArray = (key, value) => {
    const current = Array.isArray(config[key])
      ? config[key]
      : key === 'typeFilter' ? WALLPAPER_TYPES : ['everyone']
    const next = current.includes(value) ? current.filter(item => item !== value) : [...current, value]
    if (next.length) controller.changeConfig({ [key]: next })
  }
  const classic = config.pickerLayout === 'classic'

  return jsxs('section', {
    'data-hermes-skins-surface': '',
    className: `rounded-xl border border-border bg-card ${compact ? 'p-3' : 'p-5'}`,
    children: [
      jsxs('div', { className: 'flex flex-wrap items-start justify-between gap-3', children: [
        jsxs('div', { className: 'space-y-1', children: [
          jsx('h2', { className: 'font-semibold text-foreground', children: t('weTitle') }),
          jsx('p', { className: 'text-xs text-muted-foreground', children: t('weDescription') })
        ] }),
        jsxs('div', { className: 'flex flex-wrap gap-2', children: [
          jsx(Button, { size: 'sm', variant: 'outline', onClick: chooseFolder, children: t('weChooseFolder') }),
          jsx(Button, { size: 'sm', variant: 'outline', onClick: () => void addFiles(),
            disabled: Boolean(busyAction), children: busyAction === 'files' ? '…' : text('添加文件', 'Add files') }),
          jsx(Button, { size: 'sm', variant: 'outline', onClick: refresh, disabled: loading,
            children: loading ? t('weScanning') : t('weRefresh') })
        ] })
      ] }),
      jsxs('div', { className: 'mt-3 flex flex-wrap gap-2', children: [
        jsx(Input, {
          value: urlDraft, onChange: event => setUrlDraft(event.target.value),
          onKeyDown: event => { if (event.key === 'Enter') void addUrl() },
          placeholder: text('粘贴图片 / 视频 URL', 'Paste an image or video URL'),
          className: 'min-w-52 flex-1'
        }),
        jsx(Button, { size: 'sm', variant: 'outline', disabled: Boolean(busyAction) || !urlDraft.trim(),
          onClick: () => void addUrl(), children: busyAction === 'url' ? '…' : text('导入 URL', 'Import URL') }),
        jsx(Button, { size: 'sm', variant: 'outline', disabled: Boolean(busyAction),
          onClick: () => void addBing(), children: busyAction === 'bing' ? '…' : 'Bing 每日一图' })
      ] }),
      jsx('p', { className: 'mt-3 text-xs text-muted-foreground',
        children: loading ? t('weScanning')
          : `${t('weFound', items.length)} · ${text('点击卡片即应用，悬停显示隐藏按钮', 'Click a card to apply; hover to hide')}` }),
      error && jsx('p', { className: 'mt-2 text-xs text-destructive', children: error }),
      backendMissing && bridge?.api && jsx(Button, {
        size: 'sm', variant: 'outline', className: 'mt-2',
        disabled: recoveringBackend, onClick: () => void recoverBackend(),
        children: recoveringBackend ? t('weSceneBackendEnabling') : t('weSceneBackendEnable')
      }),
      !loading && config.weSelection && items.length > 0 &&
        !items.some(item => item.id === config.weSelection.id) &&
        jsx('p', { className: 'mt-2 text-xs text-amber-600', children: t('weMissing') }),
      jsxs('div', { className: 'mt-4 flex flex-col gap-2', children: [
        jsxs('div', { className: 'flex flex-wrap items-center gap-2', children: [
          jsx(Input, {
            value: query, onChange: event => setQuery(event.target.value),
            placeholder: t('weSearch'), className: 'max-w-64', 'aria-label': t('weSearch')
          }),
          jsxs('select', {
            value: config.orientationFilter,
            onChange: event => controller.changeConfig({ orientationFilter: event.target.value }),
            className: 'rounded-md border border-border bg-background px-2 py-1.5 text-xs',
            'aria-label': text('方向筛选', 'Orientation filter'),
            children: ORIENTATION_FILTERS.map(value => jsx('option', { value,
              children: value === 'all' ? text('全部方向', 'All orientations')
                : value === 'landscape' ? text('横屏', 'Landscape') : text('竖屏', 'Portrait')
            }, value))
          }),
          jsx(Button, {
            size: 'sm', variant: 'outline',
            onClick: () => setShowHidden(value => !value),
            children: showHidden ? t('weShowVisible', hiddenCount) : t('weShowHidden', hiddenCount)
          })
        ] }),
        jsxs('div', { className: 'flex flex-wrap items-center gap-2', children: [
          jsx('span', { className: 'text-[11px] text-muted-foreground', children: text('类型', 'Type') }),
          jsx(Chips, {
            values: WALLPAPER_TYPES, selected: config.typeFilter,
            onToggle: value => toggleArray('typeFilter', value), label: text('类型筛选', 'Type filter')
          })
        ] }),
        jsxs('div', { className: 'flex flex-wrap items-center gap-2', children: [
          jsx('span', { className: 'text-[11px] text-muted-foreground', children: text('分级', 'Rating') }),
          jsx(Chips, {
            values: CONTENT_RATINGS, selected: config.contentRatingFilter,
            onToggle: value => toggleArray('contentRatingFilter', value), label: text('内容分级筛选', 'Rating filter')
          })
        ] })
      ] }),
      !loading && items.length === 0 && jsx('p', { className: 'mt-4 text-sm text-muted-foreground', children: t('weEmpty') }),
      jsxs('div', {
        className: `mt-4 grid gap-2 overflow-y-auto overflow-x-hidden p-0.5 ${classic
          ? 'max-h-[min(58vh,560px)] pb-10'
          : 'max-h-[min(58vh,560px)]'}`,
        style: {
          gridTemplateColumns: classic
            ? 'repeat(auto-fill, minmax(100px, 1fr))'
            : 'repeat(auto-fill, minmax(120px, 1fr))',
          scrollbarGutter: 'stable'
        },
        children: filtered.map(item => {
          const selected = config.weSelection?.id === item.id
          const hidden = hiddenIds.has(item.id)
          const busy = importingId === item.id
          const cardStyle = classic
            ? { aspectRatio: '16 / 9', marginBottom: '-36px' }
            : { height: '92px' }
          return jsxs('div', {
            key: item.id,
            'data-wallpaper-id': item.id,
            'data-hermes-skins-surface': '',
            role: 'button',
            tabIndex: 0,
            'aria-pressed': selected,
            'aria-label': hidden ? text(`恢复并应用 ${item.title}`, `Restore and apply ${item.title}`) : item.title,
            title: item.title,
            onClick: () => { if (!busy && !recoveringBackend) void useWallpaper(item) },
            onKeyDown: event => {
              if ((event.key === 'Enter' || event.key === ' ') && !busy && !recoveringBackend) {
                event.preventDefault()
                void useWallpaper(item)
              }
            },
            className: `group relative cursor-pointer overflow-hidden rounded-lg border bg-muted/30 shadow-sm transition duration-150 ${classic
              ? 'hover:z-10 hover:scale-[1.12] hover:shadow-xl'
              : ''} ${selected
              ? 'border-primary ring-2 ring-primary/55 shadow-[0_4px_16px_color-mix(in_srgb,var(--dt-primary)_30%,transparent)]'
              : 'border-border hover:border-primary/50'} ${hidden ? 'opacity-75' : ''}`,
            style: cardStyle,
            children: [
              jsx(WallpaperThumb, { item, bridge }),
              jsx('span', {
                className: 'pointer-events-none absolute left-1 top-1 z-[2] rounded bg-black/65 px-1.5 py-0.5 text-[10px] leading-4 text-white',
                children: kindLabel(item.kind)
              }),
              (item.kind === 'scene' || item.kind === 'web') && !item.staticFallback && jsx('span', {
                className: 'pointer-events-none absolute right-1 top-1 z-[1] rounded bg-sky-700/85 px-1.5 py-0.5 text-[9px] leading-4 text-white',
                children: text('实时', 'Live')
              }),
              jsx('span', {
                className: 'pointer-events-none absolute inset-x-0 bottom-0 z-[1] truncate bg-gradient-to-t from-black/85 via-black/55 to-transparent px-1.5 pb-1 pt-5 text-[11px] leading-4 text-white',
                children: item.title
              }),
              jsx('button', {
                type: 'button',
                className: `absolute right-1 top-1 z-[3] rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white transition hover:bg-red-700/90 focus-visible:opacity-100 ${hidden ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'}`,
                title: hidden ? text('恢复此壁纸', 'Restore this wallpaper') : text('隐藏此壁纸，可在“已隐藏”中恢复', 'Hide this wallpaper; restore it from the hidden view'),
                onClick: event => {
                  event.stopPropagation()
                  toggleHidden(item, !hidden)
                },
                children: hidden ? t('weRestore') : t('weHide')
              }),
              busy && jsx('span', {
                className: 'absolute inset-0 z-[4] grid place-items-center bg-black/55 text-[11px] text-white',
                children: t('wePreparing')
              }),
              selected && jsx('span', {
                className: 'pointer-events-none absolute bottom-1 right-1 z-[2] rounded bg-primary px-1.5 py-0.5 text-[9px] font-medium leading-4 text-primary-foreground',
                children: t('weSelected')
              })
            ]
          })
        })
      }),
      filtered.length === 0 && !loading && jsxs('div', {
        className: 'mt-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground',
        children: [
          jsx('span', { children: query
            ? text(`没有匹配「${query}」的壁纸`, `No wallpaper matches “${query}”`)
            : showHidden ? text('没有已隐藏的壁纸', 'No hidden wallpapers')
              : text('当前筛选条件下没有壁纸', 'No wallpapers match the current filters') }),
          jsx('button', {
            type: 'button',
            className: 'text-foreground underline underline-offset-2',
            onClick: () => { setQuery(''); setShowHidden(false) },
            children: text('清除搜索与视图', 'Clear search and view')
          })
        ]
      })
    ]
  })
}
return { WallpaperEnginePanel }
})()

// ─── Submodule: Rotation group editor ────────────────────────
const { RotationGroupEditor } = (() => {
const INTERVALS = [1, 5, 10, 30, 60, 120]
const PICTURE_INTERVALS = [0, 5, 10, 15, 30, 60, 180, 300]
const isZh = () => String(typeof document !== 'undefined'
  ? (document.documentElement?.lang || navigator.language || '')
  : (typeof navigator !== 'undefined' ? navigator.language : '')).toLowerCase().startsWith('zh')
const text = (zh, en) => isZh() ? zh : en

function Select({ value, onChange, children, label, disabled = false }) {
  return jsxs('label', { className: 'flex flex-col gap-1.5 text-xs text-foreground', children: [
    label && jsx('span', { className: 'text-muted-foreground', children: label }),
    jsx('select', {
      value, disabled, onChange: event => onChange(event.target.value),
      className: 'rounded-md border border-border bg-background px-2.5 py-1.5 text-xs disabled:opacity-50',
      children
    })
  ] })
}

function RotationGroupEditor({ store, controller }) {
  const t = usePluginI18n('hermes-skins')
  const config = useValue(store.$config)
  const items = useValue(store.$weItems)
  const [draft, setDraft] = useState(null)
  const [armedDelete, setArmedDelete] = useState(false)
  const [query, setQuery] = useState('')
  const group = activeRotationGroup(config)
  const candidates = groupWallpapers(items, group, config.hiddenWallpaperIds)
  const selectedIds = new Set((draft || group)?.wallpaperIds || [])
  const filteredItems = items
    .filter(item => !config.hiddenWallpaperIds.includes(item.id))
    .filter(item => !query || item.title.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 250)

  const beginCreate = () => {
    const draftGroup = {
      id: nextRotationGroupId(),
      name: text(`轮播列表 ${config.rotationGroups.length + 1}`, `Rotation list ${config.rotationGroups.length + 1}`),
      interval: config.rotationMinutes || 30,
      order: 'sequence',
      trigger: 'interval',
      wallpaperIds: []
    }
    setDraft(draftGroup)
    setArmedDelete(false)
  }

  const beginEdit = () => {
    if (!group) return
    setDraft(JSON.parse(JSON.stringify(group)))
    setArmedDelete(false)
  }

  const updateDraft = patch => {
    setDraft(current => current ? { ...current, ...patch } : current)
  }

  const toggleMember = id => {
    if (!draft) return
    const next = new Set(draft.wallpaperIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    updateDraft({ wallpaperIds: [...next] })
  }

  const save = () => {
    if (!draft) return
    const cleaned = normalizeRotationGroup(draft)
    if (!cleaned) return
    const exists = config.rotationGroups.some(item => item.id === cleaned.id)
    const rotationGroups = exists
      ? config.rotationGroups.map(item => item.id === cleaned.id ? cleaned : item)
      : [...config.rotationGroups, cleaned]
    controller.changeConfig({
      rotationGroups,
      rotationGroupId: cleaned.id,
      rotationSeeded: true,
      rotationMinutes: cleaned.interval
    })
    setDraft(null)
  }

  const remove = () => {
    if (!group) return
    if (!armedDelete) {
      setArmedDelete(true)
      return
    }
    const rotationGroups = config.rotationGroups.filter(item => item.id !== group.id)
    const fallback = rotationGroups.find(item => groupWallpapers(items, item, config.hiddenWallpaperIds).length >= 2)
    controller.changeConfig({
      rotationGroups,
      rotationGroupId: fallback?.id || '',
      rotationEnabled: fallback ? config.rotationEnabled : false
    })
    setArmedDelete(false)
  }

  const enableRotation = checked => {
    if (checked && !group) {
      const first = config.rotationGroups.find(item =>
        groupWallpapers(items, item, config.hiddenWallpaperIds).length >= 2)
      if (first) controller.changeConfig({ rotationGroupId: first.id, rotationEnabled: true })
      return
    }
    controller.changeConfig({ rotationEnabled: checked })
  }

  return jsxs('div', { className: 'flex flex-col gap-3 rounded-lg border border-border bg-background/40 p-3', children: [
    jsxs('div', { className: 'flex flex-wrap items-end gap-2', children: [
      jsxs('label', { className: 'flex min-w-52 flex-1 flex-col gap-1.5 text-xs text-foreground', children: [
        jsx('span', { className: 'text-muted-foreground', children: text('轮播列表', 'Rotation list') }),
        jsxs('select', {
          value: config.rotationGroupId,
          onChange: event => {
            setDraft(null)
            setArmedDelete(false)
            controller.changeConfig({ rotationGroupId: event.target.value })
          },
          disabled: config.rotationGroups.length === 0,
          className: 'rounded-md border border-border bg-background px-2.5 py-1.5 text-xs disabled:opacity-50',
          children: [
            jsx('option', { value: '', children: config.rotationGroups.length
              ? text('— 选择轮播列表 —', '— Choose a rotation list —')
              : text('— 暂无轮播列表 —', '— No rotation lists —') }),
            ...config.rotationGroups.map(item => jsx('option', {
              value: item.id,
              children: text(
                `${item.name}（${groupWallpapers(items, item, config.hiddenWallpaperIds).length} 可播放 · ${item.interval} 分钟）`,
                `${item.name} (${groupWallpapers(items, item, config.hiddenWallpaperIds).length} playable · ${item.interval} min)`
              )
            }, item.id))
          ]
        })
      ] }),
      jsx(Button, { size: 'sm', variant: 'outline', onClick: beginCreate, children: text('新建', 'New') }),
      jsx(Button, { size: 'sm', variant: 'outline', onClick: beginEdit, disabled: !group,
        children: text('编辑', 'Edit') }),
      jsx(Button, {
        size: 'sm', variant: armedDelete ? 'destructive' : 'outline',
        onClick: remove, disabled: !group,
        children: armedDelete ? text('确认删除', 'Confirm delete') : text('删除', 'Delete')
      })
    ] }),
    armedDelete && jsx('p', { className: 'text-[11px] text-destructive',
      children: text(`删除轮播列表「${group?.name || ''}」？此操作不可恢复。`, `Delete “${group?.name || ''}”? This cannot be undone.`) }),
    draft && jsxs('div', { className: 'flex flex-col gap-3 rounded-lg border border-border bg-card p-3', children: [
      jsxs('div', { className: 'grid gap-3 sm:grid-cols-2 xl:grid-cols-4', children: [
        jsxs('label', { className: 'flex flex-col gap-1.5 text-xs text-foreground', children: [
          jsx('span', { className: 'text-muted-foreground', children: text('名称', 'Name') }),
          jsx(Input, { value: draft.name, onChange: event => updateDraft({ name: event.target.value }) })
        ] }),
        jsx(Select, {
          label: text('间隔', 'Interval'),
          value: String(draft.interval),
          onChange: value => updateDraft({ interval: Number(value) }),
          disabled: draft.trigger === 'videoEnd',
          children: INTERVALS.map(minutes => jsx('option', { value: minutes,
            children: text(`${minutes} 分钟`, `${minutes} min`) }, minutes))
        }),
        jsx(Select, {
          label: text('推进', 'Advance'),
          value: draft.trigger,
          onChange: value => updateDraft({ trigger: value }),
          children: [
            jsx('option', { value: 'interval', children: text('按间隔', 'On interval') }),
            jsx('option', { value: 'videoEnd', children: text('视频播完就换', 'When video ends') })
          ]
        }),
        jsx(Select, {
          label: text('顺序', 'Order'),
          value: draft.order,
          onChange: value => updateDraft({ order: value }),
          children: [
            jsx('option', { value: 'sequence', children: text('顺序', 'Sequence') }),
            jsx('option', { value: 'random', children: text('随机', 'Random') })
          ]
        })
      ] }),
      jsxs('div', { className: 'flex flex-wrap items-center gap-2', children: [
        jsx(Input, {
          value: query, onChange: event => setQuery(event.target.value),
          placeholder: text('搜索要加入的壁纸', 'Search wallpapers to add'),
          className: 'max-w-64'
        }),
        jsx('span', { className: 'text-[11px] text-muted-foreground',
          children: text(`已选 ${selectedIds.size} 个`, `${selectedIds.size} selected`) })
      ] }),
      jsx('div', { className: 'max-h-72 overflow-y-auto rounded-md border border-border', children: filteredItems.map(item => {
        const selected = selectedIds.has(item.id)
        return jsxs('label', {
          className: `flex cursor-pointer items-center gap-2 border-b border-border/60 px-2.5 py-2 text-xs last:border-b-0 ${selected ? 'bg-primary/10' : 'hover:bg-accent/30'}`,
          children: [
            jsx('input', { type: 'checkbox', checked: selected, onChange: () => toggleMember(item.id) }),
            jsx('span', { className: 'min-w-0 flex-1 truncate text-foreground', children: item.title }),
            jsx('span', { className: 'text-muted-foreground', children: item.kind })
          ]
        }, item.id)
      }) }),
      jsxs('div', { className: 'flex flex-wrap gap-2', children: [
        jsx(Button, { size: 'sm', onClick: save, children: text('保存', 'Save') }),
        jsx(Button, { size: 'sm', variant: 'outline', onClick: () => setDraft(null),
          children: text('取消', 'Cancel') })
      ] })
    ] }),
    jsxs('div', { className: 'flex flex-wrap items-center justify-between gap-3', children: [
      jsxs('div', { className: 'space-y-0.5', children: [
        jsx('div', { className: 'text-xs text-foreground', children: text('自动轮播', 'Auto rotation') }),
        jsx('div', { className: 'text-[11px] text-muted-foreground', children: !group
          ? text('先新建并选择一个轮播列表', 'Create and select a rotation list first')
          : candidates.length < 2
            ? text('当前列表至少需要 2 个可播放壁纸', 'The selected list needs at least two playable wallpapers')
            : group.trigger === 'videoEnd'
              ? text('当前视频播完就换下一张（不看间隔）', 'Advances when the current video ends')
              : text(`每 ${group.interval} 分钟切换一次`, `Advances every ${group.interval} minutes`) })
      ] }),
      jsx('label', { className: 'flex items-center gap-2 text-xs text-foreground', children: [
        jsx('input', {
          type: 'checkbox', checked: config.rotationEnabled,
          disabled: !group || candidates.length < 2,
          onChange: event => enableRotation(event.target.checked)
        }),
        t('rotationEnabled')
      ] })
    ] }),
    jsxs('div', { className: 'flex flex-wrap items-center gap-2 border-t border-border/60 pt-3', children: [
      jsx('span', { className: 'text-xs text-muted-foreground', children: text('图片轮播', 'Picture slideshow') }),
      jsx('span', { className: 'text-[11px] text-muted-foreground',
        children: text('多图 WE 项目内部的换图间隔；0 = 跟随壁纸', 'Interval inside multi-image WE projects; 0 = follow the wallpaper') }),
      jsx(Select, {
        value: String(config.pictureSlideSeconds || 0),
        onChange: value => controller.changeConfig({ pictureSlideSeconds: Number(value) }),
        children: PICTURE_INTERVALS.map(seconds => jsx('option', { value: seconds,
          children: seconds === 0 ? text('跟随壁纸', 'Follow wallpaper')
            : seconds < 60 ? text(`${seconds} 秒`, `${seconds} s`)
            : text(`${seconds / 60} 分钟`, `${seconds / 60} min`)
        }, seconds))
      })
    ] })
  ] })
}
return { RotationGroupEditor }
})()

// ─── Submodule: Font settings ────────────────────────────────
const { FontSettingsPanel } = (() => {
const BUILTIN_FAMILIES = [
  ['', '跟随 Hermes / Follow Hermes'],
  ['Microsoft YaHei', '微软雅黑 / Microsoft YaHei'],
  ['KaiTi', '楷体 / KaiTi'],
  ['SimSun', '宋体 / SimSun'],
  ['SimHei', '黑体 / SimHei'],
  ['STXingkai', '行楷 / STXingkai'],
  ['monospace', '等宽 / Monospace']
]
const ROLE_LABELS = {
  'markdown-h1': ['标题 1', 'Heading 1'],
  'markdown-h2': ['标题 2', 'Heading 2'],
  'markdown-h3': ['标题 3', 'Heading 3'],
  'markdown-h4': ['标题 4', 'Heading 4'],
  'markdown-base': ['对话正文', 'Conversation body'],
  'markdown-small': ['小字说明', 'Caption'],
  'markdown-code': ['行内代码', 'Inline code'],
  'markdown-code-block': ['代码块', 'Code block'],
  'markdown-table': ['表格', 'Table'],
  'markdown-table-head': ['表头', 'Table header'],
  'xs-13': ['界面小字', 'UI small'],
  'xxs-12': ['界面极小字', 'UI tiny']
}
const COLOR_LABELS = {
  primary: ['正文', 'Primary'],
  secondary: ['次要文字', 'Secondary'],
  tertiary: ['弱化说明', 'Tertiary'],
  caption: ['极小说明', 'Caption'],
  dimmed: ['禁用 / 更弱', 'Dimmed']
}
const isZh = () => String(typeof document !== 'undefined'
  ? (document.documentElement?.lang || navigator.language || '')
  : (typeof navigator !== 'undefined' ? navigator.language : '')).toLowerCase().startsWith('zh')
const text = (zh, en) => isZh() ? zh : en
const setId = () => `font-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`

function pickValues(config) {
  return Object.fromEntries(FONT_SET_KEYS.map(key => [key, config[key]]))
}

function FontSettingsPanel({ config, controller, fontList, loadingFonts, scanFonts }) {
  const [newName, setNewName] = useState('')
  const [setMessage, setSetMessage] = useState('')
  const importRef = useRef(null)
  const activeSet = config.fontSets.find(item => item.id === config.fontSetId) || null

  const families = [
    ...BUILTIN_FAMILIES,
    ...fontList.map(name => [name, name])
  ].filter(([value, label], index, list) =>
    list.findIndex(item => item[0] === value && item[1] === label) === index)

  const fontSetsFromPatch = patch => {
    if (!activeSet) return config.fontSets
    const nextValues = { ...activeSet.values, ...patch }
    return config.fontSets.map(item => item.id === activeSet.id ? { ...item, values: nextValues } : item)
  }

  const changeFont = patch => {
    const valueKeys = Object.keys(patch).filter(key => FONT_SET_KEYS.includes(key))
    controller.changeConfig({
      ...patch,
      ...(valueKeys.length ? { fontSets: fontSetsFromPatch(patch) } : {})
    })
  }

  const applySet = id => {
    const set = config.fontSets.find(item => item.id === id)
    if (!set) {
      controller.changeConfig({ fontSetId: '' })
      return
    }
    controller.changeConfig({ ...set.values, fontSetId: set.id })
  }

  const createSet = () => {
    const set = {
      id: setId(),
      name: newName.trim() || text(`字体集 ${config.fontSets.length + 1}`, `Font set ${config.fontSets.length + 1}`),
      values: pickValues(config)
    }
    controller.changeConfig({ fontSets: [...config.fontSets, set], fontSetId: set.id })
    setNewName('')
    setSetMessage(text('字体集已创建。', 'Font set created.'))
  }

  const renameSet = name => {
    if (!activeSet) return
    controller.changeConfig({
      fontSets: config.fontSets.map(item => item.id === activeSet.id
        ? { ...item, name: name.slice(0, 80), values: pickValues(config) }
        : item)
    })
  }

  const saveSet = () => {
    if (!activeSet) return
    controller.changeConfig({
      fontSets: config.fontSets.map(item => item.id === activeSet.id
        ? { ...item, values: pickValues(config) }
        : item)
    })
    setSetMessage(text('当前字体集已更新。', 'Current font set updated.'))
  }

  const deleteSet = () => {
    if (!activeSet) return
    controller.changeConfig({
      fontSets: config.fontSets.filter(item => item.id !== activeSet.id),
      fontSetId: ''
    })
    setSetMessage(text('字体集已删除。', 'Font set deleted.'))
  }

  const exportSet = () => {
    const payload = {
      format: 'hermes-wallpaper-fontset@1',
      id: activeSet?.id || 'current',
      name: activeSet?.name || text('当前字体', 'Current typography'),
      values: pickValues(config)
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${payload.name.replace(/[\\/:*?"<>|]/g, '-')}.fontset.json`
    anchor.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const importSet = async event => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const payload = JSON.parse(await file.text())
      const values = payload?.values || payload?.settings || payload
      if (!values || typeof values !== 'object') throw new Error('invalid font set')
      const imported = {
        id: setId(),
        name: String(payload?.name || file.name.replace(/\.fontset\.json$/i, '')).slice(0, 80),
        values: Object.fromEntries(FONT_SET_KEYS.filter(key => key in values).map(key => [key, values[key]]))
      }
      for (const key of FONT_SET_KEYS) {
        if (!(key in imported.values)) imported.values[key] = config[key]
      }
      controller.changeConfig({ ...imported.values, fontSets: [...config.fontSets, imported], fontSetId: imported.id })
      setSetMessage(text('字体集已导入。', 'Font set imported.'))
    } catch {
      setSetMessage(text('这个文件不是有效的字体集。', 'This file is not a valid font set.'))
    } finally {
      event.target.value = ''
    }
  }

  const setRoleSize = (role, value) => {
    const themeSize = { ...config.themeSize }
    if (!value) delete themeSize[role]
    else themeSize[role] = Number(value)
    changeFont({ themeSize })
  }

  const setRoleWeight = (role, value) => {
    const themeWeight = { ...config.themeWeight }
    if (!value) delete themeWeight[role]
    else themeWeight[role] = Number(value)
    changeFont({ themeWeight })
  }

  const setRoleFamily = (role, value) => {
    const themeFamily = { ...config.themeFamily }
    if (!value) delete themeFamily[role]
    else themeFamily[role] = value
    changeFont({ themeFamily })
  }

  const setComponent = (id, patch) => {
    const componentFonts = { ...config.componentFonts }
    const current = { ...(componentFonts[id] || {}), ...patch }
    for (const key of Object.keys(current)) {
      if (current[key] === '' || current[key] === 0) delete current[key]
    }
    if (Object.keys(current).length) componentFonts[id] = current
    else delete componentFonts[id]
    changeFont({ componentFonts })
  }

  const setColor = (role, mode, value) => {
    const current = config.themeColors[role] || {
      light: config.accent, dark: config.accent
    }
    const next = { ...current, [mode]: value }
    if (!config.themeDarkSeparate) next.dark = value
    changeFont({ themeColors: { ...config.themeColors, [role]: next } })
  }

  const clearColor = role => {
    const themeColors = { ...config.themeColors }
    delete themeColors[role]
    changeFont({ themeColors })
  }

  const setUiColor = (key, value) => changeFont({ [key]: value })

  return jsxs('div', { className: 'flex flex-col gap-4', children: [
    jsxs('div', { className: 'flex items-center justify-between gap-3 text-xs text-foreground', children: [
      jsx('span', { className: 'font-medium', children: text('启用自定义排版与配色', 'Enable custom typography and colours') }),
      jsx(Switch, {
        checked: config.fontCustom, 'aria-label': text('启用自定义排版', 'Enable custom typography'),
        onCheckedChange: value => controller.changeConfig({ fontCustom: value })
      })
    ] }),

    jsxs('div', { className: 'flex flex-col gap-2 rounded-lg border border-border bg-background/40 p-3', children: [
      jsxs('div', { className: 'flex flex-wrap items-end gap-2', children: [
        jsxs('label', { className: 'flex min-w-48 flex-1 flex-col gap-1.5 text-xs text-foreground', children: [
          jsx('span', { className: 'text-muted-foreground', children: text('字体集', 'Font set') }),
          jsxs('select', {
            value: config.fontSetId,
            onChange: event => applySet(event.target.value),
            className: 'rounded-md border border-border bg-background px-2.5 py-1.5 text-xs',
            children: [
              jsx('option', { value: '', children: text('— 未命名当前设置 —', '— Current unsaved settings —') }),
              ...config.fontSets.map(set => jsx('option', { value: set.id, children: set.name }, set.id))
            ]
          })
        ] }),
        jsx(Button, { size: 'sm', variant: 'outline', onClick: saveSet, disabled: !activeSet,
          children: text('保存到字体集', 'Save to set') }),
        jsx(Button, { size: 'sm', variant: 'outline', onClick: exportSet,
          children: text('导出', 'Export') }),
        jsx(Button, { size: 'sm', variant: 'outline', onClick: () => importRef.current?.click(),
          children: text('导入', 'Import') }),
        jsx('input', { ref: importRef, type: 'file', accept: '.json', className: 'hidden',
          onChange: event => void importSet(event) })
      ] }),
      jsxs('div', { className: 'flex flex-wrap items-end gap-2', children: [
        jsx(Input, {
          value: newName, onChange: event => setNewName(event.target.value),
          placeholder: text('新字体集名称', 'New font set name'),
          className: 'max-w-56'
        }),
        jsx(Button, { size: 'sm', onClick: createSet, children: text('新建字体集', 'New font set') }),
        activeSet && jsx(Input, {
          value: activeSet.name, onChange: event => renameSet(event.target.value),
          className: 'max-w-56', 'aria-label': text('字体集名称', 'Font set name')
        }),
        activeSet && jsx(Button, { size: 'sm', variant: 'outline', onClick: deleteSet,
          children: text('删除字体集', 'Delete font set') })
      ] }),
      setMessage && jsx('p', { className: 'text-[11px] text-muted-foreground', children: setMessage })
    ] }),

    jsxs('label', { className: 'flex flex-col gap-1.5 text-xs text-foreground', children: [
      jsx('span', { className: 'font-medium', children: text('全局字体', 'Global family') }),
      jsx('span', { className: 'text-[11px] text-muted-foreground',
        children: text('作为默认字族；角色与组件仍可单独覆盖。', 'Acts as the default family; roles and components can still override it.') }),
      jsx('select', {
        value: config.globalFamily,
        onChange: event => changeFont({ globalFamily: event.target.value }),
        className: 'rounded-md border border-border bg-background px-2.5 py-1.5 text-xs',
        children: families.map(([value, label]) => jsx('option', { value, children: label }, `${value}:${label}`))
      })
    ] }),
    jsx(Button, {
      size: 'sm', variant: 'outline', className: 'w-fit',
      onClick: () => void scanFonts?.(), disabled: loadingFonts,
      children: loadingFonts ? text('正在扫描系统字体…', 'Scanning system fonts…')
        : text(`扫描系统字体（${fontList.length}）`, `Scan system fonts (${fontList.length})`)
    }),

    jsxs('div', { className: 'space-y-2', children: [
      jsx('div', { className: 'text-xs font-medium text-foreground', children: text('文字颜色角色', 'Text colour roles') }),
      jsxs('label', { className: 'flex items-center justify-between gap-3 text-xs text-foreground', children: [
        jsx('span', { className: 'text-muted-foreground', children: text('深色主题单独设置', 'Separate colours for dark theme') }),
        jsx(Switch, {
          checked: config.themeDarkSeparate,
          onCheckedChange: value => changeFont({ themeDarkSeparate: value })
        })
      ] }),
      jsx('div', { className: 'grid gap-2 sm:grid-cols-2', children: THEME_COLOR_ROLE_IDS.map(role => {
        const pair = config.themeColors[role]
        return jsxs('div', { className: 'flex flex-wrap items-center gap-2 rounded-md border border-border bg-background/50 px-2.5 py-2', children: [
          jsx('span', { className: 'min-w-24 flex-1 text-xs text-foreground', children: text(...COLOR_LABELS[role]) }),
          jsxs('label', { className: 'flex items-center gap-1 text-[11px] text-muted-foreground', children: [
            text('浅', 'Light'),
            jsx('input', {
              type: 'color', value: pair?.light || config.accent,
              onChange: event => setColor(role, 'light', event.target.value),
              className: 'h-7 w-9 rounded border border-border bg-transparent'
            })
          ] }),
          config.themeDarkSeparate && jsxs('label', { className: 'flex items-center gap-1 text-[11px] text-muted-foreground', children: [
            text('深', 'Dark'),
            jsx('input', {
              type: 'color', value: pair?.dark || config.accent,
              onChange: event => setColor(role, 'dark', event.target.value),
              className: 'h-7 w-9 rounded border border-border bg-transparent'
            })
          ] }),
          pair && jsx('button', {
            type: 'button', className: 'text-[11px] text-muted-foreground hover:text-foreground',
            onClick: () => clearColor(role), children: text('清除', 'Clear')
          })
        ] }, role)
      }) })
    ] }),

    jsxs('details', { className: 'rounded-lg border border-border bg-background/40 p-3', children: [
      jsx('summary', { className: 'cursor-pointer text-xs font-medium text-foreground',
        children: text('高级排版角色（字号 / 字重 / 字族）', 'Advanced type roles (size / weight / family)') }),
      jsx('div', { className: 'mt-3 max-h-96 overflow-y-auto rounded-md border border-border', children: TYPE_ROLE_IDS.map(role => {
        const size = config.themeSize[role] || ''
        const weight = config.themeWeight[role] || ''
        const family = config.themeFamily[role] || ''
        return jsxs('div', { className: 'grid gap-2 border-b border-border/70 px-2.5 py-2 text-xs last:border-b-0 sm:grid-cols-[minmax(90px,1fr)_72px_90px_minmax(130px,1fr)]', children: [
          jsx('span', { className: 'flex items-center text-foreground', children: text(...ROLE_LABELS[role]) }),
          jsx('input', {
            type: 'number', min: 8, max: 48, value: size, placeholder: text('字号', 'Size'),
            onChange: event => setRoleSize(role, event.target.value),
            className: 'rounded-md border border-border bg-background px-2 py-1.5 text-xs'
          }),
          jsxs('select', {
            value: String(weight),
            onChange: event => setRoleWeight(role, event.target.value),
            className: 'rounded-md border border-border bg-background px-2 py-1.5 text-xs',
            children: [
              jsx('option', { value: '', children: text('默认', 'Default') }),
              ...[300, 400, 500, 600, 700, 800, 900].map(value =>
                jsx('option', { value, children: value }, value))
            ]
          }),
          jsx('select', {
            value: family,
            onChange: event => setRoleFamily(role, event.target.value),
            className: 'rounded-md border border-border bg-background px-2 py-1.5 text-xs',
            children: families.map(([value, label]) => jsx('option', { value, children: label }, `${role}:${value}`))
          })
        ] }, role)
      }) })
    ] }),

    jsxs('div', { className: 'space-y-2', children: [
      jsx('div', { className: 'text-xs font-medium text-foreground', children: text('组件级字体', 'Component fonts') }),
      jsx('div', { className: 'grid gap-2 sm:grid-cols-2', children: COMPONENT_FONT_TARGETS.map(target => {
        const value = config.componentFonts[target.id] || {}
        return jsxs('div', { className: 'flex flex-col gap-2 rounded-md border border-border bg-background/50 p-2.5', children: [
          jsx('div', { className: 'text-xs text-foreground', children: target.label }),
          jsxs('div', { className: 'grid grid-cols-[64px_82px_1fr] gap-1.5', children: [
            jsx('input', {
              type: 'number', min: 8, max: 48, value: value.size || '', placeholder: text('字号', 'Size'),
              onChange: event => setComponent(target.id, { size: Number(event.target.value) || 0 }),
              className: 'min-w-0 rounded border border-border bg-background px-1.5 py-1 text-[11px]'
            }),
            jsxs('select', {
              value: String(value.weight || ''),
              onChange: event => setComponent(target.id, { weight: Number(event.target.value) || 0 }),
              className: 'min-w-0 rounded border border-border bg-background px-1 py-1 text-[11px]',
              children: [
                jsx('option', { value: '', children: text('默认', 'Default') }),
                ...[300, 400, 500, 600, 700, 800].map(weight =>
                  jsx('option', { value: weight, children: weight }, weight))
              ]
            }),
            jsxs('select', {
              value: value.family || '',
              onChange: event => setComponent(target.id, { family: event.target.value }),
              className: 'min-w-0 rounded border border-border bg-background px-1 py-1 text-[11px]',
              children: families.map(([family, label]) => jsx('option', { value: family, children: label }, `${target.id}:${family}`))
            })
          ] })
        ] }, target.id)
      }) })
    ] }),

    jsxs('div', { className: 'space-y-3 rounded-lg border border-border bg-background/40 p-3', children: [
      jsxs('div', { className: 'flex items-center justify-between gap-3 text-xs text-foreground', children: [
        jsx('span', { className: 'font-medium', children: text('全局 UI 配色', 'Global UI colours') }),
        jsx(Switch, {
          checked: config.uiColorCustom,
          onCheckedChange: value => controller.changeConfig({ uiColorCustom: value })
        })
      ] }),
      config.uiColorCustom && jsxs('div', { className: 'grid gap-2 sm:grid-cols-2 xl:grid-cols-3', children: [
        [['accent', '主色', 'Accent']], [['uiColorSend', '发送键', 'Send button']],
        [['uiColorLink', '链接', 'Links']], [['uiColorFileIcon', '</> 文件图标', '</> file icon']],
        [['uiColorTab', '会话页签', 'Session tabs']], [['uiColorDeepDiving', '深度求索状态', 'Deep-diving status']]
      ].map(([[key, zh, en]]) => jsxs('label', { className: 'flex items-center justify-between gap-2 rounded-md border border-border bg-background/50 px-2.5 py-2 text-xs', children: [
        jsx('span', { children: text(zh, en) }),
        jsx('input', {
          type: 'color',
          value: config[key] || config.accent,
          onChange: event => setUiColor(key, event.target.value),
          className: 'h-7 w-10 rounded border border-border bg-transparent'
        })
      ] }, key)) })
    ] }),

    jsxs('label', { className: 'flex items-center justify-between gap-3 rounded-lg border border-border bg-background/40 px-3 py-2 text-xs text-foreground', children: [
      jsxs('span', { children: [
        jsx('span', { className: 'block font-medium', children: text('输入光标', 'Input caret') }),
        jsx('span', { className: 'block text-[11px] text-muted-foreground',
          children: text('独立于字体总开关，自动 = 跟随 Hermes。', 'Independent of the typography switch; Auto follows Hermes.') })
      ] }),
      jsxs('span', { className: 'flex items-center gap-2', children: [
        jsx('input', {
          type: 'color', value: config.caretColor || '#4f8cff',
          onChange: event => controller.changeConfig({ caretColor: event.target.value }),
          className: 'h-7 w-10 rounded border border-border bg-transparent'
        }),
        config.caretColor && jsx('button', {
          type: 'button', className: 'text-[11px] text-muted-foreground hover:text-foreground',
          onClick: () => controller.changeConfig({ caretColor: '' }), children: text('自动', 'Auto')
        })
      ] })
    ] })
  ] })
}
return { FontSettingsPanel }
})()

// ─── Submodule: Appearance Settings Panel ─────────────────────
const { AppearanceSettingsPanel } = (() => {
const isZh = () => String(typeof document !== 'undefined'
  ? (document.documentElement?.lang || navigator.language || '')
  : (typeof navigator !== 'undefined' ? navigator.language : '')).toLowerCase().startsWith('zh')
const text = (zh, en) => isZh() ? zh : en
const TABS = [
  ['library', '壁纸库', 'Library'],
  ['appearance', '外观', 'Appearance'],
  ['effects', '效果', 'Effects'],
  ['audio', '声音', 'Audio'],
  ['advanced', '高级', 'Advanced'],
  ['extensions', '扩展', 'Extensions'],
  ['about', '关于', 'About']
]
const EXCLUDED_PRESET_KEYS = new Set([
  'schemaVersion', 'wallpaperSource', 'weSelection', 'hiddenWallpaperIds',
  'userProps', 'rotationGroupId', 'fontSetId', 'weRoots'
])
const RESET_KEYS = {
  library: [
    'wallpaperTransition', 'wallpaperTransitionDir', 'wallpaperTransitionSpeed',
    'rotationEnabled', 'rotationGroups', 'rotationSeeded', 'pictureSlideSeconds',
    'contentRatingFilter', 'typeFilter', 'folderFilter', 'orientationFilter'
  ],
  appearance: [
    'maskOcclusion', 'wallpaperBlur', 'wallpaperOpacity', 'backgroundBrightness',
    'backgroundContrast', 'backgroundSaturate', 'wallpaperFlip', 'layerPositionX',
    'layerPositionY', 'layerScale', 'panelGlass', 'bubbleOpacity', 'composerFrost',
    'surfaceFrost', 'glassSaturation', 'glassBorder', 'glassHighlight', 'glassColor',
    'glassDarkSeparate', 'glassFidelity', 'chatGlassFidelity', 'settingsWindowTransparency',
    'settingsWindowBlur', 'sidebarGlass', 'sidebarFollowGlobal', 'sidebarBlur', 'sidebarAlpha',
    'sidebarColor', 'leftSidebarGlass', 'leftSidebarCornerRadius', 'leftSidebarSquareTL',
    'leftSidebarSquareTR', 'leftSidebarSquareBR', 'leftSidebarSquareBL', 'rightSidebarCornerRadius',
    'rightSidebarSquareTL', 'rightSidebarSquareTR', 'rightSidebarSquareBR', 'rightSidebarSquareBL',
    'titlebarGlass', 'fontCustom', 'themeColors', 'themeDarkSeparate', 'themeSize', 'themeWeight',
    'themeFamily', 'globalFamily', 'componentFonts', 'accent', 'uiColorCustom', 'uiColorSend',
    'uiColorLink', 'uiColorFileIcon', 'uiColorTab', 'uiColorDeepDiving', 'caretColor', 'themeFollow'
  ],
  effects: [
    'sceneLive', 'sceneLiveFps', 'sceneAutoQuality', 'sceneRenderDpr', 'sceneVideoTexScale',
    'liveBootDelay', 'videoPlaybackRate'
  ],
  audio: ['wallpaperSound', 'wallpaperVolume'],
  advanced: ['pickerLayout', 'pauseOnHidden', 'pauseOnBlur', 'pauseOnBattery'],
  extensions: [
    'fxEnabled', 'fxClick', 'fxClickStyle', 'fxClickSize', 'fxClickGlow', 'fxTrail',
    'fxTrailStyle', 'fxTrailLength', 'fxTrailWidth', 'fxTrailGlow', 'fxOpacity', 'fxBlend',
    'fxColorMode', 'fxColor', 'parallaxEnabled', 'parallaxBg', 'parallaxUi', 'parallaxPlugin',
    'parallaxUiChatDepth', 'parallaxUiComposerDepth', 'parallaxUiSidebarDepth',
    'parallaxUiBubbleDepth', 'parallaxPluginDepths', 'parallaxSmooth'
  ]
}

const section = (title, description, children) => jsxs('section', {
  'data-hermes-skins-surface': '',
  className: 'flex flex-col gap-4 rounded-xl border border-border bg-card p-4',
  children: [
    jsxs('div', { className: 'space-y-1', children: [
      jsx('h3', { className: 'text-sm font-semibold text-foreground', children: title }),
      description && jsx('p', { className: 'text-[11px] leading-5 text-muted-foreground', children: description })
    ] }),
    ...children.filter(Boolean)
  ]
})

function downloadJson(name, payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = name
  anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function bytes(value) {
  const number = Number(value) || 0
  if (number < 1024) return `${number} B`
  if (number < 1024 * 1024) return `${(number / 1024).toFixed(1)} KB`
  if (number < 1024 * 1024 * 1024) return `${(number / 1024 / 1024).toFixed(1)} MB`
  return `${(number / 1024 / 1024 / 1024).toFixed(2)} GB`
}

function AppearanceSettingsPanel({
  store, controller, openScene, loadFonts, loadUploads, importUploads, importUrl,
  importBing, loadDiagnostics, clearSceneCache, loadNowPlaying
}) {
  const t = usePluginI18n('hermes-skins')
  const config = useValue(store.$config)
  const [tab, setTab] = useState('library')
  const [sourceDraft, setSourceDraft] = useState(config.wallpaperSource)
  const [presetMessage, setPresetMessage] = useState('')
  const [fontList, setFontList] = useState([])
  const [fontLoading, setFontLoading] = useState(false)
  const [diagnostics, setDiagnostics] = useState(null)
  const [diagnosticsLoading, setDiagnosticsLoading] = useState(false)
  const [diagnosticsError, setDiagnosticsError] = useState('')
  const [cacheArmed, setCacheArmed] = useState(false)
  const [cacheMessage, setCacheMessage] = useState('')
  const [nowPlaying, setNowPlaying] = useState(null)
  const [discoveredSlots, setDiscoveredSlots] = useState([])

  useEffect(() => setSourceDraft(config.wallpaperSource), [config.wallpaperSource])

  useEffect(() => {
    if (!loadFonts) return
    let cancelled = false
    setFontLoading(true)
    loadFonts().then(result => {
      if (!cancelled && Array.isArray(result?.fonts)) setFontList(result.fonts)
    }).catch(() => {}).finally(() => { if (!cancelled) setFontLoading(false) })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (tab !== 'advanced' || diagnostics || !loadDiagnostics) return
    void refreshDiagnostics()
  }, [tab])

  useEffect(() => {
    if (tab !== 'audio' || !loadNowPlaying) return
    let cancelled = false
    const tick = () => {
      loadNowPlaying().then(result => { if (!cancelled) setNowPlaying(result) }).catch(() => {
        if (!cancelled) setNowPlaying({ ok: false })
      })
    }
    tick()
    const timer = setInterval(tick, 5000)
    return () => { cancelled = true; clearInterval(timer) }
  }, [tab])

  useEffect(() => {
    if (tab !== 'extensions' || !config.parallaxPlugin) return
    const skip = new Set(['root', 'main', 'rightbar', 'conversation.view', 'sidebar', 'main.conversation'])
    const slots = [...document.querySelectorAll('[data-slot]')]
      .map(element => element.getAttribute('data-slot') || '')
      .filter(slot => slot && !skip.has(slot) && !slot.startsWith('settings.') &&
        !slot.startsWith('plugins.') && !slot.startsWith('shell.'))
    setDiscoveredSlots([...new Set(slots)].sort())
  }, [tab, config.parallaxPlugin])

  const customSourceValid = !sourceDraft || Boolean(normalizeMediaSource(sourceDraft, config.wallpaperType))
  const commitSource = () => {
    if (customSourceValid && sourceDraft !== config.wallpaperSource) {
      controller.changeConfig({ wallpaperSource: sourceDraft, weSelection: null })
    }
  }

  const slider = (key, label, description, options = {}) => {
    const range = PARAM_RANGES[key]
    if (!range) return null
    const value = Number(config[key]) || 0
    return jsxs('label', { className: 'flex flex-col gap-1.5', children: [
      jsxs('span', { className: 'flex justify-between gap-3 text-xs text-foreground', children: [
        jsx('span', { children: label }),
        jsx('span', { className: 'font-mono text-muted-foreground', children: `${value}${range.unit}` })
      ] }),
      jsx('input', {
        type: 'range', min: range.min, max: range.max, step: options.step || 1, value,
        onChange: event => controller.scheduleConfig({ [key]: Number(event.target.value) }),
        onPointerUp: () => controller.flushConfig(),
        onKeyUp: () => controller.flushConfig(),
        onBlur: () => controller.flushConfig(),
        className: 'w-full accent-primary'
      }),
      description && jsx('span', { className: 'text-[11px] leading-4 text-muted-foreground', children: description })
    ] })
  }

  const toggle = (key, label, description, disabled = false) => jsxs('label', {
    className: `flex items-start justify-between gap-4 text-xs text-foreground ${disabled ? 'opacity-50' : ''}`,
    children: [
      jsxs('span', { className: 'min-w-0 space-y-0.5', children: [
        jsx('span', { className: 'block font-medium', children: label }),
        description && jsx('span', { className: 'block text-[11px] leading-4 text-muted-foreground', children: description })
      ] }),
      jsx(Switch, {
        checked: Boolean(config[key]), disabled, 'aria-label': label,
        onCheckedChange: value => controller.changeConfig({ [key]: value })
      })
    ]
  })

  const select = (key, label, options, description) => jsxs('label', {
    className: 'flex flex-col gap-1.5 text-xs text-foreground',
    children: [
      jsxs('span', { className: 'space-y-0.5', children: [
        jsx('span', { className: 'block font-medium', children: label }),
        description && jsx('span', { className: 'block text-[11px] text-muted-foreground', children: description })
      ] }),
      jsx('select', {
        value: String(config[key]),
        onChange: event => controller.changeConfig({ [key]: typeof config[key] === 'number'
          ? Number(event.target.value) : event.target.value }),
        className: 'rounded-md border border-border bg-background px-2.5 py-1.5 text-xs',
        children: options.map(option => jsx('option', { value: option[0], children: option[1] }, option[0]))
      })
    ]
  })

  const currentTitle = config.weSelection?.title ||
    config.wallpaperSource.split(/[\\/]/).filter(Boolean).at(-1) || ''

  const exportPreset = () => {
    const settings = Object.fromEntries(Object.keys(DEFAULT_CONFIG)
      .filter(key => !EXCLUDED_PRESET_KEYS.has(key))
      .map(key => [key, config[key]]))
    downloadJson('hermes-wallpaper-preset.json', {
      format: 'hermes-wallpaper-preset@2',
      version: 2,
      settings
    })
    setPresetMessage(t('presetExported'))
  }

  const importPreset = async event => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const payload = JSON.parse(await file.text())
      const settings = payload?.settings ?? payload
      const patch = Object.fromEntries(Object.keys(DEFAULT_CONFIG).filter(key => key in (settings || {}))
        .map(key => [key, settings[key]]))
      if (!Object.keys(patch).length) throw new Error('empty preset')
      controller.changeConfig(patch)
      setPresetMessage(t('presetImported'))
    } catch {
      setPresetMessage(t('presetInvalid'))
    } finally {
      event.target.value = ''
    }
  }

  const resetTab = () => {
    const keys = RESET_KEYS[tab] || []
    if (!keys.length) return
    const patch = Object.fromEntries(keys.filter(key => key in DEFAULT_CONFIG)
      .map(key => [key, DEFAULT_CONFIG[key]]))
    controller.changeConfig(patch)
  }

  const refreshDiagnostics = async () => {
    if (!loadDiagnostics || diagnosticsLoading) return
    setDiagnosticsLoading(true)
    setDiagnosticsError('')
    try {
      setDiagnostics(await loadDiagnostics())
    } catch (cause) {
      setDiagnosticsError(String(cause?.message || cause))
    } finally {
      setDiagnosticsLoading(false)
    }
  }

  const clearCache = async () => {
    if (!cacheArmed) {
      setCacheArmed(true)
      return
    }
    setCacheArmed(false)
    setCacheMessage('')
    try {
      const result = await clearSceneCache?.()
      if (!result?.ok) throw new Error(result?.error || 'Cache cleanup failed')
      setCacheMessage(text('场景缓存已清理。', 'Scene cache cleared.'))
      setDiagnostics(null)
      await refreshDiagnostics()
    } catch (cause) {
      setCacheMessage(String(cause?.message || cause))
    }
  }

  const scanFonts = async () => {
    if (!loadFonts || fontLoading) return
    setFontLoading(true)
    try {
      const result = await loadFonts()
      if (Array.isArray(result?.fonts)) setFontList(result.fonts)
    } catch {
      setFontList([])
    } finally {
      setFontLoading(false)
    }
  }

  const wallpaperProperties = Array.isArray(config.weSelection?.properties)
    ? config.weSelection.properties.filter(property => !property.hidden) : []
  const wallpaperOverrides = config.userProps?.[config.weSelection?.id] || {}

  const wallpaperColor = value => {
    if (typeof value !== 'string') return '#4f8cff'
    if (/^#[0-9a-f]{6}$/i.test(value)) return value
    const parts = value.trim().split(/\s+/).map(Number)
    if (parts.length >= 3 && parts.every(Number.isFinite)) {
      const max = Math.max(...parts)
      return `#${parts.slice(0, 3).map(channel => Math.max(0, Math.min(255,
        Math.round((max <= 1 ? channel * 255 : channel))
      )).toString(16).padStart(2, '0')).join('')}`
    }
    return '#4f8cff'
  }

  const wallpaperColorWire = value => {
    const match = /^#([0-9a-f]{6})$/i.exec(value || '')
    if (!match) return value
    const number = parseInt(match[1], 16)
    return [(number >> 16) & 255, (number >> 8) & 255, number & 255]
      .map(channel => (channel / 255).toFixed(6)).join(' ')
  }

  const setWallpaperProperty = (name, value) => {
    const id = config.weSelection?.id
    if (!id) return
    const current = { ...(config.userProps?.[id] || {}) }
    if (value === undefined) delete current[name]
    else current[name] = value
    const userProps = { ...(config.userProps || {}) }
    if (Object.keys(current).length) userProps[id] = current
    else delete userProps[id]
    controller.changeConfig({ userProps })
  }

  const resetWallpaperProperties = () => {
    const id = config.weSelection?.id
    if (!id) return
    const userProps = { ...(config.userProps || {}) }
    delete userProps[id]
    controller.changeConfig({ userProps })
  }

  const tabBar = jsx('div', {
    role: 'tablist',
    className: 'sticky top-0 z-10 flex flex-wrap gap-1 rounded-xl border border-border bg-card/95 p-1.5 backdrop-blur',
    children: TABS.map(([id, zh, en]) => jsx('button', {
      type: 'button', role: 'tab', 'aria-selected': tab === id,
      onClick: () => setTab(id),
      className: `rounded-lg px-3 py-1.5 text-xs transition ${tab === id
        ? 'bg-primary text-primary-foreground'
        : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'}`,
      children: text(zh, en)
    }, id))
  })

  const tabFooter = RESET_KEYS[tab] && jsx('div', {
    className: 'flex items-center justify-between gap-3 rounded-lg border border-dashed border-border px-3 py-2',
    children: [
      jsx('span', { className: 'text-[11px] text-muted-foreground',
        children: text('只重置本页参数，不改当前壁纸或隐藏名单。', 'Resets this tab only; the current wallpaper and hidden list stay untouched.') }),
      jsx(Button, { size: 'sm', variant: 'outline', onClick: resetTab,
        children: text('重置本页', 'Reset tab') })
    ]
  })

  let content = null
  if (tab === 'library') {
    const propertiesSection = wallpaperProperties.length > 0 && section(
      text('壁纸属性', 'Wallpaper properties'),
      text('由壁纸作者声明的 Scene / Web 属性；修改会即时传给 WebWallGL 并保存在本机。', 'Scene / Web properties declared by the wallpaper author; changes are sent to WebWallGL immediately and stored locally.'),
      [
        jsxs('div', { className: 'flex flex-col gap-3', children: wallpaperProperties.map(property => {
          const overridden = Object.prototype.hasOwnProperty.call(wallpaperOverrides, property.name)
          const value = overridden ? wallpaperOverrides[property.name] : property.value
          const label = property.text || property.name
          const reset = overridden && jsx('button', {
            type: 'button', className: 'text-[11px] text-muted-foreground hover:text-foreground',
            onClick: () => setWallpaperProperty(property.name, undefined),
            children: text('恢复默认', 'Reset')
          })
          if (property.type === 'text' || property.type === 'group') {
            return jsxs('div', { className: 'border-t border-border/60 pt-2 first:border-t-0 first:pt-0', children: [
              jsx('div', { className: 'text-xs font-medium text-foreground', children: label }),
              property.type === 'text' && jsx('div', { className: 'mt-0.5 text-[11px] text-muted-foreground',
                children: property.name })
            ] }, property.name)
          }
          if (property.type === 'bool') {
            return jsx('div', { className: 'flex items-center justify-between gap-3', children: [
              jsx('span', { className: 'text-xs text-foreground', children: label }),
              jsxs('div', { className: 'flex items-center gap-2', children: [
                reset,
                jsx('input', {
                  type: 'checkbox', checked: Boolean(value),
                  onChange: event => setWallpaperProperty(property.name, event.target.checked)
                })
              ] })
            ] }, property.name)
          }
          if (property.type === 'slider') {
            const min = Number.isFinite(Number(property.min)) ? Number(property.min) : 0
            const max = Number.isFinite(Number(property.max)) ? Number(property.max) : 1
            const step = Number.isFinite(Number(property.step)) ? Number(property.step) : 0.01
            return jsxs('label', { className: 'flex flex-col gap-1.5 text-xs text-foreground', children: [
              jsxs('span', { className: 'flex items-center justify-between gap-2', children: [
                jsx('span', { children: label }),
                jsxs('span', { className: 'flex items-center gap-2', children: [
                  jsx('span', { className: 'font-mono text-muted-foreground', children: String(value ?? '') }),
                  reset
                ] })
              ] }),
              jsx('input', {
                type: 'range', min, max, step, value: Number(value) || 0,
                onChange: event => setWallpaperProperty(property.name, Number(event.target.value)),
                onPointerUp: () => controller.flushConfig(),
                className: 'w-full accent-primary'
              })
            ] }, property.name)
          }
          if (property.type === 'combo' && property.options?.length) {
            return jsxs('label', { className: 'flex items-center justify-between gap-3 text-xs text-foreground', children: [
              jsx('span', { children: label }),
              jsxs('span', { className: 'flex items-center gap-2', children: [
                reset,
                jsxs('select', {
                  value: String(value ?? ''),
                  onChange: event => {
                    const option = property.options.find(item => String(item.value) === event.target.value)
                    setWallpaperProperty(property.name, option ? option.value : event.target.value)
                  },
                  className: 'max-w-56 rounded border border-border bg-background px-2 py-1 text-xs',
                  children: property.options.map((option, index) => jsx('option', {
                    value: String(option.value ?? ''), children: option.label || String(option.value ?? '')
                  }, `${property.name}:${index}`))
                })
              ] })
            ] }, property.name)
          }
          if (property.type === 'color') {
            return jsxs('label', { className: 'flex items-center justify-between gap-3 text-xs text-foreground', children: [
              jsx('span', { children: label }),
              jsxs('span', { className: 'flex items-center gap-2', children: [
                reset,
                jsx('input', {
                  type: 'color', value: wallpaperColor(value),
                  onChange: event => setWallpaperProperty(property.name, wallpaperColorWire(event.target.value)),
                  className: 'h-7 w-10 rounded border border-border bg-transparent'
                })
              ] })
            ] }, property.name)
          }
          return jsxs('label', { className: 'flex flex-col gap-1.5 text-xs text-foreground', children: [
            jsxs('span', { className: 'flex items-center justify-between gap-2', children: [
              jsx('span', { children: label }),
              reset
            ] }),
            jsx(Input, {
              value: typeof value === 'string' ? value : value == null ? '' : String(value),
              onChange: event => setWallpaperProperty(property.name, event.target.value),
              placeholder: property.type === 'file' || property.type === 'directory'
                ? text('相对壁纸目录的路径', 'Path relative to the wallpaper directory')
                : ''
            })
          ] }, property.name)
        }) }),
        jsx('div', { className: 'flex justify-end', children: jsx(Button, {
          size: 'sm', variant: 'outline', onClick: resetWallpaperProperties,
          children: text('全部恢复默认', 'Reset all')
        }) })
      ]
    )
    content = [
      section(t('wallpaperEngineTitle'), t('wallpaperEngineDesc'), [
        jsxs('div', { className: 'flex items-center justify-between gap-4', children: [
          jsxs('div', { className: 'min-w-0 space-y-1', children: [
            jsx('p', { className: 'truncate text-sm font-medium text-foreground',
              children: currentTitle || t('selectWallpaperFirst') }),
            jsx('p', { className: 'text-[11px] text-muted-foreground', children: t('enableWallpaperDesc') })
          ] }),
          jsx(Switch, {
            checked: Boolean(config.wallpaperSource && config.wallpaperEnabled),
            disabled: !config.wallpaperSource,
            'aria-label': t('enableWallpaper'),
            onCheckedChange: value => controller.changeConfig({ wallpaperEnabled: value })
          })
        ] }),
        select('wallpaperType', t('wallpaperType'), WALLPAPER_TYPES.map(type =>
          [type, type === 'image' ? t('wallpaperTypeImage')
            : type === 'video' ? t('wallpaperTypeVideo')
            : type === 'scene' ? t('weTypeScene') : t('weTypeWeb')])),
        jsxs('label', { className: 'flex flex-col gap-2 text-xs text-foreground', children: [
          t('wallpaperSource'),
          jsx(Input, {
            value: sourceDraft,
            onChange: event => setSourceDraft(event.target.value),
            onBlur: commitSource,
            onKeyDown: event => { if (event.key === 'Enter') commitSource() },
            placeholder: t('wallpaperSourcePlaceholder'),
            'aria-invalid': !customSourceValid
          }),
          jsx('span', { className: 'text-[11px] text-muted-foreground', children: t('sourceCommitHint') }),
          !customSourceValid && jsx('span', { className: 'text-destructive', children: t('invalidWallpaperSource') })
        ] }),
        jsxs('div', { className: 'grid gap-3 sm:grid-cols-2', children: [
          select('wallpaperMode', t('wallpaperMode'), [
            ['live', t('wallpaperModeLive')], ['frame', t('wallpaperModeFrame')]
          ]),
          select('wallpaperFit', t('wallpaperFit'), [
            ['cover', t('wallpaperFitCover')], ['contain', t('wallpaperFitContain')],
            ['center', text('居中原始尺寸', 'Center native size')], ['fill', t('wallpaperFitFill')]
          ])
        ] })
      ]),
      propertiesSection,
      section(text('切换过场', 'Switch transition'), text('手动选壁纸与自动轮播共用同一套过场。', 'Manual picks and auto rotation share the same transition recipe.'), [
        jsxs('div', { className: 'grid gap-3 sm:grid-cols-3', children: [
          select('wallpaperTransition', text('过场', 'Transition'), TRANSITION_VALUES.map(value => [value, {
            cut: text('硬切', 'Cut'), fade: text('交叉淡化', 'Crossfade'),
            push: text('推移', 'Push'), wipe: text('擦除', 'Wipe'),
            iris: text('光圈', 'Iris'), zoom: text('缩放', 'Zoom'),
            bars: text('条带', 'Bars')
          }[value]])),
          select('wallpaperTransitionDir', text('方向', 'Direction'), TRANSITION_DIRECTIONS.map(value => [value, {
            left: text('左', 'Left'), right: text('右', 'Right'),
            up: text('上', 'Up'), down: text('下', 'Down')
          }[value]])),
          select('wallpaperTransitionSpeed', text('速度', 'Speed'), TRANSITION_SPEEDS.map(value => [value, {
            fast: text('快', 'Fast'), normal: text('标准', 'Normal'), slow: text('慢', 'Slow')
          }[value]]))
        ] })
      ]),
      section(text('自动轮播', 'Auto rotation'), text('每个列表有自己的壁纸集合、间隔、顺序和推进方式。', 'Each list has its own wallpaper set, interval, order and trigger.'), [
        jsx(RotationGroupEditor, { store, controller })
      ]),
      jsx(WallpaperEnginePanel, {
        store, controller, openScene, loadUploads, importUploads, importUrl, importBing
      })
    ]
  } else if (tab === 'appearance') {
    content = [
      section(text('主题与玻璃颜色', 'Theme and glass colours'), text('Hermes 原生主题仍在设置中管理；这里只控制插件外观。', 'Hermes still owns the native theme; this controls the plugin appearance.'), [
        toggle('themeFollow', text('主题随壁纸', 'Follow wallpaper theme'),
          text('从当前壁纸取样主色并更新 Hermes 强调色。', 'Samples the current wallpaper and updates the Hermes accent colour.')),
        jsxs('div', { className: 'grid gap-3 sm:grid-cols-3', children: [
          jsxs('label', { className: 'flex items-center justify-between gap-2 text-xs text-foreground', children: [
            jsx('span', { children: text('强调色', 'Accent colour') }),
            jsx('input', {
              type: 'color', value: config.accent,
              onChange: event => controller.changeConfig({ accent: event.target.value }),
              className: 'h-7 w-10 rounded border border-border bg-transparent'
            })
          ] }),
          jsxs('label', { className: 'flex items-center justify-between gap-2 text-xs text-foreground', children: [
            jsx('span', { children: text('浅色玻璃色', 'Light glass colour') }),
            jsx('input', {
              type: 'color', value: config.glassColor.light,
              onChange: event => controller.changeConfig({
                glassColor: { ...config.glassColor, light: event.target.value }
              }),
              className: 'h-7 w-10 rounded border border-border bg-transparent'
            })
          ] }),
          jsxs('label', { className: 'flex items-center justify-between gap-2 text-xs text-foreground', children: [
            jsx('span', { children: text('深色玻璃色', 'Dark glass colour') }),
            jsx('input', {
              type: 'color', value: config.glassColor.dark,
              disabled: !config.glassDarkSeparate,
              onChange: event => controller.changeConfig({
                glassColor: { ...config.glassColor, dark: event.target.value }
              }),
              className: 'h-7 w-10 rounded border border-border bg-transparent disabled:opacity-40'
            })
          ] })
        ] }),
        toggle('glassDarkSeparate', text('深色主题单独设置玻璃色', 'Separate dark-theme glass colour'))
      ]),
      section(text('壁纸画面', 'Wallpaper image'), text('亮度、对比度、饱和度、模糊、遮罩与取景。', 'Brightness, contrast, saturation, blur, veil and framing.'), [
        jsxs('div', { className: 'grid gap-4 sm:grid-cols-2', children: [
          slider('maskOcclusion', text('暗化遮罩', 'Wallpaper veil'), text('100% 完全遮住壁纸。', '100% fully hides the wallpaper.')),
          slider('wallpaperBlur', t('wallpaperBlur'), t('wallpaperBlurDesc')),
          slider('wallpaperOpacity', t('wallpaperOpacity'), t('wallpaperOpacityDesc')),
          slider('backgroundBrightness', text('亮度', 'Brightness'), text('100% = 原图。', '100% = untouched.')),
          slider('backgroundContrast', text('对比度', 'Contrast'), text('100% = 原图。', '100% = untouched.')),
          slider('backgroundSaturate', text('饱和度', 'Saturation'), text('0% = 黑白。', '0% = greyscale.')),
          slider('layerPositionX', text('水平位置', 'Horizontal position')),
          slider('layerPositionY', text('垂直位置', 'Vertical position')),
          slider('layerScale', text('画面缩放', 'Layer scale'))
        ] }),
        toggle('wallpaperFlip', text('水平镜像', 'Horizontal mirror'))
      ]),
      section(t('sectionGlass'), t('sectionGlassDesc'), [
        jsxs('div', { className: 'grid gap-4 sm:grid-cols-2', children: [
          slider('panelGlass', t('panelGlass'), t('panelGlassDesc')),
          slider('bubbleOpacity', t('bubbleOpacity'), t('bubbleOpacityDesc')),
          slider('composerFrost', t('composerFrost'), t('composerFrostDesc')),
          slider('surfaceFrost', t('surfaceFrost'), t('surfaceFrostDesc')),
          slider('glassSaturation', t('glassSaturation'), t('glassSaturationDesc')),
          slider('glassBorder', t('glassBorder'), t('glassBorderDesc')),
          slider('glassFidelity', text('玻璃保真度', 'Glass fidelity'), text('越低越保留原始玻璃色，可读性下限越弱。', 'Lower values keep more of the raw glass colour and relax readability clamping.')),
          slider('chatGlassFidelity', text('对话栏玻璃保真度', 'Conversation glass fidelity')),
          slider('settingsWindowTransparency', text('设置窗透光度', 'Settings-window transparency')),
          slider('settingsWindowBlur', text('设置窗模糊', 'Settings-window blur'))
        ] }),
        toggle('glassHighlight', t('glassHighlight'))
      ]),
      section(text('侧栏与标题栏', 'Sidebars and titlebar'), text('这些是 Hermes 原始结构面上的液态玻璃与圆角。', 'Liquid glass and corners on Hermes structural surfaces.'), [
        toggle('leftSidebarGlass', text('左侧栏原生玻璃', 'Native left-sidebar glass')),
        toggle('titlebarGlass', text('标题栏玻璃', 'Titlebar glass')),
        toggle('sidebarGlass', text('侧栏玻璃', 'Sidebar glass')),
        toggle('sidebarFollowGlobal', text('侧栏跟随全局玻璃参数', 'Sidebar follows global glass settings')),
        !config.sidebarFollowGlobal && jsxs('div', { className: 'grid gap-4 sm:grid-cols-2', children: [
          slider('sidebarBlur', text('侧栏模糊', 'Sidebar blur')),
          slider('sidebarAlpha', text('侧栏透明度', 'Sidebar transparency')),
          jsxs('label', { className: 'flex items-center justify-between gap-2 text-xs text-foreground', children: [
            jsx('span', { children: text('侧栏玻璃色', 'Sidebar glass colour') }),
            jsx('input', {
              type: 'color', value: config.sidebarColor,
              onChange: event => controller.changeConfig({ sidebarColor: event.target.value }),
              className: 'h-7 w-10 rounded border border-border bg-transparent'
            })
          ] })
        ] }),
        jsxs('div', { className: 'grid gap-3 sm:grid-cols-2', children: [
          select('leftSidebarCornerRadius', text('左侧栏圆角', 'Left-sidebar corners'), [
            ['native', text('跟随原生', 'Native')], ['6', '6px'], ['12', '12px'], ['20', '20px']
          ]),
          select('rightSidebarCornerRadius', text('右侧栏圆角', 'Right-sidebar corners'), [
            ['native', text('跟随原生', 'Native')], ['6', '6px'], ['12', '12px'], ['20', '20px']
          ])
        ] }),
        jsxs('div', { className: 'grid gap-2 sm:grid-cols-2', children: [
          toggle('leftSidebarSquareTL', text('左栏左上直角', 'Left top square')),
          toggle('leftSidebarSquareTR', text('左栏右上直角', 'Left top-right square')),
          toggle('leftSidebarSquareBR', text('左栏右下直角', 'Left bottom-right square')),
          toggle('leftSidebarSquareBL', text('左栏左下直角', 'Left bottom-left square')),
          toggle('rightSidebarSquareTL', text('右栏左上直角', 'Right top-left square')),
          toggle('rightSidebarSquareTR', text('右栏右上直角', 'Right top-right square')),
          toggle('rightSidebarSquareBR', text('右栏右下直角', 'Right bottom-right square')),
          toggle('rightSidebarSquareBL', text('右栏左下直角', 'Right bottom-left square'))
        ] })
      ]),
      section(t('sectionTypography'), t('sectionTypographyDesc'), [
        jsx(FontSettingsPanel, {
          config, controller, fontList, loadingFonts: fontLoading, scanFonts
        })
      ])
    ]
  } else if (tab === 'effects') {
    content = [
      section(text('场景实时渲染', 'Live scene rendering'), t('sectionPlaybackDesc'), [
        toggle('sceneLive', t('sceneLive'), t('sceneLiveDesc')),
        jsxs('div', { className: 'grid gap-3 sm:grid-cols-2', children: [
          select('sceneLiveFps', t('sceneLiveFps'), [
            ['15', '15 fps'], ['30', '30 fps'], ['60', '60 fps']
          ]),
          select('sceneRenderDpr', t('sceneRenderDpr'), [
            ['0', t('sceneRenderDprAuto')], ['1', '1x'], ['1.5', '1.5x'], ['2', '2x']
          ]),
          select('sceneVideoTexScale', t('sceneVideoTexScale'), [
            ['0', t('sceneVideoTexScaleAuto')], ['0.5', t('sceneVideoTexScaleHalf')],
            ['1', t('sceneVideoTexScaleFull')]
          ]),
          select('liveBootDelay', text('重启恢复等待', 'Restore wait'), [
            [0, text('不等待', 'No wait')], [1, '1 s'], [3, '3 s'],
            [5, '5 s'], [10, '10 s'], [30, '30 s']
          ], text('只在重启恢复上次壁纸时生效。', 'Only applies when restoring the previous wallpaper after a restart.'))
        ] }),
        toggle('sceneAutoQuality', t('sceneAutoQuality'), t('sceneAutoQualityDesc'))
      ]),
      section(text('视频播放', 'Video playback'), text('视频壁纸与场景内嵌视频共用基础播放参数。', 'Shared by video wallpapers and embedded scene video.'), [
        select('videoPlaybackRate', t('videoPlaybackRate'), [
          [0.5, '0.5x'], [0.75, '0.75x'], [1, '1x'], [1.25, '1.25x'], [1.5, '1.5x'], [2, '2x']
        ])
      ]),
      section(text('画面取景', 'Framing'), text('与 WE 的自由取景同一量程：位置 50 = 居中，缩放 100% = 原始大小。', 'Matches Wallpaper Engine free framing: 50 = centre, 100% = original size.'), [
        jsxs('div', { className: 'grid gap-4 sm:grid-cols-3', children: [
          slider('layerPositionX', text('水平位置', 'Horizontal position')),
          slider('layerPositionY', text('垂直位置', 'Vertical position')),
          slider('layerScale', text('缩放', 'Scale'))
        ] }),
        toggle('wallpaperFlip', text('水平镜像', 'Horizontal mirror'))
      ])
    ]
  } else if (tab === 'audio') {
    content = [
      section(text('声音', 'Audio'), t('sectionPlaybackDesc'), [
        toggle('wallpaperSound', t('wallpaperSound'),
          text('视频壁纸、场景内嵌 MP4 与场景包内音频共用；关闭 = 静音但保留音量数值。', 'Shared by video wallpapers, embedded scene video and scene audio; off keeps the volume value.')),
        slider('wallpaperVolume', t('wallpaperVolume'), t('wallpaperVolumeDesc'))
      ]),
      section(text('系统媒体信息', 'System media integration'), text('与上游一致，媒体集成和系统音频反应为常开；宿主不支持时自动降级。', 'Media integration and system audio response are always on, matching upstream; unsupported hosts fall back automatically.'), [
        jsxs('div', { className: 'rounded-lg border border-border bg-background/50 p-3 text-xs', children: [
          jsxs('div', { className: 'flex items-center justify-between gap-2', children: [
            jsx('span', { className: 'font-medium text-foreground', children: text('Now Playing', 'Now Playing') }),
            jsx('span', { className: nowPlaying?.ok ? 'text-emerald-600' : 'text-muted-foreground',
              children: nowPlaying?.ok
                ? (nowPlaying.playing || 'available')
                : text('当前无可用媒体会话', 'No active media session') })
          ] }),
          nowPlaying?.ok && jsxs('div', { className: 'mt-2 space-y-0.5 text-muted-foreground', children: [
            jsx('div', { className: 'text-foreground', children: nowPlaying.title || '—' }),
            jsx('div', { children: [nowPlaying.artist, nowPlaying.album].filter(Boolean).join(' · ') || '—' }),
            nowPlaying.duration > 0 && jsx('div', { className: 'font-mono',
              children: `${Math.floor(nowPlaying.position || 0)} / ${Math.floor(nowPlaying.duration)} s` })
          ] })
        ] }),
        jsxs('div', { className: 'text-[11px] leading-5 text-muted-foreground', children: [
          text('系统音频反应：', 'System audio response: '),
          jsx('span', { className: 'text-foreground', children: 'auto' }),
          text(' · 媒体集成：', ' · Media integration: '),
          jsx('span', { className: 'text-foreground', children: text('常开', 'always on') })
        ] })
      ])
    ]
  } else if (tab === 'advanced') {
    content = [
      section(text('浏览方式', 'Browsing'), text('壁纸库卡片的呈现方式。', 'How wallpaper cards are laid out.'), [
        select('pickerLayout', text('紧凑布局', 'Compact layout'), PICKER_LAYOUTS.map(value => [value,
          value === 'classic' ? text('经典比例卡片', 'Classic aspect-ratio cards')
            : text('固定高度网格', 'Fixed-height grid')]))
      ]),
      section(text('省电', 'Power saving'), text('类似 Wallpaper Engine 的遮挡暂停；恢复后自动继续。', 'Wallpaper Engine-style pause rules; playback resumes automatically.'), [
        toggle('pauseOnHidden', t('pauseOnHidden')),
        toggle('pauseOnBlur', t('pauseOnBlur')),
        toggle('pauseOnBattery', t('pauseOnBattery'))
      ]),
      section(text('缓存与诊断', 'Cache and diagnostics'), text('缓存可再生；这里只清理场景解包缓存，不删除壁纸原文件。', 'Caches are reproducible; this only clears extracted scene data, never source wallpapers.'), [
        jsxs('div', { className: 'flex flex-wrap gap-2', children: [
          jsx(Button, { size: 'sm', variant: 'outline', onClick: () => void refreshDiagnostics(),
            disabled: diagnosticsLoading,
            children: diagnosticsLoading ? '…' : text('刷新诊断', 'Refresh diagnostics') }),
          jsx(Button, {
            size: 'sm', variant: 'outline', onClick: () => void clearCache(),
            children: cacheArmed ? text('确认清理场景缓存', 'Confirm scene-cache cleanup')
              : text('清理场景缓存', 'Clear scene cache')
          })
        ] }),
        cacheMessage && jsx('p', { className: 'text-[11px] text-muted-foreground', children: cacheMessage }),
        diagnosticsError && jsx('p', { className: 'text-[11px] text-destructive', children: diagnosticsError }),
        diagnostics?.ok && jsxs('div', { className: 'grid gap-3 md:grid-cols-2', children: [
          jsxs('div', { className: 'space-y-1 rounded-lg border border-border bg-background/50 p-3 text-[11px] text-muted-foreground', children: [
            jsx('div', { className: 'text-xs font-medium text-foreground', children: text('运行状态', 'Runtime') }),
            jsx('div', { children: `WebWallGL: ${diagnostics.webwallgl ? 'OK' : 'missing'}` }),
            jsx('div', { children: `Node.js: ${diagnostics.node || '—'}` }),
            jsx('div', { children: `${text('系统字体缓存', 'System fonts')}: ${diagnostics.fonts || 0}` })
          ] }),
          jsxs('div', { className: 'space-y-1 rounded-lg border border-border bg-background/50 p-3 text-[11px] text-muted-foreground', children: [
            jsx('div', { className: 'text-xs font-medium text-foreground', children: text('占用', 'Storage') }),
            jsx('div', { children: `${text('上传', 'Uploads')}: ${bytes(diagnostics.sizes?.uploads)}` }),
            jsx('div', { children: `${text('场景缓存', 'Scene cache')}: ${bytes(diagnostics.sizes?.sceneCache)}` }),
            jsx('div', { className: 'break-all', children: diagnostics.paths?.data || '—' })
          ] })
        ] }),
        diagnostics?.logs?.length > 0 && jsxs('details', { className: 'rounded-lg border border-border bg-background/50 p-3', children: [
          jsx('summary', { className: 'cursor-pointer text-xs font-medium text-foreground',
            children: text('最近日志', 'Recent logs') }),
          ...diagnostics.logs.map(log => jsxs('div', { className: 'mt-2', children: [
            jsx('div', { className: 'text-[11px] font-medium text-foreground', children: `${log.name} · ${bytes(log.size)}` }),
            jsx('pre', { className: 'mt-1 max-h-40 overflow-auto whitespace-pre-wrap break-all text-[10px] text-muted-foreground',
              children: (log.tail || []).slice(-40).join('\n') })
          ] }, log.name))
        ] })
      ]),
      section(t('sectionSystem'), t('sectionSystemDesc'), [
        jsxs('div', { className: 'flex flex-wrap items-center gap-2', children: [
          jsx(Button, { size: 'sm', variant: 'outline', onClick: exportPreset, children: t('exportPreset') }),
          jsx('label', {
            className: 'inline-flex cursor-pointer items-center rounded-md border border-border px-3 py-1.5 text-xs text-foreground hover:bg-accent/50',
            children: [
              t('importPreset'),
              jsx('input', { type: 'file', accept: 'application/json,.json', className: 'hidden',
                onChange: event => void importPreset(event) })
            ]
          })
        ] }),
        presetMessage && jsx('p', { className: 'text-[11px] text-muted-foreground', children: presetMessage })
      ])
    ]
  } else if (tab === 'extensions') {
    content = [
      section(t('sectionFx'), t('sectionFxDesc'), [
        toggle('fxEnabled', t('fxEnabled')),
        config.fxEnabled && jsxs('div', { className: 'flex flex-col gap-4', children: [
          toggle('fxClick', t('fxClick')),
          select('fxClickStyle', t('fxClickStyle'), FX_CLICK_STYLES.map(value => [value, {
            ripple: text('波纹', 'Ripple'), spark: text('火花', 'Spark'), both: text('两者一起', 'Both')
          }[value]])),
          jsxs('div', { className: 'grid gap-3 sm:grid-cols-2', children: [
            slider('fxClickSize', t('fxClickSize')),
            slider('fxClickGlow', t('fxClickGlow'))
          ] }),
          toggle('fxTrail', t('fxTrail')),
          select('fxTrailStyle', t('fxTrailStyle'), FX_TRAIL_STYLES.map(value => [value, {
            comet: text('彗尾', 'Comet'), dust: text('星尘', 'Dust')
          }[value]])),
          jsxs('div', { className: 'grid gap-3 sm:grid-cols-2', children: [
            slider('fxTrailLength', t('fxTrailLength')),
            slider('fxTrailWidth', t('fxTrailWidth')),
            slider('fxTrailGlow', t('fxTrailGlow')),
            slider('fxOpacity', t('fxOpacity'))
          ] }),
          jsxs('div', { className: 'grid gap-3 sm:grid-cols-2', children: [
            select('fxBlend', t('fxBlend'), FX_BLEND_VALUES.map(value => [value, {
              screen: text('滤色', 'Screen'), normal: text('正常', 'Normal'),
              overlay: text('叠加', 'Overlay'), multiply: text('正片叠底', 'Multiply'),
              lighten: text('变亮', 'Lighten')
            }[value]])),
            select('fxColorMode', t('fxColorMode'), FX_COLOR_MODES.map(value => [value, {
              accent: text('主题色', 'Accent'), rainbow: text('彩虹', 'Rainbow'),
              custom: text('自定义', 'Custom')
            }[value]]))
          ] }),
          config.fxColorMode === 'custom' && jsxs('label', {
            className: 'flex items-center justify-between gap-3 text-xs text-foreground',
            children: [
              jsx('span', { children: t('fxColor') }),
              jsx('input', {
                type: 'color', value: config.fxColor,
                onChange: event => controller.changeConfig({ fxColor: event.target.value }),
                className: 'h-7 w-10 rounded border border-border bg-transparent'
              })
            ]
          })
        ] })
      ]),
      section(t('sectionParallax'), t('sectionParallaxDesc'), [
        toggle('parallaxEnabled', t('parallaxEnabled')),
        config.parallaxEnabled && jsxs('div', { className: 'flex flex-col gap-4', children: [
          slider('parallaxBg', t('parallaxBgDepth'), text('光标到屏幕角落时的最大位移，单位 = 屏幕最长对角线的百分比。', 'Maximum travel when the cursor reaches a screen corner, as a percentage of the longest diagonal.')),
          toggle('parallaxUi', t('parallaxUi')),
          config.parallaxUi && jsxs('div', { className: 'grid gap-3 sm:grid-cols-2', children: [
            slider('parallaxUiChatDepth', t('parallaxUiChat')),
            slider('parallaxUiComposerDepth', t('parallaxUiComposer')),
            slider('parallaxUiSidebarDepth', t('parallaxUiSidebar')),
            slider('parallaxUiBubbleDepth', text('用户气泡深度', 'User bubble depth'))
          ] }),
          toggle('parallaxPlugin', text('其他插件前端视差', 'Other plugin surfaces'),
            text('独立于界面视差；默认关闭。', 'Independent of UI parallax; off by default.')),
          config.parallaxPlugin && jsxs('div', { className: 'space-y-2', children: [
            discoveredSlots.length === 0 && jsx('p', { className: 'text-[11px] text-muted-foreground',
              children: text('尚未发现可移动的插件前端组。', 'No movable plugin surface has been discovered yet.') }),
            ...discoveredSlots.map(slot => jsxs('label', {
              className: 'flex items-center justify-between gap-3 rounded-md border border-border bg-background/40 px-2.5 py-2 text-xs',
              children: [
                jsx('span', { className: 'min-w-0 truncate text-foreground', children: slot }),
                jsx('input', {
                  type: 'number', min: 0, max: 10, step: 0.1,
                  value: config.parallaxPluginDepths?.[slot] ?? 1,
                  onChange: event => controller.scheduleConfig({
                    parallaxPluginDepths: {
                      ...config.parallaxPluginDepths,
                      [slot]: Number(event.target.value)
                    }
                  }),
                  onBlur: () => controller.flushConfig(),
                  className: 'w-20 rounded border border-border bg-background px-2 py-1 text-xs'
                })
              ]
            }, slot))
          ] }),
          slider('parallaxSmooth', t('parallaxSmooth'), text('0 = 立刻跟手，越大越柔和。', '0 = instant, higher = softer.'))
        ] })
      ])
    ]
  } else {
    content = [
      section(text('项目简介', 'About this plugin'), null, [
        jsxs('div', { className: 'space-y-2 text-xs leading-6 text-muted-foreground', children: [
          jsx('p', { className: 'text-sm font-medium text-foreground',
            children: text('Hermes 壁纸引擎 · 让 Hermes 的背后动起来', 'Hermes Wallpaper Engine · bring the background to life') }),
          jsx('p', { children: text(
            '把 Wallpaper Engine 的 Scene、Web、视频与图片壁纸放到 Hermes 背后，再配上一整套液态玻璃、字体、点击拖尾与 3D 视差。插件不向 agent 注册工具，也不注入提示文本，因此不增加模型 token 开销。',
            'Bring Wallpaper Engine Scene, Web, video and image wallpapers behind Hermes, with liquid glass, typography, click/trail effects and 3D parallax. The plugin registers no agent tools or prompt text, so it adds no model token overhead.'
          ) })
        ] })
      ]),
      section(text('版本与上游', 'Version and upstream'), null, [
        jsxs('div', { className: 'space-y-2 text-xs text-muted-foreground', children: [
          jsx('div', { children: `Hermes Wallpaper Engine 2.0.0` }),
          jsx('div', { children: text('适配上游 dsh-wallpaper-engine 1.4.2（fd3e01f）', 'Adapted from dsh-wallpaper-engine 1.4.2 (fd3e01f)') }),
          jsx('div', { children: 'WebWallGL 3.0.1 · MIT · oneincase' }),
          jsx('p', { className: 'leading-5', children: text(
            '本项目按 MIT 及其随附的第三方许可分发。壁纸、角色与字体素材的授权可能与代码不同；再分发或商用前请核对来源。',
            'Distributed under MIT and the accompanying third-party licences. Wallpaper, character and font assets may use different terms; check their sources before redistribution or commercial use.'
          ) })
        ] }),
        jsxs('div', { className: 'flex flex-wrap gap-2', children: [
          jsx('a', {
            href: 'https://github.com/CaptainMusX/hermes-skins',
            target: '_blank', rel: 'noopener noreferrer',
            className: 'rounded-md border border-border px-3 py-1.5 text-xs text-foreground hover:bg-accent/50',
            children: text('Hermes 插件仓库', 'Hermes plugin repository')
          }),
          jsx('a', {
            href: 'https://github.com/elysia395/dsh-wallpaper-engine',
            target: '_blank', rel: 'noopener noreferrer',
            className: 'rounded-md border border-border px-3 py-1.5 text-xs text-foreground hover:bg-accent/50',
            children: text('上游 DSH 项目', 'Upstream DSH project')
          })
        ] })
      ]),
      section(text('许可与致谢', 'Licences and credits'), null, [
        jsx('ul', { className: 'list-disc space-y-1 pl-5 text-[11px] leading-5 text-muted-foreground', children: [
          jsx('li', { children: text('dsh-wallpaper-engine：壁纸渲染生命周期、设置与交互设计参考（MIT）', 'dsh-wallpaper-engine: renderer lifecycle, settings and interaction reference (MIT)') }),
          jsx('li', { children: text('WebWallGL：Scene / Web 实时渲染引擎（MIT，oneincase）', 'WebWallGL: live Scene / Web renderer (MIT, oneincase)') }),
          jsx('li', { children: text('dsh-skins：早期 Scene 解包兼容层（MIT）', 'dsh-skins: legacy scene extraction compatibility (MIT)') })
        ] })
      ])
    ]
  }

  return jsxs('div', {
    'data-hermes-skins-page': '',
    className: 'mx-auto flex w-full max-w-6xl flex-col gap-4 p-2 md:p-4',
    children: [
      jsx('header', { className: 'space-y-1', children: [
        jsx('h1', { className: 'text-lg font-semibold text-foreground', children: t('pluginName') }),
        jsx('p', { className: 'text-xs text-muted-foreground', children: t('pluginDesc') })
      ] }),
      tabBar,
      jsx('div', { role: 'tabpanel', className: 'flex flex-col gap-4', children: content }),
      tabFooter
    ]
  })
}
return { AppearanceSettingsPanel }
})()

// ─── Submodule: Appearance settings entry ─────────────────────
const { mountAppearanceEntry } = (() => {
/**
 * The Appearance page renders plugin extras only on its root view, while the
 * rail always lands on the first subpage (General). Mount a small, plugin-owned
 * entry card at the end of General so Settings ▸ Appearance has a visible door
 * to the full Wallpaper Engine page. The card is removed as soon as the
 * General section leaves the DOM.
 */
const CARD_ID = 'hermes-skins-appearance-entry'

const isChinese = () => {
  const language = typeof document !== 'undefined'
    ? document.documentElement.lang || navigator.language || '' : ''
  return String(language).toLowerCase().startsWith('zh')
}

function isGeneralAppearance() {
  if (typeof location === 'undefined') return false
  const query = location.hash.split('?')[1] || ''
  const params = new URLSearchParams(query)
  return params.get('page') === 'general' && params.get('tab') === 'config:appearance'
}

function mountAppearanceEntry({ getSummary, open }) {
  if (typeof document === 'undefined' || typeof MutationObserver !== 'function') return () => {}
  let card = null
  let timer = null
  let disposed = false

  const remove = () => {
    card?.remove()
    card = null
  }

  const sync = () => {
    if (disposed) return
    if (!isGeneralAppearance()) {
      remove()
      return
    }
    const container = document.getElementById('setting-field-appearance.language')?.closest('.overflow-y-auto')
    if (!container) {
      remove()
      return
    }
    if (card?.isConnected && card.parentElement === container) return
    remove()
    card = document.createElement('section')
    card.id = CARD_ID
    card.setAttribute('data-hermes-skins-surface', '')
    card.className = 'mt-6 flex flex-col gap-3 rounded-xl border border-border bg-card p-5'

    const title = document.createElement('h3')
    title.className = 'text-sm font-semibold text-foreground'
    title.textContent = isChinese() ? '壁纸引擎' : 'Wallpaper Engine'
    const summary = document.createElement('p')
    summary.className = 'text-xs text-muted-foreground'
    summary.textContent = getSummary?.() ||
      (isChinese() ? 'Scene / Web / 视频 / 图片壁纸与液态玻璃。' : 'Scene, Web, video and image wallpapers with liquid glass.')
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'w-fit rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90'
    button.textContent = isChinese() ? '打开壁纸引擎' : 'Open Wallpaper Engine'
    button.addEventListener('click', () => open?.())
    card.append(title, summary, button)
    container.appendChild(card)
  }

  const schedule = () => {
    if (timer !== null || disposed) return
    timer = setTimeout(() => {
      timer = null
      sync()
    }, 80)
  }

  const observer = new MutationObserver(schedule)
  observer.observe(document.body, { childList: true, subtree: true })
  schedule()
  return () => {
    disposed = true
    observer.disconnect()
    if (timer !== null) clearTimeout(timer)
    timer = null
    remove()
  }
}
return { mountAppearanceEntry }
})()

// ─── Plugin Registration Entry ────────────────────────────────
const PLUGIN_ID = 'hermes-skins'

export default {
  id: PLUGIN_ID,
  name: 'Hermes Wallpaper Engine',
  defaultEnabled: true,

  register(ctx) {
    const rest = typeof ctx.rest === 'function'
      ? (path, options) => ctx.rest(path, options)
      : async () => ({ ok: false, error: 'plugin backend unavailable' })
    // 1. Register I18N
    ctx.i18n.register(I18N_DICTIONARY)

    // 2. Initialize engines & state
    const store = createAppearanceStore(ctx)
    const openScene = payload => rest('/scene/open', { method: 'POST', body: payload })
    const backdropManager = new BackdropManager({ openScene })
    const glassController = new GlassController()
    const rangeController = new RangeController()
    rangeController.start()
    const fontController = new FontController({ setAccentOverride })
    const fxOverlay = new FxOverlay()
    const parallax = new ParallaxController()
    const themeFollow = new ThemeFollowController()
    const controller = new AppearanceController(store, backdropManager, glassController,
      [fontController, fxOverlay, parallax, themeFollow])
    const rotation = new WallpaperRotation(store, openScene, controller, backdropManager)

    const loadFonts = () => rest('/fonts')
    const loadUploads = () => rest('/uploads')
    const importUploads = paths => rest('/uploads/import', { method: 'POST', body: { paths } })
    const importUrl = url => rest('/uploads/url', { method: 'POST', body: { url } })
    const importBing = () => rest('/uploads/bing', { method: 'POST', body: { index: 0 } })
    const loadDiagnostics = () => rest('/system/diagnostics')
    const clearSceneCache = () => rest('/system/cache/clear', { method: 'POST', body: { scope: 'scene' } })
    const loadNowPlaying = () => rest('/now-playing')
    let nowPlayingBusy = false
    const refreshNowPlaying = async () => {
      const current = store.$config.get()
      if (!['scene', 'web'].includes(current.wallpaperType)) {
        backdropManager.setMediaSnapshot(null)
        return
      }
      if (nowPlayingBusy) return
      nowPlayingBusy = true
      try {
        backdropManager.setMediaSnapshot(await loadNowPlaying())
      } catch {
        backdropManager.setMediaSnapshot(null)
      } finally {
        nowPlayingBusy = false
      }
    }
    const stopNowPlayingPoll = typeof ctx.setInterval === 'function'
      ? ctx.setInterval(() => void refreshNowPlaying(), 5000)
      : null
    void refreshNowPlaying()
    const panel = () => jsx(AppearanceSettingsPanel, {
      store, controller, openScene, loadFonts, loadUploads, importUploads, importUrl,
      importBing, loadDiagnostics, clearSceneCache, loadNowPlaying
    })
    const openPanel = () => {
      try { host.navigate(pluginSettingsHref('hermes-skins:wallpaper')) }
      catch { host.navigate('/settings?tab=plugins') }
    }

    // 3. The full page lives in Settings ▸ Plugins; the Appearance rail shows
    //    a small door at the end of its General section. Both are removed with
    //    the plugin. appearance.extra remains for hosts that render the
    //    Appearance root view.
    if (typeof ctx.registerSettingsPage === 'function') {
      ctx.registerSettingsPage({
        id: 'wallpaper',
        title: '壁纸引擎',
        icon: 'symbol-color',
        order: 20,
        render: panel
      })
    }
    ctx.register({
      id: 'appearance-panel',
      area: APPEARANCE_AREAS.extra,
      render: panel
    })
    const disposeAppearanceEntry = mountAppearanceEntry({
      getSummary: () => {
        const config = store.$config.get()
        return config.weSelection?.title ||
          config.wallpaperSource.split(/[\\/]/).filter(Boolean).at(-1) ||
          'Scene / Web / 视频 / 图片壁纸与液态玻璃。'
      },
      open: openPanel
    })

    // 4. Runtime theme watcher keeps the veil/surface mode in sync with Hermes.
    const disposeThemeWatcher = watchRootTheme(controller)
    controller.sync()

    // 5. Teardown on plugin reload / dispose.
    if (typeof ctx.onDispose === 'function') {
      ctx.onDispose(() => {
        disposeThemeWatcher()
        disposeAppearanceEntry()
        if (typeof stopNowPlayingPoll === 'function') stopNowPlayingPoll()
        rotation.destroy()
        rangeController.destroy()
        controller.destroy()
        store.destroy()
      })
    }
  }
}
