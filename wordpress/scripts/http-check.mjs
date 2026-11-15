import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const run = promisify(execFile);
const base = (process.env.WDT_PREVIEW_URL || 'https://darkseagreen-trout-940046.hostingersite.com').replace(/\/$/, '');
const proxy = process.env.WDT_HTTP_PROXY || 'http://127.0.0.1:4780';
async function request(path, input, method = 'GET', form = false) {
  const args = ['--silent', '--show-error', '--max-time', '35', '--proxy', proxy, '-D', '-', '-w', '\nWDT_STATUS:%{http_code}', '-X', method];
  if (input) args.push('-H', form ? 'Content-Type: application/x-www-form-urlencoded' : 'Content-Type: application/json', '--data-raw', form ? new URLSearchParams(input).toString() : JSON.stringify(input));
  args.push(base + path);
  const { stdout } = await run('curl.exe', args, { maxBuffer: 4 * 1024 * 1024 });
  const status = Number(stdout.match(/WDT_STATUS:(\d+)$/)?.[1]);
  const content = stdout.replace(/\nWDT_STATUS:\d+$/, '');
  // HTTP proxy CONNECT headers may precede the actual response headers.
  const boundary = content.search(/\r?\n\r?\n(?=[<{[])/);
  const headers = content.slice(0, boundary);
  const body = boundary < 0 ? content.slice(content.indexOf('\r\n\r\n') + 4) : content.slice(boundary).trimStart();
  return { status, body, headers };
}
const samples = ['', '8-hours-from-now', '15-hours-ago', '10-hours-ago', '72-hours-from-now', '48-hours-from-now', '18-hours-from-now', 'calculators/countdown', 'calculators/date-calculator', '8-business-days-from-today', '90-business-days-from-today', '35-business-days-from-today', 'toronto-to-new-york-time', 'london-to-toronto-time', 'singapore-to-melbourne-time', '500-hours-ago', 'time', 'time/new-york', 'calculations/hours-from-now', 'calculations/hours-from-now/2', 'calculators/business-days', 'calculators/time-difference', 'calculators/age-calculator', 'calculators/days-until', 'calculators/day-of-week', 'calculators/days-in-month', 'calculators/weeks-in-year', 'calculators/calendar', 'calculators/half-birthday', 'calculators/weeks-and-days-ago', 'calculation-methodology', 'privacy-policy'];
const records = [];
for (const slug of samples) {
  const response = await request('/' + slug);
  assert.equal(response.status, 200, slug);
  assert.equal((response.body.match(/<title>/g) || []).length, 1, `${slug}: title`);
  assert.equal((response.body.match(/<h1(?:\s|>)/g) || []).length, 1, `${slug}: H1`);
  const canonicals = [...response.body.matchAll(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)/g)];
  assert.equal(canonicals.length, 1, `${slug}: canonical count`);
  assert.equal(canonicals[0][1].replace(/\/$/, ''), base + (slug ? '/' + slug : ''), `${slug}: preview self-canonical`);
  assert.match(response.body, /noindex/, `${slug}: staging must not index`);
  assert.doesNotMatch(response.body, /G-LLS4S0NQH8/, `${slug}: no preview GA`);
  for (const match of response.body.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/g)) JSON.parse(match[1]);
  assert.match(response.headers, /no-store/i, `${slug}: freshness`);
  if (response.body.includes('data-tool-state')) {
    const state = JSON.parse(response.body.match(/<script[^>]*data-tool-state[^>]*>([\s\S]*?)<\/script>/)[1]);
    assert.ok(state.result.answer && state.result.formula, `${slug}: initial PHP result`);
    if (state.result.mode === 'live') assert.ok(Math.abs(Date.now() - Date.parse(state.result.start.instant)) < 120000, `${slug}: stale reference`);
    assert.match(response.body, /data-answer/);
  }
  records.push({ slug, status: response.status });
  console.log(`HTML OK /${slug}`);
}
for (const slug of ['not-a-real-calculator', '999999-hours-ago']) assert.equal((await request('/' + slug)).status, 404, slug);
const redirect = await request('/date-calculator');
assert.equal(redirect.status, 308); assert.match(redirect.headers, /location:.*\/calculators\/date-calculator/i);
const shards = JSON.parse(readFileSync(new URL('../whatdatetime-tools/data/sitemap.json', import.meta.url), 'utf8'));
const index = await request('/sitemap.xml'); assert.equal(index.status, 200);
let urls = 0;
for (const [name, pages] of Object.entries(shards)) {
  assert.ok(index.body.includes(name));
  const sitemap = await request('/' + name); assert.equal(sitemap.status, 200);
  assert.equal((sitemap.body.match(/<url>/g) || []).length, pages.length);
  for (const page of pages) assert.ok(sitemap.body.includes('https://whatdatetime.com' + (page.slug ? '/' + page.slug : '')));
  urls += pages.length;
}
const api = '/wp-json/whatdatetime/v1/calculate';
const noJavaScript = await request('/calculators/date-calculator', { wdt_action: 'calculate', start: '2028-02-28T12:00', amount: '1', unit: 'day', direction: 'future', zone: 'UTC', occurrence: 'earlier' }, 'POST', true);
assert.equal(noJavaScript.status, 200); assert.match(noJavaScript.body, /February 29, 2028/);
assert.equal(JSON.parse(noJavaScript.body.match(/<script[^>]*data-tool-state[^>]*>([\s\S]*?)<\/script>/)[1]).result.result.local, '2028-02-29T12:00');
const reset = await request(api, { resetSlug: '8-hours-from-now', zone: 'Asia/Tokyo' }, 'POST');
assert.equal(reset.status, 200); assert.equal(JSON.parse(reset.body).result.amount, 8); assert.equal(JSON.parse(reset.body).result.start.zone, 'Asia/Tokyo');
const clock = await request(api, { tool: 'clock', zone: 'Africa/Casablanca' }, 'POST');
assert.equal(clock.status, 200); assert.equal(JSON.parse(clock.body).result.result.offsetMinutes, 0);
assert.match((await request('/robots.txt')).body, /Disallow: \//);
assert.equal((await request('/BingSiteAuth.xml')).status, 200);
const result = await request(api, { tool: 'relative', mode: 'custom', zone: 'Asia/Shanghai', start: '2026-11-13T23:30', amount: 2, unit: 'hour', direction: 'future' }, 'POST');
assert.equal(result.status, 200); assert.equal(JSON.parse(result.body).result.result.local, '2026-11-14T01:30');
const invalid = await request(api, { tool: 'relative', amount: '', unit: 'day' }, 'POST'); assert.equal(invalid.status, 400);
const gap = await request(api, { tool: 'relative', mode: 'custom', zone: 'America/New_York', start: '2026-03-08T02:30', amount: 1, unit: 'hour' }, 'POST'); assert.equal(gap.status, 400);
const target = '2028-02-29T01:30:00.000Z';
for (const zone of ['Asia/Tokyo', 'America/New_York']) {
  const response = await request(api, { tool: 'countdown', zone, instant: target, name: 'Cross-zone test' }, 'POST');
  assert.equal(response.status, 200); assert.equal(JSON.parse(response.body).result.target.instant, target);
}
mkdirSync(new URL('../artifacts/', import.meta.url), { recursive: true });
writeFileSync(new URL('../artifacts/http-results.json', import.meta.url), JSON.stringify({ base, pages: records, sitemapURLs: urls, shards: Object.keys(shards).length, api: 'passed', invalidRoutes: '404', alias: '308' }, null, 2));
console.log(`WordPress HTTP checks passed: ${samples.length} HTML pages, ${urls} sitemap URLs, redirects, real 404s, validation and cross-zone sharing.`);
