#!/bin/bash
# Assembles the source tree to compile: the five upstream files this app needs, patched, plus Passiflora's own files.
#   UPSTREAM  = a checkout of drivere/get-decics-numberfields (commit 638ca4e)
#   PASSIFLORA = this repository
#   OUT       = where to put the tree
# nf_cuda_fatbin.h (built by build-cuda-kernel.sh) is copied if it exists in $OUT_FATBIN.
set -e
UPSTREAM=${UPSTREAM:-/root/nf/upstream}
PASSIFLORA=${PASSIFLORA:-$(cd "$(dirname "$0")/.." && pwd)}
OUT=${OUT:-/root/nf/build_src}
rm -rf "$OUT" && mkdir -p "$OUT/GetDecicsSrc"
for f in GetDecics.cpp GetDecics.h TgtMartinet.cpp TgtMartinet.h polDiscTest_cpu.cpp; do
  cp "$UPSTREAM/GetDecicsSrc/$f" "$OUT/GetDecicsSrc/"
done
( cd "$OUT" && patch -p1 --no-backup-if-mismatch < "$PASSIFLORA/patches/passiflora.patch" )
cp "$PASSIFLORA"/src/* "$OUT/GetDecicsSrc/"
[ -n "$OUT_FATBIN" ] && [ -f "$OUT_FATBIN" ] && cp "$OUT_FATBIN" "$OUT/GetDecicsSrc/"
echo "source tree ready: $OUT/GetDecicsSrc"
