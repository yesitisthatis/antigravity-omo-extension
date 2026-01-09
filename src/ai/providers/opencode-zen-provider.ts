import { OpenCodeZenClient } from '../../integrations/opencode-zen-client';

/**
 * AI Provider interface
 */
export interface AIProvider {
    name: string;
    authenticate(): Promise<boolean>;
    generateCode(prompt: string, context?: string): Promise<string>;
    isAvailable(): Promise<boolean>;
    getModels(): Promise<string[]>;
}

/**
 * OpenCode Zen AI Provider
 * Uses OpenCode's curated model gateway
 */
export class OpenCodeZenProvider implements AIProvider {
    name = 'OpenCode Zen';
    private client: OpenCodeZenClient;
    private selectedModel: string = 'gpt-4-turbo';

    constructor(apiKey?: string) {
        this.client = new OpenCodeZenClient();
        if (apiKey) {
            this.client.setApiKey(apiKey);
        }
    }

    /**
     * Authenticate with OpenCode Zen
     */
    async authenticate(): Promise<boolean> {
        try {
            return await this.client.testConnection();
        } catch (error) {
            console.error('OpenCode Zen authentication failed:', error);
            return false;
        }
    }

    /**
     * Generate code using selected model
     */
    async generateCode(prompt: string, context?: string): Promise<string> {
        const messages = [];

        if (context) {
            messages.push({
                role: 'system',
                content: context
            });
        }

        messages.push({
            role: 'user',
            content: prompt
        });

        try {
            const response = await this.client.chatCompletion(
                this.selectedModel,
                messages,
                {
                    temperature: 0.7,
                    max_tokens: 2000
                }
            );

            return response.choices[0].message.content;
        } catch (error) {
            console.error('Code generation failed:', error);
            throw error;
        }
    }

    /**
     * Check if OpenCode Zen is available
     */
    async isAvailable(): Promise<boolean> {
        return this.client.isAuthenticated() && await this.client.testConnection();
    }

    /**
     * Get list of available models
     */
    async getModels(): Promise<string[]> {
        try {
            const models = await this.client.getModels();
            return models.map((m: any) => m.id);
        } catch (error) {
            console.error('Failed to get models:', error);
            return [];
        }
    }

    /**
     * Set API key
     */
    setApiKey(apiKey: string): void {
        this.client.setApiKey(apiKey);
    }

    /**
     * Select model to use
     */
    setModel(model: string): void {
        this.selectedModel = model;
    }

    /**
     * Get current model
     */
    getSelectedModel(): string {
        return this.selectedModel;
    }

    /**
     * Get provider status
     */
    getStatus(): any {
        return {
            ...this.client.getStatus(),
            selectedModel: this.selectedModel
        };
    }
}
