# 🌼 Passiflora — GetDecics at warp speed

A much faster, **result-identical** build of the NumberFields@home application
(`GetDecics`, "Get Decic Fields"), packaged as a ready-to-run BOINC
anonymous-platform app. The CPU version is 10–25× faster than the stock CPU
app on one core; the GPU version runs the whole search on the graphics card
(NVIDIA, AMD, Intel through OpenCL) and finishes work units in seconds.

> The passion flower has 5 sepals and 5 petals — ten parts. NumberFields@home
> searches for number fields of degree ten, built as degree-5 extensions of a
> quadratic field.

**Coded by Alperen Yavuz.** Original application by Eric Driver
([drivere/get-decics-numberfields](https://github.com/drivere/get-decics-numberfields)).
Only the code written for Passiflora is in this repository (GPLv2+); it is
applied on top of the upstream source, see [BUILDING](docs/BUILDING.md).

[![Latest release](https://img.shields.io/github/v/release/alplix/passiflora?label=latest&color=8e44ad)](https://github.com/alplix/passiflora/releases/latest)
[![License: GPL v2+](https://img.shields.io/badge/license-GPLv2%2B-blue.svg)](https://www.gnu.org/licenses/old-licenses/gpl-2.0.html)

---

## 📦 Downloads

**➡️ [Grab the latest release here](https://github.com/alplix/passiflora/releases/latest) ⬅️**

The number after the prefix is the version (`020` = v0.2.0).

| starts with | what it is | who it is for |
|---|---|---|
| **`CPU_`** | the normal app, runs on the processor | **everybody** — no graphics card needed |
| **`GPU-OpenCL_`** | the CPU app **plus** the OpenCL version that uses an **NVIDIA, AMD or Intel** graphics card | anyone with a card that has double-precision support |

| Package | System | Notes |
|---|---|---|
| 🪟 `CPU_…_windows_x86-64.zip` | Windows 64-bit | one `.exe`, picks AVX2 or plain code at run time |
| 🪟 `GPU-OpenCL_…_windows_x86-64.zip` | Windows 64-bit + OpenCL driver | NVIDIA tested on real hardware (RTX 5070 Ti); AMD and Intel untested |
| 🐧 `CPU_…_linux_x86-64.tar.gz` | Linux 64-bit, any distribution | fully static |
| 🐧 `GPU-OpenCL_…_linux_x86-64.tar.gz` | Linux 64-bit, glibc 2.34+ (Ubuntu 22.04 and newer) | tested with `pocl` only, **not on a real GPU yet** |

macOS and ARM builds are not available yet.

Install steps are in `INSTALL.txt` (attached to every release) and inside each package.

---

## ⚡ How fast?

Work units from the upstream test set, i5-13400F (CPU) and RTX 5070 Ti (GPU),
measured while other BOINC work was running on the same machine:

| Work unit | stock CPU app | Passiflora CPU (1 core) | stock GPU app | Passiflora GPU |
|---|---|---|---|---|
| `sf5_DS-16x12_Grp90of1600000` | ~1700 s | 93 s | 83 s | **5.1 s** |
| `sf3_DS-16x270_Grp74of3932160` | 1727 s | 72 s | – | **5.6 s** |
| `sf3_DS-16x271-1_Grp99of2000000` | 508 s | 45 s | – | **7.2 s** |
| all 31 test work units | ~47 000 s (est.) | 3155 s | – | **439 s** |

The stock GPU app only offloads one test and is fed by a single CPU thread, so on a
modern card the card sits idle; Passiflora's GPU version runs the whole inner search
on the card.

---

## ✅ Are the results the same?

Yes — byte for byte, apart from the "Elapsed Time" line:

* All **31** work units of the upstream test set give exactly the reference
  outputs (polynomials found *and* all counters), on the CPU (Linux, Windows) and
  on the GPU (Windows, NVIDIA).
* Every shortcut is exact, not approximate: the new polynomial filter can only reject
  polynomials that are provably not solutions, and everything that is not rejected
  goes through the original test unchanged. See [TECHNICAL](docs/TECHNICAL.md).
* Checkpoint/restart was tested by killing runs mid-way (CPU and GPU).

### ⚠️ What has *not* been tested yet

* Passiflora has been run with the upstream test work units and a stand-in for the
  BOINC client — **not yet in a real BOINC client against the live NumberFields
  server**. Whether the project accepts results from the anonymous platform is up to
  the project. **Please run a single task first and check that it validates before
  letting it run for days.**
* Do not switch between the CPU app, the GPU app and the stock app in the middle of
  a task: checkpoints are only compatible between runs of the same kind.
* Linux GPU, AMD GPUs and Intel GPUs: built, but not run on real hardware.
* Passiflora finishes tasks far faster than the stock app, so it earns far more credit
  per hour. Please be fair to other volunteers and tell the project that you use it.

---

## 🛠️ Build it yourself

The repository contains only the code written for Passiflora. [docs/BUILDING.md](docs/BUILDING.md)
shows how to fetch the upstream source, apply `patches/passiflora.patch`, and build
for Linux and Windows (and the OpenCL version).

## 📜 License and credits

Passiflora's own code is **GPL-2.0-or-later**. The binaries link PARI/GP
(GPL-2.0-or-later), GMP and BOINC's libraries; see [THIRD_PARTY.md](THIRD_PARTY.md) and
[NOTICE.md](NOTICE.md). The source that corresponds to the binaries is this
repository plus the upstream repository and PARI 2.8 named there.
