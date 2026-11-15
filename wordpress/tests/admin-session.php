<?php
/** CLI-only, temporary WordPress-core session for preview UI testing; never install in the webroot. */
if (!defined('WP_CLI') || !WP_CLI || (int)get_option('blog_public') !== 0) throw new RuntimeException('Only the noindex preview may run this test.');
$directory = realpath(__DIR__);
if (str_starts_with($directory, realpath(ABSPATH))) throw new RuntimeException('Test files must be outside the webroot.');
$stateFile = $directory . '/admin-private-state.json';
$cookieFile = $directory . '/admin-browser.auth-state.json';
$mode = $args[0] ?? 'prepare';
if ($mode === 'cleanup') {
    if (!is_file($stateFile)) throw new RuntimeException('No test session to clean up.');
    $saved = json_decode(file_get_contents($stateFile), true, 512, JSON_THROW_ON_ERROR);
    foreach ($saved['options'] as $key => $option) { if ($option['exists']) update_option($key, $option['value'], false); else delete_option($key); }
    WP_Session_Tokens::get_instance($saved['user'])->destroy($saved['token']);
    unlink($cookieFile); unlink($stateFile);
    echo "Temporary preview session revoked; original content/revisions restored; private auth files removed.\n";
    return;
}
if (is_file($stateFile) || is_file($cookieFile)) throw new RuntimeException('Clean up the existing test session first.');
$admins = get_users(['role' => 'administrator', 'number' => 1, 'fields' => 'ID']);
if (!$admins) throw new RuntimeException('No administrator found.');
$id = (int)$admins[0]; $expiration = time() + 900;
$token = WP_Session_Tokens::get_instance($id)->create($expiration);
$options = [];
foreach (['wdt_content_' . hash('sha256', '8-hours-from-now'), 'wdt_content_revisions'] as $key) {
    $marker = new stdClass(); $value = get_option($key, $marker);
    $options[$key] = ['exists' => $value !== $marker, 'value' => $value === $marker ? null : $value];
}
umask(0077);
file_put_contents($stateFile, json_encode(['user' => $id, 'token' => $token, 'options' => $options], JSON_THROW_ON_ERROR));
$cookies = [];
foreach ([AUTH_COOKIE => 'auth', SECURE_AUTH_COOKIE => 'secure_auth', LOGGED_IN_COOKIE => 'logged_in'] as $name => $scheme) {
    $cookies[] = ['name' => $name, 'value' => wp_generate_auth_cookie($id, $expiration, $scheme, $token), 'domain' => 'darkseagreen-trout-940046.hostingersite.com', 'path' => '/', 'expires' => $expiration, 'httpOnly' => true, 'secure' => true, 'sameSite' => 'Lax'];
}
file_put_contents($cookieFile, json_encode(['cookies' => $cookies, 'origins' => []], JSON_THROW_ON_ERROR));
echo "Temporary preview-only browser session prepared; expires in 15 minutes. No password was changed.\n";
