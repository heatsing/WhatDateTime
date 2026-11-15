/* Native browser interactions. Calculations and validation are performed by PHP. */
(() => {
  'use strict';
  const storageKey = 'whatdatetime.countdown.v1';
  const zone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const track = (action, tool) => { if (typeof window.gtag === 'function') window.gtag('event', action, { tool }); };
  const navigation = Array.from(document.querySelectorAll('.nav-group'));
  for (const menu of navigation) menu.addEventListener('toggle', () => { if (menu.open) for (const other of navigation) if (other !== menu) other.open = false; });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') for (const menu of navigation) menu.open = false; });
  document.addEventListener('click', event => { if (!event.target.closest('.nav-group')) for (const menu of navigation) menu.open = false; });
  for (const root of document.querySelectorAll('[data-clock-root]')) {
    let state = JSON.parse(root.querySelector('[data-clock-state]').textContent);
    let fetchedAt = performance.now(), hour12 = true, version = 0;
    const clock = root.querySelector('[data-clock]');
    const status = root.querySelector('[data-clock-status]');
    const select = root.querySelector('[name="clock-zone"]');
    const tick = () => {
      // Format a shifted UTC instant: do not overwrite PHP's newer IANA offsets with an older browser database.
      const date = new Date(Date.parse(state.result.instant) + performance.now() - fetchedAt + state.result.offsetMinutes * 60000);
      clock.textContent = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', hour: 'numeric', minute: '2-digit', second: '2-digit', hour12 }).format(date);
      root.querySelector('[data-clock-date]').textContent = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', dateStyle: 'full' }).format(date);
      root.querySelector('[data-clock-zone]').textContent = `${state.result.zone} (UTC${state.result.offset})`;
      const angles = { hour: date.getUTCHours() % 12 * 30 + date.getUTCMinutes() / 2, minute: date.getUTCMinutes() * 6 + date.getUTCSeconds() / 10, second: date.getUTCSeconds() * 6 };
      for (const [name, angle] of Object.entries(angles)) root.querySelector(`[data-hand="${name}"]`).setAttribute('transform', `rotate(${angle} 110 110)`);
    };
    const refresh = async requestedZone => {
      const requestVersion = ++version;
      try {
        const response = await fetch(root.dataset.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tool: 'clock', zone: requestedZone }), cache: 'no-store' });
        const data = await response.json();
        if (requestVersion !== version) return;
        if (!response.ok) throw new Error(data.message || 'Clock could not sync.');
        state = data.result; fetchedAt = performance.now(); tick();
        const facts = root.querySelector('[data-clock-facts] tbody');
        if (facts && state.facts) {
          facts.replaceChildren();
          for (const row of state.facts) { const tr = document.createElement('tr'); for (const value of row) { const td = document.createElement('td'); td.textContent = value; tr.append(td); } facts.append(tr); }
        }
        for (const summary of document.querySelectorAll('[data-today-summary]')) if (root.dataset.fixed !== 'true') {
          summary.querySelector('[data-today-date]').textContent = state.result.date;
          summary.querySelector('[data-today-day]').textContent = `${state.dayOfYear} of ${state.daysInYear}`;
          summary.querySelector('[data-today-week]').textContent = state.isoWeek;
          summary.querySelector('[data-today-remaining]').textContent = state.daysInYear - state.dayOfYear;
        }
        if (select) { if (!Array.from(select.options).some(o => o.value === requestedZone)) select.add(new Option(requestedZone, requestedZone)); select.value = requestedZone; }
        status.textContent = 'Clock synchronized. Time zone rules are provided by the server.';
      } catch { status.textContent = 'Could not synchronize. The clock is continuing from its last server reference.'; }
    };
    root.querySelector('[data-clock-format]').addEventListener('click', event => { hour12 = !hour12; event.target.textContent = `Use ${hour12 ? '24' : '12'}-hour format`; tick(); });
    root.querySelector('[data-clock-copy]').addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(`${clock.textContent}, ${root.querySelector('[data-clock-date]').textContent} (${state.result.zone})`); status.textContent = 'Time copied.'; track('calculator_copy', 'clock'); }
      catch { status.textContent = 'Select the displayed time to copy it.'; }
    });
    select?.addEventListener('change', () => refresh(select.value));
    tick(); refresh(root.dataset.fixed === 'true' ? state.result.zone : zone());
    setInterval(() => { if (!document.hidden) tick(); }, 1000);
    setInterval(() => { if (!document.hidden) refresh(state.result.zone); }, 60000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(state.result.zone); });
    window.addEventListener('pageshow', () => refresh(state.result.zone));
    window.addEventListener('focus', () => refresh(state.result.zone));
  }
  for (const form of document.querySelectorAll('[data-site-search]')) {
    const list = form.querySelector('[data-search-results]');
    form.addEventListener('submit', async event => {
      event.preventDefault(); list.replaceChildren();
      const query = new URLSearchParams({ q: form.elements.q.value.trim() });
      try {
        const response = await fetch(`${form.dataset.endpoint}?${query}`);
        const links = await response.json();
        if (!response.ok) throw new Error();
        for (const link of links) { const li = document.createElement('li'), a = document.createElement('a'); a.href = link.path; a.textContent = link.label; li.append(a); list.append(li); }
        if (!links.length) list.textContent = 'No matching tools. Try a date, city, or calculator name.';
      } catch { list.textContent = 'Search is unavailable. Use the navigation links above.'; }
    });
  }
  for (const root of document.querySelectorAll('[data-tool-root]')) {
    const config = JSON.parse(root.querySelector('[data-tool-state]').textContent);
    const form = root.querySelector('form');
    const error = form.querySelector('[data-error]');
    const status = form.querySelector('[data-status]');
    const output = root.querySelector('[data-result]');
    const copy = form.querySelector('[data-copy]');
    let result = config.result;
    let live = config.input.mode === 'live';
    let pending = false;
    let controller;
    let revision = 0;
    let debounce;
    const tool = config.input.tool;
    const liveSupported = ['relative', 'date', 'business-days', 'timezone', 'weeks-and-days-ago'].includes(tool);
    const read = () => Object.fromEntries(new FormData(form));
    const set = (name, value) => {
      const field = form.elements.namedItem(name);
      if (!field || value === undefined || value === null) return;
      if (field instanceof HTMLSelectElement && !Array.from(field.options).some(o => o.value === String(value))) field.add(new Option(String(value), String(value)));
      field.value = String(value);
    };
    const countdownTick = () => {
      if (tool !== 'countdown' || !result.target) return;
      const seconds = Math.max(0, Math.ceil((Date.parse(result.target.instant) - Date.now()) / 1000));
      const days = Math.floor(seconds / 86400), hours = Math.floor(seconds % 86400 / 3600), minutes = Math.floor(seconds % 3600 / 60);
      const text = seconds ? `${days} days, ${hours} hours, ${minutes} minutes, ${seconds % 60} seconds` : "Time's up";
      const answer = output.querySelector('[data-answer]');
      if (answer) answer.textContent = text;
      result.answer = text;
      result.copyText = `${result.target.name}: ${text}. Target: ${result.target.instant} (${result.target.zone}).`;
    };
    const calculate = async ({ user = false, values = null, keepInstant = false } = {}) => {
      controller?.abort(); controller = new AbortController(); const version = ++revision;
      const input = values || read(); input.tool = tool; input.mode = live && liveSupported ? 'live' : 'custom'; input.pageSlug = config.slug;
      if (keepInstant && result.target) input.instant = result.target.instant;
      copy.disabled = true;
      try {
        const response = await fetch(config.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input), signal: controller.signal, cache: 'no-store' });
        const payload = await response.json();
        if (version !== revision) return;
        if (!response.ok) throw new Error(payload.message || 'Check the entered values.');
        result = payload.result; output.innerHTML = payload.html;
        root.querySelector('[data-details]').innerHTML = payload.details;
        if (values && Object.hasOwn(values, 'resetSlug')) for (const [key, value] of Object.entries(payload.input)) set(key, value);
        error.textContent = ''; pending = false; copy.disabled = false;
        if (live && result.start) set('start', result.start.local);
        if (tool === 'countdown' && result.target) { set('target', result.result.local); set('zone', result.target.zone); set('name', result.target.name); countdownTick(); }
        status.textContent = live && liveSupported ? 'Live mode. Editing inputs pauses automatic updates.' : 'Custom result. Your inputs remain unchanged until you reset.';
        if (user) track('calculator_success', tool);
      } catch (problem) {
        if (problem.name === 'AbortError' || version !== revision) return;
        error.textContent = problem.message + ' The displayed result is unchanged.';
        pending = true; copy.disabled = true;
      }
    };
    const dirty = () => {
      controller?.abort(); revision++; live = false; set('mode', 'custom'); pending = true; copy.disabled = true;
      status.textContent = tool === 'countdown' ? 'Unapplied edits. Select Start countdown to change the saved or shared target.' : 'Updating the calculation from your inputs…';
      clearTimeout(debounce);
    };
    form.addEventListener('input', event => {
      if (tool === 'countdown' && event.target.name === 'zone' && result.target) return;
      dirty();
      if (tool !== 'countdown') debounce = setTimeout(() => calculate(), 350);
    });
    form.addEventListener('change', event => {
      if (tool === 'countdown' && event.target.name === 'zone' && result.target) {
        if (pending) { error.textContent = 'Start or reset the draft before changing its display time zone.'; set('zone', result.target.zone); return; }
        calculate({ keepInstant: true });
      }
    });
    form.addEventListener('submit', event => { event.preventDefault(); clearTimeout(debounce); live = false; calculate({ user: true }); });
    const reset = async () => {
      clearTimeout(debounce); controller?.abort(); revision++; error.textContent = ''; pending = false;
      live = liveSupported; set('mode', live ? 'live' : 'custom');
      await calculate({ values: { resetSlug: config.slug, zone: zone() } });
    };
    form.querySelector('[data-reset]').addEventListener('click', reset);
    form.querySelector('[data-nine-am]')?.addEventListener('click', async () => {
      clearTimeout(debounce); live = false;
      await calculate({ user: true, values: { resetSlug: config.slug, meetingStart: true, zone: zone(), fromZone: form.elements.fromZone.value, toZone: form.elements.toZone.value } });
    });
    copy.addEventListener('click', async () => {
      if (pending) return;
      try { countdownTick(); await navigator.clipboard.writeText(result.copyText); status.textContent = 'Result copied.'; track('calculator_copy', tool); }
      catch { status.textContent = 'Clipboard is unavailable. Select and copy the answer above.'; }
    });
    const applyTarget = async target => {
      if (!target || typeof target.instant !== 'string' || typeof target.zone !== 'string' || typeof target.name !== 'string') throw new Error('This countdown link is incomplete.');
      live = false;
      await calculate({ values: { tool, mode: 'custom', instant: target.instant, zone: target.zone, name: target.name } });
    };
    const restore = async () => {
      const hash = new URLSearchParams(location.hash.slice(1));
      if (hash.has('due')) return applyTarget({ instant: hash.get('due'), zone: hash.get('zone') || zone(), name: hash.get('event') || 'My event' });
      const saved = localStorage.getItem(storageKey);
      if (saved) return applyTarget(JSON.parse(saved));
      set('zone', zone());
      return calculate({ keepInstant: true });
    };
    if (tool === 'countdown') {
      form.querySelector('[data-save]').addEventListener('click', () => {
        if (pending) { status.textContent = 'Start the edited countdown before saving it.'; return; }
        try { localStorage.setItem(storageKey, JSON.stringify(result.target)); status.textContent = 'Target saved on this device.'; }
        catch { status.textContent = 'This browser could not save the target. Use a share link instead.'; }
      });
      form.querySelector('[data-share]').addEventListener('click', async () => {
        if (pending) { status.textContent = 'Start the edited countdown before sharing it.'; return; }
        const url = new URL(location.href); url.search = ''; url.hash = new URLSearchParams({ event: result.target.name, due: result.target.instant, zone: result.target.zone }).toString();
        try { await navigator.clipboard.writeText(url.href); status.textContent = 'Share link copied. It preserves the exact target instant.'; track('calculator_share', tool); }
        catch { status.textContent = `Copy this share link: ${url.href}`; }
      });
      form.querySelector('[data-clear]').addEventListener('click', () => {
        try { localStorage.removeItem(storageKey); } catch { status.textContent = 'Saved data could not be removed.'; }
        history.replaceState(null, '', location.pathname + location.search); reset();
      });
      window.addEventListener('hashchange', () => restore().catch(e => { error.textContent = e.message; }));
      setInterval(() => { if (!document.hidden) countdownTick(); }, 1000);
      restore().catch(e => { error.textContent = e.message; });
    } else if (config.input.mode === 'live') {
      reset();
    }
    const resume = () => {
      if (document.hidden) return;
      if (tool === 'countdown') countdownTick();
      else if (live && liveSupported && !pending && !form.contains(document.activeElement)) calculate();
    };
    document.addEventListener('visibilitychange', resume);
    window.addEventListener('pageshow', resume); window.addEventListener('focus', resume);
    setInterval(resume, 60000);
  }
})();
