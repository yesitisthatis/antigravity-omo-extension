import * as vscode from 'vscode';
import { SubscriptionManager } from '../core/subscription-manager';
import { AgentManager } from '../agents/agent-manager';
import { SupermemoryManager } from '../memory/supermemory';

/**
 * Status bar manager
 */
export class StatusBarManager {
    private static instance: StatusBarManager;
    private statusBarItem: vscode.StatusBarItem;

    private constructor(private context: vscode.ExtensionContext) {
        // Create status bar item (right side)
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
        this.statusBarItem.command = 'omo.showStatus';
        this.updateStatusBar();
        this.statusBarItem.show();

        // Update every 30 seconds
        setInterval(() => this.updateStatusBar(), 30000);
    }

    static getInstance(context: vscode.ExtensionContext): StatusBarManager {
        if (!StatusBarManager.instance) {
            StatusBarManager.instance = new StatusBarManager(context);
        }
        return StatusBarManager.instance;
    }

    /**
     * Update status bar display
     */
    async updateStatusBar(): Promise<void> {
        const config = vscode.workspace.getConfiguration('omo');
        const statusBarEnabled = config.get<boolean>('statusBar.enabled', true);

        if (!statusBarEnabled) {
            this.statusBarItem.hide();
            return;
        }

        const subscriptionManager = SubscriptionManager.getInstance(this.context);
        const agentManager = AgentManager.getInstance(this.context);
        const supermemory = SupermemoryManager.getInstance(this.context);

        const subscription = await subscriptionManager.getSubscription();
        const agentCount = agentManager.getAllAgents().length;
        const memoryCount = supermemory.getMemoryCount();

        // Tier emoji (with auth status if enabled)
        const showAuthStatus = config.get<boolean>('auth.showAuthStatus', true);
        let tierEmoji = this.getTierEmoji(subscription.tier);

        if (showAuthStatus) {
            const { AntigravityAuthManager } = require('../core/antigravity-auth-manager');
            const authManager = AntigravityAuthManager.getInstance();
            const authStatus = await authManager.getAuthStatus();

            if (authStatus.authenticated) {
                tierEmoji = authStatus.method === 'oauth' ? '🔐' : '🔑';
            }
        }

        // Status text
        this.statusBarItem.text = `OmO: ${tierEmoji} ${subscription.tier.toUpperCase()} | 👥 ${agentCount} agents | 🧠 ${memoryCount}`;
        this.statusBarItem.tooltip = `Oh My OpenCode\nTier: ${subscription.tier.toUpperCase()}\nAgents: ${agentCount}\nMemories: ${memoryCount}\n\nClick for details`;

        this.statusBarItem.show();
    }

    /**
     * Manually refresh status bar
     */
    refresh(): void {
        this.updateStatusBar();
    }

    /**
     * Get tier emoji
     */
    private getTierEmoji(tier: string): string {
        switch (tier) {
            case 'pro': return '⭐';
            case 'enterprise': return '🏢';
            default: return '🆓';
        }
    }

    /**
     * Show notification
     */
    showNotification(message: string, type: 'info' | 'warning' | 'error' = 'info'): void {
        switch (type) {
            case 'info':
                vscode.window.showInformationMessage(`OmO: ${message}`);
                break;
            case 'warning':
                vscode.window.showWarningMessage(`OmO: ${message}`);
                break;
            case 'error':
                vscode.window.showErrorMessage(`OmO: ${message}`);
                break;
        }
    }

    /**
     * Dispose
     */
    dispose(): void {
        this.statusBarItem.dispose();
    }
}
