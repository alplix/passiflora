! SPDX-License-Identifier: GPL-2.0-or-later
! Copyright (C) 2026 Alperen Yavuz
! chain_general.inc -- chi(Disc A) mod q for lanes whose Euclid chain is not
! generic (some degree drops by more than one).  Included twice by
! pdfilter.f90 with GNAME/GK/GRED/GQ/GQI/GEXP set for single and double
! precision.
!
! Polynomials are stored left-aligned (index 0 = leading coefficient, zero
! padded), so one elementary pseudo-division step
!     U' = lc(V)*U - lc(U)*x^(deg U - deg V)*V
! is the same formula  U'(i) = lc(V)*U(i+1) - lc(U)*V(i+1)  in every lane,
! whatever the degrees.  Leading zeros of U' are shifted out lane by lane.
!
! Bookkeeping, with Res(V,P) = lc(V)^deg(P) * prod_{V(b)=0} P(b):
!     Res(V,U') = lc(V)^(deg U' - deg U + deg V) * Res(V,U),
! and swapping U and V only changes the sign (chi(-1) = 1 for q = 1 mod 4).
! The odd powers of lc(V) are multiplied into mm; at the end (V constant c)
! Res = c^deg(U), so chi(Disc A) = chi(mm * c^(deg U mod 2)).  A zero U'
! means Res = 0 mod q: the lane is kept.
!
! U, V and the new remainder W live in three slots of p.  While all lanes move
! in lockstep (same degrees), "U = W" and "swap U, V" just exchange slot
! indices; lanes that diverge are handled with masked merges.

  subroutine GNAME(a, j, keep)
    real(GK), intent(in) :: a(BLK, 0:10)
    integer, intent(in) :: j
    logical, intent(out) :: keep(BLK)
    real(GK) :: p(BLK, 0:11, 0:2)
    real(GK) :: du(BLK), dv(BLK), dw(BLK), mm(BLK), lu(BLK), lv(BLK), ev(BLK)
    real(GK) :: base(BLK), acc(BLK), tmp(BLK)
    ! Lane flags as 0/1 reals: gfortran does not vectorise logical arrays.
    real(GK) :: act(BLK), done(BLK), resz(BLK), zf(BLK), sw(BLK)
    real(GK) :: q, qi
    integer(i8) :: e
    integer :: i, it, imax, iu, iv, iw, t

    q = GQ(j); qi = GQI(j)
    iu = 0; iv = 1; iw = 2
    ! U = A (degree 10, monic), V = A' (degree 9, leading coefficient 10).
    do i = 0, 10
      p(:, i, iu) = a(:, 10-i)
    end do
    p(:, 11, iu) = 0
    do i = 0, 9
      p(:, i, iv) = GRED(real(10-i, GK)*a(:, 10-i), q, qi)
    end do
    p(:, 10:11, iv) = 0
    du = 10; dv = 9
    mm = 1
    done = 0; resz = 0

    do it = 1, 40
      act = 1 - done
      if (GVMAX(act) == 0) exit
      imax = int(GVMAX(du*act))
      lu = p(:, 0, iu); lv = p(:, 0, iv)
      do i = 0, imax - 1
        p(:, i, iw) = GRED(lv*p(:, i+1, iu) - lu*p(:, i+1, iv), q, qi)
      end do
      p(:, imax:11, iw) = 0
      dw = du - 1
      ! Shift out leading zeros (a zero polynomial ends at degree -1).
      do
        zf = merge(act, real(0, GK), p(:, 0, iw) == 0 .and. dw >= 0)
        if (GVMAX(zf) == 0) exit
        do i = 0, imax - 1
          p(:, i, iw) = merge(p(:, i+1, iw), p(:, i, iw), zf > 0)
        end do
        p(:, imax, iw) = merge(real(0, GK), p(:, imax, iw), zf > 0)
        dw = dw - zf
      end do
      ! U' = 0: resultant vanishes mod q.
      tmp = merge(act, real(0, GK), dw < 0)
      resz = max(resz, tmp)
      done = max(done, tmp)
      act = act - tmp
      ! chi bookkeeping for lc(V)^(deg U' - deg U + deg V).
      ev = abs(dw - du + dv)
      tmp = GRED(mm*lv, q, qi)
      mm = merge(tmp, mm, act > 0 .and. ev - 2*aint(real(0.5, GK)*ev) /= 0)
      ! U = U'; swap U and V when deg U < deg V.
      sw = merge(act, real(0, GK), dw < dv)
      ! Lockstep: every lane active with the same deg U' and deg V.
      tmp = (1 - act) + abs(dw - dw(1)) + abs(dv - dv(1))
      if (GVMAX(tmp) == 0) then
        t = iu; iu = iw; iw = t
        du = dw
        if (sw(1) > 0) then
          t = iu; iu = iv; iv = t
          tmp = du; du = dv; dv = tmp
        end if
      else
        do i = 0, imax
          p(:, i, iu) = merge(p(:, i, iw), p(:, i, iu), act > 0)
        end do
        du = merge(dw, du, act > 0)
        do i = 0, imax
          tmp = p(:, i, iu)
          p(:, i, iu) = merge(p(:, i, iv), p(:, i, iu), sw > 0)
          p(:, i, iv) = merge(tmp, p(:, i, iv), sw > 0)
        end do
        tmp = du
        du = merge(dv, du, sw > 0)
        dv = merge(tmp, dv, sw > 0)
      end if
      ! V constant c: Res = c^deg U.
      tmp = GRED(mm*p(:, 0, iv), q, qi)
      mm = merge(tmp, mm, act > 0 .and. dv == 0 .and. du - 2*aint(real(0.5, GK)*du) /= 0)
      done = max(done, merge(act, real(0, GK), dv == 0))
    end do

    ! Euler criterion on mm.
    base = mm
    acc = 1
    e = GEXP(j)
    do while (e > 0)
      if (iand(e, 1_i8) == 1) acc = GRED(acc*base, q, qi)
      base = GRED(base*base, q, qi)
      e = shiftr(e, 1)
    end do
    keep = .not. (done > 0 .and. resz == 0 .and. acc == -1)
  end subroutine GNAME
