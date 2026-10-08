param([string]$wu, [string]$tag = 'g', [string]$envs = '')
$b='C:\Users\Alp\AppData\Local\Temp\nfw'
$df='C:\Users\Alp\AppData\Local\Temp\claude\C--Users-Alp-Documents-Default-Project\ac77d448-3f34-4416-ac54-fafab05b597e\scratchpad\src\Test\dataFiles'
$d="$b\gpurun_$tag`_$wu"
Remove-Item -Recurse -Force $d -ErrorAction SilentlyContinue
New-Item -ItemType Directory $d | Out-Null
Copy-Item "$b\gpu\init_data.xml" "$d\init_data.xml"
Copy-Item "$df\$wu.dat" "$d\in"
Set-Location $d
foreach ($kv in ($envs -split ';' | Where-Object { $_ })) { $k,$v = $kv -split '=',2; Set-Item -Path "Env:$k" -Value $v }
$t = Measure-Command { & "$b\bin\GetDecics_gpu.exe" | Out-Null }
foreach ($kv in ($envs -split ';' | Where-Object { $_ })) { $k = ($kv -split '=',2)[0]; Remove-Item "Env:$k" }
$o = Get-Content out -ErrorAction SilentlyContinue | Where-Object { $_ -notmatch 'Elapsed Time' }
$tr = Get-Content "$df\wu_$wu.out.truth" | Where-Object { $_ -notmatch 'Elapsed Time' }
$r = if ($o -and ((Compare-Object $o $tr) -eq $null)) { 'MATCH' } else { 'DIFF' }
"$tag $wu $r wall=$([math]::Round($t.TotalSeconds,1)) s"
Get-Content stderr.txt | Select-String -Pattern 'GPU mode|MISMATCH|rror|NF_TIMING|OpenCL' | Select-Object -First 6 | ForEach-Object { "   $_" }
