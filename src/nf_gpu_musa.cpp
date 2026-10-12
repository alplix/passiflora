// SPDX-License-Identifier: GPL-2.0-or-later
// Copyright (C) 2026 Alperen Yavuz
// nf_gpu_musa.cpp -- back end for GPUs that BOINC does not know about (Moore Threads MUSA).
//
// The kernel and the runtime calls live in nf_musa_dev.cu, built with the vendor's compiler into the
// shared library libnf_musa.so (which links the vendor's runtime).  This program loads that library at
// run time from its own directory: without the library, the runtime or a device it simply runs on the CPU.
// BOINC cannot assign such a GPU, so the task is a plain CPU task that uses the card by itself: the back
// end activates when a device is present and BOINC gave the task no GPU of another kind
// (NF_GPU=0 switches it off, NF_MUSA_DEVICE picks the device).

#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <string>
#include <vector>

#include "boinc_api.h"
#include "app_ipc.h"
#include "nf_gpu_backend.h"

#ifdef __linux__
#include <dlfcn.h>
#include <unistd.h>

static int (*p_count)();
static int (*p_init)(int, const int *, int, char *, int, int *, int *, unsigned long long *, int *);
static int (*p_set_nodes)(const double *, const long long *, size_t);
static int (*p_run)(unsigned, unsigned, const unsigned long long *, unsigned long long, long long *, unsigned *,
                    unsigned long long *);

static bool loadLibrary()
{
  std::string dir;
  char exe[4096];
  ssize_t n = readlink("/proc/self/exe", exe, sizeof(exe) - 1);   // the real file, not BOINC's slot link
  if (n > 0) {
    exe[n] = 0;
    dir = exe;
    size_t p = dir.rfind('/');
    dir = (p == std::string::npos) ? std::string(".") : dir.substr(0, p);
  }
  void *h = 0;
  if (!dir.empty()) h = dlopen((dir + "/libnf_musa.so").c_str(), RTLD_NOW);
  if (!h) h = dlopen("libnf_musa.so", RTLD_NOW);
  if (!h) return false;
  p_count = (int (*)())dlsym(h, "nfm_device_count");
  p_init = (int (*)(int, const int *, int, char *, int, int *, int *, unsigned long long *, int *))dlsym(h, "nfm_init");
  p_set_nodes = (int (*)(const double *, const long long *, size_t))dlsym(h, "nfm_set_nodes");
  p_run = (int (*)(unsigned, unsigned, const unsigned long long *, unsigned long long, long long *, unsigned *,
                   unsigned long long *))dlsym(h, "nfm_run");
  return p_count && p_init && p_set_nodes && p_run;
}

bool nfBackendInit(int argc, char **argv, const std::vector<int> &primes)
{
  (void)argc; (void)argv;
  APP_INIT_DATA aid;
  boinc_get_init_data(aid);
  std::string gt = aid.gpu_type;
  if (!gt.empty() && gt != "CPU") return false;     // BOINC gave this task a GPU of another kind
  if (!loadLibrary()) return false;

  int n = p_count();
  if (n <= 0) return false;
  int dev = 0;
  const char *dv = getenv("NF_MUSA_DEVICE");
  if (dv) dev = atoi(dv);
  if (dev < 0 || dev >= n) { fprintf(stderr, "Error: no GPU device %d (found %d).\n", dev, n); exit(1); }

  char name[256] = "?";
  int major = 0, minor = 0, mps = 0;
  unsigned long long mem = 0;
  if (p_init(dev, primes.data(), (int)primes.size(), name, sizeof(name), &major, &minor, &mem, &mps) != 0) {
    fprintf(stderr, "Error: the GPU could not be initialised.\n");
    exit(1);
  }
  fprintf(stderr, "GPU mode: MUSA device %d \"%s\", %d multiprocessors, compute capability %d.%d, %llu MB, %u filter primes.\n",
          dev, name, mps, major, minor, (unsigned long long)(mem >> 20), (unsigned)(primes.size() / 8));
  return true;
}

void nfBackendShutdown() {}

void nfBackendSetNodes(const double *nd, const long long *ni, size_t n)
{
  if (p_set_nodes(nd, ni, n) != 0) exit(1);
}

long long nfBackendRun(size_t a, size_t b, const unsigned long long *cum, std::vector<NfSurv> &out, bool *overflow)
{
  unsigned long long total = cum[b - a];
  *overflow = false;
  std::vector<long long> raw((size_t)NF_OUT_CAP * 12);
  unsigned outcnt = 0;
  unsigned long long inspected = 0;
  boinc_begin_critical_section();
  int rc = p_run((unsigned)(b - a), (unsigned)a, cum, total, raw.data(), &outcnt, &inspected);
  boinc_end_critical_section();
  if (rc != 0) exit(1);
  if (outcnt > NF_OUT_CAP) { *overflow = true; return 0; }
  size_t base = out.size();
  out.resize(base + outcnt);
  for (unsigned k = 0; k < outcnt; k++) {
    NfSurv &s = out[base + k];
    s.node = raw[k * 12 + 0];  s.m2 = raw[k * 12 + 1];  s.m1 = raw[k * 12 + 2];
    for (int j = 0; j < 9; j++) s.b[j] = raw[k * 12 + 3 + j];
  }
  return (long long)inspected;
}

#else   // not Linux: no MUSA back end

bool nfBackendInit(int, char **, const std::vector<int> &) { return false; }
void nfBackendShutdown() {}
void nfBackendSetNodes(const double *, const long long *, size_t) {}
long long nfBackendRun(size_t, size_t, const unsigned long long *, std::vector<NfSurv> &, bool *) { return 0; }

#endif
