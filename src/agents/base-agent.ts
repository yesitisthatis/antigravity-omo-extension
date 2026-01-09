import * as vscode from 'vscode';
import { ConfigManager, AgentConfig } from '../core/config-manager';

/**
 * Agent execution context
 */
export interface AgentContext {
    task: string;
    files?: string[];
    tools?: string[];
    maxTokens?: number;
}

/**
 * Agent response
 */
export interface AgentResponse {
    success: boolean;
    result: string;
    tokensUsed: number;
    cost: number;
    toolCalls?: ToolCall[];
}

/**
 * Tool call from agent
 */
export interface ToolCall {
    tool: string;
    arguments: Record<string, any>;
    result?: any;
}

/**
 * Base Agent class
 */
export abstract class BaseAgent {
    protected config: AgentConfig;
    protected configManager: ConfigManager;

    constructor(
        public readonly name: string,
        protected context: vscode.ExtensionContext
    ) {
        this.configManager = ConfigManager.getInstance(context);
        // Will be loaded in initialize()
        this.config = {} as AgentConfig;
    }

    /**
     * Initialize agent with configuration
     */
    async initialize(): Promise<void> {
        const fullConfig = await this.configManager.getConfig();
        const agentConfig = fullConfig.agents[this.getAgentKey()];

        if (!agentConfig) {
            throw new Error(`Agent ${this.name} not configured`);
        }

        this.config = agentConfig;
        console.log(`✓ Initialized agent: ${this.name} (${this.config.model})`);
    }

    /**
     * Get agent key from config
     */
    protected abstract getAgentKey(): string;

    /**
     * Execute agent task
     */
    async execute(context: AgentContext): Promise<AgentResponse> {
        try {
            const { logger } = require('../core/logger');
            logger.agent(this.name, `Executing: ${context.task.substring(0, 100)}...`);

            const startTime = Date.now();

            // Use AI provider if available (Zen → Gemini → fallback)
            const { AIProviderManager } = require('../core/ai-provider-manager');
            const providerManager = AIProviderManager.getInstance();
            const provider = await providerManager.getProvider();

            if (provider) {
                const model = await providerManager.getCurrentModel();
                logger.provider(provider.name, `Using model: ${model}`);
            }

            const result = await this.doExecute(context);
            const duration = Date.now() - startTime;

            logger.success(`${this.name} completed in ${duration}ms`);

            // Track cost
            await this.configManager.trackCost(this.config.model, result.tokensUsed);

            return result;
        } catch (error) {
            const { logger } = require('../core/logger');
            logger.error(`${this.name} failed:`, error);
            return {
                success: false,
                result: `Error: ${error instanceof Error ? error.message : 'Unknown'}`,
                tokensUsed: 0,
                cost: 0
            };
        }
    }

    /**
     * Actual execution logic (to be implemented by subclasses)
     */
    protected abstract doExecute(context: AgentContext): Promise<AgentResponse>;

    /**
     * Get system prompt for this agent
     */
    protected abstract getSystemPrompt(): string;

    /**
     * Get available tools for this agent
     */
    protected getTools(): string[] {
        return this.config.tools || [];
    }

    /**
     * Estimate token count (rough approximation)
     */
    protected estimateTokens(text: string): number {
        // Rough estimate: ~4 characters per token
        return Math.ceil(text.length / 4);
    }

    /**
     * Format tool results for agent
     */
    protected formatToolResult(toolCall: ToolCall): string {
        return `Tool: ${toolCall.tool}\nResult: ${JSON.stringify(toolCall.result, null, 2)}`;
    }
}
