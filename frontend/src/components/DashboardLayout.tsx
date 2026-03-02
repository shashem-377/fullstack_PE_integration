/**
 * Clinical Dashboard Layout
 * Matches the PE Dashboard mockup exactly.
 *
 * Design system:
 *   Black  #111827 · Gray   #596887 · Border #E3ECFF
 *   Green  #166534 · LtGrn  #F0FDF4
 *   Red    #991B1B · LtRed  #FFF5F3
 *   Orange #D97706 · LtOrng #FEF6F0
 *
 * Typography:
 *   Labels / subtext  : 14px regular  gray
 *   Section headers   : 16px semibold black
 *   List items        : 16px regular  black
 *   Page title        : 20px medium   black
 *   Large numbers     : 24px semibold black (always black; alert labels carry color)
 */

import { useState, useEffect } from 'react';
import {
  Activity,
  Heart,
  Wind,
  Thermometer,
  Droplets,
  ClipboardList,
  Pill,
  Monitor,
  ShieldAlert,
} from 'lucide-react';
import {
  TEACHING_CASES,
  DEFAULT_CASE,
  type TeachingCase,
  calculateHemodynamics,
} from '../data/demoData';
import YearsCalculatorModal from './YearsCalculatorModal';
import { colors, fontSize, fontWeight } from '../styles/tokens';

// ===========================================================================
// Local aliases for brevity
// ===========================================================================

const BLACK  = colors.black;
const GRAY   = colors.gray;
const BORDER = colors.border;
const GREEN  = colors.green;
const LT_GRN = colors.lightGreen;
const RED    = colors.red;
const LT_RED = colors.lightRed;
const ORANGE = colors.orange;
const LT_ORG = colors.lightOrange;

// Shared text style helpers
const labelStyle  = { color: GRAY,  fontSize: fontSize.label } as const;
const hdrStyle    = { color: BLACK, fontSize: fontSize.heading, fontWeight: fontWeight.semibold } as const;
const listStyle   = { color: BLACK, fontSize: fontSize.body,   fontWeight: fontWeight.regular } as const;
const bigNumStyle = { color: BLACK, fontSize: fontSize.display, fontWeight: fontWeight.medium, lineHeight: 1.1 } as const;

// ===========================================================================
// Types
// ===========================================================================

interface DashboardLayoutProps {
  caseIndex?: number;
}

// ===========================================================================
// Vital Stability Section
// ===========================================================================

function VitalStabilitySection({ patient }: { patient: TeachingCase }) {
  const { hr, sbp, dbp, rr, spo2, o2Device, temp } = patient.vitals;

  const vitals = [
    {
      label: 'HR',
      Icon: Heart,
      value: `${hr}`,
      unit: 'bpm',
      suffix: null as string | null,
      alert: hr > 100,
      alertLabel: hr > 100 ? 'TACHYCARDIA' : null,
    },
    {
      label: 'BP',
      Icon: Activity,
      value: `${sbp}/${dbp}`,
      unit: 'mmHg',
      suffix: null as string | null,
      alert: sbp < 90,
      alertLabel: sbp < 90 ? 'HYPOTENSION' : null,
    },
    {
      label: 'SPO2',
      Icon: Droplets,
      value: `${spo2}%`,
      unit: null as string | null,
      suffix: o2Device && o2Device !== 'Room Air' ? `[${o2Device}]` : '[RA]',
      alert: spo2 < 95,
      alertLabel: spo2 < 95 ? 'HYPOXIA' : null,
    },
    {
      label: 'RR',
      Icon: Wind,
      value: `${rr}`,
      unit: '/min',
      suffix: null as string | null,
      alert: rr > 20,
      alertLabel: rr > 20 ? 'TACHYPNEA' : null,
    },
    {
      label: 'TEMP',
      Icon: Thermometer,
      value: `${temp.toFixed(1)}`,
      unit: '°C',
      suffix: null as string | null,
      alert: temp > 38,
      alertLabel: temp > 38 ? 'FEBRILE' : null,
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 16 }}>
        <Heart size={16} color={GRAY} />
        <span style={hdrStyle}>Vital Stability</span>
      </div>

      {/* Five vitals — equal columns, elements centered within each cell */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', columnGap: 40 }}>
        {vitals.map((v) => {
          const { Icon } = v;
          return (
            <div key={v.label} style={{ textAlign: 'center' }}>
              {/* Icon + label */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 4 }}>
                <Icon size={14} color={GRAY} />
                <span style={labelStyle}>{v.label}</span>
              </div>
              {/* Value */}
              <div style={bigNumStyle}>
                {v.value}
              </div>
              {/* o2 device suffix (SPO2 only) */}
              {v.suffix && (
                <div style={labelStyle}>{v.suffix}</div>
              )}
              {/* Unit */}
              {v.unit && (
                <div style={labelStyle}>{v.unit}</div>
              )}
              {/* Alert label */}
              {v.alertLabel && (
                <div style={{ color: RED, fontSize: 14, fontWeight: 500, textTransform: 'uppercase', marginTop: 4 }}>
                  {v.alertLabel}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ===========================================================================
// Hemodynamic Stress Section
// ===========================================================================

function HemodynamicStressSection({ patient }: { patient: TeachingCase }) {
  const { shockIndex, map } = calculateHemodynamics(patient.vitals);

  const siStatus =
    shockIndex !== null && shockIndex > 0.9 ? 'danger'
    : shockIndex !== null && shockIndex > 0.7 ? 'caution'
    : 'safe';

  return (
    <div style={{ padding: 20 }}>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 16 }}>
        <Activity size={16} color={GRAY} />
        <span style={hdrStyle}>Hemodynamic Stress</span>
      </div>

      {/* MAP | SHOCK INDEX */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
        {/* MAP */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ ...labelStyle, marginBottom: 4 }}>MAP</div>
          <div style={bigNumStyle}>{map}</div>
          <div style={labelStyle}>mmHg</div>
          <div style={labelStyle}>(SBP+2×DBP)/3</div>
        </div>

        {/* SHOCK INDEX */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ ...labelStyle, marginBottom: 4 }}>SHOCK INDEX</div>
          <div style={bigNumStyle}>
            {shockIndex?.toFixed(2) ?? '—'}
          </div>
          <div style={labelStyle}>HR / SBP</div>
          {siStatus === 'caution' && (
            <div style={{ color: ORANGE, fontSize: 13, fontWeight: 500, marginTop: 4 }}>&gt; 0.7 Caution</div>
          )}
          {siStatus === 'danger' && (
            <div style={{ color: RED, fontSize: 13, fontWeight: 500, marginTop: 4 }}>&gt; 0.9 Risk</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
// Previous Diagnoses Checklist
// ===========================================================================

function PreviousDiagnosesChecklist({ patient }: { patient: TeachingCase }) {
  const hasCancer = patient.activeProblems.some((p) =>
    /cancer|malignancy|chemotherapy|tumor/i.test(p)
  );
  const isPregnant = patient.activeProblems.some((p) =>
    /pregnancy|pregnant|gestational/i.test(p)
  );

  const items: Array<{ label: string; active: boolean; subtext: string }> = [
    {
      label: 'Prior PE Diagnosis',
      active: patient.hasPriorVTE,
      subtext: patient.hasPriorVTE ? (patient.priorPEDate ?? 'Yes') : 'N/A',
    },
    {
      label: 'Cancer (last 6 months)',
      active: hasCancer,
      subtext: hasCancer ? 'Active' : 'N/A',
    },
    {
      label: 'Surgeries (last 4 weeks)',
      active: patient.hasRecentSurgery,
      subtext: patient.hasRecentSurgery ? 'Recent surgery' : 'N/A',
    },
    {
      label: 'Immobilizations (last 3 days)',
      active: !!patient.recentImmobilization,
      subtext: patient.recentImmobilization
        ? `${patient.recentImmobilization.date} · ${patient.recentImmobilization.description}`
        : 'N/A',
    },
    {
      label: 'Prior Thrombophilia',
      active: patient.priorThrombophilia ?? false,
      subtext: (patient.priorThrombophilia ?? false) ? 'Yes' : 'N/A',
    },
    {
      label: 'Pregnancy',
      active: isPregnant,
      subtext: isPregnant ? 'Pregnant' : 'Not pregnant',
    },
    {
      label: 'Estrogen',
      active: patient.usesEstrogen,
      subtext: patient.usesEstrogen ? 'Yes' : 'No',
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 16 }}>
        <ClipboardList size={16} color={GRAY} />
        <span style={hdrStyle}>Previous Diagnoses Checklist</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map((item) => (
          <div key={item.label}>
            {/* Name row: dot vertically centered with the name text */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flexShrink: 0, width: 10 }}>
                {item.active && (
                  <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: RED }} />
                )}
              </div>
              <div style={{ ...listStyle, color: item.active ? RED : BLACK }}>
                {item.label}
              </div>
            </div>
            {/* Subtext indented to align under the name */}
            <div style={{ ...labelStyle, marginLeft: 18 }}>{item.subtext}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===========================================================================
// Anticoagulants Section
// ===========================================================================

function AnticoagulantsSection({ patient }: { patient: TeachingCase }) {
  const anticoags = patient.medications.filter((m) => m.category === 'Anticoagulant');

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 16 }}>
        <Pill size={16} color={GRAY} />
        <span style={hdrStyle}>Anticoagulants</span>
      </div>
      {anticoags.length === 0 ? (
        <div style={labelStyle}>None on file</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {anticoags.map((med, i) => (
            <div key={i}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flexShrink: 0, width: 10, height: 10, borderRadius: '50%', backgroundColor: GREEN }} />
                <div style={{ ...listStyle, color: GREEN }}>{med.name}</div>
              </div>
              <div style={{ ...labelStyle, marginLeft: 18 }}>{med.dose}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===========================================================================
// Prior CTPAs Section
// ===========================================================================

function formatImagingDate(dateStr: string): string {
  // Parse yyyy-mm-dd directly to avoid UTC→local timezone shift
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function PriorCTPAsSection({ patient }: { patient: TeachingCase }) {
  const imaging = patient.priorImaging;

  const resultColors: Record<string, { color: string; bg: string }> = {
    Positive:      { color: RED,    bg: LT_RED },
    Negative:      { color: GREEN,  bg: LT_GRN },
    Indeterminate: { color: ORANGE, bg: LT_ORG },
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 16 }}>
        <Monitor size={16} color={GRAY} />
        <span style={hdrStyle}>Prior CTPAs</span>
      </div>
      {!imaging ? (
        <div style={labelStyle}>None on file</div>
      ) : (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={listStyle}>{formatImagingDate(imaging.date)}</span>
            <span
              style={{
                color: resultColors[imaging.result]?.color ?? GRAY,
                backgroundColor: resultColors[imaging.result]?.bg ?? 'transparent',
                fontSize: 13,
                fontWeight: 500,
                padding: '2px 8px',
                borderRadius: 4,
              }}
            >
              {imaging.result}
            </span>
          </div>
          <div style={labelStyle}>{imaging.reportSummary}</div>
        </div>
      )}
    </div>
  );
}

// ===========================================================================
// CTPA Safety Barriers Section
// ===========================================================================

function CTPASafetyBarriersSection({ patient }: { patient: TeachingCase }) {
  const { egfr, hasContrastAllergy, totalRadiationExposureMSV } = patient;

  const renalSafe    = egfr >= 60;
  const renalCaution = egfr >= 30 && egfr < 60;

  const egfrDescription =
    egfr >= 90 ? 'Normal kidney function' :
    egfr >= 60 ? 'Mildly decreased function' :
    egfr >= 45 ? 'Mild-moderate decrease' :
    egfr >= 30 ? 'Moderate-severe decrease' :
    egfr >= 15 ? 'Severely decreased' :
                 'Kidney failure';

  const radUnsafe  = totalRadiationExposureMSV !== undefined && totalRadiationExposureMSV > 100;
  const radCaution = totalRadiationExposureMSV !== undefined && totalRadiationExposureMSV > 50 && !radUnsafe;

  const badge = (label: string, color: string, bg: string) => (
    <span style={{ color, backgroundColor: bg, fontSize: 13, fontWeight: 500, padding: '2px 8px', borderRadius: 4 }}>
      {label}
    </span>
  );

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 16 }}>
        <ShieldAlert size={16} color={GRAY} />
        <span style={hdrStyle}>CTPA Safety Barriers</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* eFGR */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={listStyle}>eFGR</span>
            {badge(
              renalSafe ? 'Safe' : renalCaution ? 'Caution' : 'Impaired',
              renalSafe ? GREEN  : renalCaution ? ORANGE    : RED,
              renalSafe ? LT_GRN : renalCaution ? LT_ORG   : LT_RED,
            )}
          </div>
          <div style={{ ...labelStyle, marginTop: 2 }}>{egfr} · {egfrDescription}</div>
        </div>

        {/* Contrast Allergy */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={listStyle}>Contrast Allergy</span>
            {badge(
              hasContrastAllergy ? 'ALLERGY' : 'None',
              hasContrastAllergy ? RED       : GREEN,
              hasContrastAllergy ? LT_RED    : LT_GRN,
            )}
          </div>
          <div style={{ ...labelStyle, marginTop: 2 }}>
            {hasContrastAllergy ? 'Allergy documented' : 'No known allergy'}
          </div>
        </div>

        {/* Total Radiation Exposure */}
        {totalRadiationExposureMSV !== undefined && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={listStyle}>Total Radiation Exposure</span>
              {badge(
                radUnsafe ? 'Unsafe' : radCaution ? 'Caution' : 'Safe',
                radUnsafe ? RED      : radCaution ? ORANGE    : GREEN,
                radUnsafe ? LT_RED   : radCaution ? LT_ORG    : LT_GRN,
              )}
            </div>
            <div style={{ ...labelStyle, marginTop: 2 }}>{totalRadiationExposureMSV} mSv in the last 4 weeks</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ===========================================================================
// Main Component
// ===========================================================================

const DDIMER_BUTTON_CASES: Record<number, 'case1' | 'case4'> = {
  11: 'case1',
  0:  'case4',
};

export default function DashboardLayout({ caseIndex = 0 }: DashboardLayoutProps) {
  const patient = TEACHING_CASES[caseIndex] || DEFAULT_CASE;
  const [showYearsModal, setShowYearsModal] = useState(false);
  const ddimerModalCase = DDIMER_BUTTON_CASES[caseIndex];
  const [isNarrow, setIsNarrow] = useState(window.innerWidth < 950);

  useEffect(() => {
    const handler = () => setIsNarrow(window.innerWidth < 950);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return (
    <div>
      {/* ─── Outer panel ─────────────────────────────────────────── */}
      <div style={{ backgroundColor: '#fff', border: `1px solid ${BORDER}`, borderRadius: 8, overflow: 'hidden' }}>

        {/* ── Header ────────────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            padding: 20,
            borderBottom: `1px solid ${BORDER}`,
          }}
        >
          <div style={{ display: 'flex', gap: 40 }}>
            {/* Patient */}
            <div>
              <div style={labelStyle}>PATIENT</div>
              <div style={{ color: BLACK, fontSize: 16, fontWeight: 400 }}>
                {patient.name} · {patient.age}{patient.gender === 'Male' ? 'M' : 'F'}
              </div>
            </div>
            {/* Chief Complaint */}
            <div>
              <div style={labelStyle}>CHIEF COMPLAINT</div>
              <div style={{ color: BLACK, fontSize: 16, fontWeight: 400 }}>
                {patient.chiefComplaint}
              </div>
            </div>
          </div>
        </div>

        {/* ── Row 1: Vital Stability (full width) ───────────────── */}
        <div style={{ borderBottom: `1px solid ${BORDER}` }}>
          <VitalStabilitySection patient={patient} />
        </div>

        {/* ── Row 2: Three columns ────────────────────────────────── */}
        {isNarrow ? (
          <>
            {/* Narrow: Hemodynamics full width */}
            <div style={{ borderBottom: `1px solid ${BORDER}` }}>
              <HemodynamicStressSection patient={patient} />
            </div>
            {/* Narrow: 2-col — Diagnoses | Anticoagulants */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: `1px solid ${BORDER}` }}>
              <div style={{ borderRight: `1px solid ${BORDER}` }}>
                <PreviousDiagnosesChecklist patient={patient} />
              </div>
              <div>
                <AnticoagulantsSection patient={patient} />
              </div>
            </div>
            {/* Narrow: 2-col — Prior CTPAs | Safety Barriers */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: `1px solid ${BORDER}` }}>
              <div style={{ borderRight: `1px solid ${BORDER}` }}>
                <PriorCTPAsSection patient={patient} />
              </div>
              <div>
                <CTPASafetyBarriersSection patient={patient} />
              </div>
            </div>
          </>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: `1px solid ${BORDER}` }}>
            {/* Col 1: Previous Diagnoses Checklist */}
            <div style={{ borderRight: `1px solid ${BORDER}` }}>
              <PreviousDiagnosesChecklist patient={patient} />
            </div>
            {/* Col 2: Hemodynamic Stress (top) + Anticoagulants (bottom) — equal halves */}
            <div style={{ borderRight: `1px solid ${BORDER}`, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ flex: 1, minHeight: 0, borderBottom: `1px solid ${BORDER}` }}>
                <HemodynamicStressSection patient={patient} />
              </div>
              <div style={{ flex: 1, minHeight: 0 }}>
                <AnticoagulantsSection patient={patient} />
              </div>
            </div>
            {/* Col 3: Prior CTPAs (top) + Safety Barriers (bottom) — equal halves */}
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ flex: 1, minHeight: 0, borderBottom: `1px solid ${BORDER}` }}>
                <PriorCTPAsSection patient={patient} />
              </div>
              <div style={{ flex: 1, minHeight: 0 }}>
                <CTPASafetyBarriersSection patient={patient} />
              </div>
            </div>
          </div>
        )}

        {/* ── D-Dimer Button (Case 3 & 4 only) ─────────────────── */}
        {ddimerModalCase && (
          <div
            style={{ display: 'flex', justifyContent: 'center', padding: '12px 16px', borderBottom: `1px solid ${BORDER}` }}
          >
            <button
              onClick={() => setShowYearsModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                fontSize: 14,
                fontWeight: 500,
                color: '#375292',
                backgroundColor: '#eff6ff',
                border: '1px solid #375292',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              View D-Dimer Result
            </button>
          </div>
        )}

        {/* ── Footer ────────────────────────────────────────────── */}
        <div style={{ padding: '10px 16px', textAlign: 'center' }}>
          <span style={{ ...labelStyle, fontSize: 11, letterSpacing: '0.06em' }}>
            LUMINUR PE CALCULATOR · DATA AGGREGATION TOOL · NOT A DIAGNOSTIC DEVICE
          </span>
        </div>

      </div>

      {/* YEARS Calculator Modal */}
      {showYearsModal && ddimerModalCase && (
        <YearsCalculatorModal
          initialCase={ddimerModalCase}
          onClose={() => setShowYearsModal(false)}
        />
      )}
    </div>
  );
}
