# Luminur Design System Guidelines

Token source: `src/styles/tokens.ts`

---

## Spacing

### Section titles + section content
Spacing between section titles and their content should be 16px.

### List items (name + description pairs)
Elements that pair a primary label with supporting subtext — such as patient name + value, diagnosis checklist rows, medication + dosage, and prior CTPA date + details — rely on **natural 1.5× line-height spacing** between the two lines. No explicit margin or gap is added between the label and its subtext within the same item.

Examples of this pattern:
- Patient name / chief complaint value
- Each row in the Previous Diagnoses Checklist (item name + subtext like date or N/A)
- Anticoagulant name + dosage (e.g. Warfarin / 5mg 2x/day)
- Prior CTPA date + report summary

### Vertical Spacing between list items(name + description pairs)
should be 12px
Exampples of 2 list items that should have that spacing between them:
- Prior PE and Cancer in the Previous Diagnosis Section
- eFGR and Contrast Allergy in CTPA Safety Barriers

### Padding for sections
Should be 20px for:
- Section padding (all content sections)

Should be 16px for:
- Main container / panel header


---

## Typography

Colors referenced below map to tokens in `colors` (e.g. `colors.gray` = `#596887`, `colors.black` = `#111827`).

| Role | Size | Weight | Color |
|---|---|---|---|
| List item subtext | 14px (`fontSize.label`) | regular (400) | `colors.gray` (#596887) |
| Section headers | 16px (`fontSize.heading`) | semibold (600) | `colors.black` (#111827) |
| List items | 16px (`fontSize.body`) | regular (400) | `colors.black` (#111827) |
| Page / panel title | 20px (`fontSize.title`) | medium (500) | `colors.black` (#111827) |
| Large numbers | 24px (`fontSize.display`) | semibold (600) | `colors.black` (#111827) default; `colors.red` (#991B1B) when abnormal |

---

## Colors

All colors are exported from `colors` in `src/styles/tokens.ts`.

### Neutrals
| Token | Hex | Usage |
|---|---|---|
| `colors.black` | `#111827` | Primary text, active states, headings |
| `colors.gray` | `#596887` | Labels, subtext, icons, units |
| `colors.border` | `#EEEEEE` | Panel borders, dividers, input borders |
| `colors.lightBlue` | `#E8F0FF` | Panel backgrounds, badge backgrounds, selected button fill |

### Semantic — Green (safe / rule-out)
| Token | Hex | Usage |
|---|---|---|
| `colors.green` | `#166534` | Text and icons for positive/safe states, rule-out results |
| `colors.lightGreen` | `#F0FDF4` | Background for green badges and result cards |

### Semantic — Red (alert / danger)
| Token | Hex | Usage |
|---|---|---|
| `colors.red` | `#991B1B` | Text and icons for abnormal vitals, alerts, cannot-rule-out results |
| `colors.lightRed` | `#FFF5F3` | Background for red badges and result cards |

### Semantic — Orange (caution)
| Token | Hex | Usage |
|---|---|---|
| `colors.orange` | `#D97706` | Text and icons for caution states (e.g. shock index > 0.7, eFGR caution) |
| `colors.lightOrange` | `#FEF6F0` | Background for orange/caution badges |

### Semantic — Blue (Buttons)
- light blue - button and tag bg
- dark blue - button text and border

---

## Borders

All borders use `colors.border` (`#EEEEEE`) — applies to:
- Dashboard panel outer border
- Section dividers
- Yes/No toggle buttons (unselected state) in YEARS modal
