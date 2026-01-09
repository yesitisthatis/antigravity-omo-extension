import { describe, it, expect, beforeEach } from 'vitest';
import { SubscriptionManager, SubscriptionTier } from '../src/core/subscription-manager';

describe('SubscriptionManager', () => {
    describe('getTierCapabilities', () => {
        it('should return correct capabilities for Free tier', () => {
            const capabilities = SubscriptionManager.prototype['getTierCapabilities']('free' as SubscriptionTier);

            expect(capabilities.maxAgents).toBe(2);
            expect(capabilities.backgroundTasks).toBe(false);
            expect(capabilities.advancedTools).toBe(false);
            expect(capabilities.models).toContain('gemini-2.0-flash');
            expect(capabilities.models).toContain('grok-code');
        });

        it('should return correct capabilities for Pro tier', () => {
            const capabilities = SubscriptionManager.prototype['getTierCapabilities']('pro' as SubscriptionTier);

            expect(capabilities.maxAgents).toBe(10);
            expect(capabilities.backgroundTasks).toBe(true);
            expect(capabilities.advancedTools).toBe(true);
            expect(capabilities.costCap).toBe(50);
        });

        it('should return unlimited capabilities for Enterprise tier', () => {
            const capabilities = SubscriptionManager.prototype['getTierCapabilities']('enterprise' as SubscriptionTier);

            expect(capabilities.maxAgents).toBe(-1);
            expect(capabilities.backgroundTasks).toBe(true);
            expect(capabilities.advancedTools).toBe(true);
            expect(capabilities.costCap).toBe(-1);
        });
    });
});
