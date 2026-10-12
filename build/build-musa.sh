#!/bin/bash
# MUSA (Moore Threads) build, runs inside the container  mthreads/musa:rc4.3.0-devel-ubuntu22.04-amd64
# (Ubuntu 22.04: the program needs glibc 2.34+).  Layout expected under /work:
#   /work/src   the source tree (output of prepare-src.sh)
#   /work/pari  PARI 2.8-1711 headers (src/headers) and the built libpari.a + paricfg.h (Olinux-x86_64)
# Produces in /work/out:  GetDecics_musa  libnf_musa.so  libmusart.so.4  (ship all three in one directory)
# docker run --rm -v <dir with src, pari>:/work -v build-musa.sh:/b.sh:ro mthreads/musa:rc4.3.0-devel-ubuntu22.04-amd64 bash /b.sh
set -e
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq gfortran g++ libgmp-dev libboinc-app-dev python3 > /dev/null
M=/usr/local/musa
P=/work/pari
OBJ=Olinux-x86_64
BL=/usr/lib/x86_64-linux-gnu
mkdir -p /work/out
cd /work/src
: > config.h

# device part: MUSA runtime wrapper + kernel -> shared library (no vendor header is needed by the program)
$M/bin/musify-text -i nf_musa_dev.cu > /dev/null
$M/bin/mcc -mtgpu -x musa -fPIC -O3 -ffp-contract=off -I. -c nf_musa_dev.cu -o nf_musa_dev.o
g++ -shared -o /work/out/libnf_musa.so nf_musa_dev.o -L$M/lib -lmusart "-Wl,-rpath,\$ORIGIN"

# the program: CPU code + filter + the MUSA host back end (loads libnf_musa.so at run time)
INC="-I. -I/usr/include/boinc -I$P/src/headers -I$P/$OBJ"
gfortran -O3 -march=x86-64-v3 -cpp -DPDF_MOD=pdfilter_v3 "-DPDF_INIT_NAME='pdf_init_v3'" "-DPDF_FILTER_NAME='pdf_filter_v3'" -c pdfilter.f90 -o pdfilter_v3.o
gfortran -O3 -march=x86-64 -mtune=generic -cpp -DPDF_MOD=pdfilter_base "-DPDF_INIT_NAME='pdf_init_base'" "-DPDF_FILTER_NAME='pdf_filter_base'" -c pdfilter.f90 -o pdfilter_base.o
for f in polDiscTest_cpu TgtMartinet GetDecics; do g++ -O3 -w $INC -DAPP_VERSION_CPU_STD -c -o $f.o $f.cpp; done
g++ -O2 -std=c++11 -w $INC -c nf_gpu_common.cpp
g++ -O2 -std=c++11 -w $INC -c nf_gpu_musa.cpp
g++ -O3 -o /work/out/GetDecics_musa GetDecics.o TgtMartinet.o polDiscTest_cpu.o nf_gpu_common.o nf_gpu_musa.o \
  pdfilter_v3.o pdfilter_base.o $BL/libboinc_api.a $BL/libboinc.a -L$P/$OBJ -l:libpari.a \
  -static-libgcc -static-libstdc++ -l:libgfortran.a -lquadmath -l:libgmp.a -ldl -lm -lpthread

# the vendor runtime the library needs
cp -L $M/lib/libmusart.so.4 /work/out/libmusart.so.4
strip /work/out/GetDecics_musa
ls -la /work/out
echo "--- libnf_musa.so needs:"; readelf -d /work/out/libnf_musa.so | grep -E "NEEDED|RUNPATH"
echo "--- libmusart.so.4 needs:"; readelf -d /work/out/libmusart.so.4 | grep -E "NEEDED|SONAME"
objdump -T /work/out/GetDecics_musa | grep -o 'GLIBC_[0-9.]*' | sort -uV | tail -1
echo PK_MUSA_OK
