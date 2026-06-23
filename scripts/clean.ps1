# clean.ps1 — Script de limpieza de artefactos regenerables de AVHOS
# Uso: powershell -ExecutionPolicy Bypass -File scripts\clean.ps1
# O: pnpm clean (si se añade al package.json)

param(
  [switch]$Deep,   # Limpia también node_modules y cachés globales
  [switch]$DryRun  # Solo muestra qué borraría, sin borrar
)

$root = Split-Path -Parent $PSScriptRoot
$targets = @(
  "apps\desktop\src-tauri\target",
  "apps\desktop\dist",
  "node_modules",
  "apps\desktop\node_modules"
)

$totalFreed = 0

foreach ($t in $targets) {
  $fullPath = Join-Path $root $t
  if (Test-Path $fullPath) {
    $size = (Get-ChildItem $fullPath -Recurse -File -EA SilentlyContinue | Measure-Object Length -Sum).Sum
    $sizeMB = [math]::Round($size/1MB, 1)
    if ($DryRun) {
      Write-Output "[DRY-RUN] Se borraría: $t ($sizeMB MB)"
    } else {
      Remove-Item $fullPath -Recurse -Force -EA SilentlyContinue
      Write-Output "Borrado: $t ($sizeMB MB liberados)"
    }
    $totalFreed += $size
  } else {
    Write-Output "Omitido (no existe): $t"
  }
}

if ($Deep) {
  $caches = @(
    @{ Path = "$env:LOCALAPPDATA\pnpm\store"; Name = "pnpm-store global" },
    @{ Path = "$env:USERPROFILE\.cargo\registry"; Name = "Cargo registry" }
  )
  foreach ($c in $caches) {
    if (Test-Path $c.Path) {
      $size = (Get-ChildItem $c.Path -Recurse -File -EA SilentlyContinue | Measure-Object Length -Sum).Sum
      $sizeMB = [math]::Round($size/1MB, 1)
      if ($DryRun) {
        Write-Output "[DRY-RUN] Se borraría: $($c.Name) ($sizeMB MB)"
      } else {
        Remove-Item $c.Path -Recurse -Force -EA SilentlyContinue
        Write-Output "Borrado: $($c.Name) ($sizeMB MB liberados)"
      }
      $totalFreed += $size
    }
  }
}

$totalMB = [math]::Round($totalFreed/1MB, 1)
$totalGB = [math]::Round($totalFreed/1GB, 2)
Write-Output ""
Write-Output "Total liberado: $totalMB MB ($totalGB GB)"

if (-not $DryRun) {
  Write-Output ""
  Write-Output "Para reconstruir:"
  Write-Output "  pnpm install"
  Write-Output "  pnpm --filter @avhos/desktop tauri dev  # recompila Rust"
}
