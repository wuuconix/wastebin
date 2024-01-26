Hello there.😽

This is [wastebin](https://github.com/wuuconix/wastebin) written by [wuuconix](https://github.com/wuuconix).

In wastebin, you can preview `hihglighted code`!

```ts
const gretting: string = "hello world"
console.log(greeting)
```

And here is a random 👉[**setu**](#setu)👈 as your gift!

<div id="setuArea" style="display: none; justify-content: space-between;">

<div id="animateName" style="display: none">

> And Make It Animate! 💕

+ [bounce](#bounce)
+ [flash](#flash)
+ [pulse](#pulse)
+ [rubberBand](#rubberBand)
+ [shakeX](#shakeX)
+ [shakeY](#shakeY)
+ [headShake](#headShake)
+ [swing](#swing)
+ [tada](#tada)
+ [wobble](#wobble)
+ [jello](#jello)
+ [heartBeat](#heartBeat)
+ [...](https://animate.style/)

</div>

<img id="setu" alt="setu" class="animate__animated animate__infinite" style="animation-duration: 3s;">

</div>

<script>
const setuArea = document.querySelector("#setuArea")
const setu = document.querySelector("#setu")
const animateName = document.querySelector("#animateName")
let prevHash = location.hash

if (location.hash != "") {
    setuArea.style.display = "flex"
    setu.src = getRandomSetuSrc()
    setu.classList.add(`animate__${location.hash.replace("#", "").replace("animate__", "")}`)
}

window.onhashchange = () => {
    if (location.hash == "#setu") {
        setuArea.style.display = "flex"
        setu.src = getRandomSetuSrc()
        prevHash = location.hash
        return
    }

    if (location.hash != "#") {
        setu.classList.remove(`animate__${prevHash.replace("#", "").replace("animate__", "")}`)
        setu.classList.add(`animate__${location.hash.replace("#", "").replace("animate__", "")}`)
        prevHash = location.hash
    }
}

setu.onload = () => {
    animateName.style.display = "block"
    animateName.classList.add("animate__animated")
    animateName.classList.add("animate__backInLeft")
}

setu.onerror = () => {
    setu.src = `https://api.wuuconix.link/setu?redirect&no-store&r18=${r18}&r=${Math.random()}`
}

function getRandomSetuSrc() {
    const r18 = new URLSearchParams(location.search).get("r18") ?? 0 
    const src = new URLSearchParams(location.search).get("src")
    
    if (src) {
        return src
    }

    return `https://api.wuuconix.link/setu?redirect&no-store&r18=${r18}&r=${Math.random()}`
}
</script>