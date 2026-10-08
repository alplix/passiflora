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
| **`CPU_`** | the CPU app only | **everybody** — no graphics card needed |
| **`GPU_`** | the OpenCL GPU app only, with an `app_config.xml` | anyone with an **NVIDIA, AMD or Intel** card that has double-precision OpenCL |
| **`CPU-GPU_`** | **both in one package**: the CPU app *and* the OpenCL GPU app, with an `app_info.xml` that lists both and an `app_config.xml` for the GPU | anyone with an **NVIDIA, AMD or Intel** card that has double-precision OpenCL — BOINC runs the GPU app on the card and the CPU app on the processor |

| Package | System | Notes |
|---|---|---|
| 🪟 `CPU_…_windows_x86-64.zip` | Windows 64-bit | one `.exe`, picks AVX2 or plain code at run time |
| 🪟 `CPU-GPU_…_windows_x86-64.zip` | Windows 64-bit + OpenCL driver | CPU `.exe` + GPU `.exe` + `app_info.xml` + `app_config.xml` |
| 🪟 `GPU_…_windows_x86-64.zip` | Windows 64-bit + OpenCL driver | GPU `.exe` + `app_info.xml` + `app_config.xml` |
| 🐧 `CPU_…_linux_x86-64.tar.gz` | Linux 64-bit, any distribution | fully static |
| 🐧 `GPU_…_linux_x86-64.tar.gz` | Linux 64-bit, glibc 2.34+ (Ubuntu 22.04 and newer) | GPU only, same layout |
| 🐧 `CPU-GPU_…_linux_x86-64.tar.gz` | Linux 64-bit, glibc 2.34+ (Ubuntu 22.04 and newer) | CPU + GPU, same layout |

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
