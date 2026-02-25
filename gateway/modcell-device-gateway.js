const express = require("express")
const { exec } = require("child_process")

const app = express()
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Methods", "GET, POST")
  res.header("Access-Control-Allow-Headers", "Content-Type")
  next()
})
app.use(express.json())

function run(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) return reject(stderr || err.message)
      resolve(stdout.trim())
    })
  })
}

/* ===============================
   DEVICE INFO
================================*/

app.get("/devices", async (req,res)=>{
  try {
    res.json({ ok:true, data: await run("adb devices") })
  } catch(e){ res.status(500).json({ ok:false, error:e }) }
})

app.get("/sim", async (req,res)=>{
  try {
    res.json({ ok:true, data: await run("adb shell dumpsys telephony.registry") })
  } catch(e){ res.status(500).json({ ok:false, error:e }) }
})

/* ===============================
   RADIO CONTROL
================================*/

app.post("/radio/restart", async (req,res)=>{
  try {
    await run("adb shell svc data disable")
    await run("adb shell svc data enable")
    res.json({ ok:true })
  } catch(e){ res.status(500).json({ ok:false, error:e }) }
})

app.post("/reboot", async (req,res)=>{
  try {
    res.json({ ok:true, data: await run("adb reboot") })
  } catch(e){ res.status(500).json({ ok:false, error:e }) }
})

/* ===============================
   APN SETTER
================================*/

app.post("/apn", async (req,res)=>{
  try {
    const { apn } = req.body
    if (!apn) return res.status(400).json({ ok:false, error:"Missing APN" })

    const cmd = `adb shell settings put global tether_dun_apn "${apn}"`
    res.json({ ok:true, data: await run(cmd) })
  } catch(e){ res.status(500).json({ ok:false, error:e }) }
})

/* ===============================
   RAW COMMAND EXECUTOR
================================*/

app.post("/shell", async (req,res)=>{
  try {
    const { command } = req.body
    if (!command) return res.status(400).json({ ok:false, error:"Missing command" })
    res.json({ ok:true, data: await run(`adb shell ${command}`) })
  } catch(e){ res.status(500).json({ ok:false, error:e }) }
})

/* =============================== */

const PORT = 5050
app.listen(PORT, ()=> console.log("MOD CELLULAR DEVICE GATEWAY RUNNING → PORT", PORT))
