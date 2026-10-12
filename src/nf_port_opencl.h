// SPDX-License-Identifier: GPL-2.0-or-later
// Copyright (C) 2026 Alperen Yavuz
// nf_port_opencl.h -- maps the portable kernel (nf_kernel.h) onto OpenCL C.

#pragma OPENCL EXTENSION cl_khr_fp64 : enable
#pragma OPENCL FP_CONTRACT OFF

typedef long i64;
typedef ulong u64;
typedef uint nfuint;

#define NF_INLINE inline
#define NF_G __global
#define NF_C __constant
#define NF_KERNEL __kernel
#define NF_I64_MIN LONG_MIN
#define NF_GID() ((u64)get_global_id(0))
#define NF_AS_FLOAT(x) as_float(x)
#define NF_ATOMIC_INC(p) atomic_inc(p)
