# Деплой на production VPS с Windows (PowerShell).
# Эквивалент: ssh -i ~/.ssh/carcas_vps_ed25519 root@46.173.26.108 "bash /var/www/house/scripts/deploy-vps.sh"
# Или короче: ssh carcas-vps "bash /var/www/house/scripts/deploy-vps.sh"

param(
    [string] $VpsHost = $(if ($env:VPS_HOST) { $env:VPS_HOST } else { "46.173.26.108" }),
    [string] $SshUser = $(if ($env:VPS_SSH_USER) { $env:VPS_SSH_USER } else { "root" }),
    [string] $SshAlias = $(if ($env:VPS_SSH_ALIAS) { $env:VPS_SSH_ALIAS } else { "carcas-vps" }),
    [string] $SshKey = $(if ($env:SSH_KEY_PATH) { $env:SSH_KEY_PATH } else { Join-Path $env:USERPROFILE ".ssh\carcas_vps_ed25519" }),
    [string] $HouseRoot = $(if ($env:HOUSE_ROOT) { $env:HOUSE_ROOT } else { "/var/www/house" })
)

$ErrorActionPreference = "Stop"
$deployCmd = "bash $HouseRoot/scripts/deploy-vps.sh"

function Test-SshAlias {
    param([string] $Alias)
    ssh -G $Alias 2>$null | Out-Null
    return $LASTEXITCODE -eq 0
}

Write-Host "==> Deploy on $VpsHost (house-next)" -ForegroundColor Cyan

if (Test-SshAlias $SshAlias) {
    ssh $SshAlias $deployCmd
} elseif (Test-Path -LiteralPath $SshKey) {
    ssh -i $SshKey -o IdentitiesOnly=yes "${SshUser}@${VpsHost}" $deployCmd
} else {
    Write-Host "ERROR: нет SSH alias '$SshAlias' в ~/.ssh/config и ключ не найден: $SshKey" -ForegroundColor Red
    exit 1
}

exit $LASTEXITCODE
