BIN=$1; TAG=$2
SP=/mnt/c/Users/Alp/AppData/Local/Temp/claude/C--Users-Alp-Documents-Default-Project/ac77d448-3f34-4416-ac54-fafab05b597e/scratchpad
cd /root/nf/upstream/Test/dataFiles
: > /root/nf/suite_$TAG.txt
for f in *DS*_Grp*.dat; do
  W=${f%.dat}
  bash $SP/gpuwu.sh $BIN $TAG $W NF_CUDA_ANY=1 2>&1 | head -1 >> /root/nf/suite_$TAG.txt
done
echo "MATCH: $(grep -c ' MATCH ' /root/nf/suite_$TAG.txt)  DIFF: $(grep -c ' DIFF ' /root/nf/suite_$TAG.txt)  total: $(wc -l < /root/nf/suite_$TAG.txt)"
awk '{w=$4; sub("wall=","",w); s+=w} END {print "total seconds:", s}' /root/nf/suite_$TAG.txt
