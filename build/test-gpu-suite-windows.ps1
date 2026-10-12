param([string]$exe, [string]$tag)
$b='C:\Users\Alp\AppData\Local\Temp\nfw'
$df='C:\Users\Alp\AppData\Local\Temp\claude\C--Users-Alp-Documents-Default-Project\ac77d448-3f34-4416-ac54-fafab05b597e\scratchpad\src\Test\dataFiles'
$ok=0; $bad=0; $tot=0.0
Get-ChildItem "$df\*DS*_Grp*.dat" | ForEach-Object {
  $wu = $_.BaseName
  $d="$b\suite2_$tag`_$wu"; Remove-Item -Recurse -Force $d -ErrorAction SilentlyContinue; New-Item -ItemType Directory $d | Out-Null
  Copy-Item "$b\gpu\init_data.xml" "$d\init_data.xml"; Copy-Item "$df\$wu.dat" "$d\in"
  $t0 = Get-Date
  $p = Start-Process -FilePath "$b\bin\$exe" -WorkingDirectory $d -PassThru -Wait -NoNewWindow
  $s = ((Get-Date) - $t0).TotalSeconds; $tot += $s
  $o = Get-Content "$d\out" -ErrorAction SilentlyContinue | Where-Object { $_ -notmatch 'Elapsed Time' }
  $tr = Get-Content "$df\wu_$wu.out.truth" | Where-Object { $_ -notmatch 'Elapsed Time' }
  $r = if ($o -and ((Compare-Object $o $tr) -eq $null) -and $p.ExitCode -eq 0) { 'MATCH' } else { 'DIFF' }
  if ($r -eq 'MATCH') { $ok++ } else { $bad++ }
  "$tag $wu $r exit=$($p.ExitCode) wall=$([math]::Round($s,1)) s"
}
"SUITE $tag : MATCH $ok  DIFF $bad  total $([math]::Round($tot,0)) s"
