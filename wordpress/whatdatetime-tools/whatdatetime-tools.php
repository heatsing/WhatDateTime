<?php
/**
 * Plugin Name: WhatDateTime Tools
 * Description: PHP date/time calculations, allowlisted virtual routes, SEO data and content overrides.
 * Version: 0.1.0
 * Requires at least: 6.6
 * Requires PHP: 8.2
 */
declare(strict_types=1);
if (!defined('ABSPATH')) exit;
require_once __DIR__ . '/includes/Calculator.php';
require_once __DIR__ . '/includes/Tools.php';
require_once __DIR__ . '/includes/Repository.php';
require_once __DIR__ . '/includes/View.php';

function wdt_repository(): \WhatDateTime\Repository {
    static $repository;
    return $repository ??= new \WhatDateTime\Repository(__DIR__ . '/data');
}
function wdt_production(): bool {
    // Fail closed. A formal cutover needs BOTH an explicit config flag and WP search visibility.
    return defined('WDT_PRODUCTION') && WDT_PRODUCTION === true && (int)get_option('blog_public') === 1
        && strtolower((string)($_SERVER['HTTP_HOST'] ?? '')) === 'whatdatetime.com';
}
function wdt_page(string $slug): ?array {
    $page = wdt_repository()->page($slug);
    if (!$page) return null;
    $overrides = get_option('wdt_content_' . hash('sha256', $slug), []);
    return array_merge($page, array_intersect_key(is_array($overrides) ? $overrides : [], array_flip(['title', 'description', 'intro', 'faq', 'revision'])));
}
add_filter('wp_sitemaps_enabled', '__return_false');
add_action('template_redirect', function () {
    $path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
    if (!is_string($path)) $path = '/invalid-request';
    $slug = trim($path, '/');
    $repository = wdt_repository();
    $redirects = $repository->json('redirects.json');
    if (isset($redirects[$path])) {
        wp_safe_redirect(home_url($redirects[$path]['to']), $redirects[$path]['status']); exit;
    }
    if ($path === '/robots.txt') {
        status_header(200);
        header('Content-Type: text/plain; charset=UTF-8');
        echo wdt_production() ? "User-agent: *\nAllow: /\nDisallow: /wp-admin/\nSitemap: https://whatdatetime.com/sitemap.xml\n" : "User-agent: *\nDisallow: /\n";
        exit;
    }
    $sitemaps = $repository->json('sitemap.json');
    if ($slug === 'sitemap.xml' || isset($sitemaps[$slug])) {
        status_header(200);
        $revisions = get_option('wdt_content_revisions', []);
        foreach ($sitemaps as &$entries) foreach ($entries as &$entry) {
            if (isset($revisions[$entry['slug']])) $entry['lastmod'] = max($entry['lastmod'], $revisions[$entry['slug']]);
        }
        unset($entries, $entry);
        header('Content-Type: application/xml; charset=UTF-8');
        if (!wdt_production()) header('X-Robots-Tag: noindex, nofollow');
        echo '<?xml version="1.0" encoding="UTF-8"?>';
        if ($slug === 'sitemap.xml') {
            echo '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
            foreach ($sitemaps as $name => $pages) echo '<sitemap><loc>https://whatdatetime.com/' . esc_xml($name) . '</loc><lastmod>' . esc_xml(max(array_column($pages, 'lastmod'))) . '</lastmod></sitemap>';
            echo '</sitemapindex>';
        } else {
            echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
            foreach ($sitemaps[$slug] as $page) echo '<url><loc>' . esc_xml($repository->canonical($page['slug'])) . '</loc><lastmod>' . esc_xml($page['lastmod']) . '</lastmod></url>';
            echo '</urlset>';
        }
        exit;
    }
    $page = wdt_page($slug);
    if (!$page) {
        $GLOBALS['wdt_page'] = ['slug' => $slug, 'kind' => 'error', 'title' => 'Page Not Found | WhatDateTime', 'h1' => 'Page not found', 'description' => 'This address is not a WhatDateTime calculator.', 'indexable' => false];
        status_header(404);
    } else {
        $GLOBALS['wdt_page'] = $page;
        status_header(200);
    }
    if (!defined('DONOTCACHEPAGE')) define('DONOTCACHEPAGE', true);
    nocache_headers();
    header('Cache-Control: private, no-store, max-age=0');
    header('X-LiteSpeed-Cache-Control: no-cache');
    do_action('litespeed_control_set_nocache', 'WhatDateTime request-current results');
    if (!wdt_production() || !$page || !$page['indexable']) header('X-Robots-Tag: noindex, follow');
    remove_action('wp_head', 'rel_canonical');
    remove_action('wp_head', 'wp_robots');
    remove_action('wp_head', 'wp_generator');
    remove_action('wp_head', 'wp_shortlink_wp_head');
    remove_action('wp_head', 'adjacent_posts_rel_link_wp_head');
    remove_action('template_redirect', 'redirect_canonical');
}, 0);

add_action('rest_api_init', function () {
    register_rest_route('whatdatetime/v1', '/search', [
        'methods' => 'GET', 'permission_callback' => '__return_true',
        'callback' => function (WP_REST_Request $request) {
            $q = $request->get_param('q');
            if (!is_string($q) || strlen($q) < 2 || strlen($q) > 100) return new WP_REST_Response([], 200);
            $terms = preg_split('/\s+/', strtolower(trim($q)));
            $links = [];
            foreach (wdt_repository()->routes() as $slug => $route) {
                $haystack = strtolower($route['h1']);
                foreach ($terms as $term) if (!str_contains($haystack, $term)) continue 2;
                $links[] = ['label' => $route['h1'], 'path' => '/' . $slug];
                if (count($links) >= 12) break;
            }
            return new WP_REST_Response($links, 200, ['Cache-Control' => 'private, no-store', 'X-Robots-Tag' => 'noindex']);
        },
    ]);
    register_rest_route('whatdatetime/v1', '/calculate', [
        'methods' => 'POST', 'permission_callback' => '__return_true',
        'callback' => function (WP_REST_Request $request) {
            if (strlen($request->get_body()) > 8192) return new WP_Error('wdt_too_large', 'Input is too large.', ['status' => 413]);
            try {
                $input = $request->get_json_params();
                if (!is_array($input)) throw new InvalidArgumentException('Enter valid calculator inputs.');
                foreach ($input as $value) if (!is_scalar($value) && $value !== null) throw new InvalidArgumentException('Calculator inputs must be simple values.');
                if (isset($input['resetSlug'])) {
                    $resetPage = wdt_page((string)$input['resetSlug']);
                    if (!$resetPage || !in_array($resetPage['kind'], ['relative', 'timezone', 'difference', 'calculator', 'directory'], true)) throw new InvalidArgumentException('Unknown calculator page.');
                    $input = \WhatDateTime\Tools::defaults($resetPage, (string)($input['zone'] ?? 'UTC'));
                    if ($resetPage['kind'] === 'directory') $input = array_merge($input, ['tool' => 'relative', 'unit' => 'hour', 'amount' => 1]);
                }
                $result = \WhatDateTime\Tools::run($input);
                [$primary, $details] = \WhatDateTime\View::parts($result);
                return new WP_REST_Response(['result' => $result, 'input' => $input, 'html' => $primary, 'details' => $details], 200, ['Cache-Control' => 'private, no-store', 'X-Robots-Tag' => 'noindex']);
            } catch (InvalidArgumentException $e) {
                return new WP_Error('wdt_invalid_input', $e->getMessage(), ['status' => 400]);
            }
        },
    ]);
});

add_action('admin_menu', function () {
    add_menu_page('WhatDateTime', 'WhatDateTime', 'manage_options', 'whatdatetime', 'wdt_admin', 'dashicons-clock');
});
function wdt_admin(): void {
    if (!current_user_can('manage_options')) return;
    $slug = sanitize_text_field(wp_unslash($_GET['slug'] ?? ''));
    $page = wdt_page($slug);
    echo '<div class="wrap"><h1>WhatDateTime page content</h1><p>Edit existing URL content. Canonicals, routes and index eligibility stay controlled by the migration manifest.</p><form method="get"><input type="hidden" name="page" value="whatdatetime"><label>Existing URL path <input name="slug" value="' . esc_attr($slug) . '" size="65"></label> <button class="button">Load</button></form>';
    if (!$page) { echo '<p>Unknown route. Enter an existing path without its leading slash.</p></div>'; return; }
    echo '<form method="post" action="' . esc_url(admin_url('admin-post.php')) . '"><input type="hidden" name="action" value="wdt_save_content"><input type="hidden" name="slug" value="' . esc_attr($slug) . '">';
    wp_nonce_field('wdt_content_' . $slug);
    foreach (['title', 'description', 'intro'] as $field) echo '<p><label>' . esc_html(ucfirst($field)) . '<br><textarea class="large-text" name="' . esc_attr($field) . '" rows="3">' . esc_textarea($page[$field] ?? '') . '</textarea></label></p>';
    echo '<p><label>FAQ (JSON array: question and answer)<br><textarea name="faq" class="large-text code" rows="12">' . esc_textarea(wp_json_encode($page['faq'] ?? [], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) . '</textarea></label></p>';
    submit_button('Save this page'); echo '</form></div>';
}
add_action('admin_post_wdt_save_content', function () {
    if (!current_user_can('manage_options')) wp_die('Not permitted.', '', ['response' => 403]);
    $slug = sanitize_text_field(wp_unslash($_POST['slug'] ?? ''));
    check_admin_referer('wdt_content_' . $slug);
    if (!wdt_repository()->page($slug)) wp_die('Unknown route.', '', ['response' => 404]);
    $faqRaw = wp_unslash($_POST['faq'] ?? '[]');
    if (!is_string($faqRaw) || strlen($faqRaw) > 30000) wp_die('FAQ is too large.');
    $faqs = json_decode($faqRaw, true);
    if (!is_array($faqs) || !array_is_list($faqs) || count($faqs) > 20) wp_die('FAQ must be a JSON array of up to 20 questions.');
    foreach ($faqs as &$faq) {
        if (!is_array($faq) || !is_string($faq['question'] ?? null) || !is_string($faq['answer'] ?? null)) wp_die('Each FAQ needs a question and answer.');
        $faq = ['question' => sanitize_text_field($faq['question']), 'answer' => sanitize_textarea_field($faq['answer'])];
    }
    unset($faq);
    $data = ['faq' => $faqs];
    foreach (['title', 'description', 'intro'] as $key) $data[$key] = sanitize_textarea_field(wp_unslash($_POST[$key] ?? ''));
    if ($data['title'] === '' || $data['description'] === '') wp_die('Title and description cannot be empty.');
    $previous = wdt_page($slug);
    $changed = false;
    foreach ($data as $key => $value) if (($previous[$key] ?? null) !== $value) $changed = true;
    if ($changed) {
        $data['revision'] = gmdate('Y-m-d');
        update_option('wdt_content_' . hash('sha256', $slug), $data, false);
        $revisions = get_option('wdt_content_revisions', []);
        $revisions[$slug] = $data['revision'];
        update_option('wdt_content_revisions', $revisions, false);
    }
    wp_safe_redirect(add_query_arg(['page' => 'whatdatetime', 'slug' => $slug, 'saved' => 1], admin_url('admin.php'))); exit;
});
