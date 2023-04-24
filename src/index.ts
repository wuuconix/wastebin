import { marked } from "marked"
// @ts-ignore 这个错误是@types/highlightjs 没有点导致的
import hljs from "highlight.js"
import express from "express"
import { access, readFile, writeFile } from "fs/promises"
import { dirname, normalize, extname } from 'path'
import { fileURLToPath } from 'url'
// @ts-ignore 导入json
import config from "../config.json" assert { type: "json" }

const __dirname = dirname(fileURLToPath(import.meta.url))

const app = express()
app.use(express.urlencoded({ extended: true }))   // 支持post body获取

app.post("/add/:filename", async (req, res) => {
  let { filename } = req.params               // e.g index.js
  const ext = extname(filename)               // .js
  const pre = filename.slice(0, -ext.length)  // index
  filename = `${getTime()}_${pre}${ext}`      // 20230424124000_index.js
  const path = normalize(`${__dirname}/../data/${filename}`)
  try {
    const { code } = req.body
    await writeFile(path, code)
    return res.json({ url: `${config.api}/raw/${filename}` })
  } catch(e) {
    console.log(e)
    return res.json({ err: "failed to write" })
  }
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
    console.log(e)
    return res.json({ err: "no such file" })
  }
})

app.get("/parse/:filename", async (req, res) => {
  const { filename } = req.params
  const path = normalize(`${__dirname}/../data/${filename}`)
  try {
    log(`/parse/${filename}`)
    let md = await readFile(path, { encoding: "utf-8" })
    if (extname(filename) != ".md") {    // 如果不是md，则加上代码区域```变成md
      md = "```" + (extname(filename).slice(1) ?? "") + "\n" + md + "\n" + "```"
    }
    const html = parseMdToHtml(md)
    res.setHeader("Content-Type", "text/plain;charset=UTF-8")
    return res.send(html)
  } catch(e) {
    console.log(e)
    return res.json({ err: "no such file" })
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

function getTime(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hour = String(date.getHours()).padStart(2, "0")
  const min = String(date.getMinutes()).padStart(2, "0")
  const sec = String(date.getSeconds()).padStart(2, "0")
  return `${year}${month}${day}${hour}${min}${sec}`
}