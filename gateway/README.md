# Mod Cellular Device Gateway

Single Node device-control gateway for Mac Mini. Connects to Android phones via USB/ADB and exposes REST endpoints for the Mod Cellular website.

## Setup

```bash
cd gateway
npm install
node modcell-device-gateway.js
```

Or:

```bash
npm start
```

## Requirements

- Mac Mini with Node.js
- Android phone connected via USB with **USB debugging** enabled
- ADB installed (`brew install android-platform-tools`)

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/devices` | List connected ADB devices |
| GET | `/sim` | Telephony registry dump |
| POST | `/apn` | Set APN (body: `{ "apn": "wholesale" }`) |
| POST | `/radio/restart` | Restart cellular radio |
| POST | `/reboot` | Reboot device |
| POST | `/shell` | Run ADB shell command (body: `{ "command": "..." }`) |

## Website Integration

In `mod_web`, set the gateway URL:

```bash
# .env.local or .env
VITE_DEVICE_GATEWAY_URL=http://YOUR_MAC_MINI_IP:5050
```

If unset, defaults to `http://localhost:5050` (when website and gateway run on same machine).
