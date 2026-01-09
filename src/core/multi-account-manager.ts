import * as vscode from 'vscode';

/**
 * Account information
 */
interface GoogleAccount {
    id: string;
    email: string;
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
    isHealthy: boolean;
    lastUsed: number;
}

/**
 * Manages multiple Google accounts for rate limit avoidance
 */
export class MultiAccountManager {
    private static instance: MultiAccountManager;
    private accounts: GoogleAccount[] = [];
    private currentIndex = 0;
    private readonly ACCOUNT_STORAGE_KEY = 'omo.accounts';

    private constructor(private context: vscode.ExtensionContext) {
        this.loadAccounts();
    }

    static getInstance(context: vscode.ExtensionContext): MultiAccountManager {
        if (!MultiAccountManager.instance) {
            MultiAccountManager.instance = new MultiAccountManager(context);
        }
        return MultiAccountManager.instance;
    }

    /**
     * Load accounts from secure storage
     */
    private async loadAccounts(): Promise<void> {
        try {
            const stored = await this.context.secrets.get(this.ACCOUNT_STORAGE_KEY);
            if (stored) {
                this.accounts = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to load accounts:', error);
            this.accounts = [];
        }
    }

    /**
     * Save accounts to secure storage
     */
    private async saveAccounts(): Promise<void> {
        try {
            await this.context.secrets.store(
                this.ACCOUNT_STORAGE_KEY,
                JSON.stringify(this.accounts)
            );
        } catch (error) {
            console.error('Failed to save accounts:', error);
        }
    }

    /**
     * Add a new Google account
     */
    async addAccount(account: Omit<GoogleAccount, 'id' | 'isHealthy' | 'lastUsed'>): Promise<void> {
        const newAccount: GoogleAccount = {
            ...account,
            id: `account_${Date.now()}`,
            isHealthy: true,
            lastUsed: Date.now()
        };

        this.accounts.push(newAccount);
        await this.saveAccounts();

        vscode.window.showInformationMessage(
            `✓ Added account: ${account.email}. Total accounts: ${this.accounts.length}`
        );
    }

    /**
     * Get current active account
     */
    getActiveAccount(): GoogleAccount | null {
        if (this.accounts.length === 0) return null;
        return this.accounts[this.currentIndex];
    }

    /**
     * Rotate to next account
     */
    async rotateAccount(reason: 'rate_limit' | 'error' = 'rate_limit'): Promise<GoogleAccount | null> {
        if (this.accounts.length === 0) return null;

        // Mark current account as unhealthy if rate limited
        if (reason === 'rate_limit') {
            this.accounts[this.currentIndex].isHealthy = false;
        }

        // Find next healthy account
        const startIndex = this.currentIndex;
        let rotations = 0;

        do {
            this.currentIndex = (this.currentIndex + 1) % this.accounts.length;
            rotations++;

            const account = this.accounts[this.currentIndex];

            // Check if account is healthy and token not expired
            if (account.isHealthy && account.expiresAt > Date.now()) {
                account.lastUsed = Date.now();
                await this.saveAccounts();

                console.log(`✓ Rotated to account: ${account.email}`);
                return account;
            }

            // All accounts checked
            if (rotations >= this.accounts.length) {
                break;
            }
        } while (this.currentIndex !== startIndex);

        // No healthy accounts found
        vscode.window.showWarningMessage(
            '⚠️ All accounts are rate limited or expired. Please wait or add more accounts.'
        );
        return null;
    }

    /**
     * Handle rate limit (429) response
     */
    async handleRateLimit(): Promise<void> {
        console.log('Rate limit detected, rotating account...');
        await this.rotateAccount('rate_limit');
    }

    /**
     * Mark current account as healthy
     */
    async markAccountHealthy(): Promise<void> {
        if (this.accounts.length === 0) return;
        this.accounts[this.currentIndex].isHealthy = true;
        await this.saveAccounts();
    }

    /**
     * Refresh access token for account
     */
    async refreshAccessToken(account: GoogleAccount): Promise<boolean> {
        try {
            // TODO: Implement actual OAuth token refresh
            // For now, placeholder
            console.log(`Refreshing token for ${account.email}`);
            return true;
        } catch (error) {
            console.error('Token refresh failed:', error);
            return false;
        }
    }

    /**
     * Get account count
     */
    getAccountCount(): number {
        return this.accounts.length;
    }

    /**
     * Remove an account
     */
    async removeAccount(email: string): Promise<void> {
        this.accounts = this.accounts.filter(a => a.email !== email);

        // Reset index if needed
        if (this.currentIndex >= this.accounts.length) {
            this.currentIndex = Math.max(0, this.accounts.length - 1);
        }

        await this.saveAccounts();
        vscode.window.showInformationMessage(`✓ Removed account: ${email}`);
    }

    /**
     * Get all accounts (emails only for display)
     */
    getAccounts(): Array<{ email: string; isHealthy: boolean }> {
        return this.accounts.map(a => ({
            email: a.email,
            isHealthy: a.isHealthy
        }));
    }
}
