<?php
/** wp eval-file: full template validation in one CLI process, without public crawling or DB changes. */
if (!defined('WP_CLI') || !WP_CLI || !function_exists('wdt_page')) throw new RuntimeException('Run using WP-CLI with the plugin active.');
if ((int)get_option('blog_public') !== 0) throw new RuntimeException('This test is restricted to the noindex preview.');
if (!class_exists('DOMDocument')) throw new RuntimeException('PHP DOM is required for HTML validation.');
// Production simulation is scoped to this CLI process. Never change the site's saved options.
if (!defined('WDT_PRODUCTION')) define('WDT_PRODUCTION', true);
$_SERVER['HTTP_HOST'] = 'whatdatetime.com';
$_SERVER['SERVER_NAME'] = 'whatdatetime.com';
$_SERVER['SERVER_PORT'] = '443';
$_SERVER['HTTPS'] = 'on';
$_SERVER['REQUEST_METHOD'] = 'GET';
$productionFilter = static fn() => 1;
add_filter('pre_option_blog_public', $productionFilter);
foreach (['wp_robots', 'rel_canonical', 'wp_generator', 'wp_shortlink_wp_head'] as $callback) remove_action('wp_head', $callback);
libxml_use_internal_errors(true);
$repo = wdt_repository(); $routes = $repo->routes();
$ordered = $routes; uasort($ordered, fn($a, $b) => strcmp($a['bucket'], $b['bucket']));
$graph = []; $failures = []; $count = 0; $types = []; $started = microtime(true);
function render_wdt_route(string $slug): string {
    $GLOBALS['wdt_page'] = wdt_page($slug);
    $_SERVER['REQUEST_URI'] = '/' . $slug;
    ob_start(); require get_template_directory() . '/index.php'; return ob_get_clean();
}
foreach ($ordered as $slug => $record) {
    try {
        $html = render_wdt_route($slug); $page = wdt_page($slug);
        $doc = new DOMDocument(); $doc->loadHTML('<?xml encoding="UTF-8">' . $html); libxml_clear_errors(); $x = new DOMXPath($doc);
        foreach (['//title', '//h1', '//meta[@name="description"]', '//link[@rel="canonical"]'] as $query) if ($x->query($query)->length !== 1) throw new RuntimeException('Missing or duplicate ' . $query);
        if ($x->evaluate('string(//title)') !== $page['title'] || $x->evaluate('string(//h1)') !== $page['h1']) throw new RuntimeException('Title/H1 mismatch');
        if ($x->evaluate('string(//meta[@name="description"]/@content)') !== $page['description']) throw new RuntimeException('Description mismatch');
        if ($x->evaluate('string(//link[@rel="canonical"]/@href)') !== $repo->canonical($slug)) throw new RuntimeException('Canonical mismatch');
        $robots = $x->evaluate('string(//meta[@name="robots"]/@content)');
        if (str_contains($robots, 'noindex') === $record['indexable']) throw new RuntimeException('Index eligibility mismatch');
        $schemas = $x->query('//script[@type="application/ld+json"]');
        if (!$schemas->length) throw new RuntimeException('Missing JSON-LD');
        foreach ($schemas as $script) {
            $nodes = json_decode($script->textContent, true, 512, JSON_THROW_ON_ERROR);
            if (isset($nodes['@type'])) $nodes = [$nodes];
            foreach ($nodes as $node) if (in_array($node['@type'] ?? '', ['WebApplication', 'CollectionPage', 'WebPage'], true) && $node['url'] !== $repo->canonical($slug)) throw new RuntimeException('JSON-LD URL mismatch');
        }
        $states = $x->query('//script[@data-tool-state]');
        if (in_array($record['kind'], ['relative', 'difference', 'timezone', 'calculator'], true) && !$states->length) throw new RuntimeException('Missing PHP calculation');
        foreach ($states as $script) {
            $state = json_decode($script->textContent, true, 512, JSON_THROW_ON_ERROR);
            if ($x->evaluate('string(//*[@data-answer])') !== $state['result']['answer'] || $x->evaluate('string(//*[@data-formula])') !== $state['result']['formula']) throw new RuntimeException('Initial answer/formula mismatch');
        }
        $links = [];
        foreach ($x->query('//a[@href]') as $anchor) {
            $href = $anchor->getAttribute('href'); $host = parse_url($href, PHP_URL_HOST);
            if ($href === '' || $href[0] === '#' || ($host && $host !== 'whatdatetime.com')) continue;
            if (preg_match('/^(mailto|tel):/', $href)) continue;
            $target = trim((string)parse_url($href, PHP_URL_PATH), '/');
            if (!isset($routes[$target])) throw new RuntimeException('Unknown internal link: ' . $target);
            $links[$target] = true;
        }
        $graph[$slug] = array_keys($links); $types[$record['kind']] = ($types[$record['kind']] ?? 0) + 1;
    } catch (Throwable $e) { $failures[] = ['slug' => $slug, 'error' => $e->getMessage()]; }
    $count++;
    if ($count % 500 === 0) echo "Rendered $count / " . count($routes) . '; failures=' . count($failures) . "\n";
    if (count($failures) > 20) break;
}
$depth = ['' => 0]; $queue = [''];
for ($i = 0; $i < count($queue); $i++) foreach ($graph[$queue[$i]] ?? [] as $target) if (!isset($depth[$target])) { $depth[$target] = $depth[$queue[$i]] + 1; $queue[] = $target; }
$maximum = 0;
foreach ($routes as $slug => $record) if ($count === count($routes) && $record['indexable']) {
    if (!isset($depth[$slug])) $failures[] = ['slug' => $slug, 'error' => 'Indexed orphan'];
    else $maximum = max($maximum, $depth[$slug]);
}
if ($maximum > 6) $failures[] = ['error' => "Maximum indexed crawl depth is $maximum, expected <= 6"];
$report = ['routesRendered' => $count, 'types' => $types, 'maxIndexedCrawlDepth' => $maximum, 'seconds' => round(microtime(true) - $started, 2), 'failures' => $failures, 'scope' => 'Actual WordPress PHP templates; production SEO simulated only in this CLI process. No HTTP status or browser claim.'];
$json = json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
if (realpath(__DIR__) && !str_starts_with(realpath(__DIR__), realpath(ABSPATH))) file_put_contents(__DIR__ . '/render-results.json', $json . "\n");
echo $json . "\n";
remove_filter('pre_option_blog_public', $productionFilter);
if ($failures || $count !== count($routes)) throw new RuntimeException('Full HTML validation failed.');
