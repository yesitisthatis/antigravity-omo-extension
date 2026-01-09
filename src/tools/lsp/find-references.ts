import * as vscode from 'vscode';
import { LSPManager } from './lsp-manager';

/**
 * Reference location
 */
export interface ReferenceLocation {
    uri: string;
    range: {
        start: { line: number; character: number };
        end: { line: number; character: number };
    };
    context?: string; // Surrounding code snippet
}

/**
 * LSP Find References tool
 */
export class LSPFindReferencesTool {
    private lspManager: LSPManager;

    constructor(context: vscode.ExtensionContext) {
        this.lspManager = LSPManager.getInstance(context);
    }

    /**
     * Find all references to symbol at position
     */
    async findReferences(
        fileUri: string,
        line: number,
        character: number,
        includeDeclaration: boolean = true
    ): Promise<ReferenceLocation[]> {
        try {
            const uri = vscode.Uri.parse(fileUri);
            const client = this.lspManager.getClientForFile(uri);

            if (!client) {
                return [];
            }

            const position = new vscode.Position(line, character);

            const result = await vscode.commands.executeCommand<vscode.Location[]>(
                'vscode.executeReferenceProvider',
                uri,
                position
            );

            if (!result || result.length === 0) {
                return [];
            }

            const references: ReferenceLocation[] = [];

            for (const location of result) {
                // Get context (3 lines around the reference)
                const context = await this.getContext(location);

                references.push({
                    uri: location.uri.toString(),
                    range: {
                        start: {
                            line: location.range.start.line,
                            character: location.range.start.character
                        },
                        end: {
                            line: location.range.end.line,
                            character: location.range.end.character
                        }
                    },
                    context
                });
            }

            return references;
        } catch (error) {
            console.error('LSP find references error:', error);
            return [];
        }
    }

    /**
     * Get code context around a location
     */
    private async getContext(location: vscode.Location): Promise<string> {
        try {
            const document = await vscode.workspace.openTextDocument(location.uri);
            const startLine = Math.max(0, location.range.start.line - 1);
            const endLine = Math.min(document.lineCount - 1, location.range.end.line + 1);

            const lines: string[] = [];
            for (let i = startLine; i <= endLine; i++) {
                const prefix = i === location.range.start.line ? '→ ' : '  ';
                lines.push(`${prefix}${document.lineAt(i).text}`);
            }

            return lines.join('\n');
        } catch (error) {
            return '';
        }
    }

    /**
     * Format references for AI
     */
    formatForAI(references: ReferenceLocation[]): string {
        if (references.length === 0) {
            return 'No references found';
        }

        const grouped = this.groupByFile(references);
        const output: string[] = [];

        output.push(`Found ${references.length} reference(s) across ${grouped.size} file(s):\n`);

        for (const [file, refs] of grouped) {
            const fileName = file.split('/').pop() || file;
            output.push(`📄 ${fileName} (${refs.length} reference${refs.length > 1 ? 's' : ''}):`);

            for (const ref of refs) {
                output.push(`  Line ${ref.range.start.line + 1}:`);
                if (ref.context) {
                    output.push(ref.context.split('\n').map(l => `    ${l}`).join('\n'));
                }
            }
            output.push('');
        }

        return output.join('\n');
    }

    /**
     * Group references by file
     */
    private groupByFile(references: ReferenceLocation[]): Map<string, ReferenceLocation[]> {
        const grouped = new Map<string, ReferenceLocation[]>();

        for (const ref of references) {
            const existing = grouped.get(ref.uri) || [];
            existing.push(ref);
            grouped.set(ref.uri, existing);
        }

        return grouped;
    }
}
