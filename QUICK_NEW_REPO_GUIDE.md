# Quick Guide: Create New GitHub Repo and Push

## Method 1: Using This Script (Easiest)

Run the PowerShell script:
```powershell
.\create-new-repo-and-push.ps1
```

It will guide you through:
1. Creating a new repository
2. Configuring Git
3. Pushing your code

## Method 2: Manual Steps

### Step 1: Create Repository on GitHub

1. Go to: **https://github.com/new**
2. **Repository name:** `naily` (or your preferred name)
3. Choose **Public** or **Private**
4. **IMPORTANT:** Do NOT check:
   - ❌ Add a README file
   - ❌ Add .gitignore
   - ❌ Choose a license
5. Click **"Create repository"**

### Step 2: Configure Git (if not done)

```powershell
# Replace with your actual GitHub username
git config --global user.name "YOUR_GITHUB_USERNAME"
git config --global user.email "YOUR_EMAIL"
git config --global credential.helper manager-core
```

### Step 3: Update Remote and Push

```powershell
# Remove old remote
git remote remove origin

# Add new remote (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Add and commit changes (if any)
git add .
git commit -m "Initial commit"

# Set branch to main
git branch -M main

# Push to new repository
git push -u origin main
```

### Step 4: Authenticate

When prompted:
- **Username:** Your GitHub username
- **Password:** Your Personal Access Token (not your GitHub password)

**To create a token:**
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select `repo` scope
4. Copy the token and use it as password

## Method 3: Using GitHub CLI (If Installed)

```powershell
# Authenticate first
gh auth login

# Create repo and push in one command
gh repo create naily --public --source=. --remote=origin --push
```

## Troubleshooting

### Error: "repository not found"
- Make sure you created the repository on GitHub first
- Check the repository name matches exactly

### Error: "authentication failed"
- Use Personal Access Token, not password
- Or set up SSH keys

### Error: "remote origin already exists"
```powershell
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
```

### Error: "push declined due to repository rule violations"
- Push to a different branch first:
```powershell
git checkout -b initial-setup
git push -u origin initial-setup
```
- Then create Pull Request on GitHub to merge to main

## Quick Copy-Paste (Replace Values)

```powershell
# Set your GitHub username
$username = "YOUR_GITHUB_USERNAME"
$repoName = "naily"

# Configure Git
git config --global user.name "$username"
git config --global user.email "$username@users.noreply.github.com"
git config --global credential.helper manager-core

# Update remote
git remote remove origin
git remote add origin "https://github.com/$username/$repoName.git"

# Commit and push
git add .
git commit -m "Initial commit"
git branch -M main
git push -u origin main
```

