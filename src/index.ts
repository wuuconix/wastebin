import { marked } from "marked"
import hljs from "highlight.js"
import express from "express"
import { access, readFile } from "fs/promises"
import { dirname, normalize, extname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const app = express()
app.post("/add", (req, res) => {

})

const mimeTypeMap = new Map([
  [".js", "text/javascript"],
  [".css", "text/css"]
])

app.get("/raw/:filename", async (req, res) => {
  const { filename } = req.params
  const path = normalize(`${__dirname}/../data/${filename}`)
  try {
    log(`/raw/${filename}`)
    await access(path)
    const mimeType = mimeTypeMap.get(extname(filename)) ?? "text/plain"
    res.setHeader("Content-Type", `${mimeType};charset=UTF-8`)
    return res.sendFile(path)
  } catch(e) {
    return res.json({ err: "no such file" })
  }
})

app.get("/parse/:filename", async (req, res) => {
  const { filename } = req.params
  const path = normalize(`${__dirname}/../data/${filename}`)
  try {
    log(`/parse/${filename}`)
    const md = await readFile(path, { encoding: "utf-8" })
    const html = parseMdToHtml(md)
    res.setHeader("Content-Type", "text/plain;charset=UTF-8")
    return res.send(html)
  } catch(e) {
    return res.json(JSON.stringify(e))
  }
})

app.listen(7777, "0.0.0.0", () => {
  console.log("server is listenning in http://127.0.0.1:7777")
})

marked.setOptions({
  highlight(code, lang) {
    return hljs.highlightAuto(code, [lang]).value
  },
  langPrefix: 'hljs language-'
})

function parseMdToHtml(md: string): string {
  return marked.parse(md)
}

function log(msg: string): void {
  console.log(`${new Date().toLocaleString()}:\n${msg}`)
}