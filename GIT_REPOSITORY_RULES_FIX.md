# Fix: Repository Rule Violations Error

## What the Error Means

```
! [remote rejected] main -> main (push declined due to repository rule violations)
```

This means GitHub has **branch protection rules** or **repository rules** that prevent direct pushes to the `main` branch.

## Common Causes

1. **Branch Protection Rules** - Main branch requires pull requests
2. **Required Status Checks** - CI/CD checks must pass
3. **Required Reviews** - Code must be reviewed before merging
4. **File Size Restrictions** - Files too large
5. **File Type Restrictions** - Certain file types blocked
6. **Path Restrictions** - Certain paths protected

## Solutions

### Solution 1: Push to a Different Branch (Recommended)

Create a new branch, push to it, then create a Pull Request:

```bash
# Create and switch to a new branch
git checkout -b initial-push

# Push to the new branch
git push -u origin initial-push
```

Then on GitHub:
1. Go to your repository
2. You'll see a banner suggesting to create a Pull Request
3. Click "Compare & pull request"
4. Merge the PR to main

### Solution 2: Disable Branch Protection (If You Own the Repo)

1. Go to: `https://github.com/pykrakapykpaka-source/naily/settings/branches`
2. Find the branch protection rule for `main`
3. Click "Edit" or "Delete"
4. Disable the protection temporarily
5. Push again
6. Re-enable protection after

### Solution 3: Force Push (Use with Caution!)

⚠️ **Warning:** Only use if you're sure and own the repository!

```bash
# Force push (overrides protection)
git push -u origin main --force
```

### Solution 4: Check Repository Rules

1. Go to: `https://github.com/pykrakapykpaka-source/naily/settings/rules`
2. Check what rules are blocking you:
   - **Branch protection rules**
   - **Tag protection rules**
   - **File path rules**
   - **File size rules**

## Step-by-Step Fix (Recommended)

### Option A: Push to Feature Branch

```bash
# 1. Create a new branch
git checkout -b initial-setup

# 2. Push to new branch
git push -u origin initial-setup

# 3. On GitHub, create Pull Request and merge
```

### Option B: Temporarily Disable Protection

1. **On GitHub:**
   - Go to: `https://github.com/pykrakapykpaka-source/naily/settings/branches`
   - Click on the rule protecting `main`
   - Click "Edit"
   - Uncheck "Restrict pushes that create files"
   - Uncheck "Require pull request reviews"
   - Save changes

2. **Then push:**
   ```bash
   git push -u origin main
   ```

3. **Re-enable protection after pushing**

## Check What's Blocking You

Run this to see more details:

```bash
git push -u origin main --verbose
```

Or check GitHub:
- Repository Settings → Rules → Branch protection rules
- Repository Settings → Rules → Rulesets

## Quick Fix Commands

```bash
# Create feature branch and push
git checkout -b initial-push
git push -u origin initial-push

# Then merge via GitHub Pull Request
```

## If You Need to Override (Admin Only)

```bash
# Check if you have admin access
git ls-remote origin

# If you're admin, you can temporarily disable protection
# Or use force push (dangerous!)
git push -u origin main --force
```

---

## Most Likely Solution

Since this is a new repository, GitHub probably has default branch protection. Use this:

```bash
# Create a new branch
git checkout -b initial-setup

# Push to new branch
git push -u origin initial-setup
```

Then on GitHub:
1. You'll see a banner: "initial-setup had recent pushes"
2. Click "Compare & pull request"
3. Click "Create pull request"
4. Click "Merge pull request"
5. Your code will be in main!
