<?php
declare(strict_types=1);
namespace WhatDateTime;

final class View
{
    public static function e(mixed $text): string { return htmlspecialchars((string)$text, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }
    public static function clock(array $state, string $endpoint, array $cities, bool $fixed = false): string
    {
        $result = $state['result'];
        $date = new \DateTimeImmutable($result['instant']);
        $local = $date->setTimezone(Calculator::zone($result['zone']));
        $hour = ((int)$local->format('G') % 12) * 30 + (int)$local->format('i') / 2;
        $minute = (int)$local->format('i') * 6;
        $second = (int)$local->format('s') * 6;
        $html = '<section class="panel" data-clock-root data-endpoint="' . self::e($endpoint) . '" data-fixed="' . ($fixed ? 'true' : 'false') . '"><div class="clock-layout"><div><div class="clock-value" data-clock>' . self::e($state['answer']) . '</div><p data-clock-date>' . self::e($result['date']) . '</p><p data-clock-zone>' . self::e($result['zone'] . ' (UTC' . $result['offset'] . ')') . '</p></div><svg class="analog-clock" viewBox="0 0 220 220" aria-hidden="true"><circle cx="110" cy="110" r="104" fill="white" stroke="#536b8d" stroke-width="2"/>';
        for ($number = 1; $number <= 12; $number++) {
            $angle = $number * M_PI / 6;
            $html .= '<text x="' . (110 + 84 * sin($angle)) . '" y="' . (115 - 84 * cos($angle)) . '" text-anchor="middle" fill="#10264b" font-size="15">' . $number . '</text>';
        }
        foreach (['hour' => [60, $hour, 5], 'minute' => [32, $minute, 3], 'second' => [24, $second, 1]] as $hand => $values) $html .= '<line data-hand="' . $hand . '" x1="110" y1="110" x2="110" y2="' . $values[0] . '" transform="rotate(' . $values[1] . ' 110 110)" stroke="' . ($hand === 'second' ? '#b42318' : '#10264b') . '" stroke-width="' . $values[2] . '" stroke-linecap="round"/>';
        $html .= '<circle cx="110" cy="110" r="4" fill="#b42318"/></svg></div><div class="actions">';
        if (!$fixed) {
            $zones = ['UTC' => 'UTC'];
            foreach ($cities as $city) $zones[$city['zone']] ??= $city['name'];
            $html .= self::select('clock-zone', 'Location / time zone', $zones, $result['zone']);
        }
        $html .= '<button type="button" class="secondary" data-clock-format>Use 24-hour format</button><button type="button" class="secondary" data-clock-copy>Copy time</button></div><p data-clock-status role="status" class="muted">Reference zone shown above. The clock synchronizes after loading.</p><script type="application/json" data-clock-state>' . json_encode($state, JSON_HEX_TAG | JSON_HEX_AMP | JSON_THROW_ON_ERROR) . '</script></section>';
        if ($fixed) $html = str_replace('</section>', '<div data-clock-facts>' . self::table($state['facts'], ['Time-zone fact', 'Value']) . '</div></section>', $html);
        if (isset($state['city'])) $html = str_replace('</section>', '<div data-city-details>' . self::cityDetails($state) . '</div></section>', $html);
        return $html;
    }
    public static function cityDetails(array $state): string
    {
        $html = '<h2>Compare current city times</h2><div class="paired-clocks">';
        foreach ($state['comparisons'] as $city) {
            $moment = $city['result'];
            $html .= '<div data-comparison-clock data-offset="' . self::e($moment['offsetMinutes']) . '"><a href="/time/' . self::e($city['slug']) . '">' . self::e($city['name']) . '</a><p data-comparison-time>' . self::e($moment['time']) . '</p><p data-comparison-date>' . self::e($moment['date']) . '</p><p>' . self::e($moment['zone'] . ' (UTC' . $moment['offset'] . ')') . '</p></div>';
        }
        $html .= '</div><h2>9 AM–5 PM in ' . self::e($state['city']['name']) . '</h2><p>Wall-clock conversions for ' . self::e($state['result']['date']) . '. This does not imply that today is a working day.</p>';
        return $html . self::table($state['office'], ['City', '9 AM source time', '5 PM source time']);
    }
    public static function table(array $rows, array $head = ['Input', 'Result']): string
    {
        $html = '<div class="table-scroll" tabindex="0"><table><thead><tr>';
        foreach ($head as $title) $html .= '<th scope="col">' . self::e($title) . '</th>';
        $html .= '</tr></thead><tbody>';
        foreach ($rows as $row) {
            $html .= '<tr>';
            foreach ($row as $cell) $html .= '<td>' . self::e($cell) . '</td>';
            $html .= '</tr>';
        }
        return $html . '</tbody></table></div>';
    }
    public static function result(array $state): string
    {
        $html = '<div class="answer"><p class="eyebrow">' . (($state['mode'] ?? '') === 'live' ? 'Current calculation' : 'Calculated result') . '</p>';
        $html .= '<p class="answer-value" data-answer>' . self::e($state['answer']) . '</p><p data-formula>' . self::e($state['formula']) . '</p>';
        if (isset($state['start']['zone'])) $html .= '<p class="muted">Starting point: ' . self::e($state['start']['date'] . ' ' . $state['start']['time'] . ' — ' . $state['start']['zone'] . ' (UTC' . $state['start']['offset'] . ')') . '</p>';
        if (isset($state['differenceHours'])) {
            $html .= '<div class="paired-times">';
            foreach (['start' => 'Source time', 'result' => 'Destination time'] as $key => $label) {
                $moment = $state[$key];
                $html .= '<div><strong>' . $label . '</strong><p>' . self::e($moment['time'] . ' — ' . $moment['date']) . '</p><p>' . self::e($moment['zone'] . ' (UTC' . $moment['offset'] . ')') . '</p></div>';
            }
            $html .= '</div>';
        }
        if (isset($state['dateShift'])) $html .= '<p>' . ($state['dateShift'] === 0 ? 'The result stays on the starting calendar date.' : self::e(abs($state['dateShift'])) . ' calendar date(s) ' . ($state['dateShift'] > 0 ? 'later.' : 'earlier.')) . '</p>';
        $html .= '</div>';
        if (isset($state['rules'])) $html .= '<p class="note">' . self::e($state['rules']) . '</p>';
        $html .= '<!--wdt-details-->';
        if (isset($state['timeline'])) {
            $html .= '<h2>Calculation timeline</h2><ol class="timeline">';
            foreach ($state['timeline'] as $i => $step) $html .= '<li><strong>' . ['Starting time', 'Halfway', 'Result'][$i] . '</strong><br>' . self::e($step['time']) . '<br>' . self::e($step['date']) . '</li>';
            $html .= '</ol>';
        }
        if (isset($state['calendar'])) {
            $html .= '<details class="calendar-details"' . (!empty($state['calendarOpen']) ? ' open' : '') . '><summary>Result calendar</summary><div class="table-scroll"><table class="calendar"><thead><tr>';
            foreach (['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Week'] as $day) $html .= '<th scope="col">' . $day . '</th>';
            $html .= '</tr></thead><tbody>';
            foreach (array_chunk($state['calendar'], 7) as $week) {
                $html .= '<tr>';
                foreach ($week as $day) {
                    $selected = $day['date'] === substr($state['result']['local'] ?? '', 0, 10);
                    $html .= '<td class="' . ($selected ? 'selected-date' : ($day['inMonth'] ? '' : 'muted')) . '"><time datetime="' . self::e($day['date']) . '">' . $day['day'] . '</time></td>';
                }
                $html .= '<td title="ISO week of this row’s Monday">' . self::e($week[1]['isoWeek']) . '</td></tr>';
            }
            $html .= '</tbody></table></div></details>';
        }
        if (isset($state['table'])) $html .= '<h2>' . (isset($state['differenceHours']) ? '24-hour conversion table' : 'Calculation details') . '</h2>' . self::table($state['table']);
        if (isset($state['overlap'])) $html .= '<h2>Working-hour overlap</h2>' . ($state['overlap'] ? self::table($state['overlap'], ['Source local time', 'Destination local time']) : '<p>No shared 9 AM–5 PM weekday slots on the selected date.</p>');
        if (isset($state['transitions'])) {
            $html .= '<h2>Clock changes in the selected year</h2>';
            foreach ($state['transitions'] as $zone => $rows) {
                $html .= '<h3>' . self::e($zone) . '</h3>';
                $html .= $rows ? self::table(array_map(fn($r) => [$r['instant'], $r['offset'] . ' minutes from UTC (' . $r['abbreviation'] . ')'], $rows), ['Transition instant', 'New offset']) : '<p>No clock changes in this year.</p>';
            }
        }
        if (isset($state['periods'])) $html .= '<h2>Time difference through the selected year</h2><p>Each interval ends at the next transition; boundaries are UTC instants.</p>' . self::table($state['periods'], ['From (inclusive)', 'Until (exclusive)', 'Destination minus source']);
        if (isset($state['nearby'])) {
            $html .= '<h2>Nearby calculations</h2><p>These comparisons use the same starting point and time zone as your calculation.</p><div class="table-scroll" tabindex="0"><table><thead><tr><th>Calculation</th><th>Result</th></tr></thead><tbody>';
            foreach ($state['nearby'] as $row) $html .= '<tr><td>' . ($row['path'] ? '<a href="' . self::e($row['path']) . '">' . self::e($row['label']) . '</a>' : self::e($row['label'])) . '</td><td>' . self::e($row['answer']) . '</td></tr>';
            $html .= '</tbody></table></div>';
        }
        return $html;
    }
    public static function parts(array $state): array
    {
        return explode('<!--wdt-details-->', self::result($state), 2);
    }
    private static function input(string $name, string $label, string $type, mixed $value, string $extra = ''): string
    {
        return '<label>' . self::e($label) . '<input name="' . self::e($name) . '" type="' . self::e($type) . '" value="' . self::e($value) . '" ' . $extra . ' required></label>';
    }
    private static function select(string $name, string $label, array $options, mixed $value): string
    {
        $html = '<label>' . self::e($label) . '<select name="' . self::e($name) . '">';
        foreach ($options as $key => $text) $html .= '<option value="' . self::e($key) . '"' . ((string)$key === (string)$value ? ' selected' : '') . '>' . self::e($text) . '</option>';
        return $html . '</select></label>';
    }
    public static function form(array $in, array $cities): string
    {
        $zones = ['UTC' => 'UTC'];
        foreach ($cities as $city) $zones[$city['zone']] ??= $city['name'] . ' — ' . $city['zone'];
        if (!isset($zones[$in['zone']])) $zones[$in['zone']] = $in['zone'];
        $tool = $in['tool'];
        $html = '<form data-calculator method="post"><input type="hidden" name="wdt_action" value="calculate"><input type="hidden" name="tool" value="' . self::e($tool) . '"><input type="hidden" name="mode" value="' . self::e($in['mode']) . '"><div class="inputs">';
        if (in_array($tool, ['relative', 'date', 'business-days', 'weeks-and-days-ago'], true)) {
            $html .= self::input('start', 'Starting date and time', 'datetime-local', $in['start']);
            if ($tool === 'weeks-and-days-ago') {
                $html .= self::input('weeks', 'Weeks ago', 'number', $in['weeks'], 'min="0" max="1428" step="1"') . self::input('days', 'Additional days', 'number', $in['days'], 'min="0" max="6" step="1"');
            } else {
                $html .= self::input('amount', 'Amount', 'number', $in['amount'], 'min="0" max="10000" step="any"');
                $html .= self::select('direction', 'Operation', ['future' => 'Add', 'past' => 'Subtract'], $in['direction']);
                $html .= $tool === 'business-days' ? '<input type="hidden" name="unit" value="business-day">'
                    : self::select('unit', 'Unit', ['hour' => 'Hours', 'day' => 'Days', 'week' => 'Weeks', 'month' => 'Months', 'year' => 'Years', 'business-day' => 'Business days'], $in['unit']);
            }
        } elseif ($tool === 'timezone') {
            $html .= self::input('start', 'Source date and time', 'datetime-local', $in['start']);
            $html .= self::select('fromZone', 'From time zone', $zones, $in['fromZone']) . self::select('toZone', 'To time zone', $zones, $in['toZone']);
        } elseif ($tool === 'countdown') {
            $html .= self::input('name', 'Event name', 'text', $in['name'], 'maxlength="120"') . self::input('target', 'Target date and time', 'datetime-local', $in['target']);
        } elseif (in_array($tool, ['difference', 'days-until'], true)) {
            $html .= self::input('start', 'Start', strlen($in['start']) === 10 ? 'date' : 'datetime-local', $in['start']) . self::input('end', 'End', strlen($in['end']) === 10 ? 'date' : 'datetime-local', $in['end']);
        } elseif ($tool === 'age') {
            $html .= self::input('birth', 'Birth date', 'date', $in['birth']) . self::input('asof', 'Calculate age on', 'date', $in['asof']);
        } elseif (in_array($tool, ['day-of-week', 'half-birthday'], true)) {
            $html .= self::input('date', 'Date', 'date', $in['date']);
        } else {
            $html .= self::input('year', 'Year', 'number', $in['year'], 'min="1" max="9999" step="1"');
            if ($tool !== 'weeks-in-year') $html .= self::select('month', 'Month', array_combine(range(1, 12), ['January','February','March','April','May','June','July','August','September','October','November','December']), $in['month']);
        }
        if ($tool !== 'timezone') $html .= self::select('zone', 'Time zone', $zones, $in['zone']);
        else $html .= '<input type="hidden" name="zone" value="' . self::e($in['fromZone']) . '">';
        if (in_array($tool, ['relative', 'date', 'business-days', 'timezone', 'countdown', 'difference', 'weeks-and-days-ago'], true)) $html .= self::select('occurrence', 'Repeated hour (DST)', ['earlier' => 'Earlier occurrence', 'later' => 'Later occurrence'], $in['occurrence']);
        if ($tool === 'difference') $html .= self::select('endOccurrence', 'End repeated hour (DST)', ['earlier' => 'Earlier occurrence', 'later' => 'Later occurrence'], $in['endOccurrence'] ?? 'earlier');
        $html .= '</div><div class="actions"><button type="submit">' . ($tool === 'countdown' ? 'Start countdown' : 'Calculate') . '</button><button type="button" class="secondary" data-reset>Reset to current time</button><button type="button" class="secondary" data-copy>Copy result</button>';
        if ($tool === 'timezone') $html .= '<button type="button" class="secondary" data-nine-am>Today at 9 AM</button>';
        if ($tool === 'countdown') $html .= '<button type="button" class="secondary" data-save>Save target</button><button type="button" class="secondary" data-share>Copy share link</button><button type="button" class="secondary" data-clear>Clear and reset</button>';
        return $html . '</div><p data-error role="alert"></p><p data-status role="status" class="muted"></p></form>';
    }
}
