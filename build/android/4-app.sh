set -e
NDK=/root/android/android-ndk-r27c
TC=$NDK/toolchains/llvm/prebuilt/linux-x86_64/bin
GT=/root/android/toolchain-aarch64-linux-android/bin
B=/root/boincsrc/boinc
BL=/root/android/boinc-android/lib
P=/root/nfa/pari
G=/root/nfa/gmp-inst
rm -rf /root/nfa/src && mkdir -p /root/nfa/src && cp /root/nf/build_src/GetDecicsSrc/* /root/nfa/src/ && cd /root/nfa/src
: > config.h
CXX=$TC/aarch64-linux-android24-clang++
CC=$TC/aarch64-linux-android24-clang
INC="-I. -I$B -I$B/lib -I$B/api -I$P/src/headers -I$P/Olinux-aarch64 -I$G/include"
$GT/aarch64-linux-android-gfortran -O3 -ffp-contract=off -cpp -c pdfilter.f90 -o pdfilter.o
for f in polDiscTest_cpu TgtMartinet GetDecics; do
  $CXX -O3 -ffp-contract=off -std=c++11 -w $INC -DAPP_VERSION_CPU_STD -c -o $f.o $f.cpp
done
$CXX -O2 -std=c++11 -w $INC -c nf_gpu_stub.cpp
$CC -O2 -fno-emulated-tls -c /root/android/wisteria-aarch64-linux-android/android_tls_pad.c -o tlspad.o
GF=$($GT/aarch64-linux-android-gfortran -print-file-name=libgfortran.a)
GC=$($GT/aarch64-linux-android-gfortran -print-libgcc-file-name)
$CXX -O3 -static-libstdc++ -o GetDecics_cpu GetDecics.o TgtMartinet.o polDiscTest_cpu.o nf_gpu_stub.o pdfilter.o tlspad.o \
  $BL/libboinc_api.a $BL/libboinc.a $P/Olinux-aarch64/libpari.a $G/lib/libgmp.a $GF $GC -lm -ldl
$TC/llvm-strip GetDecics_cpu
ls -la GetDecics_cpu
$TC/llvm-readelf -l GetDecics_cpu | grep -E "TLS|interp"
echo ANDROID_APP_OK
