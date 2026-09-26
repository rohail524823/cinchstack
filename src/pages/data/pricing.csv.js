import { plansCsv } from '../../lib/dataset.mjs';
export function GET() {
  return new Response(plansCsv(), { headers: { 'Content-Type': 'text/csv; charset=utf-8' } });
}
