# Clinical Threshold & Display State Reference

This document covers **only what is currently rendered in the live dashboard** (`DashboardLayout.tsx` + `YearsCalculatorModal.tsx`). All threshold logic lives inline in those two files — no external clinical utility functions are used for rendering.

---

## Dashboard Layout (Large Screen)

```
┌─────────────────────────────────────────────────────────────┐
│  Header: Patient name · age/sex · Chief complaint           │
├─────────────────────────────────────────────────────────────┤
│  Row 1 (full width): Vital Stability                        │
├───────────────────┬─────────────────────┬───────────────────┤
│  Col 1 (50%)      │  Col 2              │  Col 3 (50%)      │
│  Hemodynamic      │  Previous Diagnoses │  Prior CTPAs      │
│  Stress           │  Checklist          │                   │
│  ──────────────── │                     │  ─────────────    │
│  Anticoagulants   │                     │  CTPA Safety      │
│                   │                     │  Barriers         │
└───────────────────┴─────────────────────┴───────────────────┘
```
Cols 1 and 3 use `flex: 1` on each half so both sub-sections share equal height regardless of content.

On narrow screens (`< 950px`): sections stack vertically — Vitals → Hemodynamics → Diagnoses/Anticoagulants (2-col) → Prior CTPAs/Safety Barriers (2-col).

---

## Table of Contents

1. [Vital Stability Section](#1-vital-stability-section)
2. [Hemodynamic Stress Section](#2-hemodynamic-stress-section)
3. [Previous Diagnoses Checklist](#3-previous-diagnoses-checklist)
4. [CTPA Safety Barriers Section](#4-ctpa-safety-barriers-section)
5. [YEARS Calculator Modal](#5-years-calculator-modal)
6. [Color Reference](#6-color-reference)

---

## 1. Vital Stability Section

**Source:** `DashboardLayout.tsx` → `VitalStabilitySection` (line 72)

Five vitals are displayed. Each vital renders its numeric value in **black** by default. When the threshold is breached, the value turns **red** and an uppercase alert label appears below it.

| Vital | Unit | Alert Condition | Alert Label | Value Color |
|-------|------|----------------|-------------|-------------|
| **HR** | bpm | `hr > 100` | `TACHYCARDIA` | Always black `#111827` |
| **BP (SBP)** | mmHg | `sbp < 90` | `HYPOTENSION` | Always black `#111827` |
| **SPO2** | % | `spo2 < 95` | `HYPOXIA` | Always black `#111827` |
| **RR** | /min | `rr > 20` | `TACHYPNEA` | Always black `#111827` |
| **TEMP** | °C | `temp > 38` | `FEBRILE` | Always black `#111827` |

**Notes:**
- The numeric value always stays black — only the alert label below it renders in red.
- There is no low-HR (bradycardia) alert — only `hr > 100` triggers a state change.
- SPO2 also shows the O2 delivery device in brackets (e.g. `[RA]` for room air, `[NRB]` for non-rebreather). This is display-only and does not affect the alert threshold.
- When no alert: value renders in black `#111827`, no label shown.

---

## 2. Hemodynamic Stress Section

**Source:** `DashboardLayout.tsx` → `HemodynamicStressSection` (line 172)
**Data source:** `calculateHemodynamics(patient.vitals)` from `data/demoData.ts`

Two metrics are displayed side by side: **MAP** and **Shock Index**.

### MAP (Mean Arterial Pressure)
- Formula: `(SBP + 2 × DBP) / 3`
- Always renders in black — no threshold-based color change.

### Shock Index
- Formula: `HR / SBP`
- Three states based on computed value:

| Shock Index Value | Status | Value Color | Label Shown |
|-------------------|--------|-------------|-------------|
| `≤ 0.7` | Safe | Always black `#111827` | _(none)_ |
| `> 0.7` and `≤ 0.9` | Caution | Always black `#111827` | `> 0.7 Caution` in orange |
| `> 0.9` | Danger | Always black `#111827` | `> 0.9 Risk` in red |

- Returns `null` (displays `—`) if HR or SBP is missing.

---

## 3. Previous Diagnoses Checklist

**Source:** `DashboardLayout.tsx` → `PreviousDiagnosesChecklist` (line 221)

Seven items are always rendered. Each item has a **label row** and a **subtext row** below it.

**Active state** (factor is present):
- A filled red circle (10×10px, `#991B1B`) appears to the left of the label.
- The label text renders in red `#991B1B`.
- The subtext shows the relevant detail value.

**Default state** (factor is absent):
- The dot slot is empty (reserved width keeps alignment consistent).
- The label text renders in black `#111827`.
- The subtext shows the default "not present" value.

---

### Item 1 — Prior PE Diagnosis

| State | Condition | Label Color | Dot | Subtext |
|-------|-----------|-------------|-----|---------|
| **Active** | `patient.hasPriorVTE === true` | Red `#991B1B` | ● Red | Date string from `patient.priorPEDate` (e.g. `"03/12/2021"`), or `"Yes"` if no date is recorded |
| **Default** | `patient.hasPriorVTE === false` | Black `#111827` | _(none)_ | `N/A` |

**Data source:** `hasPriorVTE: boolean` on `TeachingCase`. Optional companion field `priorPEDate?: string` (format: `"MM/DD/YYYY"`).

---

### Item 2 — Cancer (last 6 months)

| State | Condition | Label Color | Dot | Subtext |
|-------|-----------|-------------|-----|---------|
| **Active** | Any string in `patient.activeProblems` matches `/cancer\|malignancy\|chemotherapy\|tumor/i` | Red `#991B1B` | ● Red | `"Active"` |
| **Default** | No match in `activeProblems` | Black `#111827` | _(none)_ | `N/A` |

**Data source:** `activeProblems: string[]` — free-text problem list entries. Detection is regex-based (case-insensitive). Valid trigger values include any string containing: `cancer`, `malignancy`, `chemotherapy`, or `tumor`.

---

### Item 3 — Surgeries (last 4 weeks)

| State | Condition | Label Color | Dot | Subtext |
|-------|-----------|-------------|-----|---------|
| **Active** | `patient.hasRecentSurgery === true` | Red `#991B1B` | ● Red | `"Recent surgery"` |
| **Default** | `patient.hasRecentSurgery === false` | Black `#111827` | _(none)_ | `N/A` |

**Data source:** `hasRecentSurgery: boolean` on `TeachingCase`. No date detail is displayed — only the presence/absence flag is used.

---

### Item 4 — Immobilizations (last 3 days)

| State | Condition | Label Color | Dot | Subtext |
|-------|-----------|-------------|-----|---------|
| **Active** | `patient.recentImmobilization` is not `null` / `undefined` | Red `#991B1B` | ● Red | `"{date} · {description}"` — e.g. `"2024-01-10 · Bed rest post-op"` |
| **Default** | `patient.recentImmobilization` is `null` or `undefined` | Black `#111827` | _(none)_ | `N/A` |

**Data source:** `recentImmobilization?: { date: string; description: string }` on `TeachingCase`. When active, both fields are required and rendered as `date · description`.

---

### Item 5 — Prior Thrombophilia

| State | Condition | Label Color | Dot | Subtext |
|-------|-----------|-------------|-----|---------|
| **Active** | `patient.priorThrombophilia === true` | Red `#991B1B` | ● Red | `"Yes"` |
| **Default** | `patient.priorThrombophilia === false` or `undefined` | Black `#111827` | _(none)_ | `N/A` |

**Data source:** `priorThrombophilia?: boolean` on `TeachingCase`. `undefined` is treated the same as `false` via `?? false`.

---

### Item 6 — Pregnancy

| State | Condition | Label Color | Dot | Subtext |
|-------|-----------|-------------|-----|---------|
| **Active** | Any string in `patient.activeProblems` matches `/pregnancy\|pregnant\|gestational/i` | Red `#991B1B` | ● Red | `"Pregnant"` |
| **Default** | No match in `activeProblems` | Black `#111827` | _(none)_ | `"Not pregnant"` |

**Data source:** `activeProblems: string[]` — same free-text problem list as Cancer. Detection is regex-based (case-insensitive). Valid trigger values include any string containing: `pregnancy`, `pregnant`, or `gestational`.

> Note: Unlike most other items, the default subtext for Pregnancy is `"Not pregnant"` rather than `"N/A"` — an explicit negative is clinically meaningful here.

---

### Item 7 — Estrogen

| State | Condition | Label Color | Dot | Subtext |
|-------|-----------|-------------|-----|---------|
| **Active** | `patient.usesEstrogen === true` | Red `#991B1B` | ● Red | `"Yes"` |
| **Default** | `patient.usesEstrogen === false` | Black `#111827` | _(none)_ | `"No"` |

**Data source:** `usesEstrogen: boolean` on `TeachingCase`. Captures any current estrogen use (OCP, HRT, etc.) — no granular detail is stored or displayed beyond the boolean.

> Note: Default subtext is `"No"` rather than `"N/A"` — like Pregnancy, an explicit negative is clinically meaningful.

---

## 4. CTPA Safety Barriers Section

**Source:** `DashboardLayout.tsx` → `CTPASafetyBarriersSection`

Three safety items are displayed. Each item has two rows:
- **Row 1:** Label + colored badge (inline, side by side)
- **Row 2:** `{value} · {description}` in gray label text below

### eGFR

**Row 1 — badge:**

| eGFR Value | Badge Label | Text Color | Background |
|------------|------------|-----------|------------|
| `≥ 60` | `Safe` | Green `#166534` | `#F0FDF4` |
| `≥ 30` and `< 60` | `Caution` | Orange `#D97706` | `#FEF6F0` |
| `< 30` | `Impaired` | Red `#991B1B` | `#FFF5F3` |

**Row 2 — description** (format: `{egfr} · {description}`):

| eGFR Value | Description |
|------------|-------------|
| `≥ 90` | `Normal kidney function` |
| `60 – 89` | `Mildly decreased function` |
| `45 – 59` | `Mild-moderate decrease` |
| `30 – 44` | `Moderate-severe decrease` |
| `15 – 29` | `Severely decreased` |
| `< 15` | `Kidney failure` |

Example: `78 · Mildly decreased function`

### Contrast Allergy

**Row 1 — badge:**

| Value | Badge Label | Text Color | Background |
|-------|------------|-----------|------------|
| `true` | `ALLERGY` | Red `#991B1B` | `#FFF5F3` |
| `false` | `None` | Green `#166534` | `#F0FDF4` |

**Row 2 — description** (no numeric value; description only):

| Value | Description |
|-------|-------------|
| `true` | `Allergy documented` |
| `false` | `No known allergy` |

### Total Radiation Exposure

Only rendered if `totalRadiationExposureMSV` is present on the patient record.

**Row 1 — label + badge:** `Total Radiation Exposure` + colored badge

| Value (mSv) | Badge Label | Text Color | Background |
|-------------|------------|-----------|------------|
| `> 100` | `Unsafe` | Red `#991B1B` | `#FFF5F3` |
| `> 50` and `≤ 100` | `Caution` | Orange `#D97706` | `#FEF6F0` |
| `≤ 50` | `Safe` | Green `#166534` | `#F0FDF4` |

**Row 2:** `{value} mSv in the last 4 weeks` — e.g. `42 mSv in the last 4 weeks`

---

## 4. YEARS Calculator Modal

**Source:** `YearsCalculatorModal.tsx`
**Triggered by:** Cases 1 and 4 in the dashboard (cases with pre-chart YEARS teaching content)

An interactive modal where the clinician answers three yes/no clinical questions. The result and D-dimer bar update in real time.

### YEARS Factors (clinician selects Yes/No)
1. Clinical DVT?
2. Hemoptysis?
3. PE is most likely diagnosis?

### Threshold Logic

| YEARS Score (# of "Yes" answers) | D-Dimer Threshold |
|----------------------------------|-------------------|
| `0` | 1000 ng/mL |
| `≥ 1` | 500 ng/mL |

### Result States

All three questions must be answered before a result appears.

| Condition | Result | Result Card Color | Icon |
|-----------|--------|------------------|------|
| `dDimer < threshold` | `rule-out` | Green (`#F0FDF4` bg, `#166534` text) | ✓ CheckCircle |
| `dDimer ≥ threshold` | `no-rule-out` | Red (`#FFF5F3` bg, `#991B1B` text) | ⚠ AlertTriangle |

### D-Dimer Bar Chart
- Bar fill is **green** when `dDimer < threshold`, **red** when `dDimer ≥ threshold`.
- A vertical threshold tick is always shown at the threshold position.
- Units displayed in the modal are **ng/mL**.

---

## 6. Color Reference

All colors come from `styles/tokens.ts`.

| Token | Hex | Used for |
|-------|-----|---------|
| `colors.black` | `#111827` | Default value/text color |
| `colors.gray` | `#596887` | Labels, subtext, units |
| `colors.red` | `#991B1B` | Abnormal values, danger states |
| `colors.lightRed` | `#FFF5F3` | Danger badge background |
| `colors.green` | `#166534` | Safe/normal states |
| `colors.lightGreen` | `#F0FDF4` | Safe badge background |
| `colors.orange` | `#D97706` | Caution states |
| `colors.lightOrange` | `#FEF6F0` | Caution badge background |
| `colors.darkBlue` | `#375292` | YEARS selected button state |
| `colors.lightBlue` | `#EFF6FF` | YEARS D-dimer badge background |

---

*Last updated: 2026-03-02. Source files: `components/DashboardLayout.tsx`, `components/YearsCalculatorModal.tsx`, `data/demoData.ts` (`TeachingCase` type, `calculateHemodynamics`), `styles/tokens.ts`.*
