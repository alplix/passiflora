# usage: gpuwu.sh <binary> <tag> <wu> [env assignments...]
BIN=$1; TAG=$2; W=$3; shift 3
D=/root/nf/gpu_${TAG}_$W; rm -rf $D; mkdir -p $D; cd $D
cp /root/nf/upstream/Test/dataFiles/$W.dat in
T0=$(date +%s.%N)
env "$@" $BIN > o.txt 2>&1
T1=$(date +%s.%N)
grep -v "Elapsed Time" out > o1 2>/dev/null; grep -v "Elapsed Time" /root/nf/upstream/Test/dataFiles/wu_$W.out.truth > o2
if cmp -s o1 o2; then R=MATCH; else R=DIFF; fi
echo "$TAG $W $R wall=$(echo "$T1 - $T0" | bc)"
grep -E "GPU mode|MISMATCH|rror|Segm" stderr.txt o.txt | head -5
