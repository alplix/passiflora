set -e
NDK=/root/android/android-ndk-r27c
TC=$NDK/toolchains/llvm/prebuilt/linux-x86_64/bin
A=/root/android/androot
mountpoint -q $A/system || mount -o loop,ro /root/android/img/system.img $A/system
mountpoint -q $A/proc || mount -t proc proc $A/proc
mountpoint -q $A/dev || mount --bind /dev $A/dev
mountpoint -q $A/apex/com.android.runtime || mount -o loop,ro /root/android/img/rt/apex_payload.img $A/apex/com.android.runtime
cat > /root/nfa/droidrun <<'W'
#!/bin/bash
# Runs an Android arm64 executable (built with the NDK) under qemu-user inside the Android userland.
A=/root/android/androot
mkdir -p $A/data/local/tmp/pt
f=$A/data/local/tmp/pt/t$$
cp "$1" $f; shift
cd /
chroot $A /qemu-aarch64 -E LD_LIBRARY_PATH=/apex/com.android.runtime/lib64/bionic:/system/lib64 /apex/com.android.runtime/bin/linker64 /data/local/tmp/pt/t$$ "$@" 2>/dev/null | grep -av '^WARNING: linker'
rc=${PIPESTATUS[0]}
rm -f $f
exit $rc
W
chmod +x /root/nfa/droidrun
rm -rf /root/nfa/pari && cp -r /root/nf/upstream/Pari/pari-2.8-1711-ge5c317c /root/nfa/pari
cd /root/nfa/pari && rm -rf Olinux-x86_64
export CC=$TC/aarch64-linux-android24-clang AR=$TC/llvm-ar RANLIB=$TC/llvm-ranlib
RUNTEST=/root/nfa/droidrun ./Configure --static --host=aarch64-linux --with-gmp=/root/nfa/gmp-inst --without-readline > /root/nfa/pari_conf.log 2>&1 || true
tail -15 /root/nfa/pari_conf.log
ls -d O*
