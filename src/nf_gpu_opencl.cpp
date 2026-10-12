// SPDX-License-Identifier: GPL-2.0-or-later
// Copyright (C) 2026 Alperen Yavuz
// nf_gpu_opencl.cpp -- OpenCL back end (NVIDIA, AMD, Intel, ...).

#define CL_TARGET_OPENCL_VERSION 120
#define CL_USE_DEPRECATED_OPENCL_1_2_APIS

#include <CL/cl.h>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <string>
#include <vector>

#include "boinc_api.h"
#include "boinc_opencl.h"
#include "app_ipc.h"
#include "nf_gpu_backend.h"

static const char *kernelSource =
#include "nf_enum_cl.h"
;

static cl_context g_ctx;
static cl_command_queue g_queue;
static cl_program g_prog;
static cl_kernel g_kern;
static cl_mem g_bNodeD, g_bNodeI, g_bCum, g_bPrimes, g_bOut, g_bOutCnt, g_bCnt;
static size_t g_cntCap = 0;
static unsigned g_np = 0;

#define CLCHK(x) do { cl_int e_ = (x); if (e_ != CL_SUCCESS) { \
    fprintf(stderr, "OpenCL error %d at %s:%d (%s)\n", (int)e_, __FILE__, __LINE__, #x); exit(1); } } while (0)

bool nfBackendInit(int argc, char **argv, const std::vector<int> &primes)
{
  const char *any = getenv("NF_OCL_ANY");
  APP_INIT_DATA aid;
  boinc_get_init_data(aid);
  std::string gt = aid.gpu_type;
  int ptype = -1;
  if (gt == "NVIDIA") ptype = PROC_TYPE_NVIDIA_GPU;
  else if (gt == "ATI") ptype = PROC_TYPE_AMD_GPU;
  else if (gt == "intel_gpu") ptype = PROC_TYPE_INTEL_GPU;
  bool useAny = (any && *any == '1');
  if (ptype < 0 && !useAny) return false;

  g_np = (unsigned)(primes.size() / 8);

  cl_platform_id plat = NULL;
  cl_device_id dev = NULL;
  if (useAny) {
    cl_platform_id plats[16];  cl_uint np = 0;
    CLCHK(clGetPlatformIDs(16, plats, &np));
    const char *pi = getenv("NF_OCL_PLATFORM");
    const char *di = getenv("NF_OCL_DEVICE");
    unsigned pidx = pi ? atoi(pi) : 0, didx = di ? atoi(di) : 0;
    if (pidx >= np) { fprintf(stderr, "no such OpenCL platform\n"); exit(1); }
    plat = plats[pidx];
    cl_device_id devs[16];  cl_uint nd = 0;
    CLCHK(clGetDeviceIDs(plat, CL_DEVICE_TYPE_ALL, 16, devs, &nd));
    if (didx >= nd) { fprintf(stderr, "no such OpenCL device\n"); exit(1); }
    dev = devs[didx];
  } else {
    int rv = boinc_get_opencl_ids(argc, argv, ptype, &dev, &plat);
    if (rv) { fprintf(stderr, "Error: could not obtain the OpenCL device (%d).\n", rv); exit(1); }
  }

  char name[256] = "?";
  clGetDeviceInfo(dev, CL_DEVICE_NAME, sizeof(name), name, NULL);
  cl_uint cus = 0;  clGetDeviceInfo(dev, CL_DEVICE_MAX_COMPUTE_UNITS, sizeof(cus), &cus, NULL);
  cl_ulong gmem = 0;  clGetDeviceInfo(dev, CL_DEVICE_GLOBAL_MEM_SIZE, sizeof(gmem), &gmem, NULL);
  char ext[8192] = "";  clGetDeviceInfo(dev, CL_DEVICE_EXTENSIONS, sizeof(ext) - 1, ext, NULL);
  fprintf(stderr, "GPU mode: OpenCL device \"%s\", %u compute units, %llu MB, %u filter primes.\n",
          name, cus, (unsigned long long)(gmem >> 20), g_np);
  if (!strstr(ext, "cl_khr_fp64")) { fprintf(stderr, "Error: the device has no double precision support.\n"); exit(1); }

  cl_int st;
  cl_context_properties cps[3] = { CL_CONTEXT_PLATFORM, (cl_context_properties)plat, 0 };
  g_ctx = clCreateContext(cps, 1, &dev, NULL, NULL, &st);  CLCHK(st);
  g_queue = clCreateCommandQueue(g_ctx, dev, 0, &st);  CLCHK(st);

  const char *src = kernelSource;
  size_t len = strlen(src);
  g_prog = clCreateProgramWithSource(g_ctx, 1, &src, &len, &st);  CLCHK(st);
  st = clBuildProgram(g_prog, 1, &dev, "-cl-std=CL1.2", NULL, NULL);
  if (st != CL_SUCCESS) {
    size_t n = 0;
    clGetProgramBuildInfo(g_prog, dev, CL_PROGRAM_BUILD_LOG, 0, NULL, &n);
    std::vector<char> log(n + 1, 0);
    clGetProgramBuildInfo(g_prog, dev, CL_PROGRAM_BUILD_LOG, n, log.data(), NULL);
    fprintf(stderr, "OpenCL build failed (%d):\n%s\n", (int)st, log.data());
    exit(1);
  }
  g_kern = clCreateKernel(g_prog, "nf_enum", &st);  CLCHK(st);

  g_bNodeD = clCreateBuffer(g_ctx, CL_MEM_READ_ONLY, NF_MAX_NODES * NF_ND * sizeof(double), NULL, &st);  CLCHK(st);
  g_bNodeI = clCreateBuffer(g_ctx, CL_MEM_READ_ONLY, NF_MAX_NODES * NF_NI * sizeof(long long), NULL, &st);  CLCHK(st);
  g_bCum = clCreateBuffer(g_ctx, CL_MEM_READ_ONLY, (NF_MAX_NODES + 1) * sizeof(unsigned long long), NULL, &st);  CLCHK(st);
  g_bPrimes = clCreateBuffer(g_ctx, CL_MEM_READ_ONLY | CL_MEM_COPY_HOST_PTR, primes.size() * sizeof(int),
                             (void *)primes.data(), &st);  CLCHK(st);
  g_bOut = clCreateBuffer(g_ctx, CL_MEM_WRITE_ONLY, (size_t)NF_OUT_CAP * 12 * sizeof(long long), NULL, &st);  CLCHK(st);
  g_bOutCnt = clCreateBuffer(g_ctx, CL_MEM_READ_WRITE, sizeof(unsigned), NULL, &st);  CLCHK(st);
  g_bCnt = NULL;  g_cntCap = 0;
  return true;
}

void nfBackendShutdown()
{
  clFinish(g_queue);
}

void nfBackendSetNodes(const double *nd, const long long *ni, size_t n)
{
  CLCHK(clEnqueueWriteBuffer(g_queue, g_bNodeD, CL_TRUE, 0, n * NF_ND * sizeof(double), nd, 0, NULL, NULL));
  CLCHK(clEnqueueWriteBuffer(g_queue, g_bNodeI, CL_TRUE, 0, n * NF_NI * sizeof(long long), ni, 0, NULL, NULL));
}

long long nfBackendRun(size_t a, size_t b, const unsigned long long *cum, std::vector<NfSurv> &out, bool *overflow)
{
  unsigned long long total = cum[b - a];
  *overflow = false;

  if (total > g_cntCap) {
    if (g_bCnt) clReleaseMemObject(g_bCnt);
    cl_int st;
    g_cntCap = (size_t)(total + (total >> 2) + 1024);
    g_bCnt = clCreateBuffer(g_ctx, CL_MEM_READ_WRITE, g_cntCap * sizeof(unsigned), NULL, &st);  CLCHK(st);
  }

  unsigned zero = 0;
  CLCHK(clEnqueueWriteBuffer(g_queue, g_bCum, CL_TRUE, 0, (b - a + 1) * sizeof(unsigned long long), cum, 0, NULL, NULL));
  CLCHK(clEnqueueWriteBuffer(g_queue, g_bOutCnt, CL_TRUE, 0, sizeof(unsigned), &zero, 0, NULL, NULL));

  cl_uint nnodes = (cl_uint)(b - a), nodebase = (cl_uint)a, np = g_np, cap = NF_OUT_CAP;
  cl_ulong tot = total;
  int ai = 0;
  CLCHK(clSetKernelArg(g_kern, ai++, sizeof(cl_mem), &g_bNodeD));
  CLCHK(clSetKernelArg(g_kern, ai++, sizeof(cl_mem), &g_bNodeI));
  CLCHK(clSetKernelArg(g_kern, ai++, sizeof(cl_mem), &g_bCum));
  CLCHK(clSetKernelArg(g_kern, ai++, sizeof(cl_uint), &nnodes));
  CLCHK(clSetKernelArg(g_kern, ai++, sizeof(cl_uint), &nodebase));
  CLCHK(clSetKernelArg(g_kern, ai++, sizeof(cl_ulong), &tot));
  CLCHK(clSetKernelArg(g_kern, ai++, sizeof(cl_mem), &g_bPrimes));
  CLCHK(clSetKernelArg(g_kern, ai++, sizeof(cl_uint), &np));
  CLCHK(clSetKernelArg(g_kern, ai++, sizeof(cl_mem), &g_bOut));
  CLCHK(clSetKernelArg(g_kern, ai++, sizeof(cl_mem), &g_bOutCnt));
  CLCHK(clSetKernelArg(g_kern, ai++, sizeof(cl_uint), &cap));
  CLCHK(clSetKernelArg(g_kern, ai++, sizeof(cl_mem), &g_bCnt));

  size_t local = 64;
  size_t global = (size_t)((total + local - 1) / local * local);
  boinc_begin_critical_section();
  CLCHK(clEnqueueNDRangeKernel(g_queue, g_kern, 1, NULL, &global, &local, 0, NULL, NULL));

  unsigned outcnt = 0;
  CLCHK(clEnqueueReadBuffer(g_queue, g_bOutCnt, CL_TRUE, 0, sizeof(unsigned), &outcnt, 0, NULL, NULL));
  boinc_end_critical_section();

  if (outcnt > NF_OUT_CAP) { *overflow = true; return 0; }

  size_t base = out.size();
  out.resize(base + outcnt);
  if (outcnt) {
    std::vector<long long> raw((size_t)outcnt * 12);
    CLCHK(clEnqueueReadBuffer(g_queue, g_bOut, CL_TRUE, 0, raw.size() * sizeof(long long), raw.data(), 0, NULL, NULL));
    for (unsigned k = 0; k < outcnt; k++) {
      NfSurv &s = out[base + k];
      s.node = raw[k * 12 + 0];  s.m2 = raw[k * 12 + 1];  s.m1 = raw[k * 12 + 2];
      for (int j = 0; j < 9; j++) s.b[j] = raw[k * 12 + 3 + j];
    }
  }

  std::vector<unsigned> cnt((size_t)total);
  CLCHK(clEnqueueReadBuffer(g_queue, g_bCnt, CL_TRUE, 0, (size_t)total * sizeof(unsigned), cnt.data(), 0, NULL, NULL));
  long long sum = 0;
  for (size_t k = 0; k < (size_t)total; k++) sum += cnt[k];
  return sum;
}
