A=/root/android/androot
T=/mnt/c/Users/Alp/Documents/pk-multi/t/Test/dataFiles
BIN=${1:-/root/nfa/src/GetDecics_cpu}
W=${2:-sf5_DS-14x11_Grp33043of705883}
# chroot always starts in /, so the work unit goes into the root of the Android userland
rm -f $A/in $A/out $A/stderr.txt $A/boinc_finish_called $A/boinc_task_state.xml $A/GetDecics_state $A/boinc_*
mkdir -p $A/data/local/tmp
cp $BIN $A/data/local/tmp/prog
cp $T/$W.dat $A/in
S=$(date +%s)
chroot $A /qemu-aarch64 -E LD_LIBRARY_PATH=/apex/com.android.runtime/lib64/bionic:/system/lib64 /apex/com.android.runtime/bin/linker64 /data/local/tmp/prog > /root/nfa/so.txt 2> /root/nfa/se.txt
echo "rc=$? $(( $(date +%s) - S )) s"
grep -v "^WARNING: linker\|^linker:" /root/nfa/se.txt | head -5
head -3 $A/stderr.txt 2>/dev/null
grep -v Elapsed $A/out > /root/nfa/o1 2>/dev/null; grep -v Elapsed $T/wu_$W.out.truth > /root/nfa/o2
cmp -s /root/nfa/o1 /root/nfa/o2 && echo MATCH || echo DIFF
