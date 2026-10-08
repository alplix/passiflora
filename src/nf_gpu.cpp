// SPDX-License-Identifier: GPL-2.0-or-later
// Copyright (C) 2026 Alperen Yavuz
// nf_gpu.cpp -- host side of the OpenCL enumeration back end.

#define CL_TARGET_OPENCL_VERSION 120
#define CL_USE_DEPRECATED_OPENCL_1_2_APIS

#include <CL/cl.h>
#include <algorithm>
#include <chrono>
#include <cmath>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <string>
#include <vector>

#include "boinc_api.h"
#include "boinc_opencl.h"
#include "app_ipc.h"
#include "nf_gpu.h"

static const char *kernelSource =
#include "nf_enum_cl.h"
;

static const size_t MAX_NODES   = 1u << 17;
static const size_t MAX_PRIMES  = 24;
static const size_t MIN_PRIMES  = 8;
static const unsigned OUT_CAP   = 1u << 18;       // survivor records per launch
static const unsigned long long CHUNK_ITEMS = 1ull << 20;

static bool g_active = false;
static cl_context g_ctx;
static cl_command_queue g_queue;
static cl_program g_prog;
static cl_kernel g_kern;
static cl_mem g_bNodeD, g_bNodeI, g_bCum, g_bPrimes, g_bOut, g_bOutCnt, g_bCnt;
static size_t g_cntCap = 0;
static unsigned g_np = 0;

static std::vector<NfNode> g_nodes;
static unsigned long long g_items = 0;
static unsigned long long g_target = 1ull << 18;

#define CLCHK(x) do { cl_int e_ = (x); if (e_ != CL_SUCCESS) { \
    fprintf(stderr, "OpenCL error %d at %s:%d (%s)\n", (int)e_, __FILE__, __LINE__, #x); exit(1); } } while (0)

// ---- filter primes -----------------------------------------------------------

static long long powmod(long long b, long long e, long long m)
{
  long long r = 1;  b %= m;  if (b < 0) b += m;
  while (e > 0) { if (e & 1) r = r * b % m; b = b * b % m; e >>= 1; }
  return r;
}

static bool isPrime(long long n)
{
  if (n < 2) return false;
  for (long long d = 2; d * d <= n; d++) if (n % d == 0) return false;
  return true;
}

// q = 1 (mod 4) prime in (256, 1024) such that every p in S is a nonzero square mod q.
static std::vector<int> buildPrimeTable(int numP, const int *pSet)
{
  std::vector<int> t;
  for (long long q = 1023; q > 256 && t.size() / 8 < MAX_PRIMES; q--) {
    if (q % 4 != 1 || !isPrime(q)) continue;
    bool ok = true;
    for (int k = 0; k < numP; k++) {
      long long p = pSet[k];
      if (p % q == 0 || powmod(p, (q - 1) / 2, q) != 1) { ok = false; break; }
    }
    if (!ok) continue;
    float qi = 1.0f / (float)q;
    int qibits;  memcpy(&qibits, &qi, 4);
    int row[8] = { (int)q, (int)powmod(2, 16, q), (int)powmod(2, 32, q), (int)powmod(2, 48, q),
                   (int)powmod(2, 64, q), (int)((q - 1) / 2), qibits, 0 };
    t.insert(t.end(), row, row + 8);
  }
  return t;
}

// ---- init -------------------------------------------------------------------------

bool nfGpuActive() { return g_active; }

bool nfGpuInit(int argc, char **argv, int numP, const int *pSet)
{
  const char *force = getenv("NF_GPU");
  const char *any = getenv("NF_OCL_ANY");
  if (force && *force == '0') return false;

  APP_INIT_DATA aid;
  boinc_get_init_data(aid);
  std::string gt = aid.gpu_type;
  int ptype = -1;
  if (gt == "NVIDIA") ptype = PROC_TYPE_NVIDIA_GPU;
  else if (gt == "ATI") ptype = PROC_TYPE_AMD_GPU;
  else if (gt == "intel_gpu") ptype = PROC_TYPE_INTEL_GPU;
  bool useAny = (any && *any == '1');
  if (ptype < 0 && !useAny) return false;

  std::vector<int> primes = buildPrimeTable(numP, pSet);
  g_np = (unsigned)(primes.size() / 8);
  if (g_np < MIN_PRIMES) {
    fprintf(stderr, "GPU mode: only %u usable filter primes for this work unit; using the CPU.\n", g_np);
    return false;
  }

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

  g_bNodeD = clCreateBuffer(g_ctx, CL_MEM_READ_ONLY, MAX_NODES * NF_ND * sizeof(double), NULL, &st);  CLCHK(st);
  g_bNodeI = clCreateBuffer(g_ctx, CL_MEM_READ_ONLY, MAX_NODES * NF_NI * sizeof(long long), NULL, &st);  CLCHK(st);
  g_bCum = clCreateBuffer(g_ctx, CL_MEM_READ_ONLY, (MAX_NODES + 1) * sizeof(unsigned long long), NULL, &st);  CLCHK(st);
  g_bPrimes = clCreateBuffer(g_ctx, CL_MEM_READ_ONLY | CL_MEM_COPY_HOST_PTR, primes.size() * sizeof(int), primes.data(), &st);  CLCHK(st);
  g_bOut = clCreateBuffer(g_ctx, CL_MEM_WRITE_ONLY, (size_t)OUT_CAP * 12 * sizeof(long long), NULL, &st);  CLCHK(st);
  g_bOutCnt = clCreateBuffer(g_ctx, CL_MEM_READ_WRITE, sizeof(unsigned), NULL, &st);  CLCHK(st);
  g_bCnt = NULL;  g_cntCap = 0;

  const char *tg = getenv("NF_GPU_ITEMS");
  if (tg) g_target = strtoull(tg, NULL, 10);

  g_active = true;
  return true;
}

void nfGpuShutdown()
{
  if (!g_active) return;
  clFinish(g_queue);
  g_active = false;
}

// ---- queue ----------------------------------------------------------------------------

bool nfGpuWantFlush() { return g_nodes.size() + 4 >= MAX_NODES || g_items >= g_target; }
bool nfGpuEmpty() { return g_nodes.empty(); }

void nfGpuAdd(const NfNode &node)
{
  long long lo = node.i[0], hi = node.i[1];
  // Very long m2 ranges are cut into consecutive chunks (keeps enumeration order).
  while ((unsigned long long)(hi - lo + 1) > CHUNK_ITEMS) {
    NfNode c = node;
    c.i[0] = lo;  c.i[1] = lo + (long long)CHUNK_ITEMS - 1;
    g_nodes.push_back(c);
    g_items += CHUNK_ITEMS;
    lo += (long long)CHUNK_ITEMS;
  }
  NfNode c = node;
  c.i[0] = lo;  c.i[1] = hi;
  g_nodes.push_back(c);
  g_items += (unsigned long long)(hi - lo + 1);
}

// ---- execution -----------------------------------------------------------------------------

struct Surv { long long node, m2, m1, b[9]; };

static long long runRange(size_t a, size_t b, std::vector<Surv> &out)
{
  std::vector<unsigned long long> cum(b - a + 1);
  cum[0] = 0;
  for (size_t k = a; k < b; k++)
    cum[k - a + 1] = cum[k - a] + (unsigned long long)(g_nodes[k].i[1] - g_nodes[k].i[0] + 1);
  unsigned long long total = cum[b - a];
  if (total == 0) return 0;

  if (total > g_cntCap) {
    if (g_bCnt) clReleaseMemObject(g_bCnt);
    cl_int st;
    g_cntCap = (size_t)(total + (total >> 2) + 1024);
    g_bCnt = clCreateBuffer(g_ctx, CL_MEM_READ_WRITE, g_cntCap * sizeof(unsigned), NULL, &st);  CLCHK(st);
  }

  unsigned zero = 0;
  CLCHK(clEnqueueWriteBuffer(g_queue, g_bCum, CL_TRUE, 0, cum.size() * sizeof(unsigned long long), cum.data(), 0, NULL, NULL));
  CLCHK(clEnqueueWriteBuffer(g_queue, g_bOutCnt, CL_TRUE, 0, sizeof(unsigned), &zero, 0, NULL, NULL));

  cl_uint nnodes = (cl_uint)(b - a), nodebase = (cl_uint)a, np = g_np, cap = OUT_CAP;
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
  CLCHK(clEnqueueNDRangeKernel(g_queue, g_kern, 1, NULL, &global, &local, 0, NULL, NULL));

  unsigned outcnt = 0;
  CLCHK(clEnqueueReadBuffer(g_queue, g_bOutCnt, CL_TRUE, 0, sizeof(unsigned), &outcnt, 0, NULL, NULL));

  if (outcnt > OUT_CAP) {
    if (b - a == 1) { fprintf(stderr, "GPU survivor buffer overflow on a single node.\n"); exit(1); }
    size_t mid = (a + b) / 2;
    return runRange(a, mid, out) + runRange(mid, b, out);
  }

  size_t base = out.size();
  out.resize(base + outcnt);
  if (outcnt) {
    std::vector<long long> raw((size_t)outcnt * 12);
    CLCHK(clEnqueueReadBuffer(g_queue, g_bOut, CL_TRUE, 0, raw.size() * sizeof(long long), raw.data(), 0, NULL, NULL));
    for (unsigned k = 0; k < outcnt; k++) {
      Surv &s = out[base + k];
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

long long nfGpuRun(std::vector<long long> &polys)
{
  size_t n = g_nodes.size();
  if (n == 0) return 0;
  auto t0 = std::chrono::steady_clock::now();

  std::vector<double> nd(n * NF_ND);
  std::vector<long long> ni(n * NF_NI);
  for (size_t k = 0; k < n; k++) {
    memcpy(&nd[k * NF_ND], g_nodes[k].d, sizeof(double) * NF_ND);
    memcpy(&ni[k * NF_NI], g_nodes[k].i, sizeof(long long) * NF_NI);
  }
  CLCHK(clEnqueueWriteBuffer(g_queue, g_bNodeD, CL_TRUE, 0, nd.size() * sizeof(double), nd.data(), 0, NULL, NULL));
  CLCHK(clEnqueueWriteBuffer(g_queue, g_bNodeI, CL_TRUE, 0, ni.size() * sizeof(long long), ni.data(), 0, NULL, NULL));

  std::vector<Surv> surv;
  boinc_begin_critical_section();
  long long inspected = runRange(0, n, surv);
  boinc_end_critical_section();

  std::sort(surv.begin(), surv.end(), [](const Surv &x, const Surv &y) {
    if (x.node != y.node) return x.node < y.node;
    if (x.m2 != y.m2) return x.m2 < y.m2;
    return x.m1 < y.m1;
  });
  for (const Surv &s : surv) {
    polys.push_back(1);
    for (int j = 0; j < 9; j++) polys.push_back(s.b[j]);
    polys.push_back(g_nodes[(size_t)s.node].i[34]);
  }

  // Aim for ~100 ms per launch (display drivers kill much longer ones).
  double ms = std::chrono::duration<double, std::milli>(std::chrono::steady_clock::now() - t0).count();
  double want = g_target * (100.0 / (ms > 1.0 ? ms : 1.0));
  if (want > 2.0 * g_target) want = 2.0 * g_target;
  if (want < 0.5 * g_target) want = 0.5 * g_target;
  if (want < 65536) want = 65536;
  if (want > 8.0e6) want = 8.0e6;
  if (!getenv("NF_GPU_ITEMS")) g_target = (unsigned long long)want;

  g_nodes.clear();
  g_items = 0;
  return inspected;
}
