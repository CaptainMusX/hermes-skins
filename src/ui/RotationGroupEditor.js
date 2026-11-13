import { Button, Input, usePluginI18n, useValue } from '@hermes/plugin-sdk'
import { useState } from 'react'
import { jsx, jsxs } from 'react/jsx-runtime'
import { normalizeRotationGroup } from '../engine/config.js'
import { nextRotationGroupId } from '../engine/rotation-controller.js'
import { activeRotationGroup, groupWallpapers } from '../engine/wallpaper-apply.js'

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

export function RotationGroupEditor({ store, controller }) {
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
