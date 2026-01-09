import * as vscode from 'vscode';

/**
 * Extension activation - called when extension is first loaded
 */
export function activate(context: vscode.ExtensionContext) {
    console.log('🚀 Oh My OpenCode for Antigravity is activating...');

    // Register hello world command (for testing)
    const helloWorldCommand = vscode.commands.registerCommand(
        'omo.helloWorld',
        () => {
            vscode.window.showInformationMessage(
                '✨ OmO is ready! Multi-agent orchestration at your service.'
            );
        }
    );

    context.subscriptions.push(helloWorldCommand);

    console.log('✓ Oh My OpenCode activated successfully!');
}

/**
 * Extension deactivation - cleanup on unload
 */
export function deactivate() {
    console.log('👋 Oh My OpenCode deactivating...');
}
