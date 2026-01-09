import * as crypto from 'crypto';
import * as http from 'http';
import {
    ANTIGRAVITY_CLIENT_ID,
    ANTIGRAVITY_CLIENT_SECRET,
    ANTIGRAVITY_REDIRECT_URI,
    ANTIGRAVITY_SCOPES,
    ANTIGRAVITY_CALLBACK_PORT,
    CODE_ASSIST_ENDPOINT_FALLBACKS,
    ANTIGRAVITY_HEADERS,
    ANTIGRAVITY_DEFAULT_PROJECT_ID,
} from './antigravity-constants';

/**
 * PKCE code verifier and challenge
 */
interface PkcePair {
    verifier: string;
    challenge: string;
}

/**
 * OAuth state containing PKCE verifier
 */
interface OAuthState {
    verifier: string;
    projectId?: string;
}

/**
 * Authorization result
 */
export interface AuthorizationResult {
    url: string;
    verifier: string;
}

/**
 * Token exchange result
 */
export interface TokenExchangeResult {
    success: boolean;
    accessToken?: string;
    refreshToken?: string;
    expiresIn?: number;
    email?: string;
    projectId?: string;
    tier?: 'free' | 'paid';
    error?: string;
}

/**
 * Account info from Antigravity API
 */
export interface AccountInfo {
    projectId: string;
    tier: 'free' | 'paid';
}

/**
 * Generate PKCE code verifier and challenge
 */
function generatePKCE(): PkcePair {
    const verifier = crypto.randomBytes(32).toString('base64url');
    const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');

    return { verifier, challenge };
}

/**
 * Encode OAuth state to base64url
 */
function encodeState(state: OAuthState): string {
    return Buffer.from(JSON.stringify(state)).toString('base64url');
}

/**
 * Decode OAuth state from base64url
 */
function decodeState(stateStr: string): OAuthState {
    const json = Buffer.from(stateStr, 'base64url').toString('utf8');
    return JSON.parse(json);
}

/**
 * Create authorization URL for Google OAuth
 */
export function createAuthorizationUrl(projectId?: string): AuthorizationResult {
    const pkce = generatePKCE();
    const state = encodeState({ verifier: pkce.verifier, projectId });

    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    url.searchParams.set('client_id', ANTIGRAVITY_CLIENT_ID);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('redirect_uri', ANTIGRAVITY_REDIRECT_URI);
    url.searchParams.set('scope', ANTIGRAVITY_SCOPES.join(' '));
    url.searchParams.set('code_challenge', pkce.challenge);
    url.searchParams.set('code_challenge_method', 'S256');
    url.searchParams.set('state', state);
    url.searchParams.set('access_type', 'offline');
    url.searchParams.set('prompt', 'consent');

    return {
        url: url.toString(),
        verifier: pkce.verifier,
    };
}

/**
 * Start local HTTP server to receive OAuth callback
 */
export function startCallbackServer(): Promise<{
    server: http.Server;
    codePromise: Promise<{ code: string; state: string }>;
}> {
    return new Promise((resolve, reject) => {
        let codeResolver: (value: { code: string; state: string }) => void;
        const codePromise = new Promise<{ code: string; state: string }>((res) => {
            codeResolver = res;
        });

        const server = http.createServer((req, res) => {
            const url = new URL(req.url!, `http://localhost:${ANTIGRAVITY_CALLBACK_PORT}`);

            if (url.pathname === '/oauth-callback') {
                const code = url.searchParams.get('code');
                const state = url.searchParams.get('state');
                const error = url.searchParams.get('error');

                if (error) {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(`<html><body><h1>Authentication Failed</h1><p>Error: ${error}</p><p>You can close this window.</p></body></html>`);
                    codeResolver({ code: '', state: '' });
                    return;
                }

                if (code && state) {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end('<html><body><h1>✓ Authentication Complete</h1><p>You can close this window and return to Antigravity.</p></body></html>');
                    codeResolver({ code, state });
                } else {
                    res.writeHead(400, { 'Content-Type': 'text/html' });
                    res.end('<html><body><h1>Bad Request</h1><p>Missing code or state parameter.</p></body></html>');
                }
            }
        });

        server.listen(ANTIGRAVITY_CALLBACK_PORT, () => {
            resolve({ server, codePromise });
        });

        server.on('error', reject);
    });
}

/**
 * Exchange authorization code for access/refresh tokens
 */
export async function exchangeCodeForTokens(
    code: string,
    state: string
): Promise<TokenExchangeResult> {
    try {
        const { verifier, projectId } = decodeState(state);

        // Exchange code for tokens
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: ANTIGRAVITY_CLIENT_ID,
                client_secret: ANTIGRAVITY_CLIENT_SECRET,
                code,
                grant_type: 'authorization_code',
                redirect_uri: ANTIGRAVITY_REDIRECT_URI,
                code_verifier: verifier,
            }),
        });

        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            return { success: false, error: `Token exchange failed: ${errorText}` };
        }

        const tokenData = await tokenResponse.json();

        // Get user email
        let email = '';
        try {
            const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
                headers: { Authorization: `Bearer ${tokenData.access_token}` },
            });
            if (userInfoResponse.ok) {
                const userInfo = await userInfoResponse.json();
                email = userInfo.email || '';
            }
        } catch (e) {
            console.warn('Failed to fetch user email:', e);
        }

        // Fetch account info (project ID and tier)
        const accountInfo = await fetchAccountInfo(tokenData.access_token);

        return {
            success: true,
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            expiresIn: tokenData.expires_in,
            email,
            projectId: projectId || accountInfo.projectId,
            tier: accountInfo.tier,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

/**
 * Fetch account info (project ID and tier) from Antigravity API
 */
export async function fetchAccountInfo(accessToken: string): Promise<AccountInfo> {
    let detectedTier: 'free' | 'paid' = 'free';
    let projectId = '';

    const headers = {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...ANTIGRAVITY_HEADERS,
    };

    // Try each endpoint fallback
    for (const endpoint of CODE_ASSIST_ENDPOINT_FALLBACKS) {
        try {
            const response = await fetch(`${endpoint}/v1internal:loadCodeAssist`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    metadata: {
                        ideType: 'IDE_UNSPECIFIED',
                        platform: 'PLATFORM_UNSPECIFIED',
                        pluginType: 'GEMINI',
                    },
                }),
            });

            if (!response.ok) {
                continue;
            }

            const data = await response.json();

            // Extract project ID
            if (typeof data.cloudaicompanionProject === 'string' && data.cloudaicompanionProject) {
                projectId = data.cloudaicompanionProject;
            } else if (data.cloudaicompanionProject?.id) {
                projectId = data.cloudaicompanionProject.id;
            }

            // Detect tier
            if (Array.isArray(data.allowedTiers)) {
                const defaultTier = data.allowedTiers.find((t: any) => t.isDefault);
                if (defaultTier?.id) {
                    const tierId = defaultTier.id;
                    if (tierId !== 'legacy-tier' && !tierId.includes('free') && !tierId.includes('zero')) {
                        detectedTier = 'paid';
                    }
                }
            }

            if (data.paidTier?.id) {
                const paidTierId = data.paidTier.id;
                if (!paidTierId.includes('free') && !paidTierId.includes('zero')) {
                    detectedTier = 'paid';
                }
            }

            if (projectId) {
                return { projectId, tier: detectedTier };
            }
        } catch (e) {
            console.warn(`Failed to fetch account info from ${endpoint}:`, e);
        }
    }

    // Use default project ID if nothing found
    return { projectId: projectId || ANTIGRAVITY_DEFAULT_PROJECT_ID, tier: detectedTier };
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<{
    success: boolean;
    accessToken?: string;
    expiresIn?: number;
    error?: string;
}> {
    try {
        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: ANTIGRAVITY_CLIENT_ID,
                client_secret: ANTIGRAVITY_CLIENT_SECRET,
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            return { success: false, error: `Token refresh failed: ${errorText}` };
        }

        const data = await response.json();

        return {
            success: true,
            accessToken: data.access_token,
            expiresIn: data.expires_in,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
