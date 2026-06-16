# Ferrari Luce — Silver Chapter-Ring Bezel Approach

## Overview

At one point in development all three binnacle dials (Power, Central, Driver) carried a **silver "chapter ring"** — an annular bezel drawn on the canvas between the outer frame and the dark instrument face, dressed with dark-etched tick marks. The approach is documented here for reference and deliberate future consideration; it was subsequently removed because it conflicts with the Luce's OLED-black binnacle identity.

---

## Visual Character

- A metallic silver annulus ringing the outside of each gauge face
- Tick marks appear as dark CNC-etched lines on the silver surface (the "chapter ring" aesthetic borrowed from Swiss watchmaking)
- Reads as polished aluminum or stainless steel — tactile, precision-machined
- Creates strong contrast between the bright outer ring and the very dark dial face inside

---

## Technical Implementation

All three draw functions used the same pattern; only minor parameters differed.

### 1 — Annular silver fill

```js
const ringR = r * 0.88;          // inner radius of the ring (fraction of canvas half-width)
                                  // Power/Central: 0.88 · Driver: 0.86

// Horizontal silver gradient — mimics the directional sheen of brushed metal
const rg = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
rg.addColorStop(0,    '#71717a');  // shadow left edge
rg.addColorStop(0.35, '#d8d8de');  // highlight near-left-of-centre
rg.addColorStop(0.65, '#b8b8be');  // mid-tone right-of-centre
rg.addColorStop(1,    '#5a5a62');  // shadow right edge

// Even-odd donut: clockwise outer arc, then counterclockwise inner arc
ctx.beginPath();
ctx.arc(cx, cy, r - 0.5, 0, Math.PI * 2, false);  // outer edge
ctx.arc(cx, cy, ringR,    0, Math.PI * 2, true);   // inner edge (hole)
ctx.fillStyle = rg;
ctx.fill();
```

The 1:1 aspect ratio of the canvas means the horizontal gradient reads as a sweeping left→right highlight across the ring, simulating light catching a turned-metal surface.

### 2 — Tick marks (dark etched on silver)

```js
// Power Dial / Central Dial: 60 ticks (major every 5th)
for (let i = 0; i < 60; i++) {
  const a   = (i / 60) * Math.PI * 2;
  const maj = i % 5 === 0;
  const ro  = r - 1.5;
  const ri  = maj ? ringR + (r - ringR) * 0.42   // major: 42% into ring depth
                  : ringR + (r - ringR) * 0.14;  // minor: 14% into ring depth
  ctx.beginPath();
  ctx.moveTo(cx + ro * Math.cos(a), cy + ro * Math.sin(a));
  ctx.lineTo(cx + ri * Math.cos(a), cy + ri * Math.sin(a));
  ctx.strokeStyle = maj ? 'rgba(14, 14, 20, 0.88)' : 'rgba(44, 44, 55, 0.45)';
  ctx.lineWidth   = maj ? 2.6 : 1.2;
  ctx.stroke();
}

// Driver Dial: 36 ticks (major every 6th — one per display mode)
for (let i = 0; i < 36; i++) {
  const a   = (i / 36) * Math.PI * 2 - Math.PI / 2;  // rotated so 0 = 12 o'clock
  const maj = i % 6 === 0;
  // …same radius / strokeStyle formula as above, lineWidth 2.8 / 1.2
}

// Driver Dial: highlight the active mode's major tick in white
const majA = (driverModeIdx / 6) * Math.PI * 2 - Math.PI / 2;
ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
ctx.lineWidth   = 2.8;
// …draw from outer edge to 44% into ring depth
```

### 3 — Parameters by dial

| Dial    | Canvas  | ringR factor | Tick count | Major every |
|---------|---------|-------------|------------|-------------|
| Power   | 200×200 | 0.88        | 60         | 5           |
| Central | 280×280 | 0.88        | 60         | 5           |
| Driver  | 200×200 | 0.86        | 36         | 6           |

---

## Why It Was Removed

The Luce binnacle language is defined by **OLED black depth** — dials that recede into darkness with luminous arcs emerging from void. The silver chapter ring inverts that hierarchy: it makes the outer bezel the brightest, most assertive element, pulling attention away from the dynamic data inside. Specifically:

1. **Hierarchy conflict** — the silver ring outshines the active-arc indicators, which are the primary telemetry signals
2. **Material anachronism** — machined-metal chapter rings belong to traditional mechanical watches and analogue gauges; the Luce's identity is more liquid-OLED than engraved steel
3. **Contrast inversion** — the dark-tick-on-silver pattern creates a conventional "instrument look" that reads as generic; the Luce dials should feel like light emerging from carbon

---

## Where It Might Be Reconsidered

- A **performance / race-trim variant** where the binnacle is explicitly referencing the Ferrari SF90 Stradale analogue instrument aesthetic
- A **physical prototype** where screen bezels are CNC machined and the chapter ring is an actual turned-aluminum part surrounding the display (in that context the canvas ring would be unnecessary anyway)
- A **legacy / Heritage mode** cockpit skin toggled by the user for a more traditional instrument feel

---

## CSS Side-Effect (Box Bug)

When `data-binn-id` was placed directly on `.binnacle-housing` (the circular housing div), the console-panel rule:

```css
[data-binn-id] { border-radius: 8px; … }
```

overrode `.binnacle-housing { border-radius: 50%; }` (equal specificity, later rule wins), causing the Central Dial housing to render as a **rounded rectangle** instead of a circle. Fixed by moving `data-binn-id` to the parent `.binnacle-col` wrapper, following the same pattern already used for the Driver Dial (`dd-outer` carries the attribute, `binnacle-housing` stays attribute-free).
