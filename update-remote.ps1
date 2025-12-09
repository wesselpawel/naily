# Script to update Git remote origin
# This will change the remote to your new GitHub repository

Write-Host "=== Update Git Remote Origin ===" -ForegroundColor Cyan
Write-Host ""

# Get current remote
$currentRemote = git remote get-url origin 2>$null
if ($currentRemote) {
    Write-Host "Current remote: $currentRemote" -ForegroundColor Yellow
    Write-Host ""
}

# Get new remote details
$username = Read-Host "Enter your GitHub username"
$repoName = Read-Host "Enter repository name (or press Enter for 'naily')"

if ([string]::IsNullOrWhiteSpace($repoName)) {
    $repoName = "naily"
}

$newRemote = "https://github.com/$username/$repoName.git"

Write-Host ""
Write-Host "Updating remote to: $newRemote" -ForegroundColor Green

# Remove old remote
git remote remove origin 2>$null

# Add new remote
git remote add origin $newRemote

# Verify
Write-Host ""
Write-Host "Remote updated successfully!" -ForegroundColor Green
Write-Host "New remote: $(git remote get-url origin)" -ForegroundColor Cyan

Write-Host ""
Write-Host "You can now push with:" -ForegroundColor Yellow
Write-Host "git push -u origin main" -ForegroundColor White
