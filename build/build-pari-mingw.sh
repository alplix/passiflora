exec > /root/nf/winpari4.log 2>&1
cat > /root/nf/winrun <<'W'
#!/bin/bash
# Run a Windows test exe from PARI's Configure and strip CRLF from its output.
"$@" | tr -d '\r'; exit ${PIPESTATUS[0]}
W
chmod +x /root/nf/winrun
W=/mnt/c/Users/Alp/AppData/Local/Temp/nfw
rm -rf $W/wpari && cp -r /root/nf/upstream/Pari/pari-2.8-1711-ge5c317c $W/wpari
cd $W/wpari && rm -rf Olinux-x86_64
RUNTEST=/root/nf/winrun CC=/root/nf/mingwcc RANLIB=x86_64-w64-mingw32-ranlib AR=x86_64-w64-mingw32-ar ./Configure --static --host=x86_64-mingw --with-gmp=/root/nf/wgmp --without-readline 2>&1 | grep -E 'sizeof|kernel|Kernel|gmp|GMP|Abort' 
O=$(ls -d O* | head -1); echo "objdir=$O"; grep -E "sizeof_long|doubleformat|kernlvl" $O/pari.cfg
cd $O && make -j4 lib-sta 2>&1 | grep -E 'error|Error' | head
ls -la libpari.a && echo WINPARI_OK
