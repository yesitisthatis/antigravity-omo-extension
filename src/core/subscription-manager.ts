import * as vscode from 'vscode';

/**
 * User subscription tier
 */
export enum SubscriptionTier {
    FREE = 'free',
    PRO = 'pro',
    ENTERPRISE = 'enterprise'
}

/**
 * Subscription information from Antigravity
 */
export interface SubscriptionInfo {
    tier: SubscriptionTier;
    availableModels: string[];
    rateLimits: {
        requestsPerMinute: number;
        requestsPerDay: number;
    };
    enabledFeatures: string[];
    monthlyCostCap: number; // USD
}

/**
 * Tier capabilities configuration
 */
export interface TierCapabilities {
    models: string[];
    maxAgents: number;
    backgroundTasks: boolean;
    mcps: string[];
    monthlyCostCap: number;
    features: string[];
}

/**
 * Manages user subscription and tier detection
 */
export class SubscriptionManager {
    private static instance: SubscriptionManager;
    private cachedSubscription: SubscriptionInfo | null = null;
    private cacheExpiry: number = 0;
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    private constructor(private context: vscode.ExtensionContext) { }

    static getInstance(context: vscode.ExtensionContext): SubscriptionManager {
        if (!SubscriptionManager.instance) {
            SubscriptionManager.instance = new SubscriptionManager(context);
        }
        return SubscriptionManager.instance;
    }

    /**
     * Build the configuration change listener
     */
    public createConfigListener(): vscode.Disposable {
        return vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('omo.tier')) {
                console.log('OmO: Subscription tier configuration changed. Refreshing...');
                this.invalidateCache();
            }
        });
    }

    /**
     * Get user's subscription information
     */
    async getSubscription(): Promise<SubscriptionInfo> {
        // Check cache first
        if (this.cachedSubscription && Date.now() < this.cacheExpiry) {
            return this.cachedSubscription;
        }

        try {
            // TODO: In production, get actual Antigravity OAuth token
            // For now, detect from Antigravity environment
            const subscription = await this.detectSubscriptionTier();

            // Cache the result
            this.cachedSubscription = subscription;
            this.cacheExpiry = Date.now() + this.CACHE_DURATION;

            return subscription;
        } catch (error) {
            console.error('Failed to get subscription:', error);
            // Fallback to free tier on error
            return this.getFreeTierSubscription();
        }
    }

    /**
     * Detect subscription tier from Antigravity
     */
    private async detectSubscriptionTier(): Promise<SubscriptionInfo> {
        // Priority 1: Check manual tier override in settings
        const tier = await this.detectTierFromEnvironment();

        // Return detected tier
        return this.getTierSubscription(tier);
    }

    /**
     * Detect tier from environment (OAuth + settings)
     */
    private async detectTierFromEnvironment(): Promise<SubscriptionTier> {
        const config = vscode.workspace.getConfiguration('omo');
        const configuredTier = config.get<string>('tier');
        const preferManualKey = config.get<boolean>('auth.preferManualApiKey', false);

        // Check if manual API key is provided
        const manualKey = config.get<string>('apiKeys.gemini');

        // Priority 1: Manual API key (if preferManualApiKey is true)
        if (preferManualKey && manualKey) {
            if (configuredTier === 'pro') return SubscriptionTier.PRO;
            if (configuredTier === 'enterprise') return SubscriptionTier.ENTERPRISE;
        }

        // Priority 2: Check Antigravity OAuth authentication
        const { AntigravityAuthManager } = require('./antigravity-auth-manager');
        const authManager = AntigravityAuthManager.getInstance();

        if (await authManager.isAuthenticated()) {
            // Authenticated users get Pro tier automatically
            console.log('✓ Antigravity OAuth detected - Pro tier enabled');

            // If user manually set to Enterprise, honor it
            if (configuredTier === 'enterprise') return SubscriptionTier.ENTERPRISE;

            // Otherwise, OAuth gives Pro tier
            return SubscriptionTier.PRO;
        }

        // Priority 3: Manual API key (if no OAuth)
        if (manualKey) {
            if (configuredTier === 'pro') return SubscriptionTier.PRO;
            if (configuredTier === 'enterprise') return SubscriptionTier.ENTERPRISE;
        }

        // Priority 4: Configured tier setting
        if (configuredTier === 'pro') return SubscriptionTier.PRO;
        if (configuredTier === 'enterprise') return SubscriptionTier.ENTERPRISE;

        // Default to free
        return SubscriptionTier.FREE;
    }

    /**
     * Get subscription info for a specific tier
     */
    private getTierSubscription(tier: SubscriptionTier): SubscriptionInfo {
        const capabilities = this.getTierCapabilities(tier);

        return {
            tier,
            availableModels: capabilities.models,
            rateLimits: this.getRateLimits(tier),
            enabledFeatures: capabilities.features,
            monthlyCostCap: capabilities.monthlyCostCap
        };
    }

    /**
     * Get free tier subscription
     */
    private getFreeTierSubscription(): SubscriptionInfo {
        return this.getTierSubscription(SubscriptionTier.FREE);
    }

    /**
     * Get rate limits for tier
     */
    private getRateLimits(tier: SubscriptionTier): { requestsPerMinute: number; requestsPerDay: number } {
        switch (tier) {
            case SubscriptionTier.FREE:
                return { requestsPerMinute: 10, requestsPerDay: 1000 };
            case SubscriptionTier.PRO:
                return { requestsPerMinute: 60, requestsPerDay: 10000 };
            case SubscriptionTier.ENTERPRISE:
                return { requestsPerMinute: -1, requestsPerDay: -1 }; // Unlimited
        }
    }

    /**
     * Get capabilities for each tier
     */
    getTierCapabilities(tier: SubscriptionTier): TierCapabilities {
        switch (tier) {
            case SubscriptionTier.FREE:
                return {
                    models: [
                        'google/gemini-flash',
                        'opencode/grok-code'
                    ],
                    maxAgents: 2,
                    backgroundTasks: false,
                    mcps: ['grep_app'],
                    monthlyCostCap: 0.0,
                    features: ['basic_lsp', 'simple_agents']
                };

            case SubscriptionTier.PRO:
                return {
                    models: [
                        'google/gemini-3-pro-high',
                        'anthropic/claude-sonnet-4-5',
                        'openai/gpt-5.2-medium',
                        'google/gemini-flash',
                        'opencode/grok-code'
                    ],
                    maxAgents: 10,
                    backgroundTasks: true,
                    mcps: ['exa', 'context7', 'grep_app'],
                    monthlyCostCap: 50.0,
                    features: [
                        'advanced_lsp',
                        'multi_agent',
                        'background_execution',
                        'supermemory',
                        'workflows'
                    ]
                };

            case SubscriptionTier.ENTERPRISE:
                return {
                    models: ['*'], // All models
                    maxAgents: -1, // Unlimited
                    backgroundTasks: true,
                    mcps: ['*'], // All MCPs
                    monthlyCostCap: -1, // Unlimited
                    features: ['*'] // All features
                };
        }
    }

    /**
     * Check if a feature is enabled for current tier
     */
    async isFeatureEnabled(feature: string): Promise<boolean> {
        const subscription = await this.getSubscription();
        const capabilities = this.getTierCapabilities(subscription.tier);

        if (capabilities.features.includes('*')) return true;
        return capabilities.features.includes(feature);
    }

    /**
     * Check if a model is available for current tier
     */
    async isModelAvailable(model: string): Promise<boolean> {
        const subscription = await this.getSubscription();
        const capabilities = this.getTierCapabilities(subscription.tier);

        if (capabilities.models.includes('*')) return true;
        return capabilities.models.includes(model);
    }

    /**
     * Invalidate cache (force refresh on next request)
     */
    invalidateCache(): void {
        this.cachedSubscription = null;
        this.cacheExpiry = 0;
    }
}
