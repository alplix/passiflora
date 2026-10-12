// SPDX-License-Identifier: GPL-2.0-or-later
// Copyright (C) 2026 Alperen Yavuz
// nf_gpu_cuda.cpp -- CUDA back end (NVIDIA).
//
// Uses the CUDA *driver* API, loaded at run time (nvcuda.dll / libcuda.so.1), so the program
// builds without the CUDA toolkit and starts on machines without a CUDA driver (it then runs
// on the CPU).  The kernel is the fat binary nf_cuda_fatbin.h (built from nf_kernel.cu with
// nvcc, one cubin per architecture plus PTX), loaded with cuModuleLoadData.
//
// The same file serves other CUDA-driver-API-compatible runtimes: build with
//   -DNF_DRV_PREFIX=\"hip\"  -DNF_DRV_LIB=\"libamdhip64.so\"   (AMD HIP), or
//   -DNF_DRV_PREFIX=\"mu\"   -DNF_DRV_LIB=\"libmusa.so\"       (Moore Threads MUSA)
// together with the code object of that toolchain in place of nf_cuda_fatbin.h.

#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <string>
#include <vector>

#ifdef _WIN32
#  include <windows.h>
#else
#  include <dlfcn.h>
#endif

#include "boinc_api.h"
#include "app_ipc.h"
#include "nf_gpu_backend.h"

static const unsigned char nfFatbin[] = {
#include "nf_cuda_fatbin.h"
};

#ifndef NF_DRV_PREFIX
#  define NF_DRV_PREFIX "cu"
#endif
#ifndef NF_DRV_LIB
#  ifdef _WIN32
#    define NF_DRV_LIB "nvcuda.dll"
#  else
#    define NF_DRV_LIB "libcuda.so.1"
#  endif
#endif
#ifndef NF_DRV_NAME
#  define NF_DRV_NAME "CUDA"
#endif

typedef int CUresult;
typedef int CUdevice;
typedef struct CUctx_st *CUcontext;
typedef struct CUmod_st *CUmodule;
typedef struct CUfunc_st *CUfunction;
typedef unsigned long long CUdeviceptr;

struct Drv {
  CUresult (*Init)(unsigned);
  CUresult (*DriverGetVersion)(int *);
  CUresult (*DeviceGetCount)(int *);
  CUresult (*DeviceGet)(CUdevice *, int);
  CUresult (*DeviceGetName)(char *, int, CUdevice);
  CUresult (*DeviceGetAttribute)(int *, int, CUdevice);
  CUresult (*DeviceTotalMem)(size_t *, CUdevice);
  CUresult (*DevicePrimaryCtxRetain)(CUcontext *, CUdevice);
  CUresult (*CtxSetCurrent)(CUcontext);
  CUresult (*CtxSynchronize)(void);
  CUresult (*ModuleLoadData)(CUmodule *, const void *);
  CUresult (*ModuleGetFunction)(CUfunction *, CUmodule, const char *);
  CUresult (*MemAlloc)(CUdeviceptr *, size_t);
  CUresult (*MemFree)(CUdeviceptr);
  CUresult (*MemcpyHtoD)(CUdeviceptr, const void *, size_t);
  CUresult (*MemcpyDtoH)(void *, CUdeviceptr, size_t);
  CUresult (*MemsetD32)(CUdeviceptr, unsigned, size_t);
  CUresult (*LaunchKernel)(CUfunction, unsigned, unsigned, unsigned, unsigned, unsigned, unsigned,
                           unsigned, void *, void **, void **);
  CUresult (*GetErrorString)(CUresult, const char **);
};
static Drv D;

static CUfunction g_func;
static CUdeviceptr g_dNodeD, g_dNodeI, g_dCum, g_dPrimes, g_dOut, g_dOutCnt, g_dCnt;
static size_t g_cntCap = 0;
static unsigned g_np = 0;

static void drvFail(const char *what, CUresult r, const char *file, int line)
{
  const char *msg = "?";
  if (D.GetErrorString) D.GetErrorString(r, &msg);
  fprintf(stderr, NF_DRV_NAME " error %d (%s) at %s:%d (%s)\n", r, msg ? msg : "?", file, line, what);
  exit(1);
}
#define DCHK(x) do { CUresult r_ = (x); if (r_ != 0) drvFail(#x, r_, __FILE__, __LINE__); } while (0)

static void *openLib()
{
#ifdef _WIN32
  return (void *)LoadLibraryA(NF_DRV_LIB);
#else
  return dlopen(NF_DRV_LIB, RTLD_NOW);
#endif
}

static void *symbol(void *lib, const std::string &name)
{
#ifdef _WIN32
  return (void *)GetProcAddress((HMODULE)lib, name.c_str());
#else
  return dlsym(lib, name.c_str());
#endif
}

static bool loadDriver()
{
  void *lib = openLib();
  if (!lib) return false;
  bool ok = true;
  auto get = [&](void *&dst, const char *name, const char *alt = 0) {
    void *p = symbol(lib, std::string(NF_DRV_PREFIX) + name);
    if (!p && alt) p = symbol(lib, std::string(NF_DRV_PREFIX) + alt);
    if (!p) { fprintf(stderr, NF_DRV_NAME " driver: missing function %s%s\n", NF_DRV_PREFIX, name); ok = false; }
    dst = p;
  };
  get((void *&)D.Init, "Init");
  get((void *&)D.DriverGetVersion, "DriverGetVersion");
  get((void *&)D.DeviceGetCount, "DeviceGetCount");
  get((void *&)D.DeviceGet, "DeviceGet");
  get((void *&)D.DeviceGetName, "DeviceGetName");
  get((void *&)D.DeviceGetAttribute, "DeviceGetAttribute");
  get((void *&)D.DeviceTotalMem, "DeviceTotalMem_v2", "DeviceTotalMem");
  get((void *&)D.DevicePrimaryCtxRetain, "DevicePrimaryCtxRetain");
  get((void *&)D.CtxSetCurrent, "CtxSetCurrent");
  get((void *&)D.CtxSynchronize, "CtxSynchronize");
  get((void *&)D.ModuleLoadData, "ModuleLoadData");
  get((void *&)D.ModuleGetFunction, "ModuleGetFunction");
  get((void *&)D.MemAlloc, "MemAlloc_v2", "MemAlloc");
  get((void *&)D.MemFree, "MemFree_v2", "MemFree");
  get((void *&)D.MemcpyHtoD, "MemcpyHtoD_v2", "MemcpyHtoD");
  get((void *&)D.MemcpyDtoH, "MemcpyDtoH_v2", "MemcpyDtoH");
  get((void *&)D.MemsetD32, "MemsetD32_v2", "MemsetD32");
  get((void *&)D.LaunchKernel, "LaunchKernel");
  D.GetErrorString = (CUresult (*)(CUresult, const char **))symbol(lib, std::string(NF_DRV_PREFIX) + "GetErrorString");
  return ok;
}

bool nfBackendInit(int argc, char **argv, const std::vector<int> &primes)
{
  (void)argc; (void)argv;
  const char *any = getenv("NF_CUDA_ANY");
  APP_INIT_DATA aid;
  boinc_get_init_data(aid);
  std::string gt = aid.gpu_type;
  bool useAny = (any && *any == '1');
  if (gt != "NVIDIA" && !useAny) return false;

  if (!loadDriver()) {
    if (useAny) { fprintf(stderr, "Error: the " NF_DRV_NAME " driver could not be loaded.\n"); exit(1); }
    fprintf(stderr, "GPU mode: the " NF_DRV_NAME " driver could not be loaded (%s); using the CPU.\n", NF_DRV_LIB);
    return false;
  }
  DCHK(D.Init(0));
  int ndev = 0;
  DCHK(D.DeviceGetCount(&ndev));
  int idx = aid.gpu_device_num;
  const char *dv = getenv("NF_CUDA_DEVICE");
  if (dv) idx = atoi(dv);
  if (idx < 0) idx = 0;
  if (idx >= ndev) { fprintf(stderr, "Error: no " NF_DRV_NAME " device %d (found %d).\n", idx, ndev); exit(1); }

  CUdevice dev;
  DCHK(D.DeviceGet(&dev, idx));
  char name[256] = "?";
  D.DeviceGetName(name, sizeof(name), dev);
  int mp = 0, major = 0, minor = 0, drv = 0;
  D.DeviceGetAttribute(&mp, 16, dev);       // MULTIPROCESSOR_COUNT
  D.DeviceGetAttribute(&major, 75, dev);    // COMPUTE_CAPABILITY_MAJOR
  D.DeviceGetAttribute(&minor, 76, dev);    // COMPUTE_CAPABILITY_MINOR
  D.DriverGetVersion(&drv);
  size_t mem = 0;
  D.DeviceTotalMem(&mem, dev);
  g_np = (unsigned)(primes.size() / 8);
  fprintf(stderr, "GPU mode: " NF_DRV_NAME " device %d \"%s\", %d multiprocessors, compute capability %d.%d, %llu MB, driver %d, %u filter primes.\n",
          idx, name, mp, major, minor, (unsigned long long)(mem >> 20), drv, g_np);

  CUcontext ctx;
  DCHK(D.DevicePrimaryCtxRetain(&ctx, dev));
  DCHK(D.CtxSetCurrent(ctx));

  CUmodule mod;
  CUresult r = D.ModuleLoadData(&mod, nfFatbin);
  if (r != 0) {
    fprintf(stderr, "Error: the " NF_DRV_NAME " kernel could not be loaded for this device (compute capability %d.%d).\n", major, minor);
    drvFail("ModuleLoadData", r, __FILE__, __LINE__);
  }
  DCHK(D.ModuleGetFunction(&g_func, mod, "nf_enum"));

  DCHK(D.MemAlloc(&g_dNodeD, NF_MAX_NODES * NF_ND * sizeof(double)));
  DCHK(D.MemAlloc(&g_dNodeI, NF_MAX_NODES * NF_NI * sizeof(long long)));
  DCHK(D.MemAlloc(&g_dCum, (NF_MAX_NODES + 1) * sizeof(unsigned long long)));
  DCHK(D.MemAlloc(&g_dPrimes, primes.size() * sizeof(int)));
  DCHK(D.MemcpyHtoD(g_dPrimes, primes.data(), primes.size() * sizeof(int)));
  DCHK(D.MemAlloc(&g_dOut, (size_t)NF_OUT_CAP * 12 * sizeof(long long)));
  DCHK(D.MemAlloc(&g_dOutCnt, sizeof(unsigned)));
  g_dCnt = 0;  g_cntCap = 0;
  return true;
}

void nfBackendShutdown()
{
  D.CtxSynchronize();
}

void nfBackendSetNodes(const double *nd, const long long *ni, size_t n)
{
  DCHK(D.MemcpyHtoD(g_dNodeD, nd, n * NF_ND * sizeof(double)));
  DCHK(D.MemcpyHtoD(g_dNodeI, ni, n * NF_NI * sizeof(long long)));
}

long long nfBackendRun(size_t a, size_t b, const unsigned long long *cum, std::vector<NfSurv> &out, bool *overflow)
{
  unsigned long long total = cum[b - a];
  *overflow = false;

  if (total > g_cntCap) {
    if (g_dCnt) DCHK(D.MemFree(g_dCnt));
    g_cntCap = (size_t)(total + (total >> 2) + 1024);
    DCHK(D.MemAlloc(&g_dCnt, g_cntCap * sizeof(unsigned)));
  }

  DCHK(D.MemcpyHtoD(g_dCum, cum, (b - a + 1) * sizeof(unsigned long long)));
  DCHK(D.MemsetD32(g_dOutCnt, 0, 1));

  unsigned nnodes = (unsigned)(b - a), nodebase = (unsigned)a, np = g_np, cap = NF_OUT_CAP;
  unsigned long long tot = total;
  void *args[] = { &g_dNodeD, &g_dNodeI, &g_dCum, &nnodes, &nodebase, &tot,
                   &g_dPrimes, &np, &g_dOut, &g_dOutCnt, &cap, &g_dCnt };
  const unsigned block = 128;
  unsigned long long blocks = (total + block - 1) / block;

  boinc_begin_critical_section();
  DCHK(D.LaunchKernel(g_func, (unsigned)blocks, 1, 1, block, 1, 1, 0, 0, args, 0));
  unsigned outcnt = 0;
  DCHK(D.MemcpyDtoH(&outcnt, g_dOutCnt, sizeof(unsigned)));
  boinc_end_critical_section();

  if (outcnt > NF_OUT_CAP) { *overflow = true; return 0; }

  size_t base = out.size();
  out.resize(base + outcnt);
  if (outcnt) {
    std::vector<long long> raw((size_t)outcnt * 12);
    DCHK(D.MemcpyDtoH(raw.data(), g_dOut, raw.size() * sizeof(long long)));
    for (unsigned k = 0; k < outcnt; k++) {
      NfSurv &s = out[base + k];
      s.node = raw[k * 12 + 0];  s.m2 = raw[k * 12 + 1];  s.m1 = raw[k * 12 + 2];
      for (int j = 0; j < 9; j++) s.b[j] = raw[k * 12 + 3 + j];
    }
  }

  std::vector<unsigned> cnt((size_t)total);
  DCHK(D.MemcpyDtoH(cnt.data(), g_dCnt, (size_t)total * sizeof(unsigned)));
  long long sum = 0;
  for (size_t k = 0; k < (size_t)total; k++) sum += cnt[k];
  return sum;
}
