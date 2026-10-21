param([int]$Port=8088)
$taskRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $taskRoot
php -S "127.0.0.1:$Port" -t public public/router.php
