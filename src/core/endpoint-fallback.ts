import * as vscode from 'vscode';

/**
 * Antigravity API endpoints (priority order)
 */
const ENDPOINTS = [
    'https://daily.antigravity.google.com',
    'https://autopush.antigravity.google.com',
    'https://antigravity.google.com'
] as const;

type AntigravityEndpoint = typeof ENDPOINTS[number];

/**
 * Endpoint health status
 */
interface EndpointHealth {
    endpoint: AntigravityEndpoint;
    isHealthy: boolean;
    lastChecked: number;
    failureCount: number;
}

/**
 * Manages endpoint fallback for reliability
 */
export class EndpointFallbackManager {
    private static instance: EndpointFallbackManager;
    private endpointHealth: Map<AntigravityEndpoint, EndpointHealth>;
    private readonly HEALTH_CHECK_INTERVAL = 60000; // 1 minute
    private readonly MAX_FAILURES = 3;

    private constructor() {
        this.endpointHealth = new Map();
        this.initializeEndpoints();
    }

    static getInstance(): EndpointFallbackManager {
        if (!EndpointFallbackManager.instance) {
            EndpointFallbackManager.instance = new EndpointFallbackManager();
        }
        return EndpointFallbackManager.instance;
    }

    /**
     * Initialize endpoint health tracking
     */
    private initializeEndpoints(): void {
        for (const endpoint of ENDPOINTS) {
            this.endpointHealth.set(endpoint, {
                endpoint,
                isHealthy: true,
                lastChecked: Date.now(),
                failureCount: 0
            });
        }
    }

    /**
     * Get the best available endpoint
     */
    getEndpoint(): AntigravityEndpoint {
        // Try endpoints in priority order
        for (const endpoint of ENDPOINTS) {
            const health = this.endpointHealth.get(endpoint);
            if (health && health.isHealthy) {
                return endpoint;
            }
        }

        // All endpoints unhealthy, return primary (will retry)
        console.warn('All endpoints marked unhealthy, using primary');
        return ENDPOINTS[0];
    }

    /**
     * Make request with automatic fallback
     */
    async requestWithFallback<T>(
        path: string,
        options: RequestInit,
        timeout: number = 10000
    ): Promise<T> {
        let lastError: Error | null = null;

        for (const endpoint of ENDPOINTS) {
            const health = this.endpointHealth.get(endpoint);
            if (!health) continue;

            // Skip if unhealthy and recently checked
            if (!health.isHealthy &&
                Date.now() - health.lastChecked < this.HEALTH_CHECK_INTERVAL) {
                continue;
            }

            try {
                const url = `${endpoint}${path}`;
                console.log(`Trying endpoint: ${endpoint}`);

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), timeout);

                const response = await fetch(url, {
                    ...options,
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                // Success! Mark as healthy
                this.markHealthy(endpoint);

                return await response.json();
            } catch (error) {
                lastError = error as Error;
                console.error(`Endpoint ${endpoint} failed:`, error);

                // Mark as unhealthy
                this.markUnhealthy(endpoint);
            }
        }

        // All endpoints failed
        throw new Error(
            `All endpoints failed. Last error: ${lastError?.message || 'Unknown'}`
        );
    }

    /**
     * Mark endpoint as healthy
     */
    private markHealthy(endpoint: AntigravityEndpoint): void {
        const health = this.endpointHealth.get(endpoint);
        if (health) {
            health.isHealthy = true;
            health.lastChecked = Date.now();
            health.failureCount = 0;
            console.log(`✓ Endpoint healthy: ${endpoint}`);
        }
    }

    /**
     * Mark endpoint as unhealthy
     */
    private markUnhealthy(endpoint: AntigravityEndpoint): void {
        const health = this.endpointHealth.get(endpoint);
        if (health) {
            health.failureCount++;
            health.lastChecked = Date.now();

            if (health.failureCount >= this.MAX_FAILURES) {
                health.isHealthy = false;
                console.warn(`✗ Endpoint marked unhealthy: ${endpoint}`);

                // Show notification for primary endpoint
                if (endpoint === ENDPOINTS[0]) {
                    vscode.window.showWarningMessage(
                        `Primary Antigravity endpoint is down. Using fallback.`
                    );
                }
            }
        }
    }

    /**
     * Reset all endpoints to healthy (for manual recovery)
     */
    resetHealth(): void {
        for (const [endpoint, health] of this.endpointHealth) {
            health.isHealthy = true;
            health.failureCount = 0;
            health.lastChecked = Date.now();
        }
        console.log('✓ All endpoints reset to healthy');
    }

    /**
     * Get current endpoint health status
     */
    getHealthStatus(): Array<{ endpoint: string; isHealthy: boolean; failures: number }> {
        return Array.from(this.endpointHealth.values()).map(h => ({
            endpoint: h.endpoint,
            isHealthy: h.isHealthy,
            failures: h.failureCount
        }));
    }
}
