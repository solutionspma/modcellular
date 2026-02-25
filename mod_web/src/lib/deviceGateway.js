/**
 * Mod Cellular Device Gateway API client
 * Connects to the Mac Mini gateway running on port 5050
 */

const GATEWAY_URL = import.meta.env.VITE_DEVICE_GATEWAY_URL || 'http://localhost:5050'

async function fetchGateway(path, options = {}) {
  const url = `${GATEWAY_URL.replace(/\/$/, '')}${path}`
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || res.statusText)
  return data
}

export const deviceGateway = {
  async getDevices() {
    return fetchGateway('/devices')
  },

  async getSim() {
    return fetchGateway('/sim')
  },

  async setApn(apn) {
    return fetchGateway('/apn', {
      method: 'POST',
      body: JSON.stringify({ apn })
    })
  },

  async restartRadio() {
    return fetchGateway('/radio/restart', { method: 'POST' })
  },

  async reboot() {
    return fetchGateway('/reboot', { method: 'POST' })
  },

  async shell(command) {
    return fetchGateway('/shell', {
      method: 'POST',
      body: JSON.stringify({ command })
    })
  }
}
