// SPDX-License-Identifier: GPL-2.0-or-later
// Copyright (C) 2026 Alperen Yavuz
// nf_gpu.h -- OpenCL back end for the innermost enumeration loops.
#ifndef NF_GPU_H
#define NF_GPU_H

#include <vector>

#define NF_ND 18
#define NF_NI 35

// Everything the m2/m1 loops need from the outer loops (layout shared with nf_enum.cl).
struct NfNode {
  double d[NF_ND];
  long long i[NF_NI];
};

// Pick the GPU assigned by BOINC (or NF_OCL_ANY=1: first OpenCL device) and build
// the kernel.  Returns false when the app should run in CPU mode (no GPU assigned,
// NF_GPU=0, too few filter primes for this work unit, ...).  Exits on real errors.
bool nfGpuInit(int argc, char **argv, int numP, const int *pSet);
bool nfGpuActive();

// Pending-node queue.
bool nfGpuWantFlush();
bool nfGpuEmpty();
void nfGpuAdd(const NfNode &node);

// Runs all pending nodes, clears the queue and returns the number of
// polynomials of the original enumeration that were inspected.  The survivors of
// the GPU pre-filter are appended to polys (11 values each, in enumeration
// order: 1, bb1..bb10).
long long nfGpuRun(std::vector<long long> &polys);

void nfGpuShutdown();

#endif
