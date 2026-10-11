

## INPUTS
```
TOPIC: Rust programming
GOAL_TYPE:auto
LEARNER_PERSONA:  I am solution architect , worked largely on .net ecosystem, wish to become Rust Language expert
ASSUMED_UNKNOWNS: no good understanding of data strctures and algo
TARGET_OUTCOME:use and recommoned rust for different use cases , become trusted consultant about any type of Rust implementaion, also looking to buid two complete enterise grade , production ready , products which offers any customer 1. a complete end to end Rule engine (plugable , using any rule evalution style) 2. build durable , long running workflow engine.
DEPTH:    default: practitioner, with expert-level "deep dive" boxes
TIME_BUDGET:   auto
OUTPUT: multi-page HTML site 
LANGUAGE/STYLE:   <English, plain and direct; analogies from my background where helpful>

```

---

## ROLE
You are a team working together: a **Curriculum Architect**, a **Subject-Matter Expert**, an **Instructional Designer**, a **Technical Illustrator** (SVG/JS), and an **independent Fact-Checker**. Produce a complete, self-contained learning resource on TOPIC for LEARNER_PERSONA, delivered as polished HTML.

## NON-NEGOTIABLE RULES
1. **Self-contained.** Every concept is fully taught inside the resource. Papers, docs and videos are *supplementary* — never "see link for details".
2. **Complete coverage, not just what I asked for.** I do not know what I don't know. You decide the full scope by researching how experts, top courses, official docs/exam guides define the field.
3. **Bridge the gaps.** For everything in ASSUMED_UNKNOWNS and any prerequisite the persona likely lacks, add a "Foundations" module *before* the main content. Never use a term before it is taught.
4. **Real multimedia, no placeholders.** Never write "[diagram here]". Build the visuals:
   - Diagrams: inline SVG or Mermaid
   - Charts/graphs: Chart.js or D3
   - Animations (in place of GIFs): step-through animated SVG/CSS/canvas with Play / Step / Reset controls
   - Math: KaTeX. Code: syntax-highlighted (Prism), with copy button
   - Tables for comparisons, trade-offs, limits, pricing tiers
   - Raster images only from verifiable sources (Wikimedia/official docs) with license + attribution, or clearly labelled AI-generated illustrations
5. **No fabricated references.** Verify every paper, doc and video URL with live web search/fetch. If you cannot verify one, omit it. Never invent arXiv IDs, DOIs, video titles or channels.
6. **Currency.** For fast-moving topics (cloud services, exams, language versions, AI) check the current state on the web: latest stable version, current exam guide code & domain weightings, deprecated/renamed features. Stamp each page with "Accurate as of <date>, version <x>".
7. **Accuracy over fluency.** Flag anything uncertain in a visible "⚠ Verify" note rather than guessing.

## GOAL-TYPE ADAPTATIONS (apply the matching one; combine if needed)
- **programming-language:** toolchain & setup; the language's mental model (e.g. Rust ownership/borrowing, Go concurrency); idiomatic vs non-idiomatic code; standard library tour; testing, debugging, packaging, performance; runnable exercises with solutions per chapter; 2–3 progressive projects ending in a capstone; "coming from <persona's known language>" comparison boxes.
- **certification-exam:** map chapters 1:1 to the **official exam guide domains and weightings** (fetch the current guide); exam-style scenario questions per chapter with explained answers (why each wrong option is wrong); "exam traps" and "keyword → service" cheat-sheets; two full-length mock exams; final revision sheet; weight study time by domain %.
- **cloud-service/product:** what problem it solves & where it sits in the architecture; core concepts & resource model; hands-on setup (console + CLI + IaC); security/IAM, networking, monitoring, cost model & pricing levers, limits/quotas; comparison with equivalent services in other clouds; reference architectures; common anti-patterns.
- **tool-for-non-specialist:** start from the *business problem* and the history of how the field got here (e.g. databases → warehouses → data lakes → lakehouse) before the tool; glossary-first; heavy analogies to the persona's world; hands-on labs with free/trial tiers; "what you'd tell your manager" summaries.
- **concept-mastery:** intuition → formal model → math → implementation → research frontier; landmark papers in historical order.

---

## WORKFLOW (follow the phases in order)

### Phase 1 — Scope research → Curriculum Map  *(STOP for my approval)*
1. Research how the field is structured: official docs/exam guide, 3+ respected courses or syllabi, recognised books or survey papers.
2. Merge them into a **topic tree** (modules → chapters → subtopics), ordered by prerequisites.
3. Run a **gap check**: list topics that appear in experts' syllabi but are often skipped; confirm they are included.
4. Output:
   - Persona analysis: assumed knowledge, gaps, Foundations module contents
   - Curriculum table: # | Module | Chapter | Key concepts | Prereqs | Est. time | Planned visuals
   - Prerequisite dependency diagram (Mermaid)
   - Sources used to define scope (verified links)
5. **Stop and wait for approval or edits.**

### Phase 2 — Design system (once)
Create shared `assets/style.css` and `assets/app.js` (theme incl. dark mode, layout, components, nav, search, progress tracking in localStorage wrapped in try/catch). Chapters reference these; never repeat CSS/JS per page.

### Phase 3 — Write chapters (one chapter per step)
Use this **chapter template**:
1. Title, learning objectives, prerequisites, est. time
2. **Why this matters** — the real problem, framed for the persona
3. **Intuition first** — analogy + one diagram
4. **Core explanation** — layered: Basic → Intermediate → 🔬 Deep dive (collapsible)
5. **Visuals** — at least 2 built visuals per chapter; at least 1 interactive/animated where a process or flow is involved
6. **Worked example / hands-on lab** — step-by-step, runnable code or commands with expected output
7. **Comparison / decision table** (when X vs Y, when to use what)
8. **Common misconceptions & pitfalls**
9. **Real-world / architecture view** — how it's used in production
10. **Check your understanding** — 5–10 questions (MCQ + scenario) with explained answers (exam-style for certifications)
11. **Summary** — 5 bullets + key terms added to the global glossary
12. **Go further** — verified: official docs, key papers (title, authors, year, one-line why it matters), 1–3 YouTube videos (title, channel, what to watch for). Supplementary only.

After each chapter, update `manifest.json` (chapter status, glossary terms, references) so work can resume in a new session.

### Phase 4 — Independent verification
Re-read each chapter as a skeptical expert who did not write it:
- Technical accuracy, version correctness, no term used before definition
- Check all links live; remove dead/unverifiable ones
- Check every visual renders and the code runs (execute it where possible)
- Fix issues; record them in a short `verification-log.md`

### Phase 5 — Assembly
- `index.html`: course overview, persona-specific learning path, clickable dependency map, progress tracker, time plan matching TIME_BUDGET
- Global glossary, full reference library (grouped: docs / papers / videos / books), cheat-sheet page
- Capstone project (or 2 mock exams for certifications)
- Spaced-review schedule: which earlier chapters to revisit, when

---

## EFFICIENCY & CONTINUATION PROTOCOL
- Work in phases; never try to output the whole course in one response.
- If output is cut off, continue exactly from the cut point when I say **"continue"**.
- Commands I may use: `continue` · `next chapter` · `redo chapter N deeper` · `simplify chapter N` · `add visuals to N` · `status` (show manifest progress).
- **If you lack file/tool access** (plain chat mode): output one complete self-contained HTML chapter per response (shared CSS inlined in a `<style>` block marked `/* SHARED */`), and mark any links you could not verify with ⚠.

## DEFINITION OF DONE
- Every topic in the approved curriculum is taught in the resource itself
- A learner matching LEARNER_PERSONA can go from zero to TARGET_OUTCOME using only this resource
- No placeholders, no unverified links, no undefined terms, all code tested, all visuals render on desktop and mobile

**Begin with Phase 1 now.**
