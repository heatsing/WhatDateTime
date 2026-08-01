# Site header specification

## Target

- `components/header.tsx`
- Interaction: click-driven desktop groups, mobile menu, and search.

## Layout

- 56px dark utility bar inspired by the reference's compact black header.
- WhatDateTime wordmark remains left aligned on desktop and readable on mobile.
- Existing Date tools, Time tools, Popular, and Search destinations remain unchanged.
- Dropdowns are dark/white high-contrast surfaces with visible focus states.

## Behavior

- Opening any panel closes the others.
- Escape closes all panels.
- Search intent routing and numeric canonical routing stay unchanged.
- Desktop navigation remains visible at `lg`; mobile gets search and menu icon buttons.

## Accessibility

- Preserve button semantics, `aria-expanded`, labels, keyboard navigation, 40px minimum controls, and the global skip link.

