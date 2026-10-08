# Notice

**Passiflora** is an optimized build of the NumberFields@home application `GetDecics`.

* The original application — the search algorithm, its bounds, the BOINC wrapper,
  the polynomial discriminant test and the CPU/GPU test programs — was written by
  **Eric Driver** and is published at
  <https://github.com/drivere/get-decics-numberfields>. That repository does not
  state a license. **Its code is not part of this repository.** `patches/passiflora.patch`
  contains only the lines Passiflora adds to or removes from three of its files
  (`TgtMartinet.cpp`, `TgtMartinet.h`, `GetDecics.cpp`); to build Passiflora you
  fetch the upstream source yourself (see `docs/BUILDING.md`).
* The files in `src/` and `bench/` were written for Passiflora by Alperen Yavuz and
  are licensed GPL-2.0-or-later (see `LICENSE`).
* Passiflora is not affiliated with or endorsed by NumberFields@home or Arizona
  State University. The released binaries contain upstream code compiled together
  with Passiflora's, linked statically with PARI/GP; they are therefore distributed
  under the terms of the GNU GPL, version 2 or later.

If you are the author of the upstream code and want something changed, please open
an issue.
