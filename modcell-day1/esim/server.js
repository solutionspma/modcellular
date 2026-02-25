import express from "express"
import cors from "cors"
import fetch from "node-fetch"
import { v4 as uuid } from "uuid"
import fs from "fs"

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 7075
const FILE = "./orders.json"
const SMDP_BASE_URL = process.env.SMDP_BASE_URL || ""
const SMDP_API_KEY = process.env.SMDP_API_KEY || ""

if(!fs.existsSync(FILE)) fs.writeFileSync(FILE, JSON.stringify([],null,2))

function read(){ return JSON.parse(fs.readFileSync(FILE)) }
function write(v){ fs.writeFileSync(FILE, JSON.stringify(v,null,2)) }

app.get("/orders",(req,res)=> res.json({ ok:true, data: read() }))

app.post("/orders", async (req,res)=>{
  const orders = read()
  const id = uuid()
  const order = { id, status:"CREATED", createdAt: Date.now(), ...req.body }
  orders.unshift(order); write(orders)

  if(SMDP_BASE_URL && SMDP_API_KEY){
    try{
      const r = await fetch(`${SMDP_BASE_URL}/orders`, {
        method:"POST",
        headers:{ "Authorization":`Bearer ${SMDP_API_KEY}`, "Content-Type":"application/json" },
        body: JSON.stringify(order)
      })
      const data = await r.json().catch(()=> ({}))
      order.status = r.ok ? "SUBMITTED_TO_SMDP" : "SMDP_ERROR"
      order.smdp = data
      write([order, ...orders.filter(o=>o.id!==id)])
    }catch(e){
      order.status = "SMDP_ERROR"
      order.smdp = { error:String(e) }
      write([order, ...orders.filter(o=>o.id!==id)])
    }
  }

  res.status(201).json({ ok:true, id })
})

app.listen(PORT, ()=> console.log("eSIM bridge on", PORT))
