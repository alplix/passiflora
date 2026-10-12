#!/bin/bash
# Runs work units against their truth files on any Unix (macOS, Linux; no GNU-specific tools needed).
#   test-suite-unix.sh <program> <dataFiles dir> [parallel] [wu names...]   (default: all *DS*_Grp*.dat)
# Prints one line per work unit (MATCH/DIFF, exit code, seconds) and a summary.
BIN=$1; DATA=$2; PAR=${3:-1}; shift 3
LIST=("$@")
if [ ${#LIST[@]} -eq 0 ]; then for f in "$DATA"/*DS*_Grp*.dat; do b=$(basename "$f" .dat); LIST+=("$b"); done; fi
TMP=$(mktemp -d)
run_one() {
  w=$1; d="$TMP/$w"; mkdir -p "$d"; cd "$d"
  cp "$DATA/$w.dat" in
  t0=$(date +%s)
  "$BIN" > /dev/null 2>&1; rc=$?
  t1=$(date +%s)
  grep -v "Elapsed Time" out > o1 2>/dev/null
  grep -v "Elapsed Time" "$DATA/wu_$w.out.truth" > o2
  if cmp -s o1 o2 && [ $rc -eq 0 ]; then r=MATCH; else r=DIFF; fi
  echo "$w $r exit=$rc wall=$((t1-t0)) s"
}
export -f run_one 2>/dev/null
export BIN DATA TMP
if [ "$PAR" -gt 1 ] && command -v xargs >/dev/null; then
  printf '%s\n' "${LIST[@]}" | xargs -P "$PAR" -I{} bash -c 'run_one {}'
else
  for w in "${LIST[@]}"; do run_one "$w"; done
fi | tee "$TMP/results.txt"
echo "SUMMARY: MATCH $(grep -c ' MATCH ' "$TMP/results.txt")  DIFF $(grep -c ' DIFF ' "$TMP/results.txt")"
rm -rf "$TMP"
