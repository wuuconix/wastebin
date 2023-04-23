// @ts-ignore 这里由于没有使用--resolveJsonModule 编译会报错，但是不影响实际运行
import config from "../config.json" assert { type: "json" };
const filename = location.hash.slice(1) ?? "";
console.log(filename);
if (filename) {
    const html = await (await fetch(`${config.api}/${filename}`)).text();
    const div = document.querySelector("div.markdown-body");
    div.innerHTML = html;
}
