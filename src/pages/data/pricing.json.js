import { datasetJson } from '../../lib/dataset.mjs';
export function GET() {
  return new Response(JSON.stringify(datasetJson(), null, 2) + '\n', { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
