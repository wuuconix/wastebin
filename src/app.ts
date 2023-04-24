// @ts-ignore 这里由于没有使用--resolveJsonModule 编译会报错，但是不影响实际运行
import config from "../config.json" assert { type: "json" }

window.addEventListener("hashchange", () => {
  fetchHtml()
})

async function fetchHtml() {
  const filename = location.hash.slice(1) ?? ""
  console.log(filename)
  if (filename) {
    const html = await (await fetch(`${config.api}/parse/${filename}`)).text()
    const div = document.querySelector("div.markdown-body")!
    div.innerHTML = html
  }
}

fetchHtml()