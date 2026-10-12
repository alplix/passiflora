// SPDX-License-Identifier: GPL-2.0-or-later
// Copyright (C) 2026 Alperen Yavuz
// nf_musa_dev.cu -- the kernel plus a small C interface around the CUDA-style *runtime* API, for
// toolchains that provide that API under another name (Moore Threads MUSA: run `musify-text -i` on
// this file, then compile with `mcc -mtgpu -ffp-contract=off`).  The program side (nf_gpu_musa.cpp)
// only sees the extern "C" functions below, so it needs no GPU headers.
//
// The same file also compiles unchanged with nvcc (`--fmad=false`), which is how the wrapper logic is
// tested on an NVIDIA card.

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#ifndef __NVCC__
#  include <cuda_runtime.h>   // nvcc includes it by itself; for MUSA run musify-text over this file
#endif

#include "nf_port_cuda.h"
#include "nf_kernel.h"

#define NFM_NODES (1u << 17)
#define NFM_OUTCAP (1u << 18)

static double *dNodeD = 0;
static long long *dNodeI = 0;
static unsigned long long *dCum = 0;
static int *dPrimes = 0;
static long long *dOut = 0;
static unsigned *dOutCnt = 0;
static unsigned *dCnt = 0;
static size_t cntCap = 0;
static unsigned npr = 0;

#define NFM_CHECK(x) do { cudaError_t e_ = (x); if (e_ != cudaSuccess) { \
    fprintf(stderr, "GPU runtime error %d (%s) at %s:%d (%s)\n", (int)e_, cudaGetErrorString(e_), __FILE__, __LINE__, #x); \
    return -1; } } while (0)

extern "C" int nfm_device_count()
{
  int n = 0;
  if (cudaGetDeviceCount(&n) != cudaSuccess) return 0;
  return n;
}

extern "C" int nfm_init(int device, const int *primes, int nints, char *name, int namelen, int *major, int *minor,
                        unsigned long long *memBytes, int *mps)
{
  NFM_CHECK(cudaSetDevice(device));
  cudaDeviceProp p;
  NFM_CHECK(cudaGetDeviceProperties(&p, device));
  strncpy(name, p.name, namelen - 1);
  name[namelen - 1] = 0;
  *major = p.major;  *minor = p.minor;
  *memBytes = (unsigned long long)p.totalGlobalMem;
  *mps = p.multiProcessorCount;
  npr = (unsigned)(nints / 8);
  NFM_CHECK(cudaMalloc((void **)&dNodeD, (size_t)NFM_NODES * ND * sizeof(double)));
  NFM_CHECK(cudaMalloc((void **)&dNodeI, (size_t)NFM_NODES * NI * sizeof(long long)));
  NFM_CHECK(cudaMalloc((void **)&dCum, (size_t)(NFM_NODES + 1) * sizeof(unsigned long long)));
  NFM_CHECK(cudaMalloc((void **)&dPrimes, (size_t)nints * sizeof(int)));
  NFM_CHECK(cudaMemcpy(dPrimes, primes, (size_t)nints * sizeof(int), cudaMemcpyHostToDevice));
  NFM_CHECK(cudaMalloc((void **)&dOut, (size_t)NFM_OUTCAP * 12 * sizeof(long long)));
  NFM_CHECK(cudaMalloc((void **)&dOutCnt, sizeof(unsigned)));
  return 0;
}

extern "C" int nfm_set_nodes(const double *nd, const long long *ni, size_t n)
{
  NFM_CHECK(cudaMemcpy(dNodeD, nd, n * ND * sizeof(double), cudaMemcpyHostToDevice));
  NFM_CHECK(cudaMemcpy(dNodeI, ni, n * NI * sizeof(long long), cudaMemcpyHostToDevice));
  return 0;
}

// Runs nodes [nodebase, nodebase + nnodes).  survRaw receives up to outcap records of 12 long long.
// *outcnt = number of survivor records produced (may exceed outcap: overflow); *inspected = polynomials counted.
extern "C" int nfm_run(unsigned nnodes, unsigned nodebase, const unsigned long long *cum, unsigned long long total,
                       long long *survRaw, unsigned *outcnt, unsigned long long *inspected)
{
  if (total > cntCap) {
    if (dCnt) cudaFree(dCnt);
    cntCap = (size_t)(total + (total >> 2) + 1024);
    NFM_CHECK(cudaMalloc((void **)&dCnt, cntCap * sizeof(unsigned)));
  }
  NFM_CHECK(cudaMemcpy(dCum, cum, (size_t)(nnodes + 1) * sizeof(unsigned long long), cudaMemcpyHostToDevice));
  NFM_CHECK(cudaMemset(dOutCnt, 0, sizeof(unsigned)));

  const unsigned block = 128;
  unsigned long long blocks = (total + block - 1) / block;
  nf_enum<<<(unsigned)blocks, block>>>(dNodeD, dNodeI, dCum, nnodes, nodebase, total, dPrimes, npr,
                                       dOut, dOutCnt, NFM_OUTCAP, dCnt);
  NFM_CHECK(cudaGetLastError());
  NFM_CHECK(cudaDeviceSynchronize());

  unsigned oc = 0;
  NFM_CHECK(cudaMemcpy(&oc, dOutCnt, sizeof(unsigned), cudaMemcpyDeviceToHost));
  *outcnt = oc;
  *inspected = 0;
  if (oc > NFM_OUTCAP) return 0;
  if (oc) NFM_CHECK(cudaMemcpy(survRaw, dOut, (size_t)oc * 12 * sizeof(long long), cudaMemcpyDeviceToHost));

  unsigned *cnt = (unsigned *)malloc((size_t)total * sizeof(unsigned));
  if (!cnt) return -1;
  cudaError_t e = cudaMemcpy(cnt, dCnt, (size_t)total * sizeof(unsigned), cudaMemcpyDeviceToHost);
  if (e != cudaSuccess) { free(cnt); fprintf(stderr, "GPU runtime error %d reading the counts\n", (int)e); return -1; }
  unsigned long long sum = 0;
  for (size_t k = 0; k < (size_t)total; k++) sum += cnt[k];
  free(cnt);
  *inspected = sum;
  return 0;
}
