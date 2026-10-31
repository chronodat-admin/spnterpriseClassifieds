# Build the Enterprise Classifieds 365 Teams app package.
# Output:
# - teams/TeamsSPFxApp.zip, embedded by the SPFx package for App Catalog Sync to Teams
# - sharepoint/solution/TeamsSPFxApp.zip, a convenient copy for direct Teams upload

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptDir
$teamsDir = Join-Path $repoRoot "teams"
$distDir = Join-Path $repoRoot "temp\teams-dist"
$zipPath = Join-Path $distDir "enterprise-classifieds-365-teams.zip"
$embeddedTeamsZipPath = Join-Path $teamsDir "TeamsSPFxApp.zip"
$syncToTeamsZipPath = Join-Path $repoRoot "sharepoint\solution\TeamsSPFxApp.zip"
$sourceManifest = Join-Path $teamsDir "manifest.json"
$resolvedManifest = Join-Path $distDir "manifest.json"

function Write-Utf8NoBom {
    param([string]$Path, [string]$Value)
    $encoding = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($Path, $Value, $encoding)
}

function Assert-StoreNeutralManifest {
    param([string]$Content, [string]$Name)
    $forbiddenPatterns = @(
        'contoso\.sharepoint\.com',
        '/sites/dev',
        'SitePages/'
    )
    foreach ($pattern in $forbiddenPatterns) {
        if ($Content -match $pattern) {
            Write-Error "$Name contains a site-specific value matching '$pattern'."
        }
    }
}

Write-Host "Enterprise Classifieds 365 Teams package builder" -ForegroundColor Cyan

$requiredFiles = @(
    @{ Name = "color.png"; Path = Join-Path $teamsDir "color.png" },
    @{ Name = "outline.png"; Path = Join-Path $teamsDir "outline.png" }
)

$filesToZip = @()
foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file.Path)) {
        Write-Error "Missing required Teams icon: $($file.Name)."
    }
    $filesToZip += $file.Path
    Write-Host "  [OK] $($file.Name)" -ForegroundColor Green
}

if (-not (Test-Path $distDir)) {
    New-Item -ItemType Directory -Path $distDir -Force | Out-Null
}

if (-not (Test-Path $sourceManifest)) {
    Write-Error "manifest.json not found in $teamsDir"
}

$manifestContent = Get-Content $sourceManifest -Raw -Encoding UTF8
Assert-StoreNeutralManifest -Content $manifestContent -Name "teams/manifest.json"
if ($manifestContent -notmatch '01edb3d7-481b-4569-9530-e0a9922f3a3d') {
    Write-Error "Teams manifest id must match the SharePoint solution id."
}
if ($manifestContent -notmatch '11ba5f14-f00a-4922-94bc-94155bf58a16') {
    Write-Error "Teams manifest must point at the Enterprise Classifieds 365 web part id."
}
Write-Utf8NoBom -Path $resolvedManifest -Value $manifestContent
Write-Host "  [OK] manifest.json" -ForegroundColor Green

$filesToZip = @($resolvedManifest) + $filesToZip

if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
Compress-Archive -Path $filesToZip -DestinationPath $zipPath -Force
if (-not (Test-Path (Split-Path $syncToTeamsZipPath))) {
    New-Item -ItemType Directory -Path (Split-Path $syncToTeamsZipPath) -Force | Out-Null
}
Copy-Item -Path $zipPath -Destination $embeddedTeamsZipPath -Force
Copy-Item -Path $zipPath -Destination $syncToTeamsZipPath -Force

$assetRoots = @(
    (Join-Path $repoRoot "release"),
    (Join-Path $repoRoot "temp"),
    (Join-Path $repoRoot "dist")
)
foreach ($root in $assetRoots) {
    if (Test-Path $root) {
        Get-ChildItem -Path $root -Recurse -Filter "*.LICENSE.txt" -ErrorAction SilentlyContinue |
            Remove-Item -Force -ErrorAction SilentlyContinue
    }
}

Write-Host ""
Write-Host "Created: $zipPath" -ForegroundColor Green
Write-Host "Created: $embeddedTeamsZipPath for App Catalog Sync to Teams" -ForegroundColor Green
Write-Host "Created: $syncToTeamsZipPath for SharePoint Sync to Teams" -ForegroundColor Green
