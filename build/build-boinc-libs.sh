#!/bin/bash
# Builds the BOINC application libraries (libboinc_api.a, libboinc.a) from source, for architectures whose
# distribution packages ship empty archives (Ubuntu 22.04 riscv64).  Result: $HOME/pk/boinclibs/*.a
set -e
apt-get install -y -qq git autoconf automake libtool m4 pkg-config make g++ libssl-dev libcurl4-openssl-dev >/dev/null
cd /tmp
rm -rf boinc && git clone -q --depth 1 --branch client_release/7.20/7.20.7 https://github.com/BOINC/boinc.git || git clone -q --depth 1 https://github.com/BOINC/boinc.git
cd boinc
./_autosetup >/dev/null 2>&1
./configure --enable-libraries --disable-server --disable-client --disable-manager --disable-shared --enable-static --disable-fcgi >/dev/null 2>&1
make -j3 >/dev/null 2>&1 || true
mkdir -p $HOME/pk/boinclibs
cp api/.libs/libboinc_api.a lib/.libs/libboinc.a $HOME/pk/boinclibs/ 2>/dev/null || cp api/libboinc_api.a lib/libboinc.a $HOME/pk/boinclibs/
ls -la $HOME/pk/boinclibs
echo BOINCLIBS_OK
