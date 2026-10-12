#!/bin/bash
# macOS Apple silicon (arm64) build, run natively.  CPU only: Apple GPUs have no double precision.
# Needs: Xcode command line tools, Homebrew gcc (gfortran) and gmp, BOINC's application libraries
# (libboinc.a, libboinc_api.a + headers; built from source, see docs/BUILDING.md), PARI 2.8-1711 built in $W/pari
# (./Configure --static --with-gmp=/opt/homebrew --without-readline; make lib-sta) and the source tree in $W/src
# (output of prepare-src.sh).  Floating-point contraction is off so the enumeration rounds like the x86 build.
set -e
export PATH=/opt/homebrew/bin:$PATH
W=${W:-$HOME/passiflora-work}
BOINC=${BOINC:-$HOME/juniper-work/boinc-install}
P=$W/pari
OBJ=$(basename "$(ls -d $P/O* | head -1)")
MIN=-mmacosx-version-min=11.0
cd "$W/src"
: > config.h
INC="-I. -I$BOINC/include/boinc -I$BOINC/include -I$P/src/headers -I$P/$OBJ -I/opt/homebrew/include"
rm -f *.o *.mod GetDecics_*
gfortran -O3 -mcpu=apple-m1 -ffp-contract=off -cpp $MIN -c pdfilter.f90 -o pdfilter.o
for f in polDiscTest_cpu TgtMartinet GetDecics; do
  clang++ -O3 -ffp-contract=off -std=c++11 -w $MIN $INC -DAPP_VERSION_CPU_STD -c -o $f.o $f.cpp
done
clang++ -O2 -std=c++11 -w $MIN $INC -c nf_gpu_stub.cpp
GF=$(gfortran -print-file-name=libgfortran.a)
QM=$(gfortran -print-file-name=libquadmath.a)
GCC=$(gfortran -print-libgcc-file-name)
clang++ -O3 $MIN -o GetDecics_cpu GetDecics.o TgtMartinet.o polDiscTest_cpu.o nf_gpu_stub.o pdfilter.o \
  $BOINC/lib/libboinc_api.a $BOINC/lib/libboinc.a $P/$OBJ/libpari.a /opt/homebrew/lib/libgmp.a \
  "$GF" "$QM" "$GCC" -lm -lc++
strip GetDecics_cpu
ls -la GetDecics_cpu
otool -L GetDecics_cpu
echo PK_MACOS_OK
