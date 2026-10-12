#!/bin/bash
# Linux CPU build for any architecture Ubuntu 22.04 supports (riscv64, ppc64le, ...), run natively or in an emulated container (glibc 2.35 -> the programs need glibc 2.34+).
# Needs: build-essential gfortran libgmp-dev libboinc-app-dev bison perl python3 (+ ocl-icd-opencl-dev opencl-headers for OpenCL)
# Expects $HOME/pk/armpack.tar.gz made from the output of prepare-src.sh (src/), PARI 2.8-1711 (pari/) and Test/.
# Floating-point contraction is switched off: the enumeration must round exactly like the x86 build.
set -e
W=$HOME/pk
cd "$W"
[ -d src ] || tar xzf armpack.tar.gz
if [ ! -f pari/Olinux-arm/libpari.a ] && ! ls pari/O*/libpari.a >/dev/null 2>&1; then
  ( cd pari && ./Configure --static --with-gmp --without-readline > "$W/pari_conf.log" 2>&1 )
  export PERL5LIB="$W/pari/src/desc"
  ( cd pari/O* && make -j4 lib-sta > "$W/pari_make.log" 2>&1 )
fi
OBJ=$(basename "$(ls -d $W/pari/O* | head -1)")
P=$W/pari
cd "$W/src"
: > config.h
python3 - <<'PY'
s = open('nf_port_opencl.h').read() + open('nf_kernel.h').read()
nl = chr(10)
open('nf_enum_cl.h', 'w').write('R"NFCL(' + nl + s + ')NFCL"' + nl)
PY
INC="-I. -I/usr/include/boinc -I$P/src/headers -I$P/$OBJ"
BL=/usr/lib/$(gcc -dumpmachine)
[ -f "$W/boinclibs/libboinc_api.a" ] && BB=$W/boinclibs || BB=$BL   # source-built BOINC libraries where the distribution ones are empty
rm -f *.o *.mod GetDecics_*
gfortran -O3 -ffp-contract=off -cpp -c pdfilter.f90 -o pdfilter.o
for f in polDiscTest_cpu TgtMartinet GetDecics; do
  g++ -O3 -ffp-contract=off -w $INC -DAPP_VERSION_CPU_STD -c -o $f.o $f.cpp
done
g++ -O2 -std=c++11 -w $INC -c nf_gpu_stub.cpp
# CPU: fully static (the pthread symbols are forced in: static libgfortran otherwise crashes at exit with glibc 2.35)
U=""
for s in pthread_once pthread_getspecific pthread_setspecific pthread_create pthread_join pthread_equal pthread_self pthread_detach pthread_cancel pthread_mutex_lock pthread_mutex_trylock pthread_mutex_unlock pthread_mutex_init pthread_mutex_destroy pthread_cond_init pthread_cond_broadcast pthread_cond_signal pthread_cond_wait pthread_cond_destroy pthread_mutexattr_init pthread_mutexattr_settype pthread_mutexattr_destroy pthread_key_create pthread_key_delete; do U="$U -Wl,-u,$s"; done
g++ -O3 -static $U -o GetDecics_cpu GetDecics.o TgtMartinet.o polDiscTest_cpu.o nf_gpu_stub.o pdfilter.o \
  $BB/libboinc_api.a $BB/libboinc.a -L$P/$OBJ -l:libpari.a -l:libgfortran.a -l:libgmp.a -lm -lpthread
strip GetDecics_cpu
ls -la GetDecics_cpu
readelf -V GetDecics_cpu | grep -o "GLIBC_[0-9.]*" | sort -uV | tail -1
echo PK_CPU_OK
