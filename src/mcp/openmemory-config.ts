/**
 * OpenMemory MCP Server Configuration
 * Provides persistent knowledge storage for OmniForge development
 */

/**
 * OpenMemory server is a standalone Python service
 * It should be started separately via tools/openmemory/start.sh
 * This configuration registers it as an available MCP resource
 */
export const OPENMEMORY_SERVER_CONFIG = {
    name: 'openmemory',
    description: 'Helix OpenMemory - Persistent knowledge store for OmniForge platform',
    version: '1.0.0',

    // Server details
    baseUrl: 'http://localhost:8765',
    healthEndpoint: '/health',

    // Startup info (server runs independently)
    startupCommand: 'cd ~/helix/tools/openmemory && ./start.sh',
    stopCommand: 'cd ~/helix/tools/openmemory && ./stop.sh',

    // MCP resource capabilities
    capabilities: {
        search: true,
        store: true,
        retrieve: true,
        categories: [
            'master_knowledge',
            'plan',
            'documentation',
            'artifact',
            'service',
            'architecture',
            'pattern',
            'rules'
        ]
    },

    // Quick search templates
    searchTemplates: {
        masterKnowledge: 'category:master_knowledge',
        plans: 'category:plan',
        criticalRules: 'priority:critical',
        serviceInfo: (serviceName: string) => `service:${serviceName}`,
        portReference: 'port reference',
        workflow: 'workflow SCM',
        crdtInfo: 'CRDT multiplayer',
        mergeTrains: 'merge train'
    }
};

/**
 * Check if OpenMemory server is available
 */
export async function isOpenMemoryAvailable(): Promise<boolean> {
    try {
        const response = await fetch(`${OPENMEMORY_SERVER_CONFIG.baseUrl}${OPENMEMORY_SERVER_CONFIG.healthEndpoint}`, {
            method: 'GET',
            signal: AbortSignal.timeout(2000)
        });

        if (response.ok) {
            const data = await response.json();
            return data.status === 'healthy';
        }
        return false;
    } catch {
        return false;
    }
}

/**
 * Get startup instructions for OpenMemory
 */
export function getOpenMemoryStartupInstructions(): string {
    return `
OpenMemory is not running. To start:

1. Open terminal
2. Run: ${OPENMEMORY_SERVER_CONFIG.startupCommand}
3. Or use convenience script: cd ~/helix && ./start-dev.sh

OpenMemory provides persistent memory for OmniForge context,
preventing AI agents from forgetting architecture and patterns.
    `.trim();
}
