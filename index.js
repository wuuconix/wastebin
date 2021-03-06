const express = require("express")
const bodyParser = require('body-parser')
const { writeFile, access } = require("fs/promises")
const { v4: uuidv4 } = require('uuid');
const app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static("static"))

app.post("/documents", (req, res) => {
    const data = req.body.data ?? ""
    if (data == "") {
        res.json({error: "data must be provided and not empty"}) //解决undefined和空字符串两种不合理情况
        return
    }
    const filename = uuidv4().replace(/-/g, "")
    writeFile(`./data/${filename}`, data).then(() => {
        res.json({success: "ok", filename})
    })
    console.log(`${"-".repeat(14)}uuid${"-".repeat(14)}\n${filename}\n${"-".repeat(12)}content${"-".repeat(13)}\n${data}\n${"-".repeat(32)}`)
})

app.get(/\/raw\/\w{32}/, (req, res) => { //获得text/plain接口
    const filename = req._parsedUrl.pathname.slice(5)
    access(`./data/${filename}`).then(() => {
        res.setHeader("Content-Type", "text/plain;charset=UTF-8")
        res.sendFile(`${__dirname}/data/${filename}`)
    }).catch(e => {
        res.json({error: e.toString()})
    })
})

app.get(/\/md\//, (req, res) => {
    res.setHeader("Content-Type", "text/html")
    res.sendFile(`${__dirname}/static/markdown.html`)
})

app.get(/\/mm\//, (req, res) => {
    res.setHeader("Content-Type", "text/html")
    res.sendFile(`${__dirname}/static/mindmap.html`)
})

app.get(/[\/,\/\w{32}]/, (req, res) => {
    res.setHeader("Content-Type", "text/html")
    res.sendFile(`${__dirname}/static/index.html`)
})

app.listen(7777, "0.0.0.0", () => {
    console.log("server is listenning in http://127.0.0.1:7777")
})