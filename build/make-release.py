# SPDX-License-Identifier: GPL-2.0-or-later
# Copyright (C) 2026 Alperen Yavuz
#
# Builds the release packages in dist/ from the four executables.  Three packages per system:
#   CPU_      the CPU app only
#   GPU_      the OpenCL GPU app only
#   CPU-GPU_  both in one package
# Set PASSIFLORA_WIN_CPU, PASSIFLORA_WIN_GPU, PASSIFLORA_LIN_CPU, PASSIFLORA_LIN_GPU to the executables.

import hashlib, io, os, sys, tarfile, time, zipfile

VER = "0.1.0"
V3 = "010"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(ROOT, "dist")
SRC = {
    "win_cpu": os.environ.get("PASSIFLORA_WIN_CPU"),
    "win_gpu": os.environ.get("PASSIFLORA_WIN_GPU"),
    "lin_cpu": os.environ.get("PASSIFLORA_LIN_CPU"),
    "lin_gpu": os.environ.get("PASSIFLORA_LIN_GPU"),
}

APP = "GetDecics"
NOW = int(time.time()) - 60

KINDS = (("CPU", True, False), ("GPU", False, True), ("CPU-GPU", True, True))

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
    s += ["    <file_ref>", "      <file_name>%s</file_name>" % exe, "      <main_program/>", "    </file_ref>",
          "  </app_version>"]
    return "\n".join(s)


def app_info(platform, cpu_exe, gpu_exe):
    parts = ["<app_info>", "  <app>", "    <name>%s</name>" % APP,
             "    <user_friendly_name>Get Decic Fields</user_friendly_name>", "  </app>", ""]
    for e in (cpu_exe, gpu_exe):
        if e:
            parts += ["  <file_info>", "    <name>%s</name>" % e, "    <executable/>", "  </file_info>"]
    parts.append("")
    if cpu_exe:
        parts.append(app_version(400, platform, cpu_exe))
    if gpu_exe:
        for plan, cop in (("opencl_nvidia", "NVIDIA"), ("opencl_amd", "ATI"), ("opencl_intel_gpu", "intel_gpu")):
            parts += ["", app_version(402, platform, gpu_exe, plan, cop)]
    parts += ["</app_info>", ""]
    return "\n".join(parts)


def readme(system, name, windows, cpu, gpu):
    pd = (r"C:\ProgramData\BOINC\projects\numberfields.asu.edu_NumberFields" if windows
          else "/var/lib/boinc-client/projects/numberfields.asu.edu_NumberFields")
    files = "program file(s), app_info.xml" + (", app_config.xml" if gpu else "")
    lines = [
        "Passiflora v%s - GetDecics (NumberFields@home) optimized app - %s, %s" % (VER, system, name),
        "=" * 70, "",
        "This folder contains the program file(s) and app_info.xml" + (" and app_config.xml." if gpu else "."),
        "Full instructions: INSTALL.txt on the release page, or https://github.com/alplix/passiflora", "",
        "1. In BOINC Manager set NumberFields@home to 'No new tasks' and let the tasks you",
        "   already have finish (or abort them) - tasks of the stock app cannot continue once",
        "   app_info.xml is in place.",
        "2. Exit BOINC (Windows: BOINC Manager -> File -> Exit, 'stop running tasks';",
        "   Linux: sudo systemctl stop boinc-client).",
        "3. Copy everything in this folder (%s) into:" % files, "   " + pd,
    ]
    if not windows:
        lines += ["   then:  sudo chown boinc:boinc <the copied files>  &&  sudo chmod +x <the program files>"]
    lines += ["4. Start BOINC again and allow new tasks.", ""]
    if gpu:
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


def main():
    os.makedirs(DIST, exist_ok=True)
    for k, v in SRC.items():
        if not v or not os.path.exists(v):
            sys.exit("set PASSIFLORA_%s to the executable" % k.upper())
    out = []

    # ---- Windows
    cpu_exe = "GetDecics_passiflora_%s_windows_x86_64.exe" % VER
    gpu_exe = "GetDecics_passiflora_gpu_%s_windows_x86_64.exe" % VER
    for prefix, cpu, gpu in KINDS:
        folder = "run_passiflora_windows_x86-64_%s" % prefix.lower()
        name = "%s_%s_run_passiflora_windows_x86-64.zip" % (prefix, V3)
        with zipfile.ZipFile(os.path.join(DIST, name), "w") as zf:
            if cpu:
                add_zip(zf, folder, cpu_exe, read(SRC["win_cpu"]))
            if gpu:
                add_zip(zf, folder, gpu_exe, read(SRC["win_gpu"]))
            add_zip(zf, folder, "app_info.xml",
                    crlf(app_info("windows_x86_64", cpu_exe if cpu else None, gpu_exe if gpu else None)))
            if gpu:
                add_zip(zf, folder, "app_config.xml", crlf(APP_CONFIG))
            add_zip(zf, folder, "README.txt", crlf(readme("Windows x86-64", prefix, True, cpu, gpu)))
            add_zip(zf, folder, "LICENSE.txt", read(os.path.join(ROOT, "LICENSE")))
        out.append(name)

    # ---- Linux
    cpu_exe = "GetDecics_passiflora_%s_x86_64-pc-linux-gnu" % VER
    gpu_exe = "GetDecics_passiflora_gpu_%s_x86_64-pc-linux-gnu" % VER
    for prefix, cpu, gpu in KINDS:
        folder = "run_passiflora_linux_x86-64_%s" % prefix.lower()
        name = "%s_%s_run_passiflora_linux_x86-64.tar.gz" % (prefix, V3)
        with tarfile.open(os.path.join(DIST, name), "w:gz") as tf:
            if cpu:
                add_tar(tf, folder, cpu_exe, read(SRC["lin_cpu"]), 0o755)
            if gpu:
                add_tar(tf, folder, gpu_exe, read(SRC["lin_gpu"]), 0o755)
            add_tar(tf, folder, "app_info.xml",
                    app_info("x86_64-pc-linux-gnu", cpu_exe if cpu else None, gpu_exe if gpu else None).encode(), 0o644)
            if gpu:
                add_tar(tf, folder, "app_config.xml", APP_CONFIG.encode(), 0o644)
            add_tar(tf, folder, "README.txt", readme("Linux x86-64", prefix, False, cpu, gpu).encode(), 0o644)
            add_tar(tf, folder, "LICENSE.txt", read(os.path.join(ROOT, "LICENSE")), 0o644)
        out.append(name)

    with open(os.path.join(DIST, "SHA256SUMS"), "w", newline="\n") as f:
        for n in sorted(out):
            f.write("%s  %s\n" % (hashlib.sha256(read(os.path.join(DIST, n))).hexdigest(), n))
    print("\n".join(sorted(out)))


if __name__ == "__main__":
    main()
