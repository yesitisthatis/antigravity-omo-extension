import * as vscode from 'vscode';
import * as http from 'http';
import {
    createAuthorizationUrl,
    startCallbackServer,
    exchangeCodeForTokens,
    fetchAccountInfo,
    refreshAccessToken,
    type TokenExchangeResult,
} from './antigravity-oauth';

/**
 * Stored token data
 */
interface StoredTokens {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
    email?: string;
    projectId?: string;
    tier?: 'free' | 'paid';
}

/**
 * Manages Antigravity OAuth authentication
 * Uses proper OAuth flow with PKCE and local callback server
 */
export class AntigravityAuthManager {
    private static instance: AntigravityAuthManager;
    private cachedTokens: StoredTokens | null = null;
    private callbackServer: http.Server | null = null;

    private constructor() { }

    static getInstance(): AntigravityAuthManager {
        if (!AntigravityAuthManager.instance) {
            AntigravityAuthManager.instance = new AntigravityAuthManager();
        }
        return AntigravityAuthManager.instance;
    }

    /**
     * Check if user is authenticated
     */
    async isAuthenticated(): Promise<boolean> {
        try {
            const tokens = await this.getTokens();
            return tokens !== null;
        } catch (error) {
            console.error('Failed to check authentication:', error);
            return false;
        }
    }

    /**
     * Get access token (refreshes if expired)
     */
    async getAccessToken(): Promise<string | null> {
        try {
            const tokens = await this.getTokens();
            if (!tokens) {
                return null;
            }

            // Check if token is expired or about to expire (within 5 minutes)
            if (Date.now() >= tokens.expiresAt - 5 * 60 * 1000) {
                console.log('Access token expired, refreshing...');
                const result = await refreshAccessToken(tokens.refreshToken);

                if (result.success && result.accessToken) {
                    // Update stored tokens
                    const newTokens: StoredTokens = {
                        ...tokens,
                        accessToken: result.accessToken,
                        expiresAt: Date.now() + (result.expiresIn || 3600) * 1000,
                    };
                    await this.storeTokens(newTokens);
                    this.cachedTokens = newTokens;
                    return result.accessToken;
                } else {
                    // Refresh failed, clear tokens
                    await this.clearTokens();
                    return null;
                }
            }

            return tokens.accessToken;
        } catch (error) {
            console.error('Failed to get access token:', error);
            return null;
        }
    }

    /**
     * Get authenticated user's email
     */
    async getUserEmail(): Promise<string | null> {
        const tokens = await this.getTokens();
        return tokens?.email || null;
    }

    /**
     * Get detected tier (free or paid)
     */
    async getTier(): Promise<'free' | 'paid'> {
        const tokens = await this.getTokens();
        return tokens?.tier || 'free';
    }

    /**
     * Refresh OAuth token
     */
    async refreshToken(): Promise<void> {
        this.cachedTokens = null; // Invalidate cache
        await this.getAccessToken(); // This will trigger refresh if needed
    }

    /**
     * Prompt user to login via Google OAuth
     */
    async promptLogin(): Promise<boolean> {
        try {
            // Check if OAuth is enabled
            const config = vscode.workspace.getConfiguration('omo');
            const useOAuth = config.get<boolean>('auth.useAntigravityOAuth', true);

            if (!useOAuth) {
                vscode.window.showWarningMessage('Antigravity OAuth is disabled in settings.');
                return false;
            }

            // Start callback server
            vscode.window.showInformationMessage('Starting OAuth flow...');
            const { server, codePromise } = await startCallbackServer();
            this.callbackServer = server;

            // Create auth URL
            const { url } = createAuthorizationUrl();

            // Open browser
            vscode.window.showInformationMessage('Opening browser for authentication...');
            await vscode.env.openExternal(vscode.Uri.parse(url));

            // Wait for callback (with timeout)
            const timeoutPromise = new Promise<{ code: string; state: string }>((_, reject) => {
                setTimeout(() => reject(new Error('OAuth timeout')), 5 * 60 * 1000); // 5 minutes
            });

            const { code, state } = await Promise.race([codePromise, timeoutPromise]);

            // Close server
            server.close();
            this.callbackServer = null;

            if (!code) {
                vscode.window.showErrorMessage('OAuth failed: No authorization code received');
                return false;
            }

            // Exchange code for tokens
            vscode.window.showInformationMessage('Exchanging code for tokens...');
            const result = await exchangeCodeForTokens(code, state);

            if (!result.success || !result.accessToken || !result.refreshToken) {
                vscode.window.showErrorMessage(`OAuth failed: ${result.error || 'Unknown error'}`);
                return false;
            }

            // Store tokens
            const tokens: StoredTokens = {
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
                expiresAt: Date.now() + (result.expiresIn || 3600) * 1000,
                email: result.email,
                projectId: result.projectId,
                tier: result.tier,
            };

            await this.storeTokens(tokens);
            this.cachedTokens = tokens;

            // Show success
            const tierEmoji = result.tier === 'paid' ? '⭐' : '🆓';
            vscode.window.showInformationMessage(
                `✓ Authenticated as: ${result.email}. Tier: ${tierEmoji} ${result.tier?.toUpperCase()}`
            );

            return true;
        } catch (error) {
            if (this.callbackServer) {
                this.callbackServer.close();
                this.callbackServer = null;
            }

            console.error('Login failed:', error);
            vscode.window.showErrorMessage(`Failed to login: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return false;
        }
    }

    /**
     * Get stored tokens (from VSCode secrets)
     */
    private async getTokens(): Promise<StoredTokens | null> {
        // Return cached if available
        if (this.cachedTokens) {
            return this.cachedTokens;
        }

        try {
            // Get from VSCode secrets storage
            const tokensJson = await vscode.workspace.getConfiguration().get<string>('omo.auth.tokens');
            if (!tokensJson) {
                return null;
            }

            const tokens = JSON.parse(tokensJson) as StoredTokens;
            this.cachedTokens = tokens;
            return tokens;
        } catch (error) {
            console.error('Failed to get stored tokens:', error);
            return null;
        }
    }

    /**
     * Store tokens in VSCode secrets
     */
    private async storeTokens(tokens: StoredTokens): Promise<void> {
        try {
            const tokensJson = JSON.stringify(tokens);
            await vscode.workspace.getConfiguration().update(
                'omo.auth.tokens',
                tokensJson,
                vscode.ConfigurationTarget.Global
            );
            this.cachedTokens = tokens;
        } catch (error) {
            console.error('Failed to store tokens:', error);
            throw error;
        }
    }

    /**
     * Clear stored tokens
     */
    private async clearTokens(): Promise<void> {
        try {
            await vscode.workspace.getConfiguration().update(
                'omo.auth.tokens',
                undefined,
                vscode.ConfigurationTarget.Global
            );
            this.cachedTokens = null;
        } catch (error) {
            console.error('Failed to clear tokens:', error);
        }
    }

    /**
     * Get authentication status summary
     */
    async getAuthStatus(): Promise<{
        authenticated: boolean;
        method: 'oauth' | 'api-key' | 'none';
        email?: string;
        tier?: 'free' | 'paid';
    }> {
        // Check manual API key first
        const config = vscode.workspace.getConfiguration('omo');
        const manualKey = config.get<string>('apiKeys.gemini');

        if (manualKey) {
            return {
                authenticated: true,
                method: 'api-key',
            };
        }

        // Check OAuth
        const tokens = await this.getTokens();
        if (tokens) {
            return {
                authenticated: true,
                method: 'oauth',
                email: tokens.email,
                tier: tokens.tier,
            };
        }

        return {
            authenticated: false,
            method: 'none',
        };
    }
}
