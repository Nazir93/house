# SSH-туннель: локальный порт -> Postgres на VPS (127.0.0.1:5432 внутри сервера).
# Окно не закрывать, пока работает npm run dev.
#
# Запуск:
#   .\scripts\db-tunnel.ps1 -VpsHost "ВАШ_IP_ИЛИ_ДОМЕН"
# или задать переменную:
#   $env:VPS_SSH_HOST = "1.2.3.4"; .\scripts\db-tunnel.ps1
#
# Пользователь SSH по умолчанию root — сменить: -SshUser "ubuntu"

param(
    [string] $VpsHost = $env:VPS_SSH_HOST,
    [string] $SshUser = "root",
    [int] $LocalPort = 5433
)

if (-not $VpsHost) {
    Write-Host "Укажите хост VPS: -VpsHost 1.2.3.4 или `$env:VPS_SSH_HOST" -ForegroundColor Red
    exit 1
}

Write-Host "Туннель: 127.0.0.1:$LocalPort -> ${VpsHost}:5432 (внутри VPS к localhost Postgres)" -ForegroundColor Cyan
Write-Host "В .env.local используйте DATABASE_URL с портом $LocalPort (см. .env.example)." -ForegroundColor Yellow
Write-Host "Ctrl+C — остановить туннель.`n" -ForegroundColor DarkGray

ssh -N -L "${LocalPort}:127.0.0.1:5432" "${SshUser}@${VpsHost}"
