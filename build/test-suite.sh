# usage: suite.sh <binary> <tag> <parallel>
BIN=$1; TAG=$2; PAR=${3:-3}
HERE=$(cd "$(dirname "$0")" && pwd)
cd /root/nf/upstream/Test/dataFiles
ls *DS*.dat | xargs -P $PAR -I{} bash $HERE/test-wu.sh $BIN $TAG {} > /root/nf/suite_$TAG.txt 2>&1
echo "MATCH: $(grep -c ' MATCH ' /root/nf/suite_$TAG.txt)  DIFF: $(grep -c ' DIFF ' /root/nf/suite_$TAG.txt)  total: $(wc -l < /root/nf/suite_$TAG.txt)"
