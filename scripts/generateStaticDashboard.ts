import fs from 'fs';
import path from 'path';
import { fetchDashboardReports } from '../src/claude/dashboardData';

async function main(): Promise<void> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log('ANTHROPIC_API_KEY not set — skipping static dashboard generation');
    return;
  }

  const reports = await fetchDashboardReports();
  const outDir = path.join(process.cwd(), 'dist', 'static');
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, 'dashboard.json');
  fs.writeFileSync(outFile, JSON.stringify(reports));
  console.log(`Generated ${reports.length} dashboard reports → ${outFile}`);
}

main().catch((err) => {
  // Non-fatal: Pages site deploys without data rather than blocking the CI
  console.warn('Warning: static dashboard generation failed:', (err as Error).message);
});
