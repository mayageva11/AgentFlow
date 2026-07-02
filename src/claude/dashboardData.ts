import Anthropic from '@anthropic-ai/sdk';

export interface CommissionReport {
  manufacturer: 'מנורה' | 'כלל' | 'מגדל';
  month: string;
  totalCommission: number;
  policyCount: number;
  status: 'processed' | 'pending';
}

function buildPrompt(): string {
  return `Generate between 5 and 8 realistic CommissionReport objects as a JSON array.
Each object must have these exact fields:
- manufacturer: one of "מנורה", "כלל", or "מגדל"
- month: string in MM-YYYY format (e.g., "01-2024")
- totalCommission: a realistic number between 1000 and 50000
- policyCount: a realistic integer between 5 and 100
- status: either "processed" or "pending"

Respond with only the JSON array, no markdown, no explanation.`;
}

function parseReports(text: string): CommissionReport[] {
  const cleaned = text.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '');
  return JSON.parse(cleaned) as CommissionReport[];
}

export async function fetchDashboardReports(): Promise<CommissionReport[]> {
  const client = new Anthropic();
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: buildPrompt() }],
  });
  const content = message.content[0];
  if (content.type !== 'text') throw new Error('Unexpected response type');
  return parseReports(content.text);
}
