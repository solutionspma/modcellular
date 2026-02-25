import express from "express"
import cors from "cors"
import fetch from "node-fetch"

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static("public"))

const PORT = process.env.PORT || 7073
const TELEMETRY_API = process.env.TELEMETRY_API
const PROVISIONING_API = process.env.PROVISIONING_API
const POLICY_API = process.env.POLICY_API
const ESIM_API = process.env.ESIM_API

app.get("/api/fleet", async (req,res)=>{
  const r = await fetch(`${TELEMETRY_API}/fleet`)
  res.json(await r.json())
})

app.get("/api/events", async (req,res)=>{
  const r = await fetch(`${TELEMETRY_API}/events`)
  res.json(await r.json())
})

app.get("/api/subscribers", async (req,res)=>{
  const r = await fetch(`${PROVISIONING_API}/subscribers`)
  res.json(await r.json())
})

app.post("/api/subscribers", async (req,res)=>{
  const r = await fetch(`${PROVISIONING_API}/subscribers`, { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(req.body) })
  res.status(r.status).json(await r.json())
})

app.get("/api/policy", async (req,res)=>{
  const r = await fetch(`${POLICY_API}/policy`)
  res.json(await r.json())
})

app.post("/api/policy", async (req,res)=>{
  const r = await fetch(`${POLICY_API}/policy`, { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(req.body) })
  res.json(await r.json())
})

app.get("/api/esim/orders", async (req,res)=>{
  const r = await fetch(`${ESIM_API}/orders`)
  res.json(await r.json())
})

app.post("/api/esim/orders", async (req,res)=>{
  const r = await fetch(`${ESIM_API}/orders`, { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(req.body) })
  res.status(r.status).json(await r.json())
})

app.listen(PORT, ()=> console.log("Fleet UI on", PORT))
