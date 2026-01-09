# Oh My OpenCode for Antigravity

> **Multi-Agent AI Orchestration - Zero Configuration Required**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)  
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow)](./LICENSE)

## ✨ Features

### 🤖 **Intelligent Multi-Agent System**
- **Sisyphus**: Main orchestrator - breaks down complex tasks and delegates to specialists
- **Oracle**: Strategic debugging & architectural analysis (Pro)
- **Librarian**: Documentation expert and codebase knowledge
- **Explore**: Blazing-fast code search powered by free models  
- **Frontend Engineer**: UI/UX specialist (Pro)

### 🧠 **Long-Term Memory** ⭐ NEW
- Remembers project knowledge across sessions
- Auto-saves important information from conversations
- Semantic search through past discussions
- `/supermemory-init` command for codebase indexing

### 🔧 **Powerful Tools**
- **LSP Integration**: hover, goto-definition, find-references, rename
- **AST-Grep**: Semantic code search & refactoring (25+ languages)
- **Conversation Search**: Find past solutions instantly
- **Google Search**: Real-time web knowledge (Pro)

### ⚡ **Zero Configuration**
- Auto-detects project type and framework
- Auto-installs language servers
- Auto-configures agents for your stack
- Works out of the box

### 🎫 **Subscription-Aware**
**Free Tier:**
- Gemini Flash + Grok Code models
- 2 active agents
- All LSP tools
- Core features

**Pro Tier:**
- All premium models (GPT-5.2, Claude Opus, Gemini Pro)
- 10 concurrent agents
- Background task execution
- All MCPs (Exa, Context7, grep.app)
- Supermemory & advanced workflows
- $50/month cost cap

### 🚀 **Workflows**
- `ulw` (ultrawork): Full autonomous task completion
- Custom YAML workflows
- Background parallel execution (Pro)
- Smart TODO enforcement

## 📦 Installation

```bash
# Install from VSCode Marketplace
ext install antigravity-omo

# Or install from .vsix
code --install-extension antigravity-omo-0.1.0.vsix
```

## 🎯 Quick Start

1. **Install** the extension
2. Open any project - OmO auto-detects everything
3. Type `ulw implement login page` in chat
4. Watch Sisyphus orchestrate the work ✨

## 🏗️ Architecture

```
OmO Extension
├── Core Managers
│   ├── Subscription (Free/Pro/Enterprise detection)
│   ├── Multi-Account (Rate limit avoidance)
│   ├── Config (Tier-aware capabilities)
│   └── Endpoint Fallback (Reliability)
├── Agent System
│   ├── Base Agent Framework
│   ├── Agent Manager & Registry
│   ├── Sisyphus (Orchestrator)
│   └── Specialists (Oracle, Librarian, Explore, FE)
├── Tools
│   ├── LSP (4 core tools)
│   ├── AST-Grep (Search & Replace)
│   └── MCP Integrations
└── UI
    ├── Status Bar
    ├── Settings Panel
    └── Notifications
```

## 📊 Development Status

**Current Version:** 0.1.0 (Beta)  
**Completion:** 33% (Week 2/6 complete)

**✅ Implemented:**
- Week 1: Foundation & Infrastructure
- Week 2: Agent System & Orchestration

**🚧 In Progress:**
- Week 3: AST-Grep & Supermemory
- Week 4: Workflows & MCPs
- Week 5: UI/UX & Polish
- Week 6: Testing & Launch

## 🤝 Contributing

Contributions welcome! This is a rapidly evolving project.

## 📝 License

MIT © 2026 OmO Contributors

## 🔗 Links

- [Original Oh My OpenCode](https://github.com/code-yeongyu/oh-my-opencode)
- [Google Antigravity](https://antigravity.google.com)
- [Documentation](./docs)

---

Built with ❤️ for the Antigravity ecosystem
