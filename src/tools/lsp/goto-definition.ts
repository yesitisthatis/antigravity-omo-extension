import * as vscode from 'vscode';
import { LSPManager } from './lsp-manager';

/**
 * Definition location
 */
export interface DefinitionLocation {
    uri: string;
    range: {
        start: { line: number; character: number };
        end: { line: number; character: number };
    };
}

/**
 * LSP Goto Definition tool
 */
export class LSPGotoDefinitionTool {
    private lspManager: LSPManager;

    constructor(context: vscode.ExtensionContext) {
        this.lspManager = LSPManager.getInstance(context);
    }

    /**
     * Get definition location(s) for symbol at position
     */
    async gotoDefinition(
        fileUri: string,
        line: number,
        character: number
    ): Promise<DefinitionLocation[]> {
        try {
            const uri = vscode.Uri.parse(fileUri);
            const client = this.lspManager.getClientForFile(uri);

            if (!client) {
                return [];
            }

            const position = new vscode.Position(line, character);

            const result = await vscode.commands.executeCommand<
                vscode.Location[] | vscode.LocationLink[]
            >(
                'vscode.executeDefinitionProvider',
                uri,
                position
            );

            if (!result || result.length === 0) {
                return [];
            }

            // Handle both Location and LocationLink types
            const locations: DefinitionLocation[] = [];

            for (const item of result) {
                if ('targetUri' in item) {
                    // LocationLink
                    locations.push({
                        uri: item.targetUri.toString(),
                        range: {
                            start: {
                                line: item.targetRange.start.line,
                                character: item.targetRange.start.character
                            },
                            end: {
                                line: item.targetRange.end.line,
                                character: item.targetRange.end.character
                            }
                        }
                    });
                } else {
                    // Location
                    locations.push({
                        uri: item.uri.toString(),
                        range: {
                            start: {
                                line: item.range.start.line,
                                character: item.range.start.character
                            },
                            end: {
                                line: item.range.end.line,
                                character: item.range.end.character
                            }
                        }
                    });
                }
            }

            return locations;
        } catch (error) {
            console.error('LSP goto definition error:', error);
            return [];
        }
    }

    /**
     * Format definition locations for AI
     */
    formatForAI(locations: DefinitionLocation[]): string {
        if (locations.length === 0) {
            return 'No definition found';
        }

        if (locations.length === 1) {
            const loc = locations[0];
            return `Definition at ${loc.uri}:${loc.range.start.line + 1}:${loc.range.start.character + 1}`;
        }

        return `Multiple definitions found:\n${locations.map((loc, i) =>
            `${i + 1}. ${loc.uri}:${loc.range.start.line + 1}:${loc.range.start.character + 1}`
        ).join('\n')}`;
    }
}
