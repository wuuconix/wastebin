// @ts-ignore 这里由于没有使用--resolveJsonModule 编译会报错，但是不影响实际运行
import config from "../config.json" assert { type: "json" }

window.addEventListener("hashchange", () => {
  fetchHtml()
})

async function fetchHtml() {
  const filename = location.hash.slice(1) || "hello.md"
  console.log(filename)
  if (filename) {
    const html = await (await fetch(`${config.api}/parse/${filename}`)).text()
    iframe.srcdoc =  `
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Wastebin</title>
  <link rel="stylesheet" href="https://jsd.onmicrosoft.cn/gh/highlightjs/highlight.js@latest/src/styles/github.css">
  <link rel="stylesheet" href="https://jsd.onmicrosoft.cn/npm/github-markdown-css@latest/github-markdown-light.css">
  <style>
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
<div class="markdown-body">${html}</div>
`
  }
}

const iframe = document.querySelector("iframe")!
fetchHtml()