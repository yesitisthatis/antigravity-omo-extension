import * as vscode from 'vscode';

/**
 * Memory entry
 */
export interface MemoryEntry {
    id: string;
    content: string;
    scope: 'user' | 'project' | 'session';
    tags: string[];
    timestamp: number;
    metadata?: Record<string, any>;
}

/**
 * Supermemory - Long-term memory system
 * Production would use vector database for semantic search
 */
export class SupermemoryManager {
    private static instance: SupermemoryManager;
    private memories: Map<string, MemoryEntry> = new Map();
    private readonly STORAGE_KEY = 'omo.supermemory';

    private constructor(private context: vscode.ExtensionContext) {
        this.loadMemories();
    }

    static getInstance(context: vscode.ExtensionContext): SupermemoryManager {
        if (!SupermemoryManager.instance) {
            SupermemoryManager.instance = new SupermemoryManager(context);
        }
        return SupermemoryManager.instance;
    }

    /**
     * Save a memory
     */
    async saveMemory(
        content: string,
        scope: 'user' | 'project' | 'session',
        tags: string[] = []
    ): Promise<string> {
        const id = `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const entry: MemoryEntry = {
            id,
            content,
            scope,
            tags,
            timestamp: Date.now()
        };

        this.memories.set(id, entry);
        await this.persistMemories();

        console.log(`✓ Saved memory: ${id.substring(0, 20)}...`);
        return id;
    }

    /**
     * Search memories (simple keyword search, production would use vector similarity)
     */
    searchMemories(query: string, scope?: 'user' | 'project' | 'session'): MemoryEntry[] {
        const results: MemoryEntry[] = [];
        const queryLower = query.toLowerCase();

        for (const memory of this.memories.values()) {
            // Filter by scope if specified
            if (scope && memory.scope !== scope) {
                continue;
            }

            // Simple keyword matching
            if (
                memory.content.toLowerCase().includes(queryLower) ||
                memory.tags.some(tag => tag.toLowerCase().includes(queryLower))
            ) {
                results.push(memory);
            }
        }

        // Sort by timestamp (most recent first)
        return results.sort((a, b) => b.timestamp - a.timestamp);
    }

    /**
     * Get relevant memories for context injection
     */
    async getRelevantMemories(context: string, limit: number = 5): Promise<MemoryEntry[]> {
        const results = this.searchMemories(context);
        return results.slice(0, limit);
    }

    /**
     * Auto-save from conversation (keyword detection)
     */
    async autoSaveFromText(text: string): Promise<string[]> {
        const saved: string[] = [];

        // Keywords that trigger auto-save
        const saveKeywords = [
            'remember',
            'important',
            'note:',
            'save this',
            'keep in mind'
        ];

        const textLower = text.toLowerCase();
        const shouldSave = saveKeywords.some(keyword => textLower.includes(keyword));

        if (shouldSave) {
            // Extract the important part (simple heuristic)
            const id = await this.saveMemory(text, 'session', ['auto-saved']);
            saved.push(id);
        }

        return saved;
    }

    /**
     * Privacy tag detection
     */
    hasPrivacyTag(text: string): boolean {
        return text.includes('<private>') || text.includes('[private]');
    }

    /**
     * Strip private content
     */
    stripPrivateContent(text: string): string {
        // Remove content between <private> tags
        return text.replace(/<private>.*?<\/private>/gs, '[REDACTED]');
    }

    /** 
     * Initialize codebase indexing
     */
    async initializeCodebaseIndex(): Promise<number> {
        let indexed = 0;

        try {
            // Find important files
            const patterns = ['**/README.md', '**/package.json', '**/*.md'];

            for (const pattern of patterns) {
                const files = await vscode.workspace.findFiles(
                    pattern,
                    '**/node_modules/**',
                    50
                );

                for (const file of files) {
                    const document = await vscode.workspace.openTextDocument(file);
                    const content = document.getText();

                    // Save first 500 chars as memory
                    await this.saveMemory(
                        content.substring(0, 500),
                        'project',
                        ['codebase', 'indexed', file.fsPath.split('/').pop() || '']
                    );
                    indexed++;
                }
            }
        } catch (error) {
            console.error('Codebase indexing error:', error);
        }

        return indexed;
    }

    /**
     * Load memories from storage
     */
    private async loadMemories(): Promise<void> {
        try {
            const stored = this.context.globalState.get<string>(this.STORAGE_KEY);
            if (stored) {
                const entries: MemoryEntry[] = JSON.parse(stored);
                for (const entry of entries) {
                    this.memories.set(entry.id, entry);
                }
                console.log(`✓ Loaded ${this.memories.size} memories`);
            }
        } catch (error) {
            console.error('Failed to load memories:', error);
        }
    }

    /**
     * Persist memories to storage
     */
    private async persistMemories(): Promise<void> {
        try {
            const entries = Array.from(this.memories.values());
            await this.context.globalState.update(
                this.STORAGE_KEY,
                JSON.stringify(entries)
            );
        } catch (error) {
            console.error('Failed to persist memories:', error);
        }
    }

    /**
     * Get memory count
     */
    getMemoryCount(): number {
        return this.memories.size;
    }

    /**
     * Clear all memories
     */
    async clearMemories(scope?: 'user' | 'project' | 'session'): Promise<number> {
        let cleared = 0;

        if (scope) {
            // Clear specific scope
            for (const [id, memory] of this.memories) {
                if (memory.scope === scope) {
                    this.memories.delete(id);
                    cleared++;
                }
            }
        } else {
            // Clear all
            cleared = this.memories.size;
            this.memories.clear();
        }

        await this.persistMemories();
        return cleared;
    }
}
