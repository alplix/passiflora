! SPDX-License-Identifier: GPL-2.0-or-later
! Copyright (C) 2026 Alperen Yavuz
! Micro-benchmark for pdf_filter on synthetic decic polynomials.
program bench_filter
  use, intrinsic :: iso_c_binding
  implicit none
  interface
    subroutine pdf_init(numP, pSet) bind(C, name="pdf_init")
      import :: c_int
      integer(c_int), value :: numP
      integer(c_int), intent(in) :: pSet(*)
    end subroutine
    subroutine pdf_filter(pol, n, flag) bind(C, name="pdf_filter")
      import :: c_int, c_int64_t, c_signed_char
      integer(c_int), value :: n
      integer(c_int64_t), intent(in) :: pol(11, n)
      integer(c_signed_char), intent(out) :: flag(n)
    end subroutine
  end interface
  integer, parameter :: N = 10240, REPS = 100
  integer(c_int64_t), allocatable :: pol(:,:)
  integer(c_signed_char), allocatable :: flag(:)
  integer(c_int) :: pset(2) = [2, 5]
  real(8) :: u(10), t0, t1
  integer :: i, r, kept

  allocate(pol(11, N), flag(N))
  call random_seed()
  do i = 1, N
    call random_number(u)
    pol(1, i) = 1
    pol(2:11, i) = int((u - 0.5d0) * 2d0 * 1d6, c_int64_t) * [1,10,100,1000,10000,100000,1000000,1000000,1000000,1000000]/100
  end do
  call pdf_init(2, pset)
  call cpu_time(t0)
  kept = 0
  do r = 1, REPS
    call pdf_filter(pol, N, flag)
    kept = kept + count(flag /= 0)
  end do
  call cpu_time(t1)
  print '(a,f8.1,a,i0)', 'ns/poly = ', (t1 - t0) / (real(N, 8) * REPS) * 1d9, '  kept total = ', kept
end program bench_filter
