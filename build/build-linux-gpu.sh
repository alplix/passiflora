set -e
P=/root/nf/upstream/Pari/pari-2.8-1711-ge5c317c
BI=/root/jammy/usr/include/boinc
BL=/root/jammy/usr/lib/x86_64-linux-gnu
mkdir -p /root/nf/gpu && cd /root/nf/gpu
cp /mnt/c/Users/Alp/Documents/nf-fast/src/* .
cp /root/nf/ref/config.h .
python3 - <<'PY'
s = open('nf_enum.cl').read()
open('nf_enum_cl.h', 'w').write('R"NFCL(\n' + s + ')NFCL"\n')
PY
INC="-I. -I$BI -I$P/src/headers -I$P/Olinux-x86_64"
gfortran -O3 -march=x86-64-v3 -cpp -DPDF_MOD=pdfilter_v3 "-DPDF_INIT_NAME='pdf_init_v3'" "-DPDF_FILTER_NAME='pdf_filter_v3'" -c pdfilter.f90 -o pdfilter_v3.o
gfortran -O3 -march=x86-64 -mtune=generic -cpp -DPDF_MOD=pdfilter_base "-DPDF_INIT_NAME='pdf_init_base'" "-DPDF_FILTER_NAME='pdf_filter_base'" -c pdfilter.f90 -o pdfilter_base.o
for f in polDiscTest_cpu TgtMartinet GetDecics; do
  g++ -O3 -w $INC -DAPP_VERSION_CPU_STD -c -o $f.o $f.cpp
done
g++ -O2 -std=c++11 -w $INC -c -o nf_gpu.o nf_gpu.cpp
g++ -O3 -o GetDecics_gpu GetDecics.o TgtMartinet.o polDiscTest_cpu.o nf_gpu.o pdfilter_v3.o pdfilter_base.o \
  $BL/libboinc_opencl.a $BL/libboinc_api.a $BL/libboinc.a -L$P/Olinux-x86_64 -l:libpari.a \
  -static-libgcc -static-libstdc++ -l:libgfortran.a -lquadmath -l:libgmp.a -lOpenCL -lm -lpthread
ls -la GetDecics_gpu
echo GPUBUILD_OK
