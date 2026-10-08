$df='C:\Users\Alp\AppData\Local\Temp\claude\C--Users-Alp-Documents-Default-Project\ac77d448-3f34-4416-ac54-fafab05b597e\scratchpad\src\Test\dataFiles'
$p='C:\Users\Alp\AppData\Local\Temp\nfw\gpurun.ps1'
$ok=0; $bad=0
Get-ChildItem "$df\*DS*_Grp*.dat" | ForEach-Object {
  $wu = $_.BaseName
  $r = powershell -ExecutionPolicy Bypass -File $p $wu s | Select-Object -First 1
  $r
  if ($r -match ' MATCH ') { $ok++ } else { $bad++ }
}
"GPU SUITE: MATCH $ok  DIFF $bad"
