# Building Passiflora

Passiflora is a set of files that you add to the upstream source, plus a small patch.
Nothing of upstream is copied into this repository.

## 1. Get the sources

```bash
git clone --filter=blob:none --no-checkout https://github.com/drivere/get-decics-numberfields upstream
cd upstream
git checkout 638ca4e                        # the commit Passiflora was built from
git sparse-checkout init --cone
git sparse-checkout set GetDecicsSrc Test Pari/pari-2.8-1711-ge5c317c
git checkout
patch -p1 < ../passiflora/patches/passiflora.patch   # changes TgtMartinet.cpp/.h and GetDecics.cpp
cp ../passiflora/src/* GetDecicsSrc/
```

`Test/dataFiles` contains the 31 work units and their `.truth` outputs used for the tests.

## 2. Libraries

* **PARI 2.8-1711** (static): `cd Pari/pari-2.8-1711-ge5c317c && ./Configure --static --with-gmp
  --without-readline && cd Olinux-x86_64 && make lib-sta`. On a recent distribution set
  `PERL5LIB=<pari>/src/desc` first (the old build scripts expect `.` in Perl's path) and have
  `bison` installed.
* **GMP**, **BOINC's application libraries** (`libboinc.a`, `libboinc_api.a`, and
  `libboinc_opencl.a` for the GPU build) and, for the GPU build, an OpenCL library and the
  Khronos OpenCL headers.
* **gfortran** (GCC 11 or newer) for `pdfilter.f90`.

## 3. Compile (Linux)

Inside `GetDecicsSrc` (with an empty `config.h` next to the sources):

```bash
# the Fortran filter, twice: AVX2/FMA and baseline; the C++ side picks one at run time
gfortran -O3 -march=x86-64-v3 -cpp -DPDF_MOD=pdfilter_v3 "-DPDF_INIT_NAME='pdf_init_v3'" \
         "-DPDF_FILTER_NAME='pdf_filter_v3'" -c pdfilter.f90 -o pdfilter_v3.o
gfortran -O3 -march=x86-64 -mtune=generic -cpp -DPDF_MOD=pdfilter_base "-DPDF_INIT_NAME='pdf_init_base'" \
         "-DPDF_FILTER_NAME='pdf_filter_base'" -c pdfilter.f90 -o pdfilter_base.o

INC="-I. -I$BOINC_INCLUDE -I$PARI/src/headers -I$PARI/Olinux-x86_64"
for f in polDiscTest_cpu TgtMartinet GetDecics; do g++ -O3 $INC -DAPP_VERSION_CPU_STD -c $f.cpp; done
g++ -O2 $INC -c nf_gpu_stub.cpp                      # CPU-only build (no OpenCL)

g++ -O3 -static -o GetDecics_cpu GetDecics.o TgtMartinet.o polDiscTest_cpu.o nf_gpu_stub.o \
    pdfilter_v3.o pdfilter_base.o libboinc_api.a libboinc.a -L$PARI/Olinux-x86_64 -l:libpari.a \
    -l:libgfortran.a -lquadmath -l:libgmp.a -lm -lpthread
```

Do **not** add `-march`, `-ffast-math` or FMA contraction to the C++ files: the enumeration
must evaluate its floating-point bounds exactly as upstream does.

GPU build: embed the kernel (`nf_enum_cl.h` is `R"NFCL(` + `nf_enum.cl` + `)NFCL"`), compile
`nf_gpu.cpp` instead of the stub, and link `libboinc_opencl.a` and `-lOpenCL` (everything else
static). To keep the binary usable on older distributions build in an Ubuntu 22.04 environment
(glibc 2.34).

## 4. Windows

Cross-compile with MinGW-w64. PARI's `Configure` must be run on a path the Windows side can
execute (it runs small test programs) with two wrappers: one that drops the `.exe` suffix from
the compiler's output and one that strips CRLF from the test programs' output (otherwise PARI
decides `sizeof(long) = 4`). The GPU build needs an import library for `OpenCL.dll`
(`dlltool -d OpenCL.def -l libOpenCL.a`).

`build/` contains the scripts used for the released binaries. They contain paths from the
author's machine and are meant as a reference, not as a turnkey build.

## 5. Test

Run each work unit of `Test/dataFiles/*.dat` (copy it to `in` in an empty directory, run the
binary, compare `out` with the `wu_*.out.truth` file ignoring the "Elapsed Time" line):
`build/test-wu.sh` and `build/test-suite.sh` do that for Linux, `build/test-gpu-windows.ps1`
and `build/test-gpu-suite-windows.ps1` for the GPU on Windows.
