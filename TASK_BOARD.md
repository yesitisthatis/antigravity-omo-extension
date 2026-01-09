# OmO Antigravity Extension - Task Board

**Project:** Oh My OpenCode → Antigravity Extension  
**Duration:** 6 weeks  
**Total Tasks:** 120+  
**Team Size:** 1-2 developers

---

## 📊 Project Overview

**Milestones:**
- Week 1: Foundation & Infrastructure ✓
- Week 2: Agent System ✓
- Week 3: Advanced Tools & Memory ✓
- Week 4: Workflows & Integration ✓
- Week 5: UI/UX & Polish ✓
- Week 6: Testing & Launch ✓

**Legend:**
- 🔴 P0 (Critical)
- 🟠 P1 (High Priority)
- 🟡 P2 (Medium Priority)
- 🟢 P3 (Nice to Have)

---

# Week 1: Foundation & Infrastructure

## Day 1 - Project Setup
*Goal: Project initialized, builds successfully*

### Issue #1: Initialize Extension Project 🔴 P0
**Labels:** `setup`, `foundation`  
**Estimate:** 2h  
**Dependencies:** None

**Tasks:**
- [ ] Create `/home/frappe/antigravity-omo-extension/` directory
- [ ] Initialize npm project (`npm init`)
- [ ] Set up Git repository
- [ ] Create `.gitignore` (node_modules, dist, *.vsix)
- [ ] Add LICENSE (MIT)
- [ ] Create initial README.md

**Acceptance Criteria:**
- Project directory exists
- `package.json` created
- Git initialized with first commit

---

### Issue #2: Configure TypeScript 🔴 P0
**Labels:** `setup`, `typescript`  
**Estimate:** 1.5h  
**Dependencies:** #1

**Tasks:**
- [ ] Install TypeScript (`npm install -D typescript`)
- [ ] Create `tsconfig.json`
  - Target: ES2022
  - Module: Node16
  - Strict mode enabled
  - VSCode extension types
- [ ] Install VSCode extension types (`@types/vscode`)
- [ ] Verify TypeScript compilation works

**Acceptance Criteria:**
- `tsc` compiles without errors
- Type checking enabled
- VSCode intellisense works

---

### Issue #3: Setup Build Tooling 🔴 P0
**Labels:** `setup`, `build`  
**Estimate:** 2h  
**Dependencies:** #2

**Tasks:**
- [ ] Install esbuild (`npm install -D esbuild`)
- [ ] Create `build.js` script
- [ ] Configure bundling (single bundle for extension)
- [ ] Add npm scripts:
  - `npm run build`
  - `npm run watch`
  - `npm run package`
- [ ] Install vsce (`npm install -D @vscode/vsce`)

**Acceptance Criteria:**
- `npm run build` creates `dist/extension.js`
- Build time < 5 seconds
- Bundle size < 2MB

---

### Issue #4: Create Extension Manifest 🔴 P0
**Labels:** `setup`, `manifest`  
**Estimate:** 1.5h  
**Dependencies:** #1

**Tasks:**
- [ ] Create `package.json` extension fields:
  - name, displayName, description
  - version: 0.1.0
  - engines.vscode: ^1.85.0
  - categories: ["AI", "Other"]
  - activationEvents
  - main: "./dist/extension.js"
- [ ] Define contribution points (will expand later)
- [ ] Add publisher (TBD)
- [ ] Create icon.png (256x256)

**Acceptance Criteria:**
- Valid extension manifest
- Icon created
- Can be packaged with vsce

---

### Issue #5: Create Extension Entry Point 🔴 P0
**Labels:** `foundation`, `activation`  
**Estimate:** 1h  
**Dependencies:** #2, #4

**Tasks:**
- [ ] Create `src/extension.ts`
- [ ] Implement `activate()` function
- [ ] Implement `deactivate()` function
- [ ] Add "Hello World" command for testing
- [ ] Register command in package.json

**Acceptance Criteria:**
- Extension activates in debug mode
- Command appears in command palette
- No activation errors in console

```typescript
// src/extension.ts
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('OmO Extension activated!');
    
    const disposable = vscode.commands.registerCommand(
        'omo.helloWorld',
        () => {
            vscode.window.showInformationMessage('OmO is ready!');
        }
    );
    
    context.subscriptions.push(disposable);
}

export function deactivate() {}
```

---

## Day 2 - CI/CD & Testing Setup
*Goal: Automated testing and build pipeline*

### Issue #6: Setup Vitest 🟠 P1
**Labels:** `testing`, `setup`  
**Estimate:** 2h  
**Dependencies:** #2

**Tasks:**
- [ ] Install vitest (`npm install -D vitest`)
- [ ] Create `vitest.config.ts`
- [ ] Add test script to package.json
- [ ] Create `tests/` directory structure
- [ ] Write first test (example: utils test)

**Acceptance Criteria:**
- `npm test` runs successfully
- Test coverage reporting works
- Fast test execution (< 1s for basic tests)

---

### Issue #7: Setup VSCode Extension Testing 🟠 P1
**Labels:** `testing`, `integration`  
**Estimate:** 2.5h  
**Dependencies:** #5, #6

**Tasks:**
- [ ] Install `@vscode/test-electron`
- [ ] Create `tests/integration/` directory
- [ ] Setup extension test runner
- [ ] Write integration test for activation
- [ ] Configure test launch config

**Acceptance Criteria:**
- Extension tests run in VSCode test instance
- Can test commands and UI
- Tests pass in CI

---

### Issue #8: GitHub Actions CI 🟠 P1
**Labels:** `ci-cd`, `github`  
**Estimate:** 2h  
**Dependencies:** #3, #6

**Tasks:**
- [ ] Create `.github/workflows/ci.yml`
- [ ] Jobs: lint, test, build
- [ ] Matrix: Linux, macOS, Windows
- [ ] Cache node_modules
- [ ] Upload build artifacts

**Acceptance Criteria:**
- CI passes on push
- All platforms tested
- Artifacts available for download

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build
```

---

## Day 3-4 - Subscription System
*Goal: Tier detection and configuration*

### Issue #9: Implement Subscription Manager 🔴 P0
**Labels:** `core`, `subscription`  
**Estimate:** 4h  
**Dependencies:** #5

**Tasks:**
- [ ] Create `src/core/subscription-manager.ts`
- [ ] Implement Antigravity OAuth token retrieval
- [ ] Call subscription API
- [ ] Parse tier (free/pro/enterprise)
- [ ] Cache subscription info
- [ ] Handle token refresh

**Acceptance Criteria:**
- Can detect user tier
- Returns tier capabilities
- Handles auth errors gracefully
- Tests cover all tiers

---

### Issue #10: Multi-Account System 🟠 P1
**Labels:** `core`, `auth`, `NEW`  
**Estimate:** 5h  
**Dependencies:** #9

**Tasks:**
- [ ] Create `src/core/multi-account-manager.ts`
- [ ] Implement account storage (SecretStorage)
- [ ] Add account rotation logic
- [ ] Detect rate limit (429 responses)
- [ ] Implement round-robin + health check
- [ ] Add `auth login` command for adding accounts

**Acceptance Criteria:**
- Can store multiple Google accounts
- Rotates on 429
- Persists across sessions
- Secure storage

---

### Issue #11: Tier-Aware Config Manager 🔴 P0
**Labels:** `core`, `config`  
**Estimate:** 3h  
**Dependencies:** #9

**Tasks:**
- [ ] Create `src/core/config-manager.ts`
- [ ] Define tier capabilities (models, agents, features)
- [ ] Implement config adaptation
- [ ] Add cost estimation
- [ ] Create config schema

**Acceptance Criteria:**
- Correct config per tier
- Free tier uses free models
- Pro tier unlocks all features
- Config cached efficiently

---

### Issue #12: Endpoint Fallback System 🟡 P2
**Labels:** `reliability`, `NEW`  
**Estimate:** 2h  
**Dependencies:** #9

**Tasks:**
- [ ] Create `src/core/endpoint-fallback.ts`
- [ ] Define endpoint priority: daily → autopush → prod
- [ ] Implement retry logic with fallback
- [ ] Add timeout handling
- [ ] Log endpoint health

**Acceptance Criteria:**
- Falls back on endpoint failure
- Respects timeout (10s)
- Logs failures
- Tests cover all scenarios

---

## Day 5-7 - LSP Foundation
*Goal: Core LSP tools working*

### Issue #13: LSP Client Setup 🔴 P0
**Labels:** `lsp`, `foundation`  
**Estimate:** 4h  
**Dependencies:** #5

**Tasks:**
- [ ] Install `vscode-languageclient`
- [ ] Create `src/tools/lsp/lsp-manager.ts`
- [ ] Implement language server detection
- [ ] Create LSP client lifecycle management
- [ ] Handle multi-language support

**Acceptance Criteria:**
- Can connect to LSP servers
- Supports Python, TypeScript, Go
- Handles server crashes gracefully

---

### Issue #14: LSP Hover Tool 🔴 P0
**Labels:** `lsp`, `tools`  
**Estimate:** 2h  
**Dependencies:** #13

**Tasks:**
- [ ] Create `src/tools/lsp/hover.ts`
- [ ] Register `lsp_hover` tool
- [ ] Implement textDocument/hover request
- [ ] Format hover response for AI
- [ ] Add examples to tool description

**Acceptance Criteria:**
- Returns type info at position
- Works for 3+ languages
- Clean AI-friendly format

---

### Issue #15: LSP Goto Definition Tool 🔴 P0
**Labels:** `lsp`, `tools`  
**Estimate:** 2h  
**Dependencies:** #13

**Tasks:**
- [ ] Create `src/tools/lsp/goto-definition.ts`
- [ ] Register `lsp_goto_definition` tool
- [ ] Implement textDocument/definition request
- [ ] Return file path + line/column
- [ ] Handle multiple definitions

**Acceptance Criteria:**
- Jumps to correct definition
- Returns all definitions if multiple
- File paths are absolute

---

### Issue #16: LSP Find References Tool 🔴 P0
**Labels:** `lsp`, `tools`  
**Estimate:** 2.5h  
**Dependencies:** #13

**Tasks:**
- [ ] Create `src/tools/lsp/find-references.ts`
- [ ] Register `lsp_find_references` tool
- [ ] Implement textDocument/references request
- [ ] Return all reference locations
- [ ] Format for AI readability

**Acceptance Criteria:**
- Finds all usages
- Includes declaration if requested
- Workspace-wide search

---

### Issue #17: LSP Rename Tool 🟠 P1
**Labels:** `lsp`, `tools`, `refactoring`  
**Estimate:** 3h  
**Dependencies:** #13

**Tasks:**
- [ ] Create `src/tools/lsp/rename.ts`
- [ ] Register `lsp_rename` tool
- [ ] Implement prepareRename check
- [ ] Execute workspace edit
- [ ] Add confirmation step (ask user)
- [ ] Show preview of changes

**Acceptance Criteria:**
- Safe rename across workspace
- Preview shown before apply
- Handles rename conflicts

---

### Issue #18: Auto-Install LSP Servers 🟠 P1
**Labels:** `lsp`, `zero-config`  
**Estimate:** 4h  
**Dependencies:** #13

**Tasks:**
- [ ] Create `src/tools/lsp/auto-installer.ts`
- [ ] Detect missing LSP servers by language
- [ ] Implement npm-based installation (pyright, typescript-language-server)
- [ ] Show progress notification
- [ ] Cache installation status

**Acceptance Criteria:**
- Auto-installs on first use
- User sees progress
- Doesn't re-install unnecessarily
- Handles installation failures

---

# Week 2: Agent System & Orchestration

## Day 1-2 - Agent Framework

### Issue #19: Base Agent Class 🔴 P0
**Labels:** `agents`, `foundation`  
**Estimate:** 4h  
**Dependencies:** #11

**Tasks:**
- [ ] Create `src/agents/base-agent.ts`
- [ ] Define Agent interface
- [ ] Implement tool registration per agent
- [ ] Add model configuration
- [ ] Create system prompt loading
- [ ] Implement cost tracking

**Acceptance Criteria:**
- Clear agent API
- Agents can register tools
- System prompts loaded from files
- Cost tracked per agent invocation

```typescript
interface Agent {
    name: string;
    model: string;
    description: string;
    systemPrompt: string;
    tools: string[];
    
    execute(task: string, context?: any): Promise<string>;
    estimateCost(input: string): Promise<number>;
}
```

---

### Issue #20: Agent Registry & Manager 🔴 P0
**Labels:** `agents`, `core`  
**Estimate:** 3h  
**Dependencies:** #19

**Tasks:**
- [ ] Create `src/agents/agent-manager.ts`
- [ ] Implement agent registration
- [ ] Add agent discovery
- [ ] Create agent lifecycle (activate/deactivate)
- [ ] Implement agent selection logic
- [ ] Add tier-based filtering

**Acceptance Criteria:**
- Can register/unregister agents
- Lists available agents by tier
- Selects appropriate agent for task
- Handles agent failures

---

## Day 3-4 - Core Agents

### Issue #21: Sisyphus Orchestrator Agent 🔴 P0
**Labels:** `agents`, `orchestration`  
**Estimate:** 5h  
**Dependencies:** #20

**Tasks:**
- [ ] Create `src/agents/sisyphus.ts`
- [ ] Load system prompt from `assets/prompts/sisyphus.md`
- [ ] Implement task delegation logic
- [ ] Add specialist agent selection
- [ ] Create continuation enforcement
- [ ] Configure for tier (Opus Pro vs Gemini Flash Free)

**Acceptance Criteria:**
- Can break down complex tasks
- Delegates to appropriate specialists
- Enforces task completion
- Works on both Free and Pro tiers

---

### Issue #22: Oracle Debugging Agent 🟠 P1
**Labels:** `agents`, `specialist`  
**Estimate:** 3h  
**Dependencies:** #20

**Tasks:**
- [ ] Create `src/agents/oracle.ts`
- [ ] Load prompt from `assets/prompts/oracle.md`
- [ ] Configure for GPT-5.2 (Pro tier only)
- [ ] Add architectural analysis tools
- [ ] Implement debugging strategies

**Acceptance Criteria:**
- Strategic debugging advice
- Architectural insights
- Pro tier exclusive
- Integrates with LSP tools

---

### Issue #23: Explore Code Search Agent 🟠 P1
**Labels:** `agents`, `specialist`  
**Estimate:** 2.5h  
**Dependencies:** #20

**Tasks:**
- [ ] Create `src/agents/explore.ts`
- [ ] Configure for Grok Code (free model)
- [ ] Add grep, AST-Grep tools access
- [ ] Optimize for speed
- [ ] Available on all tiers

**Acceptance Criteria:**
- Blazing fast exploration
- Uses free model
- Finds code patterns quickly
- All tier access

---

## Day 5-7 - Multi-Agent Communication

### Issue #24: Background Task Runner 🔴 P0
**Labels:** `agents`, `async`, `pro-feature`  
**Estimate:** 5h  
**Dependencies:** #20, #11

**Tasks:**
- [ ] Create `src/agents/background-runner.ts`
- [ ] Implement async task spawning
- [ ] Add task queue management
- [ ] Create task status tracking
- [ ] Implement `background_output` retrieval
- [ ] Add `background_cancel` command
- [ ] Pro tier gate check

**Acceptance Criteria:**
- Agents run in parallel (Pro tier)
- Task status queryable
- Can retrieve results
- Can cancel tasks
- Free tier shows upgrade prompt

---

### Issue #25: Agent Message Passing 🟠 P1
**Labels:** `agents`, `communication`  
**Estimate:** 4h  
**Dependencies:** #24

**Tasks:**
- [ ] Create internal message bus
- [ ] Define message format
- [ ] Implement agent-to-agent communication
- [ ] Add message history
- [ ] Create debugging logs

**Acceptance Criteria:**
- Agents can communicate
- Message history tracked
- Debugging enabled
- Thread-safe

---

### Issue #26: Session Recovery System 🟡 P2
**Labels:** `reliability`, `NEW`  
**Estimate:** 3h  
**Dependencies:** #20

**Tasks:**
- [ ] Create `src/core/session-recovery.ts`
- [ ] Detect `tool_result_missing` error
- [ ] Re-send last tool result
- [ ] Resume conversation
- [ ] Log recovery events

**Acceptance Criteria:**
- Detects Claude errors
- Auto-recovers transparently
- User doesn't notice
- Recovery logged

---

# Week 3: Advanced Tools & Context

## Day 1-2 - AST-Grep Integration

### Issue #27: AST-Grep Setup 🔴 P0
**Labels:** `ast`, `tools`  
**Estimate:** 3h  
**Dependencies:** #5

**Tasks:**
- [ ] Install `@ast-grep/napi`
- [ ] Create `src/tools/ast-grep/ast-manager.ts`
- [ ] Setup language support (25+ languages)
- [ ] Implement AST parsing
- [ ] Add pattern compilation cache

**Acceptance Criteria:**
- Supports 10+ common languages
- Pattern compilation works
- Caching improves performance

---

### Issue #28: AST-Grep Search Tool 🔴 P0
**Labels:** `ast`, `tools`, `search`  
**Estimate:** 4h  
**Dependencies:** #27

**Tasks:**
- [ ] Create `src/tools/ast-grep/search.ts`
- [ ] Register `ast_grep_search` tool
- [ ] Implement pattern matching
- [ ] Return match contexts
- [ ] Format results for AI

**Acceptance Criteria:**
- Finds semantic patterns
- Returns surrounding context
- Multiple language support
- AI-friendly output

---

### Issue #29: AST-Grep Replace Tool 🔴 P0
**Labels:** `ast`, `tools`, `refactoring`  
**Estimate:** 4h  
**Dependencies:** #27

**Tasks:**
- [ ] Create `src/tools/ast-grep/replace.ts`
- [ ] Register `ast_grep_replace` tool
- [ ] Implement safe replacement
- [ ] Add dry-run mode
- [ ] Show preview diff

**Acceptance Criteria:**
- Safe AST-aware replacement
- Preview before apply
- Multi-file support
- Preserves syntax

---

## Day 3-5 - Supermemory Integration

### Issue #30: Supermemory Core 🟠 P1
**Labels:** `memory`, `NEW`, `high-value`  
**Estimate:** 6h  
**Dependencies:** #5

**Tasks:**
- [ ] Create `src/context/supermemory.ts`
- [ ] Implement memory storage (IndexedDB via VSCode APIs)
- [ ] Add semantic search (embeddings)
- [ ] Create user profile storage
- [ ] Implement project knowledge base
- [ ] Add memory scopes (user/project/global)

**Acceptance Criteria:**
- Can store/retrieve memories
- Semantic search works
- Scoped properly
- Persists across sessions

---

### Issue #31: Context Injection System 🟠 P1
**Labels:** `memory`, `context`, `NEW`  
**Estimate:** 4h  
**Dependencies:** #30

**Tasks:**
- [ ] Implement automatic context injection
- [ ] Format `[SUPERMEMORY]` prefix
- [ ] Add relevance scores
- [ ] Inject on first message
- [ ] Cache to avoid re-injection

**Acceptance Criteria:**
- Context injected transparently
- Relevance-scored
- Performance optimized
- User doesn't see injection

---

### Issue #32: Keyword Detection & Auto-Save 🟡 P2
**Labels:** `memory`, `automation`, `NEW`  
**Estimate:** 3h  
**Dependencies:** #30

**Tasks:**
- [ ] Create keyword pattern matching
- [ ] Default keywords: "remember", "save this", "don't forget"
- [ ] Allow custom keyword config
- [ ] Auto-save on detection
- [ ] Show subtle notification

**Acceptance Criteria:**
- Detects save keywords
- Saves automatically
- Configurable patterns
- User feedback

---

### Issue #33: Privacy Tags 🟡 P2
**Labels:** `memory`, `privacy`, `NEW`  
**Estimate:** 2h  
**Dependencies:** #30

**Tasks:**
- [ ] Implement `<private>` tag detection
- [ ] Strip private content before saving
- [ ] Validate tag matching
- [ ] Document privacy feature

**Acceptance Criteria:**
- Content in `<private>` tags not saved
- Proper tag parsing
- Documented

---

### Issue #34: AGENTS.md Provider 🔴 P0
**Labels:** `context`, `zero-config`  
**Estimate:** 4h  
**Dependencies:** #5

**Tasks:**
- [ ] Create `src/context/agents-md-provider.ts`
- [ ] Implement directory walker (file → root)
- [ ] Collect all AGENTS.md files
- [ ] Inject in order (root → file)
- [ ] Cache per session
- [ ] Also support README.md

**Acceptance Criteria:**
- Walks directory tree
- Collects nested AGENTS.md
- Injects once per session
- Cached efficiently

---

### Issue #35: Conditional Rules System 🟡 P2
**Labels:** `context`, `rules`  
**Estimate:** 3h  
**Dependencies:** #34

**Tasks:**
- [ ] Create `src/context/rules-provider.ts`
- [ ] Read `.claude/rules/` directory
- [ ] Parse YAML frontmatter (globs, alwaysApply)
- [ ] Match rules to current file
- [ ] Inject matched rules

**Acceptance Criteria:**
- Glob matching works
- YAML parsing correct
- Only relevant rules injected
- User + project rules merged

---

### Issue #36: Auto-Context Generation 🟠 P1
**Labels:** `context`, `smart`, `zero-config`  
**Estimate:** 5h  
**Dependencies:** #5

**Tasks:**
- [ ] Create `src/context/project-analyzer.ts`
- [ ] Detect framework (React, Next, FastAPI, etc.)
- [ ] Detect code style (Prettier, ESLint)
- [ ] Analyze common patterns
- [ ] Generate implicit context
- [ ] Cache analysis

**Acceptance Criteria:**
- Detects 10+ frameworks
- Identifies code style
- Generates useful context
- Cached per project

---

# Week 4: Workflows & MCP Integration

## Day 1 - Workflow Engine

### Issue #37: YAML Workflow Parser 🔴 P0
**Labels:** `workflows`, `foundation`  
**Estimate:** 4h  
**Dependencies:** #20

**Tasks:**
- [ ] Create `src/workflows/workflow-engine.ts`
- [ ] Install YAML parser
- [ ] Define workflow schema
- [ ] Parse workflow files
- [ ] Validate workflow structure

**Acceptance Criteria:**
- Parses YAML workflows
- Schema validation works
- Error messages helpful

---

### Issue #38: Workflow Step Executor 🔴 P0
**Labels:** `workflows`, `execution`  
**Estimate:** 5h  
**Dependencies:** #37

**Tasks:**
- [ ] Implement step execution
- [ ] Add sequential steps
- [ ] Implement parallel tasks
- [ ] Handle step failures
- [ ] Add timeout support
- [ ] Create progress tracking

**Acceptance Criteria:**
- Steps execute in order
- Parallel tasks work
- Failures handled gracefully
- Progress visible

---

### Issue #39: Supermemory Init Command 🟡 P2
**Labels:** `workflows`, `memory`, `NEW`  
**Estimate:** 3h  
**Dependencies:** #30, #38

**Tasks:**
- [ ] Create `/supermemory-init` workflow
- [ ] Index codebase structure
- [ ] Extract patterns and conventions
- [ ] Save to project memory
- [ ] Show progress

**Acceptance Criteria:**
- Command runs successfully
- Indexes important patterns
- Saves to memory
- User sees progress

---

## Day 2 - Ultrawork Implementation

### Issue #40: Ultrawork Workflow 🔴 P0
**Labels:** `workflows`, `core-feature`  
**Estimate:** 6h  
**Dependencies:** #38, #21

**Tasks:**
- [ ] Create `assets/workflows/ultrawork.yaml`
- [ ] Define steps:
  1. Analyze task
  2. Gather context (parallel)
  3. Implement (delegated)
  4. Validate
  5. Enforce completion
- [ ] Register `ulw` keyword trigger
- [ ] Add progress notifications
- [ ] Implement TODO tracking

**Acceptance Criteria:**
- `ulw` triggers workflow
- All steps execute
- Delegates correctly
- Enforces completion

---

### Issue #41: Cross-Model Conversations 🟡 P2
**Labels:** `agents`, `advanced`, `NEW`  
**Estimate:** 4h  
**Dependencies:** #20

**Tasks:**
- [ ] Create `src/agents/cross-model-manager.ts`
- [ ] Implement model switching mid-conversation
- [ ] Preserve thinking blocks
- [ ] Transform history format
- [ ] Show active model indicator

**Acceptance Criteria:**
- Can switch models mid-chat
- History preserved
- Thinking blocks maintained
- UI shows active model

---

## Day 3-5 - MCP Integration

### Issue #42: MCP SDK Setup 🔴 P0
**Labels:** `mcp`, `integration`  
**Estimate:** 3h  
**Dependencies:** #5

**Tasks:**
- [ ] Install `@modelcontextprotocol/sdk`
- [ ] Create `src/mcps/mcp-manager.ts`
- [ ] Implement MCP server lifecycle
- [ ] Add server health checks
- [ ] Create tool exposure

**Acceptance Criteria:**
- Can launch MCP servers
- Health checks work
- Tools exposed to agents
- Graceful shutdown

---

### Issue #43: Google Search MCP 🟠 P1
**Labels:** `mcp`, `search`, `pro-feature`, `NEW`  
**Estimate:** 4h  
**Dependencies:** #42, #11

**Tasks:**
- [ ] Create `src/tools/google-search.ts`
- [ ] Integrate with Antigravity Search API
- [ ] Register `google_search` tool
- [ ] Format results with citations
- [ ] Add URL analysis
- [ ] Pro tier gate

**Acceptance Criteria:**
- Search returns results
- Citations included
- Pro tier only
- URL context analyzed

---

### Issue #44: Exa Web Search MCP 🟠 P1
**Labels:** `mcp`, `search`, `pro-feature`  
**Estimate:** 3h  
**Dependencies:** #42, #11

**Tasks:**
- [ ] Setup Exa MCP server
- [ ] Configure API key handling
- [ ] Expose search tools
- [ ] Pro tier gate
- [ ] Fallback to Google Search if available

**Acceptance Criteria:**
- Exa search works
- API key secure
- Pro tier only
- Graceful degradation

---

### Issue #45: Context7 Docs MCP 🟠 P1
**Labels:** `mcp`, `documentation`, `pro-feature`  
**Estimate:** 3h  
**Dependencies:** #42, #11

**Tasks:**
- [ ] Setup Context7 MCP server
- [ ] Configure API key
- [ ] Expose documentation search
- [ ] Pro tier gate

**Acceptance Criteria:**
- Doc search works
- Returns relevant results
- Pro tier only

---

### Issue #46: grep.app GitHub Search MCP 🔴 P0
**Labels:** `mcp`, `search`, `free-tier`  
**Estimate:** 2.5h  
**Dependencies:** #42

**Tasks:**
- [ ] Setup grep.app MCP server
- [ ] No API key required (public)
- [ ] Expose code search tool
- [ ] Available on all tiers

**Acceptance Criteria:**
- GitHub search works
- No auth required
- All tiers accessible

---

# Week 5: UI/UX & Polish

## Day 1-2 - Zero-Config Installation

### Issue #47: Project Type Detection 🔴 P0
**Labels:** `zero-config`, `detection`  
**Estimate:** 4h  
**Dependencies:** #5

**Tasks:**
- [ ] Create `src/utils/auto-detect.ts`
- [ ] Detect by package.json
- [ ] Detect by requirements.txt, go.mod, Cargo.toml
- [ ] Analyze file extensions
- [ ] Detect framework (React, Next, FastAPI, etc.)
- [ ] Return project type

**Acceptance Criteria:**
- Detects 10+ project types
- Framework detection works
- Fast (< 100ms)

---

### Issue #48: One-Click Setup Wizard 🔴 P0
**Labels:** `ui`, `onboarding`  
**Estimate:** 6h  
**Dependencies:** #47, #11

**Tasks:**
- [ ] Create guided setup webview
- [ ] Step 1: Detect project
- [ ] Step 2: Configure agents (show defaults)
- [ ] Step 3: Optional API keys
- [ ] Step 4: Done!
- [ ] Skip button for each step
- [ ] Save preferences

**Acceptance Criteria:**
- Beautiful UI
- 3-4 steps max
- Can skip everything
- Saves config

---

### Issue #49: Migration from Other Tools 🟡 P2
**Labels:** `migration`, `ux`  
**Estimate:** 3h  
**Dependencies:** #5

**Tasks:**
- [ ] Detect `.claude/config.json`
- [ ] Import Claude Code settings
- [ ] Detect `.cursorrules`
- [ ] Convert to AGENTS.md
- [ ] Show migration success message

**Acceptance Criteria:**
- Imports Claude Code config
- Converts Cursor rules
- User notified

---

## Day 3-4 - UI Components

### Issue #50: Status Bar Integration 🔴 P0
**Labels:** `ui`, `status`  
**Estimate:** 3h  
**Dependencies:** #5

**Tasks:**
- [ ] Create status bar item
- [ ] Show: "$(robot) OmO"
- [ ] Tooltip shows tier + models
- [ ] Click opens menu
- [ ] Show progress during tasks
- [ ] Spinning icon for background tasks

**Acceptance Criteria:**
- Always visible
- Shows progress
- Menu accessible
- Tier displayed

---

### Issue #51: Settings Panel 🔴 P0
**Labels:** `ui`, `settings`  
**Estimate:** 5h  
**Dependencies:** #10, #11

**Tasks:**
- [ ] Create settings webview
- [ ] Tabs: General, Agents, Accounts, Advanced
- [ ] General: Tier, cost settings
- [ ] Agents: Enable/disable, model selection
- [ ] Accounts: Add/remove Google accounts
- [ ] Advanced: Thinking levels, endpoint priority
- [ ] Save to workspace/user settings

**Acceptance Criteria:**
- Clean UI
- All settings accessible
- Saves properly
- Tier-aware

---

### Issue #52: Inline Hints & Notifications 🟡 P2
**Labels:** `ui`, `ux`  
**Estimate:** 3h  
**Dependencies:** #5

**Tasks:**
- [ ] Create smart hint system
- [ ] Detect repeated tasks → suggest `ulw`
- [ ] Show tips once (never repeat)
- [ ] Dismissible notifications
- [ ] Upgrade prompts (non-intrusive)

**Acceptance Criteria:**
- Helpful, not annoying
- Never repeats
- Easy to dismiss
- Upgrade prompts valuable

---

## Day 5 - Hooks & Customization

### Issue #53: Hook System 🟡 P2
**Labels:** `hooks`, `extensibility`  
**Estimate:** 4h  
**Dependencies:** #20

**Tasks:**
- [ ] Create `src/hooks/hook-manager.ts`
- [ ] Define hook events:
  - preToolUse
  - postToolUse
  - userPromptSubmit
  - agentResponse
- [ ] Allow hook registration
- [ ] Execute hooks in order

**Acceptance Criteria:**
- Hooks fire correctly
- Can modify data
- Error handling

---

### Issue #54: Comment Checker Hook 🟡 P2
**Labels:** `hooks`, `quality`  
**Estimate:** 2h  
**Dependencies:** #53

**Tasks:**
- [ ] Create comment ratio checker
- [ ] Warn if > 30% comments
- [ ] Suggest clean code
- [ ] Configurable threshold

**Acceptance Criteria:**
- Detects excessive comments
- Warnings clear
- Configurable

---

### Issue #55: TODO Enforcer Hook 🟠 P1
**Labels:** `hooks`, `quality`  
**Estimate:** 3h  
**Dependencies:** #53

**Tasks:**
- [ ] Detect TODO/FIXME in code
- [ ] Inject continuation message
- [ ] Don't let agent stop with TODOs
- [ ] Show TODO count in UI

**Acceptance Criteria:**
- Detects TODOs
- Enforces completion
- UI shows count
- Can disable

---

# Week 6: Testing, Documentation & Launch

## Day 1-2 - Testing

### Issue #56: Unit Test Coverage 🔴 P0
**Labels:** `testing`, `quality`  
**Estimate:** 8h  
**Dependencies:** All code complete

**Tasks:**
- [ ] Write tests for subscription-manager (80%+)
- [ ] Write tests for config-manager (80%+)
- [ ] Write tests for agent-manager (80%+)
- [ ] Write tests for LSP tools (80%+)
- [ ] Write tests for workflow engine (80%+)
- [ ] Achieve > 80% overall coverage

**Acceptance Criteria:**
- > 80% code coverage
- All critical paths tested
- Edge cases covered
- CI passes

---

### Issue #57: Integration Tests 🔴 P0
**Labels:** `testing`, `integration`  
**Estimate:** 6h  
**Dependencies:** #56

**Tasks:**
- [ ] Test extension activation
- [ ] Test agent invocation
- [ ] Test workflow execution
- [ ] Test multi-account rotation
- [ ] Test LSP integration
- [ ] Test MCP connections

**Acceptance Criteria:**
- All integration tests pass
- Covers main user flows
- Runs in CI

---

### Issue #58: E2E Workflow Tests 🟠 P1
**Labels:** `testing`, `e2e`  
**Estimate:** 4h  
**Dependencies:** #57

**Tasks:**
- [ ] Test install → first use flow
- [ ] Test `ulw` complete task
- [ ] Test tier upgrade/downgrade
- [ ] Test multi-account fallback
- [ ] Test cross-model switching

**Acceptance Criteria:**
- Critical flows work end-to-end
- User experience validated
- No major bugs

---

## Day 3-4 - Documentation

### Issue #59: README & Quick Start 🔴 P0
**Labels:** `docs`, `onboarding`  
**Estimate:** 4h  
**Dependencies:** All features complete

**Tasks:**
- [ ] Write comprehensive README.md
- [ ] Add quick start guide
- [ ] Feature matrix
- [ ] Screenshots/GIFs
- [ ] Installation instructions
- [ ] Troubleshooting section

**Acceptance Criteria:**
- Clear, concise
- New users can get started < 5 min
- Screenshots included
- Troubleshooting helpful

---

### Issue #60: API Documentation 🟠 P1
**Labels:** `docs`, `api`  
**Estimate:** 3h  
**Dependencies:** #59

**Tasks:**
- [ ] Document all tools
- [ ] Document agent APIs
- [ ] Document configuration options
- [ ] Add code examples
- [ ] Create TypeDoc generation

**Acceptance Criteria:**
- All APIs documented
- Examples clear
- TypeDoc generated

---

### Issue #61: Video Demos 🟡 P2
**Labels:** `docs`, `marketing`  
**Estimate:** 4h  
**Dependencies:** #59

**Tasks:**
- [ ] Record 30s teaser (install → ulw → done)
- [ ] Record 3min full demo
- [ ] Record LSP tools demo
- [ ] Record multi-agent demo
- [ ] Upload to YouTube

**Acceptance Criteria:**
- High quality
- Clear narration
- Beautiful editing
- Uploaded

---

## Day 5-7 - Launch

### Issue #62: Package Extension 🔴 P0
**Labels:** `release`, `packaging`  
**Estimate:** 2h  
**Dependencies:** #58, #59

**Tasks:**
- [ ] Run `npm run package`
- [ ] Create `.vsix` file
- [ ] Test installation from .vsix
- [ ] Verify all features work
- [ ] Check bundle size < 10MB

**Acceptance Criteria:**
- .vsix created
- Installs successfully
- All features work
- Size optimized

---

### Issue #63: Marketplace Listing 🔴 P0
**Labels:** `release`, `marketplace`  
**Estimate:** 3h  
**Dependencies:** #62

**Tasks:**
- [ ] Create publisher account
- [ ] Write marketplace description
- [ ] Add screenshots (5+)
- [ ] Add tags/categories
- [ ] Set pricing (free)
- [ ] Publish extension

**Acceptance Criteria:**
- Published to marketplace
- Description compelling
- Screenshots beautiful
- Searchable

---

### Issue #64: GitHub Release 🟠 P1
**Labels:** `release`, `github`  
**Estimate:** 2h  
**Dependencies:** #62

**Tasks:**
- [ ] Tag v1.0.0
- [ ] Create GitHub release
- [ ] Attach .vsix
- [ ] Write release notes
- [ ] Publish

**Acceptance Criteria:**
- Release created
- .vsix attached
- Notes comprehensive

---

### Issue #65: Launch Announcement 🟡 P2
**Labels:** `marketing`, `launch`  
**Estimate:** 3h  
**Dependencies:** #63

**Tasks:**
- [ ] Write launch blog post
- [ ] Tweet announcement
- [ ] Post to Reddit r/vscode
- [ ] Post to HackerNews
- [ ] Email newsletter (if any)

**Acceptance Criteria:**
- Posted to 3+ channels
- Professional
- Links to marketplace
- Demo video embedded

---

### Issue #66: Post-Launch Monitoring 🟠 P1
**Labels:** `monitoring`, `support`  
**Estimate:** Ongoing  
**Dependencies:** #65

**Tasks:**
- [ ] Monitor marketplace reviews
- [ ] Watch GitHub issues
- [ ] Track installation count
- [ ] Gather user feedback
- [ ] Hot-fix critical bugs

**Acceptance Criteria:**
- Reviews monitored daily
- Issues triaged
- Critical bugs fixed < 24h

---

## 📊 Summary Statistics

**Total Issues:** 66  
**Critical (P0):** 28  
**High (P1):** 21  
**Medium (P2):** 17  

**By Week:**
- Week 1: 18 issues
- Week 2: 8 issues
- Week 3: 10 issues
- Week 4: 10 issues
- Week 5: 9 issues
- Week 6: 11 issues

**By Category:**
- Setup/Foundation: 12
- Core Systems: 15
- Agents: 8
- Tools (LSP/AST): 10
- Context/Memory: 8
- UI/UX: 7
- Testing: 3
- Documentation: 3
- Launch: 3

**New Features from Research:**
- Multi-account: 2 issues
- Supermemory: 5 issues
- Google Search: 1 issue
- Cross-model: 1 issue
- Session recovery: 1 issue
- Endpoint fallback: 1 issue

---

## 🎯 Next Steps

**Ready to:**
1. Import these issues to GitHub
2. Create project board
3. Start Week 1, Day 1

**Want me to:**
- Create GitHub issues automatically?
- Generate project board structure?
- Start implementing?
