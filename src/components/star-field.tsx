import { useEffect, useRef } from "react"

// Where the pole star sits, as a fraction of the hero's width and height.
const POLE = { x: 0.78, y: 0.3 }

/**
 * Hero backdrop. Dhruv means the pole star: the sky turns, it stays put.
 * So every star here slowly circles one fixed star, leaving a short trail
 * like a long-exposure photo. Stars near the cursor light up, and clicking
 * one reports it through `onPick` (null when the click misses every star).
 */
export type StarPick = { index: number; x: number; y: number } | null

export function StarField({ className, onPick }: { className?: string; onPick?: (pick: StarPick) => void }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const pick = useRef(onPick)
  pick.current = onPick

  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext("2d")!
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches
    // colours come from the theme, so the sky follows index.css
    const css = getComputedStyle(canvas)
    const brand = css.getPropertyValue("--brand")
    const ink = css.getPropertyValue("--foreground")
    const mouse = { x: -9999, y: -9999 }
    const SPEED = 0.00003 // radians per ms: one full turn in about 3.5 minutes
    const TRAIL = 0.14 // radians of arc each star drags behind it
    let w = 0
    let h = 0
    let raf = 0
    let now = 0 // time of the last drawn frame, so clicks hit what is on screen
    let ping = { x: 0, y: 0, t: -1e9 } // ring that expands from a clicked star
    const HIT = 26 // px: stars are tiny, so clicks get a generous radius
    const pole = () => ({ px: w * POLE.x, py: w < 768 ? 150 : h * POLE.y })
    // nearest star to a point, among those the mask leaves visible
    const nearest = (mx: number, my: number) => {
      const { px, py } = pole()
      let best = -1
      let bestD = HIT
      stars.forEach((s, i) => {
        if (s.r > Math.max(w, h) * 0.4) return
        const a = s.a - now * SPEED
        const d = Math.hypot(px + Math.cos(a) * s.r - mx, py + Math.sin(a) * s.r - my)
        if (d < bestD) [best, bestD] = [i, d]
      })
      return best
    }
    let stars: { r: number; a: number; size: number; alpha: number }[] = []

    const resize = () => {
      const dpr = devicePixelRatio || 1
      w = canvas.offsetWidth
      h = canvas.offsetHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      // sqrt keeps the stars evenly spread over the disc instead of bunched at the pole
      const reach = Math.hypot(w, h) * 0.7
      const count = Math.round(Math.min(560, (w * h) / 2200))
      stars = Array.from({ length: count }, () => ({
        r: 24 + Math.sqrt(Math.random()) * reach,
        a: Math.random() * Math.PI * 2,
        size: 0.7 + Math.random() * 1.1,
        alpha: 0.25 + Math.random() * 0.5,
      }))
      if (reduce) draw(0)
    }
    const move = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      mouse.x = e.clientX - r.left
      mouse.y = e.clientY - r.top
      canvas.parentElement!.style.cursor = nearest(mouse.x, mouse.y) < 0 ? "" : "pointer"
    }
    const click = (e: MouseEvent) => {
      // links, buttons and the open project card keep their own clicks
      if ((e.target as Element).closest("a, button, [data-star-card]")) return
      const r = canvas.getBoundingClientRect()
      const x = e.clientX - r.left
      const y = e.clientY - r.top
      const index = nearest(x, y)
      if (index >= 0) ping = { x, y, t: now }
      pick.current?.(index < 0 ? null : { index, x, y })
      if (reduce) draw(0)
    }
    const draw = (t: number) => {
      now = t
      ctx.clearRect(0, 0, w, h)
      // on phones the hero is taller than the screen, so pin the star near the top
      const { px, py } = pole()
      ctx.lineCap = "round"

      for (const s of stars) {
        const a = s.a - t * SPEED // counter-clockwise, like the northern sky
        const x = px + Math.cos(a) * s.r
        const y = py + Math.sin(a) * s.r
        if (x < -40 || x > w + 40 || y < -40 || y > h + 40) continue
        const near = Math.max(0, 1 - Math.hypot(x - mouse.x, y - mouse.y) / 150)
        ctx.strokeStyle = ctx.fillStyle = near > 0.05 ? brand : ink
        ctx.globalAlpha = Math.min(1, s.alpha + near * 0.6)
        ctx.lineWidth = s.size + near * 1.2
        ctx.beginPath()
        ctx.arc(px, py, s.r, a, a + TRAIL)
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(x, y, s.size * 1.3 + near * 1.6, 0, Math.PI * 2)
        ctx.fill()
      }

      const age = (t - ping.t) / 700
      if (age < 1 && !reduce) {
        ctx.strokeStyle = brand
        ctx.lineWidth = 2
        ctx.globalAlpha = 1 - age
        ctx.beginPath()
        ctx.arc(ping.x, ping.y, 6 + age * 44, 0, Math.PI * 2)
        ctx.stroke()
      }

      // the pole star: fixed, with a slow pulse
      const pulse = reduce ? 0.5 : (Math.sin(t * 0.002) + 1) / 2
      ctx.fillStyle = ctx.strokeStyle = brand
      ctx.lineWidth = 1
      for (const [radius, alpha] of [[34 + pulse * 10, 0.12], [20 + pulse * 5, 0.25]]) {
        ctx.globalAlpha = alpha
        ctx.beginPath()
        ctx.arc(px, py, radius, 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.globalAlpha = 1
      const R = 11 + pulse * 2
      ctx.beginPath()
      ctx.moveTo(px, py - R)
      ctx.quadraticCurveTo(px, py, px + R, py)
      ctx.quadraticCurveTo(px, py, px, py + R)
      ctx.quadraticCurveTo(px, py, px - R, py)
      ctx.quadraticCurveTo(px, py, px, py - R)
      ctx.fill()

      if (!reduce) raf = requestAnimationFrame(draw)
    }

    resize()
    addEventListener("resize", resize)
    addEventListener("pointermove", move)
    addEventListener("click", click)
    if (!reduce) raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      removeEventListener("resize", resize)
      removeEventListener("pointermove", move)
      removeEventListener("click", click)
    }
  }, [])

  return <canvas ref={ref} aria-hidden className={className} />
}
