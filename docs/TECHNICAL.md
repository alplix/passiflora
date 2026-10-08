# How Passiflora works — and why the results are identical

## The stock CPU app spends 98 % of its time in one test

`polDiscTest_cpu` computes the discriminant of each candidate decic with GMP
(numbers grow to ~1000 bits), divides out the primes in the work unit's set S, and
asks whether the rest is a perfect square. Only about one polynomial in 10^7 passes.

## 1. An exact modular pre-filter (`src/pdfilter.f90`, `src/chain_general.inc`)

The value upstream tests differs from Disc(A) only by rational square factors
(the content of B contributes c^10, the last sub-resultant step (B0/h)^(2k)), so the
question is the same for Disc(A). Take a prime q ≡ 1 (mod 4) such that every p in S
is a quadratic residue mod q. If the polynomial passed, Disc(A) would be
± (product of primes in S) × (a square), so its Legendre symbol mod q could only be 0
or 1. **A Legendre symbol of −1 is therefore a proof that the polynomial fails.**

The filter evaluates that symbol for a few primes and clears the flag only on such a
proof. Every other polynomial — including any one where the computation is
inconclusive — goes on to the *unchanged* GMP test (through the `polyMask`
argument upstream already uses for its GPU builds), so the set of polynomials that
pass is exactly the stock set. Each prime rejects about half of the candidates.

Disc(A) mod q comes from a Euclid chain over F_q:

* **Fast path** — generic degree sequence (each remainder one degree lower), two
  pseudo-remainder rounds per step. Every leading-coefficient power that appears has
  an even exponent, so χ(Disc A) = χ(final constant) and no modular inverses are needed.
* **General path** (`chain_general.inc`) — for lanes where a leading coefficient
  vanishes (some families do this structurally, e.g. x^10 + b3·x^7 + …). Polynomials
  are stored left-aligned so one elementary step has the same formula in every SIMD
  lane; the odd powers of lc(V) from Res(V,U′) = lc(V)^(deg U′ − deg U + deg V)·Res(V,U)
  are tracked explicitly.

All arithmetic is on floating-point residues small enough that every product is exact
(single precision for q < 2^10, double for q < 2^25) with the symmetric residue
representation, so the reduction has no branch and vectorises. The CPU build
contains an AVX2/FMA and a baseline (SSE2) copy and picks one at run time.

## 2. Exact shortcuts in the enumeration (patch)

* `sqrt(X) <= B` is replaced by `0 <= X <= T`, where T is the largest double with
  `sqrt(T) <= B` (found once per bound with `nextafter`). `sqrt` is correctly rounded
  and monotone, so both forms take the same branch for every double X, including NaN,
  negative values and −0.
* In the innermost (m1) loop both a4 conditions are convex quadratics in m1. The range
  is narrowed to where they can hold, solving with a margin (1e-9 relative to the
  largest term, ±2 in m1) far larger than the floating-point error of the original
  test; every skipped m1 provably fails the original test. Nothing is narrowed when
  int64 overflow could matter.

The enumeration is compiled exactly like upstream (no FMA contraction), so all
floating-point loop bounds are bit-identical.

## 3. The GPU version (`src/nf_enum.cl`, `src/nf_gpu.cpp`)

The stock GPU app offloads only the discriminant test and feeds it from one CPU thread
(88 bytes per polynomial over PCIe, ~50 GB for one work unit), so a modern card idles.

Passiflora's CPU code walks only the outer loops and queues a *node* per fixed
(a1…a3) state — 18 doubles and 35 integers. The OpenCL kernel runs one work item per
(node, m2): the complete m1 loop, the bb4…bb9 bound tests in the original order, and a
single-precision version of the filter above with up to 24 small primes. It counts every
polynomial of the original enumeration (the application reports that number) and returns
only the ~1 in 10^5 that survive the filter. The CPU then finishes those exactly as
before: the Fortran filter with large primes, the GMP test, PARI's irreducibility test and
the field discriminant.

Bit-for-bit agreement with the CPU code relies on:

* doubles evaluated in the same order, `FP_CONTRACT OFF`, IEEE `sqrt` and division;
* integer arithmetic done in `ulong` so it wraps like the CPU's `long long`;
* double → int64 conversion following the x86 rule (NaN or out of range → INT64_MIN),
  which the CPU code can hit in degenerate cases;
* survivors sorted back into enumeration order before the exact tests.

Checkpoints are written between batches and resume at the first node of the next
batch. The batch size adapts to about 100 ms per kernel launch.

## Validation

* All 31 work units of upstream's `Test/dataFiles` against their `.truth` outputs
  (polynomials and every counter): CPU on Linux, CPU on Windows (subset), GPU on Windows.
* `NF_VERIFY=1` also runs the exact GMP test on every polynomial and aborts if the filter
  ever disagrees; `NF_GPUCHECK=1` runs the CPU loops next to the GPU ones and aborts if
  the polynomial counts differ.
* Debug builds with `-DNF_CHECK_SQRT -DNF_CHECK_PRUNE` evaluate the original enumeration
  conditions next to the shortcuts.
* Kill/resume tests for the CPU and the GPU app.

## Environment switches (testing)

| Variable | Effect |
|---|---|
| `NF_NOFILTER=1` | stock code path (no pre-filter) |
| `NF_VERIFY=1` | also run the exact test on every polynomial, abort on mismatch |
| `NF_FORCE_BASE=1` | use the baseline (SSE2) filter build |
| `NF_GENERAL_ALL=1` | send every lane through the general chain |
| `NF_GPU=0` | never use the GPU |
| `NF_GPUCHECK=1` | GPU mode plus the CPU loops; abort if the counts differ |
| `NF_OCL_ANY=1` | GPU mode on the first OpenCL device without BOINC (`NF_OCL_PLATFORM`, `NF_OCL_DEVICE` pick another) |
| `NF_GPU_ITEMS=N` | fixed work items per launch instead of the adaptive size |
| `NF_MAXPOLYS=N` | stop after N polynomials and print a timing split (CPU mode) |
| `NF_PDFDEBUG=1` | print per-prime survivor counts for the first batch |
