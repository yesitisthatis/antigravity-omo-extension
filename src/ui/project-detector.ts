import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Project type
 */
export type ProjectType =
    | 'typescript'
    | 'javascript'
    | 'python'
    | 'go'
    | 'rust'
    | 'java'
    | 'unknown';

/**
 * Framework detection
 */
export interface ProjectInfo {
    type: ProjectType;
    framework?: string;
    packageManager?: 'npm' | 'yarn' | 'pnpm' | 'pip' | 'cargo' | 'go mod';
    hasTests?: boolean;
}

/**
 * Project detector - auto-detects project type and framework
 */
export class ProjectDetector {
    /**
     * Detect project type from workspace
     */
    static async detectProject(): Promise<ProjectInfo> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            return { type: 'unknown' };
        }

        const rootPath = workspaceFolders[0].uri.fsPath;

        // TypeScript/JavaScript detection
        if (this.fileExists(rootPath, 'package.json')) {
            const packageJson = this.readPackageJson(rootPath);
            return await this.detectJsProject(rootPath, packageJson);
        }

        // Python detection
        if (this.fileExists(rootPath, 'requirements.txt') ||
            this.fileExists(rootPath, 'setup.py') ||
            this.fileExists(rootPath, 'pyproject.toml')) {
            return this.detectPythonProject(rootPath);
        }

        // Go detection
        if (this.fileExists(rootPath, 'go.mod')) {
            return { type: 'go', packageManager: 'go mod', hasTests: this.hasGoTests(rootPath) };
        }

        // Rust detection
        if (this.fileExists(rootPath, 'Cargo.toml')) {
            return { type: 'rust', packageManager: 'cargo', hasTests: this.hasRustTests(rootPath) };
        }

        // Java detection
        if (this.fileExists(rootPath, 'pom.xml') || this.fileExists(rootPath, 'build.gradle')) {
            return { type: 'java', framework: this.detectJavaFramework(rootPath) };
        }

        return { type: 'unknown' };
    }

    /**
     * Detect JS/TS project details
     */
    private static async detectJsProject(rootPath: string, packageJson: any): Promise<ProjectInfo> {
        const info: ProjectInfo = {
            type: this.hasTypeScript(rootPath) ? 'typescript' : 'javascript',
            packageManager: this.detectPackageManager(rootPath),
            hasTests: this.hasTests(packageJson)
        };

        // Framework detection
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

        if (deps.react || deps['@types/react']) {
            info.framework = 'React';
        } else if (deps.vue || deps['@vue/cli']) {
            info.framework = 'Vue';
        } else if (deps.angular || deps['@angular/core']) {
            info.framework = 'Angular';
        } else if (deps.svelte) {
            info.framework = 'Svelte';
        } else if (deps.next) {
            info.framework = 'Next.js';
        } else if (deps.express) {
            info.framework = 'Express';
        } else if (deps.nestjs || deps['@nestjs/core']) {
            info.framework = 'NestJS';
        }

        return info;
    }

    /**
     * Detect Python project details
     */
    private static detectPythonProject(rootPath: string): ProjectInfo {
        return {
            type: 'python',
            packageManager: 'pip',
            framework: this.detectPythonFramework(rootPath),
            hasTests: this.hasPythonTests(rootPath)
        };
    }

    /**
     * Detect Python framework
     */
    private static detectPythonFramework(rootPath: string): string | undefined {
        if (this.fileExists(rootPath, 'manage.py')) return 'Django';
        if (this.fileExists(rootPath, 'app.py')) return 'Flask';
        if (this.fileExists(rootPath, 'main.py')) return 'FastAPI';
        return undefined;
    }

    /**
     * Detect Java framework
     */
    private static detectJavaFramework(rootPath: string): string | undefined {
        if (this.fileExists(rootPath, 'build.gradle')) return 'Spring Boot';
        return undefined;
    }

    /**
     * Check if TypeScript is used
     */
    private static hasTypeScript(rootPath: string): boolean {
        return this.fileExists(rootPath, 'tsconfig.json');
    }

    /**
     * Detect package manager
     */
    private static detectPackageManager(rootPath: string): 'npm' | 'yarn' | 'pnpm' {
        if (this.fileExists(rootPath, 'pnpm-lock.yaml')) return 'pnpm';
        if (this.fileExists(rootPath, 'yarn.lock')) return 'yarn';
        return 'npm';
    }

    /**
     * Check if project has tests
     */
    private static hasTests(packageJson: any): boolean {
        const scripts = packageJson.scripts || {};
        return !!(scripts.test || scripts['test:unit'] || scripts['test:e2e']);
    }

    /**
     * Check if Python project has tests
     */
    private static hasPythonTests(rootPath: string): boolean {
        return this.directoryExists(rootPath, 'tests') ||
            this.directoryExists(rootPath, 'test');
    }

    /**
     * Check if Go project has tests
     */
    private static hasGoTests(rootPath: string): boolean {
        const files = fs.readdirSync(rootPath);
        return files.some(f => f.endsWith('_test.go'));
    }

    /**
     * Check if Rust project has tests
     */
    private static hasRustTests(rootPath: string): boolean {
        return this.directoryExists(rootPath, 'tests');
    }

    /**
     * Check if file exists
     */
    private static fileExists(rootPath: string, fileName: string): boolean {
        const filePath = path.join(rootPath, fileName);
        return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
    }

    /**
     * Check if directory exists
     */
    private static directoryExists(rootPath: string, dirName: string): boolean {
        const dirPath = path.join(rootPath, dirName);
        return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
    }

    /**
     * Read package.json
     */
    private static readPackageJson(rootPath: string): any {
        try {
            const content = fs.readFileSync(path.join(rootPath, 'package.json'), 'utf8');
            return JSON.parse(content);
        } catch {
            return {};
        }
    }
}
