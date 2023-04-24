Link:

https://paste.wuuconix.link

Huge Thanks To:

+ [marked](https://github.com/markedjs/marked) 快速markdown渲染
+ [highlight.js](https://github.com/highlightjs/highlight.js) 优秀代码高亮
+ [github-markdown-css](https://github.com/sindresorhus/github-markdown-css) 漂亮的markdown css样式

Run

```bash
cd /var/www
git clone https://github.com/wuuconix/wastebin
cd wastebin
npm i
npm run build
# change the wastebin.conf (the nginx conf)
# and change the config.json
npm run conf
```