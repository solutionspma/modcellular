import express from "express"
import cors from "cors"
import { MongoClient } from "mongodb"

const app = express()
app.use(cors())
app.use(express.json())

const MONGO_URI = process.env.MONGO_URI
const PORT = process.env.PORT || 7071

const client = new MongoClient(MONGO_URI)
await client.connect()
const db = client.db()
const subs = db.collection("subscribers")

app.post("/subscribers", async (req,res)=>{
  try{
    const { imsi, key, opc, amf="8000", apn="internet" } = req.body
    if(!imsi || !key || !opc) return res.status(400).json({ok:false, error:"imsi,key,opc required"})
    const doc = {
      imsi,
      security: { k: key, opc, amf },
      slice: [{ sst: 1, sd: "010203" }],
      ambr: { downlink: { value: 1, unit: 3 }, uplink: { value: 1, unit: 3 } },
      access_restriction_data: 32,
      subscriber_status: 0,
      network_access_mode: 2,
      subscribed_rau_tau_timer: 12,
      subscribed_dnn_list: [{ dnn: apn, default_indicator: true }],
      created_at: new Date()
    }
    const exists = await subs.findOne({ imsi })
    if(exists) return res.status(409).json({ok:false, error:"IMSI exists"})
    await subs.insertOne(doc)
    res.json({ ok:true, imsi })
  }catch(e){ res.status(500).json({ok:false, error:String(e)}) }
})

app.get("/subscribers", async (req,res)=>{
  const all = await subs.find({}).limit(200).toArray()
  res.json({ok:true, data: all})
})

app.post("/subscribers/:imsi/suspend", async (req,res)=>{
  const { imsi } = req.params
  await subs.updateOne({ imsi }, { $set: { subscriber_status: 1 } })
  res.json({ok:true})
})

app.post("/subscribers/:imsi/resume", async (req,res)=>{
  const { imsi } = req.params
  await subs.updateOne({ imsi }, { $set: { subscriber_status: 0 } })
  res.json({ok:true})
})

app.listen(PORT, ()=> console.log("Provisioning API on", PORT))
