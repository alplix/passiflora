# Runs inside the Ubuntu 22.04 chroot: builds PARI 2.8, then the CPU, OpenCL and CUDA programs (called by build-linux-chroot.sh).
# runs INSIDE the Ubuntu 22.04 chroot
set -e
cd /root
if [ ! -f pari28/Olinux-x86_64/libpari.a ]; then
  rm -rf pari28 && cp -r /pk/pari28src pari28
  cd pari28 && rm -rf Olinux-x86_64
  ./Configure --static --with-gmp --without-readline > /root/pari_conf.log 2>&1
  export PERL5LIB=/root/pari28/src/desc:/root/pari28/src/desc/PARI
  cd Olinux-x86_64 && make -j8 lib-sta > /root/pari_make.log 2>&1
  cd /root
fi
ls -la /root/pari28/Olinux-x86_64/libpari.a
P=/root/pari28
mkdir -p /root/pkb && cd /root/pkb && rm -f *.o *.mod GetDecics_*
cp /pk/src/* .
: > config.h
python3 - <<'PY'
s = open('nf_port_opencl.h').read() + open('nf_kernel.h').read()
nl = chr(10)
open('nf_enum_cl.h', 'w').write('R"NFCL(' + nl + s + ')NFCL"' + nl)
PY
INC="-I. -I/usr/include/boinc -I$P/src/headers -I$P/Olinux-x86_64"
gfortran -O3 -march=x86-64-v3 -cpp -DPDF_MOD=pdfilter_v3 "-DPDF_INIT_NAME='pdf_init_v3'" "-DPDF_FILTER_NAME='pdf_filter_v3'" -c pdfilter.f90 -o pdfilter_v3.o
gfortran -O3 -march=x86-64 -mtune=generic -cpp -DPDF_MOD=pdfilter_base "-DPDF_INIT_NAME='pdf_init_base'" "-DPDF_FILTER_NAME='pdf_filter_base'" -c pdfilter.f90 -o pdfilter_base.o
for f in polDiscTest_cpu TgtMartinet GetDecics; do g++ -O3 -w $INC -DAPP_VERSION_CPU_STD -c -o $f.o $f.cpp; done
g++ -O2 -w $INC -c nf_gpu_stub.cpp
g++ -O2 -std=c++11 -w $INC -c nf_gpu_common.cpp
g++ -O2 -std=c++11 -w $INC -c nf_gpu_opencl.cpp
g++ -O2 -std=c++11 -w $INC -c nf_gpu_cuda.cpp
BL=/usr/lib/x86_64-linux-gnu
# CPU: fully static
g++ -O3 -static -Wl,-u,pthread_once -Wl,-u,pthread_getspecific -Wl,-u,pthread_setspecific -Wl,-u,pthread_create -Wl,-u,pthread_join -Wl,-u,pthread_equal -Wl,-u,pthread_self -Wl,-u,pthread_detach -Wl,-u,pthread_cancel -Wl,-u,pthread_mutex_lock -Wl,-u,pthread_mutex_trylock -Wl,-u,pthread_mutex_unlock -Wl,-u,pthread_mutex_init -Wl,-u,pthread_mutex_destroy -Wl,-u,pthread_cond_init -Wl,-u,pthread_cond_broadcast -Wl,-u,pthread_cond_signal -Wl,-u,pthread_cond_wait -Wl,-u,pthread_cond_destroy -Wl,-u,pthread_mutexattr_init -Wl,-u,pthread_mutexattr_settype -Wl,-u,pthread_mutexattr_destroy -Wl,-u,pthread_key_create -Wl,-u,pthread_key_delete -o GetDecics_cpu GetDecics.o TgtMartinet.o polDiscTest_cpu.o nf_gpu_stub.o pdfilter_v3.o pdfilter_base.o \
  $BL/libboinc_api.a $BL/libboinc.a -L$P/Olinux-x86_64 -l:libpari.a -l:libgfortran.a -lquadmath -l:libgmp.a -lm -lpthread
# GPU: OpenCL is loaded from the system, everything else static
g++ -O3 -o GetDecics_gpu GetDecics.o TgtMartinet.o polDiscTest_cpu.o nf_gpu_common.o nf_gpu_opencl.o pdfilter_v3.o pdfilter_base.o \
  $BL/libboinc_opencl.a $BL/libboinc_api.a $BL/libboinc.a -L$P/Olinux-x86_64 -l:libpari.a \
  -static-libgcc -static-libstdc++ -l:libgfortran.a -lquadmath -l:libgmp.a -lOpenCL -lm -lpthread
# GPU (CUDA): the driver library is loaded at run time, nothing CUDA is linked
g++ -O3 -o GetDecics_cuda GetDecics.o TgtMartinet.o polDiscTest_cpu.o nf_gpu_common.o nf_gpu_cuda.o pdfilter_v3.o pdfilter_base.o   $BL/libboinc_api.a $BL/libboinc.a -L$P/Olinux-x86_64 -l:libpari.a   -static-libgcc -static-libstdc++ -l:libgfortran.a -lquadmath -l:libgmp.a -ldl -lm -lpthread
cp GetDecics_cpu GetDecics_cpu.unstripped
strip GetDecics_cpu GetDecics_gpu GetDecics_cuda
ls -la GetDecics_cpu GetDecics_gpu GetDecics_cuda
objdump -T GetDecics_gpu | grep -o 'GLIBC_[0-9.]*' | sort -uV | tail -1
echo PK_LINUX_OK
