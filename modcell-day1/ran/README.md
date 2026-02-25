# srsRAN RAN Configs — Wired to Mod Cellular Open5GS Core

Run srsRAN **on the host** (not in Docker) for SDR access. Point configs at your Open5GS MME/AMF.

## Network Setup

For Docker: expose S1AP/NGAP so host can reach containers. Add to docker-compose for MME and AMF:

```yaml
# In modcell-mme service:
ports: ["36412:36412"]   # S1AP SCTP

# In modcell-amf service:
ports: ["38472:38472"]   # NGAP SCTP
```

Then use `127.0.0.1` as mme_addr / amf_addr when RAN and core are on same machine.

For separate machines: use the Open5GS host IP.

## 4G LTE — srsRAN 4 eNB

Copy `sib.conf`, `rr.conf`, `rb.conf` from srsRAN 4 install into `ran/`, or run from srsRAN 4 build dir.

```bash
# Install srsRAN 4G, edit ran/enb.conf: mme_addr = YOUR_MME_IP
srsenb ran/enb.conf
```

## 5G NR — srsRAN 5 gNB

```bash
# Install srsRAN Project
# Edit ran/gnb.yml: set amf_addr

srsgnb ran/gnb.yml
```

## PLMN / Subscribers

- MCC/MNC in RAN config must match Open5GS (default 001/01)
- Provision subscribers via Fleet UI (port 7073) → Create Subscriber
- Use same IMSI/KEY/OPC in Open5GS and on your test USIM
