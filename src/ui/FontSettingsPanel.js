import { Button, Input, Switch } from '@hermes/plugin-sdk'
import { useRef, useState } from 'react'
import { jsx, jsxs } from 'react/jsx-runtime'
import {
  COMPONENT_FONT_TARGETS, FONT_SET_KEYS, THEME_COLOR_ROLE_IDS, TYPE_ROLE_IDS
} from '../engine/config.js'

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

export function FontSettingsPanel({ config, controller, fontList, loadingFonts, scanFonts }) {
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
