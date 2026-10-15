cd /root/nfa/pari/Olinux-aarch64
grep -E "sizeof_long|doubleformat|kernlvl|^CC=|gmp|GMP" pari.cfg | head
grep -E "kernel|Kernel|gmp" /root/nfa/pari_conf.log | head -5
export PERL5LIB=/root/nfa/pari/src/desc:/root/nfa/pari/src/desc/PARI
make -j6 lib-sta > /root/nfa/pari_make.log 2>&1
tail -3 /root/nfa/pari_make.log
ls -la libpari.a
echo PARI_ANDROID_DONE
