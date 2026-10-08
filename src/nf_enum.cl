// SPDX-License-Identifier: GPL-2.0-or-later
// Copyright (C) 2026 Alperen Yavuz
// nf_enum.cl -- GPU version of the innermost GetDecics enumeration (m2 / m1
// loops of Mart52Engine_Tgt) fused with the small-prime Legendre pre-filter of
// pdfilter.f90.
//
// One work item = one (node, m2) pair.  A node is one fixed (a1..a5, m-range)
// state of the CPU loops, uploaded as 18 doubles + 35 integers.  The work item
// runs the complete m1 loop of the original code, replays its bb4..bb9 tests
// in the original order, counts every polynomial that passes them (the
// application reports that number) and writes the few that survive the
// filter to the output buffer.  Everything that can influence a branch is
// computed exactly as on the CPU:
//   * doubles: same operation order, no FMA contraction, IEEE sqrt / divide;
//   * integers: unsigned wrap-around arithmetic, like the CPU's long long;
//   * double -> int64 uses the x86 rule (out of range or NaN gives INT64_MIN).

#pragma OPENCL EXTENSION cl_khr_fp64 : enable
#pragma OPENCL FP_CONTRACT OFF

typedef long i64;
typedef ulong u64;

#define ND 18
#define NI 35
#define REC 12        // output record: node, m2, m1, bb1..bb9

#define MAGICS 12582912.0f   // 1.5 * 2^23

// ---- helpers -------------------------------------------------------------

inline i64 d2l(double x)
{
  if (!(x > -9223372036854775808.0 && x < 9223372036854775808.0)) return LONG_MIN;
  return (i64)x;
}

inline float reds(float x, float q, float qi)
{
  return x - q * ((x * qi + MAGICS) - MAGICS);
}

// x mod q as a float in [-(q-1)/2, (q-1)/2].  Limbs of 16 bits, weights
// c1 = 2^16, c2 = 2^32, c3 = 2^48 mod q (all < 1024): the sum stays below 2^28.
inline float coef_mod(i64 x, int q, int c1, int c2, int c3, int w64)
{
  u64 u = (u64)x;
  int r = (int)(u & 0xFFFF) + (int)((u >> 16) & 0xFFFF) * c1
        + (int)((u >> 32) & 0xFFFF) * c2 + (int)(u >> 48) * c3;
  if (x < 0) r -= w64;          // x = u - 2^64
  r %= q;
  if (r < 0) r += q;
  if (r > q / 2) r -= q;
  return (float)r;
}

// chi(Disc A) = -1 mod q proven?  Same algorithm as chain_general.inc for one lane.
inline int chi_reject(const float *a, float q, float qi, int e)
{
  float u[12], v[12], w[12];
  #pragma unroll
  for (int i = 0; i <= 10; i++) u[i] = a[10 - i];
  u[11] = 0.0f;
  #pragma unroll
  for (int i = 0; i <= 9; i++) v[i] = reds((float)(10 - i) * a[10 - i], q, qi);
  v[10] = 0.0f; v[11] = 0.0f;
  int du = 10, dv = 9, done = 0;
  float mm = 1.0f;

  for (int it = 0; it < 40; it++) {
    float lu = u[0], lv = v[0];
    #pragma unroll
    for (int i = 0; i < 11; i++)
      w[i] = (i < du) ? reds(lv * u[i + 1] - lu * v[i + 1], q, qi) : 0.0f;
    w[11] = 0.0f;
    int dw = du - 1;
    while (dw >= 0 && w[0] == 0.0f) {
      #pragma unroll
      for (int i = 0; i < 11; i++) w[i] = w[i + 1];
      w[11] = 0.0f;
      dw--;
    }
    if (dw < 0) return 0;                       // resultant vanishes mod q: keep
    int ev = dw - du + dv;  if (ev < 0) ev = -ev;
    if (ev & 1) mm = reds(mm * lv, q, qi);
    #pragma unroll
    for (int i = 0; i < 12; i++) u[i] = w[i];
    du = dw;
    if (du < dv) {
      #pragma unroll
      for (int i = 0; i < 12; i++) { float t = u[i]; u[i] = v[i]; v[i] = t; }
      int t = du; du = dv; dv = t;
    }
    if (dv == 0) {
      if (du & 1) mm = reds(mm * v[0], q, qi);
      done = 1;
      break;
    }
  }
  if (!done) return 0;
  float acc = 1.0f, base = mm;
  for (int ee = e; ee > 0; ee >>= 1) {
    if (ee & 1) acc = reds(acc * base, q, qi);
    base = reds(base * base, q, qi);
  }
  return acc == -1.0f;
}

// bb[1..10] as c[1..10] (leading coefficient 1 implied).  1 = survives all primes.
inline int survives(const i64 *c, __constant int *qt, uint np)
{
  for (uint p = 0; p < np; p++) {
    int q = qt[p * 8 + 0], c1 = qt[p * 8 + 1], c2 = qt[p * 8 + 2], c3 = qt[p * 8 + 3];
    int w64 = qt[p * 8 + 4], e = qt[p * 8 + 5];
    float qf = (float)q, qi = as_float(qt[p * 8 + 6]);
    float a[11];
    #pragma unroll
    for (int k = 0; k <= 9; k++) a[k] = coef_mod(c[10 - k], q, c1, c2, c3, w64);
    a[10] = 1.0f;
    if (chi_reject(a, qf, qi, e)) return 0;
  }
  return 1;
}

// ---- kernel ---------------------------------------------------------------

__kernel void nf_enum(__global const double *nd, __global const i64 *ni,
                      __global const u64 *cum, uint nnodes, uint nodebase, u64 total,
                      __constant int *qt, uint nprime,
                      __global i64 *out, __global uint *outcnt, uint outcap,
                      __global uint *cnt)
{
  u64 gid = (u64)get_global_id(0);
  if (gid >= total) return;

  // Node = last k with cum[k] <= gid.
  uint lo = 0, hi = nnodes;
  while (hi - lo > 1) {
    uint mid = (lo + hi) >> 1;
    if (cum[mid] <= gid) lo = mid; else hi = mid;
  }
  uint node = lo;
  __global const double *D = nd + (size_t)(nodebase + node) * ND;
  __global const i64 *I = ni + (size_t)(nodebase + node) * NI;

  i64 m2 = I[0] + (i64)(gid - cum[node]);

  // m1 range exactly as in the CPU code.
  double m2p = D[1] - (double)m2;
  double B1 = sqrt(D[2] - D[3] * m2p * m2p);
  i64 m1_L = d2l(ceil(D[0] + (-B1 + D[4] * m2p) / D[5]));
  i64 m1_U = d2l(floor(D[0] + (B1 + D[4] * m2p) / D[5]));

  const double lam1 = D[6], lam2 = D[7], lam1c = D[8], lam2c = D[9];
  const double T1 = D[10], T2 = D[11];
  const double t5 = D[12], t6 = D[13], t7 = D[14], t8 = D[15], t9 = D[16], bb8_Upre = D[17];

  const u64 M11 = (u64)I[2], M12 = (u64)I[3], M21 = (u64)I[4], M22 = (u64)I[5];
  const u64 cv41 = (u64)I[6], cv42 = (u64)I[7];
  const u64 a11 = (u64)I[8], a12 = (u64)I[9], a21 = (u64)I[10], a22 = (u64)I[11];
  const u64 a31 = (u64)I[12], a32 = (u64)I[13], a51 = (u64)I[14], a52 = (u64)I[15];
  const u64 Trw = (u64)I[16], Nmw = (u64)I[17];
  const i64 bb9L0 = I[18], bb9U0 = I[19];
  const u64 bb4pre2 = (u64)I[20];
  const i64 bb4L = I[21], bb4U = I[22];
  const u64 bb5pre2 = (u64)I[23], bb6pre2 = (u64)I[24], bb7pre = (u64)I[25], bb8pre = (u64)I[26];
  const u64 bb1 = (u64)I[27], bb2 = (u64)I[28], bb3 = (u64)I[29];
  const u64 S1 = (u64)I[30], S2 = (u64)I[31], S3 = (u64)I[32], Sum4 = (u64)I[33];
  const i64 bb10 = I[34];

  const u64 base41 = M12 * (u64)m2 + cv41;
  const u64 base42 = M22 * (u64)m2 + cv42;

  uint count = 0;

  for (i64 m1 = m1_L; m1 <= m1_U; ++m1) {
    u64 a41 = M11 * (u64)m1 + base41;
    u64 a42 = M21 * (u64)m1 + base42;
    u64 a41sq = a41 * a41, a42sq = a42 * a42, a41a42 = a41 * a42;
    double sd1 = (double)(i64)a41sq + lam1 * (double)(i64)a41a42 + lam2 * (double)(i64)a42sq;
    double sd2 = (double)(i64)a41sq + lam1c * (double)(i64)a41a42 + lam2c * (double)(i64)a42sq;
    if (!(sd1 >= 0.0 && sd1 <= T1 && sd2 >= 0.0 && sd2 <= T2)) continue;

    u64 bb9 = 2 * a41 * a51 + (a41 * a52 + a42 * a51) * Trw + 2 * a42 * a52 * Nmw;
    if (!((i64)bb9 >= bb9L0 && (i64)bb9 <= bb9U0)) continue;

    u64 bb4 = bb4pre2 + 2 * a41 + a42 * Trw;
    if (!((i64)bb4 >= bb4L && (i64)bb4 <= bb4U)) continue;

    u64 bb5 = bb5pre2 + 2 * a11 * a41 + (a11 * a42 + a12 * a41) * Trw + 2 * a12 * a42 * Nmw;
    u64 s4 = (u64)(-4L) * bb4 - Sum4;
    u64 Sum = bb4 * S1 + bb3 * S2 + bb2 * S3 + bb1 * s4;
    if (!((i64)bb5 >= d2l(ceil((-t5 - (double)(i64)Sum) / 5.0)) &&
          (i64)bb5 <= d2l(floor((t5 - (double)(i64)Sum) / 5.0)))) continue;

    u64 bb6 = bb6pre2 + 2 * a21 * a41 + (a21 * a42 + a22 * a41) * Trw + 2 * a22 * a42 * Nmw;
    u64 s5 = (u64)(-5L) * bb5 - Sum;
    Sum = bb5 * S1 + bb4 * S2 + bb3 * S3 + bb2 * s4 + bb1 * s5;
    if (!((i64)bb6 >= d2l(ceil((-t6 - (double)(i64)Sum) / 6.0)) &&
          (i64)bb6 <= d2l(floor((t6 - (double)(i64)Sum) / 6.0)))) continue;

    u64 bb7 = bb7pre + 2 * a31 * a41 + (a31 * a42 + a32 * a41) * Trw + 2 * a32 * a42 * Nmw;
    u64 s6 = (u64)(-6L) * bb6 - Sum;
    Sum = bb6 * S1 + bb5 * S2 + bb4 * S3 + bb3 * s4 + bb2 * s5 + bb1 * s6;
    if (!((i64)bb7 >= d2l(ceil((-t7 - (double)(i64)Sum) / 7.0)) &&
          (i64)bb7 <= d2l(floor((t7 - (double)(i64)Sum) / 7.0)))) continue;

    u64 bb8 = bb8pre + a41sq + a41a42 * Trw + a42sq * Nmw;
    u64 s7 = (u64)(-7L) * bb7 - Sum;
    Sum = bb7 * S1 + bb6 * S2 + bb5 * S3 + bb4 * s4 + bb3 * s5 + bb2 * s6 + bb1 * s7;
    if (!((i64)bb8 >= d2l(ceil((-t8 - (double)(i64)Sum) / 8.0)) &&
          (i64)bb8 <= d2l(floor((t8 - (double)(i64)Sum) / 8.0)))) continue;

    u64 s8 = (u64)(-8L) * bb8 - Sum;
    Sum = bb8 * S1 + bb7 * S2 + bb6 * S3 + bb5 * s4 + bb4 * s5 + bb3 * s6 + bb2 * s7 + bb1 * s8;
    if (!((i64)bb9 >= d2l(ceil((-t9 - (double)(i64)Sum) / 9.0)) &&
          (i64)bb9 <= d2l(floor((t9 - (double)(i64)Sum) / 9.0)))) continue;

    double tmpdbl = 0.5 * (double)(i64)bb9 * (double)(i64)bb9 / (double)bb10;
    if (!((i64)bb8 >= d2l(ceil(tmpdbl - bb8_Upre)) &&
          (i64)bb8 <= d2l(floor(tmpdbl + bb8_Upre)))) continue;

    // A polynomial of the original enumeration.
    count++;

    i64 c[11];
    c[1] = (i64)bb1; c[2] = (i64)bb2; c[3] = (i64)bb3; c[4] = (i64)bb4; c[5] = (i64)bb5;
    c[6] = (i64)bb6; c[7] = (i64)bb7; c[8] = (i64)bb8; c[9] = (i64)bb9; c[10] = bb10;
    if (!survives(c, qt, nprime)) continue;

    uint idx = atomic_inc(outcnt);
    if (idx < outcap) {
      __global i64 *o = out + (size_t)idx * REC;
      o[0] = (i64)(nodebase + node);  o[1] = m2;  o[2] = m1;
      o[3] = c[1]; o[4] = c[2]; o[5] = c[3]; o[6] = c[4]; o[7] = c[5];
      o[8] = c[6]; o[9] = c[7]; o[10] = c[8]; o[11] = c[9];
    }
  }
  cnt[gid] = count;
}
