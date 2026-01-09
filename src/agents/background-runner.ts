import * as vscode from 'vscode';
import { BaseAgent, AgentContext, AgentResponse } from './base-agent';
import { SubscriptionManager, SubscriptionTier } from '../core/subscription-manager';

/**
 * Background task status
 */
export enum TaskStatus {
    PENDING = 'pending',
    RUNNING = 'running',
    COMPLETED = 'completed',
    FAILED = 'failed',
    CANCELLED = 'cancelled'
}

/**
 * Background task
 */
export interface BackgroundTask {
    id: string;
    agent: BaseAgent;
    context: AgentContext;
    status: TaskStatus;
    result?: AgentResponse;
    startTime?: number;
    endTime?: number;
}

/**
 * Background task runner (Pro tier only)
 */
export class BackgroundTaskRunner {
    private static instance: BackgroundTaskRunner;
    private tasks: Map<string, BackgroundTask> = new Map();
    private runningTasks: Set<string> = new Set();
    private subscriptionManager: SubscriptionManager;
    private maxConcurrent = 5; // Pro tier limit

    private constructor(private context: vscode.ExtensionContext) {
        this.subscriptionManager = SubscriptionManager.getInstance(context);
    }

    static getInstance(context: vscode.ExtensionContext): BackgroundTaskRunner {
        if (!BackgroundTaskRunner.instance) {
            BackgroundTaskRunner.instance = new BackgroundTaskRunner(context);
        }
        return BackgroundTaskRunner.instance;
    }

    /**
     * Start a background task
     */
    async startTask(agent: BaseAgent, context: AgentContext): Promise<string> {
        // Check if background tasks are enabled
        const subscription = await this.subscriptionManager.getSubscription();
        const capabilities = this.subscriptionManager.getTierCapabilities(subscription.tier);

        if (!capabilities.backgroundTasks) {
            throw new Error('Background tasks require Pro tier');
        }

        // Check concurrent limit
        if (this.runningTasks.size >= this.maxConcurrent) {
            throw new Error(`Maximum concurrent tasks (${this.maxConcurrent}) reached`);
        }

        // Create task
        const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const task: BackgroundTask = {
            id: taskId,
            agent,
            context,
            status: TaskStatus.PENDING
        };

        this.tasks.set(taskId, task);

        // Start execution in background
        this.executeTask(taskId);

        console.log(`✓ Background task started: ${taskId} (${agent.name})`);

        vscode.window.showInformationMessage(
            `⚡ Background task started: ${agent.name}`
        );

        return taskId;
    }

    /**
     * Execute task in background
     */
    private async executeTask(taskId: string): Promise<void> {
        const task = this.tasks.get(taskId);
        if (!task) return;

        try {
            task.status = TaskStatus.RUNNING;
            task.startTime = Date.now();
            this.runningTasks.add(taskId);

            // Execute agent
            const result = await task.agent.execute(task.context);

            task.status = TaskStatus.COMPLETED;
            task.result = result;
            task.endTime = Date.now();

            console.log(`✓ Background task completed: ${taskId}`);

            vscode.window.showInformationMessage(
                `✓ ${task.agent.name} completed background task`
            );
        } catch (error) {
            task.status = TaskStatus.FAILED;
            task.endTime = Date.now();
            task.result = {
                success: false,
                result: error instanceof Error ? error.message : 'Unknown error',
                tokensUsed: 0,
                cost: 0
            };

            console.error(`✗ Background task failed: ${taskId}`, error);

            vscode.window.showErrorMessage(
                `✗ ${task.agent.name} background task failed`
            );
        } finally {
            this.runningTasks.delete(taskId);
        }
    }

    /**
     * Get task status
     */
    getTaskStatus(taskId: string): BackgroundTask | undefined {
        return this.tasks.get(taskId);
    }

    /**
     * Get task output
     */
    getTaskOutput(taskId: string): AgentResponse | null {
        const task = this.tasks.get(taskId);
        return task?.result || null;
    }

    /**
     * Cancel task
     */
    cancelTask(taskId: string): boolean {
        const task = this.tasks.get(taskId);
        if (!task) return false;

        if (task.status === TaskStatus.RUNNING) {
            // Note: Actual cancellation would need abort mechanism
            task.status = TaskStatus.CANCELLED;
            this.runningTasks.delete(taskId);
            console.log(`✓ Cancelled task: ${taskId}`);
            return true;
        }

        return false;
    }

    /**
     * Get all tasks
     */
    getAllTasks(): BackgroundTask[] {
        return Array.from(this.tasks.values());
    }

    /**
     * Get running tasks
     */
    getRunningTasks(): BackgroundTask[] {
        return this.getAllTasks().filter(t => t.status === TaskStatus.RUNNING);
    }

    /**
     * Clear completed tasks
     */
    clearCompleted(): void {
        for (const [id, task] of this.tasks) {
            if (task.status === TaskStatus.COMPLETED || task.status === TaskStatus.FAILED) {
                this.tasks.delete(id);
            }
        }
        console.log('✓ Cleared completed background tasks');
    }
}
