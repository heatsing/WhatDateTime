<?php
// Run using wp eval-file on the isolated preview only. No credentials are printed.
if (!defined('ABSPATH') || !function_exists('wdt_page')) throw new RuntimeException('Run with WordPress and the plugin loaded.');
if (wdt_production() || (int)get_option('blog_public') !== 0) throw new RuntimeException('Only run on a noindex preview.');
$slug = '8-hours-from-now';
$key = 'wdt_content_' . hash('sha256', $slug);
$missing = '__wdt_absent_option__';
$original = get_option($key, $missing);
$user = get_current_user_id();
$previousGet = $_GET;
try {
    $page = wdt_page($slug);
    update_option($key, ['title' => 'Temporary integration test', 'intro' => 'Integration test introduction.', 'faq' => [['question' => 'Test?', 'answer' => 'Yes.']]], false);
    $edited = wdt_page($slug);
    if ($edited['title'] !== 'Temporary integration test' || $edited['indexable'] !== $page['indexable']) throw new RuntimeException('Content override mismatch.');
    if (wdt_repository()->canonical($slug) !== 'https://whatdatetime.com/8-hours-from-now') throw new RuntimeException('Canonical drift.');
    $admins = get_users(['role' => 'administrator', 'number' => 1, 'fields' => 'ID']);
    if (!$admins) throw new RuntimeException('No preview administrator.');
    wp_set_current_user((int)$admins[0]);
    $_GET['slug'] = $slug;
    ob_start(); wdt_admin(); $html = ob_get_clean();
    foreach (['name="title"', 'name="description"', 'name="intro"', 'name="faq"', 'name="_wpnonce"'] as $field) if (!str_contains($html, $field)) throw new RuntimeException('Missing admin field.');
    wp_set_current_user(0);
    ob_start(); wdt_admin(); $anonymous = ob_get_clean();
    if ($anonymous !== '') throw new RuntimeException('Anonymous editor access.');
    echo "WP integration: editor fields, nonce, permissions, content overrides and canonical/index preservation passed.\n";
} finally {
    if ($original === $missing) delete_option($key); else update_option($key, $original, false);
    wp_set_current_user($user); $_GET = $previousGet;
}
if (wdt_page($slug)['title'] === 'Temporary integration test') throw new RuntimeException('Test override was not restored.');
