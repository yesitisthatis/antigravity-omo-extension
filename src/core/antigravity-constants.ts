/**
 * Antigravity OAuth Constants
 * Public credentials from Antigravity IDE integration
 */

// OAuth Credentials (publicly available from opencode-antigravity-auth repos)
export const ANTIGRAVITY_CLIENT_ID = "1071006060591-tmhssin2h21lcre235vtolojh4g403ep.apps.googleusercontent.com";
export const ANTIGRAVITY_CLIENT_SECRET = "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";
export const ANTIGRAVITY_CALLBACK_PORT = 36743; // Avoid conflicts with OpenCode (36742) and NoeFabris (51121)
export const ANTIGRAVITY_REDIRECT_URI = `http://localhost:${ANTIGRAVITY_CALLBACK_PORT}/oauth-callback`;

// Required OAuth Scopes
export const ANTIGRAVITY_SCOPES: readonly string[] = [
    "https://www.googleapis.com/auth/cloud-platform",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/cclog",
    "https://www.googleapis.com/auth/experimentsandconfigs",
];

// Antigravity API Endpoints (with fallback order)
export const CODE_ASSIST_ENDPOINT_DAILY = "https://daily-cloudcode-pa.sandbox.googleapis.com";
export const CODE_ASSIST_ENDPOINT_AUTOPUSH = "https://autopush-cloudcode-pa.sandbox.googleapis.com";
export const CODE_ASSIST_ENDPOINT_PROD = "https://cloudcode-pa.googleapis.com";

export const CODE_ASSIST_ENDPOINT_FALLBACKS = [
    CODE_ASSIST_ENDPOINT_DAILY,
    CODE_ASSIST_ENDPOINT_AUTOPUSH,
    CODE_ASSIST_ENDPOINT_PROD,
] as const;

// HTTP Headers for Antigravity API requests
export const ANTIGRAVITY_HEADERS = {
    "User-Agent": "antigravity/1.11.5 windows/amd64",
    "X-Goog-Api-Client": "google-cloud-sdk vscode_cloudshelleditor/0.1",
    "Client-Metadata": '{"ideType":"IDE_UNSPECIFIED","platform":"PLATFORM_UNSPECIFIED","pluginType":"GEMINI"}',
} as const;

// Default project ID when account doesn't return one
export const ANTIGRAVITY_DEFAULT_PROJECT_ID = "rising-fact-p41fc";
