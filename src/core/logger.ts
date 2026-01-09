import * as vscode from 'vscode';

/**
 * Centralized logging utility for OmO Extension
 * Provides both console and Output channel logging
 */
export class Logger {
    private static instance: Logger;
    private outputChannel: vscode.OutputChannel;
    private isVerbose: boolean = false;

    private constructor() {
        // Create Output channel immediately
        this.outputChannel = vscode.window.createOutputChannel('OmO Extension');
        console.log('✓ Created OmO Extension Output channel');

        this.updateSettings();

        // Listen for settings changes
        vscode.workspace.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration('omo.logging')) {
                this.updateSettings();
            }
        });
    }

    static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    private updateSettings(): void {
        const config = vscode.workspace.getConfiguration('omo');
        this.isVerbose = config.get<boolean>('logging.verbose', false);
        const showOnStartup = config.get<boolean>('logging.showOnStartup', false);

        if (showOnStartup && this.isVerbose) {
            this.show();
        }
    }

    /**
     * Show the output channel
     */
    show(): void {
        this.outputChannel.show(true); // true = preserveFocus
    }

    /**
     * Hide the output channel
     */
    hide(): void {
        this.outputChannel.hide();
    }

    /**
     * Clear the output channel
     */
    clear(): void {
        this.outputChannel.clear();
    }

    /**
     * Log info message (always shown)
     */
    info(message: string, ...args: any[]): void {
        const formatted = this.format('INFO', message, args);
        console.log(formatted);
        this.outputChannel.appendLine(formatted);
    }

    /**
     * Log success message (always shown)
     */
    success(message: string, ...args: any[]): void {
        const formatted = this.format('✓', message, args);
        console.log(formatted);
        this.outputChannel.appendLine(formatted);
    }

    /**
     * Log warning (always shown)
     */
    warn(message: string, ...args: any[]): void {
        const formatted = this.format('WARN', message, args);
        console.warn(formatted);
        this.outputChannel.appendLine(formatted);
    }

    /**
     * Log error (always shown)
     */
    error(message: string, error?: Error | any): void {
        const errorStr = error instanceof Error ? error.message : String(error || '');
        const formatted = this.format('ERROR', `${message} ${errorStr}`);
        console.error(formatted, error);
        this.outputChannel.appendLine(formatted);
        if (error instanceof Error && error.stack) {
            this.outputChannel.appendLine(error.stack);
        }
    }

    /**
     * Log debug message (only if verbose enabled)
     */
    debug(message: string, ...args: any[]): void {
        if (!this.isVerbose) return;

        const formatted = this.format('DEBUG', message, args);
        console.log(formatted);
        this.outputChannel.appendLine(formatted);
    }

    /**
     * Log agent activity (only if verbose enabled)
     */
    agent(agentName: string, message: string, ...args: any[]): void {
        if (!this.isVerbose) return;

        const formatted = this.format(`🤖 ${agentName}`, message, args);
        console.log(formatted);
        this.outputChannel.appendLine(formatted);
    }

    /**
     * Log provider activity (only if verbose enabled)
     */
    provider(providerName: string, message: string, ...args: any[]): void {
        if (!this.isVerbose) return;

        const formatted = this.format(`🔌 ${providerName}`, message, args);
        console.log(formatted);
        this.outputChannel.appendLine(formatted);
    }

    /**
     * Format log message with timestamp
     */
    private format(level: string, message: string, args: any[] = []): string {
        const timestamp = new Date().toLocaleTimeString();
        const argsStr = args.length > 0 ? ' ' + args.map(a =>
            typeof a === 'object' ? JSON.stringify(a) : String(a)
        ).join(' ') : '';
        return `[${timestamp}] [${level}] ${message}${argsStr}`;
    }

    /**
     * Dispose the output channel
     */
    dispose(): void {
        this.outputChannel.dispose();
    }
}

// Just export the Logger class - will be instantiated manually in extension.ts
