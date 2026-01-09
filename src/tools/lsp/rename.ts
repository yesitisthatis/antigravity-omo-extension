import * as vscode from 'vscode';
import { LSPManager } from './lsp-manager';

/**
 * Rename result
 */
export interface RenameResult {
    success: boolean;
    changedFiles: number;
    changes: {
        uri: string;
        edits: {
            range: {
                start: { line: number; character: number };
                end: { line: number; character: number };
            };
            newText: string;
        }[];
    }[];
    error?: string;
}

/**
 * LSP Rename tool
 */
export class LSPRenameTool {
    private lspManager: LSPManager;

    constructor(context: vscode.ExtensionContext) {
        this.lspManager = LSPManager.getInstance(context);
    }

    /**
     * Rename symbol at position
     */
    async rename(
        fileUri: string,
        line: number,
        character: number,
        newName: string,
        preview: boolean = true
    ): Promise<RenameResult> {
        try {
            const uri = vscode.Uri.parse(fileUri);
            const client = this.lspManager.getClientForFile(uri);

            if (!client) {
                return {
                    success: false,
                    changedFiles: 0,
                    changes: [],
                    error: 'LSP server not available'
                };
            }

            const position = new vscode.Position(line, character);

            // First, check if rename is possible (prepareRename)
            const prepareResult = await vscode.commands.executeCommand<
                vscode.Range | { range: vscode.Range; placeholder: string } | undefined
            >(
                'vscode.executePrepareRename',
                uri,
                position
            );

            if (!prepareResult) {
                return {
                    success: false,
                    changedFiles: 0,
                    changes: [],
                    error: 'Symbol cannot be renamed'
                };
            }

            // Get rename edits
            const workspaceEdit = await vscode.commands.executeCommand<vscode.WorkspaceEdit>(
                'vscode.executeDocumentRenameProvider',
                uri,
                position,
                newName
            );

            if (!workspaceEdit) {
                return {
                    success: false,
                    changedFiles: 0,
                    changes: [],
                    error: 'No changes generated'
                };
            }

            // Convert to our format
            const changes = this.convertWorkspaceEdit(workspaceEdit);

            // If preview requested, show changes to user
            if (preview) {
                const proceed = await this.showPreview(changes);
                if (!proceed) {
                    return {
                        success: false,
                        changedFiles: 0,
                        changes,
                        error: 'User cancelled'
                    };
                }
            }

            // Apply the edits
            const applied = await vscode.workspace.applyEdit(workspaceEdit);

            return {
                success: applied,
                changedFiles: changes.length,
                changes,
                error: applied ? undefined : 'Failed to apply changes'
            };
        } catch (error) {
            console.error('LSP rename error:', error);
            return {
                success: false,
                changedFiles: 0,
                changes: [],
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Convert VSCode WorkspaceEdit to our format
     */
    private convertWorkspaceEdit(edit: vscode.WorkspaceEdit): RenameResult['changes'] {
        const changes: RenameResult['changes'] = [];

        for (const [uri, textEdits] of edit.entries()) {
            changes.push({
                uri: uri.toString(),
                edits: textEdits.map(edit => ({
                    range: {
                        start: {
                            line: edit.range.start.line,
                            character: edit.range.start.character
                        },
                        end: {
                            line: edit.range.end.line,
                            character: edit.range.end.character
                        }
                    },
                    newText: edit.newText
                }))
            });
        }

        return changes;
    }

    /**
     * Show preview of changes to user
     */
    private async showPreview(changes: RenameResult['changes']): Promise<boolean> {
        const totalEdits = changes.reduce((sum, c) => sum + c.edits.length, 0);

        const message = `Rename will affect ${totalEdits} location(s) in ${changes.length} file(s). Proceed?`;

        const choice = await vscode.window.showInformationMessage(
            message,
            { modal: true },
            'Rename',
            'Cancel'
        );

        return choice === 'Rename';
    }

    /**
     * Format rename result for AI
     */
    formatForAI(result: RenameResult): string {
        if (!result.success) {
            return `Rename failed: ${result.error || 'Unknown error'}`;
        }

        const output: string[] = [`✓ Rename successful - ${result.changedFiles} file(s) modified:\n`];

        for (const change of result.changes) {
            const fileName = change.uri.split('/').pop() || change.uri;
            output.push(`📄 ${fileName}: ${change.edits.length} edit(s)`);
        }

        return output.join('\n');
    }
}
