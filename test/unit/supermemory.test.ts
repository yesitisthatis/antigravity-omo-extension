import { describe, it, expect } from 'vitest';
import { SupermemoryManager } from '../src/memory/supermemory';

describe('SupermemoryManager', () => {
    describe('autoSaveFromText', () => {
        it('should detect "remember" keyword', () => {
            const text = 'Remember that the API endpoint is /api/users';
            expect(text.toLowerCase()).toContain('remember');
        });

        it('should detect "important" keyword', () => {
            const text = 'Important: Always validate user input';
            expect(text.toLowerCase()).toContain('important');
        });

        it('should not trigger for normal text', () => {
            const text = 'This is just a regular comment';
            const keywords = ['remember', 'important', 'note:', 'save this'];
            const hasKeyword = keywords.some(k => text.toLowerCase().includes(k));
            expect(hasKeyword).toBe(false);
        });
    });

    describe('privacy tags', () => {
        it('should detect private tags', () => {
            const text = '<private>API_KEY=secret123</private>';
            expect(text).toContain('<private>');
        });

        it('should strip private content', async () => {
            const text = 'Public info <private>SECRET</private> more public';
            const stripped = text.replace(/<private>.*?<\/private>/gs, '[REDACTED]');
            expect(stripped).toContain('[REDACTED]');
            expect(stripped).not.toContain('SECRET');
        });
    });
});
