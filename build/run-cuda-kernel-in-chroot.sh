J=/root/jammy
mountpoint -q $J/proc || mount -t proc proc $J/proc
mountpoint -q $J/dev || mount --bind /dev $J/dev
mkdir -p $J/mnt/cuda12 && (mountpoint -q $J/mnt/cuda12 || mount --bind /root/cuda12 $J/mnt/cuda12)
rm -rf $J/pk/cuda && mkdir -p $J/pk/cuda && cp /mnt/c/Users/Alp/Documents/passiflora/src/* $J/pk/cuda/
cp /mnt/c/Users/Alp/Documents/passiflora/build/build-cuda-kernel.sh $J/pk/cuda/
chroot $J /bin/bash -c 'cd /pk/cuda && NVCC=/mnt/cuda12/linux/bin/nvcc SRC=/pk/cuda bash build-cuda-kernel.sh 2>&1 | tail -15; ls -la nf_cuda.fatbin nf_cuda_fatbin.h; /mnt/cuda12/linux/bin/cuobjdump --list-elf nf_cuda.fatbin | head -20'
cp $J/pk/cuda/nf_cuda.fatbin $J/pk/cuda/nf_cuda_fatbin.h /root/nf/ 2>/dev/null; ls -la /root/nf/nf_cuda_fatbin.h
