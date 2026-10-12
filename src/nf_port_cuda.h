// SPDX-License-Identifier: GPL-2.0-or-later
// Copyright (C) 2026 Alperen Yavuz
// nf_port_cuda.h -- maps the portable kernel (nf_kernel.h) onto CUDA C.
// The same header serves CUDA-compatible compilers (MUSA's mcc, HIP): the names below exist there too.
//
// Compile with floating-point contraction and fast math OFF, so every double operation is
// rounded exactly as on the CPU:   nvcc --fmad=false -prec-div=true -prec-sqrt=true -ftz=false

typedef long long i64;
typedef unsigned long long u64;
typedef unsigned int nfuint;

#define NF_INLINE __device__ __forceinline__
#define NF_G
#define NF_C const
#define NF_KERNEL extern "C" __global__
#define NF_I64_MIN (-9223372036854775807LL - 1)
#define NF_GID() ((u64)blockIdx.x * (u64)blockDim.x + (u64)threadIdx.x)
#define NF_AS_FLOAT(x) __int_as_float(x)
#define NF_ATOMIC_INC(p) atomicAdd((p), 1u)
