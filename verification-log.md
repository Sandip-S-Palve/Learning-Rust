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

## Chapter F8 — Type-system concepts (2026-10-31)

| # | Problem found | Fix |
|---|---|---|
| 1 | **Currency check:** does C# have discriminated unions yet? | Microsoft Learn documents C# 15 `union` as a **preview** for .NET 11 (case types, not named variants; the generated struct boxes value-type cases as `object?`). Added a "⚠ Verify" callout, since the GA date (November 2026) is from third-party reporting only |
| 2 | Exercise 2's comment claimed the private-constructor error was `E0603` | Compiled it: the real error is `E0423` ("cannot initialize a tuple struct which contains private fields"). Comment corrected |
| 3 | The illegal-state explorer overflowed sideways at 390 px (grid items default to `min-width: auto`, so the wide `pre` stretched the column) | `min-width: 0` on the panels, `overflow-x: auto` on the panel `pre`; re-shot at 390 px |
| 4 | Figure 3 (dispatch): the "fat pointer" label overlapped the data → value arrow | Moved the label above the boxes and re-routed both arrows |
| 5 | Figures were numbered in writing order, not page order (the explorer appeared after the dispatch diagram) | Swapped Figures 3 and 4 and every reference to them |
| 6 | `largest` panics on an empty slice without saying so | Added a doc comment pointing to chapter 2.6's `Option` version |
| 7 | Unverifiable detail about the Wlaschin talk ("email-verification example") | Removed; kept only his "AND types / OR types" framing |

Checked: all 16 Rust blocks were extracted from the *built page* and compiled. The 8 programs ran, with outputs pasted from the run. The 4 intentional-error files fail with exactly the errors shown (E0308 ×3, E0004). The 4 fragments compile with a stub `main`. Exercise solutions: 3 unit tests pass, and everything is Clippy-clean. The C# program was built on .NET SDK 10.0.201 (warnings CS8509 and CS8524 copied verbatim) and run (`SwitchExpressionException` on `(Payment)7`). The explorer's `classify()` was run in Node over all 64 states: exactly 4 are valid, and they map 1:1 to `RunStatus` variants. The Microsoft "Generics in the runtime" quote and the Union types page were fetched and quoted. Strachey (2000 reprint) and Cardelli & Wegner (1985) were verified via Crossref. Wadler's email header shows 12 Nov 1998, and Mads Torgersen is among the recipients. Minsky's post (9 Mar 2011) contains "illegal states unrepresentable". Mars Climate Orbiter facts (pound-force seconds vs newton-seconds, lost 23 Sep 1999) come from Wikipedia. Both YouTube videos were verified via oEmbed, and all other links returned HTTP 200. Headless Chrome shows no console messages and 0 KaTeX errors. Screenshots were checked at 1440 px light and dark, and at 390 px.

## Chapter F9 — Concurrency concepts (2026-10-31)

| # | Problem found | Fix |
|---|---|---|
| 1 | **Currency check:** the default thread stack size in Rust | The `std::thread` docs now say "platform-dependent and subject to change. Currently, it is 2 MiB on all Tier-1 platforms"; the text says "currently" and cites the docs |
| 2 | First CPU-scaling run split the range into equal contiguous chunks: 2 threads gave only 1.6× (larger numbers are slower to test) | Kept as a teaching line ("fixed contiguous halves … unbalanced") |
| 3 | Second attempt striped numbers across threads: with an even thread count one thread got all the even numbers (instant) and another all the odd ones, so 2 threads = 1.0× | Replaced with dynamic distribution (threads take 1,000-number blocks from an atomic counter): 2.0× / 3.9× / 5.7× at 2/4/6 threads |
| 4 | Figure 7 used a category x-axis (1, 2, 4, 6, 8, 10, 16 evenly spaced), which bent the "ideal" line | Switched to a numeric (linear) x-axis |
| 5 | Two passages quoted 25 ms for the 1,000-task run; the final measured run printed 27 ms | Text aligned with the published output |
| 6 | Event-loop stepper: "socket 2 ✓ data" overflowed its box; task sub-labels touched the box edges | Shortened the label; moved the text up |
| 7 | Compiler output contained the author's home path | Replaced with `~/` |

Checked: all 12 Rust blocks were extracted from the *built page*. The 9 programs compile, and the page copies of `interleavings` and `deadlock` reproduce the results. The 2 intentional-error files fail with exactly E0499 and E0277. The fragment compiles with a stub `main`. Exercises pass their `assert!`s (Exercise 2 five times in a row) and are Clippy-clean. The C# counter was run 3× on .NET 10 and lost 2.94–2.99M of 4M updates every time. Timing claims use the median of 3 runs on the M2 Pro (6P + 4E). The scheduler widget's outcome logic was run in Node: 20 schedules, the same 2 correct ones as the Rust enumeration. The Rustonomicon "Races" page was quoted. Microsoft's `Lock` docs were fetched: .NET 9+, plus its lock-ordering and no-`await` cautions. The mio README says "epoll, kqueue, and IOCP", with Windows via AFD/wepoll. source.dot.net shows .NET's `SocketAsyncEngine` uses epoll|kqueue. io_uring arrived in Linux 5.1 (2019, per Wikipedia). Coffman 1971, Amdahl 1967 and Dijkstra 1965 were verified via Crossref. Both YouTube videos were verified via oEmbed, and all other links returned HTTP 200. Headless Chrome shows 0 console messages and 0 KaTeX errors. Screenshots were checked at 1440 px light and dark, and at 390 px.

## Chapter 2.1 — Syntax and basic types (2026-10-31)

| # | Problem found | Fix |
|---|---|---|
| 1 | **Currency check:** float→integer casts in .NET | Microsoft Learn documents .NET 9's breaking change (saturating on x86/x64, NaN → 0). Confirmed on .NET 10 (arm64): `(int)NaN == 0`, `(int)1e10 == int.MaxValue`, `(uint)-1.5 == 0`, matching Rust's `as` |
| 2 | Clippy rejected teaching code: `nan == nan` (deny-level `eq_op`), a cast of a known NaN, and a manual `% 2 == 0` | Compare two separate NaNs; `black_box` the NaN with an explanatory comment; `is_multiple_of(2)` |
| 3 | Exercise 2 called its card number "a published test number", which couldn't be verified | Now "a Luhn-valid example number"; validity is checked by the program |
| 4 | Error E0308+E0277 (`i64 + i32`) printed ~25 lines listing every `Add` impl | Trimmed after the help line, with a visible "… omitted here" marker |
| 5 | Figure 2: the "16 bytes" label for `i128` ran past the SVG edge | Narrower squares and a new start offset; re-shot |
| 6 | Compiler output contained the author's home path | Replaced with `~/` |

Checked: all 20 Rust blocks were extracted from the *built page*. The 12 programs compile and run. The 6 intentional-error files fail with exactly the errors shown. The 2 fragments (the intro comparison and the function anatomy) compile with a stub `main`. The overflow program was run under both `cargo run` (panics) and `--release` (wraps). The overflow-check cost comes from one program compiled with `-C overflow-checks=off/on`: best of 5, median of 3 invocations (3.3 vs 15.4 ms). The overflow explorer's `compute()` was run in Node against 2,400 Rust-generated cases (8 types × 3 ops × 100 pairs): 0 mismatches. The C# program ran on .NET 10, and C# shadowing gives CS0128 (captured). The Rust Reference (overflow, `as`) and Cargo Book (profile defaults) were quoted. Goldberg 1991 was verified via Crossref, both YouTube videos via oEmbed, and all other links returned HTTP 200. Headless Chrome shows 0 console messages and 0 KaTeX errors. Screenshots were checked at 1440 px light and dark, and at 390 px.

## Chapter 2.2 — Ownership and moves (2026-10-31)

| # | Problem found | Fix |
|---|---|---|
| 1 | **Wrong claim caught by compiling the fragment:** the draft said `let _ = mutex.lock().unwrap();` "compiles, which is why it's dangerous" | rustc's deny-by-default lint `let_underscore_lock` rejects it (captured as e6). Rewrote the section, pitfall and quiz Q6 around *custom* guards (a `Lease`), which do compile, and added the opt-in `let_underscore_drop` lint, verified to warn (w7) |
| 2 | The move timing printed "0.000 µs" as if it were a measurement | The program now prints "< 0.05 µs" (below timer resolution); the chart draws the move at the resolution floor and says so |
| 3 | The first cost run was noisy (100k clone 67 µs vs ~15 µs) | Three fresh runs; published the run closest to the medians; the chart uses medians (0.1 / 14.2 / 224.5 / 2017.8 µs) |
| 4 | Clippy: dead-code fields in the drop demo; `useless_vec`, then `vec_init_then_push` | Documented `#[allow(dead_code)]` on the demo struct; an array instead of a Vec (the Reference gives the same first-to-last order) |
| 5 | Exercise 3 warned about an unused first `a` | Added a line that reads both values before shadowing (puzzle unchanged) |
| 6 | Cross-reference claimed F8's Exercise 1 used `mem::take` (it consumed by value) | Removed the claim |
| 7 | Stepper step 3's note overlapped the `s2` box; drop-order panel titles touched their borders | Moved the note down; added clearance; re-shot |

Checked: all 21 Rust blocks were extracted from the *built page*. The 11 programs compile. The 6 intentional errors fail exactly as shown (E0382 ×2, E0507, E0204, E0040, `let_underscore_lock`). The 4 fragments compile and run with stub harnesses (`Drop` impl, `let _` lease, partial move/`mem::take`/`replace`, conditional move). The heap address was printed before and after a move (same) and for a clone (different). Drop order (locals reversed, fields and array in order, `let _` vs `let _g`, unwinding) was observed directly. The C# `IDisposable` demo ran in Release on .NET 10: a forgotten `Dispose` stays open until a forced GC runs the finalizer, and use-after-dispose throws `ObjectDisposedException`. Quotes come from the Rust Book (ownership rules), the Reference (destructor order), `mem::forget` docs ("not marked as unsafe…"), the Rustonomicon (drop flags), and Microsoft Learn (finalizers not run at exit since .NET 5). Both YouTube videos were verified via oEmbed, and all other links returned HTTP 200. Headless Chrome shows 0 console messages. Screenshots were checked at 1440 px light and dark, and at 390 px.

## Chapter 2.3 — Borrowing and references (2026-10-31)

| # | Problem found | Fix |
|---|---|---|
| 1 | **Benchmark artefact:** the first `&mut` vs `RefCell` run put `black_box` on the reference itself, which forced a memory round-trip and made `RefCell` look *faster* than `&mut` (1.95 vs 2.05 ns) | Black-boxed only the input values, with the counter behind a reference in an `#[inline(never)]` function. Read the arm64 assembly to explain the result: `&mut` keeps the counter in a register; `RefCell` adds one load and branch per iteration, and LLVM removed the borrow-flag writes. Published honestly as "within noise" |
| 2 | The 3 runs of the discarded benchmark version were nearly counted in the published medians and ranges | Published stats use only the 12 runs of the final code (Mutex 6.55–6.58 ns, not 6.51–6.60) |
| 3 | The first explorer ground truth was corrupted: macOS's case-insensitive file system merged `ABW.rs` and `aBW.rs` | Renamed generated files to digits; regenerated all 522 programs |
| 4 | The first lexical model disagreed with rustc 1.30 on 91 programs | When a write conflicts with both a live shared and a live mutable loan, rustc 1.30 reports the *earliest* loan and NLL reports the mutable one. Modelled that; 0 mismatches |
| 5 | Clippy: `&Vec<String>` parameter (`ptr_arg`), inconsistent digit grouping in cents | Switched to `&[String]`, and the chapter now teaches the lint; `25_000` etc. |
| 6 | e3.rs emitted an extra "value assigned is never read" warning next to E0506 | The program now reads the new value too |
| 7 | Timeline listing comments overflowed the code block; the step-8 "lent out" overlay stayed visible; the cost caption claimed the RefCell assembly was "visible" on the page | Shortened comments; overlay limited to steps 6–7; caption now says it was seen with `--emit asm` |
| 8 | A Go-further description claimed the Let's Get Rusty video's second half covers borrowing (unverified) | Reworded to what the title supports |

Checked: all 27 Rust blocks were extracted from the *built page*. The 11 programs (10 binaries and the `alias.rs` library) compile, and the binaries run. The 13 intentional errors fail exactly as shown (E0502 ×6, E0499, E0506, E0505, E0597, E0106, E0596, plus the Exercise 3 puzzle's E0502 and E0382). The 3 fragments compile with a stub `main`. Exercise 3's verdicts and the solution's side claims (the annotated reborrow compiles; swapping f gives E0506; d's `mut` warning) all come from rustc. The explorer's `check()` was taken from the built HTML and run in Node against 522 programs compiled by rustc 1.99 and by rustc 1.30.0 (x86_64 under Rosetta): 1,044 results, 0 mismatches. Error headlines were mapped from rustc output. rustc 1.30 was confirmed to be lexical ("immutable borrow ends here" at `}`). Assembly was captured for `add_twice` (`&mut`, raw pointers) and for .NET 10's JIT `AddTwice(ref, ref)` via `DOTNET_JitDisasm`. The C# demo ran in Release on .NET 10: `MergeInto(ids, ids)` and modify-during-foreach throw `InvalidOperationException`; `AddTwice(ref z, ref z)` = 40. CS8168 was captured. Quotes come from the Rust Book (borrowing, both rules, dangling, data races), the rustc dev guide (two-phase borrows), the 1.63 release notes and blog (NLL), the Polonius blog (2026-08-04), RFC 2094 (problem case #3), and Microsoft Learn (ref safe context, `List<T>` enumerator). Both YouTube videos were verified via oEmbed, and all other links returned HTTP 200. Headless Chrome shows 0 console messages. Screenshots were checked at 1440 px light and dark, and at 390 px.

## Chapter 2.4 — Strings and slices (2026-10-31)

| # | Problem found | Fix |
|---|---|---|
| 1 | **Wrong video:** the Go-further link for Computerphile's Unicode video used an ID that is actually a PyCon 2015 concurrency talk | Found by fetching the page title; replaced with `MijmeoH9LT4`, verified via oEmbed ("Characters, Symbols and the Unicode Miracle - Computerphile") |
| 2 | Explorer panic text mismatched Rust on 7 of 1,568 slice cases: Rust prints a combining mark with `{:?}` as `'\u{301}'`, not the raw char | Generated Rust's `{:?}` escaping for every scalar value above 0x7F (908 ranges) and matched it with a JS Unicode-property predicate plus 6 explicit exceptions (Hangul fillers, U+FF9E/F): 0 mismatches over 1,111,936 code points; slices 0/1,568 |
| 3 | The first ground-truth files were unparsable: Rust's `{:?}` writes `\u{..}`, which isn't JSON | Decoded Rust escapes explicitly before comparing |
| 4 | The first allocation benchmark left most allocations unexplained | Worked out per-line counts (17/6/3.1) and added approach D (reused `Vec`), showing the remainder was the token `Vec` regrowing: 1,003 allocations |
| 5 | The text said the String buffer "moved twice"; the first "new buffer" in the output was the initial allocation | Reworded: first push allocates, growth to 16 in place, growth to 32 moved |
| 6 | Several cross-references pointed to the wrong chapters (CLI 2.10 → 2.13, FFI 5.4 → 5.6, serde 6.2 → 7.1, interning 9.2 → 9.2–9.3) | Checked against the curriculum in course-data.js and fixed |
| 7 | `build.py` rejected the page because Rust source legitimately contains `{{` (a format-string escape) | The assertion now checks only for unreplaced `{{code:`/`{{out:` placeholders |
| 8 | UTF-8 output table misaligned (padding counts chars, not display width); a label printed `get(0..4)` twice; E0277 listed ~12 lines of std impls | Text moved to the end of each line; label fixed; E0277 trimmed with a visible "omitted" marker |
| 9 | Phone width: a 7-char ZWJ family grapheme overflowed the figure; step 6 arrows crossed; chart log-axis labels collided | Grapheme boxes wrap; owner arrow shown only in step 5; ticks only at powers of ten |

Checked: all 17 Rust blocks were extracted from the *built page*. The 8 programs compile and run (utf8 is linked against unicode-segmentation 1.13.3, and its output equals the captured one). The 6 intentional errors fail exactly as shown (E0308, E0277, E0369, E0382, E0502, E0515). The 3 fragments compile with a stub `main`, including the `Cow` and `from_utf8_lossy` snippet. The boundary panic is captured verbatim. The tokenizer allocation counts are exact and identical over 3 runs (170,000 / 60,000 / 31,000 / 1,003); times are the median of 3 (4.17 / 2.17 / 1.45 / 0.55 ms). The explorer's `analyze`/`sliceStr` were taken from the built page and run in Chrome 156 against the Rust ground truth: 38/38 strings (bytes, chars, UTF-16, graphemes, boundaries) and 1,568/1,568 slices, including the exact panic text; the same held in Node (ICU 78.3, Unicode 17). The C# demo ran on .NET 10: `Length` and `StringInfo` agree with Rust's `encode_utf16` and graphemes on all six strings; the indexer returned a lone surrogate; InvariantCulture called é ≡ e+◌́; tr-TR gave "TİTLE"; `Substring` allocated 48 bytes and `AsSpan` 0. Quotes come from the Rust Book (ch. 8.2: `Vec<u8>` wrapper, the indexing rationale, the three views), the std docs (`str`, `char`, `Cow`) and Microsoft Learn (`String.Length`). The video was verified via oEmbed and all links returned HTTP 200. Headless Chrome shows 0 console messages. Screenshots were checked at 1440 px light and dark, and at 390 px.

## Compliance audit against learning-resource-prompt.md (2026-10-31, before 2.5)

I re-read the original prompt and checked chapters F8–2.4 against it.

| # | Requirement | Finding | Fix |
|---|---|---|---|
| 1 | Template §12: Go further includes "key papers (title, authors, year, one-line why)" | 2.2, 2.3 and 2.4 had docs and videos but no papers, although relevant ones exist | Added, all verified via Crossref or USENIX: Clarke, Potter, Noble, *Ownership types for flexible alias protection* (OOPSLA 1998) and Jung et al., *RustBelt* (POPL 2018) to 2.2; Jung et al., *Stacked Borrows* (POPL 2020) and Villani et al., *Tree Borrows* (PLDI 2025) to 2.3; Pike & Thompson, *Hello World or Καλημέρα κόσμε or こんにちは 世界* (USENIX Winter 1993) to 2.4. An Oxide arXiv entry was considered, but the arXiv lookup was inconsistent, so it was not added |
| 2 | Rule 3: never use a term before it is taught | Closures (`|r| …`) and iterator chains appear in 2.3 and 2.4 code (and one 2.2 solution) before chapter 2.10, with no bridging note. F2 had established the "treat as a black box for now" pattern; these chapters didn't follow it | Added a LINQ reading note at the first use in 2.3 (map/filter/any/max_by_key/collect ↔ Select/Where/Any/MaxBy/ToList, lazy, compiles to a loop), with glossary terms *closure* and *iterator*; a pointer note in 2.4; a comment in 2.2's Exercise 1 |
| 3 | Everything else: 12-section template, ≥2 visuals with ≥1 interactive or animated, tested labs with expected output, decision tables, pitfalls, architecture view, 5–10 explained questions, summary plus glossary, "Accurate as of" stamp (generated by app.js from course data), ⚠ Verify notes, verified links, manifest updates, verification log, desktop and mobile rendering | Followed in every chapter | — The rule is now written into manifest.json's `authoring_contract.checklist` so later sessions apply it |

Rebuilt 2.2, 2.3 and 2.4 from their templates. 2.2 Exercise 1 still compiles, with the same output apart from timings.

## Chapter 2.5 — Structs, enums and pattern matching (2026-10-31)

| # | Problem found | Fix |
|---|---|---|
| 1 | The first JS exhaustiveness model listed *every* missing case and disagreed with rustc on 107 of 512 arm subsets | rustc reports only variants absent from all arms (a guarded arm counts as present), and descends into partly covered variants only when none is absent. Modelled that: 0/512 mismatches in Node and in Chrome. The chapter now teaches the two-stage behaviour, with the sentence made precise against the recorded rustc output |
| 2 | **A real arm-order bug in my own lab code:** `classify(150_000)` returned "even thousands", because the guard arm sat above the `big @ 100_000..` arm | Reordered the arms; kept the story in Lab step 4 as a lesson, since the compiler can't warn about guard overlap |
| 3 | Clippy `question_mark` on a `let-else` returning `None`; dead variants (`Succeeded`, and three events in Exercise 2) | `parse_kv` returns errors with messages; added a success run and a full retry path, so every arm is exercised |
| 4 | A claim that rustc's checker "builds on" Maranget's paper | rustc's docs say "inspired from … this paper", with changes; the wording now matches |
| 5 | A deep-dive claim that `match` compiles to a jump table was unverified | Inspected arm64 assembly: branch-free `cset`/`csel`. The text shows that listing and says the compiler picks jump tables, compares or branch-free code |
| 6 | A BSD `sed` alternation silently produced empty error captures | Captured without the alternation filter |

Checked: all 21 Rust blocks were extracted from the *built page*. The 9 programs compile and run, including the `jt.rs` library. The 8 intentional diagnostics appear exactly as shown (E0072, the edition-2024 binding-mode error, E0063, E0594, E0382, E0004, E0005, the E0308 let-else divergence, and the unreachable-pattern warning with its run output 250). The edition-2021 acceptance of e9 was checked. The 3 fragments compile with harnesses. Exercise 2's claim was verified: adding `Paused` gives ``E0004 `(State::Paused, _)` not covered``. The C# demo built with CS8509 ("the pattern '_' is not covered") and threw `SwitchExpressionException` on `Failed`. Operator dispatch is the median of 3 runs (String 13.2 ms, enum 8.5 ms). Quotes come from the Rust Book (methods, automatic referencing, `new` convention, match order, exhaustiveness), the 1.88 and 1.65 release posts, and the edition guide (2024 match ergonomics). The Maranget JFP 2007 paper was verified via Crossref and the video via oEmbed; all links returned HTTP 200. Headless Chrome shows 0 console messages. Screenshots were checked at 1440 px light and dark, and at 390 px.

## Chapter 2.6 — Error handling (2026-10-31)

| # | Problem found | Fix |
|---|---|---|
| 1 | **A real error-design bug in my own lab code:** the hand-written `RuleError::Io` message included the I/O error's text, which `source()` also returned, so the report printed "No such file or directory" twice | Message moved to `source()` only. The chapter now teaches the rule "a cause in the message or in `source()`, never both" from this example |
| 2 | **Surprising measurement:** I expected Rust panics to be cheaper than .NET exceptions; a caught panic measured ~13 µs against ~3.1 µs | Published as measured (median of 3 runs in each language), with the lesson that panics are not optimised for control flow |
| 3 | The first e2 produced E0271 (type inference) instead of the intended "`?` couldn't convert the error" | An explicit `parse::<u32>()` gives the E0277 the text describes |
| 4 | The claim about what `main` prints on `Err` couldn't be quoted from the docs page | Read the toolchain's own `std/src/process.rs` (`attempt_print_to_stderr(format_args_nl!("Error: {err:?}"))`, `ExitCode::FAILURE`) and confirmed by running (exit 1, stderr) |
| 5 | Three cross-references said retries were in chapter 10.4 (actually the persistence layer) | Pointed to 10.3/10.5 (sagas, task dispatch and backoff) and 6.6 (retries, timeouts) |
| 6 | The video search returned only scraped aggregator pages | None used; two candidate IDs verified via oEmbed (Let's Get Rusty, Jeremy Chone) |
| 7 | The explorer's JSON contains `=>`, which build.py's HTML escaping would corrupt inside `<script>` | Added a raw-include placeholder (`{{raw:…}}`, with `</` escaped); embedded data checked equal to the Rust output in Chrome (16/16) |
| 8 | Explorer output cells inherited the code-block border and looked like empty inputs; the label column was too wide on phones | Border removed; narrower column; re-shot |
| 9 | Dead fields, alignment, and a `useless_format` lint in the generator | Fields printed; alignment fixed; documented `allow` in the generator only |

Checked: all 13 Rust blocks were extracted from the *built page*. The 7 programs compile and run, linked against thiserror 2.0.21 and anyhow 1.0.104. The 3 intentional diagnostics appear as shown. The 3 fragments compile with harnesses, including the Reference's `?` desugaring, checked to behave identically to `?` with a `From` conversion. `main` returning `Err` prints Debug to stderr and exits 1; an uncaught panic exits 101. The cost figures are medians of 3 program runs in each language (Rust `Result` ~2 ns; .NET `TryParse` ~7 ns; .NET exception ~3.1 µs per failure; Rust caught panic ~13.3 µs). The explorer's embedded outputs are verbatim from the Rust generator (16 combinations), checked in Chrome. Quotes come from the Rust Book ch. 9 (two categories, no exceptions), the Reference (`?` semantics), the anyhow docs (backtrace variables), crates.io (crate descriptions and owner dtolnay), and Microsoft Learn (Try* pattern guidance). Papers: Goodenough, CACM 18(12) 1975, and Weimer & Necula, TOPLAS 2008, verified via Crossref; doi.org redirects correctly, while ACM returns 403 to scripts. Both videos were verified via oEmbed. Headless Chrome shows 0 console messages. Screenshots were checked at 1440 px light and dark, and at 390 px.

## Chapter 2.7 — Modules, crates and packages (2026-10-31)

| # | Problem found | Fix |
|---|---|---|
| 1 | The first `cargo build -v` capture was empty (my regex didn't match Cargo's command format) | Parsed the `Running` lines properly: 3 `rustc` invocations, the lib plus 2 bins with `--extern ruleset` |
| 2 | `Console` was unresolved in the C# app (implicit usings off) | Enabled implicit usings; the demo then shows CS0122 for the internal class and, unexpectedly, CS1729 for the internal constructor. That's now a point in the chapter |
| 3 | An exercise capture came out empty because rustc wasn't on PATH at that moment | Re-captured |
| 4 | Explorer: in the two-column layout at 1440 px, the `mod d` and `mod x` call-site lines (and their ✓/✗) were cut off | Single-column layout; each call site on its own line; re-shot at desktop and phone |
| 5 | Stepper step 5: the "mod lexer; (in parser.rs)" label sat on its arrow | Labels moved above the arrows |
| 6 | The glossary had `crate` from 0.1, deferring the precise definition to 2.7 | Updated that entry instead of adding a duplicate |

Checked: the 7 package files on the page were copied from the *built HTML* into a fresh Cargo package. It builds, both binaries' output is identical to the published output, and it's Clippy-clean. The 4 cross-crate error files fail inside that package exactly as shown (E0603 with "not publicly re-exported", E0451, E0624 + E0616 with the method hint, E0433 with the import hint). E0761 and E0583 come from a separate layout package. The forms program, 3 fragments and 2 exercise solutions compile (the compare fragment warns about an unused function, which is expected in an illustration). The broken exercise gives the 4 shown errors and the puzzle exactly (f) and (g). The visibility explorer's `access()` matches rustc on all 60 item × call-site pairs, including a call from a second crate, in Node and in Chrome. The `rustdoc` output confirms the public API (re-exports at the root; no `engine`/`parser`/`lexer` pages). The lints `private_interfaces`/`private_bounds` were confirmed in `rustc -W help`. Quotes come from the Rust Book ch. 7 (crate, package, crate limits, conventions), the Reference (privacy default and the two rules, `pub(…)` forms), the Edition Guide 2018 (paths, `mod.rs`) and Microsoft Learn (C# defaults, "Namespaces have no access restrictions"). The Parnas paper, CACM 15(12) 1972, was verified via Crossref; doi.org redirects correctly and ACM returns 403 to scripts. Both videos were verified via oEmbed and all other links returned HTTP 200. Headless Chrome shows 0 console messages. Screenshots were checked at 1440 px light and dark, and at 390 px.

## Chapter 2.8 — Standard collections (2026-10-31)

| # | Problem found | Fix |
|---|---|---|
| 1 | **e1, meant to show E0502, compiled:** `limits.insert("weekly", daily * 7)` is accepted because the argument is computed before `insert`'s mutable borrow (two-phase borrow) | e1 now uses `daily` after the insert (E0502). The two-phase version is taught as a note, verified to compile |
| 2 | **Wrong DOI caught:** my DOI for Williams's heapsort paper resolved to Boothroyd's "Algorithm 230: Matrix Permutation" | Crossref search found the correct DOI, 10.1145/512274.3734138 (CACM 7(6) 347–348, 1964) |
| 3 | **Unexplained measurement:** borrowed-key entry (D) was slower than the `get_mut` path (B), ~22 vs ~17 ns. My first explanation (key locality) was tested and rejected (compact vs scattered keys: 13.3 vs 12.3 ns); run order was also ruled out | Published as measured, with a ⚠ Verify callout saying the cause isn't established; added to verify_queue. The robust lessons (owned-key allocation, double lookups) don't depend on it |
| 4 | I wrote that C#'s `SortedDictionary` is a red-black tree; Microsoft documents it only as "a binary search tree" | Wording now matches Microsoft's docs |
| 5 | Clippy `useless_vec` in the engine lab | Array instead of `Vec` |
| 6 | The two-phase helper program's output (a `HashMap` print) varies per run | Not published; the chapter explains random order instead, and two fragment runs showed different orders of the same map |
| 7 | e4's compiler help suggests only `#[derive(Ord)]`, which doesn't compile alone | The text notes that `PartialOrd`, `Eq` and `PartialEq` are needed too |

Checked: all 13 Rust blocks were extracted from the *built page*. The 6 programs compile and run, and the 5 intentional errors fail as shown. The 2 fragments compile and run with harnesses. Also checked on 1.99: e5's `retain` fix, `extract_if` on `Vec` and `HashMap`, and `total_cmp`. The counting benchmark is the median of 3 runs in each language (Rust 38.8 / 16.7 / 27.9 / 22.1 ns; C# 25.2 / 12.7 ns). The chooser's costs and guidance were copied from the `std::collections` performance table and the `BinaryHeap` docs; the BTreeMap node size (B = 6, 11 keys) was read from the toolchain source; the .NET facts come from Microsoft Learn (`PriorityQueue` quaternary min-heap; `CollectionsMarshal` usage rule). Papers: Williams 1964 and Bayer & McCreight 1972, via Crossref. Videos verified via oEmbed (both found by ID probing after the search returned no video pages). All links returned HTTP 200 (ACM returns 403 to scripts, but doi.org redirects correctly). Headless Chrome shows 0 console messages. Screenshots were checked at 1440 px light and dark, and at 390 px.
