# Driver Dial — Implementation Reference

The Driver Dial is the right-side 200×200px canvas instrument in the Binnacle tab (`#ddCanvas`). It is a multifunction display that cycles through six information screens when clicked. All drawing happens in `console.html` via pure Canvas 2D API — no SVG, no external libraries.

---

## Shell structure

```
.binnacle-col
  .dd-outer                        ← position:relative wrapper
    .binnacle-housing              ← circular dark housing with box-shadow bezel
      .binnacle-bezel-ring         ← inner recessed ring
        canvas#ddCanvas  200×200
    .dd-mode-dots#ddDots           ← absolute, top:18px right:-16px
      span.dd-dot × 6              ← one per mode; .active = lit
  .binnacle-dial-label#ddLabel     ← text pill below the dial
```

The six `.dd-dot` elements sit **outside** the dial, stacked vertically to its top-right. The active dot is white-lit with a subtle glow; inactive dots are near-invisible grey. CSS transitions provide a 0.25 s fade.

---

## State variables

| Variable | Type | Default | Description |
|---|---|---|---|
| `driverModeIdx` | `number` | `0` | Index into `DRIVER_MODES` |
| `DRIVER_MODES` | `string[]` | `['G METER','VEHICLE STATUS','BATTERY','TRIP','DYNAMICS','TIRES']` | Ordered mode list |
| `gX`, `gY` | `number` | `0` | Smoothed lateral / longitudinal G (G METER mode) |
| `gXT`, `gYT` | `number` | `0` | Target G values (random-walk simulation) |

---

## `drawDriverDial()` — outer shell

Called every animation frame from `updateBinnacle()`. Responsible for:

1. **Outer dark frame** — filled circle `#09090d`.
2. **Silver chapter ring** — annulus from `r` to `ringR = r × 0.86`, linear gradient left→right `#71717a → #d8d8de → #b8b8be → #5a5a62`.
3. **Tick marks** — 36 ticks evenly spaced around the ring. Every 6th tick is a major (matches the 6 modes); drawn darker/etched `rgba(14,14,20,0.9)`. Minor ticks are `rgba(44,44,55,0.45)`.
4. **Active tick highlight** — angle `(driverModeIdx / 6) × 2π − π/2` drawn in `rgba(255,255,255,0.7)` at full major-tick length.
5. **Dark glossy face** — radial gradient fill inside `ringR`.
6. **Inner clip** — `ctx.save()` / `ctx.clip()` restricts all mode-content drawing to the face circle.
7. **Mode dispatch** — delegates to the appropriate `dd*` function.
8. **Mode name at bottom** — `Barlow Condensed 600` at `cy + ringR × 0.78`, `rgba(255,255,255,0.50)`.
9. **Label pill sync** — sets `#ddLabel` text content to the current mode name.
10. **Dot sync** — toggles `.active` class on each `.dd-dot` to match `driverModeIdx`.

---

## Mode views

### G METER (`ddGMeter`)

A dual-axis G-force display with a live animated dot.

- **Layout**: two pairs of parallel lines — two horizontal at `cy ± lsep` and two vertical at `cx ± lsep` (`lsep = r × 0.22`). Each line has tick arms extending outward from the gap. Together the four lines form a cross-hatch with an open centre cell.
- **Tick arms**: 40 ticks per arm, extending from the gap centre outward to `gr = r × 0.73` (= 1 g). Colors: yellow `#FFF200` for 0–0.44 g, orange-red `#FF4800` for 0.44–0.57 g, then white `rgba(215,215,215,0.78)` beyond 0.57 g. Major ticks at 0.5 g (tl 4.5), quarter ticks at 0.25/0.75 g (tl 3), minor (tl 1.8).
- **Axis labels**: `flanked()` helper draws `—N—` style labels in the gap between parallel lines. Yellow `#FFF200` at 0 and ±0.5 g; white at ±1 g. `half()` draws 0.5-g markers as superscript `0⁵`.
- **"G FORCE" label**: upper-left quadrant, `Barlow Condensed 600`, `rgba(240,240,240,0.88)`.
- **Live dot**: random-walk simulation. `gXT` / `gYT` receive `±0.06` noise each frame, clamped to `[-1, 1]` and decayed `× 0.965`. `gX` / `gY` follow at rate `0.13`. Dot drawn at `(cx + gX×gr, cy + gY×gr)` with three concentric circles: outer halo `rgba(255,60,0,0.13)`, mid `rgba(255,60,0,0.48)`, inner `#FF3A00` with `shadowBlur=8`.
- **Lens highlight**: top-left diagonal linear gradient `rgba(255,255,255,0.09)` → transparent, drawn over entire face.

### VEHICLE STATUS (`ddVehicleStatus`)

Schematic plan-view of the car chassis.

- **Body outline**: narrow rectangle `bw = r×0.22` × `bh = r×0.60`, centred, rounded-rect stroke.
- **Battery cell grid**: 3 columns × 5 rows inside the body, each cell filled `rgba(255,255,255,0.05)` with stroke `rgba(255,255,255,0.18)`.
- **Wheels**: four rectangles at front/rear axle positions on each side, with three internal horizontal divider strokes.
- **Suspension links**: short horizontal strokes from body edge to wheel, with a damper arrow (line + arrowhead).
- **Rear motor connector**: wide flat rectangle behind the body, subdivided into three cells.
- **OK badge**: rounded-rect in the right-centre zone, `#4ade80` stroke/fill, text "OK".

### BATTERY (`ddBattery`)

Two opposing arcs stacked vertically — a temperature arc (∩) above and a power-potential arc (∪) below.

**Battery Temp arc (upper)**
- Arc `210° → 330°` (clockwise through top), centre offset `cy − r×0.24`, radius `r×0.30`.
- Three colour zones on a 5px stroke: cold blue `rgba(140,185,225,0.60)` for 0–22%, neutral grey 22–76%, hot red `rgba(205,58,48,0.60)` 76–100%.
- 13 tick marks, major every 3rd. White indicator bar at 28% (cool operating temperature).
- C / H endpoint dots and labels at arc tips.
- "BATTERY TEMP" label inside the arch.

**Power Potential arc (lower)**
- Arc `150° → 30°` anticlockwise through bottom, centre offset `cy + r×0.22`, radius `r×0.32`.
- Four zone segments: orange `#E87722` 0–32%, gold `#FFD700` 32–68%, light yellow 68–88%, grey remainder.
- White indicator bar at 50% (TOUR zone). RANGE / TOUR / PERFO labels inside the arc.
- 0% / 100 end labels outside arc tips.
- "POWER / POTENTIAL" label below the arc.

### TRIP (`ddTrip`)

Driving session summary. All values are static mockups.

- **Large distance** at top: `106 km` in `Rajdhani 700` at ~46% of `r`.
- **2×2 stats grid**: MAX SPEED `205`, AVG SPEED `109`, ENERGY `35 kWh`, `268 Wh/km`. Labels in green `#4ade80` (speed) and gold `#FFD700` (energy).
- **Horizontal divider** at vertical midpoint.
- **Elapsed time** at bottom: `55m 38s` in mixed `Rajdhani 700` / `Barlow Condensed` sizing.

### DYNAMICS (`ddDynamics`)

Eight vehicle-dynamics system status bars in a 2-column, 4-row grid.

Systems: `F1-TRAC`, `ESC`, `e4WD`, `4WS`, `ASC`, `ABS` (orange `#E87722`), `POWER` (gold `#FFD700`), `RIDE` (muted grey).

Each cell: system name in `Barlow Condensed 600`, then a row of 5 bar segments below. Filled segments use the system colour with `shadowBlur=4`; empty segments are `rgba(255,255,255,0.08)` with outline stroke. Active levels: F1-TRAC/ESC/e4WD/ASC/ABS = 3/5, 4WS = 4/5, POWER = 2/5, RIDE = 2/5.

### TIRES (`ddTires`)

Tyre-pressure display in four quadrants (FL, FR, RL, RR).

- **Cross divider**: faint horizontal and vertical lines splitting the canvas.
- **"BAR" label** at centre.
- **Per-quadrant arcs**: each tyre has a 130°-span arc centred in its quadrant. The arc is colour-coded: green `#4ade80` below optimal, yellow `#FFD700` in optimal, red-orange `#FF6B35` above. A white needle marks current pressure. Pressure value and position label (FL/FR/RL/RR) are drawn inside each arc.
- **Static pressure value**: `2.4 BAR` for all four tyres (mockup).

---

## Interactions

| Element | Action | Effect |
|---|---|---|
| `#ddCanvas` | click | `driverModeIdx = (driverModeIdx + 1) % 6` |
| `#ddLabel` | click | same |
| `.dd-dot` | (none — display only) | toggled by `drawDriverDial()` each frame |

---

## CSS classes used

| Class | Purpose |
|---|---|
| `.dd-outer` | `position:relative` wrapper enabling absolute dot placement |
| `.dd-mode-dots` | absolute container; `top:18px right:-16px`; column flex, `gap:6px` |
| `.dd-dot` | 5×5px circle, grey fill/stroke, `transition 0.25s` |
| `.dd-dot.active` | white fill, white border, subtle `box-shadow` glow |
| `.binnacle-dial-label` | text pill below canvas; no colour class (stays neutral for Driver Dial) |
