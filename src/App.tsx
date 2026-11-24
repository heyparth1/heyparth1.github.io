import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react"
import {
  AnimatePresence,
  MotionConfig,
  animate,
  motion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react"
import { ArrowDown, ArrowUpRight, Play } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { StarField } from "@/components/star-field"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CATEGORIES, FEATURED, GITHUB, MORE, STACK, type Featured } from "@/projects"
import { cn } from "@/lib/utils"
import photo from "@/assets/dhruv.jpg"

// Hero numbers, all from real projects (see projects.tsx).
const NUMBERS = [
  { to: 8, label: "open-source PRs merged" },
  { to: 96, suffix: "%", label: "of Gemini, on a local 4B model" },
  { to: 22.1, decimals: 1, label: "ternary LLM perplexity" },
]

// ── Building blocks ─────────────────────────────────────────────────────
const EASE = [0.22, 1, 0.36, 1] as const

function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

function SectionHeading({ index, label, title }: { index: string; label: string; title: ReactNode }) {
  return (
    <Reveal className="mb-12">
      <p className="font-mono text-xs tracking-widest text-brand uppercase">
        {index} / {label}
      </p>
      <h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h2>
    </Reveal>
  )
}

/** Card that tilts toward the cursor and shows a spotlight under it. */
function TiltCard({ project }: { project: Featured }) {
  const ref = useRef<HTMLDivElement>(null)
  const spring = { stiffness: 180, damping: 18 }
  const rotateX = useSpring(0, spring)
  const rotateY = useSpring(0, spring)
  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return
    const r = ref.current!.getBoundingClientRect()
    const x = e.clientX - r.left
    const y = e.clientY - r.top
    rotateY.set((x / r.width - 0.5) * 5)
    rotateX.set(-(y / r.height - 0.5) * 5)
  }
  const onLeave = () => {
    rotateX.set(0)
    rotateY.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      className="group h-full"
    >
      <Card
        className={cn(
          "relative h-full rounded-2xl p-0 ring-0",
          project.wide ? "dark bg-background text-foreground" : "border-2 border-foreground bg-card",
        )}
      >
        <div className={cn("relative grid h-full gap-8 p-7", project.wide && "md:grid-cols-2 md:items-center md:p-10")}>
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className={cn("font-semibold tracking-tight", project.wide ? "text-3xl sm:text-4xl" : "text-2xl")}>
                {project.name}
              </h3>
              {project.href && <ArrowUpRight className="size-5 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand" />}
            </div>
            <Points points={project.points} />
            <Tags tags={project.tags} />
          </div>
          <div className={cn(!project.wide && "self-end")}>{project.visual}</div>
        </div>
        <CardLink href={project.href} name={project.name} />
      </Card>
    </motion.div>
  )
}

function Points({ points, className }: { points: string[]; className?: string }) {
  return (
    <ul className={cn("space-y-2 leading-snug text-muted-foreground", className)}>
      {points.map((point) => (
        <li key={point} className="flex gap-2.5">
          <span aria-hidden className="mt-[0.5em] size-1.5 shrink-0 bg-brand" />
          {point}
        </li>
      ))}
    </ul>
  )
}

function Tags({ tags }: { tags: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((t) => (
        <Badge key={t} variant="secondary" className="font-mono">
          {t}
        </Badge>
      ))}
    </div>
  )
}

/** Invisible link stretched over a card, so the whole card is clickable. */
function CardLink({ href, name }: { href?: string; name: string }) {
  if (!href) return null
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={`${name} on GitHub`}
      className="absolute inset-0 rounded-2xl outline-none focus-visible:ring-3 focus-visible:ring-ring"
    />
  )
}

/** The rest of the projects, filterable by category. */
function MoreWork() {
  const [filter, setFilter] = useState<string>("all")
  const shown = MORE.filter((p) => filter === "all" || p.category === filter)

  return (
    <div className="mt-24">
      <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <h3 className="text-3xl font-semibold tracking-tight">
          More <span className="text-brand">work</span>
        </h3>
        <Tabs value={filter} onValueChange={(v) => setFilter(String(v))} className="max-w-full overflow-x-auto">
          <TabsList className="h-10! rounded-full p-1">
            {CATEGORIES.map((c) => (
              <TabsTrigger key={c} value={c} className="rounded-full px-2.5 capitalize sm:px-3.5">
                {c}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </Reveal>

      <Reveal>
        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {shown.map((p) => (
              <motion.li
                key={p.name}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                <Card className="group relative h-full gap-3 rounded-2xl border-2 border-foreground bg-card p-6 ring-0 transition-transform duration-300 hover:-translate-y-1">
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="text-xl font-semibold tracking-tight">{p.name}</h4>
                    {p.href && <ArrowUpRight className="size-5 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand" />}
                  </div>
                  <p className="font-mono text-xs text-brand">{p.stat}</p>
                  <Points points={p.points} className="flex-1 text-sm" />
                  <Tags tags={p.tags} />
                  <CardLink href={p.href} name={p.name} />
                  {p.demo && (
                    // z-10 keeps it clickable above the stretched card link
                    <a href={p.demo} target="_blank" rel="noreferrer" className={cn(textLink, "relative z-10 self-start text-sm")}>
                      <Play className="fill-current" /> Watch demo
                    </a>
                  )}
                </Card>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </Reveal>
    </div>
  )
}

function CountUp({ to, decimals = 0, suffix = "" }: { to: number; decimals?: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const done = to.toFixed(decimals) + suffix
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const controls = animate(0, to, {
      duration: 1.6,
      delay: 0.8,
      ease: EASE,
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = v.toFixed(decimals) + suffix
      },
    })
    return () => controls.stop()
  }, [to, decimals, suffix])
  return <span ref={ref}>{done}</span>
}

const textLink =
  "group inline-flex items-center gap-1.5 border-b border-foreground pb-1 font-medium transition-colors hover:border-brand hover:text-brand [&_svg]:size-4"

function Hero() {
  return (
    <section className="relative flex min-h-svh flex-col justify-end overflow-hidden px-6 pt-32 pb-10">
      <StarField className="absolute inset-0 size-full [mask-image:radial-gradient(ellipse_at_78%_150px,black_10%,transparent_65%)] md:[mask-image:radial-gradient(ellipse_at_78%_30%,black_20%,transparent_62%)]" />

      <div className="relative mx-auto w-full max-w-6xl">
        <h1 className="text-[clamp(2.75rem,11.5vw,9.5rem)] leading-[0.95] font-semibold tracking-tighter">
          {["Dhruv", "Sharma"].map((word, i) => (
            // each word slides up out of its own clipped line
            <span key={word} className="block overflow-hidden pb-[0.08em]">
              <motion.span
                className="block"
                initial={{ y: "105%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.9, delay: 0.1 + i * 0.12, ease: EASE }}
              >
                {word}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.div
          className="mt-10 grid gap-8 md:grid-cols-[3fr_1fr] md:items-end"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55, ease: EASE }}
        >
          <p className="max-w-2xl text-xl leading-snug text-balance sm:text-2xl">
            <span className="font-semibold text-brand">IIT Patna</span> graduate, now building AI systems at Windflow
            AI.{" "}
            <span className="text-muted-foreground">
              Lately that means an agent that fixes open-source bugs, analytics that run on a small local model, and
              language models squeezed down to −1, 0 and +1.
            </span>
          </p>
          <div className="flex gap-6 md:justify-end">
            <a href="#projects" className={textLink}>
              Work <ArrowDown />
            </a>
            <a href={GITHUB} target="_blank" rel="noreferrer" className={textLink}>
              GitHub <ArrowUpRight />
            </a>
          </div>
        </motion.div>

        <motion.dl
          className="mt-14 grid gap-x-10 border-t sm:grid-cols-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          {NUMBERS.map((n) => (
            <div key={n.label} className="flex items-baseline gap-4 border-b py-4 sm:block sm:border-b-0 sm:py-6">
              <dd className="w-28 shrink-0 font-heading text-3xl font-semibold tracking-tighter tabular-nums sm:w-auto sm:text-4xl">
                <CountUp {...n} />
              </dd>
              <dt className="max-w-56 text-sm leading-snug text-muted-foreground sm:mt-2">{n.label}</dt>
            </div>
          ))}
        </motion.dl>
      </div>
    </section>
  )
}

// [label, shown text, link]
const CONTACT = [
  ["Email", "dhruvsharma52866@gmail.com", "mailto:dhruvsharma52866@gmail.com"],
  ["Phone", "+91 90390 50427", "tel:+919039050427"],
  ["LinkedIn", "linkedin.com/in/dhruv-sharma-a987a5145", "https://www.linkedin.com/in/dhruv-sharma-a987a5145/"],
  ["GitHub", "github.com/heyparth1", GITHUB],
]

const FACTS = [
  ["Studied", "B.Tech EEE, IIT Patna '26"],
  ["Now", "AI Engineer, Windflow AI"],
  ["Off the clock", "Somewhere with a view"],
]

function About() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const y = useTransform(scrollYProgress, [0, 1], ["-7%", "7%"])

  return (
    <section id="about" className="mx-auto grid max-w-6xl scroll-mt-20 items-center gap-16 px-6 py-28 md:grid-cols-[5fr_6fr]">
      <Reveal>
        {/* tilted photo; straightens on hover */}
        <div ref={ref} className="group relative mx-auto w-full max-w-[19rem] -rotate-2 sm:max-w-sm transition-transform duration-500 ease-out hover:rotate-0">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-xl">
            <motion.img
              src={photo}
              alt="Dhruv Sharma standing among pine trees in front of a snow-capped mountain"
              className="size-full object-cover"
              style={{ y, scale: 1.16 }}
            />
          </div>
          <Badge variant="outline" className="absolute -bottom-3 -left-3 h-8 gap-2 bg-background px-3 font-mono shadow-md">
            <span className="size-2 rounded-full bg-brand" />
            off the clock
          </Badge>
        </div>
      </Reveal>

      <div>
        <SectionHeading
          index="01"
          label="about"
          title={
            <>
              A bit <span className="text-brand">about me</span>
            </>
          }
        />
        <Reveal delay={0.1} className="-mt-4 space-y-4 text-lg leading-relaxed text-muted-foreground">
          <p>
            I graduated from <span className="font-semibold text-foreground">IIT Patna</span> in 2026 with a B.Tech in
            Electrical &amp; Electronics Engineering, and did my research there on streaming inference for
            wireless-localization models. I'm now an AI Engineer at Windflow AI, building LLM systems that run in
            production.
          </p>
          <p>
            On the side I replicate research papers and build agents that contribute to open source. Away from the
            keyboard, you'll usually find me somewhere with a view like this one.
          </p>
        </Reveal>
        <dl className="mt-10 divide-y border-y">
          {FACTS.map(([k, v], i) => (
            <Reveal key={k} delay={0.15 + i * 0.07} className="flex items-baseline justify-between gap-6 py-3.5">
              <dt className="font-mono text-xs tracking-widest text-muted-foreground uppercase">{k}</dt>
              <dd className="text-right font-medium">{v}</dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  )
}

// ── Page ────────────────────────────────────────────────────────────────
export default function App() {
  const { scrollYProgress } = useScroll()

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        aria-hidden
        className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-brand"
        style={{ scaleX: scrollYProgress }}
      />

      <motion.header
        className="fixed inset-x-0 top-4 z-40 flex justify-center px-4"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.5, ease: EASE }}
      >
        <nav className="flex items-center gap-1 rounded-full border-2 border-foreground bg-background p-1.5 pl-4">
          <a href="#top" className="mr-2 flex items-center gap-2 text-sm font-semibold">
            dhruv
          </a>
          {["about", "projects", "stack"].map((s) => (
            <a key={s} href={`#${s}`} className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "rounded-full")}>
              {s}
            </a>
          ))}
          <a href="#contact" className={cn(buttonVariants({ size: "sm" }), "rounded-full px-3")}>
            contact
          </a>
        </nav>
      </motion.header>

      <main id="top">
        <Hero />

        {/* Marquee */}
        <About />

        {/* Projects */}
        <section id="projects" className="mx-auto max-w-6xl scroll-mt-20 border-t px-6 py-28">
          <SectionHeading
            index="02"
            label="projects"
            title={
              <>
                Things I've <span className="text-brand">built</span>
              </>
            }
          />
          <div className="grid gap-5 md:grid-cols-3">
            {FEATURED.map((p, i) => (
              <Reveal key={p.name} delay={p.wide ? 0 : (i % 3) * 0.08} className={cn(p.wide && "md:col-span-3")}>
                <TiltCard project={p} />
              </Reveal>
            ))}
          </div>
          <MoreWork />
        </section>

        {/* Stack */}
        <section id="stack" className="mx-auto max-w-6xl scroll-mt-20 border-t px-6 py-28">
          <SectionHeading
            index="03"
            label="stack"
            title={
              <>
                What I <span className="text-brand">work with</span>
              </>
            }
          />
          <div className="grid gap-10 md:grid-cols-3">
            {Object.entries(STACK).map(([group, items], g) => (
              <div key={group}>
                <Reveal delay={g * 0.08}>
                  <h3 className="mb-4 font-mono text-xs tracking-widest text-muted-foreground uppercase">{group}</h3>
                </Reveal>
                <div className="flex flex-wrap gap-2">
                  {items.map((item, i) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      whileHover={{ y: -3 }}
                      viewport={{ once: true }}
                      transition={{ type: "spring", stiffness: 300, damping: 20, delay: g * 0.08 + i * 0.05 }}
                    >
                      <Badge variant="secondary" className="h-8 px-3.5 text-sm">
                        {item}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="dark scroll-mt-20 bg-background px-6 py-32 text-center text-foreground">
          <Reveal>
            <p className="font-mono text-xs tracking-widest text-brand uppercase">04 / contact</p>
            <h2 className="mx-auto mt-4 max-w-3xl text-5xl font-semibold tracking-tighter sm:text-7xl">
              Got a hard problem? <span className="block text-brand">Let's talk.</span>
            </h2>
          </Reveal>
          <ul className="mx-auto mt-14 max-w-3xl border-t text-left">
            {CONTACT.map(([label, value, href], i) => (
              <li key={label}>
                <Reveal delay={i * 0.07}>
                  <a
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                    className="group flex items-center justify-between gap-4 border-b py-5 transition-[padding,color] duration-300 hover:px-3 hover:text-brand"
                  >
                    {/* label above the value on phones, beside it on wider screens */}
                    <span className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
                      <span className="shrink-0 font-mono text-xs tracking-widest text-muted-foreground uppercase sm:w-20">
                        {label}
                      </span>
                      <span className="text-[17px] font-medium break-words sm:text-2xl">{value}</span>
                    </span>
                    <ArrowUpRight className="size-5 shrink-0 self-center transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </a>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="dark border-t bg-background px-6 py-6">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-2 font-mono text-xs text-muted-foreground">
          <span>© 2026 Dhruv Sharma</span>
          <span>React · Tailwind · shadcn/ui · Motion</span>
        </div>
      </footer>
    </MotionConfig>
  )
}
