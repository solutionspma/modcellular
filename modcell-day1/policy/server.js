import express from "express"
import cors from "cors"
import fs from "fs"

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 7074
const PATH = "./policy.json"

if(!fs.existsSync(PATH)){
  fs.writeFileSync(PATH, JSON.stringify({
    apn: { name:"MODCELL", apn:"internet", mcc:"001", mnc:"01", type:"default,supl,ims" },
    telemetry: { postUrl:"http://YOUR_PUBLIC_HOST:7072/telemetry", intervalSec:30 }
  }, null, 2))
}

app.get("/policy",(req,res)=> res.json(JSON.parse(fs.readFileSync(PATH))))
app.post("/policy",(req,res)=> { fs.writeFileSync(PATH, JSON.stringify(req.body,null,2)); res.json({ok:true}) })

app.listen(PORT, ()=> console.log("Policy server on", PORT))
