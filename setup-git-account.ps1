# Git GitHub Account Setup Script for Windows
# Run this script in PowerShell

Write-Host "=== Git GitHub Account Setup ===" -ForegroundColor Cyan
Write-Host ""

# Get GitHub username
$username = Read-Host "Enter your GitHub username (from browser)"
$email = Read-Host "Enter your GitHub email (or press Enter to use noreply email)"

# Use noreply email if not provided
if ([string]::IsNullOrWhiteSpace($email)) {
    $email = "$username@users.noreply.github.com"
    Write-Host "Using GitHub noreply email: $email" -ForegroundColor Yellow
}

# Configure Git
Write-Host ""
Write-Host "Configuring Git..." -ForegroundColor Green
git config --global user.name "$username"
git config --global user.email "$email"

# Configure credential helper for Windows
Write-Host "Setting up credential helper..." -ForegroundColor Green
git config --global credential.helper manager-core

# Update remote URL
Write-Host "Updating remote URL..." -ForegroundColor Green
git remote remove origin 2>$null
git remote add origin "https://github.com/$username/naily.git"

# Verify configuration
Write-Host ""
Write-Host "=== Verification ===" -ForegroundColor Cyan
Write-Host "Username: $(git config --global user.name)"
Write-Host "Email: $(git config --global user.email)"
Write-Host "Remote: $(git remote get-url origin)"

Write-Host ""
Write-Host "Setup complete! You can now push to GitHub." -ForegroundColor Green
Write-Host "When prompted, use your GitHub Personal Access Token as password." -ForegroundColor Yellow

