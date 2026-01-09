import * as vscode from 'vscode';
import { LSPManager } from './lsp-manager';

/**
 * Hover result
 */
export interface HoverResult {
    contents: string[];
    range?: {
        start: { line: number; character: number };
        end: { line: number; character: number };
    };
}

/**
 * LSP Hover tool
 */
export class LSPHoverTool {
    private lspManager: LSPManager;

    constructor(context: vscode.ExtensionContext) {
        this.lspManager = LSPManager.getInstance(context);
    }

    /**
     * Get hover information at position
     */
    async hover(
        fileUri: string,
        line: number,
        character: number
    ): Promise<HoverResult | null> {
        try {
            const uri = vscode.Uri.parse(fileUri);
            const client = this.lspManager.getClientForFile(uri);

            if (!client) {
                return {
                    contents: ['LSP server not available for this file type']
                };
            }

            const position = new vscode.Position(line, character);
            const document = await vscode.workspace.openTextDocument(uri);

            const result = await vscode.commands.executeCommand<vscode.Hover[]>(
                'vscode.executeHoverProvider',
                uri,
                position
            );

            if (!result || result.length === 0) {
                return null;
            }

            const hover = result[0];
            const contents = hover.contents.map(content => {
                if (typeof content === 'string') {
                    return content;
                } else if ('value' in content) {
                    return content.value;
                }
                return '';
            });

            return {
                contents,
                range: hover.range ? {
                    start: {
                        line: hover.range.start.line,
                        character: hover.range.start.character
                    },
                    end: {
                        line: hover.range.end.line,
                        character: hover.range.end.character
                    }
                } : undefined
            };
        } catch (error) {
            console.error('LSP hover error:', error);
            return null;
        }
    }

    /**
     * Format hover result for AI consumption
     */
    formatForAI(result: HoverResult | null): string {
        if (!result) {
            return 'No hover information available';
        }

        return result.contents.join('\n\n');
    }
}
