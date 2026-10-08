set -e
P=/root/nf/upstream/Pari/pari-2.8-1711-ge5c317c
BI=/root/jammy/usr/include/boinc
BL=/root/jammy/usr/lib/x86_64-linux-gnu
mkdir -p /root/nf/fast && cd /root/nf/fast
cp /mnt/c/Users/Alp/Documents/nf-fast/src/* .
cp /root/nf/ref/config.h .
INC="-I. -I$BI -I$P/src/headers -I$P/Olinux-x86_64"
gfortran -O3 -march=x86-64-v3 -cpp -DPDF_MOD=pdfilter_v3 "-DPDF_INIT_NAME='pdf_init_v3'" "-DPDF_FILTER_NAME='pdf_filter_v3'" -c pdfilter.f90 -o pdfilter_v3.o
gfortran -O3 -march=x86-64 -mtune=generic -cpp -DPDF_MOD=pdfilter_base "-DPDF_INIT_NAME='pdf_init_base'" "-DPDF_FILTER_NAME='pdf_filter_base'" -c pdfilter.f90 -o pdfilter_base.o
for f in polDiscTest_cpu TgtMartinet GetDecics; do
  g++ -O3 -w $INC -DAPP_VERSION_CPU_STD -c -o $f.o $f.cpp
done
g++ -O2 -w $INC -c nf_gpu_stub.cpp
g++ -O3 -static -static-libgcc -static-libstdc++ -o GetDecics_fast GetDecics.o TgtMartinet.o polDiscTest_cpu.o nf_gpu_stub.o pdfilter_v3.o pdfilter_base.o $BL/libboinc_api.a $BL/libboinc.a -L$P/Olinux-x86_64 -l:libpari.a -l:libgfortran.a -lquadmath -lm -l:libgmp.a -lpthread
ls -la GetDecics_fast
echo BUILD_OK
