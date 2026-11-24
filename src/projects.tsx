// All project content lives here. Facts and numbers come from the resumes.
import type { ReactNode } from "react"
import { CashflowBars, PullRequests, QueryTyper, TernaryGrid } from "@/components/visuals"

export const GITHUB = "https://github.com/heyparth1"

export type Project = {
  name: string
  points: string[] // one short fact per bullet
  tags: string[]
  href?: string // omit when there is no public link
  demo?: string // YouTube demo video
}

// Featured: big cards with an animated illustration. `wide` spans the full row.
export type Featured = Project & { visual: ReactNode; wide?: boolean }

export const FEATURED: Featured[] = [
  {
    name: "1.58-bit Ternary LLMs",
    points: [
      "Reverse-engineered PrismML's ternary Bonsai models through weight forensics",
      "Replicated them with quantization-aware training and distillation",
      "Ternary Qwen3-1.7B perplexity: 152,955 (naive) down to 22.1",
      "Trained on about 1B tokens in 52 A100 GPU-hours",
    ],
    tags: ["PyTorch", "QAT", "distillation", "SLURM"],
    visual: <TernaryGrid />,
    wide: true,
  },
  {
    name: "Brutus",
    points: [
      "Autonomous agent that finds, triages and fixes GitHub issues",
      "Scored 965 issues; fixes run in Docker sandboxes with regression tests",
      "8 PRs merged into deepagents, qwen-code, emscripten and hyperdx",
    ],
    tags: ["Python", "FastAPI", "Next.js", "Docker"],
    href: `${GITHUB}/brutus`,
    visual: <PullRequests />,
  },
  {
    name: "Kosh",
    points: [
      "Answers plain-English questions over large Excel files and a 2.2M-row sales dataset",
      "Runs on a local Qwen3.5-4B at 96% of Gemini's performance",
      "Confidential data stays in-house",
    ],
    tags: ["ReAct", "NL-to-SQL", "MLX"],
    visual: <QueryTyper />,
  },
  {
    name: "SPACE",
    points: [
      "Cashflow and project-finance platform for a power-transmission EPC company",
      "Turns the bill of quantities into a month-by-month cashflow",
      "Built its ReAct agents and LLM extraction over 350+ worksheets",
      "Rebuilt an INR 3,674 Cr BOQ to within 0.04 Cr",
    ],
    tags: ["FastAPI", "PostgreSQL", "Next.js", "AWS"],
    visual: <CashflowBars />,
  },
]

// More work: compact cards, filterable by category.
export const CATEGORIES = ["all", "agents", "research", "data", "products"] as const
export type Category = (typeof CATEGORIES)[number]

export type More = Project & { category: Exclude<Category, "all">; stat: string }

export const MORE: More[] = [
  {
    name: "StreamLoc",
    category: "research",
    stat: "up to 11.2% accuracy gain in a 10 ms budget",
    points: [
      "Training-free streaming inference for the LWLM wireless-localization model",
      "Fusion-desync theory fixed a 9.3× caching collapse (7.68 m to 0.79 m RMSE)",
    ],
    tags: ["foundation models", "online learning"],
  },
  {
    name: "Eureka AI",
    category: "agents",
    stat: "top 500 of 100K+ · OpenAI x NxtWave",
    points: [
      "Describe a physics experiment in plain English; it writes and runs the SimPhy code",
      "Hybrid FAISS + BM25 retrieval with intent routing and reranking",
    ],
    tags: ["RAG", "Gemini", "FAISS", "BM25"],
    demo: "https://www.youtube.com/watch?v=2ojJIMkpo5w",
    href: `${GITHUB}/Eureka-AI`,
  },
  {
    name: "Gloommy",
    category: "agents",
    stat: "\"Pinterest for AI\"",
    points: [
      "Image RAG that generates ads from your own inspiration board",
      "Cross-modal, Pareto-optimal retrieval picks the images that steer Gemini 2.5",
    ],
    tags: ["cross-modal RAG", "Gemini 2.5", "FastAPI", "React"],
    demo: "https://www.youtube.com/watch?v=CYQfKWqc_8E",
  },
  {
    name: "LLM Serving Benchmark",
    category: "research",
    stat: "69 ms vs 3.6 s p50 TTFT at 8 streams",
    points: [
      "vLLM against Ollama serving Qwen2.5-7B on an air-gapped A100 cluster",
      "Measured TTFT, latency and throughput at 1 to 16 concurrent streams",
    ],
    tags: ["vLLM", "Ollama", "SLURM"],
    href: `${GITHUB}/Krim_Submission`,
  },
  {
    name: "Monix",
    category: "products",
    stat: "bank SMS in, spending dashboard out",
    points: [
      "AI expense tracker: an App Intent captures bank SMS, Gemini parses each transaction",
      "Budgets, subscription detection and chat over your spending",
    ],
    tags: ["Swift", "SwiftUI", "SwiftData", "Gemini"],
  },
  {
    name: "Sales-Call Analysis",
    category: "data",
    stat: "caught a silence confound (r = 0.96)",
    points: [
      "Predicted brain responses over 360 cortical regions for 100 transcribed sales calls",
      "Showed 133 \"significant\" regions were an artifact of silence",
    ],
    tags: ["Whisper", "TRIBE v2", "statsmodels"],
  },
  {
    name: "AI Interviewer",
    category: "products",
    stat: "live coding + voice rounds",
    points: [
      "Interview platform built during a product internship",
      "Live coding, voice rounds, AI proctoring and ATS sync",
    ],
    tags: ["LangGraph", "FastAPI", "React", "MongoDB"],
    href: `${GITHUB}/AI_Interviewer`,
  },
]

export const STACK: Record<string, string[]> = {
  "LLMs & agents": ["ReAct / tool calling", "RAG", "LangGraph", "MCP", "Evals", "Structured outputs"],
  "ML & research": ["PyTorch", "Transformers", "Quantization (QAT)", "Distillation", "vLLM", "MLX", "Time series"],
  Engineering: ["Python", "TypeScript", "SQL", "C++", "Swift", "FastAPI", "Next.js", "PostgreSQL", "Docker", "AWS"],
}
