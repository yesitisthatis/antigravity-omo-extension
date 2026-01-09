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

/**
 * Extension activation - called when extension is first loaded
 */
export async function activate(context: vscode.ExtensionContext) {
    console.log('🚀 Oh My OpenCode for Antigravity is activating...');

    // Initialize core managers
    const subscriptionManager = SubscriptionManager.getInstance(context);
    const configManager = ConfigManager.getInstance(context);
    const multiAccountManager = MultiAccountManager.getInstance(context);
    const endpointManager = EndpointFallbackManager.getInstance();

    // Initialize LSP
    const lspManager = LSPManager.getInstance(context);
    await lspManager.initialize();

    // Initialize LSP tools
    const hoverTool = new LSPHoverTool(context);
    const gotoDefTool = new LSPGotoDefinitionTool(context);
    const findRefsTool = new LSPFindReferencesTool(context);
    const renameTool = new LSPRenameTool(context);

    // Get user's subscription and config
    const subscription = await subscriptionManager.getSubscription();
    const config = await configManager.getConfig();

    console.log(`✓ Detected tier: ${subscription.tier}`);
    console.log(`✓ Available agents: ${Object.keys(config.agents).length}`);
    console.log(`✓ Active accounts: ${multiAccountManager.getAccountCount()}`);
    console.log(`✓ LSP servers: ${lspManager.getActiveLanguages().join(', ') || 'none'}`);

    // Register hello world command (for testing)
    const helloWorldCommand = vscode.commands.registerCommand(
        'omo.helloWorld',
        async () => {
            const tierEmoji = subscription.tier === 'pro' ? '⭐' : subscription.tier === 'enterprise' ? '🏢' : '🆓';
            const lspCount = lspManager.getActiveLanguages().length;
            vscode.window.showInformationMessage(
                `${tierEmoji} OmO is ready! Tier: ${subscription.tier.toUpperCase()} | Agents: ${Object.keys(config.agents).length} | LSP: ${lspCount}`
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

    context.subscriptions.push(
        helloWorldCommand,
        showConfigCommand,
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

