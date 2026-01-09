import axios, { AxiosInstance } from 'axios';

/**
 * OpenCode Zen API response format
 */
interface ZenResponse {
    id: string;
    model: string;
    choices: Array<{
        message: {
            role: string;
            content: string;
        };
        finish_reason: string;
    }>;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

/**
 * OpenCode Zen model information
 */
interface ZenModel {
    id: string;
    name: string;
    provider: string;
    context_window: number;
    pricing: {
        input: number;
        output: number;
    };
}

/**
 * OpenCode Zen API Client
 * Connects to https://opencode.ai/zen/v1/
 */
export class OpenCodeZenClient {
    private client: AxiosInstance;
    private apiKey: string | null = null;
    private baseUrl = 'https://opencode.ai/zen/v1';

    constructor() {
        this.client = axios.create({
            baseURL: this.baseUrl,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    /**
     * Set API key for authentication
     */
    setApiKey(apiKey: string): void {
        this.apiKey = apiKey;
        this.client.defaults.headers.common['Authorization'] = `Bearer ${apiKey}`;
    }

    /**
     * Check if client is authenticated
     */
    isAuthenticated(): boolean {
        return this.apiKey !== null;
    }

    /**
     * Get list of available models
     */
    async getModels(): Promise<ZenModel[]> {
        try {
            const response = await this.client.get('/models');
            return response.data;
        } catch (error) {
            console.error('Failed to fetch Zen models:', error);
            throw new Error('Failed to fetch OpenCode Zen models');
        }
    }

    /**
     * Generate code completion
     * Uses OpenAI-compatible endpoint for GPT models
     */
    async chatCompletion(
        model: string,
        messages: Array<{ role: string; content: string }>,
        options: {
            temperature?: number;
            max_tokens?: number;
            stream?: boolean;
        } = {}
    ): Promise<ZenResponse> {
        if (!this.isAuthenticated()) {
            throw new Error('OpenCode Zen API key not set');
        }

        try {
            const response = await this.client.post('/chat/completions', {
                model: `opencode/${model}`,
                messages,
                temperature: options.temperature ?? 0.7,
                max_tokens: options.max_tokens ?? 2000,
                stream: options.stream ?? false
            });

            return response.data;
        } catch (error: any) {
            console.error('OpenCode Zen API error:', error.response?.data || error.message);
            throw new Error(`OpenCode Zen API error: ${error.response?.data?.error?.message || error.message}`);
        }
    }

    /**
     * Generate completion using Anthropic format (Claude models)
     */
    async anthropicCompletion(
        model: string,
        messages: Array<{ role: string; content: string }>,
        options: {
            max_tokens?: number;
            temperature?: number;
        } = {}
    ): Promise<any> {
        if (!this.isAuthenticated()) {
            throw new Error('OpenCode Zen API key not set');
        }

        try {
            const response = await this.client.post('/messages', {
                model: `opencode/${model}`,
                messages,
                max_tokens: options.max_tokens ?? 2000,
                temperature: options.temperature ?? 0.7
            });

            return response.data;
        } catch (error: any) {
            console.error('OpenCode Zen Anthropic API error:', error.response?.data || error.message);
            throw new Error(`OpenCode Zen API error: ${error.response?.data?.error?.message || error.message}`);
        }
    }

    /**
     * Test connection to OpenCode Zen
     */
    async testConnection(): Promise<boolean> {
        if (!this.isAuthenticated()) {
            return false;
        }

        try {
            await this.getModels();
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get API status
     */
    getStatus(): {
        authenticated: boolean;
        baseUrl: string;
        apiKey: string | null;
    } {
        return {
            authenticated: this.isAuthenticated(),
            baseUrl: this.baseUrl,
            apiKey: this.apiKey ? '***' + this.apiKey.slice(-4) : null
        };
    }
}
