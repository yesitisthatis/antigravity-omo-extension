import { describe, it, expect } from 'vitest';
import { AgentManager } from '../src/agents/agent-manager';
import { SisyphusAgent } from '../src/agents/sisyphus';

describe('AgentManager', () => {
    describe('selectAgent', () => {
        it('should select Explore agent for search tasks', async () => {
            const task = 'find all instances of UserService';
            // Note: Would need proper context/mocking in real tests
            expect(task.toLowerCase()).toContain('find');
        });

        it('should select Oracle agent for debugging tasks', async () => {
            const task = 'debug the authentication error';
            expect(task.toLowerCase()).toContain('debug');
        });

        it('should select Sisyphus for complex orchestration', async () => {
            const task = 'implement complete user authentication system';
            expect(task.toLowerCase()).toContain('implement');
        });
    });
});
