<?php
declare(strict_types=1);
namespace WhatDateTime;

final class Repository
{
    private array $routes;
    private array $buckets = [];
    public function __construct(private string $directory)
    {
        $this->routes = $this->json('routes.json');
    }
    public function json(string $name): array
    {
        if (!preg_match('/^[a-z0-9-]+\.json$/D', $name)) throw new \InvalidArgumentException('Invalid data file.');
        return json_decode(file_get_contents($this->directory . '/' . $name), true, 512, JSON_THROW_ON_ERROR);
    }
    public function routes(): array { return $this->routes; }
    public function page(string $slug): ?array
    {
        $route = $this->routes[$slug] ?? null;
        if (!$route) return null;
        $bucket = $route['bucket'];
        if (!preg_match('/^[0-9]{3}$/D', $bucket)) throw new \RuntimeException('Invalid route manifest.');
        if (!isset($this->buckets[$bucket])) {
            // Keep long-running parity checks and low-memory shared hosting bounded.
            if (count($this->buckets) >= 4) unset($this->buckets[array_key_first($this->buckets)]);
            $this->buckets[$bucket] = json_decode(gzdecode(file_get_contents($this->directory . '/pages-' . $bucket . '.json.gz')), true, 512, JSON_THROW_ON_ERROR);
        }
        return array_merge($this->buckets[$bucket][$slug], ['indexable' => $route['indexable'], 'revision' => $route['revision']]);
    }
    public function canonical(string $slug): string
    {
        if (!array_key_exists($slug, $this->routes)) throw new \InvalidArgumentException('Unknown route.');
        return 'https://whatdatetime.com' . ($slug === '' ? '' : '/' . $slug);
    }
}
