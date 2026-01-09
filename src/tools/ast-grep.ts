import * as vscode from 'vscode';

/**
 * AST-Grep search result
 */
export interface ASTGrepMatch {
    file: string;
    line: number;
    column: number;
    matched: string;
    context: string;
}

/**
 * AST-Grep tool - Semantic code search
 * Note: Production would use @ast-grep/napi for actual AST parsing
 */
export class ASTGrepTool {
    /**
     * Search for code patterns using AST-aware matching
     */
    async search(
        pattern: string,
        filePattern: string = '**/*.{ts,js,py,go}'
    ): Promise<ASTGrepMatch[]> {
        const matches: ASTGrepMatch[] = [];

        try {
            // Find files matching pattern
            const files = await vscode.workspace.findFiles(
                filePattern,
                '**/node_modules/**',
                100
            );

            for (const file of files) {
                const document = await vscode.workspace.openTextDocument(file);
                const text = document.getText();

                // Simple pattern matching (production would use AST parsing)
                const lines = text.split('\n');
                for (let i = 0; i < lines.length; i++) {
                    if (this.matchesPattern(lines[i], pattern)) {
                        // Get context (3 lines)
                        const contextStart = Math.max(0, i - 1);
                        const contextEnd = Math.min(lines.length - 1, i + 1);
                        const context = lines.slice(contextStart, contextEnd + 1).join('\n');

                        matches.push({
                            file: file.fsPath,
                            line: i + 1,
                            column: lines[i].indexOf(pattern),
                            matched: lines[i].trim(),
                            context
                        });
                    }
                }
            }
        } catch (error) {
            console.error('AST-Grep search error:', error);
        }

        return matches;
    }

    /**
     * Replace code patterns
     */
    async replace(
        pattern: string,
        replacement: string,
        filePattern: string = '**/*.{ts,js,py,go}',
        dryRun: boolean = true
    ): Promise<{ file: string; changes: number }[]> {
        const results: { file: string; changes: number }[] = [];

        try {
            const matches = await this.search(pattern, filePattern);
            const fileGroups = this.groupByFile(matches);

            for (const [file, fileMatches] of fileGroups) {
                const uri = vscode.Uri.file(file);
                const document = await vscode.workspace.openTextDocument(uri);
                const edit = new vscode.WorkspaceEdit();

                let changes = 0;
                for (const match of fileMatches) {
                    const line = match.line - 1;
                    const start = new vscode.Position(line, match.column);
                    const end = new vscode.Position(line, match.column + pattern.length);
                    const range = new vscode.Range(start, end);

                    edit.replace(uri, range, replacement);
                    changes++;
                }

                if (!dryRun && changes > 0) {
                    await vscode.workspace.applyEdit(edit);
                }

                if (changes > 0) {
                    results.push({ file, changes });
                }
            }
        } catch (error) {
            console.error('AST-Grep replace error:', error);
        }

        return results;
    }

    /**
     * Simple pattern matching (stub for actual AST matching)
     */
    private matchesPattern(line: string, pattern: string): boolean {
        return line.includes(pattern);
    }

    /**
     * Group matches by file
     */
    private groupByFile(matches: ASTGrepMatch[]): Map<string, ASTGrepMatch[]> {
        const grouped = new Map<string, ASTGrepMatch[]>();
        for (const match of matches) {
            const existing = grouped.get(match.file) || [];
            existing.push(match);
            grouped.set(match.file, existing);
        }
        return grouped;
    }

    /**
     * Format results for AI
     */
    formatResults(matches: ASTGrepMatch[]): string {
        if (matches.length === 0) {
            return 'No matches found';
        }

        const grouped = this.groupByFile(matches);
        const output: string[] = [`Found ${matches.length} matches in ${grouped.size} files:\n`];

        for (const [file, fileMatches] of grouped) {
            const fileName = file.split('/').pop() || file;
            output.push(`📄 ${fileName} (${fileMatches.length} matches):`);

            for (const match of fileMatches.slice(0, 3)) { // Show first 3 per file
                output.push(`  Line ${match.line}: ${match.matched}`);
            }

            if (fileMatches.length > 3) {
                output.push(`  ... and ${fileMatches.length - 3} more`);
            }
            output.push('');
        }

        return output.join('\n');
    }
}
