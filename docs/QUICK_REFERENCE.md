# 🚀 OmO Quick Reference - Cheat Sheet

## Installation

```bash
cd /home/frappe/antigravity-omo-extension
npm run build
antigravity --install-extension antigravity-omo-0.3.2.vsix --force
```

Then reload: `Ctrl+Shift+P` → "Developer: Reload Window"

---

## Essential Commands

| Command | What It Does |
|---------|--------------|
| `OmO: Show Status` | Check tier, agents, auth status |
| `OmO: Login with Google` | Authenticate & upgrade to Pro |
| `OmO: Show Configuration` | View current settings |
| `OmO: Configure OpenCode Zen` | Set up Zen API key |
| `OmO: List Zen Models` | Show available AI models |

---

## Agent Roster

| Agent | Tier | Purpose | When to Use |
|-------|------|---------|-------------|
| **Sisyphus** 🎯 | Free | Orchestrator | Always active, delegates tasks |
| **Explore** 🔍 | Free | Code Search | "Find where X is defined" |
| **Librarian** 📚 | Free | Documentation | "Document this function" |
| **Oracle** 🧙 | Pro | Debugging | "Why is this crashing?" |
| **Frontend** 💅 | Pro | UI/UX | "Create a responsive navbar" |

---

## Quick Settings

```json
{
  // Authentication (choose one)
  "omo.auth.useAntigravityOAuth": true,  // Auto-detect Pro tier
  "omo.apiKeys.gemini": "YOUR_KEY",      // Manual API key
  
  // Enable Pro models via Zen
  "omo.zen.enabled": true,
  "omo.zen.preferredModel": "claude-sonnet-4-5",
  
  // Logging for troubleshooting
  "omo.logging.verbose": true,
  "omo.logging.showOnStartup": true,
  
  // Enable agents
  "omo.agents.oracle.enabled": true,     // Pro only
  "omo.agents.explore.enabled": true,
  "omo.agents.librarian.enabled": true
}
```

---

## Subscription Tiers

### 🆓 Free Tier
- ✅ 2 concurrent agents (Sisyphus, Explore, Librarian)
- ✅ Gemini Flash & Grok Code models
- ✅ All LSP tools
- ✅ Basic workflows

### 💎 Pro Tier ($50/mo cap)
- ✅ Everything in Free
- ✅ 4 concurrent agents (+ Oracle, Frontend)
- ✅ Premium models (GPT-5, Claude Opus)
- ✅ Background tasks
- ✅ Advanced features

**Upgrade**: `OmO: Login with Google` (with Antigravity Pro account)

---

## Model Guide

### Free Models
| Model | Speed | Quality | Use Case |
|-------|-------|---------|----------|
| `gemini-flash` | ⚡⚡⚡ | ⭐⭐⭐ | Fast iterations |
| `grok-code` | ⚡⚡ | ⭐⭐⭐ | Code generation |

### Pro Models (via Zen)
| Model | Speed | Quality | Cost | Best For |
|-------|-------|---------|------|----------|
| `claude-sonnet-4-5` | ⚡⚡ | ⭐⭐⭐⭐ | 💰💰 | Balanced |
| `claude-opus-4-5` | ⚡ | ⭐⭐⭐⭐⭐ | 💰💰💰 | Highest quality |
| `gpt-5.2` | ⚡⚡ | ⭐⭐⭐⭐⭐ | 💰💰💰 | Cutting edge |
| `gpt-5-codex` | ⚡⚡ | ⭐⭐⭐⭐ | 💰💰 | Code expert |

---

## Common Tasks

### Check Status
```
Ctrl+Shift+P → OmO: Show Status
```
Shows: Tier, active agents, auth method, available models

### View Logs
```
Ctrl+Shift+U → Select "OmO Extension"
```
Enable verbose: Settings → `omo.logging.verbose: true`

### Authenticate
```
Ctrl+Shift+P → OmO: Login with Google
```
Automatically detects Antigravity Pro and enables premium features

### Configure Zen
```
Ctrl+Shift+P → OmO: Configure OpenCode Zen
```
Enter API key, test connection, select preferred model

---

## LSP Tools Available

| Tool | What It Does | Agent Use |
|------|--------------|-----------|
| **Hover** | Show type info & docs | Understanding APIs |
| **Go to Definition** | Jump to symbol source | Code navigation |
| **Find References** | Find all usages | Impact analysis |
| **Rename Symbol** | Safe rename across files | Refactoring |

**Auto-configured** for your project language!

---

## Troubleshooting

### Output Channel Missing
1. Reload window: `Ctrl+Shift+P` → "Developer: Reload Window"
2. Check: `Ctrl+Shift+U` → Look for "OmO Extension"
3. If missing: `F12` → Console → Check for errors

### Oracle Not Working (Pro)
- ✅ Verify tier: `OmO: Show Status`
- ✅ Check auth: `OmO: Check Authentication`
- ✅ Enable agent: `omo.agents.oracle.enabled: true`
- ✅ Ensure Gemini API key OR OAuth active

### Authentication Failed
1. `OmO: Check Authentication`
2. Verify: `omo.auth.useAntigravityOAuth: true`
3. Try: `OmO: Refresh OAuth Token`
4. Check console: `F12`

### Models Not Loading
- Set API keys in settings
- Check rate limits: `OmO: Show Status`
- Verify model availability: `OmO: List Zen Models`
- Check internet connection

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Command Palette | `Ctrl+Shift+P` |
| Output Panel | `Ctrl+Shift+U` |
| Developer Console | `F12` |
| Settings | `Ctrl+,` |
| Reload Window | `Ctrl+R` (in Dev Console) |

---

## Best Practices

✅ **Be Specific**: "Refactor login.ts" > "Fix code"  
✅ **Use Right Agent**: Docs → Librarian, Bugs → Oracle  
✅ **Check Logs**: Enable verbose for debugging  
✅ **Monitor Costs**: Pro tier has $50/mo cap  
✅ **Local First**: Code stays local, only prompts sent  

---

## Status Bar Indicators

- 🆓 **Free** - Free tier active
- 🔐 **OAuth** - Authenticated via Google (Pro)
- 🔑 **API Key** - Using manual API key (Pro)
- 📊 **Memory Count** - Supermemory items (v0.4.0+)

---

## File Locations

```
Extension:     /home/frappe/antigravity-omo-extension
Workflows:     .omo/workflows/
Configuration: VS Code Settings → Search "OmO"
Logs:          Output Panel → "OmO Extension"
```

---

## Quick Links

- **GitHub**: https://github.com/yesitisthatis/antigravity-omo-extension
- **User Guide**: [USER_GUIDE.md](file:///home/frappe/.gemini/antigravity/brain/4dfb01d0-ccba-42e1-b113-c761d074c279/USER_GUIDE.md)
- **Antigravity**: https://antigravity.google.com

---

**Version**: 0.3.2 | **License**: MIT | **Updated**: January 2026
