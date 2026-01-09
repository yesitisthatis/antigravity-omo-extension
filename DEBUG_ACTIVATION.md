# Extension Activation Debugging Guide

## 🔴 Current Issue: Extension Not Activating

**Symptoms:**
- Extension installed: ✅ (`antigravity-omo.antigravity-omo`)
- Commands not found: ❌ (`'omo.showStatus' not found`)
- Antigravity restarted: ✅ Still not working

**Root Cause:** Extension is installed but not activating on startup

---

## 🔍 Debugging Steps

### Step 1: Check Developer Console for Errors

**Open Developer Tools:**
1. In Antigravity: `Help` → `Toggle Developer Tools`
2. Go to `Console` tab
3. Look for activation errors or warnings

**What to look for:**
- Red error messages containing "antigravity-omo" or "extension"
- Messages like "Failed to activate extension"
- JavaScript errors during startup

**Screenshot the console and share if you see errors!**

---

### Step 2: Check Extension Output Channel

**Open Output Panel:**
1. `View` → `Output` (or Ctrl+Shift+U)
2. In the dropdown (top-right), select: "antigravity-omo" or "Extensions"
3. Look for activation logs or errors

---

### Step 3: Verify Extension Installation Location

The extension might be installed but Antigravity can't find it. Let's check:

```bash
# Check where Antigravity extensions are stored
ls -la ~/.vscode/extensions/ | grep antigravity-omo
# Or
ls -la ~/.vscode-server/extensions/ | grep antigravity-omo
# Or (if using snap)
ls -la ~/snap/code/common/.vscode/extensions/ | grep antigravity-omo
```

---

### Step 4: Try Manual Activation (Workaround)

If the extension isn't auto-activating, try triggering it manually:

**Rebuild and reinstall:**
```bash
cd /home/frappe/antigravity-omo-extension

# Rebuild the extension
npm run build

# Uninstall old version
antigravity --uninstall-extension antigravity-omo.antigravity-omo

# Reinstall
antigravity --install-extension antigravity-omo-0.1.0.vsix

# Restart Antigravity
antigravity .
```

---

### Step 5: Check for Activation Event Issues

The extension uses `onStartupFinished` activation event. Let's try a more immediate activation:

**Temporarily change activation to wildcard (for testing):**

Edit `package.json`:
```json
"activationEvents": [
  "*"
],
```

Then rebuild and reinstall:
```bash
npm run build
npx @vscode/vsce package --allow-missing-repository
antigravity --uninstall-extension antigravity-omo.antigravity-omo
antigravity --install-extension antigravity-omo-0.1.0.vsix
```

This will activate the extension immediately when Antigravity starts.

---

## 🐛 Common Issues & Fixes

### Issue 1: Extension ID Mismatch
**Check:** Extension ID should be `antigravity-omo.antigravity-omo`
```bash
antigravity --list-extensions | grep omo
```

### Issue 2: Build Errors
**Fix:** Rebuild the extension
```bash
cd /home/frappe/antigravity-omo-extension
npm run build
# Check for errors in output
```

### Issue 3: VSCode API Compatibility
**Check:** Ensure VSCode engine version matches
```bash
cat package.json | grep '"vscode"'
# Should show: "vscode": "^1.85.0"
```

### Issue 4: Corrupted .vsix Package
**Fix:** Repackage the extension
```bash
cd /home/frappe/antigravity-omo-extension
rm -f antigravity-omo-0.1.0.vsix
npx @vscode/vsce package --allow-missing-repository
antigravity --install-extension antigravity-omo-0.1.0.vsix
```

---

## 🎯 Quick Fix (Most Likely Solution)

The most common issue is that the activation event isn't triggering. Let's test with wildcard activation:

**Run these commands:**
```bash
cd /home/frappe/antigravity-omo-extension

# 1. Update package.json activation to wildcard
sed -i 's/"onStartupFinished"/"*"/' package.json

# 2. Rebuild
npm run build

# 3. Repackage
npx @vscode/vsce package --allow-missing-repository --no-yarn

# 4. Uninstall old
antigravity --uninstall-extension antigravity-omo.antigravity-omo

# 5. Install new
antigravity --install-extension antigravity-omo-0.1.0.vsix

# 6. Restart Antigravity
echo "Now restart Antigravity and try the commands!"
```

---

## ✅ Success Indicators

After fixing, you should see:
- ✅ Status bar: `🆓 OmO | 4 agents | 0 mem` (bottom-right)
- ✅ Commands work: `Ctrl+Shift+P → OmO: Show Status`
- ✅ Console shows: `🚀 Oh My OpenCode for Antigravity is activating...`

---

## 📸 What I Need From You

Please share screenshots of:
1. **Developer Console** (Help → Toggle Developer Tools → Console)
   - Any errors in red
   - Search for "antigravity-omo" or "extension"

2. **Output Panel** (View → Output → Select "Extensions")
   - Any activation messages

This will help me identify the exact issue!

---

**Status:** Debugging in progress  
**Next:** Try the Quick Fix commands above or share console screenshots
