# Third-party software in the binaries

| Component | Version | License | Where from |
|---|---|---|---|
| GetDecics (algorithm, BOINC wrapper, CPU test) | upstream commit `638ca4e` (2021-01-16) | no license stated | <https://github.com/drivere/get-decics-numberfields> |
| PARI/GP library (static) | 2.8 development snapshot `2.8-1711-ge5c317c` | GPL-2.0-or-later | the `Pari/pari-2.8-1711-ge5c317c` directory of the upstream repository |
| GMP (static) | 6.2.1 (Linux), 6.1.2 (Windows, from the upstream repository's MinGW64 build) | LGPL-3.0-or-later or GPL-2.0-or-later | <https://gmplib.org> |
| BOINC API / library (static) | 8.x | LGPL-3.0-or-later | <https://github.com/BOINC/boinc> |
| libgfortran, libquadmath, libgcc, libstdc++ (static) | GCC 11 (Linux), GCC 13/15 (Windows, MinGW-w64) | GPL-3.0-or-later with the GCC Runtime Library Exception (libquadmath: LGPL-2.1-or-later) | <https://gcc.gnu.org> |
| MinGW-w64 runtime (Windows) | | public domain / ZPL | <https://www.mingw-w64.org> |
| OpenCL | system library, loaded at run time (not shipped) | – | your GPU driver |

**Corresponding source.** Because the binaries contain GPL-licensed code, the source
they were built from is available to anyone who has a binary: this repository
(`src/`, `patches/`, `build/`), the upstream repository at the commit above and
PARI as named in the table. If any of that becomes unavailable, open an issue and the
exact tree will be provided.
