// SPDX-License-Identifier: GPL-2.0-or-later
// Copyright (C) 2026 Alperen Yavuz
// nf_gpu_common.cpp -- everything about the GPU mode that does not depend on the API used:
// the filter-prime table, the node queue, the batch sizing, the sorting of the survivors.

#include <algorithm>
#include <chrono>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <vector>

#include "nf_gpu.h"
#include "nf_gpu_backend.h"

static const size_t MAX_PRIMES = 24;
static const size_t MIN_PRIMES = 8;
static const unsigned long long CHUNK_ITEMS = 1ull << 20;

static bool g_active = false;
static std::vector<NfNode> g_nodes;
static unsigned long long g_items = 0;
static unsigned long long g_target = 1ull << 18;

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
  if (force && *force == '0') return false;

  std::vector<int> primes = buildPrimeTable(numP, pSet);
  size_t np = primes.size() / 8;
  if (np < MIN_PRIMES) {
    fprintf(stderr, "GPU mode: only %u usable filter primes for this work unit; using the CPU.\n", (unsigned)np);
    return false;
  }
  if (!nfBackendInit(argc, argv, primes)) return false;

  const char *tg = getenv("NF_GPU_ITEMS");
  if (tg) g_target = strtoull(tg, NULL, 10);
  g_active = true;
  return true;
}

void nfGpuShutdown()
{
  if (!g_active) return;
  nfBackendShutdown();
  g_active = false;
}

// ---- queue ----------------------------------------------------------------------------

bool nfGpuWantFlush() { return g_nodes.size() + 4 >= NF_MAX_NODES || g_items >= g_target; }
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

static long long runRange(size_t a, size_t b, std::vector<NfSurv> &out)
{
  std::vector<unsigned long long> cum(b - a + 1);
  cum[0] = 0;
  for (size_t k = a; k < b; k++)
    cum[k - a + 1] = cum[k - a] + (unsigned long long)(g_nodes[k].i[1] - g_nodes[k].i[0] + 1);
  if (cum[b - a] == 0) return 0;

  bool overflow = false;
  long long inspected = nfBackendRun(a, b, cum.data(), out, &overflow);
  if (overflow) {
    if (b - a == 1) { fprintf(stderr, "GPU survivor buffer overflow on a single node.\n"); exit(1); }
    size_t mid = (a + b) / 2;
    return runRange(a, mid, out) + runRange(mid, b, out);
  }
  return inspected;
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
  nfBackendSetNodes(nd.data(), ni.data(), n);

  std::vector<NfSurv> surv;
  long long inspected = runRange(0, n, surv);

  std::sort(surv.begin(), surv.end(), [](const NfSurv &x, const NfSurv &y) {
    if (x.node != y.node) return x.node < y.node;
    if (x.m2 != y.m2) return x.m2 < y.m2;
    return x.m1 < y.m1;
  });
  for (const NfSurv &s : surv) {
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
