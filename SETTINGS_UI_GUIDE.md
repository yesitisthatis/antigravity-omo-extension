# ⚙️ OmO Settings UI - Complete Guide

## How to Access Settings

```
Press: Ctrl+, (comma)
Search: "omo"
```

---

## 🎛️ Available Settings (After Update)

### 🔑 API Configuration

**`omo.apiKeys.gemini`**
- Google Gemini API Key for Pro agents
- Get from: https://aistudio.google.com/app/apikey
- Required for: Oracle agent
- **Type:** Text input (password-protected)

---

### 🏆 Subscription Tier

**`omo.tier`**
- **Options:** Free | Pro | Enterprise
- **Default:** Free
- Controls which features are available
- **Dropdown selector**

---

### 🤖 Agent Controls

**`omo.agents.sisyphus.enabled`** ✓
- Main orchestrator agent
- **Always ON** (core requirement)
- **Type:** Checkbox

**`omo.agents.oracle.enabled`**
- Strategic debugging agent
- Requires Gemini API key
- **Default:** OFF
- **Type:** Checkbox

**`omo.agents.explore.enabled`** ✓
- Codebase search agent
- **Default:** ON
- **Type:** Checkbox

**`omo.agents.librarian.enabled`** ✓
- Documentation agent
- **Default:** ON
- **Type:** Checkbox

---

### 🧠 Supermemory Settings

**`omo.supermemory.enabled`**
- Enable/disable long-term memory
- **Default:** ON
- **Type:** Checkbox

**`omo.supermemory.privacyTags`**
- Tags to prevent auto-save
- **Default:** private, secret, confidential
- **Type:** Text list (comma-separated)

---

### ⚡ Feature Toggles

**`omo.workflows.enabled`**
- YAML workflow engine
- **Default:** ON
- **Type:** Checkbox

**`omo.lsp.enabled`**
- LSP code intelligence
- **Default:** ON
- **Type:** Checkbox

**`omo.enableBackgroundTasks`**
- Background task execution (Pro)
- **Default:** ON
- **Type:** Checkbox

---

### 📊 Status Bar Settings

**`omo.statusBar.enabled`**
- Show OmO in status bar
- **Default:** ON
- **Type:** Checkbox

**`omo.statusBar.showMemoryCount`**
- Display memory count
- **Default:** ON
- **Type:** Checkbox

---

## 🎨 How the UI Looks

After reinstalling, you'll see in **Settings (Ctrl+,)**:

```
OmO - Oh My OpenCode
├─ 🔑 Api Keys
│   └─ Gemini: [____________] (Get API key...)
├─ 🏆 Tier: [Free ▼] (Free/Pro/Enterprise)
├─ 🤖 Agents
│   ├─ ☑ Sisyphus Enabled (always on)
│   ├─ ☐ Oracle Enabled (needs API key)
│   ├─ ☑ Explore Enabled
│   └─ ☑ Librarian Enabled
├─ 🧠 Supermemory
│   ├─ ☑ Enabled
│   └─ Privacy Tags: [private, secret...]
├─ ⚡ Features
│   ├─ ☑ Workflows Enabled
│   ├─ ☑ LSP Enabled
│   └─ ☑ Background Tasks
└─ 📊 Status Bar
    ├─ ☑ Enabled
    └─ ☑ Show Memory Count
```

---

## 🚀 After Installing:

**1. Reload Antigravity:**
```
Ctrl+Shift+P → "Developer: Reload Window"
```

**2. Open Settings:**
```
Ctrl+, → Search "omo"
```

**3. Configure:**
- Add Gemini API key (optional)
- Enable/disable agents
- Customize features

**4. Reload again to apply changes**

---

**Total Settings: 13 configuration options!**
