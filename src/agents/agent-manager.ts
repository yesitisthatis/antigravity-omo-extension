import * as vscode from 'vscode';
import { BaseAgent } from './base-agent';
import { SubscriptionManager } from '../core/subscription-manager';

/**
 * Agent registry - manages all available agents
 */
export class AgentManager {
    private static instance: AgentManager;
    private agents: Map<string, BaseAgent> = new Map();
    private subscriptionManager: SubscriptionManager;

    private constructor(private context: vscode.ExtensionContext) {
        this.subscriptionManager = SubscriptionManager.getInstance(context);
    }

    static getInstance(context: vscode.ExtensionContext): AgentManager {
        if (!AgentManager.instance) {
            AgentManager.instance = new AgentManager(context);
        }
        return AgentManager.instance;
    }

    /**
     * Register an agent
     */
    async registerAgent(agent: BaseAgent): Promise<void> {
        await agent.initialize();
        this.agents.set(agent.name.toLowerCase(), agent);
        console.log(`✓ Registered agent: ${agent.name}`);
    }

    /**
     * Get agent by name
     */
    getAgent(name: string): BaseAgent | undefined {
        return this.agents.get(name.toLowerCase());
    }

    /**
     * Get all available agents for current tier
     */
    async getAvailableAgents(): Promise<BaseAgent[]> {
        const subscription = await this.subscriptionManager.getSubscription();
        const capabilities = this.subscriptionManager.getTierCapabilities(subscription.tier);

        const available: BaseAgent[] = [];
        let count = 0;

        for (const agent of this.agents.values()) {
            if (capabilities.maxAgents === -1 || count < capabilities.maxAgents) {
                available.push(agent);
                count++;
            }
        }

        return available;
    }

    /**
     * Select best agent for task
     */
    async selectAgent(task: string): Promise<BaseAgent | null> {
        const available = await this.getAvailableAgents();

        if (available.length === 0) {
            return null;
        }

        // Task routing logic
        const taskLower = task.toLowerCase();

        // Search/exploration tasks
        if (taskLower.includes('find') || taskLower.includes('search') || taskLower.includes('where')) {
            const explore = this.getAgent('explore');
            if (explore) return explore;
        }

        // Debugging tasks
        if (taskLower.includes('debug') || taskLower.includes('error') || taskLower.includes('fix')) {
            const oracle = this.getAgent('oracle');
            if (oracle) return oracle;
        }

        // Documentation tasks
        if (taskLower.includes('document') || taskLower.includes('explain') || taskLower.includes('readme')) {
            const librarian = this.getAgent('librarian');
            if (librarian) return librarian;
        }

        // UI/Frontend tasks
        if (taskLower.includes('ui') || taskLower.includes('frontend') || taskLower.includes('component')) {
            const frontendEngineer = this.getAgent('frontend engineer');
            if (frontendEngineer) return frontendEngineer;
        }

        // Default to Sisyphus (orchestrator)
        return this.getAgent('sisyphus') || available[0];
    }

    /**
     * Get all registered agents
     */
    getAllAgents(): BaseAgent[] {
        return Array.from(this.agents.values());
    }

    /**
     * Unregister agent
     */
    unregisterAgent(name: string): void {
        this.agents.delete(name.toLowerCase());
        console.log(`✓ Unregistered agent: ${name}`);
    }

    /**
     * Clear all agents
     */
    clear(): void {
        this.agents.clear();
        console.log('✓ Cleared all agents');
    }
}
