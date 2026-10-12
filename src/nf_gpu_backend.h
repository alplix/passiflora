// SPDX-License-Identifier: GPL-2.0-or-later
// Copyright (C) 2026 Alperen Yavuz
// nf_gpu_backend.h -- what a GPU back end (OpenCL, CUDA, ...) has to provide.
#ifndef NF_GPU_BACKEND_H
#define NF_GPU_BACKEND_H

#include <vector>

#include "nf_gpu.h"

struct NfSurv { long long node, m2, m1, b[9]; };

static const size_t NF_MAX_NODES = 1u << 17;   // nodes per batch
static const unsigned NF_OUT_CAP = 1u << 18;   // survivor records per launch

// Pick the device and build / load the kernel.  primes = the filter-prime table, 8 ints per prime
// (q, 2^16, 2^32, 2^48, 2^64 mod q, (q-1)/2, bits of 1.0f/q, 0).  Returns false when no device of
// this kind is assigned to the task (the app then runs on the CPU); exits on real errors.
bool nfBackendInit(int argc, char **argv, const std::vector<int> &primes);

// Upload the nodes of the batch (n nodes, NF_ND doubles and NF_NI integers each).
void nfBackendSetNodes(const double *nd, const long long *ni, size_t n);

// Run nodes [a, b) of the uploaded batch.  cum[0..b-a] = prefix sums of the nodes' m2 counts.
// Appends the survivors to out and returns the number of polynomials inspected; if the survivor
// buffer overflowed it sets *overflow and appends nothing.
long long nfBackendRun(size_t a, size_t b, const unsigned long long *cum,
                       std::vector<NfSurv> &out, bool *overflow);

void nfBackendShutdown();

#endif
