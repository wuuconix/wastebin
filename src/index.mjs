import { marked } from "marked"
import hljs from "highlight.js"
import express from "express"
import { access, readFile, writeFile } from "fs/promises"
import { createRequire } from "module"
import { dirname, normalize, extname } from 'path'
import { fileURLToPath } from 'url'

const require = createRequire(import.meta.url)
const config = require("../config.json")

const __dirname = dirname(fileURLToPath(import.meta.url))

const app = express()
app.use(express.urlencoded({ extended: true, limit: '10mb' }))   // 支持post body获取

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

async function renderPreviewPage(filename) {
  const path = normalize(`${__dirname}/../data/${filename}`)
  let md = await readFile(path, { encoding: "utf-8" })

  if (extname(filename) != ".md") {
    const rawMark = `🔍raw: ${config.api}/raw/${filename}\n`
    md = rawMark + "```" + (extname(filename).slice(1) ?? "") + "\n" + md + "\n" + "```"
  }

  const mdHtml = parseMdToHtml(md)

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://cn.bing.com/sa/simg/favicon-trans-bg-blue-mg.ico" data-orighref="" rel="icon" />
  <link rel="stylesheet" href="https://static.wuuconix.link/gh/highlightjs/highlight.js@latest/src/styles/github.css">
  <link rel="stylesheet" href="https://static.wuuconix.link/npm/github-markdown-css@latest/github-markdown-light.css">
  <link rel="stylesheet" href="https://static.wuuconix.link/ajax/libs/animate.css/4.1.1/animate.min.css"/>
  <title>${filename} | Wastebin</title>
  <style>
    html, body, iframe {
      height: 100%;
      margin: 0;
      padding: 0;
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
<body ondrop="dropHandler(event)" ondragover="dragOverHandler(event)">
  <div class="markdown-body">${mdHtml}</div>
</body>

<script>
  function dragOverHandler(ev) {
    ev.preventDefault()
  }

  function dropHandler(ev) {
    ev.preventDefault()

    if (ev.dataTransfer.items) {
      for (let i = 0; i < ev.dataTransfer.items.length; i++) {
        if (ev.dataTransfer.items[i].kind === "file") {
          const file = ev.dataTransfer.items[i].getAsFile()
          handleFile(file)
          break
        }
      }
    } else {
      for (let i = 0; i < ev.dataTransfer.files.length; i++) {
        const file = ev.dataTransfer.files[0]
        handleFile(file)
        break
      }
    }
  }

  function handleFile(file) {
    if (file.type == "" || file.type.startsWith("text")) {
      console.log(file)
      const reader = new FileReader()
      reader.readAsText(file, 'UTF-8')
      reader.onload = async (e) => {
        console.log(e.target.result)
        const res = await (await fetch("/add/" + file.name, {
          method: "post",
          body: new URLSearchParams({ code: e.target.result })
        })).json()

        if (res.url) {
          location.assign(res.url)
        }
      }
    } else {
      console.log("不支持上传" + file.type + "格式的文件")
    }
  }
</script>
</html>
`
}

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
  try {
    console.log(filename)
    return res.send(await renderPreviewPage(filename))
  } catch(e) {
    console.log(e)
    return res.status(404).send("no such file")
  }

})

app.get("/", async (req, res) => {
  try {
    return res.send(await renderPreviewPage("hello.md"))
  } catch(e) {
    console.log(e)
    return res.status(500).send("failed to load default page")
  }
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
