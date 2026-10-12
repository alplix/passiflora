# Windows GPU release build (OpenCL + CUDA programs), cross-compiled with MinGW-w64 (author machine paths).
set -e
WP=/mnt/c/Users/Alp/AppData/Local/Temp/nfw/wpari
B=/root/boincsrc/boinc
G=/root/nf/wgmp
OUT=/mnt/c/Users/Alp/AppData/Local/Temp/nfw/bin
OUT_FATBIN=/root/nf/nf_cuda_fatbin.h bash /mnt/c/Users/Alp/Documents/passiflora/build/prepare-src.sh
mkdir -p /root/nf/clinc && cp -r /usr/include/CL /root/nf/clinc/
rm -rf /root/nf/wingpu && mkdir -p /root/nf/wingpu $OUT && cd /root/nf/wingpu
cp /root/nf/build_src/GetDecicsSrc/* . ; : > config.h
python3 - <<'PY'
s = open('nf_port_opencl.h').read() + open('nf_kernel.h').read()
nl = chr(10)
open('nf_enum_cl.h', 'w').write('R"NFCL(' + nl + s + ')NFCL"' + nl)
PY
{ echo "LIBRARY OpenCL.dll"; echo "EXPORTS"; for f in clGetPlatformIDs clGetPlatformInfo clGetDeviceIDs clGetDeviceInfo clCreateContext clCreateCommandQueue clCreateProgramWithSource clBuildProgram clGetProgramBuildInfo clCreateKernel clCreateBuffer clReleaseMemObject clEnqueueWriteBuffer clEnqueueReadBuffer clEnqueueNDRangeKernel clSetKernelArg clFinish; do echo $f; done; } > OpenCL.def
x86_64-w64-mingw32-dlltool -d OpenCL.def -l libOpenCL.a -D OpenCL.dll
INC="-I. -I/root/nf/clinc -I$B -I$B/lib -I$B/api -I$WP/src/headers -I$WP/Omingw-x86_64 -I$G/include"
x86_64-w64-mingw32-gfortran -O3 -march=x86-64-v3 -cpp -DPDF_MOD=pdfilter_v3 "-DPDF_INIT_NAME='pdf_init_v3'" "-DPDF_FILTER_NAME='pdf_filter_v3'" -c pdfilter.f90 -o pdfilter_v3.o
x86_64-w64-mingw32-gfortran -O3 -march=x86-64 -mtune=generic -cpp -DPDF_MOD=pdfilter_base "-DPDF_INIT_NAME='pdf_init_base'" "-DPDF_FILTER_NAME='pdf_filter_base'" -c pdfilter.f90 -o pdfilter_base.o
for f in polDiscTest_cpu TgtMartinet GetDecics; do
  x86_64-w64-mingw32-g++ -O3 -w -DMINGW -DAPP_VERSION_CPU_STD $INC -c -o $f.o $f.cpp
done
for f in nf_gpu_stub nf_gpu_common nf_gpu_opencl nf_gpu_cuda; do
  x86_64-w64-mingw32-g++ -O2 -std=c++11 -w -DMINGW $INC -c -o $f.o $f.cpp
done
x86_64-w64-mingw32-g++ -O2 -w -DMINGW $INC -c -o boinc_opencl.o $B/api/boinc_opencl.cpp
LIBS="-L$B/lib -L$B/api -L$WP/Omingw-x86_64 -L$G/lib -L. -lboinc_api -lboinc -l:libpari.a -l:libgmp.a -l:libgfortran.a -l:libquadmath.a"
SYS="-lpsapi -luserenv -lws2_32 -lwinmm -lshlwapi -lole32 -lwbemuuid -loleaut32 -lpthread"
x86_64-w64-mingw32-g++ -O3 -static -static-libgcc -static-libstdc++ -o $OUT/GetDecics_gpu.exe \
  GetDecics.o TgtMartinet.o polDiscTest_cpu.o nf_gpu_common.o nf_gpu_opencl.o boinc_opencl.o pdfilter_v3.o pdfilter_base.o $LIBS -lOpenCL $SYS
x86_64-w64-mingw32-g++ -O3 -static -static-libgcc -static-libstdc++ -o $OUT/GetDecics_cuda.exe \
  GetDecics.o TgtMartinet.o polDiscTest_cpu.o nf_gpu_common.o nf_gpu_cuda.o pdfilter_v3.o pdfilter_base.o $LIBS $SYS
x86_64-w64-mingw32-g++ -O3 -static -static-libgcc -static-libstdc++ -o $OUT/GetDecics_cpu.exe \
  GetDecics.o TgtMartinet.o polDiscTest_cpu.o nf_gpu_stub.o pdfilter_v3.o pdfilter_base.o $LIBS $SYS
x86_64-w64-mingw32-strip $OUT/GetDecics_gpu.exe $OUT/GetDecics_cuda.exe $OUT/GetDecics_cpu.exe
ls -la $OUT/GetDecics_gpu.exe $OUT/GetDecics_cuda.exe $OUT/GetDecics_cpu.exe
echo WINGPU_OK
