! SPDX-License-Identifier: GPL-2.0-or-later
! Copyright (C) 2026 Alperen Yavuz
! pdfilter.f90 -- exact modular pre-filter for the NumberFields polDisc test.
!
! The upstream test asks: after removing every factor of the primes in S from
! |polDisc|, is what remains a perfect square?  Up to rational square factors
! (B's content c gives c^10, the last sub-resultant step gives (B0/h)^(2k)),
! polDisc equals Disc(A), so the question is the same for Disc(A).
!
! For a prime q with q == 1 (mod 4) and every p in S a quadratic residue mod q,
! a passing polynomial must have Legendre(Disc(A) mod q) in {0, 1}.  If the
! Legendre symbol is -1 the polynomial can never pass, so it is rejected here.
! Everything else (including every polynomial whose computation hit a zero
! leading coefficient mod q) is handed to the original GMP test unchanged,
! which keeps the final flags bit-identical to the stock application.
!
! Disc(A) mod q is evaluated with a generic Euclid chain over F_q using
! pseudo-remainders (two rounds per step, degree drops by exactly one).  In
! that generic case every leading-coefficient power that appears has an even
! exponent, so chi(Disc(A)) = chi(final constant) and no inverses are needed.
!
! The first stage uses a few small primes q < 2^10 in single precision
! (residues |r| <= 511, products <= 2^18: exact in a 24-bit mantissa, twice the
! SIMD lanes of double).  Each prime rejects about half of the candidates; the
! few survivors continue with large primes q < 2^25 in double precision
! (products below 2^50, also exact).  All inner loops vectorise across
! polynomials (BLK lanes).

! Built twice (see the build scripts, -cpp): once per instruction-set level,
! with a distinct module name and C symbols; the C++ side picks one at run time.
#ifndef PDF_MOD
#  define PDF_MOD pdfilter
#  define PDF_INIT_NAME "pdf_init"
#  define PDF_FILTER_NAME "pdf_filter"
#endif

module PDF_MOD
  use, intrinsic :: iso_c_binding
  implicit none
  private
  public :: pdf_init, pdf_filter

  integer, parameter :: dp = c_double, sp = c_float, i8 = c_int64_t
  integer, parameter :: MAXQ = 24, MAXS = 6, BLK = 64
  real(dp), parameter :: MAGIC  = 6755399441055744.0_dp   ! 1.5 * 2^52
  real(sp), parameter :: MAGICS = 12582912.0_sp           ! 1.5 * 2^23

  ! Large primes (double precision stage).
  integer :: nq = 0
  real(dp) :: qv(MAXQ), qiv(MAXQ), sh25(MAXQ)
  integer(i8) :: qexp(MAXQ)
  ! Small primes (single precision stage); qsd/qsdi/sh25s reduce the input in double.
  integer :: ns = 0
  real(sp) :: qs(MAXS), qsi(MAXS)
  real(dp) :: qsd(MAXS), qsdi(MAXS), sh25s(MAXS)
  integer(i8) :: qsexp(MAXS)

  integer, allocatable, save :: idx(:), nidx(:), uidx(:)
  real(dp), allocatable, save :: hiA(:, :), loA(:, :)
  logical, save :: debug = .false., allgen = .false.
  ! Per prime stage: go straight to chain_general when most lanes of the last
  ! probe left the generic chain (structurally degenerate families).
  logical, save :: prefgen(MAXS + MAXQ) = .false.
  integer, save :: ncall = 0

contains

  pure integer(i8) function powmod_i(b, e, m) result(r)
    integer(i8), intent(in) :: b, e, m
    integer(i8) :: x, ee
    r = 1
    x = modulo(b, m)
    ee = e
    do while (ee > 0)
      if (iand(ee, 1_i8) == 1) r = modulo(r*x, m)
      x = modulo(x*x, m)
      ee = shiftr(ee, 1)
    end do
  end function powmod_i

  pure logical function is_prime(n)
    integer(i8), intent(in) :: n
    integer(i8) :: d
    is_prime = .false.
    if (n < 2) return
    if (mod(n, 2_i8) == 0) then
      is_prime = (n == 2)
      return
    end if
    d = 3
    do while (d*d <= n)
      if (mod(n, d) == 0) return
      d = d + 2
    end do
    is_prime = .true.
  end function is_prime

  ! q is usable when q == 1 (mod 4) is prime and every p in S is a nonzero
  ! quadratic residue mod q.
  logical function usable(q, numP, pSet)
    integer(i8), intent(in) :: q
    integer(c_int), intent(in) :: numP
    integer(c_int), intent(in) :: pSet(*)
    integer(i8) :: p
    integer :: k
    usable = .false.
    if (mod(q, 4_i8) /= 1 .or. .not. is_prime(q)) return
    do k = 1, numP
      p = int(pSet(k), i8)
      if (mod(p, q) == 0 .or. powmod_i(p, (q-1)/2, q) /= 1) return
    end do
    usable = .true.
  end function usable

  ! Choose the filter primes for the set S of primes divided out by the test.
  subroutine pdf_init(numP, pSet) bind(C, name=PDF_INIT_NAME)
    integer(c_int), value :: numP
    integer(c_int), intent(in) :: pSet(*)
    integer(i8) :: q
    character(len=8) :: ev
    integer :: evlen

    call get_environment_variable('NF_PDFDEBUG', ev, evlen)
    debug = (evlen > 0)
    ! NF_GENERAL_ALL=1 sends every lane through chain_general (testing aid).
    call get_environment_variable('NF_GENERAL_ALL', ev, evlen)
    allgen = (evlen > 0)

    ns = 0
    q = 2_i8**10 - 1
    do while (ns < MAXS .and. q > 256)
      if (usable(q, numP, pSet)) then
        ns = ns + 1
        qs(ns)    = real(q, sp)
        qsi(ns)   = 1.0_sp / real(q, sp)
        qsd(ns)   = real(q, dp)
        qsdi(ns)  = 1.0_dp / real(q, dp)
        sh25s(ns) = real(modulo(2_i8**25, q), dp)
        qsexp(ns) = (q - 1) / 2
      end if
      q = q - 2
    end do

    nq = 0
    q = 2_i8**25 - 1
    do while (nq < MAXQ .and. q > 2_i8**24)
      if (usable(q, numP, pSet)) then
        nq = nq + 1
        qv(nq)   = real(q, dp)
        qiv(nq)  = 1.0_dp / real(q, dp)
        sh25(nq) = real(modulo(2_i8**25, q), dp)
        qexp(nq) = (q - 1) / 2
      end if
      q = q - 2
    end do
  end subroutine pdf_init

  ! Reduce an exact double |x| < 2^51 to the symmetric residue in
  ! [-(q-1)/2, (q-1)/2].  q is odd, so x/q is never a half-integer and the
  ! round-to-nearest quotient is exact; no correction step (and no branch,
  ! which would stop gfortran from vectorising the callers) is needed.
  elemental real(dp) function red(x, q, qi)
    real(dp), intent(in) :: x, q, qi
    red = x - q*((x*qi + MAGIC) - MAGIC)
  end function red

  ! Single-precision version for q < 2^10 and |x| <= 2^19: the quotient error
  ! (<= 2^-13) stays below the distance 1/(2q) >= 2^-11 to a half-integer.
  elemental real(sp) function reds(x, q, qi)
    real(sp), intent(in) :: x, q, qi
    reds = x - q*((x*qi + MAGICS) - MAGICS)
  end function reds

  ! Small-prime versions of load_block / chain_block (same algorithm).
  subroutine load_block_s(ids, c, j, a)
    integer, intent(in) :: c, j
    integer, intent(in) :: ids(c)
    real(sp), intent(out) :: a(BLK, 0:10)
    real(dp) :: q, qi, s
    integer :: l, k

    q = qsd(j); qi = qsdi(j); s = sh25s(j)
    do k = 0, 9
      do l = 1, c
        a(l, k) = real(red(red(hiA(ids(l), k), q, qi)*s + loA(ids(l), k), q, qi), sp)
      end do
      a(c+1:BLK, k) = 0.0_sp
    end do
    a(:, 10) = 1.0_sp
  end subroutine load_block_s

  subroutine chain_block_s(a, j, keep, ok)
    real(sp), intent(in) :: a(BLK, 0:10)
    integer, intent(in) :: j
    logical, intent(out) :: keep(BLK), ok(BLK)
    real(sp) :: p(BLK, 0:10, 0:2)
    real(sp) :: lc(BLK), top(BLK), t(BLK), base(BLK), acc(BLK)
    real(sp) :: q, qi
    integer(i8) :: e
    integer :: m, k, l, ia, ib, ir, tmp

    q = qs(j); qi = qsi(j)
    ia = 0; ib = 1; ir = 2
    p(:, :, ia) = a
    do k = 1, 10
      p(:, k-1, ib) = reds(real(k, sp)*a(:, k), q, qi)
    end do
    ok = .true.

    do m = 9, 1, -1
      lc  = p(:, m, ib)
      top = p(:, m+1, ia)
      p(:, 0, ir) = reds(lc*p(:, 0, ia), q, qi)
      do k = 1, m
        do l = 1, BLK
          p(l, k, ir) = reds(lc(l)*p(l, k, ia) - top(l)*p(l, k-1, ib), q, qi)
        end do
      end do
      t = p(:, m, ir)
      do k = 0, m-1
        do l = 1, BLK
          p(l, k, ir) = reds(lc(l)*p(l, k, ir) - t(l)*p(l, k, ib), q, qi)
        end do
      end do
      if (m >= 2) ok = ok .and. (p(:, m-1, ir) /= 0.0_sp)
      tmp = ia; ia = ib; ib = ir; ir = tmp
    end do

    base = p(:, 0, ib)
    acc = 1.0_sp
    e = qsexp(j)
    do while (e > 0)
      if (iand(e, 1_i8) == 1) acc = reds(acc*base, q, qi)
      base = reds(base*base, q, qi)
      e = shiftr(e, 1)
    end do

    keep = .not. (ok .and. acc == -1.0_sp)
  end subroutine chain_block_s

  ! Load and reduce a block of polynomials into F_q.
  ! a(l,k) = coefficient of x^k of polynomial idx(l), k = 0..10.
  ! hiA/loA hold every coefficient split as x = hi*2^25 + lo (both exact
  ! doubles), computed once per buffer so each prime only gathers and reduces.
  subroutine load_block(ids, c, j, a)
    integer, intent(in) :: c, j
    integer, intent(in) :: ids(c)
    real(dp), intent(out) :: a(BLK, 0:10)
    real(dp) :: q, qi, s
    integer :: l, k

    q = qv(j); qi = qiv(j); s = sh25(j)
    do k = 0, 9
      do l = 1, c
        a(l, k) = red(red(hiA(ids(l), k), q, qi)*s + loA(ids(l), k), q, qi)
      end do
      a(c+1:BLK, k) = 0.0_dp
    end do
    a(:, 10) = 1.0_dp
  end subroutine load_block

  ! keep(l) = .false. only when Disc(A_l) is proven to be a non-residue mod q.
  ! ok(l) = .false. when the chain left the generic path (some leading
  ! coefficient vanished mod q); pdf_filter then reruns that lane through
  ! chain_general, which follows any degree sequence.
  subroutine chain_block(a, j, keep, ok)
    real(dp), intent(in) :: a(BLK, 0:10)
    integer, intent(in) :: j
    logical, intent(out) :: keep(BLK), ok(BLK)
    ! Three polynomial slots rotate roles (A, B, R) instead of being copied.
    real(dp) :: p(BLK, 0:10, 0:2)
    real(dp) :: lc(BLK), top(BLK), t(BLK), base(BLK), acc(BLK)
    real(dp) :: q, qi
    integer(i8) :: e
    integer :: m, k, l, ia, ib, ir, tmp

    q = qv(j); qi = qiv(j)
    ia = 0; ib = 1; ir = 2
    p(:, :, ia) = a
    do k = 1, 10
      p(:, k-1, ib) = red(real(k, dp)*a(:, k), q, qi)
    end do
    ok = .true.

    do m = 9, 1, -1
      ! A = slot ia (degree m+1), B = slot ib (degree m).
      lc  = p(:, m, ib)
      top = p(:, m+1, ia)
      ! Round 1: R = lc*A - top*x*B, degree <= m.
      p(:, 0, ir) = red(lc*p(:, 0, ia), q, qi)
      do k = 1, m
        do l = 1, BLK
          p(l, k, ir) = red(lc(l)*p(l, k, ia) - top(l)*p(l, k-1, ib), q, qi)
        end do
      end do
      ! Round 2: R2 = lc*R - R_m*B, degree <= m-1 (in place).
      t = p(:, m, ir)
      do k = 0, m-1
        do l = 1, BLK
          p(l, k, ir) = red(lc(l)*p(l, k, ir) - t(l)*p(l, k, ib), q, qi)
        end do
      end do
      if (m >= 2) ok = ok .and. (p(:, m-1, ir) /= 0.0_dp)
      ! Next step: A = B, B = R2; the old A slot becomes scratch.
      tmp = ia; ia = ib; ib = ir; ir = tmp
    end do

    ! Euler criterion on the final constant: acc = r0^((q-1)/2).
    base = p(:, 0, ib)
    acc = 1.0_dp
    e = qexp(j)
    do while (e > 0)
      if (iand(e, 1_i8) == 1) acc = red(acc*base, q, qi)
      base = red(base*base, q, qi)
      e = shiftr(e, 1)
    end do

    keep = .not. (ok .and. acc == -1.0_dp)
  end subroutine chain_block

  ! max over the BLK lanes.  The MAXVAL intrinsic is not vectorised (NaN
  ! semantics), so reduce 8 lanes at a time with MAX, which is.
  pure real(sp) function vmax_s(x)
    real(sp), intent(in) :: x(BLK)
    real(sp) :: m(8)
    integer :: i
    m = x(1:8)
    do i = 9, BLK, 8
      m = max(m, x(i:i+7))
    end do
    vmax_s = max(max(max(m(1), m(2)), max(m(3), m(4))), max(max(m(5), m(6)), max(m(7), m(8))))
  end function vmax_s

  pure real(dp) function vmax_d(x)
    real(dp), intent(in) :: x(BLK)
    real(dp) :: m(8)
    integer :: i
    m = x(1:8)
    do i = 9, BLK, 8
      m = max(m, x(i:i+7))
    end do
    vmax_d = max(max(max(m(1), m(2)), max(m(3), m(4))), max(max(m(5), m(6)), max(m(7), m(8))))
  end function vmax_d

  ! General (non-generic degree sequence) chain, once per precision.
#define GNAME chain_general_s
#define GK sp
#define GRED reds
#define GQ qs
#define GQI qsi
#define GEXP qsexp
#define GVMAX vmax_s
#include "chain_general.inc"
#undef GNAME
#undef GK
#undef GRED
#undef GQ
#undef GQI
#undef GEXP
#undef GVMAX
#define GNAME chain_general
#define GK dp
#define GRED red
#define GQ qv
#define GQI qiv
#define GEXP qexp
#define GVMAX vmax_d
#include "chain_general.inc"

  ! One block through prime stage j (small primes first, then large ones),
  ! with the fast generic chain or, for lanes that left it, the general one.
  subroutine run_block(ids, c, j, general, keep, ok)
    integer, intent(in) :: c, j
    integer, intent(in) :: ids(c)
    logical, intent(in) :: general
    logical, intent(out) :: keep(BLK), ok(BLK)
    real(dp) :: a(BLK, 0:10)
    real(sp) :: as(BLK, 0:10)
    if (j <= ns) then
      call load_block_s(ids, c, j, as)
      if (general) then
        call chain_general_s(as, j, keep)
      else
        call chain_block_s(as, j, keep, ok)
      end if
    else
      call load_block(ids, c, j - ns, a)
      if (general) then
        call chain_general(a, j - ns, keep)
      else
        call chain_block(a, j - ns, keep, ok)
      end if
    end if
  end subroutine run_block

  ! flag(i) = 0 for proven failures, 1 for everything that still needs the
  ! exact test.  pol is the row-major C buffer polBuf[i*11 + col].
  subroutine pdf_filter(pol, n, flag) bind(C, name=PDF_FILTER_NAME)
    integer(c_int), value :: n
    integer(i8), intent(in) :: pol(11, n)
    integer(c_signed_char), intent(out) :: flag(n)
    logical :: keep(BLK), ok(BLK), usegen, probe
    integer :: na, nn, nu, j, s, c, l, k
    integer(i8) :: x

    if (n <= 0) return
    if (allocated(idx)) then
      if (size(idx) < n) deallocate(idx, nidx, uidx, hiA, loA)
    end if
    if (.not. allocated(idx)) allocate(idx(n), nidx(n), uidx(n), hiA(n, 0:9), loA(n, 0:9))

    do k = 0, 9
      do l = 1, n
        x = pol(11-k, l)
        hiA(l, k) = real(shifta(x, 25), dp)
        loA(l, k) = real(iand(x, 2_i8**25 - 1), dp)
      end do
    end do
    do l = 1, n
      idx(l) = l
    end do
    na = n
    ! Stages 1..ns use the small primes, ns+1..ns+nq the large ones.
    ncall = ncall + 1
    probe = (mod(ncall, 64) == 1)
    do j = 1, ns + nq
      nn = 0
      nu = 0
      usegen = allgen .or. (prefgen(j) .and. .not. probe)
      ! Pass 1: every candidate; lanes that left the generic chain go to uidx.
      do s = 1, na, BLK
        c = min(BLK, na - s + 1)
        call run_block(idx(s:s+c-1), c, j, usegen, keep, ok)
        if (usegen) ok = .true.
        do l = 1, c
          if (.not. ok(l)) then
            nu = nu + 1
            uidx(nu) = idx(s + l - 1)
          else if (keep(l)) then
            nn = nn + 1
            nidx(nn) = idx(s + l - 1)
          end if
        end do
      end do
      if (.not. usegen) prefgen(j) = (2*nu > na)
      ! Pass 2: those lanes through the general chain.
      do s = 1, nu, BLK
        c = min(BLK, nu - s + 1)
        call run_block(uidx(s:s+c-1), c, j, .true., keep, ok)
        do l = 1, c
          if (keep(l)) then
            nn = nn + 1
            nidx(nn) = uidx(s + l - 1)
          end if
        end do
      end do
      idx(1:nn) = nidx(1:nn)
      if (debug) write(0, '(a,i3,a,i9,a,i9,a,i9)') 'pdf prime', j, ': in', na, ' retried', nu, ' kept', nn
      na = nn
      if (na == 0) exit
    end do
    debug = .false.

    flag = 0_c_signed_char
    do l = 1, na
      flag(idx(l)) = 1_c_signed_char
    end do
  end subroutine pdf_filter

end module PDF_MOD
