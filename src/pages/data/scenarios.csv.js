import { scenariosCsv } from '../../lib/dataset.mjs';
export function GET() {
  return new Response(scenariosCsv(), { headers: { 'Content-Type': 'text/csv; charset=utf-8' } });
}
