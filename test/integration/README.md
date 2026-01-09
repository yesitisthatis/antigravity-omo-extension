# OmO Integration Test Suite

## Test Scenarios

### 1. Extension Activation
- Extension loads without errors
- All managers initialize correctly
- Status bar appears
- Commands are registered

### 2. Subscription Detection
- Free tier properly identified
- Pro tier features appropriately enabled/disabled
- Enterprise tier unlimited access verified

### 3. Agent System
- Sisyphus orchestrates task delegation
- Specialist agents receive appropriate tasks
- Background tasks execute (Pro tier)
- Cost tracking functions correctly

### 4. LSP Integration
- Language servers start for Python/TS/Go
- Hover provides type information
- Goto definition navigates correctly
- Find references locates all usages
- Rename refactors safely

### 5. Supermemory
- Memories persist across sessions
- Search returns relevant results
- Auto-save triggers on keywords
- Privacy tags redact content
- Codebase indexing completes

### 6. Workflows
- Ultrawork workflow executes
- Steps run in correct order
- Parallel execution works (Pro tier)
- Error handling prevents crashes

### 7. UI Components
- Status bar updates every 30s
- Project type detected accurately
- Notifications display correctly

## Running Integration Tests

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run specific test file
npm test -- integration/agent-system.test.ts

# Watch mode
npm test -- --watch
```

## Test Coverage Goals

- **Unit Tests:** 80% coverage
- **Integration Tests:** 60% coverage
- **E2E Tests:** Critical paths only

## Mock Data

Tests use mocked VSCode API and file system to avoid requiring actual workspace.
