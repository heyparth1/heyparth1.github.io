// Small looping illustrations, one per project card. Purely decorative.
import { useEffect, useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import { Check, GitPullRequest } from "lucide-react"
import { cn } from "@/lib/utils"

const trit = () => Math.floor(Math.random() * 3) - 1

/** hanum: a weight matrix that only ever holds -1, 0 or +1. */
export function TernaryGrid() {
  const reduce = useReducedMotion()
  const n = 12 * 6
  const [cells, setCells] = useState(() => Array.from({ length: n }, trit))

  useEffect(() => {
    if (reduce) return
    const id = setInterval(() => {
      setCells((c) => {
        const next = [...c]
        for (let k = 0; k < 5; k++) next[Math.floor(Math.random() * n)] = trit()
        return next
      })
    }, 160)
    return () => clearInterval(id)
  }, [reduce, n])

  return (
    <div aria-hidden className="grid grid-cols-12 gap-1 font-mono text-[10px] sm:text-xs">
      {cells.map((v, i) => (
        <div
          key={i}
          className={cn(
            "flex aspect-square items-center justify-center rounded-md transition-colors duration-500",
            v === -1 && "bg-foreground text-background",
            v === 0 && "bg-muted text-muted-foreground",
            v === 1 && "bg-brand text-brand-foreground",
          )}
        >
          {v > 0 ? "+1" : v < 0 ? "−1" : "0"}
        </div>
      ))}
    </div>
  )
}

/** brutus: pull requests land one after another and get merged. */
export function PullRequests() {
  const widths = ["w-3/4", "w-1/2", "w-2/3"]
  return (
    <div aria-hidden className="flex flex-col gap-2">
      {widths.map((w, i) => (
        <motion.div
          key={i}
          className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2.5"
          animate={{ opacity: [0, 1, 1, 0], x: [-16, 0, 0, 0] }}
          transition={{ duration: 6, times: [0, 0.08, 0.92, 1], repeat: Infinity, delay: i * 0.7 }}
        >
          <GitPullRequest className="size-4 shrink-0 text-muted-foreground" />
          <div className={cn("h-2 rounded-full bg-muted", w)} />
          <motion.span
            className="ml-auto flex size-5 items-center justify-center rounded-full bg-brand text-brand-foreground"
            animate={{ scale: [0, 0, 1.25, 1, 1] }}
            transition={{ duration: 6, times: [0, 0.3, 0.36, 0.42, 1], repeat: Infinity, delay: i * 0.7 }}
          >
            <Check className="size-3" strokeWidth={3} />
          </motion.span>
        </motion.div>
      ))}
    </div>
  )
}

const QUESTION = "Which customers churned last quarter?"
const SQL = "SELECT name FROM customers\nWHERE churned_at >= :quarter_start;"

/** Local Genie: a plain-English question turns into SQL. */
export function QueryTyper() {
  const reduce = useReducedMotion()
  const total = QUESTION.length + SQL.length
  const [n, setN] = useState(0)

  useEffect(() => {
    if (reduce) return
    // hold the finished frame for ~2s (50 ticks) before restarting
    const id = setInterval(() => setN((v) => (v > total + 50 ? 0 : v + 1)), 40)
    return () => clearInterval(id)
  }, [reduce, total])

  const shown = reduce ? total : n
  return (
    <div aria-hidden className="min-h-32 rounded-lg border bg-background p-3 font-mono text-xs leading-relaxed">
      <p className="text-foreground">
        <span className="text-brand">› </span>
        {QUESTION.slice(0, shown)}
      </p>
      <pre className="mt-2 whitespace-pre-wrap text-muted-foreground">
        {SQL.slice(0, Math.max(0, shown - QUESTION.length))}
        <span className="ml-0.5 inline-block h-3 w-1.5 animate-pulse bg-brand align-middle" />
      </pre>
    </div>
  )
}

const FLOW = [35, 55, 80, 60, 90, 70, 45, 85, 100, 65, 50, 75]
const PEAK = FLOW.indexOf(Math.max(...FLOW))

/** SPACE: a month-by-month cashflow that keeps getting recomputed. */
export function CashflowBars() {
  return (
    <div aria-hidden className="rounded-lg border bg-background p-3">
      <div className="flex h-24 items-end gap-1.5">
        {FLOW.map((h, i) => (
          <motion.div
            key={i}
            className={cn("flex-1 origin-bottom rounded-sm", i === PEAK ? "bg-brand" : "bg-border")}
            style={{ height: `${h}%` }}
            animate={{ scaleY: [0, 1, 1, 0] }}
            transition={{ duration: 6, times: [0, 0.12, 0.9, 1], repeat: Infinity, delay: i * 0.08, ease: "easeOut" }}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between font-mono text-[10px] text-muted-foreground">
        <span>month 1</span>
        <span>cashflow</span>
        <span>month 12</span>
      </div>
    </div>
  )
}
