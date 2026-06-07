# Circuit Schematic & Wiring Guide

## Power Architecture

```
LiPo Battery (2S = 7.4V  OR  3S = 11.1V)
         │
         ├──────────────────────► ESC (Main power input)
         │                              │
         │                              ├──► BLDC Motor (3 phase: A, B, C)
         │                              │
         │                              └──► BEC Output: 5V / 3A (regulated)
         │                                        │
         │                              ┌─────────┴──────────┐
         │                              │    5V Distribution   │
         │                              │                      │
         │                         Arduino Nano           RC Receiver
         │                         (5V Pin ← BEC)        (VCC ← BEC)
         │                              │
         │                         ┌────┴─────────────┐
         │                         │                   │
         │                      MPU6050            Servo VCC
         │                     (I2C: A4/A5)        (from BEC)
         │
         └──► All GND lines connected together (common ground)
```

## Component Pin Connections

### MPU6050 (IMU Sensor)
| MPU6050 Pin | Connect To |
|---|---|
| VCC | 5V (BEC) |
| GND | GND |
| SDA | Arduino A4 |
| SCL | Arduino A5 |
| AD0 | GND (I2C address = 0x68) |
| INT | Not connected (optional) |

### RC Receiver (FlySky FS-iA6)
| Receiver Channel | Signal Wire → | Arduino Pin | Function |
|---|---|---|---|
| CH1 | Signal | D3 | Yaw (Rudder) |
| CH2 | Signal | D4 | Pitch (Elevator) |
| CH3 | Signal | D2 | Throttle |
| VCC | 5V | 5V (BEC) | Power |
| GND | GND | GND | Ground |

### ESC (Electronic Speed Controller)
| ESC Wire | Connect To |
|---|---|
| Red (thick) | LiPo + terminal |
| Black (thick) | LiPo − terminal |
| Motor Wire A | BLDC Motor Phase A |
| Motor Wire B | BLDC Motor Phase B |
| Motor Wire C | BLDC Motor Phase C |
| Signal (white/yellow) | Arduino D9 |
| BEC Red | Arduino 5V + Receiver VCC |
| BEC Black | Arduino GND |

### Servo Motors (SG90)
| Servo | Signal Wire → | Arduino Pin | Function |
|---|---|---|---|
| Elevator Servo | Signal | D10 | Pitch control (PID controlled) |
| Rudder Servo | Signal | D11 | Yaw control (RC direct) |
| Both Servos | VCC | 5V (BEC) | Power |
| Both Servos | GND | GND | Ground |

## Important Wiring Rules

1. **Never power servos from Arduino's 5V pin** — servos can draw >500mA, which will damage the Arduino's onboard regulator. Always use ESC BEC.

2. **Common ground is essential** — All components (Arduino, receiver, IMU, servos, ESC) must share the same GND reference. Floating grounds cause erratic behaviour.

3. **I2C pull-up resistors** — The MPU6050 breakout board already includes 4.7kΩ pull-up resistors on SDA and SCL. Do not add additional ones.

4. **Motor phase order** — If the BLDC motor spins in the wrong direction, swap any two of the three motor phase wires (A↔B, or B↔C, or A↔C).

5. **Anti-vibration mounting** — Mount the MPU6050 on a piece of foam tape or silicone gel pad to reduce high-frequency vibration from the flapping mechanism. This is critical for PID stability.

6. **Wire routing** — Keep signal wires (servo/ESC PWM, I2C) away from the thick motor power wires to prevent electromagnetic interference.

## Recommended Wire Gauges

| Connection | Gauge |
|---|---|
| Battery → ESC (high current) | 16–18 AWG |
| ESC → Motor phases | 18–20 AWG |
| BEC → 5V distribution | 22 AWG |
| Signal wires (PWM, I2C) | 26–28 AWG |
