# Ferrari Luce — Color Reference

Color palette extracted from `console.html`. Covers every hex, rgba, and named color
in the file. Does **not** include colors from external stylesheets (Google Fonts, Font Awesome).

---

## Shell & Housing

| Value | Where / What |
|-------|--------------|
| `#0a0a0a` | Page `<body>` background — near-black ground |
| `#111114` | `.shell-content` fill — the dark visual shell of the Control Panel |
| `#111118` | `.multigraph-housing` background — circular housing behind the Multigraph |
| `#0a0a0e` | `.multigraph-bezel-ring` and `.binnacle-bezel-ring` inner ring — deepest black bezel |
| `#2e2e36` | `.multigraph-bezel` — the bezel face ring (dark charcoal-blue) |
| `#0b0b0e` | `.screen-area` background — the recessed screen region |
| `#09090d` | Canvas: outer frame fill used on all three Multigraph faces and Binnacle dials |
| `rgba(0,0,0,0.92)` | Shell drop shadow (opacity: near-black haze) |
| `rgba(0,0,0,0.45)` | `.shell-content::after` night-mode overlay (applied when `.night-mode` active) |
| `rgba(255,255,255,0.22)` | Shell inner ring stroke / housing ring — bright white inset highlight |
| `rgba(255,255,255,0.07)` | Shell subtle top-edge inset glow |
| `rgba(255,255,255,0.055)` | `.screen-area` border and `.screen-divider` — hairline panel borders |
| `rgba(255,255,255,0.065)` | Metrics column right border and `.cp-setting` / `.st-tile` borders |

### Binnacle Housing Gradient
Radial gradient from center outward — the housing behind all three Binnacle dials.

| Stop | Value | Note |
|------|-------|------|
| 0% | `#22222a` | Warm dark center |
| 60% | `#111118` | Mid dark indigo |
| 100% | `#0a0a0e` | Near-black edge |

---

## Chapter Rings (Silver Annuli)

All three Binnacle dials and the Multigraph clock share a brushed-silver linear gradient ring.

| Stop | Power/Driver Dial Value | Clock Face Value | Note |
|------|------------------------|-----------------|------|
| 0% | `#71717a` | `#818186` | Left (cool silver) |
| 35% | `#d8d8de` | `#dcdce2` | Bright highlight |
| 65% | `#b8b8be` | `#c0c0c6` | Mid silver |
| 100% | `#5a5a62` | `#6a6a70` | Right (shadow) |

Tick marks etched on the silver ring:
- Major ticks: `rgba(14,14,20,0.88)` — dark near-black
- Minor ticks: `rgba(44,44,55,0.45)` — softer dark

---

## Instrument Faces (Canvas Drawn)

### Shared Dark Face Gradient
Used on Clock, Power Dial, and Driver Dial inner faces (radial, center-to-edge).

| Stop | Value | Note |
|------|-------|------|
| 0% | `#1c1c26` | Slightly lifted highlight center |
| 60% | `#0e0e16` | Mid dark indigo |
| 100% | `#06060e` | Near-black edge |

### Inner Disc Gradient (Central Dial and Power Dial)
| Stop | Value | Note |
|------|-------|------|
| 0% | `#1d1d22` | Warm center highlight |
| 65% | `#101014` | Mid |
| 100% | `#060609` | Deep black edge |

### Gloss Highlight (all three Binnacle dials)
Radial gradient, top-right quadrant, giving a lens-glass sheen.
- `rgba(255,255,255,0.07–0.09)` → `rgba(255,255,255,0.02–0.03)` → `rgba(0,0,0,0)` transparent

### Sub-dial Gradient (Stopwatch only)
| Stop | Value | Note |
|------|-------|------|
| 0% | `#1c1c20` | Slightly lighter center |
| 100% | `#0a0a0e` | Deep black edge |

Sub-dial ring stroke: `rgba(255,255,255,0.12)`

---

## Stopwatch Face

The Multigraph stopwatch face uses a muted vintage-yellow radial gradient (the classic chronograph "champagne" dial).

| Stop | Value | Note |
|------|-------|------|
| 0% (center) | `#DBCB63` | Pale gold highlight |
| 45% | `#D2BB48` | Mid amber-gold |
| 85% | `#C9AB3C` | Deeper ochre |
| 100% (edge) | `#BC9E31` | Rich dark gold |

Tick marks on the yellow face:
- Major ticks: `rgba(0,0,0,0.72)` — dark etched
- Medium ticks: `rgba(0,0,0,0.48)`
- Minor ticks: `rgba(0,0,0,0.22)`
- Numerals: `rgba(0,0,0,0.82)` — dark text on gold ground

Stadium band (black pill behind sub-dials): `#09090d`

---

## Clock Face

| Element | Value | Note |
|---------|-------|------|
| Outer frame | `#09090d` | Same near-black as other faces |
| Clock face radial | `#1c1c26` → `#0e0e16` → `#06060e` | Dark glossy dial |
| Numerals (1–12) | `rgba(255,255,255,0.92)` | Bright white, high contrast |
| Hour hand | `rgba(255,255,255,0.95)` | Solid white |
| Minute hand | `rgba(255,255,255,0.90)` | Near-white |
| Second hand | `#FF2800` | Ferrari red sweep hand |
| Center hub outer | `#FF2800` | Red boss |
| Center hub inner | `#cccccc` | Polished silver cap |

---

## Compass Face

| Element | Value | Note |
|---------|-------|------|
| Outer frame | `#09090d` | Consistent with other faces |
| Rotating card (white ring) | `#e8e8e4` | Warm white compass card |
| Tick marks on card | `rgba(0,0,0,0.62)` | Dark etched on white |
| Degree numerals | `rgba(0,0,0,0.65)` | Dark on white card |
| Cardinal letters (N/E/S/W) | `rgba(0,0,0,0.92)` | Bold dark on white |
| Inner black disc | `#1e1e26` → `#121218` → `#08080e` | Radial gradient |
| Red heading sector | `rgba(200,28,15,0.50)` | Semi-transparent red arc |
| Needle tip (N, red) | `#FF2800` | Ferrari red |
| Needle body (grey) | `rgba(185,185,192,0.95)` | Light grey counter-tail |
| Center hub | `#FF2800` | Red boss |
| Center hub inner dot | `#e0e0e0` | Light grey cap |

---

## Binnacle Dials — Needles & Arcs

### Orange Speed/Power Needle (Power Dial & Central Dial)
| Value | Note |
|-------|------|
| `#FF8C00` | Orange fill — the main sweep needle on both Binnacle speed/power dials |
| `#FF8C00` (shadowColor) | Matching glow blur (shadowBlur: 12) |

### Central Dial Speed Ticks
- Active (speed reached): `#FFF200` — Ferrari yellow
- Inactive: `rgba(215,215,215,0.72)` — light grey

### Central Dial Battery/Charge Arc
| State | Value | Note |
|-------|-------|------|
| Charged ticks | `#4ade80` | Bright green (Tailwind green-400) |
| Uncharged ticks | `rgba(255,255,255,0.18)` | Near-invisible white |
| E (empty) major tick | `#ef4444` | Red warning |
| F/½ major ticks | `rgba(215,215,215,0.88)` | Bright silver |
| Battery icon stroke | `#4ade80` | Green outline rectangle |
| Range label ("408 km") | `#4ade80` | Green with arrow |
| "E" label | `#ef4444` | Red |
| "F" / "1/2" labels | `rgba(215,215,215,0.80–0.88)` | Silver |

### Hub Caps (Binnacle dials)
| Value | Note |
|-------|------|
| `#1a1a1f` | Outer hub cap fill |
| `#b8b8b8` | Inner hub cap silver dot |

---

## Battery Dial Sub-view (Driver Dial mode)

| Element | Value | Note |
|---------|-------|------|
| Track background | `rgba(255,255,255,0.07)` | Faint white arc track |
| Cold zone | `rgba(140,185,225,0.60)` | Muted blue |
| Neutral zone | `rgba(200,200,198,0.42)` | Warm grey |
| Hot zone | `rgba(205,58,48,0.60)` | Red |
| Cold endpoint dot | `rgba(130,178,228,0.90)` | Blue dot |
| Hot endpoint dot | `rgba(212,60,50,0.90)` | Red dot |
| "C" label | `rgba(130,178,228,0.82)` | Blue |
| "H" label | `rgba(212,68,52,0.82)` | Red |
| Battery temp label | `rgba(232,232,224,0.82)` | Warm white |
| Indicator bar | `rgba(255,255,255,0.92)` | Bright white tick |

### Power Potential Arc Zones
| Zone | Value | Note |
|------|-------|------|
| 0–32% (RANGE) | `#E87722` | Deep orange |
| 32–68% (TOUR) | `#FFD700` | Golden yellow |
| 68–88% (PERFO) | `#FFE55C` | Lighter yellow |
| 88–100% (tail) | `rgba(200,200,200,0.18)` | Faded white |
| Zone labels | `rgba(255,215,0,0.82)` | Gold |

---

## G-Meter Sub-view

| Element | Value | Note |
|---------|-------|------|
| Tick color (0–44% of g range) | `#FFF200` | Yellow — normal lateral load |
| Tick color (44–57%) | `#FF4800` | Orange — elevated load |
| Tick color (57–100%) | `rgba(215,215,215,0.78)` | Light grey — over limit reference |
| G-force dot halo | `rgba(255,60,0,0.13)` | Faint orange glow |
| G-force dot mid | `rgba(255,60,0,0.48)` | Orange mid ring |
| G-force dot core | `#FF3A00` (+ shadow) | Bright red-orange core |
| Axis labels (yellow zone) | `#FFF200` (YLO) | Yellow |
| Axis labels (white zone) | `rgba(230,230,230,0.88)` (YWH) | Off-white |
| "G FORCE" label | `rgba(240,240,240,0.88)` | Bright white |
| Crosshair | `rgba(255,255,255,0.40)` | Subtle white |

---

## Dynamics Sub-view (Driver Dial)

| System type | Bar color | Note |
|-------------|-----------|------|
| Active control system (F1-TRAC, ESC, etc.) | `#E87722` | Orange, with matching shadow glow |
| POWER bars | `#FFD700` | Gold |
| RIDE bars | `rgba(160,160,155,0.70)` | Muted warm grey |
| Empty bars | `rgba(255,255,255,0.08)` | Near-invisible with `rgba(255,255,255,0.12)` border |

---

## Trip Sub-view (Driver Dial)

| Element | Value | Note |
|---------|-------|------|
| MAX/AVG SPEED labels | `#4ade80` | Green |
| Distance / speed values | `rgba(232,232,224,0.92)` | Warm white |
| ENERGY label | `#FFD700` | Gold |
| Unit labels ("km/h", "km") | `rgba(200,200,196,0.52–0.65)` | Muted warm grey |
| Divider line | `rgba(255,255,255,0.08)` | Hairline |

---

## Mode Colors (Manettino & e-Manettino)

These colors drive badge borders/text, waveform fill, and Binnacle dial glow dynamically.

### Manettino Chassis Modes
| Mode | Value | Note |
|------|-------|------|
| ICE | `#A8C4D4` | Steel blue |
| WET | `#B8D0E0` | Lighter ice blue |
| DRY | `#4caf50` | Mid green (Material Green 500) |
| SPORT | `#E87722` | Burnt orange |
| PERFORMANCE | `#FF2800` | Ferrari red |

### e-Manettino Power Modes
| Mode | Value | Note |
|------|-------|------|
| RANGE | `#A8C4D4` | Steel blue (same as ICE) |
| TOUR | `#FFF200` | Ferrari yellow |
| PERFO | `#FF2800` | Ferrari red |

---

## Ferrari Red & Ferrari Yellow — Primary Brand Colors

| Value | Usage |
|-------|-------|
| `#FF2800` | Ferrari red — stopwatch start/stop button, second hand, compass needle, sub-dial hands, status dot, ENZO badge border, progress bar fill, tab indicator underline, delete button hover, modal error text |
| `#FFF200` | Ferrari yellow — stopwatch reset button, active toolbar button, positioning overlay outlines, selected element highlight, active layout item, resize handle squares, power-waveform line color (TOUR mode), accent for sliders, mode indicator dots (TOUR) |

---

## Typography

### Primary Text
| Value | Usage |
|-------|-------|
| `#e8e8e0` | Main metric values (speed, power), time display, main text — warm off-white |
| `rgba(232,232,224,0.80)` | Unit suffixes (km/h, kW) |
| `rgba(232,232,224,0.60)` | Date display |
| `rgba(232,232,224,0.50)` | AQI and heading sub-labels |
| `rgba(232,232,224,0.45)` | Ambient temp secondary |
| `rgba(232,232,224,0.40)` | Artist / road name sub-labels |
| `rgba(232,232,224,0.38)` | Media "by" line |
| `rgba(220,220,216,0.82)` | Settings tile values, modal text |

### Dim / Label Text
| Value | Usage |
|-------|-------|
| `rgba(255,255,255,0.22)` | Panel title, toolbar label, status bar label, corner radius handle, pos-label |
| `rgba(255,255,255,0.25–0.30)` | Fan label, zone labels, various secondary labels |
| `rgba(255,255,255,0.28)` | Binnacle dial label, MANETTINO label on dial |
| `rgba(255,255,255,0.32)` | Multigraph mode label (default idle state) |
| `rgba(255,255,255,0.35)` | Toolbar current layout label |
| `rgba(200,200,196,0.62)` | Tooltip `#tip-fn` text |
| `rgba(200,200,196,0.45)` | Modal subtitle |
| `rgba(200,200,196,0.50)` | Status pills (inactive) |

### Tooltip & Modal
| Value | Usage |
|-------|-------|
| `rgba(10,10,12,0.96)` | Tooltip background |
| `rgba(255,255,255,0.13)` | Tooltip border |
| `#e0e0dc` | Tooltip title, modal title — bright warm white |
| `#13131a` | Modal box background |
| `rgba(255,255,255,0.10)` | Modal box border |
| `#FF2800` | Modal error text |

---

## Interactive Controls

### Toolbar Buttons
| State | Background | Border | Text |
|-------|-----------|--------|------|
| Default | `rgba(255,255,255,0.06)` | `rgba(255,255,255,0.14)` | `rgba(255,255,255,0.65)` |
| Hover | `rgba(255,255,255,0.10)` | — | `#fff` |
| Active/selected | `rgba(255,242,0,0.12)` | `rgba(255,242,0,0.45)` | `#FFF200` |

### Dome Buttons (physical button row)
| State | Gradient |
|-------|----------|
| Default | `linear-gradient(180deg, #2c2c30 0%, #1c1c1e 55%, #131315 100%)` |
| Highlight gloss `::after` | `rgba(255,255,255,0.055)` |

Active glow states (box-shadow color only):
| LED color | Glow | Border |
|-----------|------|--------|
| Green | `rgba(0,220,80,0.5)` | `rgba(0,220,80,0.35)` |
| Amber | `rgba(255,180,0,0.5)` | `rgba(255,180,0,0.35)` |
| Red | `rgba(255,40,0,0.5)` | `rgba(255,40,0,0.35)` |
| Blue | `rgba(80,120,255,0.5)` | `rgba(80,120,255,0.35)` |

### Dome LEDs
| Color | Hex | Note |
|-------|-----|------|
| Off | `rgba(255,255,255,0.08)` | Near-invisible |
| Green | `#00dc50` | Climate mode active / ADAS on |
| Amber | `#ffb400` | Settings mode active |
| Red | `#FF2800` | Ferrari red |
| Blue | `#4a78ff` | Night mode / cooling |

### Icon Buttons (Moon / Hazard / HUD)
| State | Background | Border | Glow |
|-------|-----------|--------|------|
| Default | `rgba(255,255,255,0.025)` | `rgba(255,255,255,0.1)` | — |
| Hover | `rgba(255,255,255,0.07)` | `rgba(255,255,255,0.22)` | — |
| Night (moon) active | `rgba(30,60,200,0.28)` | `#5577ff` | `rgba(60,100,255,0.4)` |
| Hazard active | `rgba(255,242,0,0.1)` | `#FFF200` | `rgba(255,242,0,0.35)` |
| HUD active | `rgba(0,220,80,0.1)` | `rgba(0,220,80,0.6)` | `rgba(0,220,80,0.3)` |

Moon button SVG stroke: `rgba(100,140,255,0.8)`
Hazard button SVG stroke: `rgba(255,242,0,0.75)`
HUD button SVG stroke: `rgba(180,180,180,0.7)`

### Volume Knob
Radial gradient: `#3a3a3e` (0%) → `#222226` (50%) → `#181819` (100%)
Indicator line: `rgba(255,255,255,0.38)`

### Climate A/C Buttons & Fan Dots
| State | Value | Note |
|-------|-------|------|
| Active/synced | `#A8C4D4` / `rgba(168,196,212,…)` | Steel blue — matches ICE/RANGE mode color |
| Fan dot lit (`.cp-fan-dot.lit`) | `#A8C4D4` | Steel blue |
| Fan dot lit (`.cl-fan-dot-v.lit`) | `#A8C4D4` | Same |

### Seat Heating Bars
| State | Value | Note |
|-------|-------|------|
| Unlit | `rgba(255,255,255,0.1)` | Dim white |
| Lit (strip `.seat-bar`) | `#1E6FCC` + `rgba(30,111,204,0.8)` glow | Bold cobalt blue |
| Lit (panel `.cp-heat-bar`) | `#ff7820` + `rgba(255,120,30,0.6)` glow | Orange heat |

### Temperature Rings (climate strip)
| State | Border | Background |
|-------|--------|-----------|
| Default | `rgba(255,255,255,0.2)` | `rgba(255,255,255,0.025)` |
| Hover | `rgba(255,255,255,0.45)` | `rgba(255,255,255,0.055)` |
| Text | `rgba(255,255,255,0.72)` | — |

### Climate Zone Temperatures (panel)
| Zone | Value | Note |
|------|-------|------|
| Driver temp | `rgba(255,80,40,0.9)` | Warm red |
| Passenger temp | `rgba(100,185,255,0.9)` | Cool blue |

### Seat Heating states (`.cp-sync-btn.synced`)
`color: #4caf50; border-color: rgba(76,175,80,0.45)` — same green as DRY chassis mode

---

## Mode Panels

### HUD-On Screen Border
`rgba(0,255,100,0.3)` border + `inset 0 0 20px rgba(0,255,80,0.06)` glow

### Media Panel
| Element | Value | Note |
|---------|-------|------|
| Progress bar fill | `#FF2800` | Ferrari red |
| Progress bar track | `rgba(255,255,255,0.1)` | Dim white |
| Album art background | `linear-gradient(135deg, rgba(200,30,30,0.5), rgba(20,20,40,0.8))` | Red-to-dark |
| Album art border | `rgba(255,60,0,0.25)` | Faint red |
| Map background | `linear-gradient(155deg, #1b2f2b → #0f2320 → #162b25 → #1b3129)` | Deep teal-green |
| Active route | `rgba(77,158,247,0.9)` | Bright blue |
| Location dot halo | `rgba(77,158,247,0.18)` | Transparent blue |
| Location dot core | `rgba(77,158,247,1)` with white stroke | Solid blue |
| Map footer overlay | `rgba(0,0,0,0.65)` | Semi-transparent black |
| CarPlay Maps app icon | `#3a7bd5` | Blue |
| CarPlay Music app icon | `#c72d4b` | Red |
| CarPlay Phone app icon | `#2d9e4f` | Green |

### Settings Panel — Vehicle Schematic SVG
| Element | Value | Note |
|---------|-------|------|
| Brake disc strokes | `rgba(255,60,0,0.42)` | Red-orange |
| Motor indicator fill | `rgba(255,180,50,0.5)` | Amber |
| Motor indicator stroke | `rgba(255,190,60,0.8)` | Brighter amber |
| Battery pack fill | `rgba(168,196,212,0.07)` | Very faint steel blue |
| Battery pack stroke | `rgba(168,196,212,0.3)` | Steel blue |
| Battery label text | `rgba(168,196,212,0.65)` | Steel blue |
| Wheel strokes | `rgba(255,255,255,0.22)` | Light white |

Veh-data telemetry text colors:
| Class | Value | Note |
|-------|-------|------|
| TYRE label (`b`) | `rgba(0,220,80,0.8)` | Green |
| BRAKE | `rgba(255,60,0,0.78)` | Red-orange |
| MOTOR | `rgba(255,180,50,0.8)` | Amber |
| BATTERY | `rgba(168,196,212,0.75)` | Steel blue |

### Climate Panel — Interior SVG
| Element | Value | Note |
|---------|-------|------|
| Driver seat glow ring fill | `rgba(255,50,20,0.07)` | Red warm glow |
| Driver seat glow ring stroke | `rgba(255,60,20,0.38)` + `rgba(255,40,10,0.12)` wide | Red halo layers |
| Passenger seat glow ring fill | `rgba(80,160,255,0.06)` | Cool blue glow |
| Passenger seat glow ring stroke | `rgba(100,175,255,0.38)` + `rgba(90,165,255,0.11)` wide | Blue halo layers |
| Steering wheel stroke | `rgba(255,255,255,0.28)` | Light white |
| Horn center fill | `rgba(255,255,255,0.1)` | Ghost white |
| Indicator dot (top of wheel) | `rgba(255,220,0,0.75)` | Amber signal dot |

---

## Status Bar & Pills

| State | Text | Border | Background |
|-------|------|--------|-----------|
| Inactive | `rgba(200,200,196,0.5)` | `rgba(255,255,255,0.07)` | — |
| Active | `rgba(255,255,255,0.85)` | `rgba(255,255,255,0.2)` | `rgba(255,255,255,0.05)` |

---

## Handle (Aluminum)

Linear gradient simulating brushed aluminium:
`linear-gradient(180deg, #686870 0%, #8c8c92 18%, #a0a0a5 40%, #8c8c92 68%, #585860 100%)`

Highlight gloss bar: `rgba(255,255,255,0.14)`
Shadow: `rgba(0,0,0,0.28)` (inset bottom), `rgba(255,255,255,0.32)` (inset top)

---

## Positioning Overlay System

| Element | Value | Note |
|---------|-------|------|
| Resize overlay border | `rgba(255,242,0,0.45)` | Dashed yellow bounding box |
| Resize handle squares | `#FFF200` | Solid yellow corner/edge handles |
| Position hint bar background | `rgba(6,6,8,0.96)` | Near-black footer |
| Position hint bar top border | `rgba(255,242,0,0.2)` | Faint yellow |
| Selected element outline | `#FFF200` (2px solid) | Ferrari yellow selection ring |
| Selected element label text | `#FFF200` | Yellow |
| Selected element label background | `rgba(0,0,0,0.85)` | Near-black pill |
| Hover outline (Ctrl held) | `rgba(255,242,0,0.38)` | Dashed yellow |
| Console/shell tab labels | `rgba(255,242,0,0.75)` (default), `#FFF200` (selected) | Yellow UI tabs |
| Slider accent color | `#FFF200` | CSS `accent-color` for range inputs |
| Slider value readout | `#FFF200` | Yellow monospace text |
| Elements panel background | `rgba(6,6,9,0.97)` | Near-black with blur |
| Elements panel border | `rgba(255,255,255,0.09)` | Hairline white |
| Selected item label in panel | `#FFF200` | Yellow |
| Checkbox accent | `#FFF200` | Yellow |

---

## Save / Layout Modal

| Element | Value | Note |
|---------|-------|------|
| Overlay backdrop | `rgba(0,0,0,0.72)` | Semi-transparent black |
| Modal box background | `#13131a` | Very dark indigo |
| Modal box border | `rgba(255,255,255,0.1)` | Hairline |
| Modal shadow | `rgba(0,0,0,0.8)` | Deep drop shadow |
| Title text | `#e0e0dc` | Warm off-white |
| Subtitle | `rgba(200,200,196,0.45)` | Muted warm grey |
| Input background | `rgba(255,255,255,0.05)` | Ghost fill |
| Input focus border | `rgba(255,242,0,0.4)` | Yellow focus ring |
| Placeholder | `rgba(255,255,255,0.2)` | Very dim |
| Error text | `#FF2800` | Ferrari red |
| Current layout item background | `rgba(255,242,0,0.04)` | Very faint yellow tint |
| Current layout item text | `#FFF200` | Yellow |
| Primary (SAVE) button | bg `rgba(255,242,0,0.12)` / border `rgba(255,242,0,0.4)` / text `#FFF200` | Yellow CTA |
| Delete button default | text `rgba(255,80,60,0.55)` / border `rgba(255,80,60,0.15)` | Muted red |
| Delete button hover | bg `rgba(255,40,0,0.12)` / text `#FF2800` / border `rgba(255,40,0,0.35)` | Ferrari red |

---

## Tab Navigation

| Element | Value | Note |
|---------|-------|------|
| Tab bar bottom border | `rgba(255,255,255,0.06)` | Hairline separator |
| Inactive tab text | `rgba(255,255,255,0.28)` | Dim white |
| Active tab text | `#e8e8e0` | Warm white |
| Tab indicator (sliding underline) | `#FF2800` | Ferrari red |

---

## Binnacle Dial Labels (mode pills below each dial)

| Mode | Text color | Border |
|------|-----------|--------|
| Default / idle | `rgba(255,255,255,0.28)` | `rgba(255,255,255,0.07)` |
| RANGE / ICE | `#A8C4D4` | `rgba(168,196,212,0.38)` |
| TOUR | `#FFF200` | `rgba(255,242,0,0.38)` |
| PERFO / PERFORMANCE | `#FF2800` | `rgba(255,40,0,0.38)` |
| WET | `#B8D0E0` | `rgba(184,208,224,0.38)` |
| DRY | `#4caf50` | `rgba(76,175,80,0.38)` |
| SPORT | `#E87722` | `rgba(232,119,34,0.38)` |

---

## PRND Gear Selector

| State | Text | Border | Background |
|-------|------|--------|-----------|
| Inactive | `rgba(255,255,255,0.18)` | transparent | — |
| Hover | `rgba(255,255,255,0.45)` | — | — |
| Active (selected gear) | `rgba(232,232,224,0.90)` | `rgba(232,232,224,0.28)` | `rgba(232,232,224,0.055)` |

---

## Odometer Display (Power Dial)

| Element | Value | Note |
|---------|-------|------|
| Background box fill | `#0e0e16` | Very dark indigo |
| Background box stroke | `rgba(255,255,255,0.12)` | Hairline |
| Main digits | `rgba(225,225,205,0.92)` | Warm cream white |
| Trip/reset digit background | `#cc1020` | Deep red cell highlight |
| Trip/reset digit text | `#fff` | Pure white |
| KM suffix | `rgba(175,175,155,0.55)` | Muted olive-cream |

---

## Status Dot (Start/Stop) & Reset Button

| Element | Value | Note |
|---------|-------|------|
| Status dot (red START/STOP) | `#FF2800` | Ferrari red, sits on top edge of shell |
| Status dot glow (idle) | `0 0 6px #FF2800` | Soft red halo |
| Status dot glow (hover) | `0 0 10px #FF2800, 0 0 18px rgba(255,40,0,0.5)` | Stronger halo |
| Reset button (yellow) | `#FFF200` | Ferrari yellow, sits on right edge |
| Reset button glow | `0 0 5px rgba(255,242,0,0.6)` | Yellow halo |
| Reset button glow (hover) | `0 0 10px #FFF200, 0 0 18px rgba(255,242,0,0.5)` | Stronger yellow |

---

## ENZO Badge & Multigraph Running State

| Element | Value | Note |
|---------|-------|------|
| ENZO badge (default) | border + text `#FF2800` | Ferrari red |
| Multigraph label (stopwatch running) | text `#FFF200` / border `rgba(255,242,0,0.3)` | Yellow pulsing |
