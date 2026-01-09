# 🔐 OmO - Gemini Pro Setup Guide

## How to Configure Gemini API Key for Pro Tier

### Step 1: Get Your Gemini API Key

1. **Go to Google AI Studio:**
   - Visit: https://aistudio.google.com/app/apikey
   - Sign in with your Google account

2. **Create API Key:**
   - Click "Create API Key"
   - Choose your Google Cloud project (or create a new one)
   - Copy the API key

---

### Step 2: Add API Key to OmO Settings

**Option A: Using Settings UI (Recommended)**
```
1. Press Ctrl+, (Settings)
2. Search for "omo"
3. Find "Omo: Api Keys: Gemini"
4. Paste your API key
5. Reload Antigravity window
```

**Option B: Using settings.json**
```
1. Ctrl+Shift+P → "Preferences: Open User Settings (JSON)"
2. Add this line:
   "omo.apiKeys.gemini": "YOUR_API_KEY_HERE"
3. Save file
4. Reload Antigravity window
```

---

### Step 3: Enable Oracle Agent

After adding the API key:

```
1. Settings (Ctrl+,)
2. Search "omo agents oracle"
3. Check the box for "Omo: Agents: Oracle: Enabled"
4. Reload window
```

---

### Step 4: Verify It Works

**Check Console:**
```
Developer Tools (Ctrl+Shift+I) → Console

Expected output:
✓ Initialized agent: Oracle (google/gemini-pro)
✓ Registered agent: Oracle
✓ Registered agents: 3
```

**Check Status Bar:**
```
Bottom-right should show:
🆓 OmO | 3 agents | 0 mem
```

**Test Oracle:**
```
Ctrl+Shift+P → "OmO: Show Status"

Should list:
- Sisyphus
- Oracle ← NEW!
- Explore
```

---

### 🎯 Available Gemini Models:

**Free Tier (Flash):**
- `google/gemini-flash` - Fast, efficient (used by Sisyphus)

**Pro Tier (Pro):**
- `google/gemini-pro` - Advanced reasoning (Oracle uses this)
- Requires API key
- Better for debugging, architecture analysis

---

### 🔧 Settings Available:

**API Keys:**
- `omo.apiKeys.gemini` - Your Gemini API key

**Agents:**
- `omo.agents.sisyphus.enabled` - Core orchestrator ✓
- `omo.agents.oracle.enabled` - Pro debugging (needs API key)
- `omo.agents.explore.enabled` - Codebase search ✓
- `omo.agents.librarian.enabled` - Documentation ✓

**Features:**
- `omo.supermemory.enabled` - Long-term memory
- `omo.statusBar.enabled` - Status bar display

---

### ⚠️ Important Notes:

**API Key Security:**
- Your API key is stored in VSCode settings
- Never commit settings.json with API keys to Git
- Use workspace settings for shared projects

**Free vs Pro:**
- Without API key: Uses Gemini Flash (free)
- With API key: Unlocks Oracle agent (Gemini Pro)
- Sisyphus always uses Flash (no key needed)

**Rate Limits:**
- Gemini Flash: High free quota
- Gemini Pro: Check your Google Cloud quotas

---

**Quick Access:** `Ctrl+, → Search "omo"`
