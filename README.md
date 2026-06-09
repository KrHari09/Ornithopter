#  RC Ornithopter — Flight Stabilization & Telemetry System

<div align="center">

![Ornithopter Banner](https://img.shields.io/badge/Platform-Arduino%20Nano%20%7C%20ESP32-00979D?style=for-the-badge&logo=arduino)
![Language](https://img.shields.io/badge/Language-C%2B%2B%20%7C%20JavaScript-F7DF1E?style=for-the-badge&logo=cplusplus)
![Domain](https://img.shields.io/badge/Domain-Electronics%20%7C%20Embedded%20Systems-FF6B35?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Active%20Development-brightgreen?style=for-the-badge)
![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-181717?style=for-the-badge&logo=github)

**An electronics-focused RC ornithopter featuring a dual-crank flapping mechanism,  
MPU6050-based flight stabilization, and real-time PID control.**

[ Live PID Simulator](#-live-pid-simulator) · [ Circuit Design](#-circuit-design--wiring) · [ Arduino Code](#-arduino-flight-controller-code) · [ How It Works](#-mechanism-the-dual-crank-flapping-system)

</div>

---

##  Table of Contents

- [Project Overview](#-project-overview)
- [Mechanism: The Dual-Crank Flapping System](#-mechanism-the-dual-crank-flapping-system)
- [Electronics System Architecture](#-electronics-system-architecture)
- [Components & Specifications](#-components--specifications)
- [Circuit Design & Wiring](#-circuit-design--wiring)
- [Arduino Flight Controller Code](#-arduino-flight-controller-code)
- [PID Stabilization System](#-pid-stabilization-system)
- [Live PID Simulator](#-live-pid-simulator)
- [Aerodynamic Calculations](#-aerodynamic-calculations)
- [Test Results](#-test-results)
- [Project Structure](#-project-structure)
- [How to Build](#-how-to-build)
- [References](#-references)

---

##  Project Overview

This project is an **electronics-domain implementation** of a Radio-Controlled (RC) Ornithopter — a flapping-wing micro aerial vehicle (MAV). The mechanical structure uses a **dual-crank gear mechanism** to convert motor rotation into symmetrical wing flapping. On top of this, a custom **Flight Stabilization and Telemetry System** is designed and implemented.

### Core Electronics Features

| Feature | Implementation |
|---|---|
| **Flight Controller** | Arduino Nano / ESP32 |
| **Stabilization** | MPU6050 IMU (6-axis Gyro + Accelerometer) |
| **Control Algorithm** | Hybrid RC + PID (Proportional-Integral-Derivative) |
| **Sensor Fusion** | Complementary Filter (gyro + accelerometer) |
| **Actuation** | BLDC Motor via ESC + 2× SG90 Servo |
| **Remote Control** | FlySky FS-i6 Transmitter / FS-iA6 Receiver |
| **Power** | 2S/3S LiPo via ESC BEC |

---

##  Mechanism: The Dual-Crank Flapping System

The ornithopter uses a **compound gear train** to translate the rotary motion of a BLDC motor into the reciprocating flapping motion of its wings.

<img width="1366" height="1160" alt="image" src="https://github.com/user-attachments/assets/2ff9cc44-a799-4461-baea-f2967e58a4b5" />

### How It Works

1. The **BLDC motor** drives a small 10-tooth pinion gear.
2. The pinion meshes with a **70-tooth spur gear**, achieving a gear reduction of 7:1 — this reduces speed and multiplies torque.
3. Each large gear has an **offset crank pin**. A connecting rod links this pin to a wing lever.
4. As the gears rotate, the connecting rods **push and pull** the wing levers, producing the flapping stroke.
5. Two cranks placed 180° apart ensure **symmetrical flapping**, preventing roll instability.

### Gear Train Summary

| Gear | Teeth | Role |
|---|---|---|
| Pinion (A) | 10 | Input from motor |
| Spur Gear + Pinion (B+C) | 70 + small | Intermediate stage |
| Driven Gear (D) | Large | Output shaft / crank |

### Why Dual-Crank?

- Eliminates the **dead-centre effect** of single-crank designs
- Ensures **perfectly symmetrical** flapping — the ornithopter flies straight
- Reduces **shock loads** on the motor and ESC
- Provides smoother power delivery and lower vibration

---

##  Electronics System Architecture

<img width="1440" height="1480" alt="image" src="https://github.com/user-attachments/assets/4daaa0d5-e767-4c6d-9534-3ab90aebbec5" />

---

##  Components & Specifications

| # | Component | Model | Key Specifications |
|---|---|---|---|
| 1 | **BLDC Motor** | F23700 (3500KV) | Composite material, high RPM, lightweight |
| 2 | **ESC Controller** | 30A ESC | 490Hz response, 16KHz motor freq, 2–3S LiPo, BEC 5V/3A |
| 3 | **Servo Motor ×2** | SG90 | 9g, 1.8 kgf·cm torque, 0.1s/60°, 4.8V |
| 4 | **RC Transmitter** | FlySky FS-i6 | 6CH, 2.4GHz AFHDS 2A, 4096 resolution |
| 5 | **RC Receiver** | FlySky FS-iA6 | 6CH, 2.4GHz, 500KHz bandwidth |
| 6 | **IMU Sensor** | MPU6050 | 6-axis, I2C, ±250°/s gyro, ±2g accel |
| 7 | **Microcontroller** | Arduino Nano | ATmega328P, 16MHz, 32KB flash |
| 8 | **Battery** | 2S/3S LiPo | Lightweight, 45min operating time |
| 9 | **FPV Camera** | WiFi Mini Cam | 640×480 VGA, M-JPEG, 10fps, 2.4G WiFi, 8g |
| 10 | **Frame Material** | Fiberglass Sheet | Lightweight, rigid structural support |
| 11 | **Wing Membrane** | Polyethylene Cover | Lightweight, flexible, aerofoil surface |
| 12 | **Connectors** | JST-XH Plugs | Standard RC/LiPo connectors |

---

##  Circuit Design & Wiring

### Power Architecture

>  **Critical:** NEVER power servos or the motor directly from the Arduino's 5V pin. Always use the ESC's built-in BEC (Battery Eliminator Circuit) for the 5V rail.

<img width="1452" height="1040" alt="image" src="https://github.com/user-attachments/assets/b741ec81-299b-428f-ae69-e6c281051374" />


### Pin Wiring Table

| Component | Wire / Pin | Arduino Nano Pin |
|---|---|---|
| **MPU6050** | VCC | 5V (from BEC) |
| **MPU6050** | GND | GND |
| **MPU6050** | SDA | A4 |
| **MPU6050** | SCL | A5 |
| **RC Receiver CH3** | Throttle Signal | D2 (PWM Input) |
| **RC Receiver CH1** | Yaw Signal | D3 (PWM Input) |
| **RC Receiver CH2** | Pitch Signal | D4 (PWM Input) |
| **ESC Signal** | PWM Input | D9 (PWM Output) |
| **Servo 1 (Elevator)** | Signal | D10 (PWM Output) |
| **Servo 2 (Rudder)** | Signal | D11 (PWM Output) |

### RC Stick Mapping (Mode 2 — Default)

| Stick | Axis | Function | Maps To |
|---|---|---|---|
| Left Stick | Up/Down | Throttle | Flapping speed (ESC) |
| Left Stick | Left/Right | Yaw | Rudder servo |
| Right Stick | Up/Down | Pitch | Elevator servo (+ PID setpoint) |
| Right Stick | Left/Right | Roll | (Passive — wing geometry) |

---

##  Arduino Flight Controller Code

### Serial Monitor — Startup Output

The screenshot below shows the Arduino IDE **Serial Monitor** at 115200 baud during a calibration-to-flight sequence. The I²C bus scan confirms MPU6050 at address `0x68`, followed by receiver channel verification and PID loop telemetry.


<img width="1517" height="842" alt="serial_monitor" src="https://github.com/user-attachments/assets/87aba7cd-b66f-4bb7-930e-f3f6aecf6512" />

> **Observed:** All three RC channels lock at ~1500 µs (center) at startup. PID output converges toward zero within 0.5 s as the complementary filter settles.

---
### File: `src/flight_controller_basic.ino`
> Manual RC passthrough — no stabilization. Used for Phase 1 testing.


```cpp
#include <Servo.h>
#include <Wire.h>

const int escPin            = 9;
const int elevatorServoPin  = 10;
const int rudderServoPin    = 11;
const int throttleInPin     = 2;
const int pitchInPin        = 3;
const int yawInPin          = 4;

Servo flappingMotor, elevatorServo, rudderServo;

void setup() {
  Serial.begin(115200);
  Wire.begin();

  // Wake MPU6050
  Wire.beginTransmission(0x68);
  Wire.write(0x6B); Wire.write(0);
  Wire.endTransmission(true);

  flappingMotor.attach(escPin, 1000, 2000);
  elevatorServo.attach(elevatorServoPin);
  rudderServo.attach(rudderServoPin);

  // ESC arming
  flappingMotor.writeMicroseconds(1000);
  delay(2000);
  Serial.println("ESC Armed. Flight loop starting...");
}

void loop() {
  int thr = pulseIn(throttleInPin, HIGH, 25000);
  int pitch = pulseIn(pitchInPin, HIGH, 25000);
  int yaw   = pulseIn(yawInPin,   HIGH, 25000);

  thr   = constrain(thr, 1000, 2000);
  pitch = constrain(pitch, 1000, 2000);
  yaw   = constrain(yaw, 1000, 2000);

  flappingMotor.writeMicroseconds(thr);
  elevatorServo.writeMicroseconds(pitch);
  rudderServo.writeMicroseconds(yaw);

  delay(10); // ~100 Hz
}
```

---

### File: `src/flight_controller_pid.ino`
> Full PID + RC hybrid — active pitch stabilization.

```cpp
#include <Servo.h>
#include <Wire.h>

// ── PID Gains (tuned empirically) ───────────────────────────
float Kp = 1.80, Ki = 0.05, Kd = 0.40;

// ── Complementary Filter ────────────────────────────────────
const float alpha = 0.98;
float pitch_angle = 0.0;

// ── PID state ───────────────────────────────────────────────
float pid_integral  = 0.0;
float prev_pitch_err = 0.0;
unsigned long prev_time;

// ── Raw IMU ─────────────────────────────────────────────────
int16_t ax, ay, az, gx, gy, gz;

float readPitch_accel() {
  return atan2(ay, az) * 180.0 / PI;
}

void loop() {
  // ── Read MPU6050 ──────────────────────────────────────────
  Wire.beginTransmission(0x68);
  Wire.write(0x3B); Wire.endTransmission(false);
  Wire.requestFrom(0x68, 14, true);
  ax = Wire.read()<<8 | Wire.read();
  ay = Wire.read()<<8 | Wire.read();
  az = Wire.read()<<8 | Wire.read();
  Wire.read(); Wire.read();  // temperature
  gx = Wire.read()<<8 | Wire.read();
  gy = Wire.read()<<8 | Wire.read();

  // ── Complementary Filter ─────────────────────────────────
  unsigned long now = micros();
  float dt = (now - prev_time) / 1e6;
  prev_time = now;

  float gyro_rate = gy / 131.0;           // °/s
  float accel_pitch = readPitch_accel();
  pitch_angle = alpha*(pitch_angle + gyro_rate*dt) + (1-alpha)*accel_pitch;

  // ── RC Pitch Setpoint ────────────────────────────────────
  int rc_pitch = pulseIn(pitchInPin, HIGH, 25000);
  float setpoint = map(rc_pitch, 1000, 2000, -15, 15);  // ° target

  // ── PID ──────────────────────────────────────────────────
  float error = setpoint - pitch_angle;
  pid_integral += error * dt;
  pid_integral  = constrain(pid_integral, -20, 20);
  float derivative = (error - prev_pitch_err) / dt;
  prev_pitch_err   = error;

  float pid_out = Kp*error + Ki*pid_integral + Kd*derivative;
  pid_out = constrain(pid_out, -30, 30);

  // ── Servo Output ─────────────────────────────────────────
  int elev_cmd = 1500 + (int)(pid_out * 6.0);
  elev_cmd = constrain(elev_cmd, 1000, 2000);
  elevatorServo.writeMicroseconds(elev_cmd);

  // ── Telemetry ────────────────────────────────────────────
  Serial.print("t="); Serial.print(millis()/1000.0, 2);
  Serial.print("s  Pitch:"); Serial.print(pitch_angle, 1);
  Serial.print("°  err:"); Serial.print(error, 2);
  Serial.print("  PID_out:"); Serial.println(pid_out, 2);

  delay(10);
}
```

---
##  PID Stabilization System

### PID Step Response — Gain Comparison

The plot below was generated from flight log data replayed through the PID algorithm with different gain sets. The **optimal PID (Kp=1.8, Ki=0.05, Kd=0.4)** settles within ±0.8° in under 0.6 s with no steady-state error.

<img width="1635" height="729" alt="pid_gain_sweep" src="https://github.com/user-attachments/assets/6059a22d-9af6-4e14-8f15-ff642a36aa3c" />


| Gain Configuration | Behaviour | Settling Time |
|:---|:---|:---|
| Kp=0.5, Ki=0, Kd=0 | Sluggish, large offset | Never settles |
| Kp=4.0, Ki=0, Kd=0 | Oscillates continuously | — |
| Kp=1.8, Ki=0, Kd=0.4 | Fast, small residual error | ~0.9 s |
| **Kp=1.8, Ki=0.05, Kd=0.4** | **Optimal — zero steady-state** | **~0.6 s** |

### PID Tuning Procedure

```
Step 1: Set all gains to zero.
Step 2: Raise Kp until the ornithopter oscillates around level → back off 20%.
Step 3: Raise Kd to dampen oscillations.
Step 4: Raise Ki slowly to eliminate any residual tilt offset.
```

| Symptom | Corrective Action |
|:---|:---|
| Slow response to disturbance | Increase Kp |
| Persistent tilt offset | Increase Ki |
| Oscillating / shaking | Increase Kd or reduce Kp |
| Violent overcorrection | Reduce Kp, increase Kd |

---
##  IMU Data & Sensor Fusion

### MPU6050 In-Flight Capture

Raw gyroscope (Roll/Pitch rate in °/s) and accelerometer Z-axis data captured via Serial at 100 Hz during a 2-second flight window. The 5.2 Hz flapping oscillation is clearly visible in both axes.


<img width="1634" height="883" alt="mpu6050_imu_data" src="https://github.com/user-attachments/assets/21053ab8-18ad-4c5a-b9b9-c591c2e6dd3e" />

The **complementary filter** (α = 0.98) blends:
- **Gyroscope** — accurate short-term angular rate, but drifts over time
- **Accelerometer** — absolute tilt reference, but noisy due to wing vibration

<img width="1452" height="920" alt="image" src="https://github.com/user-attachments/assets/bcc1df57-efc9-41a2-b25c-71ebfd135c91" />

At α = 0.98, the gyroscope dominates at high frequencies (wing vibration rejection) while the accelerometer slowly corrects long-term drift.

---

##  Wing Beat Frequency Analysis

### FFT — Accelerometer Z-axis (5-second capture)

Post-flight FFT analysis of the accelerometer Z-axis data confirms **5.2 Hz fundamental wing beat frequency**, with visible 2nd (10.4 Hz) and 3rd (15.6 Hz) harmonics consistent with the dual-crank mechanism's kinematics.


<img width="1635" height="733" alt="fft_wing_beat" src="https://github.com/user-attachments/assets/9bcbe31e-266f-48f3-8923-54632c077b08" />


| Peak | Frequency | Amplitude | Interpretation |
|:---|:---|:---|:---|
| Fundamental | 5.2 Hz | 2.1 ° | Primary wing stroke |
| 2nd Harmonic | 10.4 Hz | 0.8 ° | Gear mesh / crank return |
| 3rd Harmonic | 15.6 Hz | 0.3 ° | Structural mode |

> The PID derivative term (Kd) must be low-pass filtered to prevent these harmonics from coupling into the servo output.

---
#  Live PID Simulator

An interactive browser-based PID tuning simulator is hosted on GitHub Pages. Visualize the effect of Kp, Ki, Kd on simulated ornithopter pitch response before touching hardware.


** [Open Live Simulator](https://krhari09.github.io/Ornithopter/simulation/)**


Features:
- Real-time pitch response canvas
- Adjustable Kp / Ki / Kd sliders
- Wind gust disturbance injection button
- Animated ornithopter responding to PID output
- Complementary filter visualization toggle

---

##  Aerodynamic Calculations

### Bernoulli Lift Equation

```
L = Cl × ρ × A × v² / 2

  L  = Lift force (N)
  Cl = Coefficient of Lift = 1.6
  ρ  = Air density = 1.2041 kg/m³
  A  = Wing area = 0.4032 m²
  v  = Forward velocity (m/s)
```

### Aspect Ratio

```
AR = b² / S = (0.51)² / (0.4032) ≈ 0.645

→ Low aspect ratio — prioritizes maneuverability over glide efficiency,
  appropriate for a flapping-wing MAV.
```

### Measured Flight Parameters

| Parameter | Value |
|:---|:---|
| Total MAV Weight | 98.2 g |
| Wing Span | 510 mm |
| Wing Area | 403.2 cm² |
| Flapping Amplitude | 40° |
| Flapping Frequency | 5.2 Hz |
| Lift Coefficient (Cl) | 1.6 |
| Gear Ratio | 7:1 |
| Cruising Throttle | ~70% |

### Structural Safety Condition

```
σ_max ≤ σ_yt / n

  σ_yt = Yield strength of fiberglass frame
  n    = Factor of safety (≥ 2 recommended)
```

---

##  Test Results & Telemetry

### Pitch PID Response — In-Flight Data

The graph below shows pitch angle (°) over a 3-second flight segment including a simulated wind gust disturbance at t = 0.3 s. The PID controller returns pitch to ±0.8° within 0.5 s.

<img width="1635" height="729" alt="pid_pitch_response" src="https://github.com/user-attachments/assets/8824e083-8110-4c28-bddb-b86baa34e616" />

### Three-Phase Testing


**Phase 1 — Manual RC Passthrough (No Stabilization)**
- Sustained flight achieved 
- Extremely difficult to control — pilot must constantly correct pitch
- Frequent crashes due to flapping-induced pitch instability

**Phase 2 — PD Controller on Elevator Servo**
- Pitch stabilization significantly improved 
- Gearbox rocker-link / shoulder identified as main failure point
- Frame balance and gearbox mount revised

**Phase 3 — Full PID + RC Hybrid**
- Semi-autonomous level flight demonstrated 
- ~30 yards of controlled straight flight recorded
- 9 full wing-beat cycles captured per test window
- ESC 30 A limit constrains maximum throttle to ~70%

### Key Metrics

| Metric | Value |
|:---|:---|
| Max sustained flight distance | ~30 yards |
| Pitch error (steady state) | < ±0.8° |
| Pitch settling time (after disturbance) | ~0.5 s |
| Wing beats per test window | 9 cycles |
| PID loop rate | 100 Hz |
| Serial telemetry rate | 100 Hz @ 115200 baud |

---


## 📁 Project Structure

<img width="1440" height="2680" alt="image" src="https://github.com/user-attachments/assets/0d68ea74-134d-44e9-9aae-b6af7f54e8b1" />


---

##  How to Build

### Prerequisites

- Arduino IDE 2.x
- Libraries: `Servo.h` (built-in), `Wire.h` (built-in)
- FlySky FS-i6 transmitter bound to FS-iA6 receiver

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/KrHari09/RC-Ornithopter-Flight-Stabilization-Telemetry-System.git
   ```

2. **Open the firmware**
   - Open `src/flight_controller_pid.ino` in Arduino IDE

3. **Upload to Arduino Nano**
   - Board: `Arduino Nano`
   - Processor: `ATmega328P (Old Bootloader)` ← required for clone boards
   - Port: select your COM port

4. **Calibrate ESC**
   - Power on with throttle at max → wait for beep sequence
   - Lower throttle to minimum → wait for arming beep
   - The `delay(2000)` in `setup()` handles this

5. **Bind RC Receiver**
   - Follow FlySky FS-iA6 binding procedure
   - Verify CH1/CH2/CH3 PWM signals on Serial Monitor (should read ~1500 µs at center)

6. **Tune PID on bench**
   - Hold ornithopter, apply manual pitch disturbances
   - Watch Serial Monitor for pitch angle and PID output
   - Adjust `Kp`, `Ki`, `Kd` using the tuning table above

7. **Flight test in open area**
   - Start at ~30% throttle
   - Verify elevator responds to RC pitch input
   - Verify PID corrects unintended pitch changes

---

##  References

1. Chronister, N. (1999). *The Ornithopter Design Manual*. The Ornithopter Zone.
2. Mueller, T. J. (2001). *Fixed and Flapping Wing Aerodynamics for Micro Air Vehicle Applications*. AIAA. ISBN 1-56347-517-0.
3. Azuma, A. (2006). *The Biokinetics of Flying and Swimming* (2nd ed.). AIAA. ISBN 1-56347-781-5.
4. DeLaurier, J. D. (1999). The Development and Testing of a Full-Scale Piloted Ornithopter. *Canadian Aeronautics and Space Journal*, 45(2), 72–82.
5. Warrick, D., Tobalske, B., Powers, D., & Dickinson, M. (2010). The Aerodynamics of Hummingbird Flight. AIAA.
6. Nagakiran, M., Kannakumar, J., & Salmon, A. (2019). Construction and Operation of Ornithopter Using RC. *JETIR*, Vol. 6, Issue 1. ISSN-2349-5162.

---

##  Author

**Hari Kumar**  
B.Tech, Electronics and Communication Engineering, NIT Jamshedpur

[![GitHub](https://img.shields.io/badge/GitHub-KrHari09-181717?style=flat-square&logo=github)](https://github.com/KrHari09)

---

<div align="center">

*Built with  electronics,  control theory, and  a love for bio-inspired flight.*

</div>




