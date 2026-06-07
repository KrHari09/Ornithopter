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

<img width="1452" height="1160" alt="image" src="https://github.com/user-attachments/assets/fb196ac8-c9bc-47dc-b7ff-f1ecb83f7541" />

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





