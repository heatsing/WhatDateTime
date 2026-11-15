<?php
declare(strict_types=1);
require __DIR__ . '/../whatdatetime-tools/includes/Repository.php';
use WhatDateTime\Repository;
$repo = new Repository(__DIR__ . '/../whatdatetime-tools/data');
$source = json_decode(file_get_contents(__DIR__ . '/../../data/tools/index.json'), true, 512, JSON_THROW_ON_ERROR);
$routes = $repo->routes(); $sitemaps = $repo->json('sitemap.json');
$mapped = []; $titles = []; $descriptions = []; $count = 0;
foreach ($source as $page) if (!isset($routes[$page['slug']])) throw new RuntimeException('Missing original URL: ' . $page['slug']);
foreach ($sitemaps as $name => $pages) {
    if (count($pages) > 1000) throw new RuntimeException('Sitemap overflow');
    foreach ($pages as $entry) {
        if (isset($mapped[$entry['slug']]) || !$routes[$entry['slug']]['indexable']) throw new RuntimeException('Sitemap eligibility mismatch');
        if ($entry['lastmod'] !== $routes[$entry['slug']]['revision']) throw new RuntimeException('Revision mismatch');
        $mapped[$entry['slug']] = true;
    }
}
$ordered = $routes;
uasort($ordered, fn($a, $b) => strcmp($a['bucket'], $b['bucket']));
foreach ($ordered as $slug => $route) {
    $page = $repo->page($slug);
    if ($route['indexable'] !== isset($mapped[$slug])) throw new RuntimeException('Missing sitemap URL: ' . $slug);
    if ($page['slug'] !== $slug || empty($page['title']) || empty($page['description']) || empty($page['h1'])) throw new RuntimeException('Incomplete metadata: ' . $slug);
    if ($repo->canonical($slug) !== 'https://whatdatetime.com' . ($slug === '' ? '' : '/' . $slug)) throw new RuntimeException('Wrong canonical');
    if ($route['indexable']) {
        if (isset($titles[$page['title']])) throw new RuntimeException('Duplicate indexed title: ' . $slug);
        if (isset($descriptions[$page['description']])) throw new RuntimeException('Duplicate indexed description: ' . $slug);
        $titles[$page['title']] = true; $descriptions[$page['description']] = true;
    }
    foreach ($page['relatedLinks'] ?? [] as $link) if (!isset($routes[$link])) throw new RuntimeException('Broken related link: ' . $link);
    foreach ($page['links'] ?? [] as $link) if (!isset($routes[ltrim($link['path'], '/')])) throw new RuntimeException('Broken directory link: ' . $link['path']);
    $count++;
}
foreach (['unknown-calculation', '../wp-config.php', '999999-hours-ago', 'calculations/hours-from-now/99999'] as $slug) if ($repo->page($slug) !== null) throw new RuntimeException('Unknown URL resolved');
echo "PHP inventory: $count routes, " . count($mapped) . ' indexable URLs, ' . count($sitemaps) . " shards; metadata, revisions, canonical and link checks passed.\n";
