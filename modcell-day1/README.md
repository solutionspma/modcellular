# Mod Cellular Day-1 Lab Stack

Private LTE + 5G SA core (Open5GS), provisioning API, telemetry, fleet UI, policy server, eSIM bridge.

## Quick Start

```bash
cd modcell-day1
docker compose up -d
```

| Service        | URL                    |
|----------------|------------------------|
| Open5GS WebUI  | http://localhost:9999  |
| Fleet UI       | http://localhost:7073  |
| Grafana        | http://localhost:3000  (admin/admin) |
| Prometheus     | http://localhost:9090  |

## RAN (srsRAN on Host)

RAN runs on host for SDR access. Configs in `ran/`:

- **4G:** `ran/enb.conf` → point `mme_addr` at Open5GS MME (127.0.0.1 if same host)
- **5G:** `ran/gnb.yml` → point `amf.addr` at Open5GS AMF

See `ran/README.md`.

## Device Telemetry

Agent POSTs to `http://HOST:7072/telemetry/{deviceId}`. Payload format: `TELEMETRY_PAYLOAD.md`.

## Integration

- **modcell-enterprise:** Policy server (7074) + Device Owner agent. Set `telemetry.postUrl` in policy to `http://YOUR_HOST:7072/telemetry`.
- **modcell-stack:** ADB gateway (5050). Fleet UI can call it for OTA config.
