import { OpenCodeZenClient } from '../../integrations/opencode-zen-client';
import * as vscode from 'vscode';

/**
 * OpenCode Zen AI Provider
 * Uses OpenCode's curated model gateway
 */
export class OpenCodeZenProvider {
    name = 'OpenCode Zen';
    private client: OpenCodeZenClient;
    private selectedModel: string;

    constructor(apiKey?: string) {
        this.client = new OpenCodeZenClient();
        if (apiKey) {
            this.client.setApiKey(apiKey);
        }

        // Get preferred model from settings
        const config = vscode.workspace.getConfiguration('omo');
        this.selectedModel = config.get<string>('zen.preferredModel', 'claude-sonnet-4-5');
    }

    /**
     * Check if provider is available
     */
    async isAvailable(): Promise<boolean> {
        try {
            return await this.client.testConnection();
        } catch (error) {
            console.error('OpenCode Zen not available:', error);
            return false;
        }
    }

    /**
     * Generate code using selected model
     */
    async generateCode(prompt: string, context: any = {}): Promise<string> {
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

            return response.choices[0]?.message?.content || 'No response';
        } catch (error) {
            console.error('Code generation failed:', error);
            throw error;
        }
    }

    /**
     * Set model selection
     */
    setModel(model: string): void {
        this.selectedModel = model;
    }

    /**
     * Get list of available models
     */
    async getModels(): Promise<string[]> {
        try {
            const models = await this.client.getModels();
            return models.map((m: any) => m.id || m.name);
        } catch (error) {
            console.error('Failed to fetch models:', error);
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
