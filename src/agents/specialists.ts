import * as vscode from 'vscode';
import { BaseAgent, AgentContext, AgentResponse } from './base-agent';

/**
 * Oracle - Strategic debugging and architecture specialist (Pro tier)
 */
export class OracleAgent extends BaseAgent {
    constructor(context: vscode.ExtensionContext) {
        super('Oracle', context);
    }

    protected getAgentKey(): string {
        return 'oracle';
    }

    protected getSystemPrompt(): string {
        return `You are Oracle, the strategic debugging and architecture specialist.

Your expertise:
- Deep architectural analysis
- Strategic debugging approaches
- Design pattern recognition
- Performance optimization strategies
- Complex bug root cause analysis

You have access to all LSP tools for deep code inspection.
Focus on the "why" and "how should this be designed" rather than just "what's wrong".`;
    }

    protected async doExecute(context: AgentContext): Promise<AgentResponse> {
        const result = `Oracle analyzing: ${context.task}\n\n` +
            `Strategic debugging approach:\n` +
            `1. Architectural analysis\n` +
            `2. Pattern identification\n` +
            `3. Root cause investigation\n\n` +
            `[Pro tier agent - Production would use premium model]`;

        const tokens = this.estimateTokens(result);
        const cost = await this.configManager.estimateCost(this.config.model, tokens);

        return { success: true, result, tokensUsed: tokens, cost };
    }
}

/**
 * Explore - Fast code search specialist
 */
export class ExploreAgent extends BaseAgent {
    constructor(context: vscode.ExtensionContext) {
        super('Explore', context);
    }

    protected getAgentKey(): string {
        return 'explore';
    }

    protected getSystemPrompt(): string {
        return `You are Explore, the blazing-fast code search specialist.

Your capabilities:
- Lightning-fast codebase exploration
- Pattern matching and search
- Symbol finding across workspace
- Quick reference lookups

You use free models optimized for speed.
Tools: grep, AST-Grep, LSP find-references`;
    }

    protected async doExecute(context: AgentContext): Promise<AgentResponse> {
        const result = `Explore searching: ${context.task}\n\n` +
            `Fast search results:\n` +
            `- Pattern found in 3 files\n` +
            `- 15 references located\n\n` +
            `[Using free Grok Code model for speed]`;

        const tokens = this.estimateTokens(result);
        const cost = 0; // Free tier

        return { success: true, result, tokensUsed: tokens, cost };
    }
}

/**
 * Librarian - Documentation specialist
 */
export class LibrarianAgent extends BaseAgent {
    constructor(context: vscode.ExtensionContext) {
        super('Librarian', context);
    }

    protected getAgentKey(): string {
        return 'librarian';
    }

    protected getSystemPrompt(): string {
        return `You are Librarian, the documentation and knowledge specialist.

Your role:
- Explain code and concepts clearly
- Generate comprehensive documentation
- Understand codebase structure
- Answer "how does this work" questions

You have access to code search and documentation tools.`;
    }

    protected async doExecute(context: AgentContext): Promise<AgentResponse> {
        const result = `Librarian documenting: ${context.task}\n\n` +
            `Documentation generated:\n` +
            `- Overview section\n` +
            `- API documentation\n` +
            `- Usage examples\n\n` +
            `[Clear, comprehensive explanations]`;

        const tokens = this.estimateTokens(result);
        const cost = await this.configManager.estimateCost(this.config.model, tokens);

        return { success: true, result, tokensUsed: tokens, cost };
    }
}
