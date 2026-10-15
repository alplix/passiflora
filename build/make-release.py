# SPDX-License-Identifier: GPL-2.0-or-later
# Copyright (C) 2026 Alperen Yavuz
#
# Builds the release packages in dist/ from the executables.  Kinds of package:
#   CPU_             the CPU app only
#   GPU_             the OpenCL GPU app only (NVIDIA, AMD, Intel)
#   CPU-GPU_         CPU + OpenCL in one package
#   GPU-CUDA_        the CUDA GPU app only (NVIDIA)
#   CPU-GPU-CUDA_    CPU + CUDA in one package
#   GPU-MUSA_        the Moore Threads (MUSA) app, which also runs on the CPU
# Systems: windows_x86-64, linux_x86-64, linux_aarch64, macos_arm64, android_aarch64, linux_riscv64, linux_ppc64le, linux_s390x, linux_armhf.
# Set PASSIFLORA_<WIN|LIN|A64|MAC|ANDROID|RV64|PPC64|S390X|ARM32>_<CPU|GPU|CUDA|MUSA> to the executables (a package is skipped if one is missing);
# PASSIFLORA_LIN_MUSA is a directory holding GetDecics_musa, libnf_musa.so and libmusart.so.4.

import hashlib, io, os, sys, tarfile, time, zipfile

VER = "0.3.0"
V3 = "030"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(ROOT, "dist")

APP = "GetDecics"
NOW = int(time.time()) - 60

# (prefix, cpu, opencl, cuda, musa)
KINDS = {
    "CPU": (True, False, False, False),
    "GPU": (False, True, False, False),
    "CPU-GPU": (True, True, False, False),
    "GPU-CUDA": (False, False, True, False),
    "CPU-GPU-CUDA": (True, False, True, False),
    "GPU-MUSA": (False, False, False, True),
}

SYSTEMS = (
    dict(key="WIN", osname="windows_x86-64", platforms=["windows_x86_64"], system="Windows x86-64", windows=True,
         exe="GetDecics_passiflora_%s%s_windows_x86_64.exe", kinds=["CPU", "GPU", "CPU-GPU", "GPU-CUDA", "CPU-GPU-CUDA"],
         datadir=r"C:\ProgramData\BOINC\projects\numberfields.asu.edu_NumberFields"),
    dict(key="LIN", osname="linux_x86-64", platforms=["x86_64-pc-linux-gnu"], system="Linux x86-64", windows=False,
         exe="GetDecics_passiflora_%s%s_x86_64-pc-linux-gnu",
         kinds=["CPU", "GPU", "CPU-GPU", "GPU-CUDA", "CPU-GPU-CUDA", "GPU-MUSA"],
         datadir="/var/lib/boinc-client/projects/numberfields.asu.edu_NumberFields"),
    dict(key="A64", osname="linux_aarch64", platforms=["aarch64-unknown-linux-gnu"], system="Linux aarch64", windows=False,
         exe="GetDecics_passiflora_%s%s_aarch64-unknown-linux-gnu", kinds=["CPU", "GPU", "CPU-GPU"],
         datadir="/var/lib/boinc-client/projects/numberfields.asu.edu_NumberFields"),
    dict(key="RV64", osname="linux_riscv64", platforms=["riscv64-unknown-linux-gnu"], system="Linux RISC-V 64", windows=False,
         exe="GetDecics_passiflora_%s%s_riscv64-unknown-linux-gnu", kinds=["CPU"],
         datadir="/var/lib/boinc-client/projects/numberfields.asu.edu_NumberFields"),
    dict(key="PPC64", osname="linux_ppc64le", platforms=["powerpc64le-unknown-linux-gnu"], system="Linux PowerPC 64 (little endian)",
         windows=False, exe="GetDecics_passiflora_%s%s_powerpc64le-unknown-linux-gnu", kinds=["CPU"],
         datadir="/var/lib/boinc-client/projects/numberfields.asu.edu_NumberFields"),
    dict(key="S390X", osname="linux_s390x", platforms=["s390x-ibm-linux-gnu", "s390x-unknown-linux-gnu"], system="Linux IBM Z (s390x)",
         windows=False, exe="GetDecics_passiflora_%s%s_s390x-ibm-linux-gnu", kinds=["CPU"],
         datadir="/var/lib/boinc-client/projects/numberfields.asu.edu_NumberFields"),
    dict(key="ARM32", osname="linux_armhf", platforms=["arm-unknown-linux-gnueabihf"], system="Linux ARM 32-bit (armhf)",
         windows=False, exe="GetDecics_passiflora_%s%s_arm-unknown-linux-gnueabihf", kinds=["CPU"],
         datadir="/var/lib/boinc-client/projects/numberfields.asu.edu_NumberFields"),
    dict(key="ANDROID", osname="android_aarch64", platforms=["aarch64-android-linux-gnu"], system="Android 64-bit ARM", windows=False,
         exe="GetDecics_passiflora_%s%s_aarch64-android-linux-gnu", kinds=["CPU"], android=True,
         datadir="/data/data/edu.berkeley.boinc/client/projects/numberfields.asu.edu_NumberFields"),
    dict(key="MAC", osname="macos_arm64", platforms=["arm64-apple-darwin", "x86_64-apple-darwin"], system="macOS Apple silicon",
         windows=False, exe="GetDecics_passiflora_%s%s_arm64-apple-darwin", kinds=["CPU"],
         datadir="/Library/Application Support/BOINC Data/projects/numberfields.asu.edu_NumberFields", mac=True),
)

APP_CONFIG = """<?xml version="1.0" encoding="UTF-8"?>
<!--
  app_config.xml - Passiflora GPU: runs 4 tasks per graphics card.
  While one task is busy on the processor (the exact checks of the few candidates), the others keep the
  card working.  gpu_usage 1 = one task per card, 0.5 = two, 0.25 = four, 0.125 = eight.
  Each task uses about 150 MB of video memory and cpu_usage CPU cores.
  BOINC Manager: Options -> Read config files, after editing.
-->
<app_config>
  <app>
    <name>GetDecics</name>
    <gpu_versions>
      <gpu_usage>0.25</gpu_usage>
      <cpu_usage>1</cpu_usage>
    </gpu_versions>
  </app>
</app_config>
"""


def app_version(version, platform, exe, plan=None, coproc=None):
    s = ["  <app_version>",
         "    <app_name>%s</app_name>" % APP,
         "    <version_num>%d</version_num>" % version,
         "    <platform>%s</platform>" % platform]
    if plan:
        s.append("    <plan_class>%s</plan_class>" % plan)
    s += ["    <avg_ncpus>1</avg_ncpus>"]
    if coproc:
        s += ["    <max_ncpus>1</max_ncpus>",
              "    <coproc>", "      <type>%s</type>" % coproc, "      <count>1</count>", "    </coproc>"]
    s += ["    <file_ref>", "      <file_name>%s</file_name>" % exe, "      <main_program/>", "    </file_ref>"]
    return "\n".join(s + ["  </app_version>"])


def app_info(platforms, cpu_exe, ocl_exe, cuda_exe, musa_exe, extra_files):
    parts = ["<app_info>", "  <app>", "    <name>%s</name>" % APP,
             "    <user_friendly_name>Get Decic Fields</user_friendly_name>", "  </app>", ""]
    for e in (cpu_exe, ocl_exe, cuda_exe, musa_exe):
        if e:
            parts += ["  <file_info>", "    <name>%s</name>" % e, "    <executable/>", "  </file_info>"]
    for e in extra_files:
        parts += ["  <file_info>", "    <name>%s</name>" % e, "    <executable/>", "  </file_info>"]
    parts.append("")
    for platform in platforms:
        if cpu_exe:
            parts += [app_version(400, platform, cpu_exe), ""]
        if ocl_exe:
            for plan, cop in (("opencl_nvidia", "NVIDIA"), ("opencl_amd", "ATI"), ("opencl_intel_gpu", "intel_gpu")):
                parts += [app_version(402, platform, ocl_exe, plan, cop), ""]
        if cuda_exe:
            parts += [app_version(402, platform, cuda_exe, "cuda30", "NVIDIA"), ""]
        if musa_exe:
            # BOINC cannot see Moore Threads GPUs: a CPU task that uses the card itself
            parts += [app_version(403, platform, musa_exe, "musa"), ""]
    parts += ["</app_info>", ""]
    return "\n".join(parts)


def readme(sysd, name, gpu, cuda, musa, extra):
    mac = sysd.get("mac")
    files = "program file(s), app_info.xml" + (", app_config.xml" if gpu else "")
    if musa:
        files = "all files in this folder"
    if sysd.get("android"):
        stop = ["2. Stop the BOINC client (BOINC app: menu -> Shut down BOINC, or stop it from a root shell)."]
    elif mac:
        stop = ["2. Quit BOINC (BOINC Manager -> BOINC Manager -> Quit, and stop the client)."]
    elif sysd["windows"]:
        stop = ["2. Exit BOINC (BOINC Manager -> File -> Exit, 'stop running tasks')."]
    else:
        stop = ["2. Stop BOINC:  sudo systemctl stop boinc-client"]
    lines = [
        "Passiflora v%s - GetDecics (NumberFields@home) optimized app - %s, %s" % (VER, sysd["system"], name),
        "=" * 70, "",
        "This folder contains the program file(s) and app_info.xml" + (" and app_config.xml." if gpu else "."),
        "Full instructions: INSTALL.txt on the release page, or https://github.com/alplix/passiflora", "",
        "1. In BOINC Manager set NumberFields@home to 'No new tasks' and let the tasks you",
        "   already have finish (or abort them) - tasks of the stock app cannot continue once",
        "   app_info.xml is in place.",
    ] + stop + [
        "3. Copy everything in this folder (%s) into:" % files, "   " + sysd["datadir"],
    ]
    if sysd.get("android"):
        lines += ["   Android only lets the BOINC client read this folder with root access (or when BOINC runs in Termux, with",
                  "   that client's own projects folder).  Make the program file executable:  chmod 755 <the program file>"]
    elif not sysd["windows"]:
        lines += ["   then:  sudo chown -R boinc:boinc <the copied files>  &&  sudo chmod +x <the program files>"
                  if not mac else
                  "   then:  sudo chown -R boinc_master:boinc_master <the copied files>  &&  sudo chmod +x <the program files>",
                  ]
    if mac:
        lines += ["   If macOS refuses to open the program (it came from a download), clear the mark:",
                  "     sudo xattr -dr com.apple.quarantine <the copied files>"]
    lines += ["4. Start BOINC again and allow new tasks.", ""]
    if musa:
        lines += ["MUSA: for Moore Threads graphics cards (needs the Moore Threads driver). The program is a normal",
                  "CPU task that uses the card by itself; libnf_musa.so and libmusart.so.4 must stay next to it.",
                  "On a computer without such a card it simply runs on the CPU.", ""]
    elif cuda:
        lines += ["GPU: needs an NVIDIA graphics card with double-precision support and the NVIDIA driver",
                  "(no CUDA toolkit needed). app_config.xml runs 4 tasks per card (see the comments in it).", ""]
    elif gpu:
        lines += ["GPU: needs a graphics card with double-precision OpenCL (NVIDIA, AMD, Intel) and a",
                  "driver that provides OpenCL. app_config.xml runs 4 tasks per card (see the comments in it).", ""]
    lines += ["To go back to the stock app: stop BOINC, delete app_info.xml%s and the" % (", app_config.xml" if gpu else ""),
              "Passiflora program files from that folder, start BOINC.", "",
              "Licence: GPL-2.0-or-later. Source: https://github.com/alplix/passiflora", ""]
    return "\n".join(lines)


def read(p):
    with open(p, "rb") as f:
        return f.read()


def add_zip(zf, folder, name, data):
    zi = zipfile.ZipInfo(folder + "/" + name, date_time=time.localtime(NOW)[:6])
    zi.external_attr = 0o755 << 16
    zi.compress_type = zipfile.ZIP_DEFLATED
    zf.writestr(zi, data)


def add_tar(tf, folder, name, data, mode):
    ti = tarfile.TarInfo(folder + "/" + name)
    ti.size = len(data)
    ti.mode = mode
    ti.mtime = NOW
    ti.uname = ti.gname = "root"
    tf.addfile(ti, io.BytesIO(data))


def crlf(s):
    return s.replace("\n", "\r\n").encode()


def env_path(key):
    p = os.environ.get("PASSIFLORA_" + key)
    return p if p and os.path.exists(p) else None


def main():
    os.makedirs(DIST, exist_ok=True)
    out = []
    for sysd in SYSTEMS:
        key = sysd["key"]
        src = {"cpu": env_path(key + "_CPU"), "ocl": env_path(key + "_GPU"), "cuda": env_path(key + "_CUDA"),
               "musa": env_path(key + "_MUSA")}
        names = {"cpu": sysd["exe"] % ("", VER), "ocl": sysd["exe"] % ("gpu_", VER),
                 "cuda": sysd["exe"] % ("cuda_", VER), "musa": sysd["exe"] % ("musa_", VER)}
        windows = sysd["windows"]
        for prefix in sysd["kinds"]:
            cpu, ocl, cuda, musa = KINDS[prefix]
            need = [k for k, w in (("cpu", cpu), ("ocl", ocl), ("cuda", cuda), ("musa", musa)) if w]
            if any(not src[k] for k in need):
                continue
            folder = "run_passiflora_%s_%s" % (sysd["osname"], prefix.lower())
            name = "%s_%s_run_passiflora_%s.%s" % (prefix, V3, sysd["osname"], "zip" if windows else "tar.gz")
            files = []
            extra = []
            for k in need:
                if k == "musa":
                    d = src["musa"]
                    files.append((names["musa"], read(os.path.join(d, "GetDecics_musa")), 0o755))
                    for lib in ("libnf_musa.so", "libmusart.so.4"):
                        files.append((lib, read(os.path.join(d, lib)), 0o755))
                    extra = []
                else:
                    files.append((names[k], read(src[k]), 0o755))
            info = app_info(sysd["platforms"], names["cpu"] if cpu else None, names["ocl"] if ocl else None,
                            names["cuda"] if cuda else None, names["musa"] if musa else None, extra)
            files.append(("app_info.xml", crlf(info) if windows else info.encode(), 0o644))
            gpu = ocl or cuda or musa
            if ocl or cuda:
                files.append(("app_config.xml", crlf(APP_CONFIG) if windows else APP_CONFIG.encode(), 0o644))
            rd = readme(sysd, prefix, ocl or cuda, cuda, musa, extra)
            files.append(("README.txt", crlf(rd) if windows else rd.encode(), 0o644))
            files.append(("LICENSE.txt", read(os.path.join(ROOT, "LICENSE")), 0o644))
            if windows:
                with zipfile.ZipFile(os.path.join(DIST, name), "w") as zf:
                    for n, d, m in files:
                        add_zip(zf, folder, n, d)
            else:
                with tarfile.open(os.path.join(DIST, name), "w:gz") as tf:
                    for n, d, m in files:
                        add_tar(tf, folder, n, d, m)
            out.append(name)

    with open(os.path.join(DIST, "SHA256SUMS"), "w", newline="\n") as f:
        for n in sorted(x for x in os.listdir(DIST) if "_%s_run_passiflora_" % V3 in x):   # all packages of this version
            f.write("%s  %s\n" % (hashlib.sha256(read(os.path.join(DIST, n))).hexdigest(), n))
    print("\n".join(sorted(out)))


if __name__ == "__main__":
    main()
