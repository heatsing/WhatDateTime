<?php
declare(strict_types=1);

namespace WhatDateTime;

use DateTimeImmutable;
use DateTimeZone;
use InvalidArgumentException;

/** Pure PHP calculation kernel. No WordPress, host time zone, or database dependency. */
final class Calculator
{
    public static function zone(string $name): DateTimeZone
    {
        static $zones;
        $zones ??= array_fill_keys(DateTimeZone::listIdentifiers(DateTimeZone::ALL_WITH_BC), true);
        if (!isset($zones[$name]) && $name !== 'UTC') {
            throw new InvalidArgumentException('Choose a valid IANA time zone.');
        }
        return new DateTimeZone($name);
    }

    public static function calendar(string $value): DateTimeImmutable
    {
        if (!preg_match('/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/D', $value) || str_starts_with($value, '0000-')) {
            throw new InvalidArgumentException('Enter a date from year 0001 through 9999.');
        }
        $date = DateTimeImmutable::createFromFormat('!Y-m-d', $value, new DateTimeZone('UTC'));
        if (!$date || $date->format('Y-m-d') !== $value) {
            throw new InvalidArgumentException('Enter a real calendar date.');
        }
        return $date;
    }

    public static function instant(string $value): DateTimeImmutable
    {
        // UTC ISO is the interchange format for saved/shared targets. Reject silent normalization.
        if (!preg_match('/^([0-9]{4}-[0-9]{2}-[0-9]{2})T([0-9]{2}):([0-9]{2}):([0-9]{2})(?:\.([0-9]{1,3}))?Z$/D', $value, $m)) {
            throw new InvalidArgumentException('Enter a UTC timestamp ending in Z.');
        }
        self::calendar($m[1]);
        if ((int)$m[2] > 23 || (int)$m[3] > 59 || (int)$m[4] > 59) {
            throw new InvalidArgumentException('Enter a valid clock time.');
        }
        return new DateTimeImmutable($value, new DateTimeZone('UTC'));
    }

    public static function iso(DateTimeImmutable $date): string
    {
        return $date->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d\TH:i:s.v\Z');
    }

    /** Return zero, one, or two possible instants: gaps are rejected; folds remain explicit. */
    public static function wallTimes(string $local, string $zone): array
    {
        $tz = self::zone($zone);
        if (!preg_match('/^([0-9]{4}-[0-9]{2}-[0-9]{2})T([0-9]{2}):([0-9]{2})$/D', $local, $m)) {
            throw new InvalidArgumentException('Enter a complete date and time.');
        }
        $date = self::calendar($m[1]);
        if ((int)$m[2] > 23 || (int)$m[3] > 59) {
            throw new InvalidArgumentException('Enter a valid hour and minute.');
        }
        $naive = $date->setTime((int)$m[2], (int)$m[3]);
        $offsets = [];
        foreach ([-48, -24, 0, 24, 48] as $hours) {
            $offsets[$tz->getOffset($naive->modify("$hours hours"))] = true;
        }
        $matches = [];
        foreach (array_keys($offsets) as $offset) {
            $candidate = $naive->setTimestamp($naive->getTimestamp() - $offset)->setTimezone($tz);
            if ($candidate->format('Y-m-d\TH:i') === $local) {
                $matches[] = $candidate;
            }
        }
        usort($matches, fn($a, $b) => $a->getTimestamp() <=> $b->getTimestamp());
        return $matches;
    }

    public static function wall(string $local, string $zone, string $occurrence = 'earlier'): DateTimeImmutable
    {
        if (!in_array($occurrence, ['earlier', 'later'], true)) {
            throw new InvalidArgumentException('Choose the earlier or later occurrence.');
        }
        $matches = self::wallTimes($local, $zone);
        if (!$matches) {
            throw new InvalidArgumentException('This local time does not exist because the clock moves forward. Choose another time.');
        }
        return $matches[$occurrence === 'later' ? count($matches) - 1 : 0];
    }

    public static function amount(mixed $raw, string $unit): float
    {
        if (!in_array($unit, ['hour', 'day', 'week', 'month', 'year', 'business-day'], true)) {
            throw new InvalidArgumentException('Choose a supported unit.');
        }
        if (!is_scalar($raw) || is_bool($raw) || trim((string)$raw) === '' || !is_numeric($raw)) {
            throw new InvalidArgumentException('Enter an amount; an empty value is not zero.');
        }
        $amount = (float)$raw;
        $ticks = $unit === 'hour' ? $amount * 60 : $amount;
        if (!is_finite($amount) || $amount < 0 || $amount > 10000 || abs($ticks - round($ticks)) > 1e-8) {
            throw new InvalidArgumentException($unit === 'hour'
                ? 'Enter 0–10,000 hours in whole minutes, such as 1.5 hours.'
                : 'Enter a whole-number amount from 0 to 10,000.');
        }
        return $amount;
    }

    public static function relative(DateTimeImmutable $base, mixed $raw, string $unit, string $direction): DateTimeImmutable
    {
        $amount = self::amount($raw, $unit);
        if (!in_array($direction, ['future', 'past'], true)) {
            throw new InvalidArgumentException('Choose Add or Subtract.');
        }
        $sign = $direction === 'past' ? -1 : 1;
        if ($unit === 'hour') {
            // Timestamp arithmetic intentionally differs from a calendar-day offset across DST.
            $result = $base->setTimestamp($base->getTimestamp() + $sign * (int)round($amount * 3600));
        } elseif ($unit === 'month' || $unit === 'year') {
            $months = $sign * (int)$amount * ($unit === 'year' ? 12 : 1);
            $serial = (int)$base->format('Y') * 12 + (int)$base->format('n') - 1 + $months;
            $year = (int)floor($serial / 12);
            $month = $serial - $year * 12 + 1;
            if ($year < 1 || $year > 9999) {
                throw new InvalidArgumentException('The result is outside the supported year range.');
            }
            $first = $base->setDate($year, $month, 1);
            $result = $base->setDate($year, $month, min((int)$base->format('j'), (int)$first->format('t')));
        } elseif ($unit === 'business-day') {
            $result = $base;
            for ($remaining = (int)$amount; $remaining > 0;) {
                $result = $result->modify($sign > 0 ? '+1 day' : '-1 day');
                if ((int)$result->format('N') <= 5) {
                    $remaining--;
                }
            }
        } else {
            $days = $sign * (int)$amount * ($unit === 'week' ? 7 : 1);
            $result = $base->modify("$days days");
        }
        if ((int)$result->format('Y') < 1 || (int)$result->format('Y') > 9999) {
            throw new InvalidArgumentException('The result is outside the supported year range.');
        }
        return $result;
    }

    public static function calendarDays(string $start, string $end): int
    {
        return (int)self::calendar($start)->diff(self::calendar($end))->format('%r%a');
    }

    public static function calendarGrid(int $year, int $month): array
    {
        $first = self::calendar(sprintf('%04d-%02d-01', $year, $month));
        $start = $first->modify('-' . $first->format('w') . ' days');
        $days = [];
        for ($i = 0; $i < 42; $i++) {
            $date = $start->modify("+$i days");
            $days[] = ['date' => $date->format('Y-m-d'), 'day' => (int)$date->format('j'), 'isoWeek' => $date->format('W'), 'inMonth' => $date->format('Y-m') === $first->format('Y-m')];
        }
        return $days;
    }

    public static function countdown(string $target, string $now): int
    {
        return max(0, (int)ceil((float)self::instant($target)->format('U.u') - (float)self::instant($now)->format('U.u')));
    }

    public static function display(DateTimeImmutable $date): array
    {
        return [
            'instant' => self::iso($date), 'local' => $date->format('Y-m-d\TH:i'),
            'date' => $date->format('l, F j, Y'), 'time' => $date->format('g:i A'),
            'zone' => $date->getTimezone()->getName(), 'offset' => $date->format('P'),
            'abbreviation' => $date->format('T'), 'offsetMinutes' => $date->getOffset() / 60,
        ];
    }

    /** Single request state drives primary answer, formula, calendar, timeline, and copy text. */
    public static function relativeState(array $input, ?DateTimeImmutable $now = null): array
    {
        $zone = (string)($input['zone'] ?? 'UTC');
        $tz = self::zone($zone);
        $mode = (string)($input['mode'] ?? 'live');
        if (!in_array($mode, ['live', 'custom'], true)) {
            throw new InvalidArgumentException('Choose live or custom calculation mode.');
        }
        $start = $mode === 'live'
            ? ($now ?? new DateTimeImmutable('now', new DateTimeZone('UTC')))->setTimezone($tz)
            : self::wall((string)($input['start'] ?? ''), $zone, (string)($input['occurrence'] ?? 'earlier'));
        $unit = (string)($input['unit'] ?? 'day');
        $direction = (string)($input['direction'] ?? 'future');
        $amount = self::amount($input['amount'] ?? '', $unit);
        $end = self::relative($start, $amount, $unit, $direction);
        $label = str_replace('-', ' ', $unit) . ($amount == 1 ? '' : 's');
        $answer = $end->format($unit === 'hour' ? 'g:i A — l, F j, Y' : 'l, F j, Y');
        $formula = $start->format('F j, Y g:i A') . ($direction === 'past' ? ' − ' : ' + ') . "$amount $label = $answer ($zone).";
        $midpoint = $start->setTimestamp((int)floor(($start->getTimestamp() + $end->getTimestamp()) / 2));
        $state = [
            'mode' => $mode, 'amount' => $amount, 'unit' => $unit, 'direction' => $direction,
            'start' => self::display($start), 'result' => self::display($end),
            'answer' => $answer, 'formula' => $formula, 'copyText' => $formula,
            'dateShift' => self::calendarDays($start->format('Y-m-d'), $end->format('Y-m-d')),
            'timeline' => [self::display($start), self::display($midpoint), self::display($end)],
            'calendar' => self::calendarGrid((int)$end->format('Y'), (int)$end->format('n')),
            'rules' => $unit === 'business-day'
                ? 'Weekends are excluded. Public holidays are not excluded. The starting day is not counted; zero keeps it unchanged.'
                : ($unit === 'hour' ? 'One hour means 60 elapsed minutes. Clock changes can affect the displayed local hour.' : 'The starting date is day zero. Calendar days include weekends and holidays. Months clamp to the last valid day.'),
        ];
        if ($unit === 'hour') {
            $state['table'] = [];
            for ($hour = 0; $hour < 24; $hour++) {
                $wall = $start->format('Y-m-d') . 'T' . sprintf('%02d:00', $hour);
                $matches = self::wallTimes($wall, $zone);
                if (!$matches) $state['table'][] = [sprintf('%02d:00', $hour), 'Starting time skipped by clock change'];
                foreach ($matches as $candidate) $state['table'][] = [$candidate->format('g:i A T'), self::relative($candidate, $amount, $unit, $direction)->format('g:i A T — M j, Y')];
            }
        }
        return $state;
    }
}
