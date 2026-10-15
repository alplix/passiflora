set -e
NDK=/root/android/android-ndk-r27c
TC=$NDK/toolchains/llvm/prebuilt/linux-x86_64/bin
mkdir -p /root/nfa && cd /root/nfa
[ -f gmp-6.3.0.tar.xz ] || wget -q https://ftp.gnu.org/gnu/gmp/gmp-6.3.0.tar.xz
rm -rf gmp-6.3.0 gmp-inst && tar xf gmp-6.3.0.tar.xz && cd gmp-6.3.0
export CC=$TC/aarch64-linux-android24-clang AR=$TC/llvm-ar RANLIB=$TC/llvm-ranlib STRIP=$TC/llvm-strip
./configure --host=aarch64-linux-android --prefix=/root/nfa/gmp-inst --disable-shared --enable-static --with-pic > /root/nfa/gmp_conf.log 2>&1
make -j6 > /root/nfa/gmp_make.log 2>&1
make install > /root/nfa/gmp_inst.log 2>&1
ls -la /root/nfa/gmp-inst/lib
echo GMP_ANDROID_OK
