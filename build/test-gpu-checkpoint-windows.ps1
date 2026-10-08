$b='C:\Users\Alp\AppData\Local\Temp\nfw'
$df='C:\Users\Alp\AppData\Local\Temp\claude\C--Users-Alp-Documents-Default-Project\ac77d448-3f34-4416-ac54-fafab05b597e\scratchpad\src\Test\dataFiles'
$wu='sf5_DS-16x12_Grp64300of1600000'
$d="$b\gpuckpt"
Remove-Item -Recurse -Force $d -ErrorAction SilentlyContinue
New-Item -ItemType Directory $d | Out-Null
(Get-Content "$b\gpu\init_data.xml") -replace '<checkpoint_period>60</checkpoint_period>','<checkpoint_period>2</checkpoint_period>' -replace '<app_name>GetDecics</app_name>','<app_name>GetDecics</app_name><wu_name>ckpt_gpu_wu</wu_name>' | Set-Content "$d\init_data.xml"
Copy-Item "$df\$wu.dat" "$d\in"
Set-Location $d
foreach ($wait in 12, 12) {
  $p = Start-Process -FilePath "$b\bin\GetDecics_gpu.exe" -PassThru -NoNewWindow -RedirectStandardOutput "$d\stdout.txt"
  Start-Sleep -Seconds $wait
  Stop-Process -Id $p.Id -Force
  Start-Sleep -Milliseconds 500
  Remove-Item "$d\boinc_lockfile" -ErrorAction SilentlyContinue
  "killed after $wait s; checkpoint = " + ((Get-Content "$d\ckpt_gpu_wu_checkpoint" -ErrorAction SilentlyContinue) -join ' ')
}
& "$b\bin\GetDecics_gpu.exe" | Out-Null
$o = Get-Content out | Where-Object { $_ -notmatch 'Elapsed Time' }
$tr = Get-Content "$df\wu_$wu.out.truth" | Where-Object { $_ -notmatch 'Elapsed Time' }
if ((Compare-Object $o $tr) -eq $null) { 'RESUME MATCH' } else { 'RESUME DIFF'; Compare-Object $o $tr }
(Select-String -Path stderr.txt -Pattern 'Reading checkpoint').Count
