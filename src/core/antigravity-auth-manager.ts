import * as vscode from 'vscode';

/**
 * OAuth session information
 */
interface OAuthSession {
    id: string;
    accessToken: string;
    account: {
        id: string;
        label: string; // email
    };
    scopes: string[];
}

/**
 * Manages Antigravity OAuth authentication
 * Detects and uses Google OAuth credentials from Antigravity IDE
 */
export class AntigravityAuthManager {
    private static instance: AntigravityAuthManager;
    private cachedSession: OAuthSession | null = null;
    private cacheExpiry: number = 0;
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    private constructor() { }

    static getInstance(): AntigravityAuthManager {
        if (!AntigravityAuthManager.instance) {
            AntigravityAuthManager.instance = new AntigravityAuthManager();
        }
        return AntigravityAuthManager.instance;
    }

    /**
     * Check if user is authenticated with Google via Antigravity
     */
    async isAuthenticated(): Promise<boolean> {
        try {
            const session = await this.getSession();
            return session !== null;
        } catch (error) {
            console.error('Failed to check authentication:', error);
            return false;
        }
    }

    /**
     * Get OAuth access token for Gemini API
     */
    async getAccessToken(): Promise<string | null> {
        try {
            const session = await this.getSession();
            return session?.accessToken || null;
        } catch (error) {
            console.error('Failed to get access token:', error);
            return null;
        }
    }

    /**
     * Get authenticated user's email
     */
    async getUserEmail(): Promise<string | null> {
        try {
            const session = await this.getSession();
            return session?.account.label || null;
        } catch (error) {
            console.error('Failed to get user email:', error);
            return null;
        }
    }

    /**
     * Refresh OAuth token (invalidate cache)
     */
    async refreshToken(): Promise<void> {
        this.invalidateCache();
        await this.getSession();
    }

    /**
     * Get OAuth session from VSCode authentication API
     */
    private async getSession(): Promise<OAuthSession | null> {
        // Check cache first
        if (this.cachedSession && Date.now() < this.cacheExpiry) {
            return this.cachedSession;
        }

        try {
            // Check if OAuth is enabled in settings
            const config = vscode.workspace.getConfiguration('omo');
            const useOAuth = config.get<boolean>('auth.useAntigravityOAuth', true);

            if (!useOAuth) {
                console.log('Antigravity OAuth disabled in settings');
                return null;
            }

            // Try to get existing session (don't create new one)
            const session = await vscode.authentication.getSession('google', [
                'email',
                'https://www.googleapis.com/auth/generative-language.retriever'
            ], {
                createIfNone: false,
                silent: true
            });

            if (session) {
                // Cache the session
                this.cachedSession = session as unknown as OAuthSession;
                this.cacheExpiry = Date.now() + this.CACHE_DURATION;

                console.log(`✓ Authenticated as: ${session.account.label}`);
                return this.cachedSession;
            }

            return null;
        } catch (error) {
            console.error('Failed to get OAuth session:', error);
            return null;
        }
    }

    /**
     * Prompt user to login (open Antigravity auth dialog)
     */
    async promptLogin(): Promise<boolean> {
        try {
            const session = await vscode.authentication.getSession('google', [
                'email',
                'https://www.googleapis.com/auth/generative-language.retriever'
            ], {
                createIfNone: true // This will prompt user to login
            });

            if (session) {
                this.cachedSession = session as unknown as OAuthSession;
                this.cacheExpiry = Date.now() + this.CACHE_DURATION;

                vscode.window.showInformationMessage(
                    `✓ Authenticated as: ${session.account.label}. Pro features unlocked!`
                );
                return true;
            }

            return false;
        } catch (error) {
            console.error('Login failed:', error);
            vscode.window.showErrorMessage('Failed to login with Google. Please try again.');
            return false;
        }
    }

    /**
     * Invalidate cached session
     */
    invalidateCache(): void {
        this.cachedSession = null;
        this.cacheExpiry = 0;
    }

    /**
     * Get authentication status summary
     */
    async getAuthStatus(): Promise<{
        authenticated: boolean;
        method: 'oauth' | 'api-key' | 'none';
        email?: string;
        scopes?: string[];
    }> {
        // Check manual API key first
        const config = vscode.workspace.getConfiguration('omo');
        const manualKey = config.get<string>('apiKeys.gemini');

        if (manualKey) {
            return {
                authenticated: true,
                method: 'api-key'
            };
        }

        // Check OAuth
        const session = await this.getSession();
        if (session) {
            return {
                authenticated: true,
                method: 'oauth',
                email: session.account.label,
                scopes: session.scopes
            };
        }

        return {
            authenticated: false,
            method: 'none'
        };
    }
}
