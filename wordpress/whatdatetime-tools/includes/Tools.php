<?php
declare(strict_types=1);
namespace WhatDateTime;
use DateTimeImmutable;
use InvalidArgumentException;

final class Tools
{
    private static function integer(mixed $raw, int $min, int $max): int
    {
        if (!is_scalar($raw) || !preg_match('/^[0-9]+$/D', (string)$raw) || (int)$raw < $min || (int)$raw > $max) {
            throw new InvalidArgumentException("Enter a whole number from $min to $max.");
        }
        return (int)$raw;
    }

    public static function defaults(array $page, string $displayZone = 'UTC'): array
    {
        $now = new DateTimeImmutable('now', Calculator::zone('UTC'));
        $tool = match ($page['kind']) {
            'relative' => 'relative', 'difference' => 'difference', 'timezone' => 'timezone',
            default => $page['calculator'] ?? 'relative',
        };
        $zone = $page['fromZone'] ?? ($tool === 'timezone' ? 'America/New_York' : $displayZone);
        $local = $now->setTimezone(Calculator::zone($zone));
        return [
            'tool' => $tool, 'mode' => 'live', 'zone' => $zone,
            'start' => $page['start'] ?? $local->format($tool === 'days-until' ? 'Y-m-d' : 'Y-m-d\TH:i'),
            'end' => $page['end'] ?? $local->modify($tool === 'days-until' ? '+30 days' : '+1 day')->format($tool === 'days-until' ? 'Y-m-d' : 'Y-m-d\TH:i'),
            'birth' => Calculator::relative($local, 25, 'year', 'past')->format('Y-m-d'), 'asof' => $local->format('Y-m-d'),
            'date' => $local->format('Y-m-d'), 'year' => $local->format('Y'), 'month' => $local->format('n'),
            'amount' => $page['amount'] ?? ($tool === 'business-days' ? 8 : ($tool === 'date' ? 10 : 30)),
            'unit' => $page['unit'] ?? ($tool === 'business-days' ? 'business-day' : 'day'),
            'direction' => $page['direction'] ?? 'future', 'occurrence' => 'earlier', 'endOccurrence' => 'earlier',
            'weeks' => 8, 'days' => 2,
            'fromZone' => $page['fromZone'] ?? 'America/New_York', 'toZone' => $page['toZone'] ?? 'Europe/London',
            'name' => 'My event', 'target' => $local->modify('+7 days')->format('Y-m-d\TH:i'),
        ];
    }

    public static function run(array $in): array
    {
        $tool = (string)($in['tool'] ?? 'relative');
        $zone = (string)($in['zone'] ?? 'UTC');
        Calculator::zone($zone);
        if ($tool === 'clock') {
            $now = new DateTimeImmutable('now', Calculator::zone($zone));
            $year = $now->format('Y');
            $transitions = Calculator::zone($zone)->getTransitions(strtotime($year . '-01-01 UTC'), strtotime(((int)$year + 1) . '-01-01 UTC')) ?: [];
            $offsets = array_values(array_unique(array_map(fn($row) => $row['offset'] / 3600 . ' hours', $transitions)));
            $facts = [['Zone identifier', $zone], ['Current abbreviation', $now->format('T')], ['UTC offsets in ' . $year, implode(' / ', $offsets)], ['Clock changes in ' . $year, max(0, count($transitions) - 1)]];
            return ['answer' => $now->format('g:i:s A'), 'formula' => $now->format('l, F j, Y') . " ($zone)",
                'copyText' => $now->format('c') . " ($zone)", 'result' => Calculator::display($now),
                'facts' => $facts, 'dayOfYear' => (int)$now->format('z') + 1, 'daysInYear' => $now->format('L') === '1' ? 366 : 365, 'isoWeek' => $now->format('W')];
        }
        if (in_array($tool, ['relative', 'date', 'business-days', 'weeks-and-days-ago'], true)) {
            if ($tool === 'business-days') $in['unit'] = 'business-day';
            if ($tool === 'weeks-and-days-ago') {
                $in['amount'] = self::integer($in['weeks'] ?? '', 0, 1428) * 7 + self::integer($in['days'] ?? '', 0, 6);
                $in['unit'] = 'day'; $in['direction'] = 'past';
            }
            return Calculator::relativeState($in);
        }
        if ($tool === 'timezone') {
            $from = (string)($in['fromZone'] ?? 'UTC');
            $to = (string)($in['toZone'] ?? 'UTC');
            $fromTz = Calculator::zone($from); $toTz = Calculator::zone($to);
            $date = ($in['mode'] ?? 'custom') === 'live'
                ? new DateTimeImmutable('now', $fromTz)
                : Calculator::wall((string)($in['start'] ?? ''), $from, (string)($in['occurrence'] ?? 'earlier'));
            $converted = $date->setTimezone($toTz);
            $difference = ($converted->getOffset() - $date->getOffset()) / 3600;
            $answer = $converted->format('g:i A — l, F j, Y') . " ($to)";
            $formula = $date->format('F j, Y g:i A') . " ($from) = $answer. Offset difference: $difference hours.";
            $table = []; $overlap = [];
            for ($hour = 0; $hour < 24; $hour++) {
                $wall = $date->format('Y-m-d') . 'T' . sprintf('%02d:00', $hour);
                $matches = Calculator::wallTimes($wall, $from);
                if (!$matches) $table[] = [$wall, 'Skipped by clock change'];
                foreach ($matches as $instant) {
                    $other = $instant->setTimezone($toTz);
                    $table[] = [$instant->format('g:i A T'), $other->format('g:i A T — M j')];
                }
            }
            for ($minute = 9 * 60; $minute < 17 * 60; $minute += 30) {
                foreach (Calculator::wallTimes($date->format('Y-m-d') . 'T' . sprintf('%02d:%02d', intdiv($minute, 60), $minute % 60), $from) as $instant) {
                    $other = $instant->setTimezone($toTz);
                    if ((int)$instant->format('N') <= 5 && (int)$other->format('N') <= 5 && (int)$other->format('G') >= 9 && (int)$other->format('G') < 17) {
                        $overlap[] = [$instant->format('g:i A'), $other->format('g:i A — M j')];
                    }
                }
            }
            $startYear = Calculator::calendar($date->format('Y') . '-01-01')->getTimestamp();
            $endYear = Calculator::calendar($date->format('Y') . '-12-31')->getTimestamp() + 86400;
            $transitions = [];
            foreach ([$from, $to] as $name) {
                $rows = Calculator::zone($name)->getTransitions($startYear, $endYear) ?: [];
                $transitions[$name] = array_map(fn($r) => ['instant' => $r['time'], 'offset' => $r['offset'] / 60, 'abbreviation' => $r['abbr']], array_slice($rows, 1));
            }
            $cuts = [$startYear, $endYear];
            foreach ($transitions as $rows) foreach ($rows as $row) $cuts[] = (new DateTimeImmutable($row['instant']))->getTimestamp();
            $cuts = array_values(array_unique($cuts)); sort($cuts); $periods = [];
            for ($i = 0; $i < count($cuts) - 1; $i++) {
                $at = new DateTimeImmutable('@' . $cuts[$i]);
                $gap = ($toTz->getOffset($at) - $fromTz->getOffset($at)) / 3600;
                $periods[] = [gmdate('Y-m-d H:i', $cuts[$i]) . ' UTC', gmdate('Y-m-d H:i', $cuts[$i + 1]) . ' UTC', $gap . ' hours'];
            }
            return ['answer' => $answer, 'formula' => $formula, 'copyText' => $formula, 'start' => Calculator::display($date), 'result' => Calculator::display($converted), 'differenceHours' => $difference, 'dateShift' => Calculator::calendarDays($date->format('Y-m-d'), $converted->format('Y-m-d')), 'table' => $table, 'overlap' => $overlap, 'transitions' => $transitions, 'periods' => $periods, 'rules' => 'Times and offsets apply to the selected date. Office overlap assumes Monday–Friday, 9 AM–5 PM in each city; public holidays are not excluded.'];
        }
        if ($tool === 'countdown') {
            $target = isset($in['instant']) ? Calculator::instant((string)$in['instant'])->setTimezone(Calculator::zone($zone))
                : Calculator::wall((string)($in['target'] ?? ''), $zone, (string)($in['occurrence'] ?? 'earlier'));
            $now = new DateTimeImmutable('now', Calculator::zone('UTC'));
            $name = trim((string)($in['name'] ?? 'My event'));
            if (strlen($name) > 240) throw new InvalidArgumentException('Use an event name of at most 240 bytes.');
            $seconds = Calculator::countdown(Calculator::iso($target), Calculator::iso($now));
            $answer = "$seconds seconds remaining";
            return ['answer' => $answer, 'formula' => $target->format('F j, Y g:i A') . " ($zone)", 'copyText' => "$name: " . $target->format('c'), 'target' => ['name' => $name, 'instant' => Calculator::iso($target), 'zone' => $zone], 'remainingSeconds' => $seconds, 'result' => Calculator::display($target), 'rules' => 'Remaining time is always the target timestamp minus the current timestamp. Saving or sharing preserves the same instant.'];
        }
        if ($tool === 'difference' || $tool === 'days-until') {
            $start = (string)($in['start'] ?? ''); $end = (string)($in['end'] ?? '');
            if ($tool === 'days-until') { $start = substr($start, 0, 10); $end = substr($end, 0, 10); }
            $isDate = strlen($start) === 10 && strlen($end) === 10;
            $a = $isDate ? Calculator::calendar($start) : Calculator::wall($start, $zone, (string)($in['occurrence'] ?? 'earlier'));
            $b = $isDate ? Calculator::calendar($end) : Calculator::wall($end, $zone, (string)($in['endOccurrence'] ?? 'earlier'));
            $days = Calculator::calendarDays($a->format('Y-m-d'), $b->format('Y-m-d'));
            $seconds = abs($b->getTimestamp() - $a->getTimestamp());
            $duration = $a->diff($b);
            $answer = $tool === 'days-until' || $isDate ? abs($days) . ' calendar days' . ($days < 0 ? ' ago' : '') : "$duration->y years, $duration->m months, $duration->d days, $duration->h hours, $duration->i minutes";
            $formula = $a->format('Y-m-d H:i') . ' → ' . $b->format('Y-m-d H:i') . ": $answer ($zone).";
            return ['answer' => $answer, 'formula' => $formula, 'copyText' => $formula, 'calendarDays' => $days, 'elapsedSeconds' => $seconds, 'table' => [['Calendar days (absolute)', abs($days)], ['Total elapsed hours', $seconds / 3600], ['24-hour units', $seconds / 86400], ['Complete weeks and days', intdiv(abs($days), 7) . ' weeks, ' . (abs($days) % 7) . ' days']], 'rules' => 'The starting date is day zero. Calendar dates and elapsed 24-hour units can differ at daylight-saving transitions.'];
        }
        if ($tool === 'age') {
            $birth = Calculator::calendar((string)($in['birth'] ?? ''));
            $asof = Calculator::calendar((string)($in['asof'] ?? ''));
            if ($birth > $asof) throw new InvalidArgumentException('The birth date must not be after the as-of date.');
            $age = $birth->diff($asof);
            $answer = "$age->y years, $age->m months, $age->d days";
            $formula = $birth->format('F j, Y') . ' → ' . $asof->format('F j, Y') . ": $answer.";
            return ['answer' => $answer, 'formula' => $formula, 'copyText' => $formula, 'table' => [['Total calendar days', $age->days]]];
        }
        if (in_array($tool, ['day-of-week', 'half-birthday'], true)) {
            $date = Calculator::calendar((string)($in['date'] ?? ''));
            $result = $tool === 'half-birthday' ? Calculator::relative($date, 6, 'month', 'future') : $date;
            $answer = $result->format('l, F j, Y');
            $formula = $date->format('Y-m-d') . ($tool === 'half-birthday' ? ' + 6 calendar months' : '') . " = $answer.";
            return ['answer' => $answer, 'formula' => $formula, 'copyText' => $formula, 'result' => Calculator::display($result), 'table' => [['Day of year', (int)$result->format('z') + 1], ['ISO week', $result->format('o-\WW')]], 'calendar' => Calculator::calendarGrid((int)$result->format('Y'), (int)$result->format('n'))];
        }
        if (in_array($tool, ['calendar', 'weeks-in-year', 'days-in-month'], true)) {
            $year = self::integer($in['year'] ?? '', 1, 9999);
            $month = $tool === 'weeks-in-year' ? 12 : self::integer($in['month'] ?? '', 1, 12);
            $date = Calculator::calendar(sprintf('%04d-%02d-01', $year, $month));
            $weeks = Calculator::calendar(sprintf('%04d-12-28', $year))->format('W');
            $answer = $tool === 'calendar' ? $date->format('F Y') : ($tool === 'weeks-in-year' ? "$weeks ISO weeks" : $date->format('t') . ' days');
            $formula = $date->format($tool === 'weeks-in-year' ? 'Y' : 'F Y') . ": $answer.";
            return ['answer' => $answer, 'formula' => $formula, 'copyText' => $formula, 'calendar' => Calculator::calendarGrid($year, $month), 'calendarOpen' => $tool === 'calendar', 'table' => [['Leap year', $date->format('L') === '1' ? 'Yes' : 'No'], ['Days in year', $date->format('L') === '1' ? 366 : 365]], 'rules' => 'Gregorian calendar. ISO weeks start on Monday; calendar display rows start on Sunday.'];
        }
        throw new InvalidArgumentException('Unknown calculator.');
    }
}
