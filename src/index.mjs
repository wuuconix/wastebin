import { marked } from "marked"
import hljs from "highlight.js"
import express from "express"
import { access, readFile, writeFile } from "fs/promises"
import { dirname, normalize, extname } from 'path'
import { fileURLToPath } from 'url'
import config from "../config.json" assert { type: "json" }

const __dirname = dirname(fileURLToPath(import.meta.url))

const app = express()
app.use(express.urlencoded({ extended: true }))   // 支持post body获取

/* add接口 用于新增文件 */
app.post("/add/:filename", async (req, res) => {
  let { filename } = req.params               // e.g index.js
  const ext = extname(filename)               // .js
  const pre = filename.slice(0, -ext.length)  // index
  filename = `${getTime()}_${pre}${ext}`      // 20230424124000_index.js
  const path = normalize(`${__dirname}/../data/${filename}`)
  try {
    const { code } = req.body
    await writeFile(path, code)
    return res.json({ url: `${config.api}/${filename}` })
  } catch(e) {
    console.log(e)
    return res.json({ err: "failed to write" })
  }
})

const mimeTypeMap = new Map([
  [".js", "text/javascript"],
  [".css", "text/css"]
])

/* raw接口 返回文件的源码 */
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

/* parse接口 将各类编程语言转成md中的代码块从而获得高亮提示 */
app.get("/parse/:filename", async (req, res) => {
  const { filename } = req.params
  const path = normalize(`${__dirname}/../data/${filename}`)
  try {
    log(`/parse/${filename}`)
    let md = await readFile(path, { encoding: "utf-8" })
    if (extname(filename) != ".md") {    // 如果不是md，则加上代码区域```变成md
      const rawMark = `🔍raw: ${config.api}/raw/${filename}\n`
      md = rawMark + "```" + (extname(filename).slice(1) ?? "") + "\n" + md + "\n" + "```"
    }
    const html = parseMdToHtml(md)
    res.setHeader("Content-Type", "text/plain;charset=UTF-8")
    return res.send(html)
  } catch(e) {
    console.log(e)
    return res.json({ err: "no such file" })
  }
})

/* 预览文件 */
app.get("/:filename", async (req, res) => {
  const filename = req.params.filename || "hello.md"
  console.log(filename)

  const mdHtml = await (await fetch(`${config.api}/parse/${filename}`)).text()
  const mdHtmlBase64 = utf8ToB64(mdHtml)

  const html = `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://cn.bing.com/sa/simg/favicon-trans-bg-blue-mg.ico" data-orighref="" rel="icon" />
    <link rel="stylesheet" href="https://jsd.onmicrosoft.cn/gh/highlightjs/highlight.js@latest/src/styles/github.css">
    <link rel="stylesheet" href="https://jsd.onmicrosoft.cn/npm/github-markdown-css@latest/github-markdown-light.css">
    <title>${filename} | Wastebin</title>
    <style>
      html, body, iframe {
        height: 100%;
        margin: 0;
        padding: 0;
      }
      body {
        overflow: hidden;
      }
      iframe {
        width: 100%;
        border: 0;
      }
      .markdown-body {
        box-sizing: border-box;
        min-width: 200px;
        max-width: 1200px;
        margin: 0 auto;
        padding: 45px;
      }
      @media (max-width: 767px) {
        .markdown-body {
          padding: 15px;
        }
      }
    </style>
  </head>
  <body>
    <iframe></iframe>
  </body>

  <script>
    function b64ToUtf8(str) {
      return decodeURIComponent(escape(window.atob(str)));
    }
    const base64_1 = "PGhlYWQ+PG1ldGEgY2hhcnNldD0iVVRGLTgiPjxtZXRhIGh0dHAtZXF1aXY9IlgtVUEtQ29tcGF0aWJsZSIgY29udGVudD0iSUU9ZWRnZSI+PG1ldGEgbmFtZT0idmlld3BvcnQiIGNvbnRlbnQ9IndpZHRoPWRldmljZS13aWR0aCwgaW5pdGlhbC1zY2FsZT0xLjAiPjxsaW5rIHJlbD0ic3R5bGVzaGVldCIgaHJlZj0iaHR0cHM6Ly9qc2Qub25taWNyb3NvZnQuY24vZ2gvaGlnaGxpZ2h0anMvaGlnaGxpZ2h0LmpzQGxhdGVzdC9zcmMvc3R5bGVzL2dpdGh1Yi5jc3MiPjxsaW5rIHJlbD0ic3R5bGVzaGVldCIgaHJlZj0iaHR0cHM6Ly9qc2Qub25taWNyb3NvZnQuY24vbnBtL2dpdGh1Yi1tYXJrZG93bi1jc3NAbGF0ZXN0L2dpdGh1Yi1tYXJrZG93bi1saWdodC5jc3MiPjxzdHlsZT4ubWFya2Rvd24tYm9keSB7Ym94LXNpemluZzogYm9yZGVyLWJveDttaW4td2lkdGg6IDIwMHB4O21heC13aWR0aDogMTIwMHB4O21hcmdpbjogMCBhdXRvO3BhZGRpbmc6IDQ1cHg7fUBtZWRpYSAobWF4LXdpZHRoOiA3NjdweCkgey5tYXJrZG93bi1ib2R5IHtwYWRkaW5nOiAxNXB4O319PC9zdHlsZT48L2hlYWQ+PGRpdiBjbGFzcz0ibWFya2Rvd24tYm9keSI+"
    const base64_2 = "${mdHtmlBase64}"
    const base64_3 = "PC9kaXY+"

    const srcDoc = b64ToUtf8(base64_1) + b64ToUtf8(base64_2) + b64ToUtf8(base64_3)
    const blob = new Blob([srcDoc], {
      type: "text/html",
    });
    const url = URL.createObjectURL(blob);
    console.log(url)

    document.querySelector("iframe").src = url
  </script>
</html>
`

  return res.send(html)
})

app.get("/", async (req, res) => {
  const html = await (await fetch(`${config.api}/hello.md`)).text()
  return res.send(html)
})

app.listen(7777, "0.0.0.0", () => {
  console.log(`server is listenning in ${config.api}`)
})

marked.setOptions({
  highlight(code, lang) {
    return hljs.highlightAuto(code, [lang]).value
  },
  langPrefix: 'hljs language-'
})

function parseMdToHtml(md) {
  return marked.parse(md)
}

function log(msg) {
  console.log(`${new Date().toLocaleString()}:\n${msg}`)
}

function getTime() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hour = String(date.getHours()).padStart(2, "0")
  const min = String(date.getMinutes()).padStart(2, "0")
  const sec = String(date.getSeconds()).padStart(2, "0")
  return `${year}${month}${day}${hour}${min}${sec}`
}

function utf8ToB64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}