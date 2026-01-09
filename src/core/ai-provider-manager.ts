import * as vscode from 'vscode';
import { OpenCodeZenProvider } from '../ai/providers/opencode-zen-provider';

/**
 * AI Provider interface - all providers must implement this
 */
export interface AIProvider {
    name: string;
    isAvailable(): Promise<boolean>;
    generateCode(prompt: string, context: any): Promise<string>;
    getModels(): Promise<string[]>;
}

/**
 * Manages multiple AI providers and selects the best one
 */
export class AIProviderManager {
    private static instance: AIProviderManager;
    private providers: Map<string, AIProvider> = new Map();
    private config: vscode.WorkspaceConfiguration;

    private constructor() {
        this.config = vscode.workspace.getConfiguration('omo');
    }

    static getInstance(): AIProviderManager {
        if (!AIProviderManager.instance) {
            AIProviderManager.instance = new AIProviderManager();
        }
        return AIProviderManager.instance;
    }

    /**
     * Initialize all providers
     */
    async initialize(): Promise<void> {
        // Register Zen provider if configured
        const zenApiKey = this.config.get<string>('apiKeys.opencodeZen');
        if (zenApiKey) {
            const zenProvider = new OpenCodeZenProvider(zenApiKey);
            this.providers.set('zen', zenProvider);
            console.log('✓ Registered Zen provider');
        }

        // Future: Register Gemini, OpenAI, Anthropic providers here
    }

    /**
     * Get the best available provider based on settings
     */
    async getProvider(): Promise<AIProvider | null> {
        // Priority 1: Zen if enabled
        const zenEnabled = this.config.get<boolean>('zen.enabled', false);
        if (zenEnabled) {
            const zenProvider = this.providers.get('zen');
            if (zenProvider && await zenProvider.isAvailable()) {
                console.log('Using Zen provider');
                return zenProvider;
            }
        }

        // Priority 2: Gemini (if configured)
        // TODO: Add Gemini provider when ready

        // Priority 3: Fallback
        console.warn('No AI provider available');
        return null;
    }

    /**
     * Generate code using the best available provider
     */
    async generateCode(prompt: string, context: any = {}): Promise<string | null> {
        const provider = await this.getProvider();
        if (!provider) {
            return null;
        }

        try {
            return await provider.generateCode(prompt, context);
        } catch (error) {
            console.error(`Provider ${provider.name} failed:`, error);

            // Try fallback
            // TODO: Implement fallback logic
            return null;
        }
    }

    /**
     * Get current provider model
     */
    async getCurrentModel(): Promise<string> {
        const zenEnabled = this.config.get<boolean>('zen.enabled', false);
        if (zenEnabled) {
            return this.config.get<string>('zen.preferredModel', 'claude-sonnet-4-5');
        }

        // Default to gemini model
        return 'gemini-pro';
    }

    /**
     * Refresh configuration
     */
    refresh(): void {
        this.config = vscode.workspace.getConfiguration('omo');
    }
}
