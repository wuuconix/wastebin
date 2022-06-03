const express = require("express")
const bodyParser = require('body-parser')
const { writeFile, access } = require("fs/promises")
const { v4: uuidv4 } = require('uuid');
const exp = require("constants");
const app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static("static"))

app.post("/documents", (req, res) => {
    const data = req.body.data
    console.log(data)
    const filename = uuidv4().replace(/-/g, "")
    writeFile(`./data/${filename}`, data).then(() => {
        res.json({success: "ok", filename})
    })
})

app.get(/\/raw\/\w{32}/, (req, res) => { //获得text/plain接口
    console.log()
    const filename = req._parsedUrl.pathname.slice(5)
    access(`./data/${filename}`).then(() => {
        res.setHeader("Content-Type", "text/plain;charset=UTF-8")
        res.sendFile(`${__dirname}/data/${filename}`)
    }).catch(e => {
        res.json({error: e.toString()})
    })
})

app.get(/[\/,\/\w{32}]/, (req, res) => {
    res.setHeader("Content-Type", "text/html")
    res.sendFile(`${__dirname}/static/index.html`)
})


app.listen(3000, "0.0.0.0", () => {
    console.log("server is listenning in http://127.0.0.1:3000")
})