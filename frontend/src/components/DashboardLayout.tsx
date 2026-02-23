/**
 * Clinical Dashboard Layout - FDA 21st Century Cures Act Compliant
 *
 * Layout Hierarchy (Physician Feedback):
 * - Row 1: Vital Stability Strip (Sick vs Not Sick)
 * - Row 2: Hemodynamic Stress · Medications · Medical Timeline
 * - Row 3: Prior CTPA · Safety Barriers
 *
 * Standard medical calculators only - No AI predictions
 */

import React, { useMemo } from 'react';
import {
  Activity,
  AlertTriangle,
  Clock,
  Heart,
  Droplets,
  Wind,
  Thermometer,
  Pill,
  Scan,
  HeartPulse,
  Gauge,
  TrendingUp,
  ShieldAlert,
  Droplet,
  History,
  Ban,
} from 'lucide-react';
import {
  TEACHING_CASES,
  DEFAULT_CASE,
  type TeachingCase,
  calculateHemodynamics,
  getDaysSincePriorImaging,
  formatPriorImagingDate,
} from '../data/demoData';

// ===========================================================================
// Types
// ===========================================================================

interface DashboardLayoutProps {
  caseIndex?: number;
}

// ===========================================================================
// Utility Components
// ===========================================================================

function StatusDot({ status }: { status: 'safe' | 'caution' | 'danger' | 'pending' }) {
  const colors = {
    safe: 'bg-emerald-700',
    caution: 'bg-amber-500',
    danger: 'bg-red-700',
    pending: 'bg-slate-400',
  };
  return <div className={`w-2.5 h-2.5 rounded-full ${colors[status]}`} />;
}

function Badge({
  children,
  variant = 'default',
}: {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'pending' | 'info';
}) {
  const variants = {
    default: 'bg-slate-100 text-slate-700',
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700',
    danger: 'bg-red-50 text-red-700',
    pending: 'bg-slate-100 text-slate-500',
    info: 'bg-blue-50 text-blue-700',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${variants[variant]}`}>
      {children}
    </span>
  );
}

// ===========================================================================
// ROW 1: Vital Stability Strip
// ===========================================================================

function VitalStabilityStrip({ patient }: { patient: TeachingCase }) {
  const { hr, sbp, dbp, rr, spo2, o2Device, temp } = patient.vitals;

  const vitals = [
    {
      label: 'HR',
      value: hr,
      unit: 'bpm',
      icon: Heart,
      alert: hr > 100,
      alertLabel: hr > 100 ? 'Tachycardia' : null,
    },
    {
      label: 'BP',
      value: `${sbp}/${dbp}`,
      unit: 'mmHg',
      icon: Activity,
      alert: sbp < 90,
      alertLabel: sbp < 90 ? 'Hypotension' : null,
    },
    {
      label: 'SpO2',
      value: `${spo2}%`,
      suffix: o2Device && o2Device !== 'Room Air' ? `[${o2Device}]` : '[RA]',
      icon: Droplets,
      alert: spo2 < 95,
      alertLabel: spo2 < 95 ? 'Hypoxia' : null,
    },
    {
      label: 'RR',
      value: rr,
      unit: '/min',
      icon: Wind,
      alert: rr > 20,
      alertLabel: rr > 20 ? 'Tachypnea' : null,
    },
    {
      label: 'Temp',
      value: temp.toFixed(1),
      unit: '°C',
      icon: Thermometer,
      alert: temp > 38,
      alertLabel: temp > 38 ? 'Febrile' : null,
    },
  ];

  const hasAnyAlert = vitals.some((v) => v.alert);

  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-900">Vital Stability</h2>
        </div>
      </div>
      <div className="grid grid-cols-5">
        {vitals.map((vital, idx) => {
          const Icon = vital.icon;
          return (
            <div key={idx} className="text-center p-2 bg-slate-50">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Icon className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-[10px] text-slate-600 uppercase font-medium">{vital.label}</span>
              </div>
              {/* Only the value number is colored red when abnormal */}
              <p className={`text-xl font-bold ${vital.alert ? 'text-red-700' : 'text-slate-900'}`}>
                {vital.value}
              </p>
              {vital.suffix && (
                <p className="text-[10px] text-slate-600">{vital.suffix}</p>
              )}
              {/* Only the issue label is colored red */}
              {vital.alertLabel && (
                <p className="text-[9px] text-red-600 font-semibold uppercase mt-0.5">{vital.alertLabel}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ===========================================================================
// ROW 2: Hemodynamic Stress (full width)
// ===========================================================================

function HemodynamicsCard({ patient }: { patient: TeachingCase }) {
  const hemodynamics = calculateHemodynamics(patient.vitals);
  const { shockIndex, modifiedShockIndex, map, pulsePressure } = hemodynamics;

  const siStatus =
    shockIndex !== null && shockIndex > 0.9
      ? 'danger'
      : shockIndex !== null && shockIndex > 0.7
      ? 'caution'
      : 'safe';

  const msiStatus =
    modifiedShockIndex !== null && modifiedShockIndex > 1.3 ? 'danger' : 'safe';

  const mapStatus = map < 65 ? 'danger' : map < 70 ? 'caution' : 'safe';

  // Only color the value number and the status label — not the card background
  const valueColors = {
    safe: 'text-slate-900',
    caution: 'text-amber-600',
    danger: 'text-red-700',
  };

  const statusLabelColors = {
    safe: '',
    caution: 'text-amber-600',
    danger: 'text-red-700',
  };

  return (
    <div className="p-3">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="w-4 h-4 text-slate-500" />
        <h2 className="text-sm font-semibold text-slate-900">Hemodynamic Stress</h2>
      </div>
      <div className="grid grid-cols-2">

        {/* Shock Index (HR/SBP) */}
        <div className="p-3 bg-slate-50 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <HeartPulse className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">Shock Index</span>
          </div>
          <div className={`text-2xl font-bold ${valueColors[siStatus]}`}>
            {shockIndex?.toFixed(2) ?? '—'}
          </div>
          <p className="text-[9px] mt-0.5 text-slate-600">HR / SBP</p>
          {siStatus !== 'safe' && (
            <p className={`text-[10px] font-semibold mt-1 ${statusLabelColors[siStatus]}`}>
              {siStatus === 'danger' ? '> 0.9 Risk' : '> 0.7 Caution'}
            </p>
          )}
        </div>

        {/* Modified Shock Index (HR/MAP) */}
        <div className="p-3 bg-slate-50 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Activity className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">MSI</span>
          </div>
          <div className={`text-2xl font-bold ${valueColors[msiStatus]}`}>
            {modifiedShockIndex?.toFixed(2) ?? '—'}
          </div>
          <p className="text-[9px] mt-0.5 text-slate-600">HR / MAP</p>
          {msiStatus === 'danger' && (
            <p className={`text-[10px] font-semibold mt-1 ${statusLabelColors.danger}`}>&gt; 1.3 Abnormal</p>
          )}
        </div>

        {/* MAP */}
        <div className="p-3 bg-slate-50 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Gauge className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">MAP</span>
          </div>
          <div className={`text-2xl font-bold ${valueColors[mapStatus]}`}>
            {map}
            <span className="text-sm ml-0.5 font-normal text-slate-600">mmHg</span>
          </div>
          <p className="text-[9px] mt-0.5 text-slate-600">(SBP + 2×DBP) / 3</p>
          {mapStatus !== 'safe' && (
            <p className={`text-[10px] font-semibold mt-1 ${statusLabelColors[mapStatus]}`}>
              {mapStatus === 'danger' ? '< 65 Critical' : '< 70 Low'}
            </p>
          )}
        </div>

        {/* Pulse Pressure */}
        <div className="p-3 bg-slate-50 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">PP</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {pulsePressure}
            <span className="text-sm ml-0.5 font-normal text-slate-600">mmHg</span>
          </div>
          <p className="text-[9px] mt-0.5 text-slate-600">SBP − DBP</p>
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
// ROW 3 LEFT: Prior CTPA History Card
// ===========================================================================

function PriorImagingCard({ patient }: { patient: TeachingCase }) {
  const { priorImaging } = patient;
  const daysSince = getDaysSincePriorImaging(priorImaging);
  const isRecent = daysSince !== null && daysSince < 90;
  const isDuplicateRisk = daysSince !== null && daysSince < 7;

  if (!priorImaging) {
    return (
      <div className="h-full p-3">
        <div className="flex items-center gap-2 mb-3">
          <Scan className="w-4 h-4 text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-900">Prior CTPA</h2>
        </div>
        <div className="text-center mt-4">
          <History className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="text-sm text-slate-500">None on file</p>
        </div>
      </div>
    );
  }

  const resultColors = {
    Positive: 'text-red-700 bg-red-50',
    Negative: 'text-emerald-700 bg-emerald-50',
    Indeterminate: 'text-amber-700 bg-amber-50',
  };

  return (
    <div className={`h-full p-3 ${isDuplicateRisk ? 'bg-amber-50/30' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Scan className="w-4 h-4 text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-900">Prior {priorImaging.modality}</h2>
        </div>
        {isDuplicateRisk && (
          <Badge variant="warning">
            <AlertTriangle className="w-3 h-3 mr-1" />Duplicate Risk
          </Badge>
        )}
      </div>
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-sm font-medium ${isRecent ? 'text-amber-700' : 'text-slate-600'}`}>
            {formatPriorImagingDate(priorImaging)}
          </span>
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${resultColors[priorImaging.result]}`}>
            {priorImaging.result}
          </span>
        </div>
        <p className="text-xs text-slate-600">{priorImaging.reportSummary}</p>
        {isDuplicateRisk && (
          <p className="text-xs text-amber-700 mt-2 font-medium">Consider if repeat imaging is necessary</p>
        )}
      </div>
    </div>
  );
}

// ===========================================================================
// ROW 3 MIDDLE: Safety Barriers Card
// ===========================================================================

function SafetyBarriersCard({ patient }: { patient: TeachingCase }) {
  const { egfr, hasContrastAllergy, bleedingRisk } = patient;

  const renalStatus = egfr >= 60 ? 'safe' : egfr >= 30 ? 'caution' : 'danger';
  const renalLabel = egfr >= 60 ? 'Safe' : egfr >= 30 ? 'Caution' : 'Impaired';

  const bleedingColors = {
    low: 'text-emerald-700 bg-emerald-50',
    moderate: 'text-amber-700 bg-amber-50',
    high: 'text-red-700 bg-red-50',
  };

  const statusColors = {
    safe: 'text-emerald-600',
    caution: 'text-amber-600',
    danger: 'text-red-600',
  };

  return (
    <div className="h-full p-3">
      <div className="flex items-center gap-2 mb-3">
        <ShieldAlert className="w-4 h-4 text-slate-500" />
        <h2 className="text-sm font-semibold text-slate-900">Safety Barriers</h2>
      </div>
      <div>
        {/* Renal Function */}
        <div className="flex items-center justify-between p-3 bg-slate-50">
          <div className="flex items-center gap-2">
            <Droplet className="w-4 h-4 text-slate-500" />
            <span className="text-sm text-slate-900">eGFR</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">{egfr}</span>
            <StatusDot status={renalStatus} />
            <span className={`text-xs font-medium ${statusColors[renalStatus]}`}>{renalLabel}</span>
          </div>
        </div>

        {/* Contrast Allergy */}
        <div className={`flex items-center justify-between p-3 ${hasContrastAllergy ? 'bg-red-50' : 'bg-slate-50'}`}>
          <div className="flex items-center gap-2">
            <Ban className="w-4 h-4 text-slate-500" />
            <span className="text-sm text-slate-900">Contrast Allergy</span>
          </div>
          {hasContrastAllergy ? (
            <Badge variant="danger">ALLERGY</Badge>
          ) : (
            <span className="text-xs text-emerald-600 font-medium">None</span>
          )}
        </div>

        {/* Bleeding Risk */}
        <div className="flex items-center justify-between p-3 bg-slate-50">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-slate-500" />
            <span className="text-sm text-slate-900">Bleeding Risk</span>
          </div>
          <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${bleedingColors[bleedingRisk]}`}>
            {bleedingRisk}
          </span>
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
// ROW 3 RIGHT: Medications Card
// ===========================================================================

function MedicationsCard({ patient }: { patient: TeachingCase }) {
  const today = new Date();

  const medsWithAdherence = useMemo(() => {
    return patient.medications.map((med) => {
      const refillDate = new Date(med.lastRefill);
      const daysSinceRefill = Math.floor(
        (today.getTime() - refillDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const daysLate = daysSinceRefill - med.daysSupply;
      const hasGap = daysLate > 5;
      return { ...med, hasGap, daysLate };
    });
  }, [patient.medications]);

  return (
    <div className="h-full p-3">
      <div className="flex items-center gap-2 mb-3">
        <Pill className="w-4 h-4 text-slate-500" />
        <h2 className="text-sm font-semibold text-slate-900">Medications</h2>
      </div>
      <div>
        {patient.medications.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">No active medications</p>
        ) : (
          <div>
            {medsWithAdherence.slice(0, 5).map((med, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 p-3 bg-slate-50"
              >
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-medium text-slate-900 truncate block">
                    {med.name}
                  </span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className={`text-[10px] font-medium ${med.hasGap ? 'text-red-700' : 'text-slate-600'}`}>
                      {med.hasGap ? 'Non-Adherent' : 'Adherent'}
                    </span>
                    <span className="text-[10px] text-slate-500">·</span>
                    <span className="text-[10px] text-slate-600">{med.dose}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ===========================================================================
// ROW 2 RIGHT: Medical Timeline Card
// ===========================================================================

function MedicalTimelineCard({ patient }: { patient: TeachingCase }) {
  const statusDots: Record<string, string> = {
    Positive: 'bg-red-700',
    Negative: 'bg-emerald-700',
    Neutral: 'bg-slate-400',
  };

  return (
    <div className="h-full p-3">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-slate-500" />
        <h2 className="text-sm font-semibold text-slate-900">Medical Timeline</h2>
      </div>
      <div>
        {patient.timeline.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">No events recorded</p>
        ) : (
          <div>
            {patient.timeline
              .filter((event) => !event.title.toLowerCase().includes('d-dimer'))
              .slice(0, 5)
              .map((event, idx) => (
              <div key={idx} className="flex items-start gap-2 p-3 bg-slate-50">
                <div className="flex-shrink-0 mt-0.5">
                  {event.status ? (
                    <div className={`w-2 h-2 rounded-full mt-1 ${statusDots[event.status] ?? 'bg-slate-400'}`} />
                  ) : (
                    <div className="w-2 h-2 rounded-full mt-1 bg-slate-300" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-medium text-slate-900 truncate block">{event.title}</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[10px] text-slate-600">{event.date}</span>
                    {event.subtitle && (
                      <>
                        <span className="text-[10px] text-slate-500">·</span>
                        <span className="text-[10px] text-slate-600 truncate">{event.subtitle}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ===========================================================================
// Main Component
// ===========================================================================

export default function DashboardLayout({ caseIndex = 0 }: DashboardLayoutProps) {
  const patient = TEACHING_CASES[caseIndex] || DEFAULT_CASE;
  return (
    <div>

      {/* Patient Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900">{patient.name}</h1>
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-sm text-slate-500">
            <span>{patient.age}{patient.gender === 'Male' ? 'M' : 'F'}</span>
            <span>•</span>
            <span>{patient.mrn}</span>
          </div>
          <div className="mt-1">
            <span className="text-xs text-slate-600">
              <span className="font-medium">CC:</span> {patient.chiefComplaint}
            </span>
          </div>
        </div>
      </div>

      {/* Panel */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-200">

        {/* ROW 1: Vital Stability Strip */}
        <VitalStabilityStrip patient={patient} />

        {/* ROW 2: Hemodynamic Stress · Medications · Medical Timeline */}
        <div className="grid grid-cols-3 divide-x divide-slate-200">
          <HemodynamicsCard patient={patient} />
          <MedicationsCard patient={patient} />
          <MedicalTimelineCard patient={patient} />
        </div>

        {/* ROW 3: Prior CTPA · Safety Barriers */}
        <div className="grid grid-cols-2 divide-x divide-slate-200">
          <PriorImagingCard patient={patient} />
          <SafetyBarriersCard patient={patient} />
        </div>

        {/* Footer */}
        <div className="text-center py-2">
          <p className="text-[9px] text-slate-600 uppercase tracking-wider">
            Luminur PE Calculator · Data Aggregation Tool · Not a Diagnostic Device
          </p>
        </div>

      </div>

    </div>
  );
}
