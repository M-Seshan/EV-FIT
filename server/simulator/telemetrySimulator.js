/**
 * telemetrySimulator.js
 *
 * Generates realistic, gradually-changing EV telemetry so the prototype has a
 * live data source before real ESP32/OBD-II hardware exists.
 *
 * Design goals:
 *  - Values drift smoothly (no teleporting numbers) - each tick nudges the
 *    previous value toward a mode-specific target range instead of picking a
 *    fresh random number.
 *  - Output shape is IDENTICAL to what real hardware will POST to
 *    /api/telemetry, so swapping the data source later requires no changes
 *    to the backend, AI layer, or frontend.
 *  - Mode changes (e.g. NORMAL -> CRITICAL) ease in gradually rather than
 *    jumping instantly, so a live demo looks convincing.
 */

export const MODES = {
  NORMAL: "NORMAL",
  REALISTIC_DRIVE: "REALISTIC_DRIVE",
  WARNING: "WARNING",
  CRITICAL: "CRITICAL",
};

// Target ranges per mode. The simulator eases current values toward the
// midpoint of these ranges, with small per-tick noise layered on top.
const MODE_TARGETS = {
  [MODES.NORMAL]: {
    batteryTemperature: [30, 38],
    motorTemperature: [40, 60],
    voltage: [380, 400],
    current: [20, 60],
    soc: [60, 100],
  },
  [MODES.REALISTIC_DRIVE]: {
    // Realistic drive uses the same "safe" band as normal, but speed /
    // current move a lot more dynamically (handled in tickRealisticDrive).
    batteryTemperature: [30, 42],
    motorTemperature: [40, 68],
    voltage: [375, 400],
    current: [15, 90],
    soc: [20, 100],
  },
  [MODES.WARNING]: {
    batteryTemperature: [40, 48],
    motorTemperature: [65, 80],
    voltage: [360, 415], // moderately unstable around nominal 390
    current: [70, 100],
    soc: [15, 100],
  },
  [MODES.CRITICAL]: {
    batteryTemperature: [50, 60],
    motorTemperature: [80, 100],
    voltage: [330, 440], // abnormal
    current: [110, 150],
    soc: [5, 100],
  },
};

const NOMINAL_VOLTAGE = 390;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// Eases `current` toward the midpoint of [min, max] by `step`, plus small
// random noise, and clamps to the range. This is what produces gradual,
// realistic-looking drift instead of random jumps.
function ease(current, [min, max], step, noise) {
  const target = (min + max) / 2;
  const direction = target - current;
  const nudge = Math.sign(direction) * Math.min(Math.abs(direction), step);
  const jitter = (Math.random() - 0.5) * 2 * noise;
  return clamp(current + nudge + jitter, min - noise, max + noise);
}

export class TelemetrySimulator {
  /**
   * @param {Object} opts
   * @param {string} opts.vehicleId
   * @param {Function} opts.onTick - called with each new telemetry reading
   * @param {number} [opts.intervalMs] - base tick interval (1000-3000ms realistic range)
   */
  constructor({ vehicleId, onTick, intervalMs = 2000 }) {
    this.vehicleId = vehicleId;
    this.onTick = onTick;
    this.baseIntervalMs = intervalMs;
    this.speedMultiplier = 1; // configurable simulation speed (0.5x - 5x)
    this.mode = MODES.NORMAL;
    this.running = false;
    this.timer = null;

    // Manual overrides let the control panel pin specific values (e.g. drag
    // a battery temperature slider) while everything else keeps simulating.
    this.manualOverrides = {};

    this.state = this._initialState();

    // Rolling target mode used to gradually transition between modes
    // (e.g. NORMAL -> CRITICAL doesn't jump instantly).
    this._transitionProgress = 1; // 1 = fully at target mode
  }

  _initialState() {
    return {
      batteryTemperature: 34,
      motorTemperature: 45,
      voltage: 390,
      current: 35,
      soc: 82,
      soh: 91,
      speed: 0,
      chargingStatus: false,
      batteryCycleCount: 120,
      acceleration: 0,
      _accelPhase: 0, // internal helper for REALISTIC_DRIVE speed waves
    };
  }

  setMode(mode) {
    if (!MODES[mode]) return;
    this.mode = mode;
  }

  setSpeedMultiplier(multiplier) {
    this.speedMultiplier = clamp(Number(multiplier) || 1, 0.25, 5);
  }

  setManualOverride(field, value) {
    if (value === null || value === undefined) {
      delete this.manualOverrides[field];
    } else {
      this.manualOverrides[field] = value;
    }
  }

  clearManualOverrides() {
    this.manualOverrides = {};
  }

  reset() {
    this.state = this._initialState();
    this.manualOverrides = {};
    this.mode = MODES.NORMAL;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this._scheduleNext();
  }

  stop() {
    this.running = false;
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }

  _scheduleNext() {
    if (!this.running) return;
    const jitter = Math.random() * 1000; // 1-3s realistic range
    const delay = (this.baseIntervalMs + jitter) / this.speedMultiplier;
    this.timer = setTimeout(() => {
      const reading = this._tick();
      this.onTick(reading);
      this._scheduleNext();
    }, delay);
  }

  _tick() {
    const targets = MODE_TARGETS[this.mode] || MODE_TARGETS[MODES.NORMAL];
    const s = this.state;

    // Step sizes control how fast values drift per tick (tuned for a ~2s tick).
    s.batteryTemperature = ease(s.batteryTemperature, targets.batteryTemperature, 0.6, 0.15);
    s.motorTemperature = ease(s.motorTemperature, targets.motorTemperature, 1.2, 0.3);
    s.voltage = ease(s.voltage, targets.voltage, 1.5, 0.4);
    s.soh = clamp(s.soh - Math.random() * 0.0008, 60, 100); // extremely slow long-term decay

    if (this.mode === MODES.REALISTIC_DRIVE) {
      this._tickRealisticDrive(targets);
    } else if (this.mode === MODES.NORMAL) {
      s.current = ease(s.current, targets.current, 2, 1);
      s.speed = ease(s.speed, [0, 60], 3, 2);
      s.soc = clamp(s.soc - 0.01, 0, 100);
      s.chargingStatus = false;
    } else {
      // WARNING / CRITICAL: current and speed become more erratic
      s.current = ease(s.current, targets.current, 4, 3);
      s.speed = ease(s.speed, [20, 90], 4, 3);
      s.soc = clamp(s.soc - 0.02, 0, 100);
      s.chargingStatus = false;
    }

    // Apply manual overrides last (control-panel sliders win over simulation)
    for (const [field, value] of Object.entries(this.manualOverrides)) {
      if (field in s) s[field] = value;
    }

    return this._toTelemetryObject();
  }

  _tickRealisticDrive(targets) {
    const s = this.state;
    // Simulate acceleration/deceleration waves using a slow sine phase so
    // speed rises and falls smoothly like real driving.
    s._accelPhase += 0.15 + Math.random() * 0.05;
    const wave = Math.sin(s._accelPhase); // -1..1

    const targetSpeed = clamp(55 + wave * 45, 0, 120);
    s.speed = ease(s.speed, [targetSpeed - 2, targetSpeed + 2], 5, 1.5);
    s.acceleration = wave * 2;

    // Current follows acceleration: rising speed -> higher current draw,
    // decelerating -> current drops (regenerative-braking-like dip).
    const accelerating = wave > 0;
    const currentTarget = accelerating
      ? [targets.current[1] * 0.6, targets.current[1]]
      : [targets.current[0], targets.current[0] + (targets.current[1] - targets.current[0]) * 0.3];
    s.current = ease(s.current, currentTarget, 3, 2);

    // SOC drains faster the harder the vehicle accelerates.
    const drainRate = 0.015 + Math.max(0, wave) * 0.02;
    s.soc = clamp(s.soc - drainRate, 0, 100);
    s.chargingStatus = false;
  }

  _toTelemetryObject() {
    const s = this.state;
    const power = (s.voltage * s.current) / 1000; // kW
    const estimatedRange = clamp((s.soc / 100) * 320, 0, 320); // simple linear model off a 320km full-charge range

    return {
      vehicleId: this.vehicleId,
      timestamp: new Date().toISOString(),
      soc: round1(s.soc),
      soh: round1(s.soh),
      voltage: round1(s.voltage),
      current: round1(s.current),
      batteryTemperature: round1(s.batteryTemperature),
      motorTemperature: round1(s.motorTemperature),
      speed: round1(Math.max(0, s.speed)),
      chargingStatus: s.chargingStatus,
      power: round1(power),
      estimatedRange: round1(estimatedRange),
      chargingPower: s.chargingStatus ? round1(Math.abs(power)) : 0,
      batteryCycleCount: Math.round(s.batteryCycleCount),
      acceleration: round1(s.acceleration || 0),
      mode: this.mode,
    };
  }
}

function round1(n) {
  return Math.round(n * 10) / 10;
}
