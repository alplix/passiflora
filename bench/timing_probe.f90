! SPDX-License-Identifier: GPL-2.0-or-later
! Copyright (C) 2026 Alperen Yavuz
! Times load_block vs chain_block separately (copy of the module internals).
program timing_probe
  use, intrinsic :: iso_c_binding
  implicit none
  integer, parameter :: dp = c_double, i8 = c_int64_t, BLK = 64
  real(dp), parameter :: MAGIC = 6755399441055744.0_dp
  real(dp) :: a(BLK,0:10), pa(BLK,0:10), pb(BLK,0:9), r(BLK,0:9), lc(BLK), top(BLK), t(BLK)
  real(dp) :: q, qi, x, f, rr, acc
  integer(i8) :: c0, c1, rate
  integer :: it, m, k, l
  q = 33554393.0_dp; qi = 1.0_dp/q
  call random_number(a); a = aint(a*q)
  call system_clock(c0, rate)
  acc = 0
  do it = 1, 200000
    pa = a
    do k = 1, 10
      pb(:,k-1) = real(k,dp)*a(:,k)
    end do
    do m = 9, 1, -1
      lc = pb(:,m); top = pa(:,m+1)
      do k = 1, m
        do l = 1, BLK
          x = lc(l)*pa(l,k) - top(l)*pb(l,k-1)
          f = (x*qi + MAGIC) - MAGIC; rr = x - f*q
          r(l,k) = merge(rr+q, rr, rr < 0.0_dp)
        end do
      end do
      r(:,0) = lc*pa(:,0)
      t = r(:,m)
      do k = 0, m-1
        do l = 1, BLK
          x = lc(l)*r(l,k) - t(l)*pb(l,k)
          f = (x*qi + MAGIC) - MAGIC; rr = x - f*q
          r(l,k) = merge(rr+q, rr, rr < 0.0_dp)
        end do
      end do
      pa(:,0:m) = pb(:,0:m); pb(:,0:m-1) = r(:,0:m-1)
    end do
    acc = acc + pb(1,0)
    a(1,1) = mod(a(1,1) + 1.0_dp, q)
  end do
  call system_clock(c1)
  print '(a,f8.2,a,f12.0)', 'chain ns/poly/prime = ', real(c1-c0,dp)/rate/(200000.0_dp*BLK)*1d9, '  ', acc
end program
