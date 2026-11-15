import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { execFileSync } from 'node:child_process';
import ts from 'typescript';
import { build } from 'esbuild';
import { adaptContent } from './content-adapter.mjs';
import { coreSlugs, allPublicSlugs, allIndexableSlugs, hubRoutes, calculationDirectories, directoryLinks, cityLinks, relatedPairLinks } from '../../lib/siteInventory.ts';
import { getPageIndexEligibility, cities, regions } from '../../lib/indexEligibility.ts';
import { trustPages } from '../../src/data/trust-pages.ts';
import { siteConfig } from '../../lib/site.ts';

const root = new URL('../../', import.meta.url);
const faqBundle = await build({ entryPoints: [new URL('../../lib/calculation-faq.ts', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')], bundle: true, platform: 'node', format: 'esm', write: false });
const { relativeFAQs } = await import(`data:text/javascript;base64,${Buffer.from(faqBundle.outputFiles[0].text).toString('base64')}`);
const readJSON = file => JSON.parse(readFileSync(new URL(file, root), 'utf8'));
const index = readJSON('data/tools/index.json');
const revisions = readJSON('data/seo-revisions.json');
const output = new URL('../whatdatetime-tools/data/', import.meta.url);
mkdirSync(output, { recursive: true });
const save = (name, value, gzip = false) => writeFileSync(new URL(name, output), gzip ? gzipSync(JSON.stringify(value)) : JSON.stringify(value));

// Read the existing literal content configuration without importing React or modifying its UI.
const source = readFileSync(new URL('components/calculator-page-view.tsx', root), 'utf8');
const tree = ts.createSourceFile('calculator.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
async function literal(name, inputTree = tree) {
  for (const statement of inputTree.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (declaration.name.getText(inputTree) === name) {
        const value = declaration.initializer.getText(inputTree).replace(/,\s*icon:\s*\w+/g, '');
        const js = ts.transpileModule(`export default (${value});`, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
        return (await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`)).default;
      }
    }
  }
  throw new Error(`Missing source configuration: ${name}`);
}
const configs = await literal('configs');
const content = await literal('calculatorContent');
const routes = {};
const buckets = Array.from({ length: 128 }, () => ({}));
const eligible = new Set(allIndexableSlugs);
const all = new Set(allPublicSlugs);
function add(page, revision) {
  if (Object.hasOwn(routes, page.slug)) throw new Error(`Duplicate URL: ${page.slug}`);
  if (!all.has(page.slug)) throw new Error(`Unapproved URL: ${page.slug}`);
  const bucket = (parseInt(createHash('sha256').update(page.slug).digest('hex').slice(0, 4), 16) % buckets.length).toString().padStart(3, '0');
  routes[page.slug] = { kind: page.kind, type: page.type ?? null, indexable: eligible.has(page.slug), revision, bucket, title: page.title, h1: page.h1 };
  buckets[Number(bucket)][page.slug] = adaptContent(page);
}
for (const file of [...new Set(index.map(page => page.dataFile))]) {
  for (const page of readJSON(`data/tools/${file}`)) {
    const related = page.kind === 'timezone' ? relatedPairLinks(page.slug).map(p => p.path.slice(1)) : page.relatedLinks.filter(slug => eligible.has(slug));
    add({ ...page, h1: page.kind === 'relative' && page.direction === 'past' ? page.title : page.h1,
      title: `${page.title} | WhatDateTime`, relatedLinks: related,
      faq: page.kind === 'relative' ? relativeFAQs(page) : page.faq },
    page.kind === 'timezone' ? revisions['timezone-converter'] : revisions.pages?.[page.slug] || revisions[page.type]);
  }
}
for (const [kind, config] of Object.entries(configs)) {
  const slug = config.path.slice(1);
  add({ ...config, ...content[kind], slug, kind: 'calculator', calculator: kind, h1: config.title,
    title: `${config.metadataTitle} | WhatDateTime`, description: config.seoDescription, intro: config.description, faq: config.faqs }, revisions.corePages[slug] || revisions.site);
}
add({ slug: 'calculators/business-days', kind: 'calculator', calculator: 'business-days',
  title: 'Business Days Calculator | WhatDateTime', h1: 'Business Days Calculator',
  description: 'Add or subtract working days from a chosen date. Skip Saturdays and Sundays, exclude the starting date, and see the resulting weekday. Holidays are not excluded.',
  intro: 'Weekends are excluded. Public holidays are not excluded. The starting day is not counted; zero keeps it unchanged.',
  steps: [{title:'Choose a start',text:'Enter the starting date and time.'},{title:'Choose an interval',text:'Enter working days and choose add or subtract.'},{title:'Review the date',text:'The starting day is excluded; only Monday–Friday count.'}],
  methodology: {title:'How business days are counted',paragraphs:['Move forward or backward one date at a time, counting only Monday through Friday. The starting date does not count. Zero days leaves it unchanged.','Weekends are excluded. Public holidays are not excluded. Check the applicable holiday calendar before using this as an official deadline.']},
  accuracy: {title:'Example: a Friday start',text:'One business day after Friday is Monday; one business day before Monday is Friday. This is not a legal deadline calculator.'},
  useCases: ['Estimate a weekday turnaround','Plan a project milestone','Compare delivery windows'],
  relatedLinks: ['30-business-days-from-today', '35-business-days-from-today', 'calculations/business-days-from-today'],
  faq: [{ question: 'Are public holidays excluded?', answer: 'No. Only Saturdays and Sundays are excluded.' }, { question: 'Does the starting date count?', answer: 'No. Counting starts on the next or previous date. Zero days returns the starting date.' }, { question: 'Can I subtract business days?', answer: 'Yes. Choose Subtract to move backward, skipping weekends.' }] }, revisions.corePages['calculators/business-days']);
for (const page of Object.values(trustPages)) add({ ...page, kind: 'trust' }, revisions.corePages[page.slug] || revisions.site);
const homeTree = ts.createSourceFile('home.tsx', readFileSync(new URL('components/home-page.tsx', root), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const navigationTree = ts.createSourceFile('header.tsx', readFileSync(new URL('components/header.tsx', root), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
save('navigation.json', await literal('navigation', navigationTree));
add({ slug: '', kind: 'home', title: 'WhatDateTime — Date & Time Calculators', h1: 'Current Date and Time', description: siteConfig.description,
  intro: 'Check your local time, date, and time zone.', tools: await literal('calculatorLinks', homeTree),
  links: (await literal('popularAnswers', homeTree)).map(([label, path]) => ({ label, path })), faq: await literal('homeFaqs', homeTree),
  popularZones: (await literal('popularZones', homeTree)).map(([label, path]) => ({ label, path })),
  sections: [
    { title: 'Free Date and Time Tools', paragraphs: ['WhatDateTime provides focused online tools for calculating dates, checking time zones, comparing durations, and planning deadlines. Every calculator is free to use and opens without registration.'] },
    { title: 'Plan dates accurately', paragraphs: ['Add or subtract calendar units, find weekdays, calculate date differences, and check business-day deadlines.'] },
    { title: 'Work across time zones', paragraphs: ['Compare cities and UTC offsets before scheduling calls, travel, releases, and international events.'] },
  ] }, revisions.corePages['']);
for (const hub of hubRoutes) {
  const links = hub.kind === 'directory' ? directoryLinks(hub.city, hub.part)
    : hub.kind === 'city' ? [...cityLinks(hub.city), { path: `/time/${hub.city}/conversions`, label: 'All city conversions' }]
    : hub.kind === 'region' ? cities.filter(c => c.region === hub.region).map(c => ({ path: `/time/${c.slug}`, label: c.name }))
    : regions.map(region => ({ path: `/time/regions/${region}`, label: region.replaceAll('-', ' ') }));
  add({ ...hub, hubKind: hub.kind, kind: 'hub', h1: hub.title, title: `${hub.title} | WhatDateTime`, links }, revisions['timezone-converter']);
}
for (const page of calculationDirectories) add({ ...page, kind: 'directory', h1: page.title, title: `${page.title} | WhatDateTime` }, revisions.directories);
if (Object.keys(routes).length !== all.size || Object.keys(routes).some(s => !all.has(s))) throw new Error('Route inventory drift');
for (const page of index) if (routes[page.slug].indexable !== getPageIndexEligibility(page).indexable) throw new Error('Index eligibility drift');
for (const slug of coreSlugs) if (!Object.hasOwn(routes, slug)) throw new Error(`Missing core route ${slug}`);

const redirects = Object.fromEntries(readFileSync(new URL('public/_redirects', root), 'utf8').trim().split(/\r?\n/).map(line => {
  const [from, to, status] = line.split(/\s+/);
  if (!all.has(to.slice(1))) throw new Error(`Invalid redirect destination ${to}`);
  return [from, { to, status: Number(status) }];
}));
const groupNames = { 'date-difference': 'date-differences', 'timezone-converter': 'time-zone-conversions' };
const groups = { core: coreSlugs, 'city-hubs': hubRoutes.map(p => p.slug), 'calculation-directories': calculationDirectories.map(p => p.slug) };
for (const type of [...new Set(index.map(p => p.type))]) {
  const pages = index.filter(p => p.type === type && eligible.has(p.slug)).map(p => p.slug);
  for (let i = 0; i < pages.length; i += 1000) groups[`${groupNames[type] || type}${pages.length > 1000 ? `-${i / 1000 + 1}` : ''}`] = pages.slice(i, i + 1000);
}
const sitemap = Object.fromEntries(Object.entries(groups).map(([name, slugs]) => [`sitemap-${name}.xml`, slugs.map(slug => ({ slug, lastmod: routes[slug].revision }))]));
const sitemapSlugs = Object.values(sitemap).flat().map(p => p.slug);
if (new Set(sitemapSlugs).size !== eligible.size || sitemapSlugs.length !== eligible.size || sitemapSlugs.some(s => !eligible.has(s))) throw new Error('Sitemap drift');
save('routes.json', routes);
save('sitemap.json', sitemap);
save('redirects.json', redirects);
save('cities.json', cities);
for (let i = 0; i < buckets.length; i++) save(`pages-${String(i).padStart(3, '0')}.json.gz`, buckets[i], true);
save('provenance.json', { sourceCommit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(), routes: all.size, indexable: eligible.size, programmatic: index.length, shards: Object.keys(sitemap).length });
console.log(`Exported ${all.size} routes, ${eligible.size} indexable URLs, ${Object.keys(sitemap).length} sitemap shards; original titles/content and index policy retained.`);
