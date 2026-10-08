// SPDX-License-Identifier: GPL-2.0-or-later
// Copyright (C) 2026 Alperen Yavuz
// nf_gpu_stub.cpp -- CPU-only builds: no OpenCL dependency, GPU mode never activates.
#include "nf_gpu.h"

bool nfGpuInit(int, char **, int, const int *) { return false; }
bool nfGpuActive() { return false; }
bool nfGpuWantFlush() { return false; }
bool nfGpuEmpty() { return true; }
void nfGpuAdd(const NfNode &) {}
long long nfGpuRun(std::vector<long long> &) { return 0; }
void nfGpuShutdown() {}
