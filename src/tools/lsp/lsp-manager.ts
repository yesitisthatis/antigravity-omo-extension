import * as vscode from 'vscode';
import * as path from 'path';
import {
    LanguageClient,
    LanguageClientOptions,
    ServerOptions,
    TransportKind
} from 'vscode-languageclient/node';

/**
 * Language server configuration
 */
interface LSPServerConfig {
    language: string;
    serverName: string;
    command: string;
    args: string[];
    filePatterns: string[];
}

/**
 * Common LSP server configurations
 */
const LSP_SERVERS: LSPServerConfig[] = [
    {
        language: 'python',
        serverName: 'pyright',
        command: 'pyright-langserver',
        args: ['--stdio'],
        filePatterns: ['**/*.py']
    },
    {
        language: 'typescript',
        serverName: 'typescript-language-server',
        command: 'typescript-language-server',
        args: ['--stdio'],
        filePatterns: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx']
    },
    {
        language: 'go',
        serverName: 'gopls',
        command: 'gopls',
        args: [],
        filePatterns: ['**/*.go']
    }
];

/**
 * Manages LSP client connections
 */
export class LSPManager {
    private static instance: LSPManager;
    private clients: Map<string, LanguageClient> = new Map();
    private activeServers: Set<string> = new Set();

    private constructor(private context: vscode.ExtensionContext) { }

    static getInstance(context: vscode.ExtensionContext): LSPManager {
        if (!LSPManager.instance) {
            LSPManager.instance = new LSPManager(context);
        }
        return LSPManager.instance;
    }

    /**
     * Initialize LSP clients for detected languages
     */
    async initialize(): Promise<void> {
        console.log('🔌 Initializing LSP clients...');

        // Detect which languages are present in workspace
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            console.log('No workspace folders found');
            return;
        }

        for (const serverConfig of LSP_SERVERS) {
            // Check if files of this type exist
            const files = await vscode.workspace.findFiles(
                serverConfig.filePatterns[0],
                '**/node_modules/**',
                1
            );

            if (files.length > 0) {
                await this.startLanguageServer(serverConfig);
            }
        }
    }

    /**
     * Start a language server
     */
    private async startLanguageServer(config: LSPServerConfig): Promise<void> {
        if (this.clients.has(config.language)) {
            console.log(`LSP client already running for ${config.language}`);
            return;
        }

        try {
            // Check if server is installed
            const isInstalled = await this.isServerInstalled(config.command);
            if (!isInstalled) {
                console.log(`${config.serverName} not installed, skipping`);
                // Note: Auto-installation will be in separate task
                return;
            }

            const serverOptions: ServerOptions = {
                command: config.command,
                args: config.args,
                transport: TransportKind.stdio
            };

            const clientOptions: LanguageClientOptions = {
                documentSelector: [
                    { scheme: 'file', pattern: config.filePatterns[0] }
                ],
                synchronize: {
                    fileEvents: vscode.workspace.createFileSystemWatcher(config.filePatterns[0])
                }
            };

            const client = new LanguageClient(
                config.language,
                config.serverName,
                serverOptions,
                clientOptions
            );

            await client.start();
            this.clients.set(config.language, client);
            this.activeServers.add(config.language);

            console.log(`✓ Started LSP server for ${config.language}`);
        } catch (error) {
            console.error(`Failed to start LSP server for ${config.language}:`, error);
        }
    }

    /**
     * Check if a language server is installed
     */
    private async isServerInstalled(command: string): Promise<boolean> {
        try {
            const { exec } = require('child_process');
            return new Promise((resolve) => {
                exec(`which ${command}`, (error: Error | null) => {
                    resolve(!error);
                });
            });
        } catch {
            return false;
        }
    }

    /**
     * Get language client for file
     */
    getClientForFile(uri: vscode.Uri): LanguageClient | undefined {
        const ext = path.extname(uri.fsPath);

        if (['.py'].includes(ext)) {
            return this.clients.get('python');
        } else if (['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
            return this.clients.get('typescript');
        } else if (['.go'].includes(ext)) {
            return this.clients.get('go');
        }

        return undefined;
    }

    /**
     * Get client by language
     */
    getClient(language: string): LanguageClient | undefined {
        return this.clients.get(language);
    }

    /**
     * Get all active clients
     */
    getActiveClients(): LanguageClient[] {
        return Array.from(this.clients.values());
    }

    /**
     * Stop all language servers
     */
    async dispose(): Promise<void> {
        console.log('Stopping all LSP clients...');

        for (const [language, client] of this.clients) {
            try {
                await client.stop();
                console.log(`✓ Stopped LSP client for ${language}`);
            } catch (error) {
                console.error(`Error stopping ${language} client:`, error);
            }
        }

        this.clients.clear();
        this.activeServers.clear();
    }

    /**
     * Check if LSP is available for file
     */
    isLSPAvailable(uri: vscode.Uri): boolean {
        return this.getClientForFile(uri) !== undefined;
    }

    /**
     * Get list of active language servers
     */
    getActiveLanguages(): string[] {
        return Array.from(this.activeServers);
    }
}
