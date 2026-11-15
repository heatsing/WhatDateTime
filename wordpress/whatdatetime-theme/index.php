<?php
if (!defined('ABSPATH')) exit;
if (!function_exists('wdt_repository')) { status_header(503); wp_die('Activate the WhatDateTime Tools plugin to display this site.'); }
use WhatDateTime\Calculator as Calc;
use WhatDateTime\Tools;
use WhatDateTime\View as V;
$repository = wdt_repository();
$page = $GLOBALS['wdt_page'] ?? ['slug' => '', 'kind' => 'error', 'h1' => 'Page not found', 'title' => 'Page Not Found | WhatDateTime', 'description' => 'Unknown route.', 'indexable' => false];
$canonical = $page['kind'] === 'error' ? null : $repository->canonical($page['slug']);
$robots = wdt_production() && $page['indexable'] ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' : 'noindex, follow';
$coreLinks = [];
foreach ($repository->routes() as $slug => $route) if ($route['kind'] === 'calculator') $coreLinks[$slug] = $route['h1'];
$linkList = static function (array $links): void {
    echo '<ul class="tool-links">';
    foreach ($links as $link) echo '<li><a href="' . esc_url(home_url($link['path'])) . '">' . esc_html($link['label']) . '</a></li>';
    echo '</ul>';
};
$faqs = $page['faq'] ?? [];
$schema = [];
if ($canonical) {
    $schema[] = ['@context' => 'https://schema.org', '@type' => 'WebApplication', '@id' => $canonical . '#application', 'name' => $page['title'], 'url' => $canonical, 'description' => $page['description'], 'applicationCategory' => 'UtilitiesApplication', 'operatingSystem' => 'Any', 'isAccessibleForFree' => true, 'dateModified' => $page['revision'], 'offers' => ['@type' => 'Offer', 'price' => 0, 'priceCurrency' => 'USD']];
    $crumbs = [['@type' => 'ListItem', 'position' => 1, 'name' => 'Home', 'item' => 'https://whatdatetime.com']];
    if ($page['slug'] !== '') $crumbs[] = ['@type' => 'ListItem', 'position' => 2, 'name' => $page['h1'], 'item' => $canonical];
    $schema[] = ['@context' => 'https://schema.org', '@type' => 'BreadcrumbList', 'itemListElement' => $crumbs];
    if ($faqs) $schema[] = ['@context' => 'https://schema.org', '@type' => 'FAQPage', '@id' => $canonical . '#faq', 'mainEntity' => array_map(fn($faq) => ['@type' => 'Question', 'name' => $faq['question'], 'acceptedAnswer' => ['@type' => 'Answer', 'text' => $faq['answer']]], $faqs)];
}
?><!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title><?= esc_html($page['title']) ?></title><meta name="description" content="<?= esc_attr($page['description']) ?>"><meta name="robots" content="<?= esc_attr($robots) ?>">
<?php if ($canonical): ?><link rel="canonical" href="<?= esc_url($canonical) ?>"><link rel="alternate" hreflang="en" href="<?= esc_url($canonical) ?>"><link rel="alternate" hreflang="x-default" href="<?= esc_url($canonical) ?>"><?php endif; ?>
<meta property="og:type" content="website"><meta property="og:site_name" content="WhatDateTime"><meta property="og:title" content="<?= esc_attr($page['title']) ?>"><meta property="og:description" content="<?= esc_attr($page['description']) ?>"><meta property="og:url" content="<?= esc_url($canonical ?? '') ?>"><meta name="twitter:card" content="summary"><meta name="twitter:title" content="<?= esc_attr($page['title']) ?>"><meta name="twitter:description" content="<?= esc_attr($page['description']) ?>">
<script type="application/ld+json"><?= wp_json_encode($schema, JSON_HEX_TAG | JSON_HEX_AMP) ?></script>
<?php wp_head(); ?></head><body><a class="skip" href="#main-content">Skip to main content</a>
<?php if (!wdt_production()): ?><div class="staging">WordPress migration preview — search indexing is disabled.</div><?php endif; ?>
<header class="site-header"><div class="nav-inner"><a class="brand" href="<?= esc_url(home_url('/')) ?>">▦ WhatDateTime</a><nav aria-label="Main navigation"><a href="<?= esc_url(home_url('/calculators/date-calculator')) ?>">Date</a><a href="<?= esc_url(home_url('/calculations/hours-from-now')) ?>">Time</a><a href="<?= esc_url(home_url('/calculators/timezone-converter')) ?>">Time Zones</a><a href="<?= esc_url(home_url('/calculators/calendar')) ?>">Calendars</a><a href="<?= esc_url(home_url('/time')) ?>">World Clock</a></nav></div></header>
<main id="main-content" class="container" tabindex="-1"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="<?= esc_url(home_url('/')) ?>">Home</a><?php if ($page['slug'] !== ''): ?> / <?= esc_html($page['h1']) ?><?php endif; ?></nav>
<details class="site-search"><summary>Search tools and cities</summary><form data-site-search data-endpoint="<?= esc_url(rest_url('whatdatetime/v1/search')) ?>"><label>Tool, calculation, or city<input type="search" name="q" minlength="2" maxlength="100" required></label><button>Search</button><ul data-search-results aria-live="polite"></ul></form></details>
<h1><?= esc_html($page['h1']) ?></h1><p><?= esc_html($page['intro'] ?? $page['description']) ?></p>
<div class="page-grid"><div class="content">
<?php
$interactive = in_array($page['kind'], ['relative', 'difference', 'timezone', 'calculator'], true);
if ($interactive || ($page['kind'] === 'directory' && $page['type'] === 'hours-from-now')) {
    $defaults = Tools::defaults($page);
    if ($page['kind'] === 'directory') $defaults = array_merge($defaults, ['tool' => 'relative', 'unit' => 'hour', 'amount' => 1]);
    $input = $defaults; $error = ''; $result = Tools::run($defaults);
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST' && isset($_POST['wdt_action'])) {
        try {
            foreach ($_POST as $value) if (!is_string($value)) throw new InvalidArgumentException('Enter valid calculator inputs.');
            $input = array_merge($defaults, array_intersect_key(wp_unslash($_POST), $defaults), ['mode' => 'custom', 'tool' => $defaults['tool']]);
            $result = Tools::run($input);
        } catch (InvalidArgumentException $e) { $error = $e->getMessage(); }
    }
    if (isset($result['start']['local']) && $input['mode'] === 'live') $input['start'] = $result['start']['local'];
    [$primary, $details] = V::parts($result);
    echo '<section class="panel" data-tool-root><div data-result>' . $primary . '</div><h2>Change the calculation</h2>';
    echo V::form($input, $repository->json('cities.json'));
    if ($error !== '') echo '<p role="alert">' . esc_html($error) . ' The displayed result is the unchanged default calculation.</p>';
    echo '<div data-details>' . $details . '</div>';
    echo '<noscript><p>You can calculate with the form without JavaScript. Live countdown updates and local save/share need JavaScript.</p></noscript>';
    echo '<script type="application/json" data-tool-state>' . wp_json_encode(['slug' => $page['slug'], 'defaults' => $defaults, 'input' => $input, 'result' => $result, 'endpoint' => rest_url('whatdatetime/v1/calculate')], JSON_HEX_TAG | JSON_HEX_AMP) . '</script></section>';
}
if ($page['kind'] === 'home') {
    echo V::clock(Tools::run(['tool' => 'clock', 'zone' => 'UTC']), rest_url('whatdatetime/v1/calculate'), $repository->json('cities.json'));
    echo '<h2>Date &amp; Time Calculators</h2><p>Choose a calculator for dates, times, calendars, or time zones.</p><ul class="tool-links">';
    foreach ($page['tools'] as $tool) echo '<li><a href="' . esc_url(home_url($tool['href'])) . '">' . esc_html($tool['title']) . '</a><p class="muted">' . esc_html($tool['description']) . '</p></li>';
    echo '</ul><h2>Popular Date and Time Answers</h2>';
    $linkList($page['links']);
    echo '<h2>Browse calculations</h2>';
    $links = [['path' => '/time', 'label' => 'World clocks and city conversions']];
    foreach ($repository->routes() as $slug => $route) if ($route['kind'] === 'directory' && !preg_match('/\/[0-9]+$/', $slug)) $links[] = ['path' => '/' . $slug, 'label' => $route['h1']];
    $linkList($links);
}
if ($page['kind'] === 'hub') {
    if ($page['hubKind'] === 'city') {
        $city = array_values(array_filter($repository->json('cities.json'), fn($c) => $c['slug'] === $page['city']))[0];
        echo V::clock(Tools::run(['tool' => 'clock', 'zone' => $city['zone']]), rest_url('whatdatetime/v1/calculate'), $repository->json('cities.json'), true);
    }
    $linkList($page['links']);
    if ($page['hubKind'] === 'directory') {
        $links = [];
        foreach ($repository->routes() as $slug => $route) if (str_starts_with($slug, 'time/' . $page['city'] . '/conversions')) $links[] = ['path' => '/' . $slug, 'label' => $route['title']];
        $linkList($links);
    }
}
if ($page['kind'] === 'directory') {
    $linkList($page['links']);
    $pagination = [];
    for ($part = 1; $part <= $page['parts']; $part++) $pagination[] = ['path' => '/calculations/' . $page['type'] . ($part === 1 ? '' : '/' . $part), 'label' => 'Page ' . $part];
    $linkList($pagination);
}
foreach ($page['steps'] ?? [] as $step) echo '<h3>' . esc_html($step['title']) . '</h3><p>' . esc_html($step['text']) . '</p>';
if (isset($page['methodology'])) {
    echo '<h2>' . esc_html($page['methodology']['title']) . '</h2>';
    foreach ($page['methodology']['paragraphs'] as $text) echo '<p>' . esc_html($text) . '</p>';
}
foreach ($page['sections'] ?? $page['content']['sections'] ?? [] as $section) {
    if (($section['stage'] ?? '') === 'practical-scenarios' && !empty($page['useCases'])) continue;
    echo '<h2>' . esc_html($section['title']) . '</h2>';
    foreach ($section['paragraphs'] ?? [$section['text'] ?? ''] as $text) echo '<p>' . esc_html($text) . '</p>';
}
if (isset($page['accuracy'])) echo '<section class="note"><h3>' . esc_html($page['accuracy']['title']) . '</h3><p>' . esc_html($page['accuracy']['text']) . '</p></section>';
foreach (['useCases' => 'Common uses', 'examples' => 'Fixed calculation examples', 'tips' => 'Calculation tips'] as $key => $label) {
    if (empty($page[$key])) continue;
    echo '<section' . ($key === 'examples' ? ' data-nosnippet' : '') . '><h2>' . $label . '</h2><ul>';
    foreach ($page[$key] as $text) echo '<li>' . esc_html($text) . '</li>';
    echo '</ul></section>';
}
if (!empty($page['relatedLinks'])) {
    echo '<h2>Related calculations</h2>';
    $links = [];
    foreach ($page['relatedLinks'] as $slug) if ($related = $repository->page($slug)) $links[] = ['path' => '/' . $slug, 'label' => $related['h1']];
    $linkList($links);
}
if ($faqs) { echo '<h2>Frequently asked questions</h2>'; foreach ($faqs as $faq) echo '<details><summary>' . esc_html($faq['question']) . '</summary><p>' . esc_html($faq['answer']) . '</p></details>'; }
if ($page['kind'] === 'error') echo '<p>This URL does not exist. <a href="' . esc_url(home_url('/')) . '">Choose a calculator on the homepage.</a></p>';
?>
</div><aside><h2>Related tools</h2><nav aria-label="Related tools"><?php foreach ($coreLinks as $slug => $name): if ($slug === $page['slug']) continue; ?><a href="<?= esc_url(home_url('/' . $slug)) ?>"><?= esc_html($name) ?></a><?php endforeach; ?></nav><p><a href="<?= esc_url(home_url('/calculation-methodology')) ?>">Calculation methodology</a> · <a href="<?= esc_url(home_url('/data-sources')) ?>">Data sources</a></p></aside></div></main>
<footer class="site-footer"><div class="footer-inner"><strong>WhatDateTime</strong><?php foreach (['about' => 'About', 'calculation-methodology' => 'Methodology', 'data-sources' => 'Data Sources', 'contact-and-corrections' => 'Corrections', 'privacy-policy' => 'Privacy', 'terms-of-use' => 'Terms'] as $slug => $name): ?><a href="<?= esc_url(home_url('/' . $slug)) ?>"><?= esc_html($name) ?></a><?php endforeach; ?></div></footer>
<?php if (wdt_production()): ?><script async src="https://www.googletagmanager.com/gtag/js?id=G-LLS4S0NQH8"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-LLS4S0NQH8',{page_location:location.origin+location.pathname+location.search});</script><?php endif; ?>
<?php wp_footer(); ?></body></html>
