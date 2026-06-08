// ══════════════════════════════════════════════════════════════
//  Ornithopter PID Flight Simulator — script.js
//  Physics engine + Complementary Filter + PID + Canvas render
// ══════════════════════════════════════════════════════════════

// ── State ─────────────────────────────────────────────────────
const state = {
  // PID gains
  Kp: 1.2, Ki: 0.05, Kd: 0.5,
  // Setpoint
  targetPitch: 0,
  // Actual state
  currentPitch: 0,
  pitchVelocity: 0,       // °/s
  // PID internals
  integral: 0,
  previousError: 0,
  pidOutput: 0,
  // Terms (for telemetry display)
  pTerm: 0, iTerm: 0, dTerm: 0,
  // Servo output
  servoAngle: 90,
  // Throttle
  throttle: 60,
  // Flap animation
  flapPhase: 0,
  // Gust
  gustActive: false,
  gustMagnitude: 0,
  // History for graph
  history: [],
  maxHistory: 300,
  // Timing
  lastTime: null,
  t: 0,
};

// ── Canvas Setup ──────────────────────────────────────────────
const oc  = document.getElementById('ornithopterCanvas');
const gc  = document.getElementById('graphCanvas');
const octx = oc.getContext('2d');
const gctx = gc.getContext('2d');

// ── UI Element References ─────────────────────────────────────
const inputs = {
  kp: document.getElementById('kp'),
  ki: document.getElementById('ki'),
  kd: document.getElementById('kd'),
  targetPitch: document.getElementById('targetPitch'),
  throttle: document.getElementById('throttle'),
};
const displays = {
  kpVal:      document.getElementById('kpVal'),
  kiVal:      document.getElementById('kiVal'),
  kdVal:      document.getElementById('kdVal'),
  targetVal:  document.getElementById('targetVal'),
  throttleVal:document.getElementById('throttleVal'),
  targetLabel:document.getElementById('targetLabel'),
  actualLabel:document.getElementById('actualLabel'),
  flapFill:   document.getElementById('flapFill'),
  flapHz:     document.getElementById('flapHz'),
  tError:     document.getElementById('t-error'),
  tP:         document.getElementById('t-p'),
  tI:         document.getElementById('t-i'),
  tD:         document.getElementById('t-d'),
  tPid:       document.getElementById('t-pid'),
  tServo:     document.getElementById('t-servo'),
};

// ── Bind UI Inputs ────────────────────────────────────────────
inputs.kp.addEventListener('input', () => {
  state.Kp = parseFloat(inputs.kp.value);
  displays.kpVal.textContent = state.Kp.toFixed(2);
});
inputs.ki.addEventListener('input', () => {
  state.Ki = parseFloat(inputs.ki.value);
  displays.kiVal.textContent = state.Ki.toFixed(3);
});
inputs.kd.addEventListener('input', () => {
  state.Kd = parseFloat(inputs.kd.value);
  displays.kdVal.textContent = state.Kd.toFixed(2);
});
inputs.targetPitch.addEventListener('input', () => {
  state.targetPitch = parseFloat(inputs.targetPitch.value);
  displays.targetVal.textContent = state.targetPitch + '°';
});
inputs.throttle.addEventListener('input', () => {
  state.throttle = parseFloat(inputs.throttle.value);
  displays.throttleVal.textContent = state.throttle + '%';
});

// ── Physics Update (dt in seconds) ───────────────────────────
function updatePhysics(dt) {
  // Clamp dt to prevent instability on tab focus
  dt = Math.min(dt, 0.05);
  state.t += dt;

  // ── Gust dynamics ────────────────────────────────────────
  if (state.gustActive) {
    state.gustMagnitude *= 0.92;
    if (Math.abs(state.gustMagnitude) < 0.05) {
      state.gustActive = false;
      state.gustMagnitude = 0;
    }
  }

  // ── PID calculation ───────────────────────────────────────
  const error     = state.targetPitch - state.currentPitch;
  state.integral += error * dt;
  state.integral  = Math.max(-20, Math.min(20, state.integral)); // anti-windup
  const derivative = (error - state.previousError) / dt;

  state.pTerm     = state.Kp * error;
  state.iTerm     = state.Ki * state.integral;
  state.dTerm     = state.Kd * derivative;
  state.pidOutput = state.pTerm + state.iTerm + state.dTerm;
  state.pidOutput = Math.max(-45, Math.min(45, state.pidOutput));

  state.previousError = error;

  // ── Servo angle ───────────────────────────────────────────
  state.servoAngle = Math.max(45, Math.min(135, 90 + state.pidOutput));

  // ── Simplified pitch dynamics (2nd order) ─────────────────
  // Elevator effectiveness: maps servo deflection to pitch torque
  const elevatorDeflection = state.servoAngle - 90;            // -45 to +45
  const elevatorTorque     = elevatorDeflection * 1.8;         // deg/s² per deg deflection
  const dampingTorque      = -state.pitchVelocity * 2.5;       // aerodynamic damping
  const gravityTorque      = -state.currentPitch * 0.4;        // passive stability
  const flapDisturbance    = Math.sin(state.flapPhase) * 0.3 * (state.throttle / 100);
  const gustTorque         = state.gustMagnitude;

  const totalTorque = elevatorTorque + dampingTorque + gravityTorque
                    + flapDisturbance + gustTorque;

  state.pitchVelocity += totalTorque * dt;
  state.pitchVelocity  = Math.max(-60, Math.min(60, state.pitchVelocity));
  state.currentPitch  += state.pitchVelocity * dt;
  state.currentPitch   = Math.max(-50, Math.min(50, state.currentPitch));

  // ── Flap animation phase ──────────────────────────────────
  const flapHz = 1.5 + (state.throttle / 100) * 4.0;          // 1.5–5.5 Hz
  state.flapPhase += 2 * Math.PI * flapHz * dt;

  // ── Store history ─────────────────────────────────────────
  state.history.push({
    t:      state.t,
    actual: state.currentPitch,
    target: state.targetPitch,
    error:  error,
  });
  if (state.history.length > state.maxHistory) state.history.shift();

  return { error, flapHz };
}

// ── Draw Ornithopter ──────────────────────────────────────────
function drawOrnithopter(ctx, cx, cy, pitchAngle, flapPhase, throttle, servoAngle) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((pitchAngle * Math.PI) / 180);

  const flapAngle = Math.sin(flapPhase) * 28 * (throttle / 100);

  // Body
  ctx.save();
  const bodyGrad = ctx.createLinearGradient(-40, -8, 40, 8);
  bodyGrad.addColorStop(0, '#1a3a6e');
  bodyGrad.addColorStop(0.5, '#2a5aae');
  bodyGrad.addColorStop(1, '#1a3a6e');
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, 42, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#4a8aee';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  // Nose cone
  ctx.save();
  ctx.fillStyle = '#3a6aae';
  ctx.beginPath();
  ctx.moveTo(42, 0);
  ctx.lineTo(58, 0);
  ctx.lineTo(42, -5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Left wing (flapping up/down)
  ctx.save();
  ctx.rotate((-flapAngle * Math.PI) / 180);
  const wGradL = ctx.createLinearGradient(0, 0, -70, -30);
  wGradL.addColorStop(0, 'rgba(0,180,255,0.85)');
  wGradL.addColorStop(1, 'rgba(0,80,180,0.4)');
  ctx.fillStyle = wGradL;
  ctx.beginPath();
  ctx.moveTo(-15, -5);
  ctx.lineTo(-80, -35);
  ctx.lineTo(-70, -10);
  ctx.lineTo(-10, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,210,255,0.6)';
  ctx.lineWidth = 0.8;
  ctx.stroke();
  // Wing spar
  ctx.strokeStyle = 'rgba(0,210,255,0.9)';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(-10, -2); ctx.lineTo(-78, -33); ctx.stroke();
  ctx.restore();

  // Right wing
  ctx.save();
  ctx.rotate((flapAngle * Math.PI) / 180);
  const wGradR = ctx.createLinearGradient(0, 0, -70, 30);
  wGradR.addColorStop(0, 'rgba(0,180,255,0.85)');
  wGradR.addColorStop(1, 'rgba(0,80,180,0.4)');
  ctx.fillStyle = wGradR;
  ctx.beginPath();
  ctx.moveTo(-15, 5);
  ctx.lineTo(-80, 35);
  ctx.lineTo(-70, 10);
  ctx.lineTo(-10, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,210,255,0.6)';
  ctx.lineWidth = 0.8;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(0,210,255,0.9)';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(-10, 2); ctx.lineTo(-78, 33); ctx.stroke();
  ctx.restore();

  // Tail assembly
  ctx.save();
  ctx.translate(-42, 0);
  // Elevator (controlled by servoAngle)
  const elevDefl = (servoAngle - 90) * 0.5; // scale visually
  ctx.rotate((elevDefl * Math.PI) / 180);
  ctx.fillStyle = 'rgba(255,140,50,0.8)';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-22, -12);
  ctx.lineTo(-18, -4);
  ctx.lineTo(0, -2);
  ctx.closePath();
  ctx.fill();
  // Rudder
  ctx.fillStyle = 'rgba(255,100,50,0.8)';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-22, 12);
  ctx.lineTo(-18, 4);
  ctx.lineTo(0, 2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Gearbox indicator (glowing dot at centre)
  ctx.save();
  const glow = ctx.createRadialGradient(0, 0, 1, 0, 0, 10);
  glow.addColorStop(0, 'rgba(255,200,0,0.9)');
  glow.addColorStop(1, 'rgba(255,100,0,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.restore();
}

// ── Draw Ornithopter Canvas ───────────────────────────────────
function renderOrnithopter() {
  const W = oc.width, H = oc.height;
  octx.clearRect(0, 0, W, H);

  // Sky gradient
  const sky = octx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#0d1f3c');
  sky.addColorStop(1, '#0a1628');
  octx.fillStyle = sky;
  octx.fillRect(0, 0, W, H);

  // Horizon line
  octx.save();
  octx.strokeStyle = 'rgba(0,180,255,0.15)';
  octx.lineWidth = 1;
  octx.setLineDash([4, 8]);
  octx.beginPath();
  octx.moveTo(0, H / 2); octx.lineTo(W, H / 2);
  octx.stroke();
  octx.setLineDash([]);
  octx.restore();

  // Pitch angle indicator (horizon tilt bar)
  octx.save();
  octx.translate(W / 2, H / 2);
  octx.rotate((-state.currentPitch * Math.PI) / 180);
  octx.strokeStyle = 'rgba(255,200,50,0.3)';
  octx.lineWidth = 1;
  octx.beginPath();
  octx.moveTo(-200, 0); octx.lineTo(200, 0);
  octx.stroke();
  octx.restore();

  // Ground "horizon" label
  octx.fillStyle = 'rgba(100,150,200,0.4)';
  octx.font = '10px monospace';
  octx.fillText('HORIZON', W / 2 - 25, H / 2 + 14);

  // Draw ornithopter
  const flapHz = 1.5 + (state.throttle / 100) * 4.0;
  drawOrnithopter(octx, W / 2 + 80, H / 2, state.currentPitch, state.flapPhase, state.throttle, state.servoAngle);

  // PID correction arrow
  if (Math.abs(state.pidOutput) > 1) {
    const dir = state.pidOutput > 0 ? 1 : -1;
    const arrowLen = Math.min(Math.abs(state.pidOutput) * 1.2, 40);
    octx.save();
    octx.translate(W / 2 + 80, H / 2);
    octx.strokeStyle = dir > 0 ? 'rgba(255,107,53,0.8)' : 'rgba(0,212,255,0.8)';
    octx.lineWidth = 2;
    octx.beginPath();
    octx.moveTo(0, 0);
    octx.lineTo(0, -dir * arrowLen);
    octx.stroke();
    octx.fillStyle = octx.strokeStyle;
    octx.beginPath();
    octx.moveTo(-5, -dir * arrowLen);
    octx.lineTo(5, -dir * arrowLen);
    octx.lineTo(0, -dir * (arrowLen + 8));
    octx.closePath();
    octx.fill();
    octx.restore();
  }

  // Labels
  displays.actualLabel.textContent = state.currentPitch.toFixed(1) + '°';
  displays.targetLabel.textContent = state.targetPitch.toFixed(0) + '°';
}

// ── Draw Response Graph ───────────────────────────────────────
function renderGraph() {
  const W = gc.width, H = gc.height;
  gctx.clearRect(0, 0, W, H);

  // Background
  gctx.fillStyle = '#0a0f1e';
  gctx.fillRect(0, 0, W, H);

  // Grid lines
  gctx.save();
  gctx.strokeStyle = 'rgba(40,60,100,0.8)';
  gctx.lineWidth = 1;
  for (let y = 0; y <= H; y += H / 4) {
    gctx.beginPath(); gctx.moveTo(0, y); gctx.lineTo(W, y); gctx.stroke();
  }
  for (let x = 0; x <= W; x += W / 6) {
    gctx.beginPath(); gctx.moveTo(x, 0); gctx.lineTo(x, H); gctx.stroke();
  }
  gctx.restore();

  // Zero line
  gctx.save();
  gctx.strokeStyle = 'rgba(100,140,200,0.5)';
  gctx.lineWidth = 1;
  gctx.setLineDash([6, 4]);
  gctx.beginPath(); gctx.moveTo(0, H / 2); gctx.lineTo(W, H / 2); gctx.stroke();
  gctx.setLineDash([]);
  gctx.restore();

  const h = state.history;
  if (h.length < 2) return;

  const scaleY = (val) => H / 2 - (val / 50) * (H / 2 - 10);
  const scaleX = (i)   => (i / (state.maxHistory - 1)) * W;

  // Draw target pitch line
  gctx.save();
  gctx.strokeStyle = '#ff6b35';
  gctx.lineWidth = 1.5;
  gctx.setLineDash([6, 3]);
  gctx.beginPath();
  h.forEach((p, i) => {
    if (i === 0) gctx.moveTo(scaleX(i), scaleY(p.target));
    else         gctx.lineTo(scaleX(i), scaleY(p.target));
  });
  gctx.stroke();
  gctx.setLineDash([]);
  gctx.restore();

  // Draw error line (thin red)
  gctx.save();
  gctx.strokeStyle = 'rgba(255,59,107,0.5)';
  gctx.lineWidth = 1;
  gctx.beginPath();
  h.forEach((p, i) => {
    if (i === 0) gctx.moveTo(scaleX(i), scaleY(p.error));
    else         gctx.lineTo(scaleX(i), scaleY(p.error));
  });
  gctx.stroke();
  gctx.restore();

  // Draw actual pitch line (with fill)
  const grad = gctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, 'rgba(0,212,255,0.25)');
  grad.addColorStop(1, 'rgba(0,212,255,0.02)');

  gctx.save();
  gctx.beginPath();
  h.forEach((p, i) => {
    if (i === 0) gctx.moveTo(scaleX(i), scaleY(p.actual));
    else         gctx.lineTo(scaleX(i), scaleY(p.actual));
  });
  gctx.lineTo(scaleX(h.length - 1), H / 2);
  gctx.lineTo(scaleX(0), H / 2);
  gctx.closePath();
  gctx.fillStyle = grad;
  gctx.fill();
  gctx.restore();

  gctx.save();
  gctx.strokeStyle = '#00d4ff';
  gctx.lineWidth = 2;
  gctx.shadowColor = '#00d4ff';
  gctx.shadowBlur = 4;
  gctx.beginPath();
  h.forEach((p, i) => {
    if (i === 0) gctx.moveTo(scaleX(i), scaleY(p.actual));
    else         gctx.lineTo(scaleX(i), scaleY(p.actual));
  });
  gctx.stroke();
  gctx.restore();

  // Axis labels
  gctx.fillStyle = 'rgba(100,140,200,0.6)';
  gctx.font = '10px monospace';
  gctx.fillText('+50°', 4, 14);
  gctx.fillText('  0°', 4, H / 2 + 4);
  gctx.fillText('-50°', 4, H - 4);
}

// ── Update Telemetry Display ──────────────────────────────────
function updateTelemetry(error, flapHz) {
  displays.tError.textContent = error.toFixed(2) + '°';
  displays.tP.textContent     = state.pTerm.toFixed(2);
  displays.tI.textContent     = state.iTerm.toFixed(3);
  displays.tD.textContent     = state.dTerm.toFixed(2);
  displays.tPid.textContent   = state.pidOutput.toFixed(2);
  displays.tServo.textContent = state.servoAngle.toFixed(0) + '°';

  const flapPct = ((flapHz - 1.5) / 4.0) * 100;
  displays.flapFill.style.width = flapPct + '%';
  displays.flapHz.textContent   = flapHz.toFixed(1) + ' Hz';
}

// ── Main Animation Loop ───────────────────────────────────────
function loop(timestamp) {
  if (state.lastTime === null) state.lastTime = timestamp;
  const dt = (timestamp - state.lastTime) / 1000;
  state.lastTime = timestamp;

  const { error, flapHz } = updatePhysics(dt);
  renderOrnithopter();
  renderGraph();
  updateTelemetry(error, flapHz);

  requestAnimationFrame(loop);
}

// ── Public Actions ────────────────────────────────────────────
function triggerGust() {
  state.gustActive    = true;
  state.gustMagnitude = (Math.random() > 0.5 ? 1 : -1) * (15 + Math.random() * 20);
}

function resetSim() {
  state.currentPitch   = 0;
  state.pitchVelocity  = 0;
  state.integral       = 0;
  state.previousError  = 0;
  state.pidOutput      = 0;
  state.gustActive     = false;
  state.gustMagnitude  = 0;
  state.history        = [];
  state.t              = 0;
}

function applyPreset(kp, ki, kd) {
  state.Kp = kp; state.Ki = ki; state.Kd = kd;
  inputs.kp.value = kp;
  inputs.ki.value = ki;
  inputs.kd.value = kd;
  displays.kpVal.textContent = kp.toFixed(2);
  displays.kiVal.textContent = ki.toFixed(3);
  displays.kdVal.textContent = kd.toFixed(2);
  resetSim();
}

// ── Start ─────────────────────────────────────────────────────
requestAnimationFrame(loop);
