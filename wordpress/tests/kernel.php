<?php
declare(strict_types=1);
require __DIR__ . '/../whatdatetime-tools/includes/Calculator.php';
use WhatDateTime\Calculator as C;

$checks = 0;
function same(mixed $actual, mixed $expected, string $name): void {
    global $checks;
    $checks++;
    if ($actual !== $expected) {
        throw new RuntimeException($name . ': ' . json_encode(['actual' => $actual, 'expected' => $expected]));
    }
}
function rejects(callable $operation, string $name): void {
    try { $operation(); } catch (InvalidArgumentException $e) { same(true, true, $name); return; }
    throw new RuntimeException('Expected validation error: ' . $name);
}
$fixtures = json_decode(file_get_contents(__DIR__ . '/generated/parity.json'), true, 512, JSON_THROW_ON_ERROR);
foreach ($fixtures['relative'] as $case) {
    $start = C::instant($case['instant'])->setTimezone(C::zone($case['zone']));
    same(C::iso(C::relative($start, $case['amount'], $case['unit'], $case['direction'])), $case['expected'], $case['name']);
}
foreach ($fixtures['walls'] as $case) {
    same(array_map([C::class, 'iso'], C::wallTimes($case['local'], $case['zone'])), $case['expected'], $case['name']);
}
foreach ($fixtures['offsets'] as $case) {
    same((float)(C::instant($case['instant'])->setTimezone(C::zone($case['zone']))->getOffset() / 60), (float)$case['expected'], $case['zone'] . ' ' . $case['instant'] . ' offset');
}
foreach (['', ' ', 'NaN', 'Infinity', '-1', '10001', '0.001'] as $raw) {
    rejects(fn() => C::amount($raw, 'hour'), 'invalid amount ' . $raw);
}
rejects(fn() => C::amount('1.5', 'day'), 'fractional calendar day');
rejects(fn() => C::amount([], 'day'), 'array amount');
rejects(fn() => C::amount(true, 'day'), 'boolean amount');
rejects(fn() => C::calendar('2026-02-30'), 'invalid calendar date');
rejects(fn() => C::calendar('0000-01-01'), 'year zero');
rejects(fn() => C::wall('2026-03-08T02:30', 'America/New_York'), 'DST gap');
rejects(fn() => C::zone('invalid/zone'), 'invalid IANA zone');
rejects(fn() => C::relative(C::calendar('9999-12-31'), 1, 'day', 'future'), 'overflow');
same(C::amount('0', 'business-day'), 0.0, 'valid zero');
same(C::relative(C::calendar('2026-11-14'), 0, 'business-day', 'future')->format('Y-m-d'), '2026-11-14', 'zero retains Saturday');
same(C::calendarDays('2028-02-28', '2028-03-01'), 2, 'leap calendar interval');
$state = C::relativeState(['mode' => 'custom', 'zone' => 'Asia/Shanghai', 'start' => '2026-11-13T23:30', 'amount' => 2, 'unit' => 'hour', 'direction' => 'future']);
same($state['result']['local'], '2026-11-14T01:30', 'midnight');
same($state['dateShift'], 1, 'cross-day indication');
same($state['copyText'], $state['formula'], 'copy/formula shared state');
same($state['timeline'][2], $state['result'], 'timeline/result shared state');
same(count($state['calendar']), 42, 'six-week calendar');
$now = C::instant('2028-02-29T01:30:00.000Z');
same(C::countdown('2028-02-29T01:30:00.001Z', C::iso($now)), 1, 'countdown ceil');
same(C::countdown('2028-02-29T01:29:00.000Z', C::iso($now)), 0, 'countdown stopped');
same(C::iso(C::wall('2026-11-01T01:30', 'America/New_York', 'later')), '2026-11-01T06:30:00.000Z', 'fold later');
same(C::relativeState(['amount' => 0], $now)['result']['instant'], C::iso($now), 'request clock injected');
echo "PHP kernel: $checks assertions passed\n";
