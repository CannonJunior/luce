/* ============================================================
   FERRARI LUCE COCKPIT — INTERACTION ENGINE
   Gauge rendering, animation, simulation, input handling
   ============================================================ */

'use strict';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const DEG  = Math.PI / 180;
const RAD  = 180 / Math.PI;
const SVGL = { cx: 110, cy: 110, r: 82 }; // small dial geometry
const SVGC = { cx: 150, cy: 150, r: 115 }; // center dial geometry
const BATT = { cx: 150, cy: 150, r: 92 };  // battery ring geometry

// Dial sweep: 225° arc, starting at 135° (bottom-left), ending at 45° (top-left)
// Standard gauge: 7 o'clock start → 5 o'clock end
const ARC_START = 135;
const ARC_SWEEP = 270;

// Correct 5-position Manettino names (Ice → Wet → Dry → Sport → Performance/ESC Off)
const MANETTINO_MODES = ['ice', 'wet', 'dry', 'sport', 'performance'];
const E_MANETTINO_LABELS = ['RANGE', 'TOUR', 'PERFO'];
const RIGHT_DIAL_MODES = ['G-FORCE', 'TYRE PRESS', 'TORQUE', 'LAT G', 'TEMP', 'REGEN %', 'POWER'];
const MG_MODES = ['CLOCK', 'CHRONO', 'COMPASS', 'LAUNCH'];

// Torque meter overlay geometry
const TM_N    = 14;   // number of segments
const TM_R    = 137;  // arc radius (sits between depth rings at r=136 and r=145)
const TM_HALF = 68;   // half-span in degrees → total 136° arc at top of dial
const TM_GAP  = 1.5;  // gap between segments (degrees)

// ─── STATE ────────────────────────────────────────────────────────────────────

const state = {
  keyInserted:    false,
  speed:          0,         // 0–320 km/h
  targetSpeed:    0,
  power:          0,         // 0–100 % of max power
  targetPower:    0,
  regen:          0,         // 0–100 % regen
  battery:        98,        // 0–100 %
  rangekm:        458,
  gForceX:        0,         // lateral -2 to +2
  gForceY:        0,         // longitudinal -2 to +2
  tyrePressure:   2.4,
  torquePct:      0,
  tempC:          28,
  regenPct:       0,
  drive:          'D',       // P R N D
  manettinoIdx:   2,         // 0=range 1=tour 2=sport 3=dry 4=performance
  eManettinoIdx:  1,         // 0=eco 1=bal 2=pwr
  rightDialIdx:   0,
  mgModeIdx:      0,
  demoMode:       false,
  demoT:          0,
  launchActive:   false,
  launchCount:    0,
  leftSignal:     false,
  rightSignal:    false,
  lastFrame:      0,
};

// ─── G-FORCE SPRING STATE ─────────────────────────────────────────────────────
// Ball never teleports — always spring-interpolated (Grand Review rule #13)
const gSpring = { x: 110, y: 110, vx: 0, vy: 0 };

function updateGBallSpring(targetX, targetY, dt) {
  const k = 0.08;  // spring constant
  const d = 0.72;  // damping
  const scale = dt / 16; // normalize to 60fps
  const fx = (targetX - gSpring.x) * k;
  const fy = (targetY - gSpring.y) * k;
  gSpring.vx = (gSpring.vx + fx) * d;
  gSpring.vy = (gSpring.vy + fy) * d;
  gSpring.x += gSpring.vx * scale;
  gSpring.y += gSpring.vy * scale;
  // Clamp to circle boundary r=32
  const dx = gSpring.x - 110, dy = gSpring.y - 110;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist > 32) {
    const angle = Math.atan2(dy, dx);
    gSpring.x = 110 + Math.cos(angle) * 32;
    gSpring.y = 110 + Math.sin(angle) * 32;
    gSpring.vx *= -0.3;
    gSpring.vy *= -0.3;
  }
}

// ─── DOM REFS ─────────────────────────────────────────────────────────────────

const $ = id => document.getElementById(id);
const dom = {
  restOverlay:   $('rest-overlay'),
  glassKeyRest:  $('glassKeyRest'),
  startupFlash:  $('startup-flash'),
  cockpit:       $('cockpit'),
  // Dials
  leftNeedle:    $('leftNeedle'),
  leftArcActive: $('leftArcActive'),
  leftArcRegen:  $('leftArcRegen'),
  leftArcTrack:  $('leftArcTrack'),
  leftTicks:     $('leftTicks'),
  leftValue:     $('leftValue'),
  centerNeedle:  $('centerNeedle'),
  centerArcActive:$('centerArcActive'),
  centerArcTrack:$('centerArcTrack'),
  centerArcLimit: $('centerArcLimit'),
  centerTicks:   $('centerTicks'),
  speedValue:    $('speedValue'),
  batteryPct:    $('batteryPct'),
  rangeValue:    $('rangeValue'),
  batteryTrack:  $('batteryTrack'),
  batteryActive: $('batteryActive'),
  rightNeedle:   $('rightNeedle'),
  rightArcActive:$('rightArcActive'),
  rightArcTrack: $('rightArcTrack'),
  rightTicks:    $('rightTicks'),
  rightValue:    $('rightValue'),
  rightModeLabel:$('rightModeLabel'),
  rightDialLabel:$('rightDialLabel'),
  rightDialMode: $('rightDialMode'),
  gForceBall:    $('gForceBall'),
  gBall:         $('gBall'),
  // Steering
  steeringWheel: $('steeringWheel'),
  swSvg:         document.querySelector('.sw-svg'),
  paddleLeft:    $('paddleLeft'),
  paddleRight:   $('paddleRight'),
  signalLeft:    $('signalLeft'),
  signalRight:   $('signalRight'),
  eManettinoKnob:$('eManettinoKnob'),
  manettinoKnob: $('manettinoKnob'),
  // Drive / console
  dsP: $('dsP'), dsR: $('dsR'), dsN: $('dsN'), dsD: $('dsD'),
  dsSelectorKnob: $('dsSelectorKnob'),
  // Multigraph
  mgHourHand: $('mgHourHand'),
  mgMinHand:  $('mgMinHand'),
  mgSecHand:  $('mgSecHand'),
  mgModeLabel:$('mgModeLabel'),
  mgModeBtn:  $('mgModeBtn'),
  mgMarkers:  $('mgMarkers'),
  // Torque meter overlay
  torqueMeter: $('torqueMeter'),
  tmBgBand:    $('tmBgBand'),
  tmSegments:  $('tmSegments'),
  // Key slot
  gksEink:    $('gksEink'),
  // Overhead
  launchHandle:$('launchHandle'),
  toggleSwitches: document.querySelectorAll('.toggle-switch'),
  // Screen
  csTime:     $('csTime'),
  // Launch
  launchOverlay: $('launchOverlay'),
  lcoCount:   $('lcoCount'),
  // Warnings
  warnBattery: $('warnBattery'),
  warnTemp:   $('warnTemp'),
  warnTrac:   $('warnTrac'),
};

// ─── SVG UTILITIES ────────────────────────────────────────────────────────────

function polarPoint(cx, cy, r, angleDeg) {
  const a = (angleDeg - 90) * DEG;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function arcPath(cx, cy, r, startDeg, endDeg) {
  // clamp end to avoid degenerate full circles
  if (Math.abs(endDeg - startDeg) >= 360) endDeg = startDeg + 359.9;
  const s = polarPoint(cx, cy, r, startDeg);
  const e = polarPoint(cx, cy, r, endDeg);
  const large = (endDeg - startDeg) > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}

// pct: 0–1, maps to ARC_START → ARC_START+ARC_SWEEP
function arcPct(cx, cy, r, pct) {
  const start = ARC_START;
  const end   = ARC_START + pct * ARC_SWEEP;
  return arcPath(cx, cy, r, start, end);
}

function needleDeg(pct) {
  return ARC_START + pct * ARC_SWEEP - 270; // offset so 0pct points at start
}

// ─── GAUGE INITIALISATION ─────────────────────────────────────────────────────

function buildTicks(group, cx, cy, rOuter, rInner, rMajMin, count, majorEvery, labelR, labelTexts) {
  while (group.firstChild) group.removeChild(group.firstChild);
  for (let i = 0; i <= count; i++) {
    const pct = i / count;
    const angleDeg = ARC_START + pct * ARC_SWEEP;
    const isMajor = (i % majorEvery === 0);
    const r1 = isMajor ? rOuter : rOuter - (rOuter - rInner) * 0.4;
    const r2 = isMajor ? rMajMin : rInner;
    const p1 = polarPoint(cx, cy, r1, angleDeg);
    const p2 = polarPoint(cx, cy, r2, angleDeg);
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', p1.x); line.setAttribute('y1', p1.y);
    line.setAttribute('x2', p2.x); line.setAttribute('y2', p2.y);
    line.setAttribute('stroke', isMajor ? '#3a3a3a' : '#1e1e1e');
    line.setAttribute('stroke-width', isMajor ? '1.5' : '0.8');
    line.setAttribute('stroke-linecap', 'round');
    group.appendChild(line);
    // Labels for major ticks
    if (isMajor && labelTexts && labelR) {
      const lp = polarPoint(cx, cy, labelR, angleDeg);
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', lp.x); text.setAttribute('y', lp.y);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'middle');
      text.setAttribute('font-family', 'Barlow Condensed, sans-serif');
      text.setAttribute('font-size', labelTexts === 'large' ? '13' : '8');
      text.setAttribute('font-weight', '300');
      text.setAttribute('fill', '#2e2e2e');
      text.setAttribute('letter-spacing', '0');
      const labelIdx = i / majorEvery;
      if (labelTexts !== 'large' && labelTexts[labelIdx] !== undefined) {
        text.textContent = labelTexts[labelIdx];
      } else if (labelTexts === 'large') {
        // speed: 0 20 40 ... per tick
      }
      group.appendChild(text);
    }
  }
}

function buildMgMarkers(group) {
  while (group.firstChild) group.removeChild(group.firstChild);
  for (let i = 0; i < 12; i++) {
    const angleDeg = i * 30 - 90;
    const a = angleDeg * DEG;
    const isMajor = (i % 3 === 0);
    const r1 = 62, r2 = isMajor ? 52 : 57;
    const x1 = 70 + r1 * Math.cos(a), y1 = 70 + r1 * Math.sin(a);
    const x2 = 70 + r2 * Math.cos(a), y2 = 70 + r2 * Math.sin(a);
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1); line.setAttribute('y1', y1);
    line.setAttribute('x2', x2); line.setAttribute('y2', y2);
    line.setAttribute('stroke', isMajor ? '#2a2a2a' : '#141414');
    line.setAttribute('stroke-width', isMajor ? '1.2' : '0.6');
    group.appendChild(line);
  }
}

function buildTorqueMeterSegments() {
  const g = dom.tmSegments;
  if (!g) return;
  while (g.firstChild) g.removeChild(g.firstChild);
  const slotDeg = (TM_HALF * 2) / TM_N;
  for (let i = 0; i < TM_N; i++) {
    const a0 = -TM_HALF + i * slotDeg + TM_GAP / 2;
    const a1 = a0 + slotDeg - TM_GAP;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', arcPath(SVGC.cx, SVGC.cy, TM_R, a0, a1));
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', '#0d2a3a');
    path.setAttribute('stroke-width', '8');
    path.setAttribute('stroke-linecap', 'round');
    g.appendChild(path);
  }
  if (dom.tmBgBand) {
    dom.tmBgBand.setAttribute('d', arcPath(SVGC.cx, SVGC.cy, TM_R, -TM_HALF, TM_HALF));
  }
}

function updateTorqueMeter() {
  if (!dom.tmSegments) return;
  const lit  = Math.round((state.torquePct / 100) * TM_N);
  const segs = dom.tmSegments.children;
  for (let i = 0; i < segs.length; i++) {
    segs[i].setAttribute('stroke', i < lit ? '#FFF200' : '#0d2a3a');
  }
}

function initGauges() {
  // Small dials: 40 ticks, major every 8 → 6 labels (0–5 segments)
  const leftLabels  = ['0', '20', '40', '60', '80', '100'];
  const rightLabels = ['−2', '−1', '0', '+1', '+2'];

  buildTicks(dom.leftTicks,   SVGL.cx, SVGL.cy, 75, 66, 70, 40, 8,  58, leftLabels);
  buildTicks(dom.centerTicks, SVGC.cx, SVGC.cy, 108, 96, 103, 64, 8, 82, null, null);
  buildTicks(dom.rightTicks,  SVGL.cx, SVGL.cy, 75, 66, 70, 40, 10, 58, rightLabels);

  // Speed labels on center dial (0 to 320)
  const cg = dom.centerTicks;
  for (let i = 0; i <= 8; i++) {
    const pct = i / 8;
    const angleDeg = ARC_START + pct * ARC_SWEEP;
    const lp = polarPoint(SVGC.cx, SVGC.cy, 80, angleDeg);
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', lp.x); text.setAttribute('y', lp.y);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('font-family', 'Barlow Condensed, sans-serif');
    text.setAttribute('font-size', '10');
    text.setAttribute('font-weight', '300');
    text.setAttribute('fill', '#2a2a2a');
    text.textContent = String(i * 40);
    cg.appendChild(text);
  }

  // Static arc tracks
  dom.leftArcTrack.setAttribute('d',   arcPct(SVGL.cx, SVGL.cy, 78, 1));
  dom.centerArcTrack.setAttribute('d', arcPct(SVGC.cx, SVGC.cy, 110, 1));
  dom.rightArcTrack.setAttribute('d',  arcPct(SVGL.cx, SVGL.cy, 78, 1));
  dom.batteryTrack.setAttribute('d',   arcPct(BATT.cx, BATT.cy, 88, 1));

  // Redline zone (260–320 on center = 81.25%–100%)
  dom.centerArcLimit.setAttribute('d', arcPath(SVGC.cx, SVGC.cy, 110,
    ARC_START + 0.8125 * ARC_SWEEP, ARC_START + ARC_SWEEP));

  // Regen arc on power meter (bottom zone = 0% is center, goes negative)
  dom.leftArcRegen.setAttribute('d', arcPath(SVGL.cx, SVGL.cy, 78,
    ARC_START + ARC_SWEEP * 0.0, ARC_START + ARC_SWEEP * 0.15));

  buildMgMarkers(dom.mgMarkers);
  buildTorqueMeterSegments();
}

// ─── NEEDLE UPDATES ───────────────────────────────────────────────────────────

function setNeedle(el, pct, cx, cy) {
  const deg = needleDeg(Math.max(0, Math.min(1, pct)));
  el.style.transform = `rotate(${deg}deg)`;
  el.style.transformOrigin = `${cx}px ${cy}px`;
}

function updateGauges() {
  const speedPct  = state.speed / 320;
  const powerPct  = state.power / 100;
  const battPct   = state.battery / 100;

  // Center speed — always 3 digits with leading zeros: 007 not 7
  setNeedle(dom.centerNeedle, speedPct, 150, 150);
  dom.centerArcActive.setAttribute('d', arcPct(SVGC.cx, SVGC.cy, 110, speedPct));
  dom.speedValue.textContent = String(Math.round(state.speed)).padStart(3, '0');

  // Battery — arc color always #A8C4D4 via CSS, never changes
  dom.batteryActive.setAttribute('d', arcPct(BATT.cx, BATT.cy, 88, battPct));
  // Battery % text color: white (normal), amber (≤20%), red pulse handled by CSS class
  const battRound = Math.round(state.battery);
  dom.batteryPct.textContent = battRound + '%';
  dom.batteryPct.setAttribute('fill', battRound <= 8 ? '#FF2800' : battRound <= 20 ? '#E87722' : '#A8C4D4');
  dom.rangeValue.textContent = Math.round(state.rangekm) + ' km';

  // Left power
  setNeedle(dom.leftNeedle, powerPct, 110, 110);
  dom.leftArcActive.setAttribute('d', arcPct(SVGL.cx, SVGL.cy, 78, powerPct));
  dom.leftValue.textContent = Math.round(state.power * 6.1); // 0–610 kW

  // Right dial (configurable)
  updateRightDial();

  // Torque meter overlay
  updateTorqueMeter();

  // Mode-driven arc stroke
  applyModeColor();

  // Warnings
  dom.warnBattery.classList.toggle('active', state.battery < 15);
  dom.warnTemp.classList.toggle('active',    state.tempC > 55);
  dom.warnTrac.classList.toggle('active',    state.speed > 60 && Math.abs(state.gForceX) > 1.2);

  // Live-refresh config strip for dynamic elements
  if (selectedBinnId === 'steering' || selectedBinnId === 'warnings' || selectedBinnId === 'dial-center' || selectedBinnId === 'torque-meter') {
    renderBinnConfigStrip(selectedBinnId);
  }
}

function updateRightDial() {
  const mode = RIGHT_DIAL_MODES[state.rightDialIdx];
  dom.rightModeLabel.textContent  = mode;
  dom.rightDialLabel.textContent  = mode;

  let pct = 0;
  let displayVal = '0';

  // G-force ball visibility
  const isGMode = (mode === 'G-FORCE' || mode === 'LAT G');
  dom.gForceBall.style.opacity = isGMode ? '1' : '0';

  switch (mode) {
    case 'G-FORCE': {
      const g = Math.sqrt(state.gForceX ** 2 + state.gForceY ** 2);
      pct = g / 3;
      displayVal = g.toFixed(2);
      // Spring-interpolated ball — never teleports (Grand Review rule #13)
      const targetBx = 110 + state.gForceX * 28;
      const targetBy = 110 - state.gForceY * 28;
      dom.gBall.setAttribute('cx', gSpring.x);
      dom.gBall.setAttribute('cy', gSpring.y);
      // Ball color shifts under high G
      const gColor = g < 1.5 ? '#FAFAF8' : g < 2.5 ? '#E87722' : '#FF2800';
      dom.gBall.setAttribute('fill', gColor);
      break;
    }
    case 'LAT G': {
      pct = (state.gForceX + 2) / 4;
      displayVal = state.gForceX.toFixed(2);
      dom.gBall.setAttribute('cx', gSpring.x);
      dom.gBall.setAttribute('cy', '110');
      break;
    }
    case 'TYRE PRESS': pct = (state.tyrePressure - 1.5) / 2; displayVal = state.tyrePressure.toFixed(1) + ' bar'; break;
    case 'TORQUE':     pct = state.torquePct / 100; displayVal = Math.round(state.torquePct * 8.45) + ' Nm'; break;
    case 'TEMP':       pct = (state.tempC - 0) / 120; displayVal = state.tempC.toFixed(0) + '°C'; break;
    case 'REGEN %':    pct = state.regenPct / 100; displayVal = Math.round(state.regenPct) + '%'; break;
    case 'POWER':      pct = state.power / 100; displayVal = Math.round(state.power * 6.1) + ' kW'; break;
  }

  setNeedle(dom.rightNeedle, Math.max(0, Math.min(1, pct)), 110, 110);
  dom.rightArcActive.setAttribute('d', arcPct(SVGL.cx, SVGL.cy, 78, Math.max(0, Math.min(1, pct))));
  dom.rightValue.textContent = displayVal;
}

function applyModeColor() {
  // All 5 modes mapped directly — no aliases needed with full CSS coverage
  dom.cockpit.setAttribute('data-mode', MANETTINO_MODES[state.manettinoIdx]);
}

// ─── MULTIGRAPH ───────────────────────────────────────────────────────────────

function updateMultigraph() {
  const mode = MG_MODES[state.mgModeIdx];
  dom.mgModeLabel.textContent = mode;

  if (mode === 'CLOCK' || mode === 'CHRONO') {
    const now = new Date();
    const h = now.getHours() % 12;
    const m = now.getMinutes();
    const s = now.getSeconds() + now.getMilliseconds() / 1000;

    const hDeg = h * 30 + m * 0.5 - 90;
    const mDeg = m * 6 + s * 0.1 - 90;
    const sDeg = s * 6 - 90;

    dom.mgHourHand.style.transform = `rotate(${hDeg + 90}deg)`;
    dom.mgMinHand.style.transform  = `rotate(${mDeg + 90}deg)`;
    dom.mgSecHand.style.transform  = `rotate(${sDeg + 90}deg)`;
  } else if (mode === 'COMPASS') {
    // Spin slowly
    const t = Date.now() / 12000 * 360;
    dom.mgHourHand.style.transform  = `rotate(${t}deg)`;
    dom.mgMinHand.style.transform   = `rotate(${-t * 0.5}deg)`;
    dom.mgSecHand.style.transform   = `rotate(${t * 2}deg)`;
  } else if (mode === 'LAUNCH') {
    // Sweep to red (reset animation)
    dom.mgHourHand.style.transform  = 'rotate(90deg)';
    dom.mgMinHand.style.transform   = 'rotate(-30deg)';
    dom.mgSecHand.style.transform   = 'rotate(0deg)';
  }

  // Update screen clock
  const now2 = new Date();
  dom.csTime.textContent =
    String(now2.getHours()).padStart(2,'0') + ':' + String(now2.getMinutes()).padStart(2,'0');
}

// ─── STARTUP CEREMONY ─────────────────────────────────────────────────────────
// Sequence:
// 0ms    — key press detected, E Ink dims to black
// 200ms  — startup flash frames
// 400ms  — cockpit DOM visible
// 600ms  — rest overlay fades out
// 800ms  — needles sweep to zero from 50% (diagnostic sweep)
// 1400ms — needles return to actual values
// 1800ms — yellow flows: drive selector glows, gksEink pulses

function startupCeremony() {
  if (state.keyInserted) return;
  state.keyInserted = true;

  // Phase 0: E Ink dims
  const eink = dom.glassKeyRest.querySelector('.gk-eink');
  eink.style.transition = 'background 800ms ease, box-shadow 400ms ease';
  eink.style.background = '#000';
  eink.style.boxShadow  = 'none';

  // Phase 1: flash
  setTimeout(() => {
    dom.startupFlash.classList.add('flash');
    // Add sweep line
    const sweep = document.createElement('div');
    sweep.className = 'startup-sweep animate';
    document.body.appendChild(sweep);
    setTimeout(() => sweep.remove(), 1500);
  }, 200);

  // Phase 2: cockpit appears
  setTimeout(() => {
    dom.cockpit.classList.remove('hidden');
    dom.cockpit.classList.add('visible');
    initGauges();
    // Apply initial hidden state for overlay elements
    const tmEl = getBinnElemDom('torque-meter');
    if (tmEl) tmEl.classList.add('binn-hidden');
    updateGauges();
    updateMultigraph();
  }, 400);

  // Phase 3: rest overlay fades
  setTimeout(() => {
    dom.restOverlay.classList.add('fade-out');
  }, 600);

  // Phase 4: diagnostic needle sweep (max → return)
  setTimeout(() => {
    dom.centerNeedle.style.transition = 'transform 600ms cubic-bezier(0.4,0,0.6,1)';
    dom.leftNeedle.style.transition   = 'transform 600ms cubic-bezier(0.4,0,0.6,1)';
    dom.rightNeedle.style.transition  = 'transform 600ms cubic-bezier(0.4,0,0.6,1)';
    setNeedle(dom.centerNeedle, 0.85, 150, 150);
    setNeedle(dom.leftNeedle,   0.75, 110, 110);
    setNeedle(dom.rightNeedle,  0.70, 110, 110);
  }, 800);

  setTimeout(() => {
    dom.centerNeedle.style.transition = 'transform 350ms cubic-bezier(0.34,1.56,0.64,1)';
    dom.leftNeedle.style.transition   = 'transform 400ms cubic-bezier(0.34,1.56,0.64,1)';
    dom.rightNeedle.style.transition  = 'transform 400ms cubic-bezier(0.34,1.56,0.64,1)';
    updateGauges();
  }, 1500);

  // Phase 5: yellow flows to drive selector; toolbar becomes available
  setTimeout(() => {
    dom.gksEink.classList.add('yellow-state');
    dom.dsSelectorKnob.style.boxShadow = '0 0 12px #FFF200, 0 0 24px rgba(255, 242, 0, 0.3)';
    document.getElementById('binnToolbar').classList.add('visible');
  }, 1800);

  // Start animation loop
  setTimeout(() => {
    requestAnimationFrame(mainLoop);
  }, 1000);
}

// ─── DEMO MODE ────────────────────────────────────────────────────────────────

const DEMO_SCRIPT = [
  // [duration ms, targetSpeed, gX, gY, note]
  [2000, 0,   0,    0,    'idle'],
  [3000, 80,  0.1,  0.8,  'launch'],
  [2000, 140, 0.2,  0.4,  'accel'],
  [2000, 180, 1.4, -0.1,  'right corner'],
  [1500, 120, 0.2,  0,    'straight'],
  [2000, 200, -1.6,  0.1, 'left corner'],
  [1500, 240, 0.1,  0.3,  'accel'],
  [2000, 200, 0.8, -0.5,  'braking corner'],
  [1500, 140, 0.1,  0,    'straight'],
  [2000, 60,  0.1, -0.9,  'heavy brake'],
  [1500, 40,  0.3, -0.1,  'chicane'],
  [1500, 0,   0,    0,    'stop'],
];

let demoPhase = 0;
let demoPhaseT = 0;
let demoPhaseStart = 0;

function updateDemo(dt) {
  if (!state.demoMode) return;
  state.demoT += dt;

  const phase = DEMO_SCRIPT[demoPhase];
  demoPhaseT += dt;
  const pct = Math.min(1, demoPhaseT / phase[0]);
  const next = DEMO_SCRIPT[(demoPhase + 1) % DEMO_SCRIPT.length];

  state.targetSpeed = phase[1] + (next[1] - phase[1]) * easeInOut(pct);
  state.gForceX     = phase[2] + (next[2] - phase[2]) * easeInOut(pct);
  state.gForceY     = phase[3] + (next[3] - phase[3]) * easeInOut(pct);

  if (demoPhaseT >= phase[0]) {
    demoPhaseT = 0;
    demoPhase = (demoPhase + 1) % DEMO_SCRIPT.length;
  }

  // Steer wheel
  const steerDeg = state.gForceX * 30;
  dom.swSvg.style.transform = `rotate(${steerDeg}deg)`;
  // Counter-rotate binnacle (very subtle)
  dom.binnacle.style.transform = `rotate(${-steerDeg * 0.02}deg)`;
}

function easeInOut(t) { return t < 0.5 ? 2*t*t : -1+(4-2*t)*t; }

// ─── PHYSICS SIMULATION ───────────────────────────────────────────────────────

const PHYSICS = {
  speedLag:   0.04,   // approach speed at this rate per frame
  powerLag:   0.06,
};

function updatePhysics(dt) {
  const dtS = dt / 1000;

  // Speed approaches target
  const speedDiff = state.targetSpeed - state.speed;
  state.speed += speedDiff * Math.min(1, PHYSICS.speedLag * dt / 16);

  // Power: function of acceleration
  const accel = speedDiff;
  if (accel > 0) {
    state.targetPower = Math.min(100, accel * 5 + state.speed * 0.2);
    state.regenPct = 0;
  } else {
    state.targetPower = Math.max(0, -accel * 2);
    state.regenPct = Math.min(100, -accel * 8);
  }
  state.power += (state.targetPower - state.power) * 0.1;

  // Torque
  state.torquePct = state.power * 0.9 + Math.random() * 2;

  // Battery drain (very slow)
  if (state.speed > 0) {
    state.battery -= state.power * 0.00001 * dtS;
    state.battery  = Math.max(0, state.battery);
    state.rangekm  = state.battery * 4.67;
  }

  // Tyre pressure subtle variation
  state.tyrePressure = 2.4 + (state.speed / 320) * 0.15 + Math.sin(Date.now() / 8000) * 0.02;
  // Temp
  state.tempC = 28 + state.power * 0.35 + Math.sin(Date.now() / 15000) * 3;
}

// ─── MAIN LOOP ────────────────────────────────────────────────────────────────

function mainLoop(timestamp) {
  const dt = Math.min(50, timestamp - (state.lastFrame || timestamp));
  state.lastFrame = timestamp;

  updateDemo(dt);
  updatePhysics(dt);
  // Update G-force spring before gauge render so ball position is ready
  const targetBx = 110 + state.gForceX * 28;
  const targetBy = 110 - state.gForceY * 28;
  updateGBallSpring(targetBx, targetBy, dt);
  updateGauges();
  updateMultigraph();

  requestAnimationFrame(mainLoop);
}

// ─── MANETTINO ────────────────────────────────────────────────────────────────

const MANETTINO_KNOB_DEGS = [-60, -30, 0, 30, 60];
const E_MANETTINO_DEGS    = [-30, 0, 30];

function updateManettino() {
  const idx = state.manettinoIdx;
  dom.manettinoKnob.style.transform = `rotate(${MANETTINO_KNOB_DEGS[idx]}deg)`;
  // Update active position labels
  document.querySelectorAll('#manettino .rp').forEach((el, i) => {
    el.classList.toggle('active', i === idx);
  });
  applyModeColor();
}

function updateEManettino() {
  const idx = state.eManettinoIdx;
  dom.eManettinoKnob.style.transform = `rotate(${E_MANETTINO_DEGS[idx]}deg)`;
  document.querySelectorAll('#eManettino .rp').forEach((el, i) => {
    el.classList.toggle('active', i === idx);
  });
}

// ─── DRIVE SELECTOR ───────────────────────────────────────────────────────────

function setDrive(pos) {
  state.drive = pos;
  ['P','R','N','D'].forEach(p => {
    dom['ds' + p].classList.toggle('active', p === pos);
  });
  // Move knob
  const gateOrder = ['P','R','N','D'];
  const idx = gateOrder.indexOf(pos);
  const pct = idx / 3; // 0–1
  // knob travels 0 → 28px within 40px height minus knob
  dom.dsSelectorKnob.style.transform = `translateY(${pct * 28}px)`;

  if (pos === 'P') state.targetSpeed = 0;
}

// ─── LAUNCH CONTROL ───────────────────────────────────────────────────────────

function activateLaunch() {
  if (state.launchActive) return;
  state.launchActive = true;
  dom.launchOverlay.classList.add('active');
  dom.lcoCount.textContent = 'READY';
  dom.lcoCount.style.color = 'var(--red-bright)';

  // 3-second countdown
  let count = 3;
  dom.lcoCount.textContent = count;
  const interval = setInterval(() => {
    count--;
    if (count > 0) {
      dom.lcoCount.textContent = count;
    } else {
      clearInterval(interval);
      dom.lcoCount.textContent = 'GO';
      dom.lcoCount.style.color = '#FFF200';
      // Launch!
      state.targetSpeed = 260;
      setTimeout(() => {
        dom.launchOverlay.classList.remove('active');
        state.launchActive = false;
      }, 800);
    }
  }, 1000);
}

// ─── KEYBOARD INPUT ───────────────────────────────────────────────────────────

const SPEED_STEP   = 10;
const SPEED_MAX    = 320;

document.addEventListener('keydown', e => {
  if (!state.keyInserted) {
    if (e.key === 'Enter' || e.key === ' ') startupCeremony();
    return;
  }
  switch (e.key) {
    case 'ArrowUp':
      e.preventDefault();
      state.targetSpeed = Math.min(SPEED_MAX, state.targetSpeed + SPEED_STEP);
      flashPaddle('right');
      break;
    case 'ArrowDown':
      e.preventDefault();
      state.targetSpeed = Math.max(0, state.targetSpeed - SPEED_STEP);
      flashPaddle('left');
      break;
    case 'ArrowLeft':
      e.preventDefault();
      state.gForceX = Math.max(-2, state.gForceX - 0.3);
      dom.swSvg.style.transform = `rotate(${state.gForceX * 30}deg)`;
      break;
    case 'ArrowRight':
      e.preventDefault();
      state.gForceX = Math.min(2, state.gForceX + 0.3);
      dom.swSvg.style.transform = `rotate(${state.gForceX * 30}deg)`;
      break;
    case 'm': case 'M':
      // M cycles e-Manettino (3-position, acceptable for keyboard)
      // Manettino (5-position) requires drag gesture — no keyboard shortcut
      state.eManettinoIdx = (state.eManettinoIdx + 1) % 3;
      updateEManettino();
      break;
    case ' ':
      e.preventDefault();
      state.demoMode = !state.demoMode;
      if (!state.demoMode) {
        state.targetSpeed = 0;
        state.gForceX = 0;
        state.gForceY = 0;
        dom.swSvg.style.transform = 'rotate(0deg)';
        demoPhase = 0; demoPhaseT = 0;
      }
      break;
    case 'l': case 'L':
      activateLaunch();
      break;
    case 't': case 'T':
      toggleBinnElemVis('torque-meter');
      break;
    case ',':
      // Left turn signal
      toggleSignal('left');
      break;
    case '.':
      toggleSignal('right');
      break;
    case 'p': case 'P':
      setDrive('P'); break;
    case 'r': case 'R':
      setDrive('R'); break;
    case 'n': case 'N':
      setDrive('N'); break;
    case 'd': case 'D':
      setDrive('D'); break;
    case 'Escape':
      if (selectedBinnId) { deselectBinnElem(); break; }
      if (binnElemPanelOpen) { closeBinnElemPanel(); break; }
      dom.launchOverlay.classList.remove('active');
      state.launchActive = false;
      break;
  }
});

// Decay gForceX when no key held
document.addEventListener('keyup', e => {
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    // decay handled in physics
  }
});

// Auto-decay lateral G when not pressing
setInterval(() => {
  if (!state.demoMode) {
    state.gForceX *= 0.85;
    if (Math.abs(state.gForceX) < 0.01) state.gForceX = 0;
    dom.swSvg.style.transform = `rotate(${state.gForceX * 30}deg)`;
  }
}, 50);

// ─── SIGNALS ──────────────────────────────────────────────────────────────────

let signalTimers = {};
function toggleSignal(side) {
  if (signalTimers[side]) {
    clearTimeout(signalTimers[side]);
    delete signalTimers[side];
    const el = side === 'left' ? dom.signalLeft : dom.signalRight;
    el.classList.remove('blink');
  } else {
    const el = side === 'left' ? dom.signalLeft : dom.signalRight;
    el.classList.add('blink');
    signalTimers[side] = setTimeout(() => {
      el.classList.remove('blink');
      delete signalTimers[side];
    }, 6000);
  }
}

// ─── PADDLE FLASH ─────────────────────────────────────────────────────────────

function flashPaddle(side) {
  const el = side === 'left' ? dom.paddleLeft : dom.paddleRight;
  const cls = side === 'left' ? 'flash-regen' : 'flash-torque';
  el.classList.remove(cls);
  void el.offsetWidth; // reflow
  el.classList.add(cls);
  setTimeout(() => el.classList.remove(cls), 300);
}

// ─── CLICK INTERACTIONS ───────────────────────────────────────────────────────

dom.glassKeyRest.addEventListener('click', startupCeremony);

dom.rightDialMode.addEventListener('click', () => {
  state.rightDialIdx = (state.rightDialIdx + 1) % RIGHT_DIAL_MODES.length;
});

dom.mgModeBtn.addEventListener('click', () => {
  state.mgModeIdx = (state.mgModeIdx + 1) % MG_MODES.length;
  updateMultigraph();
});

// Drive position clicks
['P','R','N','D'].forEach(p => {
  dom['ds' + p].addEventListener('click', () => setDrive(p));
});

// Manettino: drag-rotary only — no click-to-cycle (drag handler defined in initManettinoDrag)
// e-Manettino: click is acceptable for 3-position selector
dom.eManettino.addEventListener('click', () => {
  state.eManettinoIdx = (state.eManettinoIdx + 1) % 3;
  updateEManettino();
});

// Launch handle
dom.launchHandle.addEventListener('click', activateLaunch);

// Overhead toggles
dom.toggleSwitches.forEach(sw => {
  sw.addEventListener('click', () => sw.classList.toggle('active'));
});

// Center screen tabs
document.querySelectorAll('.cs-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.cs-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
  });
});

// Paddle SVG click
dom.paddleLeft.addEventListener('click', () => {
  state.targetSpeed = Math.max(0, state.targetSpeed - SPEED_STEP);
  flashPaddle('left');
});
dom.paddleRight.addEventListener('click', () => {
  state.targetSpeed = Math.min(SPEED_MAX, state.targetSpeed + SPEED_STEP);
  flashPaddle('right');
});

// ─── TOUCH / DRAG on steering wheel ──────────────────────────────────────────

let swDragging = false, swStartX = 0, swStartAngle = 0;
dom.steeringWheel.addEventListener('mousedown', e => {
  swDragging = true;
  swStartX = e.clientX;
  swStartAngle = state.gForceX * 30;
});
window.addEventListener('mousemove', e => {
  if (!swDragging) return;
  const dx = e.clientX - swStartX;
  const newAngle = Math.max(-90, Math.min(90, swStartAngle + dx * 0.5));
  state.gForceX = newAngle / 30;
  dom.swSvg.style.transform = `rotate(${newAngle}deg)`;
});
window.addEventListener('mouseup', () => { swDragging = false; });

// ─── DESIGN SPEC TOOLTIPS (subtle) ───────────────────────────────────────────
// Each interactive element gets a data-spec attribute shown on long hover

const SPECS = {
  'dial-left':    'Power Output · 0–610 kW · 40 major ticks · sweep 225°',
  'dial-center':  'Velocità · 0–320 km/h · Rajdhani 58pt 200wt · spring needle',
  'dial-right':   'Configurable · 7 modes · click ⟳ to cycle',
  'eManettino':   'e-Manettino · 3-pos ECO / BAL / PWR',
  'manettino':    'Manettino · 5-pos · RNG TUR SPT DRY PRF',
  'multigraph':   'Multigraph · CLOCK CHRONO COMPASS LAUNCH',
  'launchHandle': 'Launch Control · Pull handle or press L',
};

// ─── MANETTINO DRAG-ROTARY ────────────────────────────────────────────────────
// Drag gesture on the right pod rotary — the only way to change mode
// No keyboard shortcut for the 5-position Manettino (Grand Review mandate)

(function initManettinoDrag() {
  const pod      = dom.manettino;
  const knob     = dom.manettinoKnob;
  const DETENTS  = MANETTINO_KNOB_DEGS;    // [-60, -30, 0, 30, 60]
  let   dragging = false;
  let   startAngle = 0;
  let   startIdx  = 0;

  function getPodAngle(e) {
    const rect = knob.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top  + rect.height / 2;
    return Math.atan2(e.clientY - cy, e.clientX - cx) * 180 / Math.PI;
  }

  pod.addEventListener('mousedown', e => {
    dragging   = true;
    startAngle = getPodAngle(e);
    startIdx   = state.manettinoIdx;
    e.preventDefault();
  });
  window.addEventListener('mousemove', e => {
    if (!dragging) return;
    const delta = getPodAngle(e) - startAngle;
    // Every 30° of drag = one position step
    const steps = Math.round(delta / 30);
    const newIdx = Math.max(0, Math.min(DETENTS.length - 1, startIdx + steps));
    if (newIdx !== state.manettinoIdx) {
      state.manettinoIdx = newIdx;
      updateManettino();
    }
  });
  window.addEventListener('mouseup', () => { dragging = false; });
})();

// ─── CENTER DIAL PARALLAX ─────────────────────────────────────────────────────
// Mandatory per Grand Review: parallax on mousemove simulates convex glass depth

(function initParallax() {
  const centerContainer = document.querySelector('.dial-center');
  const centerBezel     = centerContainer && centerContainer.querySelector('.dial-bezel');
  if (!centerBezel) return;

  document.addEventListener('mousemove', e => {
    if (!state.keyInserted) return;
    const rect = centerContainer.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width  / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    const tiltX = Math.max(-3, Math.min(3, dy * 3));
    const tiltY = Math.max(-3, Math.min(3, dx * 3));
    centerBezel.style.transform =
      `perspective(500px) rotateX(${-tiltX}deg) rotateY(${tiltY}deg)`;
  });
})();

// ─── REST TOOLTIP ─────────────────────────────────────────────────────────────

(function initRestTooltip() {
  const tooltip = document.getElementById('restTooltip');
  if (!tooltip) return;
  setTimeout(() => {
    if (!state.keyInserted) tooltip.style.opacity = '1';
  }, 3000);
  setTimeout(() => {
    tooltip.style.opacity = '0';
  }, 7000);
})();

// ─── BINNACLE ELEMENT SYSTEM ──────────────────────────────────────────────────

const BINN_ELEMS = [
  { group: 'BINNACLE', items: [
    { id: 'dial-left',    label: 'Energy Output',   sel: '.dial-left',     canHide: true  },
    { id: 'dial-center',  label: 'Speedometer',     sel: '.dial-center',   canHide: false },
    { id: 'torque-meter', label: 'Torque Meter',    sel: '#torqueMeter',   canHide: true  },
    { id: 'dial-right',   label: 'Driver Display',  sel: '.dial-right',    canHide: true  },
  ]},
  { group: 'STEERING', items: [
    { id: 'steering',   label: 'Steering Wheel',   sel: '.steering-wheel-zone',  canHide: true  },
    { id: 'e-manet',    label: 'e-Manettino',      sel: '#eManettino',           canHide: true  },
    { id: 'manettino',  label: 'Manettino',        sel: '#manettino',            canHide: true  },
  ]},
  { group: 'INSTRUMENTS', items: [
    { id: 'multigraph', label: 'Multigraph',       sel: '.multigraph',           canHide: true  },
    { id: 'drive',      label: 'Drive Selector',   sel: '.drive-selector',       canHide: false },
    { id: 'glasskey',   label: 'Glass Key',        sel: '.glass-key-slot',       canHide: true  },
  ]},
  { group: 'INTERFACE', items: [
    { id: 'overhead',   label: 'Overhead Console', sel: '.overhead-console',     canHide: true  },
    { id: 'launch',     label: 'Launch Handle',    sel: '.launch-handle-zone',   canHide: true  },
    { id: 'centerscr',  label: 'Center Screen',    sel: '.center-screen-zone',   canHide: true  },
    { id: 'warnings',   label: 'Warning Strip',    sel: '.warning-strip',        canHide: true  },
    { id: 'keyhints',   label: 'Key Hints',        sel: '.key-hints',            canHide: true  },
  ]},
  { group: 'OVERLAY', items: [
    { id: 'overlay-img', label: 'Overlay Image',   sel: '.cockpit-ref-overlay',  canHide: true  },
  ]},
];

const binnVis = {};
BINN_ELEMS.forEach(g => g.items.forEach(it => { binnVis[it.id] = true; }));
binnVis['torque-meter'] = false;
binnVis['overlay-img'] = false;

let selectedBinnId = null;
let binnElemPanelOpen = false;

function getBinnElemDom(id) {
  for (const g of BINN_ELEMS) {
    const item = g.items.find(i => i.id === id);
    if (item) return document.querySelector(item.sel);
  }
  return null;
}

function getBinnElemLabel(id) {
  for (const g of BINN_ELEMS) {
    const item = g.items.find(i => i.id === id);
    if (item) return item.label;
  }
  return id;
}

function getBinnElemStatus(id) {
  switch (id) {
    case 'dial-right': return RIGHT_DIAL_MODES[state.rightDialIdx];
    case 'multigraph': return MG_MODES[state.mgModeIdx];
    case 'drive':      return state.drive;
    case 'manettino':  return MANETTINO_MODES[state.manettinoIdx].toUpperCase().slice(0, 4);
    case 'e-manet':    return E_MANETTINO_LABELS[state.eManettinoIdx];
    default:           return '';
  }
}

function renderBinnElemPanel() {
  const body = document.getElementById('bepBody');
  if (!body) return;
  let html = '';
  BINN_ELEMS.forEach(group => {
    html += `<div class="bep-group">${group.group}</div>`;
    group.items.forEach(item => {
      const vis  = binnVis[item.id];
      const sel  = selectedBinnId === item.id;
      const stat = getBinnElemStatus(item.id);
      html += `<div class="bep-item${sel ? ' bep-sel' : ''}" data-id="${item.id}" onclick="selectBinnElem('${item.id}')">
        <input type="checkbox" class="bep-check" ${vis ? 'checked' : ''} ${!item.canHide ? 'disabled title="Core element"' : ''}
          onclick="event.stopPropagation();toggleBinnElemVis('${item.id}')">
        <span class="bep-lbl">${item.label}</span>
        ${stat ? `<span class="bep-status">${stat}</span>` : ''}
      </div>`;
    });
  });
  body.innerHTML = html;
}

function toggleBinnElemPanel() {
  if (!state.keyInserted) return;
  binnElemPanelOpen = !binnElemPanelOpen;
  document.getElementById('binnElemPanel').classList.toggle('open', binnElemPanelOpen);
  document.getElementById('binnElemBtn').classList.toggle('active', binnElemPanelOpen);
  if (binnElemPanelOpen) renderBinnElemPanel();
  else deselectBinnElem();
}

function closeBinnElemPanel() {
  binnElemPanelOpen = false;
  document.getElementById('binnElemPanel').classList.remove('open');
  document.getElementById('binnElemBtn').classList.remove('active');
  deselectBinnElem();
}

function selectBinnElem(id) {
  if (selectedBinnId) {
    const prev = getBinnElemDom(selectedBinnId);
    if (prev) prev.classList.remove('binn-sel');
  }
  selectedBinnId = id;
  const el = getBinnElemDom(id);
  if (el) el.classList.add('binn-sel');
  renderBinnElemPanel();
  renderBinnConfigStrip(id);
  document.getElementById('binnCfgStrip').classList.add('open');
}

function deselectBinnElem() {
  if (selectedBinnId) {
    const el = getBinnElemDom(selectedBinnId);
    if (el) el.classList.remove('binn-sel');
    selectedBinnId = null;
  }
  document.getElementById('binnCfgStrip').classList.remove('open');
  if (binnElemPanelOpen) renderBinnElemPanel();
}

function toggleBinnElemVis(id) {
  binnVis[id] = !binnVis[id];
  const el = getBinnElemDom(id);
  if (el) el.classList.toggle('binn-hidden', !binnVis[id]);
  renderBinnElemPanel();
}

function renderBinnConfigStrip(id) {
  document.getElementById('bcsLabel').textContent = getBinnElemLabel(id).toUpperCase();
  let html = '';

  switch (id) {
    case 'dial-right':
      html = RIGHT_DIAL_MODES.map((m, i) =>
        `<button class="cfg-btn${i === state.rightDialIdx ? ' cfg-active' : ''}" data-act="rd" data-i="${i}">${m}</button>`
      ).join('');
      break;
    case 'e-manet':
      html = E_MANETTINO_LABELS.map((m, i) =>
        `<button class="cfg-btn${i === state.eManettinoIdx ? ' cfg-active' : ''}" data-act="em" data-i="${i}">${m}</button>`
      ).join('');
      break;
    case 'manettino':
      html = MANETTINO_MODES.map((m, i) =>
        `<button class="cfg-btn${i === state.manettinoIdx ? ' cfg-active' : ''}" data-act="ma" data-i="${i}">${m.toUpperCase()}</button>`
      ).join('');
      break;
    case 'multigraph':
      html = MG_MODES.map((m, i) =>
        `<button class="cfg-btn${i === state.mgModeIdx ? ' cfg-active' : ''}" data-act="mg" data-i="${i}">${m}</button>`
      ).join('');
      break;
    case 'drive':
      html = ['P','R','N','D'].map(p =>
        `<button class="cfg-btn${state.drive === p ? ' cfg-active' : ''}" data-act="drive" data-pos="${p}">${p}</button>`
      ).join('');
      break;
    case 'overhead': {
      const switches = Array.from(dom.toggleSwitches);
      html = switches.map(sw => {
        const on = sw.classList.contains('active');
        return `<button class="cfg-btn${on ? ' cfg-active' : ''}" data-act="sw" data-lbl="${sw.dataset.label}">${sw.dataset.label}</button>`;
      }).join('');
      break;
    }
    case 'launch':
      html = `<button class="cfg-btn cfg-primary" data-act="launch">ARM LAUNCH CONTROL</button>`;
      break;
    case 'centerscr': {
      const activeTab = document.querySelector('.cs-tab.active')?.textContent?.trim() || 'NAV';
      html = ['NAV','AUDIO','CAR'].map(t =>
        `<button class="cfg-btn${t === activeTab ? ' cfg-active' : ''}" data-act="cstab" data-tab="${t}">${t}</button>`
      ).join('');
      break;
    }
    case 'keyhints': {
      const on = !dom.keyHints.classList.contains('binn-hidden') && binnVis['keyhints'];
      html = `<button class="cfg-btn${on ? ' cfg-active' : ''}" data-act="hints">HINTS ${on ? 'ON' : 'OFF'}</button>`;
      break;
    }
    case 'warnings': {
      const batW  = state.battery < 15;
      const tmpW  = state.tempC > 55;
      const tracW = state.speed > 60 && Math.abs(state.gForceX) > 1.2;
      html = `<span class="cfg-status${batW  ? ' cfg-warn' : ''}">⚡ CHARGE LOW${batW  ? ' !' : ''}</span>
              <span class="cfg-status${tmpW  ? ' cfg-warn' : ''}">⬆ BAT TEMP${tmpW   ? ' !' : ''}</span>
              <span class="cfg-status${tracW ? ' cfg-warn' : ''}">◈ TRAC ACT${tracW  ? ' !' : ''}</span>`;
      break;
    }
    case 'glasskey':
      html = `<span class="cfg-status">${state.keyInserted ? 'INSERTED · ACTIVE' : 'NOT INSERTED'}</span>`;
      break;
    case 'steering':
      html = `<span class="cfg-status">ANGLE ${Math.round(state.gForceX * 30)}°</span>
              <span class="cfg-status">LATERAL G ${state.gForceX.toFixed(2)}</span>`;
      break;
    case 'dial-left':
      html = `<span class="cfg-status">POWER kW · 0–610</span>
              <span class="cfg-status">40 TICKS · 225° SWEEP</span>`;
      break;
    case 'dial-center':
      html = `<span class="cfg-status">0–320 km/h</span>
              <span class="cfg-status">BATTERY ARC ${Math.round(state.battery)}%</span>`;
      break;
    case 'torque-meter':
      html = `<span class="cfg-status">${Math.round(state.torquePct * 8.45)} Nm</span>
              <span class="cfg-status">${TM_N} SEGS · 136° ARC</span>`;
      break;
    case 'overlay-img': {
      const ov = document.getElementById('cockpitOverlay');
      const cur = Math.round(parseFloat(ov.style.opacity || 0.5) * 100);
      html = `<span class="cfg-status">OPACITY</span>
              <button class="cfg-btn" data-act="ov-opa" data-v="0.25">25%</button>
              <button class="cfg-btn${cur===50?' cfg-active':''}" data-act="ov-opa" data-v="0.5">50%</button>
              <button class="cfg-btn${cur===75?' cfg-active':''}" data-act="ov-opa" data-v="0.75">75%</button>
              <button class="cfg-btn${cur===100?' cfg-active':''}" data-act="ov-opa" data-v="1">100%</button>`;
      break;
    }
    default:
      html = `<span class="cfg-status">${getBinnElemLabel(id)}</span>`;
  }

  const ctrl = document.getElementById('bcsControls');
  ctrl.innerHTML = html;
  ctrl.onclick = e => {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    handleBinnCfgAction(btn.dataset.act, btn.dataset);
  };
}

function handleBinnCfgAction(act, data) {
  switch (act) {
    case 'rd':
      state.rightDialIdx = +data.i;
      renderBinnConfigStrip('dial-right');
      renderBinnElemPanel();
      break;
    case 'em':
      state.eManettinoIdx = +data.i;
      updateEManettino();
      renderBinnConfigStrip('e-manet');
      renderBinnElemPanel();
      break;
    case 'ma':
      state.manettinoIdx = +data.i;
      updateManettino();
      renderBinnConfigStrip('manettino');
      renderBinnElemPanel();
      break;
    case 'mg':
      state.mgModeIdx = +data.i;
      dom.mgModeLabel.textContent = MG_MODES[state.mgModeIdx];
      updateMultigraph();
      renderBinnConfigStrip('multigraph');
      renderBinnElemPanel();
      break;
    case 'drive':
      setDrive(data.pos);
      renderBinnConfigStrip('drive');
      renderBinnElemPanel();
      break;
    case 'sw': {
      const sw = Array.from(dom.toggleSwitches).find(s => s.dataset.label === data.lbl);
      if (sw) sw.classList.toggle('active');
      renderBinnConfigStrip('overhead');
      break;
    }
    case 'launch':
      activateLaunch();
      break;
    case 'cstab':
      document.querySelectorAll('.cs-tab').forEach(t =>
        t.classList.toggle('active', t.textContent.trim() === data.tab)
      );
      renderBinnConfigStrip('centerscr');
      break;
    case 'hints':
      toggleBinnElemVis('keyhints');
      renderBinnConfigStrip('keyhints');
      break;
    case 'ov-opa': {
      const ov = document.getElementById('cockpitOverlay');
      ov.style.opacity = data.v;
      renderBinnConfigStrip('overlay-img');
      break;
    }
  }
}

// Ctrl+click on cockpit elements to select when panel is open
dom.cockpit.addEventListener('click', e => {
  if (!binnElemPanelOpen) return;
  if (!e.ctrlKey && !e.metaKey) return;
  const target = e.target.closest('[data-binn-id]');
  if (!target) return;
  e.preventDefault();
  e.stopPropagation();
  selectBinnElem(target.dataset.binnId);
}, true);

// ─── INIT ─────────────────────────────────────────────────────────────────────

// Set initial Manettino to Sport (index 3) matching HTML default
state.manettinoIdx = 3;
updateManettino();
updateEManettino();
setDrive('D');
