# GitHub Repository Setup Guide

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. **Repository name:** `antigravity-omo-extension`
3. **Description:** "Oh My OpenCode for Google Antigravity - Multi-agent AI orchestration with zero config"
4. **Visibility:** Public (or Private if preferred)
5. **DO NOT** initialize with README, License, or .gitignore (we have them already)
6. Click "Create repository"

## Step 2: Push Local Code

```bash
cd /home/frappe/antigravity-omo-extension

# Add GitHub remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/antigravity-omo-extension.git

# or with SSH:
# git remote add origin git@github.com:YOUR_USERNAME/antigravity-omo-extension.git

# Push code
git branch -M main
git push -u origin main
```

## Step 3: Create GitHub Project Board

1. Go to your repo → "Projects" tab
2. Click "New project"
3. Choose "Board" template
4. Name: "OmO Development - 6 Weeks"
5. Click "Create"

## Step 4: Import Issues

### Option A: Manual Import (Recommended for control)

Copy each issue from `/home/frappe/.gemini/antigravity/brain/.../task_board.md`:

1. Go to repo → "Issues" → "New issue"
2. Paste title from task board
3. Add labels (setup, foundation, P0, etc.)
4. Add to project board
5. Repeat for all 66 issues

### Option B: Bulk Import via GitHub CLI

```bash
# Install GitHub CLI if not already
# sudo snap install gh

# Authenticate
gh auth login

# Navigate to project
cd /home/frappe/antigravity-omo-extension

# Create issues (example for first few)
gh issue create --title "Initialize Extension Project" \\
  --body "**Labels:** setup, foundation, P0
  
**Estimate:** 2h

**Tasks:**
- Create project directory
- Initialize npm
- Initialize Git
- Create .gitignore, LICENSE, README

**Acceptance Criteria:**
- Project directory exists
- package.json created
- Git initialized" \\
  --label "setup,foundation,P0"

# Repeat for all issues...
```

### Option C: Use Import Script (Fastest)

I can create a Node.js script to bulk import all 66 issues automatically using GitHub API.

## Step 5: Configure Project Board

1. Create columns:
   - 📋 Backlog
   - 🎯 Week 1
   - 🎯 Week 2
   - 🎯 Week 3
   - 🎯 Week 4
   - 🎯 Week 5
   - 🎯 Week 6
   - 🚧 In Progress
   - ✅ Done

2. Add automation:
   - New issues → Backlog
   - Issues with "Week 1" label → Week 1 column
   - Closed issues → Done

## Step 6: Set Up Labels

Create these labels in repo (Settings → Labels):

**Priority:**
- `P0` (red) - Critical
- `P1` (orange) - High
- `P2` (yellow) - Medium
- `P3` (green) - Nice to have

**Category:**
- `setup` (blue)
- `foundation` (blue)
- `agents` (purple)
- `lsp` (cyan)
- `ast` (cyan)
- `ui` (pink)
- `testing` (gray)
- `docs` (green)

**Special:**
- `NEW` (gold) - New feature from research
- `pro-feature` (purple) - Pro tier only
- `zero-config` (blue) - Auto-configuration

## Step 7: Enable Discussions (Optional)

Settings → Features → Check "Discussions"
- Great for Q&A
- Design discussions
- Announcements

## Next Steps

After GitHub is set up:
1. **Start Week 1, Day 1** (Issue #1)
2. **Update README** with actual repo URL
3. **Enable GitHub Actions** for CI/CD

---

**Want me to create the bulk import script?** I can generate a Node.js script that creates all 66 issues automatically.
