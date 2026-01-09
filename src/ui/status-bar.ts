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
        const subscriptionManager = SubscriptionManager.getInstance(this.context);
        const agentManager = AgentManager.getInstance(this.context);
        const supermemory = SupermemoryManager.getInstance(this.context);

        const subscription = await subscriptionManager.getSubscription();
        const agentCount = agentManager.getAllAgents().length;
        const memoryCount = supermemory.getMemoryCount();

        // Tier emoji
        const tierEmoji = this.getTierEmoji(subscription.tier);

        // Status text
        this.statusBarItem.text = `${tierEmoji} OmO | ${agentCount} agents | ${memoryCount} mem`;
        this.statusBarItem.tooltip = `Oh My OpenCode\nTier: ${subscription.tier.toUpperCase()}\nAgents: ${agentCount}\nMemories: ${memoryCount}\n\nClick for details`;
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
