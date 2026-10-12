# SPDX-License-Identifier: GPL-2.0-or-later
# Copyright (C) 2026 Alperen Yavuz
#
# Builds the release packages in dist/ from the executables.  Per system:
#   CPU_             the CPU app only
#   GPU_             the OpenCL GPU app only (NVIDIA, AMD, Intel)
#   CPU-GPU_         CPU + OpenCL in one package
#   GPU-CUDA_        the CUDA GPU app only (NVIDIA)
#   CPU-GPU-CUDA_    CPU + CUDA in one package
# Set PASSIFLORA_<WIN|LIN>_<CPU|GPU|CUDA> to the executables (a package is skipped if one is missing).

import hashlib, io, os, sys, tarfile, time, zipfile

VER = "0.2.0"
V3 = "020"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(ROOT, "dist")

APP = "GetDecics"
NOW = int(time.time()) - 60

# (prefix, cpu, opencl, cuda)
KINDS = (("CPU", True, False, False), ("GPU", False, True, False), ("CPU-GPU", True, True, False),
         ("GPU-CUDA", False, False, True), ("CPU-GPU-CUDA", True, False, True))

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


def app_info(platform, cpu_exe, ocl_exe, cuda_exe):
    parts = ["<app_info>", "  <app>", "    <name>%s</name>" % APP,
             "    <user_friendly_name>Get Decic Fields</user_friendly_name>", "  </app>", ""]
    for e in (cpu_exe, ocl_exe, cuda_exe):
        if e:
            parts += ["  <file_info>", "    <name>%s</name>" % e, "    <executable/>", "  </file_info>"]
    parts.append("")
    if cpu_exe:
        parts.append(app_version(400, platform, cpu_exe))
    if ocl_exe:
        for plan, cop in (("opencl_nvidia", "NVIDIA"), ("opencl_amd", "ATI"), ("opencl_intel_gpu", "intel_gpu")):
            parts += ["", app_version(402, platform, ocl_exe, plan, cop)]
    if cuda_exe:
        parts += ["", app_version(402, platform, cuda_exe, "cuda30", "NVIDIA")]
    parts += ["</app_info>", ""]
    return "\n".join(parts)


def readme(system, name, windows, gpu, cuda):
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
    if cuda:
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


def exe_path(key):
    p = os.environ.get("PASSIFLORA_" + key)
    return p if p and os.path.exists(p) else None


def main():
    os.makedirs(DIST, exist_ok=True)
    out = []
    for osname, key, windows in (("windows_x86-64", "WIN", True), ("linux_x86-64", "LIN", False)):
        src = {"cpu": exe_path(key + "_CPU"), "ocl": exe_path(key + "_GPU"), "cuda": exe_path(key + "_CUDA")}
        if windows:
            names = {"cpu": "GetDecics_passiflora_%s_windows_x86_64.exe" % VER,
                     "ocl": "GetDecics_passiflora_gpu_%s_windows_x86_64.exe" % VER,
                     "cuda": "GetDecics_passiflora_cuda_%s_windows_x86_64.exe" % VER}
            platform, system = "windows_x86_64", "Windows x86-64"
        else:
            names = {"cpu": "GetDecics_passiflora_%s_x86_64-pc-linux-gnu" % VER,
                     "ocl": "GetDecics_passiflora_gpu_%s_x86_64-pc-linux-gnu" % VER,
                     "cuda": "GetDecics_passiflora_cuda_%s_x86_64-pc-linux-gnu" % VER}
            platform, system = "x86_64-pc-linux-gnu", "Linux x86-64"
        for prefix, cpu, ocl, cuda in KINDS:
            need = [k for k, w in (("cpu", cpu), ("ocl", ocl), ("cuda", cuda)) if w]
            if any(not src[k] for k in need):
                continue
            folder = "run_passiflora_%s_%s" % (osname, prefix.lower())
            name = "%s_%s_run_passiflora_%s.%s" % (prefix, V3, osname, "zip" if windows else "tar.gz")
            files = []
            for k in need:
                files.append((names[k], read(src[k]), 0o755))
            info = app_info(platform, names["cpu"] if cpu else None, names["ocl"] if ocl else None,
                            names["cuda"] if cuda else None)
            files.append(("app_info.xml", crlf(info) if windows else info.encode(), 0o644))
            gpu = ocl or cuda
            if gpu:
                files.append(("app_config.xml", crlf(APP_CONFIG) if windows else APP_CONFIG.encode(), 0o644))
            rd = readme(system, prefix, windows, gpu, cuda)
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
        for n in sorted(out):
            f.write("%s  %s\n" % (hashlib.sha256(read(os.path.join(DIST, n))).hexdigest(), n))
    print("\n".join(sorted(out)))


if __name__ == "__main__":
    main()
