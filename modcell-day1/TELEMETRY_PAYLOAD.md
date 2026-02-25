# Device Telemetry Payload Format

Mod Cellular Device Owner agent POSTs every 30 seconds to:

```
POST {telemetry.postUrl}/{deviceId}
Content-Type: application/json
```

## Payload Schema

| Field       | Type   | Description                    |
|------------|--------|--------------------------------|
| rsrp       | int    | Reference Signal Received Power (dBm) |
| rssi       | int    | RSSI (dBm)                     |
| cellId     | int    | Cell ID                        |
| tac        | int    | Tracking Area Code              |
| mcc        | string | Mobile Country Code            |
| mnc        | string | Mobile Network Code            |
| signalBars | int    | 0–5 bars                       |
| batteryPct | int    | 0–100                          |
| timestamp  | int64  | Unix ms                        |

## Example

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

## Endpoints

- **modcell-day1:** `http://YOUR_HOST:7072/telemetry/{deviceId}`
- **modcell-enterprise agent:** Fetches `telemetry.postUrl` from policy server, POSTs to that base + `/{deviceId}`

## Prometheus

Telemetry API exposes `/metrics` for Prometheus scrape. Metrics:

- `modcell_device_seen{device="..."}` 
- `modcell_rsrp{device="..."}`
- `modcell_rssi{device="..."}`
