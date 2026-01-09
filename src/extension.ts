import * as vscode from 'vscode';
import { SubscriptionManager } from './core/subscription-manager';
import { ConfigManager } from './core/config-manager';
import { MultiAccountManager } from './core/multi-account-manager';
import { EndpointFallbackManager } from './core/endpoint-fallback';

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

    // Get user's subscription and config
    const subscription = await subscriptionManager.getSubscription();
    const config = await configManager.getConfig();

    console.log(`✓ Detected tier: ${subscription.tier}`);
    console.log(`✓ Available agents: ${Object.keys(config.agents).length}`);
    console.log(`✓ Active accounts: ${multiAccountManager.getAccountCount()}`);

    // Register hello world command (for testing)
    const helloWorldCommand = vscode.commands.registerCommand(
        'omo.helloWorld',
        async () => {
            const tierEmoji = subscription.tier === 'pro' ? '⭐' : subscription.tier === 'enterprise' ? '🏢' : '🆓';
            vscode.window.showInformationMessage(
                `${tierEmoji} OmO is ready! Tier: ${subscription.tier.toUpperCase()} | Agents: ${Object.keys(config.agents).length}`
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

    context.subscriptions.push(helloWorldCommand, showConfigCommand);

    console.log('✓ Oh My OpenCode activated successfully!');
}

/**
 * Extension deactivation - cleanup on unload
 */
export function deactivate() {
    console.log('👋 Oh My OpenCode deactivating...');
}

