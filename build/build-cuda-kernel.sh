#!/bin/bash
# Builds the CUDA kernel into a fat binary and turns it into src/nf_cuda_fatbin.h.
# Needs the CUDA toolkit (12.x; nvcc).  Set NVCC to its path, SRC to the passiflora src directory.
set -e
NVCC=${NVCC:-nvcc}
SRC=${SRC:-$(cd "$(dirname "$0")/../src" && pwd)}
OUT=${OUT:-$SRC}
cd "$SRC"
GEN=""
for a in 50 52 60 61 70 75 80 86 89 90 100 120; do GEN="$GEN -gencode arch=compute_$a,code=sm_$a"; done
GEN="$GEN -gencode arch=compute_120,code=compute_120"
# Contraction (fmad) and fast math must be off: every double operation has to round exactly as on the CPU.
$NVCC -fatbin -O3 --fmad=false -prec-div=true -prec-sqrt=true -ftz=false -I. -allow-unsupported-compiler $GEN \
      nf_kernel.cu -o "$OUT/nf_cuda.fatbin"
python3 - "$OUT/nf_cuda.fatbin" "$OUT/nf_cuda_fatbin.h" <<'PY'
import sys
d = open(sys.argv[1], 'rb').read()
with open(sys.argv[2], 'w') as f:
    for i in range(0, len(d), 24):
        f.write(', '.join('0x%02x' % b for b in d[i:i+24]) + ',\n')
print(len(d), "bytes")
PY
