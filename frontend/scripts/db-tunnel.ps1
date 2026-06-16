# SSH-туннель: локальный порт -> Postgres на VPS (127.0.0.1:5432 внутри сервера).
# Окно не закрывать, пока работает npm run dev.
#
# Запуск:
#   .\scripts\db-tunnel.ps1
# или с явным ключом (без ~/.ssh/config):
#   .\scripts\db-tunnel.ps1 -UseExplicitKey
#
# Пользователь SSH по умолчанию root — сменить: -SshUser "ubuntu"

param(
    [string] $VpsHost = $(if ($env:VPS_SSH_HOST) { $env:VPS_SSH_HOST } else { "46.173.26.108" }),
    [string] $SshUser = $(if ($env:VPS_SSH_USER) { $env:VPS_SSH_USER } else { "root" }),
    [string] $SshAlias = $(if ($env:VPS_SSH_ALIAS) { $env:VPS_SSH_ALIAS } else { "carcas-vps" }),
    [string] $SshKey = $(if ($env:SSH_KEY_PATH) { $env:SSH_KEY_PATH } else { Join-Path $env:USERPROFILE ".ssh\carcas_vps_ed25519" }),
    [int] $LocalPort = $(if ($env:DB_TUNNEL_LOCAL_PORT) { [int]$env:DB_TUNNEL_LOCAL_PORT } else { 5433 }),
    [switch] $UseExplicitKey
)

if (-not $VpsHost) {
    Write-Host "Укажите хост VPS: -VpsHost 1.2.3.4 или `$env:VPS_SSH_HOST" -ForegroundColor Red
    exit 1
}

Write-Host "Туннель: 127.0.0.1:$LocalPort -> ${VpsHost}:5432 (внутри VPS к localhost Postgres)" -ForegroundColor Cyan
Write-Host "В .env.local используйте DATABASE_URL с портом $LocalPort (см. .env.example)." -ForegroundColor Yellow
Write-Host "Ctrl+C — остановить туннель.`n" -ForegroundColor DarkGray

$tunnelArgs = @("-N", "-L", "${LocalPort}:127.0.0.1:5432")

if (-not $UseExplicitKey) {
    ssh -G $SshAlias 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) {
        ssh @tunnelArgs $SshAlias
        exit $LASTEXITCODE
    }
}

if (-not (Test-Path -LiteralPath $SshKey)) {
    Write-Host "ERROR: ключ не найден: $SshKey" -ForegroundColor Red
    Write-Host "Добавьте Host carcas-vps в ~/.ssh/config или положите ключ carcas_vps_ed25519" -ForegroundColor Yellow
    exit 1
}

ssh -i $SshKey -o IdentitiesOnly=yes @tunnelArgs "${SshUser}@${VpsHost}"
exit $LASTEXITCODE
