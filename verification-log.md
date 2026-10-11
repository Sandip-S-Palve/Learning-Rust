# Verification log

Problems found during checking, and how each was fixed. Newest first.

## Phase 2 — design system (2026-10-11)

Tested in headless Chrome at 1440 px, 1300 px and 390 px (inside an iframe, because headless Chrome has a minimum window width), in light and dark themes.

| # | Area | Problem found | Fix |
|---|---|---|---|
| 1 | Stepper demo (styleguide) | The `s1` box used `data-show="1"`, which means "from step 1 onward", so it never disappeared | Changed to `-1`; added a separate "moved" box for steps 2–3 |
| 2 | Stepper demo | The "moved" label overlapped the old field text | Field text is now hidden once the value has moved |
| 3 | Growth chart | On a linear scale O(n²) flattened the other three curves | Switched the y-axis to logarithmic and said so in the caption |
| 4 | Testing | No way to screenshot the light theme on a dark-mode machine | Added a `?theme=light|dark` override (applies to that page load only, not saved) |

Confirmed working: Prism highlighting (Rust, C#, TOML), copy and Playground buttons, KaTeX, Mermaid (theme-aware), Chart.js (theme-aware), stepper controls, quiz scoring and saving, deep-dive toggle, TOC scroll-spy, chapter shell (meta card, pager, mark-complete), mobile drawer layout, no console errors.
All CDN libraries are pinned: Prism 1.29.0, KaTeX 0.16.9, Mermaid 10.9.1, Chart.js 4.4.1, D3 7.8.5.

## Chapter 0.1 — Why Rust (2026-10-11)

| # | Problem found | Fix |
|---|---|---|
| 1 | Linux row claimed "used for selected components and drivers", which goes beyond the verified source | Replaced with the KernelNewbies 6.1 quote ("initial support…") |
| 2 | Microsoft row claimed MSRC "helped trigger" investment, with no source | Replaced with the verifiable fact: founding member of the Rust Foundation (2021) |
| 3 | The C# runtime exception was captioned "Compiler output" | Added a `pre.output.runtime` variant ("Runtime output") to the design system |
| 4 | Stack Overflow 2025 "most admired" claim could not be confirmed from the survey page | Omitted |

Checked: all Rust snippets compiled with rustc 1.99.0 and the outputs pasted verbatim; the C# snippet was run on .NET SDK 10.0.201. All 17 links returned HTTP 200, and the YouTube video was confirmed via oEmbed. RustBelt DOI checked via Crossref. Desktop/mobile and light/dark renders show no console errors and no horizontal overflow at 390 px.
Resolved verify-queue item: let chains were stabilised in **1.88.0** (RELEASES.md).

## Chapter 0.2 — Toolchain (2026-10-11)

| # | Problem found | Fix |
|---|---|---|
| 1 | I assumed `rustup show` installs a pinned toolchain; rustup 1.29.1 warns that this is deprecated | Tested: uninstalled 1.99.0, then ran `cargo` → it auto-installed. The chapter now says so, with the opt-out (`RUSTUP_AUTO_INSTALL=0`) and `rustup install` |
| 2 | Output for the toolchain-pinning step came from the `greet` project, not `hello-rust` | Said so explicitly in the text |
| 3 | "Copy the binary to another Mac and it runs" overstated portability | Added "same CPU type and a compatible macOS version" |
| 4 | My first benchmark printed `{:.0?}`, which rounds to whole seconds | Re-ran with `as_millis()`; the chart uses medians of 3 runs |
| 5 | crates.io returns 404 to curl (bot filtering) | Confirmed live via the crates.io API (rand max_stable_version 0.10.3); link kept |

Checked: every command output pasted verbatim from Rust 1.99.0 / rustup 1.29.1 (paths shortened to `~/projects/...`). The CI gate in Exercise 2 ran and exited 0. Caret-requirement table matches The Cargo Book. The compiler pipeline follows rustc-dev-guide/overview. Renders cleanly on desktop and at 390 px, in light and dark themes, with no console errors.

## Chapter F1 — How a program uses memory (2026-10-11)

| # | Problem found | Fix |
|---|---|---|
| 1 | First grid benchmark showed column order *faster* than row order: the optimiser had restructured the loops | Added `black_box` and `#[inline(never)]`, then re-measured (2.0 ms vs 64.6 ms). The episode is now taught in the deep dive as a benchmarking lesson |
| 2 | Pitfall text claimed "one allocation costs tens of nanoseconds" without evidence | Measured: 19–24 ns per Box/String allocate+free (10M iterations, release); the text now quotes the measurement |
| 3 | The overflow program succeeded in release (the optimiser removed the recursion) | Kept and explained as a lesson: optimisations are not guarantees |
| 4 | In the stack/heap animation, the heap arrow cut through the `name` field text | Shortened the label and moved the arrow start to the frame edge |
| 5 | The 1024-grid exercise was too fast for ms resolution (0 ms) | Switched the program to µs output; all numbers in the chapter are µs-measured medians |
| 6 | Norvig's latency table returned a redirect loop to curl | Not cited; used our own measurements plus Drepper (2007, link live) |

Checked: the hardware facts come from `sysctl` on the lab Mac (128-byte line, 128 KB L1d / 16 MB L2 on P-cores, 16 KB pages, 8 MB stack limit). The .NET GC facts are quoted from Microsoft Learn (pointer-bump allocation, generations, LOH ≥ 85,000 bytes, compaction, value types inline, LayoutKind defaults). The 2 MiB thread stack comes from the std::thread docs. Every Rust snippet was extracted from the page HTML and compiled. The quiz's struct size (12) was compiled too. The layout explorer was exercised in headless Chrome and matches real `size_of` results. Desktop and 390 px render cleanly in light and dark, with no console errors.

## Chapter F2 — Complexity (2026-10-11)

| # | Problem found | Fix |
|---|---|---|
| 1 | Rust `regex` with `(a+)+$` answered 1M characters in ~0.001 ms: faster than any scan, so it was not demonstrating linear time | Switched to `(a+)+b`, which forces a full scan (linear: 0.13 ms at 100k, 1.3 ms at 1M). The `$` observation is kept as a note, without asserting the internal mechanism |
| 2 | The Rust regex output in my draft came from a different probe program, formatted to look like the page snippet's output | Extracted the page snippet verbatim, ran it 3×, and pasted the middle run; the caption now says ~1.3 ms |
| 3 | First .NET run included first-call warm-up (5 ms at n=16 for NonBacktracking) and used `(a+)+$` | Added a warm-up and used `(a+)+b` in both languages for a like-for-like comparison |
| 4 | Unverified claims: "LINQ Intersect builds a set internally"; "Rust's own sort switches to O(n²) for tiny inputs" | Removed / generalised (Rust's sort internals stay in the F7 verify queue) |
| 5 | The growth explorer showed exponents as `10^6` | Rendered with `<sup>` |
| 6 | The CLRS publisher page returns 403 to automated checks | Cited without a link, with a ⚠ note |

Checked: the collections cost table is copied from the std::collections docs. The Vec growth wording is quoted from the Vec docs (no guaranteed strategy; amortised O(1) push). The regex O(m·n) guarantee is quoted from the regex crate docs (1.13.1). `List<T>.Contains` O(n) and the .NET backtracking warnings are quoted from Microsoft Learn. The binary-search comparison counts match ⌊log₂n⌋+1. Every Rust snippet on the page was extracted and compiled. Exercise outputs are real. The MIT 6.006 lecture was verified via oEmbed. 25 KaTeX expressions render with no errors. Desktop and 390 px render in light/dark with no console errors.

## Chapter F3 — Linear data structures (2026-10-11)

| # | Problem found | Fix |
|---|---|---|
| 1 | A plan to show `std::LinkedList` nodes scattered by a "used" heap failed on macOS (two methods tried; nodes stayed adjacent, ~1 ms either way) | Reported honestly in the chapter. Isolated the effect with an index-linked list in one Vec whose links follow memory order vs a random permutation (0.51 ms vs ~27 ms) |
| 2 | Video candidate (Stroustrup, "Why you should avoid Linked Lists", id YQs6IC-vgmo) failed YouTube oEmbed | Not cited. Used his written FAQ entry (live) plus the counterpoint repo; video replaced by MIT 6.006 Lecture 2 (oEmbed-verified) |
| 3 | A ⚠-flagged claim that .NET has no general-purpose deque | Reworded to the verifiable statement: Microsoft's "choose a collection" guide lists Queue<T>/Stack<T> and no double-ended queue type |
| 4 | **Design system:** callout titles containing inline code wrapped into broken columns (title was a flex container) | `.callout-title` changed to `display:block`, fixing every chapter |
| 5 | **Design system:** Mermaid diagrams shrank to unreadable size on phones; `<T>` and `<br/>` in labels were stripped by strict mode | Desktop: scale to fit. ≤760 px: min-width 560 px, horizontal scroll, auto-centred after render. Labels avoid generics and `<br/>`; question nodes use compact stadium shapes |

Checked: the LinkedList "almost always better to use Vec or VecDeque" and VecDeque "growable ring buffer", queue usage and make_contiguous wording are quoted from std docs. Queue<T> "circular array" and Stack<T> "implemented as an array" are quoted from Microsoft Learn. All 6 Rust programs on the page were extracted and compiled. Exercise solutions pass 3 unit tests and Clippy. The cost table matches the std::collections performance table. Steppers, chart, mermaid and quiz render on desktop and at 390 px in light/dark with no console errors.

## Chapter F4 — Hashing and maps (2026-10-11)

| # | Problem found | Fix |
|---|---|---|
| 1 | Planned to state a "7/8 maximum load factor", but neither the Rust docs nor Abseil's design notes state one | Measured capacity steps instead (3, 7, 14, 28, …) and presented 7/8 as *observed behaviour, not a documented guarantee* |
| 2 | The first hasher-speed runs were noisy (SipHash 37–87 ms) | Ran 7 times; the chapter reports medians (36.3 vs 22.3 ms) with ranges |
| 3 | The Dedup exercise's printed output was written from expectation | Extracted the page program, ran it, confirmed it matches |
| 4 | A test-harness bug (expected two steppers) produced an "Uncaught" error | Harness fixed; not a page error |
| 5 | **Design system:** the 16-cell SwissTable diagram (and SVG diagrams generally) were unreadably small on phones | Diagram re-laid out as 2×8. Globally, every `figure.visual > svg` gets its own scroller with a 580 px minimum width on phones plus a "swipe" hint. Regression-tested all 8 pages: steppers work, no console errors, no page overflow |

Checked: HashMap facts are quoted from the std docs (SipHash 1-3, random seeding, SwissTable port, Eq/Hash property, logic errors, arbitrary order). SwissTable details are quoted from Abseil's design notes (H1 57 bits / H2 7 bits, one metadata byte per slot, 16-wide SIMD, deleted slots don't stop probing). .NET hash randomisation is quoted from Microsoft Learn and demonstrated (two runs, two different hash codes). Crosby & Wallach 2003 was verified on the USENIX page. The SipHash paper was verified via Crossref. The CppCon talk was verified via oEmbed. The `f64` key error is real compiler output.

## Chapter F5 — Trees and heaps (2026-10-11)

| # | Problem found | Fix |
|---|---|---|
| 1 | The BTreeMap docs no longer state the value of B | Read it from the std source (`library/alloc/src/collections/btree/node.rs`: `const B: usize = 6`). The chapter attributes it to "the current standard-library source" |
| 2 | Page version of Exercise 3 triggered Clippy `new_without_default` (my tested lib version had the impl) | Added `impl Default for MaxHeap` to the page code; Clippy clean |
| 3 | Lecture videos: the search returned only OCW pages | Extracted the YouTube IDs from MIT's official OCW pages and verified them via oEmbed (Lectures 6 and 8) |
| 4 | The heap animation frames were hand-computed | Verified by simulating the same sift-up/sift-down algorithm: [8,3,5,1] → push 9 → [9,8,5,1,3] → push 2 → pop 9 → [8,3,5,1,2] |

Checked: BTreeMap Background, iteration order and logic-error wording are quoted from the std docs. BinaryHeap max-heap, cost table, Reverse for min-heap and arbitrary iteration order are quoted from the std docs. SortedDictionary ("binary search tree with O(log n) retrieval"), SortedSet ("self-balancing tree") and PriorityQueue ("array-backed, quaternary min-heap", no FIFO for equal priorities) are quoted from Microsoft Learn. The PostgreSQL B-tree default is quoted from its docs. Bayer & McCreight 1972 was verified via Crossref. The "6 levels" and "3–5 levels" depth figures are labelled back-of-envelope estimates. All page programs were compiled and run. Desktop and 390 px render cleanly, and both steppers complete.

## Chapter F6 — Graphs (2026-10-11)

| # | Problem found | Fix |
|---|---|---|
| 1 | The first cycle-finder solution used a dense pattern (`Some(&mut (v, ref mut next))`) unsuitable before Module 2 | Rewrote it with `top.0` / `top.1`; re-tested (3 passed) and Clippy clean |
| 2 | Final Kahn animation frame showed finished steps (order_total, discount_rule) with `in=1` | Corrected to `in=0` |
| 3 | Risk that the JS explorer's traversal rules drift from the Rust code | Automated cross-check: the explorer's BFS/DFS order equals the Rust program's for all 8 start vertices × 2 algorithms (16/16) |

Checked: Dijkstra (1959), Kahn (1962) and Tarjan (1972) were verified via Crossref. MIT 6.006 Lectures 9, 10 and 13 YouTube IDs were extracted from the official OCW pages and verified via oEmbed. petgraph 0.8.3 was verified via the crates.io API, and the toposort example was compiled and run against it. The Dijkstra results were hand-checked (rules 7 = 4+3; workflow 9 = 7+2; db 14 = 9+5 < 7+12). All 8 page programs were compiled and run. Desktop and 390 px render cleanly with no console errors.

## Chapter F7 — Core algorithms and techniques (2026-10-12)

| # | Problem found | Fix |
|---|---|---|
| 1 | **Resolved ⚠ Verify item (F7):** the algorithms Rust's sorts use | Quoted from the "Current implementation" notes in the Rust slice docs: `sort` is driftsort-based (stable, linear on sorted/reversed input); `sort_unstable` is ipnsort-based. .NET: `Array.Sort`/`List.Sort` are introsort (≤16 → insertion, depth limit → heapsort, else quicksort), unstable; LINQ `OrderBy` is stable (Microsoft Learn) |
| 2 | My first sort table printed `NaN` for deliberately skipped cases | Program now prints "skipped", and the text explains why (O(n²) time; recursion depth n) |
| 3 | Clippy `needless_range_loop` in the edit-distance solution | Replaced with `iter_mut().enumerate()` |
| 4 | Figure 1's caption claimed merge sort needs "at most about 64" comparisons (vague) | Measured exact counts from the widget: sorted input 15/32/120, random 88/45/44 (insertion/merge/quick). Caption updated; all 9 algorithm×input combinations verified to end sorted |

Checked: Hoare 1962 was verified via Crossref. The driftsort and sort-research repos are live. MIT 6.006 Lectures 3, 5 and 15 were verified via oEmbed. Fibonacci call count (2·F(41)−1 ≈ 331M) and the ×11 per +5 (φ⁵) match the measurements. The Stirling form of log₂(n!) was checked. All 7 page programs were compiled and run (outputs match). The edit-distance widget ends at 3 ("kitten"→"sitting"). 7 KaTeX expressions render without errors.
