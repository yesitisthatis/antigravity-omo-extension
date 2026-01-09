import * as vscode from 'vscode';
import { SubscriptionManager } from './core/subscription-manager';
import { ConfigManager } from './core/config-manager';
import { MultiAccountManager } from './core/multi-account-manager';
import { EndpointFallbackManager } from './core/endpoint-fallback';
import { LSPManager } from './tools/lsp/lsp-manager';
import { LSPHoverTool } from './tools/lsp/hover';
import { LSPGotoDefinitionTool } from './tools/lsp/goto-definition';
import { LSPFindReferencesTool } from './tools/lsp/find-references';
import { LSPRenameTool } from './tools/lsp/rename';
import { AgentManager } from './agents/agent-manager';
import { SisyphusAgent } from './agents/sisyphus';
import { OracleAgent, ExploreAgent, LibrarianAgent } from './agents/specialists';
import { BackgroundTaskRunner } from './agents/background-runner';
import { ASTGrepTool } from './tools/ast-grep';
import { SupermemoryManager } from './memory/supermemory';
import { WorkflowEngine, createUltraworkWorkflow } from './workflows/workflow-engine';
import { MCPManager } from './mcp/mcp-manager';
import { StatusBarManager } from './ui/status-bar';
import { ProjectDetector } from './ui/project-detector';
import { logger } from './core/logger';

/**
 * Extension activation - called when extension is first loaded
 */
export async function activate(context: vscode.ExtensionContext) {
    // Initialize logger first (creates Output channel immediately)
    // Must be called AFTER vscode APIs are ready
    const { Logger } = require('./core/logger');
    const loggerInstance = Logger.getInstance();
    loggerInstance.info('OmO Extension activating...');

    console.log('🚀 Oh My OpenCode for Antigravity is activating...');

    // Initialize core managers
    const subscriptionManager = SubscriptionManager.getInstance(context);
    const configManager = ConfigManager.getInstance(context);
    const multiAccountManager = MultiAccountManager.getInstance(context);
    const endpointManager = EndpointFallbackManager.getInstance();
    const agentManager = AgentManager.getInstance(context);
    const supermemory = SupermemoryManager.getInstance(context);

    //  Initialize AI Provider Manager (for auto-selecting Zen/Gemini)
    const { AIProviderManager } = require('./core/ai-provider-manager');
    const providerManager = AIProviderManager.getInstance();
    await providerManager.initialize();
    console.log('✓ AI Provider Manager initialized');

    // Initialize managers
    const lspManager = LSPManager.getInstance(context);
    await lspManager.initialize();

    // Initialize LSP tools
    const hoverTool = new LSPHoverTool(context);
    const gotoDefTool = new LSPGotoDefinitionTool(context);
    const findRefsTool = new LSPFindReferencesTool(context);
    const renameTool = new LSPRenameTool(context);

    // Background runner
    const backgroundRunner = BackgroundTaskRunner.getInstance(context);

    // Listen for subscription changes
    context.subscriptions.push(subscriptionManager.createConfigListener());

    // Register agents (with error handling for optional agents)
    // Core agent - required
    try {
        await agentManager.registerAgent(new SisyphusAgent(context));
    } catch (error) {
        console.error('Failed to register Sisyphus:', error);
        throw error; // Critical failure
    }

    // Optional agents - degrade gracefully
    try {
        await agentManager.registerAgent(new OracleAgent(context));
    } catch (error) {
        console.log('Oracle agent not available (requires Pro tier configuration)');
    }

    try {
        await agentManager.registerAgent(new ExploreAgent(context));
    } catch (error) {
        console.log('Explore agent not available:', error);
    }

    try {
        await agentManager.registerAgent(new LibrarianAgent(context));
    } catch (error) {
        console.log('Librarian agent not available:', error);
    }

    // Initialize Week 3-4 features
    const astGrepTool = new ASTGrepTool();
    const workflowEngine = WorkflowEngine.getInstance(context);
    const mcpManager = MCPManager.getInstance(context);

    // Register ultrawork workflow
    workflowEngine.registerWorkflow(createUltraworkWorkflow());

    // Initialize Week 5: UI components
    const statusBar = StatusBarManager.getInstance(context);
    const projectInfo = await ProjectDetector.detectProject();

    // Update status bar
    if (projectInfo) {
        console.log(`Detected ${projectInfo.type} project`);
    }

    // Add logger to subscriptions for disposal
    context.subscriptions.push({
        dispose: () => loggerInstance.dispose()
    });

    loggerInstance.success('OmO Extension activated successfully!');
    console.log('✓ OmO Extension activated');

    // Get user's subscription and config
    const subscription = await subscriptionManager.getSubscription();
    const config = await configManager.getConfig();

    console.log(`✓ Detected tier: ${subscription.tier}`);
    console.log(`✓ Available agents: ${Object.keys(config.agents).length}`);
    console.log(`✓ Active accounts: ${multiAccountManager.getAccountCount()}`);
    console.log(`✓ LSP servers: ${lspManager.getActiveLanguages().join(', ') || 'none'}`);
    console.log(`✓ Registered agents: ${agentManager.getAllAgents().length}`);
    console.log(`✓ Supermemory: ${supermemory.getMemoryCount()} memories`);
    console.log(`✓ Workflows: ${workflowEngine.getWorkflows().length}`);
    console.log(`✓ MCP servers: ${mcpManager.getEnabledServers().length} enabled`);
    console.log(`✓ Project: ${projectInfo.type}${projectInfo.framework ? ` (${projectInfo.framework})` : ''}`);
    console.log(`✓ Status bar: Active`);

    // Register hello world command (for testing)
    const helloWorldCommand = vscode.commands.registerCommand(
        'omo.helloWorld',
        async () => {
            const tierEmoji = subscription.tier === 'pro' ? '⭐' : subscription.tier === 'enterprise' ? '🏢' : '🆓';
            const lspCount = lspManager.getActiveLanguages().length;
            const agentCount = agentManager.getAllAgents().length;
            vscode.window.showInformationMessage(
                `${tierEmoji} OmO is ready! Tier: ${subscription.tier.toUpperCase()} | Agents: ${agentCount} | LSP: ${lspCount}`
            );
        }
    );

    // Register show config command
    const showConfigCommand = vscode.commands.registerCommand(
        'omo.showConfig',
        async () => {
            const config = await configManager.getConfig();
            const doc = await vscode.workspace.openTextDocument({
                content: JSON.stringify(config, null, 2),
                language: 'json'
            });
            await vscode.window.showTextDocument(doc);
        }
    );

    // Register show status command
    const showStatusCommand = vscode.commands.registerCommand(
        'omo.showStatus',
        async () => {
            // Get version from package.json
            const packageJson = require('../package.json');
            const version = packageJson.version;

            const agents = agentManager.getAllAgents();
            const lspLanguages = lspManager.getActiveLanguages();
            const accountCount = multiAccountManager.getAccountCount();

            const status = `# OmO System Status

**Subscription:** ${subscription.tier.toUpperCase()}
**Active Agents:** ${agents.length}
${agents.map(a => `  - ${a.name}`).join('\n')}

**LSP Servers:** ${lspLanguages.length}
${lspLanguages.map(l => `  - ${l}`).join('\n') || '  - None active'}

**Accounts:** ${accountCount}
**Background Tasks:** ${config.backgroundTasks ? 'Enabled' : 'Disabled'}
**Supermemory:** ${supermemory.getMemoryCount()} memories
**Workflows:** ${workflowEngine.getWorkflows().length}
**MCP Servers:** ${mcpManager.getEnabledServers().length} enabled

**Extension Version:** ${version}
**Bundle Size:** 373KB
`;
            const doc = await vscode.workspace.openTextDocument({
                content: status,
                language: 'markdown'
            });
            await vscode.window.showTextDocument(doc);
        }
    );

    // Supermemory init command
    const supermemoryInitCommand = vscode.commands.registerCommand(
        'omo.supermemoryInit',
        async () => {
            vscode.window.showInformationMessage('Indexing codebase...');
            const count = await supermemory.initializeCodebaseIndex();
            vscode.window.showInformationMessage(`✓ Indexed ${count} files into Supermemory`);
        }
    );

    // Auth commands
    const { AntigravityAuthManager } = require('./core/antigravity-auth-manager');
    const authManager = AntigravityAuthManager.getInstance();

    const checkAuthCommand = vscode.commands.registerCommand(
        'omo.checkAuthentication',
        async () => {
            const status = await authManager.getAuthStatus();
            const message = status.authenticated
                ? `✓ Authenticated via ${status.method}\n${status.email ? `Email: ${status.email}` : ''}`
                : '✗ Not authenticated. Using free tier.';
            vscode.window.showInformationMessage(message);
        }
    );

    const loginCommand = vscode.commands.registerCommand(
        'omo.login',
        async () => {
            const success = await authManager.promptLogin();
            if (success) {
                // Refresh subscription after login
                subscriptionManager.invalidateCache();
                statusBar.refresh();
            }
        }
    );

    const refreshTokenCommand = vscode.commands.registerCommand(
        'omo.refreshToken',
        async () => {
            await authManager.refreshToken();
            vscode.window.showInformationMessage('✓ OAuth token refreshed');
        }
    );

    // OpenCode Zen commands
    const { OpenCodeZenProvider } = require('./ai/providers/opencode-zen-provider');

    const configureZenCommand = vscode.commands.registerCommand(
        'omo.zen.configure',
        async () => {
            const config = vscode.workspace.getConfiguration('omo');
            const currentKey = config.get<string>('apiKeys.opencodeZen', '');

            const apiKey = await vscode.window.showInputBox({
                prompt: 'Enter your OpenCode Zen API Key',
                value: currentKey,
                password: true,
                placeHolder: 'zen_xxxxxxxxxxxxx'
            });

            if (apiKey) {
                await config.update('apiKeys.opencodeZen', apiKey, vscode.ConfigurationTarget.Global);
                await config.update('zen.enabled', true, vscode.ConfigurationTarget.Global);
                vscode.window.showInformationMessage('✓ OpenCode Zen configured! API key saved.');
            }
        }
    );

    const testZenConnectionCommand = vscode.commands.registerCommand(
        'omo.zen.testConnection',
        async () => {
            const config = vscode.workspace.getConfiguration('omo');
            const apiKey = config.get<string>('apiKeys.opencodeZen');

            if (!apiKey) {
                vscode.window.showErrorMessage('❌ OpenCode Zen API key not configured. Run "OmO: Configure OpenCode Zen" first.');
                return;
            }

            const provider = new OpenCodeZenProvider(apiKey);
            vscode.window.showInformationMessage('Testing OpenCode Zen connection...');

            try {
                const isAvailable = await provider.isAvailable();
                if (isAvailable) {
                    vscode.window.showInformationMessage('✓ OpenCode Zen connection successful!');
                } else {
                    vscode.window.showErrorMessage('❌ OpenCode Zen connection failed. Check your API key.');
                }
            } catch (error: any) {
                vscode.window.showErrorMessage(`❌ OpenCode Zen error: ${error.message}`);
            }
        }
    );

    const listZenModelsCommand = vscode.commands.registerCommand(
        'omo.zen.listModels',
        async () => {
            const config = vscode.workspace.getConfiguration('omo');
            const apiKey = config.get<string>('apiKeys.opencodeZen');

            if (!apiKey) {
                vscode.window.showErrorMessage('❌ OpenCode Zen API key not configured. Run "OmO: Configure OpenCode Zen" first.');
                return;
            }

            const provider = new OpenCodeZenProvider(apiKey);
            vscode.window.showInformationMessage('Fetching OpenCode Zen models...');

            try {
                const models = await provider.getModels();

                if (models.length === 0) {
                    vscode.window.showWarningMessage('No models available from OpenCode Zen');
                    return;
                }

                // Show models in a quickpick
                const selectedModel = await vscode.window.showQuickPick(models, {
                    placeHolder: 'Select a model to use',
                    title: `OpenCode Zen Models (${models.length} available)`
                });

                if (selectedModel) {
                    await config.update('zen.preferredModel', selectedModel, vscode.ConfigurationTarget.Global);
                    vscode.window.showInformationMessage(`✓ Selected model: ${selectedModel}`);
                }
            } catch (error: any) {
                vscode.window.showErrorMessage(`❌ Failed to fetch models: ${error.message}`);
            }
        }
    );


    context.subscriptions.push(
        helloWorldCommand,
        showConfigCommand,
        showStatusCommand,
        supermemoryInitCommand,
        checkAuthCommand,
        loginCommand,
        refreshTokenCommand,
        configureZenCommand,
        testZenConnectionCommand,
        listZenModelsCommand,
        statusBar,
        {
            dispose: () => lspManager.dispose()
        }
    );

    console.log('✓ Oh My OpenCode activated successfully!');
}

/**
 * Extension deactivation - cleanup on unload
 */
export function deactivate() {
    console.log('👋 Oh My OpenCode deactivating...');
}
