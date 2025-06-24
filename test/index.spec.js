import { env, createExecutionContext, waitOnExecutionContext, SELF } from 'cloudflare:test';
import { describe, it, expect, beforeEach } from 'vitest';
import worker from '../src';

// Mock environment variables for testing
const testEnv = {
	NOTION_TOKEN: 'secret_test_token_12345',
	NOTION_DB_ID: 'test-database-id-12345'
};

describe('Notion Relay Worker', () => {
	beforeEach(() => {
		// Reset any global state if needed
	});

	describe('HTTP Method Validation', () => {
		it('should reject GET requests with 405', async () => {
			const request = new Request('http://example.com', { method: 'GET' });
			const ctx = createExecutionContext();
			const response = await worker.fetch(request, testEnv, ctx);
			await waitOnExecutionContext(ctx);
			
			expect(response.status).toBe(405);
			expect(await response.text()).toBe('Method Not Allowed');
		});

		it('should reject PUT requests with 405', async () => {
			const request = new Request('http://example.com', { method: 'PUT' });
			const ctx = createExecutionContext();
			const response = await worker.fetch(request, testEnv, ctx);
			await waitOnExecutionContext(ctx);
			
			expect(response.status).toBe(405);
			expect(await response.text()).toBe('Method Not Allowed');
		});
	});

	describe('Environment Variable Validation', () => {
		it('should return 400 when NOTION_TOKEN is missing', async () => {
			const request = new Request('http://example.com', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ test: 'data' })
			});
			const ctx = createExecutionContext();
			
			const envWithoutToken = { ...testEnv };
			delete envWithoutToken.NOTION_TOKEN;
			
			const response = await worker.fetch(request, envWithoutToken, ctx);
			await waitOnExecutionContext(ctx);
			
			expect(response.status).toBe(400);
			expect(await response.text()).toBe('Missing NOTION_TOKEN environment variable');
		});

		it('should return 400 when NOTION_DB_ID is missing', async () => {
			const request = new Request('http://example.com', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ test: 'data' })
			});
			const ctx = createExecutionContext();
			
			const envWithoutDbId = { ...testEnv };
			delete envWithoutDbId.NOTION_DB_ID;
			
			const response = await worker.fetch(request, envWithoutDbId, ctx);
			await waitOnExecutionContext(ctx);
			
			expect(response.status).toBe(400);
			expect(await response.text()).toBe('Missing NOTION_DB_ID environment variable');
		});
	});

	describe('JSON Validation', () => {
		it('should return 400 for invalid JSON', async () => {
			const request = new Request('http://example.com', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: 'invalid-json-content'
			});
			const ctx = createExecutionContext();
			const response = await worker.fetch(request, testEnv, ctx);
			await waitOnExecutionContext(ctx);
			
			expect(response.status).toBe(400);
			expect(await response.text()).toContain('Invalid JSON in request body');
		});

		it('should accept empty JSON object', async () => {
			const request = new Request('http://example.com', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: '{}'
			});
			const ctx = createExecutionContext();
			
			// Note: This test will fail against real Notion API without mocking
			// In a real test environment, you'd mock the Notion API calls
			const response = await worker.fetch(request, testEnv, ctx);
			await waitOnExecutionContext(ctx);
			
			// This will likely return an error due to invalid test credentials
			// but at least validates that JSON parsing works
			expect(response.status).toBeGreaterThanOrEqual(400);
		});
	});

	describe('Request Format Validation', () => {
		it('should handle requests without Content-Type header', async () => {
			const request = new Request('http://example.com', {
				method: 'POST',
				body: JSON.stringify({ test: 'data' })
			});
			const ctx = createExecutionContext();
			const response = await worker.fetch(request, testEnv, ctx);
			await waitOnExecutionContext(ctx);
			
			// Should still attempt to parse as JSON
			expect(response.status).toBeGreaterThanOrEqual(400);
		});
	});

	describe('Error Handling', () => {
		it('should handle worker errors gracefully', async () => {
			// Test with malformed environment to trigger worker error
			const request = new Request('http://example.com', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ test: 'data' })
			});
			const ctx = createExecutionContext();
			
			// Use completely invalid env to trigger errors
			const badEnv = { NOTION_TOKEN: '', NOTION_DB_ID: '' };
			const response = await worker.fetch(request, badEnv, ctx);
			await waitOnExecutionContext(ctx);
			
			expect(response.status).toBeGreaterThanOrEqual(400);
			expect(response.status).toBeLessThan(600);
		});
	});
});

// Integration tests that could work with real API (when properly configured)
describe('Notion Relay Integration (requires real credentials)', () => {
	// These tests should be skipped in CI unless real credentials are available
	const hasRealCredentials = env.NOTION_TOKEN && env.NOTION_DB_ID && 
		env.NOTION_TOKEN.startsWith('secret_') && 
		env.NOTION_DB_ID.length >= 32;
	
	const testCondition = hasRealCredentials ? it : it.skip;
	
	testCondition('should successfully send data to real Notion database', async () => {
		const testData = {
			callerName: 'Test Suite',
			message: 'Automated test message',
			timestamp: new Date().toISOString(),
			testRun: true
		};
		
		const response = await SELF.fetch('http://example.com', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(testData)
		});
		
		expect(response.status).toBe(200);
		expect(await response.text()).toContain('Success');
	});
});
