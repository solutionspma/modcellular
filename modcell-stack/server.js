const express = require("express")
const cors = require("cors")
const { exec } = require("child_process")
const fetch = (...args) => import("node-fetch").then(({default: fetch}) => fetch(...args))

const TELNYX_API_KEY = process.env.TELNYX_API_KEY || ""
const TELNYX_BASE = "https://api.telnyx.com/v2"

/* Enterprise APN policy: self-healing fleet enforcement */
const APN_POLICY_ENABLED = process.env.ENABLE_APN_POLICY === "true"
const APN_POLICY_TARGET = process.env.APN_POLICY_TARGET || "wholesale"
const APN_POLICY_INTERVAL_MS = parseInt(process.env.APN_POLICY_INTERVAL_MS || "30000", 10)

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static("public"))

function run(cmd) {
  return new Promise((resolve, reject)=>{
    exec(cmd, (err, stdout, stderr)=>{
      if(err) return reject(stderr || err.message)
      resolve(stdout.trim())
    })
  })
}

/* ================= DEVICE AUTO DETECT ================= */

app.get("/api/devices", async (req,res)=>{
  try {
    const devices = await run("adb devices")
    res.json({ ok:true, devices })
  } catch(e){ res.status(500).json({ ok:false, error:e }) }
})

app.get("/api/device/info", async (req,res)=>{
  try {
    const imei = await run("adb shell service call iphonesubinfo 1 | grep -o '[0-9]*'")
    const model = await run("adb shell getprop ro.product.model")
    const android = await run("adb shell getprop ro.build.version.release")
    res.json({ ok:true, imei, model, android })
  } catch(e){ res.status(500).json({ ok:false, error:e }) }
})

/* ================= OTA PROFILE PUSH ================= */

app.post("/api/apn", async (req,res)=>{
  try {
    const { apn } = req.body
    const cmd = `adb shell settings put global tether_dun_apn "${apn}"`
    await run(cmd)
    res.json({ ok:true })
  } catch(e){ res.status(500).json({ ok:false, error:e }) }
})

/* ================= RADIO / MODEM ================= */

app.post("/api/radio/restart", async (req,res)=>{
  try {
    await run("adb shell svc data disable")
    await run("adb shell svc data enable")
    res.json({ ok:true })
  } catch(e){ res.status(500).json({ ok:false, error:e }) }
})

/* Root-only hooks (device must already be rooted legally) */
app.post("/api/modem/raw", async (req,res)=>{
  try {
    const { command } = req.body
    const output = await run(`adb shell su -c "${command}"`)
    res.json({ ok:true, output })
  } catch(e){ res.status(500).json({ ok:false, error:e }) }
})

/* ================= TELNYX SYNC ================= */

app.get("/api/telnyx/sims", async (req,res)=>{
  try {
    const r = await fetch(`${TELNYX_BASE}/sim_cards`, {
      headers: { "Authorization": `Bearer ${TELNYX_API_KEY}` }
    })
    const data = await r.json()
    res.json(data)
  } catch(e){ res.status(500).json({ ok:false, error:e }) }
})

/* ================= ENTERPRISE APN POLICY ENGINE ================= */
/* Self-healing: monitor + reapply when CarrierConfig overwrites */
function startApnPolicyEngine() {
  if (!APN_POLICY_ENABLED) return
  console.log(`APN policy engine ON → target="${APN_POLICY_TARGET}" every ${APN_POLICY_INTERVAL_MS}ms`)
  setInterval(async () => {
    try {
      const current = await run("adb shell content query --uri content://telephony/carriers/preferapn")
      if (!current.includes(APN_POLICY_TARGET)) {
        await run(`adb shell settings put global tether_dun_apn "${APN_POLICY_TARGET}"`)
        console.log("APN policy reapplied")
      }
    } catch (e) {}
  }, APN_POLICY_INTERVAL_MS)
}

app.listen(5050, () => {
  console.log("MOD CELLULAR STACK RUNNING → 5050")
  startApnPolicyEngine()
})
