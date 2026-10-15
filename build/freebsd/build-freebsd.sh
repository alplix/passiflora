#!/bin/sh
# FreeBSD x86-64 CPU build (runs inside FreeBSD): installs the tools, builds PARI 2.8, the BOINC libraries and the program.
set -e
cd /root/w
pkg install -y gmp gmake bison perl5 autoconf automake libtool m4 pkgconf git gcc15 > /root/w/pkg.log 2>&1 || { tail -5 /root/w/pkg.log; exit 1; }
GCC=$(ls /usr/local/bin/gcc1* | head -1); echo "gcc: $GCC"
ls /usr/local/bin | grep -E "gfortran|g\+\+" | head
V=$(ls /usr/local/bin/gfortran* | head -1 | sed 's/.*gfortran//'); echo "gcc version suffix: $V"
FC=/usr/local/bin/gfortran$V; CXX=/usr/local/bin/g++$V; CC=/usr/local/bin/gcc$V
# PARI
if [ ! -f pari/Ofreebsd-amd64/libpari.a ] && ! ls pari/O*/libpari.a >/dev/null 2>&1; then
  ( cd pari && env CC=$CC ./Configure --static --with-gmp=/usr/local --without-readline > /root/w/pari_conf.log 2>&1 )
  export PERL5LIB=/root/w/pari/src/desc:/root/w/pari/src/desc/PARI
  ( cd pari/O* && gmake -j4 lib-sta > /root/w/pari_make.log 2>&1 )
fi
P=/root/w/pari; OBJ=$(basename $(ls -d $P/O* | head -1)); ls -la $P/$OBJ/libpari.a
# BOINC application libraries
if [ ! -f boinclibs/libboinc_api.a ]; then
  rm -rf boinc && git clone -q --depth 1 --branch client_release/7.20/7.20.7 https://github.com/BOINC/boinc.git || git clone -q --depth 1 https://github.com/BOINC/boinc.git
  cd boinc && MAKE=/usr/local/bin/gmake ./_autosetup > /root/w/boinc_auto.log 2>&1
  CXX=$CXX CC=$CC ./configure --enable-libraries --disable-server --disable-client --disable-manager --disable-shared --enable-static --disable-fcgi > /root/w/boinc_conf.log 2>&1
  gmake -j4 > /root/w/boinc_make.log 2>&1 || true
  mkdir -p /root/w/boinclibs
  cp api/.libs/libboinc_api.a lib/.libs/libboinc.a /root/w/boinclibs/ 2>/dev/null || cp api/libboinc_api.a lib/libboinc.a /root/w/boinclibs/
  cd /root/w
fi
ls -la boinclibs
# the program
cd /root/w/src
: > config.h
INC="-I. -I/root/w/boinc -I/root/w/boinc/lib -I/root/w/boinc/api -I$P/src/headers -I$P/$OBJ -I/usr/local/include"
rm -f *.o *.mod GetDecics_*
$FC -O3 -march=x86-64-v3 -cpp -DPDF_MOD=pdfilter_v3 "-DPDF_INIT_NAME='pdf_init_v3'" "-DPDF_FILTER_NAME='pdf_filter_v3'" -c pdfilter.f90 -o pdfilter_v3.o
$FC -O3 -march=x86-64 -mtune=generic -cpp -DPDF_MOD=pdfilter_base "-DPDF_INIT_NAME='pdf_init_base'" "-DPDF_FILTER_NAME='pdf_filter_base'" -c pdfilter.f90 -o pdfilter_base.o
for f in polDiscTest_cpu TgtMartinet GetDecics; do $CXX -O3 -w $INC -DAPP_VERSION_CPU_STD -c -o $f.o $f.cpp; done
$CXX -O2 -w $INC -c nf_gpu_stub.cpp
GF=$($FC -print-file-name=libgfortran.a); QM=$($FC -print-file-name=libquadmath.a)
$CXX -O3 -static -o GetDecics_cpu GetDecics.o TgtMartinet.o polDiscTest_cpu.o nf_gpu_stub.o pdfilter_v3.o pdfilter_base.o \
  /root/w/boinclibs/libboinc_api.a /root/w/boinclibs/libboinc.a $P/$OBJ/libpari.a /usr/local/lib/libgmp.a $GF $QM -lexecinfo -lelf -lm -lpthread
strip GetDecics_cpu
ls -la GetDecics_cpu
file GetDecics_cpu
echo FREEBSD_BUILD_OK
