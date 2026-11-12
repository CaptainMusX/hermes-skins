import test from 'node:test'
import assert from 'node:assert/strict'
import { BackdropManager } from '../src/engine/backdrop-manager.js'

function fixture() {
  const oldWindow=globalThis.window, oldDocument=globalThis.document
  const frames=new Map(); let id=0
  const window=Object.assign(new EventTarget(), {innerWidth:1000,innerHeight:600,
    requestAnimationFrame: fn=>{frames.set(++id,fn);return id}, cancelAnimationFrame: n=>frames.delete(n)})
  globalThis.window=window;globalThis.document=new EventTarget()
  const messages=[],manager=new BackdropManager()
  manager.sceneIframe={getBoundingClientRect:()=>({left:-8,top:-8,width:1016,height:616}),
    contentWindow:{postMessage:message=>messages.push(message)}}
  manager.ensureCursorForwarding()
  const move=(x,y)=>{const e=new Event('mousemove');Object.assign(e,{clientX:x,clientY:y});window.dispatchEvent(e)}
  return {manager,messages,frames,move,
    flush:()=>{const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn())},
    restore:()=>{globalThis.window=oldWindow;globalThis.document=oldDocument}}
}

test('cursor forwarding preserves the latest position and uses the overscanned iframe rectangle',()=>{
  const f=fixture()
  try {
    f.move(200,100);f.move(400,200);f.move(700,400)
    assert.equal(f.frames.size,1,'one delivery per compositor frame instead of dropping the last move')
    f.flush()
    assert.equal(f.messages.length,1)
    assert.equal(f.messages[0].type,'dsh-set-cursor')
    assert.ok(Math.abs(f.messages[0].x-708/1016)<1e-9)
    assert.ok(Math.abs(f.messages[0].y-408/616)<1e-9)
  } finally {f.manager.destroy();f.restore()}
})

test('disposing a wallpaper cancels queued mouse delivery and releases host listeners',()=>{
  const f=fixture()
  try {
    f.move(700,400)
    f.manager.destroy()
    assert.equal(f.manager.cursorForwardInit,false,'dispose releases the pointer listener registration')
    assert.equal(f.frames.size,0)
    f.move(900,500)
    assert.equal(f.frames.size,0,'hot reload must not accumulate pointer listeners')
  } finally {f.restore()}
})

test('wallpaper switching disposes the renderer and video decoder and aborts obsolete loading',()=>{
  const f=fixture()
  try {
    let disposed=0, paused=0, loaded=0
    f.manager.sceneIframe.contentWindow.__hermesSceneDispose=()=>disposed++
    const load=new AbortController()
    f.manager.sceneLoad=load
    f.manager.videoElement={src:'old.mp4',pause(){paused++},removeAttribute(){this.src=''},load(){loaded++}}
    const video=f.manager.videoElement
    f.move(400,200)
    f.manager.releaseMedia()
    assert.equal(load.signal.aborted,true)
    assert.equal(disposed,1)
    assert.equal(paused,1)
    assert.equal(loaded,1)
    assert.equal(video.src,'')
    assert.equal(f.frames.size,0)
  } finally {f.manager.destroy();f.restore()}
})

test('repeated context-restoration reloads fall back to the preview instead of looping',()=>{
  const f=fixture()
  try {
    f.manager.media={querySelector:selector=>selector==='img'?{}:null,replaceChildren(){},style:{}}
    const frame=f.manager.sceneIframe
    const event={source:frame.contentWindow,data:{type:'dsh-scene-needs-reload'}}
    // The first reload uses the built-in HTML string, supplied by the bundle.
    f.manager.sceneReloads=1
    f.manager.handleSceneMessage(event)
    assert.equal(f.manager.sceneIframe,null)
  } finally {f.manager.destroy();f.restore()}
})
