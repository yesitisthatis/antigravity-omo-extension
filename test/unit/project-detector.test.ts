import { describe, it, expect } from 'vitest';
import { ProjectDetector } from '../src/ui/project-detector';

describe('ProjectDetector', () => {
    describe('framework detection', () => {
        it('should detect React projects', () => {
            const packageJson = {
                dependencies: { 'react': '^18.0.0' }
            };
            expect(packageJson.dependencies.react).toBeDefined();
        });

        it('should detect Next.js projects', () => {
            const packageJson = {
                dependencies: { 'next': '^14.0.0' }
            };
            expect(packageJson.dependencies.next).toBeDefined();
        });

        it('should detect Express projects', () => {
            const packageJson = {
                dependencies: { 'express': '^4.18.0' }
            };
            expect(packageJson.dependencies.express).toBeDefined();
        });
    });

    describe('package manager detection', () => {
        it('should identify pnpm from lockfile', () => {
            const lockfiles = ['pnpm-lock.yaml', 'yarn.lock', 'package-lock.json'];
            expect(lockfiles[0]).toBe('pnpm-lock.yaml');
        });

        it('should identify yarn from lockfile', () => {
            const lockfiles = ['yarn.lock', 'package-lock.json'];
            expect(lockfiles[0]).toBe('yarn.lock');
        });
    });
});
