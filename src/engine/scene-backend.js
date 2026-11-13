export function isSceneBackendMissing(error) {
  return /Plugin not found|\b404\b/.test(String(error?.message || error))
}

/** An explicit recovery action uses Hermes' activation authority, never config edits. */
export async function enableSceneBackend(bridge) {
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
