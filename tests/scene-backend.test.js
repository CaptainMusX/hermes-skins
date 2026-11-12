import test from 'node:test'
import assert from 'node:assert/strict'
import { enableSceneBackend } from '../src/engine/scene-backend.js'

test('official activation is followed by an actual scene route check', async () => {
  const requests = []
  const bridge = { api: async request => {
    requests.push(request)
    return request.method === 'POST' ? { ok: true, restart_required: true } : { ok: true }
  } }
  assert.deepEqual(await enableSceneBackend(bridge), { ready: true, restartRequired: false })
  assert.deepEqual(requests, [
    { path: '/api/dashboard/agent-plugins/hermes-skins/enable', method: 'POST' },
    { path: '/api/plugins/hermes-skins/scene/health' }
  ])
})

test('gateway reload success does not imply the scene API is mounted', async () => {
  const bridge = { api: async request => {
    if (request.method === 'POST') return { ok: true, gateway_reloaded: true, restart_required: false }
    throw new Error('404: Headless backend (hermes serve): web UI disabled')
  } }
  assert.deepEqual(await enableSceneBackend(bridge), { ready: false, restartRequired: true })
})

test('activation refusals and unhealthy helpers cannot be reported as recovery', async () => {
  let checks = 0
  await assert.rejects(enableSceneBackend({ api: async request => {
    checks++
    assert.equal(request.method, 'POST')
    return { ok: false, error: 'Activation refused' }
  } }), /Activation refused/)
  assert.equal(checks, 1)
  await assert.rejects(enableSceneBackend({ api: async request => request.method === 'POST' ? { ok: true } : { ok: false } }), /runtime unavailable/)
})
