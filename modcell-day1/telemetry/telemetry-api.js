import express from "express"
import cors from "cors"

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 7072

let devices = {}
let events = []

/**
 * Device telemetry endpoint. Agent POSTs every 30s.
 * Payload format: { rsrp, rssi, cellId, tac, mcc, mnc, signalBars, batteryPct, timestamp }
 */
app.post("/telemetry/:deviceId", (req,res)=>{
  const { deviceId } = req.params
  devices[deviceId] = { lastSeen: Date.now(), metrics: req.body }
  events.unshift({ ts: Date.now(), deviceId, body: req.body })
  events = events.slice(0, 500)
  res.json({ ok:true })
})

app.get("/fleet", (req,res)=> res.json({ ok:true, devices }))
app.get("/events", (req,res)=> res.json({ ok:true, events }))

app.get("/metrics", (req,res)=>{
  let out = ""
  for(const [id,v] of Object.entries(devices)){
    const rsrp = Number(v.metrics?.rsrp ?? 0)
    const rssi = Number(v.metrics?.rssi ?? 0)
    out += `modcell_device_seen{device="${id}"} 1\n`
    if(!Number.isNaN(rsrp)) out += `modcell_rsrp{device="${id}"} ${rsrp}\n`
    if(!Number.isNaN(rssi)) out += `modcell_rssi{device="${id}"} ${rssi}\n`
  }
  res.type("text/plain").send(out)
})

app.listen(PORT, ()=> console.log("Telemetry API on", PORT))
