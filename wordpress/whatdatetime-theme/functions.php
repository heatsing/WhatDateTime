<?php
if (!defined('ABSPATH')) exit;
add_action('after_setup_theme', function () { add_theme_support('html5', ['search-form', 'style', 'script']); });
add_action('wp_enqueue_scripts', function () {
    wp_enqueue_style('whatdatetime', get_stylesheet_uri(), [], (string)filemtime(__DIR__ . '/style.css'));
    wp_enqueue_script('whatdatetime-tools', get_template_directory_uri() . '/tools.js', [], (string)filemtime(__DIR__ . '/tools.js'), ['strategy' => 'defer', 'in_footer' => true]);
    wp_dequeue_style('wp-block-library');
});
