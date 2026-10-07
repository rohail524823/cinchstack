#!/usr/bin/env node
// Writes src/data/scores/<tool>.json from the scoring workflow's result.
// Usage: node scripts/write-scores.mjs <result.json> [YYYY-MM-DD]
// The result file holds { final: { <tool>: { overall, factors, reasons, basis, program, passA, passB, ... } } }.
import fs from 'node:fs';
import { scoreSchema } from '../src/lib/schemas.mjs';

const [file, dateArg] = process.argv.slice(2);
if (!file) { console.error('usage: node scripts/write-scores.mjs <result.json> [date]'); process.exit(2); }
const scoredOn = dateArg ?? new Date().toISOString().slice(0, 10);
const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
const final = raw.final ?? raw;
const programs = JSON.parse(fs.readFileSync('src/data/programs.json', 'utf8'));
fs.mkdirSync('src/data/scores', { recursive: true });

let n = 0;
for (const [tool, f] of Object.entries(final)) {
  if (f.missingPass) { console.log(`skip ${tool}: a scoring pass is missing`); continue; }
  if (!fs.existsSync(`src/data/tools/${tool}.json`)) { console.log(`skip ${tool}: no tool data`); continue; }
  const prog = programs[tool];
  const paysUs = Boolean(prog && prog.status === 'approved' && prog.template);
  const rule = f.program
    ? 'lower of the two overall scores, because this tool runs an affiliate program we have joined or may join'
    : 'mean of the two overall scores, rounded down';
  const record = {
    tool,
    overall: f.overall,
    ...(f.overall === null ? { notScoredReason: f.notScoredReason } : {}),
    factors: f.factors,
    reasons: f.reasons,
    basis: f.basis,
    scoredOn,
    paysUs,
    method: `Two separate AI passes (two runs of Anthropic's Claude over the same evidence, neither seeing the other's score) scored six factors (1–5) and an overall; published overall is the ${rule}${f.calibratedFrom ? `; lowered from ${f.calibratedFrom} in calibration: ${f.calibrationNote}` : ''}. Pass scores: ${f.passA} and ${f.passB}.`,
  };
  const r = scoreSchema.safeParse(record);
  if (!r.success) { console.log(`✗ ${tool}: ${r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`); continue; }
  fs.writeFileSync(`src/data/scores/${tool}.json`, JSON.stringify(r.data, null, 2) + '\n');
  n++;
  console.log(`✓ ${tool}: ${f.overall ?? 'not scored'}${f.calibratedFrom ? ` (calibrated from ${f.calibratedFrom})` : ''}`);
}
console.log(`${n} score files written`);
