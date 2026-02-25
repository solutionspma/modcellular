# Mod Cellular Enterprise — Device Owner + Fleet Provisioning

Custom Android Device Agent (Kotlin), Device Owner provisioning, silent APN management, fleet enrollment QR, remote policy server, OTA policy push.

## Structure

```
modcell-enterprise/
├── server/          # Policy server (port 7070)
├── agent/           # Android Device Owner APK
└── enroll/          # Fleet enrollment QR generator
```

## Run

### Policy Server
```bash
cd server
npm install
node server.js
```

### Build Agent APK
Open `agent/` in Android Studio → Build → Build APK

### Provision Device Owner
1. Factory reset phone
2. Install APK
3. Run:
```bash
adb shell dpm set-device-owner com.modcell.agent/.DeviceAdmin
```

### Generate Enrollment QR
```bash
cd enroll
npm install
# Edit qr-generator.js: set YOUR_SERVER to your APK download URL
node qr-generator.js
# Output: enroll.png
```

## Config

- **Agent:** `MainActivity.kt` → set `policyBaseUrl` to your server (e.g. `http://192.168.1.100:7070`)
- **Server:** `policies.json` → APN + telemetry.postUrl
- **QR:** `qr-generator.js` → PROVISIONING_DEVICE_ADMIN_PACKAGE_DOWNLOAD_LOCATION

## Device Telemetry Payload Format

Agent POSTs every 30s to `{telemetry.postUrl}/{deviceId}`:

```json
{
  "rsrp": -85,
  "rssi": -72,
  "cellId": 12345678,
  "tac": 1,
  "mcc": "310",
  "mnc": "410",
  "signalBars": 4,
  "batteryPct": 87,
  "timestamp": 1709123456789
}
```

Works with modcell-day1 telemetry API (port 7072).
