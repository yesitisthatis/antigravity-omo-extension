import * as vscode from 'vscode';
import { SubscriptionManager, SubscriptionTier, TierCapabilities } from './subscription-manager';

/**
 * Model pricing (per 1k tokens)
 */
const MODEL_PRICING: Record<string, number> = {
    'google/gemini-flash': 0.0, // Free
    'opencode/grok-code': 0.0, // Free
    'google/gemini-3-flash': 0.000075,
    'google/gemini-3-pro-high': 0.0003,
    'anthropic/claude-sonnet-4-5': 0.003,
    'openai/gpt-5.2-medium': 0.01,
    'anthropic/claude-opus-4-5': 0.015
};

/**
 * Agent configuration for a specific tier
 */
export interface AgentConfig {
    name: string;
    model: string;
    description: string;
    temperature: number;
    tools?: string[];
}

/**
 * Complete tier-aware configuration
 */
export interface OmOConfig {
    agents: Record<string, AgentConfig>;
    backgroundTasks: boolean;
    maxConcurrentAgents: number;
    mcps: string[];
    models: string[];
    costTracking: boolean;
    monthlyCostCap: number;
}

/**
 * Manages tier-aware configuration
 */
export class ConfigManager {
    private static instance: ConfigManager;
    private subscriptionManager: SubscriptionManager;

    private constructor(private context: vscode.ExtensionContext) {
        this.subscriptionManager = SubscriptionManager.getInstance(context);
    }

    static getInstance(context: vscode.ExtensionContext): ConfigManager {
        if (!ConfigManager.instance) {
            ConfigManager.instance = new ConfigManager(context);
        }
        return ConfigManager.instance;
    }

    /**
     * Get complete configuration for user's tier
     */
    async getConfig(): Promise<OmOConfig> {
        const subscription = await this.subscriptionManager.getSubscription();
        const capabilities = this.subscriptionManager.getTierCapabilities(subscription.tier);

        switch (subscription.tier) {
            case SubscriptionTier.FREE:
                return this.getFreeTierConfig(capabilities);
            case SubscriptionTier.PRO:
                return this.getProTierConfig(capabilities);
            case SubscriptionTier.ENTERPRISE:
                return this.getEnterpriseTierConfig(capabilities);
        }
    }

    /**
     * Free tier configuration
     */
    private getFreeTierConfig(capabilities: TierCapabilities): OmOConfig {
        return {
            agents: {
                sisyphus: {
                    name: 'Sisyphus',
                    model: 'google/gemini-flash',
                    description: 'Main orchestrator - Free tier optimized',
                    temperature: 0.7
                },
                explore: {
                    name: 'Explore',
                    model: 'opencode/grok-code',
                    description: 'Fast codebase exploration',
                    temperature: 0.6,
                    tools: ['grep_search', 'ast_grep_search']
                }
            },
            backgroundTasks: false,
            maxConcurrentAgents: 1,
            mcps: ['grep_app'],
            models: capabilities.models,
            costTracking: false, // No cost on free tier
            monthlyCostCap: 0.0
        };
    }

    /**
     * Pro tier configuration
     */
    private getProTierConfig(capabilities: TierCapabilities): OmOConfig {
        return {
            agents: {
                sisyphus: {
                    name: 'Sisyphus',
                    model: 'anthropic/claude-opus-4-5-high',
                    description: 'Premium main orchestrator',
                    temperature: 0.7
                },
                oracle: {
                    name: 'Oracle',
                    model: 'openai/gpt-5.2-medium',
                    description: 'Strategic debugging specialist',
                    temperature: 0.8,
                    tools: ['lsp_*', 'ast_grep_*']
                },
                librarian: {
                    name: 'Librarian',
                    model: 'anthropic/claude-sonnet-4-5',
                    description: 'Documentation expert',
                    temperature: 0.6,
                    tools: ['context7_search', 'grep_app_search']
                },
                'frontend-ui-ux-engineer': {
                    name: 'Frontend Engineer',
                    model: 'google/gemini-3-pro-high',
                    description: 'UI/UX specialist',
                    temperature: 0.7,
                    tools: ['lsp_*']
                },
                explore: {
                    name: 'Explore',
                    model: 'opencode/grok-code',
                    description: 'Blazing fast exploration',
                    temperature: 0.6,
                    tools: ['grep_search', 'ast_grep_search']
                }
            },
            backgroundTasks: true,
            maxConcurrentAgents: 5,
            mcps: ['exa', 'context7', 'grep_app'],
            models: capabilities.models,
            costTracking: true,
            monthlyCostCap: 50.0
        };
    }

    /**
     * Enterprise tier configuration
     */
    private getEnterpriseTierConfig(capabilities: TierCapabilities): OmOConfig {
        const proConfig = this.getProTierConfig(capabilities);

        return {
            ...proConfig,
            maxConcurrentAgents: -1, // Unlimited
            monthlyCostCap: -1, // Unlimited
            mcps: ['*'] // All MCPs
        };
    }

    /**
     * Estimate cost for a task
     */
    async estimateCost(model: string, estimatedTokens: number): Promise<number> {
        const pricePerK = MODEL_PRICING[model] || 0.01; // Default to $0.01/1k
        return (estimatedTokens / 1000) * pricePerK;
    }

    /**
     * Get recommended model for task complexity
     */
    async getRecommendedModel(complexity: 'low' | 'medium' | 'high'): Promise<string> {
        const subscription = await this.subscriptionManager.getSubscription();
        const config = await this.getConfig();

        if (subscription.tier === SubscriptionTier.FREE) {
            // Always use free models
            return 'google/gemini-flash';
        }

        // Pro/Enterprise: Select based on complexity and budget
        const currentSpend = await this.getCurrentMonthSpend();
        const remainingBudget = config.monthlyCostCap - currentSpend;

        if (complexity === 'high' && remainingBudget > 5.0) {
            return 'openai/gpt-5.2-medium';
        } else if (complexity === 'medium' && remainingBudget > 1.0) {
            return 'anthropic/claude-sonnet-4-5';
        } else {
            // Budget-conscious choice
            return 'google/gemini-3-flash';
        }
    }

    /**
     * Get current month's spend (placeholder)
     */
    private async getCurrentMonthSpend(): Promise<number> {
        // TODO: Implement actual spend tracking
        const key = `spend_${new Date().getMonth()}_${new Date().getFullYear()}`;
        return this.context.globalState.get<number>(key, 0.0);
    }

    /**
     * Track cost of operation
     */
    async trackCost(model: string, tokensUsed: number): Promise<void> {
        const cost = await this.estimateCost(model, tokensUsed);
        const key = `spend_${new Date().getMonth()}_${new Date().getFullYear()}`;
        const currentSpend = await this.getCurrentMonthSpend();
        await this.context.globalState.update(key, currentSpend + cost);
    }
}
