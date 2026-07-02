import Anthropic from '@anthropic-ai/sdk';
import { Page, Route } from '@playwright/test';
import { UploadResponse } from '../../src/server/types';

function buildMockPrompt(): string {
  return `Return a single JSON object with a "status" field. The value must be one of: 50, 61, 67, 70. Example: {"status":50}. Respond with only the JSON, no markdown.`;
}

export async function generateMockUploadResponse(): Promise<UploadResponse> {
  const client = new Anthropic();
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 64,
    messages: [{ role: 'user', content: buildMockPrompt() }],
  });
  const content = message.content[0];
  if (content.type !== 'text') throw new Error('Unexpected content type');
  return JSON.parse(content.text) as UploadResponse;
}

export async function interceptUploadRoute(page: Page, response: UploadResponse): Promise<void> {
  await page.route('**/api/upload', (route) => fulfillWithJson(route, response));
}

export async function fulfillWithJson(route: Route, data: UploadResponse): Promise<void> {
  await route.fulfill({ contentType: 'application/json', body: JSON.stringify(data) });
}
