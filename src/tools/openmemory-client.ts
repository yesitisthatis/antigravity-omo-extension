import axios from 'axios';

/**
 * Memory object returned from OpenMemory API
 */
export interface Memory {
    id?: number;
    content: string;
    user_id: string;
    metadata: Record<string, any>;
    created_at?: string;
    updated_at?: string;
}

/**
 * Search results from OpenMemory
 */
export interface SearchResults {
    memories: Memory[];
    total: number;
}

/**
 * Client for interacting with Helix OpenMemory server
 * Provides persistent knowledge storage for OmniForge context
 */
export class OpenMemoryClient {
    private baseUrl: string;
    private userId: string;

    constructor(baseUrl: string = 'http://localhost:8765', userId: string = 'helix') {
        this.baseUrl = baseUrl;
        this.userId = userId;
    }

    /**
     * Check if OpenMemory server is healthy and reachable
     */
    async isHealthy(): Promise<boolean> {
        try {
            const response = await axios.get(`${this.baseUrl}/health`, { timeout: 2000 });
            return response.status === 200 && response.data?.status === 'healthy';
        } catch {
            return false;
        }
    }

    /**
     * Search memories by query string
     */
    async search(query: string, limit: number = 10): Promise<SearchResults> {
        try {
            const response = await axios.get(`${this.baseUrl}/api/memory/search`, {
                params: {
                    query,
                    user_id: this.userId,
                    limit
                },
                timeout: 10000
            });

            return {
                memories: response.data.memories || [],
                total: response.data.total || 0
            };
        } catch (error) {
            console.error('OpenMemory search failed:', error);
            return { memories: [], total: 0 };
        }
    }

    /**
     * Store a new memory
     */
    async store(content: string, metadata: Record<string, any> = {}): Promise<boolean> {
        try {
            const response = await axios.post(`${this.baseUrl}/api/memory`, {
                content,
                user_id: this.userId,
                metadata
            }, { timeout: 10000 });

            return response.status === 200;
        } catch (error) {
            console.error('OpenMemory store failed:', error);
            return false;
        }
    }

    /**
     * Get all memories (with pagination)
     */
    async getAll(limit: number = 100, offset: number = 0): Promise<SearchResults> {
        try {
            const response = await axios.get(`${this.baseUrl}/api/memory`, {
                params: {
                    limit,
                    offset
                },
                timeout: 10000
            });

            return {
                memories: response.data.memories || [],
                total: response.data.total || 0
            };
        } catch (error) {
            console.error('OpenMemory getAll failed:', error);
            return { memories: [], total: 0 };
        }
    }

    /**
     * Search for OmniForge-specific knowledge
     * Convenience method for common searches
     */
    async searchOmniForge(topic: string): Promise<Memory[]> {
        const results = await this.search(topic, 5);
        return results.memories.filter(m =>
            m.metadata?.category === 'master_knowledge' ||
            m.metadata?.category === 'plan' ||
            m.metadata?.category === 'documentation' ||
            m.metadata?.priority === 'high' ||
            m.metadata?.priority === 'critical'
        );
    }

    /**
     * Get master knowledge documents
     */
    async getMasterKnowledge(): Promise<Memory[]> {
        const results = await this.search('master knowledge', 10);
        return results.memories.filter(m => m.metadata?.category === 'master_knowledge');
    }

    /**
     * Get implementation plans
     */
    async getPlans(): Promise<Memory[]> {
        const results = await this.search('plan', 20);
        return results.memories.filter(m => m.metadata?.category === 'plan');
    }

    /**
     * Get service-specific documentation
     */
    async getServiceDocs(serviceName: string): Promise<Memory[]> {
        const results = await this.search(serviceName, 10);
        return results.memories.filter(m => m.metadata?.service === serviceName);
    }
}

// Singleton instance
let instance: OpenMemoryClient | null = null;

/**
 * Get the singleton OpenMemory client instance
 */
export function getOpenMemoryClient(): OpenMemoryClient {
    if (!instance) {
        instance = new OpenMemoryClient();
    }
    return instance;
}
