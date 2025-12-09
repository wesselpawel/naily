# Quick script to push to new GitHub repo
# Replace YOUR_USERNAME with your actual GitHub username

$username = Read-Host "Enter your GitHub username"
$repoName = Read-Host "Enter repository name (or press Enter for 'naily')"

if ([string]::IsNullOrWhiteSpace($repoName)) {
    $repoName = "naily"
}

Write-Host ""
Write-Host "=== Step 1: Create repository on GitHub ===" -ForegroundColor Cyan
Write-Host "1. Go to: https://github.com/new" -ForegroundColor Yellow
Write-Host "2. Repository name: $repoName" -ForegroundColor Yellow
Write-Host "3. Choose Public or Private" -ForegroundColor Yellow
Write-Host "4. DO NOT check README, .gitignore, or license" -ForegroundColor Red
Write-Host "5. Click 'Create repository'" -ForegroundColor Yellow
Write-Host ""
$continue = Read-Host "Have you created the repository? (y/n)"

if ($continue -ne "y" -and $continue -ne "Y") {
    Write-Host "Please create the repository first!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== Step 2: Configuring Git ===" -ForegroundColor Cyan
git config --global user.name "$username"
$email = Read-Host "Enter your GitHub email (or press Enter for noreply)"
if ([string]::IsNullOrWhiteSpace($email)) {
    $email = "$username@users.noreply.github.com"
}
git config --global user.email "$email"
git config --global credential.helper manager-core

Write-Host ""
Write-Host "=== Step 3: Updating remote ===" -ForegroundColor Cyan
git remote remove origin 2>$null
git remote add origin "https://github.com/$username/$repoName.git"
Write-Host "Remote set to: https://github.com/$username/$repoName.git" -ForegroundColor Green

Write-Host ""
Write-Host "=== Step 4: Committing changes ===" -ForegroundColor Cyan
git add .
$commitMsg = Read-Host "Enter commit message (or press Enter for 'Initial commit')"
if ([string]::IsNullOrWhiteSpace($commitMsg)) {
    $commitMsg = "Initial commit"
}
git commit -m "$commitMsg"
git branch -M main

Write-Host ""
Write-Host "=== Step 5: Pushing to GitHub ===" -ForegroundColor Cyan
Write-Host "When prompted:" -ForegroundColor Yellow
Write-Host "  Username: $username" -ForegroundColor White
Write-Host "  Password: Use your Personal Access Token" -ForegroundColor White
Write-Host ""
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Success! Repository: https://github.com/$username/$repoName" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Push failed. Try pushing to a different branch:" -ForegroundColor Red
    Write-Host "git checkout -b initial-setup" -ForegroundColor Yellow
    Write-Host "git push -u origin initial-setup" -ForegroundColor Yellow
}

