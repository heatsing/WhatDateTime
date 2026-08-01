# WhatDateTime second-upgrade behaviors

- Header menus and search remain click-driven, keyboard reachable, and dismissible with Escape.
- Current time is the only second-by-second animation. Digital and analog displays share one `Date` state.
- Analog hands update without CSS transitions, so reduced-motion users receive the same stable interface.
- Quick calculator submits to an existing canonical URL only.
- Programmatic calculator updates its visible result in place and keeps the static server answer intact.
- Calendar, comparison, editorial copy, nearby table, and FAQ require no client JavaScript for initial rendering.
- No scroll animation, parallax, autoplay carousel, glass effect, or ad-sized layout gap.
- Desktop, tablet, and mobile share the same content order; only grid/stack behavior changes.

