# Testing OmO Extension in Antigravity IDE

## 🚀 Quick Start Guide

Since you're using Antigravity IDE (not standard VSCode), here's how to test the extension:

### Method 1: Debug Mode (Recommended)
```bash
cd /home/frappe/antigravity-omo-extension
antigravity .
# Once Antigravity opens:
# Press F5 to launch Extension Development Host
# A new Antigravity window will open with OmO loaded
```

### Method 2: Install from .vsix
```bash
# In Antigravity, open Extensions panel (Ctrl+Shift+X)
# Click "..." (three dots) → "Install from VSIX..."
# Navigate to: /home/frappe/antigravity-omo-extension/antigravity-omo-0.1.0.vsix
# Click "Install"
# Reload Antigravity
```

---

## ✅ Validation Checklist

### 1. Extension Activation
**Expectation:** Extension activates automatically when Antigravity opens a workspace

**How to Verify:**
1. Open Developer Console: Help → Toggle Developer Tools
2. Look for activation logs:
```
🚀 Oh My OpenCode for Antigravity is activating...
✓ Detected tier: free
✓ Available agents: 5
✓ Active accounts: 0
✓ LSP servers: python, typescript, go (or 'none')
✓ Registered agents: 4
✓ Supermemory: 0 memories
✓ Workflows: 1
✓ MCP servers: 1 enabled
✓ Project: typescript
✓ Status bar: Active
✓ Oh My OpenCode activated successfully!
```

**Result:** ⏳ PENDING

---

### 2. Status Bar
**Expectation:** Status bar item appears in bottom-right corner

**How to Verify:**
1. Look at bottom-right corner of Antigravity window
2. Should see: `🆓 OmO | 4 agents | 0 mem`
3. Click it to open status view

**Result:** ⏳ PENDING

---

### 3. Command Testing
**Expectation:** All 4 commands execute successfully

**How to Test:**
Press `Ctrl+Shift+P` to open Command Palette, then run each command:

**Command 1: OmO: Hello World**
- Expected: Info message popup
- Format: `🆓 OmO is ready! Tier: FREE | Agents: 4 | LSP: X`
- Result: ⏳ PENDING

**Command 2: OmO: Show Configuration**
- Expected: New tab opens with JSON config
- Contains: agent configurations, models, tools
- Result: ⏳ PENDING

**Command 3: OmO: Show Status**
- Expected: New tab opens with markdown status
- Contains: Subscription, Agents, LSP, Accounts, Memory, etc.
- Result: ⏳ PENDING

**Command 4: OmO: Supermemory Init**
- Expected: Two messages:
  1. "Indexing codebase..."
  2. "✓ Indexed X files into Supermemory"
- Result: ⏳ PENDING

---

### 4. Project Detection
**Expectation:** Extension detects project type correctly

**How to Verify:**
1. Open any project in Antigravity
2. Run `OmO: Show Status`
3. Check "Project" line - should show detected type
4. Or check Developer Console activation logs

**Result:** ⏳ PENDING

---

## 🐛 Troubleshooting

### Extension Doesn't Activate
**Check:**
1. Developer Console (Help → Toggle Developer Tools) for errors
2. Extension is installed: Extensions panel (Ctrl+Shift+X)
3. Antigravity version: Must be >= 1.85.0

### Commands Not Showing
**Fix:**
1. Ensure extension activated (check console)
2. Try reloading Antigravity: Ctrl+Shift+P → "Developer: Reload Window"

### LSP Servers Not Starting
**Expected Behavior:**
- Language servers only start if installed:
  - Python: `pyright` must be installed
  - TypeScript: `typescript-language-server` must be installed
  - Go: `gopls` must be installed
- Showing "none" for LSP servers is acceptable if servers aren't installed

### Status Bar Not Visible
**Fix:**
1. Check if status bar is hidden: View → Appearance → Show Status Bar
2. Look in bottom-right corner specifically

---

## 📊 Expected Test Results

### ✅ PASS Criteria:
- [x] Extension activates without errors
- [x] All 4 commands are available in Command Palette
- [x] Commands execute without exceptions
- [x] Status bar displays tier + agent count
- [x] No critical errors in Developer Console

### ⚠️ Acceptable Warnings:
- "Language server not found" (if pyright/typescript-language-server/gopls not installed)
- TypeScript unused variable warnings (tools initialized for future use)
- MCP "simulated result" messages (expected - stubs only)

### ❌ FAIL Criteria:
- Extension fails to activate
- Commands throw exceptions
- Status bar doesn't appear at all
- Critical TypeScript compilation errors

---

## 📝 Test Report Template

**Tester:** _______________  
**Date:** 2026-01-09  
**Antigravity Version:** _______________

### Test Results:
- [ ] Extension activated successfully
- [ ] Status bar visible
- [ ] Command 1 (Hello World) works
- [ ] Command 2 (Show Config) works
- [ ] Command 3 (Show Status) works
- [ ] Command 4 (Supermemory Init) works
- [ ] Project type detected correctly
- [ ] No critical errors in console

### Notes:
_[Add observations, issues, or feedback here]_

---

## 🎯 Next Steps After Testing

### If All Tests Pass ✅
**Extension is production-ready!**

Optional enhancements:
1. Design extension icon (256x256 PNG)
2. Create demo screenshots
3. Record walkthrough video
4. Submit to VSCode/Antigravity Marketplace

### If Issues Found ❌
1. Document the issue in TEST_RESULTS.md
2. Check Developer Console for error details
3. Review relevant source files
4. Fix and rebuild: `npm run build`
5. Retest

---

**Testing Instructions Version:** 1.0  
**Last Updated:** 2026-01-09 13:10 IST  
**Package:** antigravity-omo-0.1.0.vsix (878KB)
