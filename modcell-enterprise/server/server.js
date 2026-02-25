const express = require("express")
const cors = require("cors")
const fs = require("fs")

const app = express()
app.use(cors())
app.use(express.json())

function getPolicy(){
  return JSON.parse(fs.readFileSync("./policies.json"))
}

app.get("/policy",(req,res)=>{
  res.json(getPolicy())
})

app.post("/policy",(req,res)=>{
  fs.writeFileSync("./policies.json", JSON.stringify(req.body,null,2))
  res.json({ok:true})
})

app.listen(7070,()=>console.log("Policy server running 7070"))
