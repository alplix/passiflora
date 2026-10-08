set -e
WP=/mnt/c/Users/Alp/AppData/Local/Temp/nfw/wpari
B=/root/boincsrc/boinc
G=/root/nf/wgmp
OUT=/mnt/c/Users/Alp/AppData/Local/Temp/nfw/bin
mkdir -p /root/nf/winbuild $OUT && cd /root/nf/winbuild
cp /mnt/c/Users/Alp/Documents/nf-fast/src/* .
INC="-I. -I$B -I$B/lib -I$B/api -I$WP/src/headers -I$WP/Omingw-x86_64 -I$G/include"
x86_64-w64-mingw32-gfortran -O3 -march=x86-64-v3 -cpp -DPDF_MOD=pdfilter_v3 "-DPDF_INIT_NAME='pdf_init_v3'" "-DPDF_FILTER_NAME='pdf_filter_v3'" -c pdfilter.f90 -o pdfilter_v3.o
x86_64-w64-mingw32-gfortran -O3 -march=x86-64 -mtune=generic -cpp -DPDF_MOD=pdfilter_base "-DPDF_INIT_NAME='pdf_init_base'" "-DPDF_FILTER_NAME='pdf_filter_base'" -c pdfilter.f90 -o pdfilter_base.o
for f in polDiscTest_cpu TgtMartinet GetDecics; do
  x86_64-w64-mingw32-g++ -O3 -w -DMINGW -DAPP_VERSION_CPU_STD $INC -c -o $f.o $f.cpp
done
x86_64-w64-mingw32-g++ -O2 -w -DMINGW $INC -c nf_gpu_stub.cpp
x86_64-w64-mingw32-g++ -O3 -static -static-libgcc -static-libstdc++ -o $OUT/GetDecics_fast.exe \
  GetDecics.o TgtMartinet.o polDiscTest_cpu.o nf_gpu_stub.o pdfilter_v3.o pdfilter_base.o \
  -L$B/lib -L$B/api -L$WP/Omingw-x86_64 -L$G/lib -lboinc_api -lboinc -l:libpari.a -l:libgmp.a \
  -l:libgfortran.a -l:libquadmath.a -lpsapi -luserenv -lws2_32 -lwinmm -lshlwapi -lole32 -lwbemuuid -loleaut32 -lpthread
ls -la $OUT/GetDecics_fast.exe
echo WINBUILD_OK
