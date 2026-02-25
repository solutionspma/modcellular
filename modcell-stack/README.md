# Mod Cellular Control Stack

Deployable fleet control stack: web dashboard, Dockerized, auto device detect, Telnyx API sync, OTA config push, root-aware modem hooks.

## Run

```bash
cd modcell-stack
export TELNYX_API_KEY=YOUR_KEY
docker-compose up
```

Open **http://localhost:5050**

## Enterprise APN Policy Engine

Self-healing fleet policy: when CarrierConfig overwrites APN, the stack auto-reapplies.

```bash
export ENABLE_APN_POLICY=true
export APN_POLICY_TARGET=wholesale      # default
export APN_POLICY_INTERVAL_MS=30000     # 30s default
```

Level 1 (unlocked): policy keeps APN set. Level 2 (locked): detects reversion, reapplies when device allows.

## Requirements

- Docker
- ADB on host (`/usr/bin/adb`)
- Android device via USB with USB debugging enabled

## API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/devices` | GET | Auto-detect connected devices |
| `/api/device/info` | GET | IMEI, model, Android version |
| `/api/apn` | POST | Push APN OTA |
| `/api/radio/restart` | POST | Restart modem |
| `/api/modem/raw` | POST | Raw root modem command (rooted devices) |
| `/api/telnyx/sims` | GET | Sync Telnyx SIM inventory |
