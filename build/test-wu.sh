# usage: fullwu.sh <binary> <tag> <wu.dat...>  -- runs full WUs, diffs against truth (ignoring Elapsed Time)
BIN=$1; TAG=$2; shift 2
for WU in "$@"; do
  B=$(basename $WU .dat)
  D=/root/nf/full_${TAG}_$B; rm -rf $D; mkdir -p $D; cd $D
  cp /root/nf/upstream/Test/dataFiles/$WU in
  T0=$(date +%s.%N)
  $BIN > /dev/null 2>&1
  T1=$(date +%s.%N)
  grep -v "Elapsed Time" out > o1; grep -v "Elapsed Time" /root/nf/upstream/Test/dataFiles/wu_$B.out.truth > o2
  if cmp -s o1 o2; then R=MATCH; else R=DIFF; fi
  echo "$TAG $B $R wall=$(echo "$T1 - $T0" | bc) truth_$(grep -h Elapsed /root/nf/upstream/Test/dataFiles/wu_$B.out.truth | tr -d '#')"
done
