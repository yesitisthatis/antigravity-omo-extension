import * as vscode from 'vscode';
import { BaseAgent, AgentContext, AgentResponse } from './base-agent';
import { AgentManager } from './agent-manager';

/**
 * Sisyphus - Main orchestrator agent
 * Breaks down complex tasks and delegates to specialists
 */
export class SisyphusAgent extends BaseAgent {
    private agentManager: AgentManager;

    constructor(context: vscode.ExtensionContext) {
        super('Sisyphus', context);
        this.agentManager = AgentManager.getInstance(context);
    }

    protected getAgentKey(): string {
        return 'sisyphus';
    }

    protected getSystemPrompt(): string {
        return `You are Sisyphus, the main orchestrator agent for OmO (Oh My OpenCode).

Your role:
- Break down complex tasks into manageable subtasks
- Delegate to specialist agents when appropriate
- Ensure task completion and continuity
- Coordinate multi-step workflows

Available specialist agents:
- Oracle: Debugging and architectural analysis (Pro tier)
- Librarian: Documentation and codebase knowledge
- Explore: Fast code search and pattern finding
- Frontend Engineer: UI/UX implementation (Pro tier)

Strategy:
1. Analyze the task complexity
2. If simple, execute directly
3. If complex, break into subtasks and delegate
4. Aggregate results and ensure coherence
5. Enforce TODO completion before finishing

You have access to all LSP tools and code modification capabilities.`;
    }

    protected async doExecute(context: AgentContext): Promise<AgentResponse> {
        const task = context.task;

        // Analyze task complexity
        const isComplex = this.isComplexTask(task);

        if (!isComplex) {
            // Execute directly
            return await this.executeSimpleTask(context);
        }

        // Complex task - break down and delegate
        return await this.executeComplexTask(context);
    }

    /**
     * Check if task is complex enough to delegate
     */
    private isComplexTask(task: string): boolean {
        const complexIndicators = [
            'refactor',
            'implement',
            'create',
            'add feature',
            'multiple files',
            'entire',
            'across'
        ];

        const taskLower = task.toLowerCase();
        return complexIndicators.some(indicator => taskLower.includes(indicator));
    }

    /**
     * Execute simple task directly
     */
    private async executeSimpleTask(context: AgentContext): Promise<AgentResponse> {
        // Placeholder: In production, this would call the AI model
        // For now, return a simulated response

        const result = `Sisyphus processed task: ${context.task}\n` +
            `This is a simple task that can be handled directly.\n` +
            `In production, this would invoke the AI model with LSP tools.`;

        const estimatedTokens = this.estimateTokens(result);
        const cost = await this.configManager.estimateCost(this.config.model, estimatedTokens);

        return {
            success: true,
            result,
            tokensUsed: estimatedTokens,
            cost
        };
    }

    /**
     * Execute complex task with delegation
     */
    private async executeComplexTask(context: AgentContext): Promise<AgentResponse> {
        const subtasks = this.breakdownTask(context.task);
        const results: string[] = [];
        let totalTokens = 0;
        let totalCost = 0;

        for (const subtask of subtasks) {
            // Select appropriate agent
            const agent = await this.agentManager.selectAgent(subtask.description);

            if (!agent || agent === this) {
                // Execute ourselves
                const response = await this.executeSimpleTask({
                    task: subtask.description,
                    files: context.files
                });
                results.push(response.result);
                totalTokens += response.tokensUsed;
                totalCost += response.cost;
            } else {
                // Delegate to specialist
                console.log(`→ Delegating to ${agent.name}: ${subtask.description}`);
                const response = await agent.execute({
                    task: subtask.description,
                    files: context.files
                });
                results.push(`[${agent.name}] ${response.result}`);
                totalTokens += response.tokensUsed;
                totalCost += response.cost;
            }
        }

        return {
            success: true,
            result: `Sisyphus orchestrated task completion:\n\n${results.join('\n\n')}`,
            tokensUsed: totalTokens,
            cost: totalCost
        };
    }

    /**
     * Break down task into subtasks
     */
    private breakdownTask(task: string): Array<{ description: string; type: string }> {
        // Simplified breakdown logic
        // In production, this would use AI to intelligently split tasks

        const subtasks: Array<{ description: string; type: string }> = [];

        if (task.toLowerCase().includes('refactor')) {
            subtasks.push(
                { description: 'Find all references using Explore', type: 'search' },
                { description: 'Analyze current implementation', type: 'analysis' },
                { description: 'Apply refactoring changes', type: 'modification' }
            );
        } else {
            // Default: single subtask
            subtasks.push({ description: task, type: 'general' });
        }

        return subtasks;
    }
}
