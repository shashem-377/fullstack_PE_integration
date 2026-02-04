/**
 * Clinical Dashboard Layout - FDA 21st Century Cures Act Compliant
 * 
 * Layout Hierarchy (Physician Feedback):
 * - Row 1: Vital Stability Strip (Sick vs Not Sick)
 * - Row 2: Hemodynamics & Clinical Scores (4PEPS, Wells, PERC)
 * - Row 3: Biomarkers, Prior Imaging, Safety Barriers
 * 
 * Standard medical calculators only - No AI predictions
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  ClipboardCopy,
  Check,
  Activity,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Heart,
  Droplets,
  Wind,
  Thermometer,
  ChevronRight,
  X,
  Pill,
  Stethoscope,
  Scan,
  Syringe,
  HeartPulse,
  Gauge,
  CalendarX,
  CalendarCheck,
  TestTube,
  FlaskConical,
  FileQuestion,
  TrendingUp,
  ShieldCheck,
  HelpCircle,
  AlertOctagon,
  Calculator,
  ShieldAlert,
  Droplet,
  History,
  Ban,
} from 'lucide-react';
import { 
  TEACHING_CASES, 
  DEFAULT_CASE, 
  type TeachingCase,
  type TimelineEvent,
  type FourPEPSResult,
  calculateHemodynamics,
  calculateAgeAdjustedDdimer,
  getClinicalContext,
  hasConfoundingContext,
  calculate4PEPS,
  getDaysSincePriorImaging,
  formatPriorImagingDate,
} from '../data/demoData';

// ===========================================================================
// Types
// ===========================================================================

interface DashboardLayoutProps {
  isDemoMode?: boolean;
  selectedCaseIndex?: number;
}

type ModalType = null | 'wells' | 'perc' | '4peps';

// ===========================================================================
// Utility Components
// ===========================================================================

function StatusDot({ status }: { status: 'safe' | 'caution' | 'danger' | 'pending' }) {
  const colors = {
    safe: 'bg-emerald-500',
    caution: 'bg-amber-500',
    danger: 'bg-red-500',
    pending: 'bg-slate-400',
  };
  return <div className={`w-2.5 h-2.5 rounded-full ${colors[status]}`} />;
}

function Badge({ 
  children, 
  variant = 'default' 
}: { 
  children: React.ReactNode; 
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'pending' | 'info';
}) {
  const variants = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    pending: 'bg-slate-100 text-slate-500 border-slate-200 border-dashed',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded border ${variants[variant]}`}>
      {children}
    </span>
  );
}

// ===========================================================================
// Modal Component
// ===========================================================================

function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 border border-slate-200">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded"><X className="w-4 h-4 text-slate-500" /></button>
        </div>
        <div className="p-4 max-h-[60vh] overflow-y-auto">{children}</div>
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
          <button onClick={onClose} className="w-full py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded">Close</button>
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
// Score Breakdowns for Modals
// ===========================================================================

const WELLS_CRITERIA = [
  { criterion: 'Clinical signs of DVT', points: 3.0 },
  { criterion: 'PE is #1 diagnosis or equally likely', points: 3.0 },
  { criterion: 'Heart rate > 100 bpm', points: 1.5 },
  { criterion: 'Immobilization or surgery (past 4 weeks)', points: 1.5 },
  { criterion: 'Previous DVT/PE', points: 1.5 },
  { criterion: 'Hemoptysis', points: 1.0 },
  { criterion: 'Active malignancy', points: 1.0 },
];

function WellsBreakdown({ score }: { score: number }) {
  const activeCriteria = useMemo(() => {
    const result: boolean[] = [];
    let remaining = score;
    for (const c of WELLS_CRITERIA) {
      if (remaining >= c.points) { result.push(true); remaining -= c.points; } 
      else { result.push(false); }
    }
    return result;
  }, [score]);

  return (
    <div className="space-y-2">
      <div className="text-xs text-slate-500 mb-3 p-2 bg-blue-50 rounded border border-blue-100">
        Standard Wells Criteria for PE (validated clinical calculator)
      </div>
      {WELLS_CRITERIA.map((item, idx) => (
        <div key={idx} className={`flex items-center justify-between p-2 rounded text-sm ${activeCriteria[idx] ? 'bg-amber-50 border border-amber-200' : 'bg-slate-50 border border-slate-100'}`}>
          <div className="flex items-center gap-2">
            {activeCriteria[idx] ? <CheckCircle2 className="w-4 h-4 text-amber-600" /> : <div className="w-4 h-4 rounded-full border border-slate-300" />}
            <span className={activeCriteria[idx] ? 'text-amber-900' : 'text-slate-500'}>{item.criterion}</span>
          </div>
          <span className={`font-mono text-xs ${activeCriteria[idx] ? 'text-amber-700' : 'text-slate-400'}`}>+{item.points}</span>
        </div>
      ))}
      <div className="flex items-center justify-between pt-2 border-t border-slate-200">
        <span className="text-sm font-medium text-slate-700">Total Score</span>
        <span className="text-lg font-bold text-slate-900">{score.toFixed(1)}</span>
      </div>
    </div>
  );
}

const PERC_CRITERIA = ['Age ≥ 50', 'HR ≥ 100', 'SpO2 < 95%', 'Leg Swelling', 'Hemoptysis', 'Recent Surgery', 'Prior VTE', 'Hormone Use'];

function PERCBreakdown({ score, isNegative }: { score: number; isNegative: boolean }) {
  return (
    <div className="space-y-3">
      <div className="text-xs text-slate-500 p-2 bg-blue-50 rounded border border-blue-100">
        PERC Rule: If LOW pretest probability AND all 8 criteria are negative, PE can be excluded without further testing.
      </div>
      <div className={`p-3 rounded text-sm ${isNegative ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'}`}>
        {isNegative ? (
          <div className="flex items-center gap-2 text-emerald-700"><CheckCircle2 className="w-4 h-4" /><span className="font-medium">All criteria negative (PERC = 0)</span></div>
        ) : (
          <div className="flex items-center gap-2 text-amber-700"><AlertTriangle className="w-4 h-4" /><span className="font-medium">{score} criteria positive</span></div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {PERC_CRITERIA.map((criterion, idx) => {
          const isPositive = idx < score;
          return (
            <div key={idx} className={`flex items-center gap-2 p-2 rounded text-xs ${isPositive ? 'bg-red-50 text-red-700' : 'bg-slate-50 text-slate-600'}`}>
              {isPositive ? <AlertCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
              <span>{criterion}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FourPEPSBreakdown({ result }: { result: FourPEPSResult }) {
  const tierColors = {
    'Very Low': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Low': 'bg-blue-50 text-blue-700 border-blue-200',
    'Intermediate': 'bg-amber-50 text-amber-700 border-amber-200',
    'High': 'bg-red-50 text-red-700 border-red-200',
  };
  
  return (
    <div className="space-y-3">
      <div className="text-xs text-slate-500 p-2 bg-blue-50 rounded border border-blue-100">
        4PEPS: 4-Level Pulmonary Embolism Clinical Probability Score. Integrates age, sex, vitals, and clinical history.
      </div>
      <div className={`p-3 rounded text-sm border ${tierColors[result.tier]}`}>
        <div className="flex items-center justify-between">
          <span className="font-medium">Risk Tier: {result.tier}</span>
          <span className="font-bold text-lg">{result.score} pts</span>
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">Score Breakdown:</p>
        {result.breakdown.length > 0 ? (
          result.breakdown.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded text-sm text-slate-700">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              <span>{item}</span>
            </div>
          ))
        ) : (
          <div className="p-2 bg-slate-50 rounded text-sm text-slate-500 italic">No positive criteria</div>
        )}
      </div>
      <div className="text-xs text-slate-500 p-2 bg-slate-50 rounded border border-slate-200">
        <p className="font-medium mb-1">Risk Tier Interpretation:</p>
        <ul className="space-y-0.5">
          <li>&lt; 0 pts: Very Low Risk</li>
          <li>0-5 pts: Low Risk</li>
          <li>6-12 pts: Intermediate Risk</li>
          <li>&gt; 12 pts: High Risk</li>
        </ul>
      </div>
    </div>
  );
}

// ===========================================================================
// ROW 1: Vital Stability Strip (Top Priority)
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

  const hasAnyAlert = vitals.some(v => v.alert);

  return (
    <div className={`bg-white border rounded-lg ${hasAnyAlert ? 'border-red-300' : 'border-slate-200'}`}>
      <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-900">Vital Stability</h2>
        </div>
        {hasAnyAlert && <Badge variant="danger">Abnormal</Badge>}
      </div>
      <div className="p-3 grid grid-cols-5 gap-3">
        {vitals.map((vital, idx) => {
          const Icon = vital.icon;
          return (
            <div key={idx} className={`text-center p-2 rounded-lg border ${vital.alert ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-100'}`}>
              <div className="flex items-center justify-center gap-1 mb-1">
                <Icon className={`w-3.5 h-3.5 ${vital.alert ? 'text-red-600' : 'text-slate-400'}`} />
                <span className="text-[10px] text-slate-500 uppercase font-medium">{vital.label}</span>
              </div>
              <p className={`text-xl font-bold ${vital.alert ? 'text-red-700' : 'text-slate-900'}`}>{vital.value}</p>
              {vital.suffix && <p className={`text-[10px] ${vital.alert ? 'text-red-600 font-medium' : 'text-slate-500'}`}>{vital.suffix}</p>}
              {vital.alertLabel && <p className="text-[9px] text-red-600 font-semibold uppercase mt-0.5">{vital.alertLabel}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ===========================================================================
// ROW 2 LEFT: Hemodynamics Card
// ===========================================================================

function HemodynamicsCard({ patient }: { patient: TeachingCase }) {
  const hemodynamics = calculateHemodynamics(patient.vitals);
  const { shockIndex, modifiedShockIndex, map, pulsePressure } = hemodynamics;
  
  // Shock Index: Normal < 0.7, Caution 0.7-0.9, Danger > 0.9
  const siStatus = shockIndex !== null && shockIndex > 0.9 ? 'danger' : shockIndex !== null && shockIndex > 0.7 ? 'caution' : 'safe';
  
  // Modified Shock Index (HR/MAP): Normal 0.7-1.3, Abnormal > 1.3
  const msiStatus = modifiedShockIndex !== null && modifiedShockIndex > 1.3 ? 'danger' : 'safe';
  
  // MAP: Danger < 65, Caution 65-70, Safe > 70
  const mapStatus = map < 65 ? 'danger' : map < 70 ? 'caution' : 'safe';
  
  const statusColors = {
    safe: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    caution: 'text-amber-600 bg-amber-50 border-amber-200',
    danger: 'text-red-600 bg-red-50 border-red-200',
  };
  
  return (
    <div className="bg-white border border-slate-200 rounded-lg h-full">
      <div className="px-4 py-2 border-b border-slate-100 flex items-center gap-2">
        <Activity className="w-4 h-4 text-slate-500" />
        <h2 className="text-sm font-semibold text-slate-900">Hemodynamic Stress</h2>
      </div>
      {/* 2x2 Grid Layout */}
      <div className="p-3 grid grid-cols-2 gap-2">
        {/* Top Left: Shock Index (HR/SBP) */}
        <div className={`p-2.5 rounded-lg border ${statusColors[siStatus]}`}>
          <div className="flex items-center gap-1.5 mb-1">
            <HeartPulse className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold uppercase tracking-wide">Shock Index</span>
          </div>
          <div className="text-2xl font-bold">{shockIndex?.toFixed(2) ?? '—'}</div>
          <p className="text-[9px] mt-0.5 opacity-70">HR / SBP</p>
          {siStatus !== 'safe' && (
            <p className="text-[10px] font-semibold mt-1">
              {siStatus === 'danger' ? '> 0.9 Risk' : '> 0.7 Caution'}
            </p>
          )}
        </div>
        
        {/* Top Right: Modified Shock Index (HR/MAP) - NEW */}
        <div className={`p-2.5 rounded-lg border ${statusColors[msiStatus]}`}>
          <div className="flex items-center gap-1.5 mb-1">
            <Activity className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold uppercase tracking-wide">MSI</span>
          </div>
          <div className="text-2xl font-bold">{modifiedShockIndex?.toFixed(2) ?? '—'}</div>
          <p className="text-[9px] mt-0.5 opacity-70">HR / MAP</p>
          {msiStatus === 'danger' && (
            <p className="text-[10px] font-semibold mt-1">&gt; 1.3 Abnormal</p>
          )}
        </div>
        
        {/* Bottom Left: MAP */}
        <div className={`p-2.5 rounded-lg border ${statusColors[mapStatus]}`}>
          <div className="flex items-center gap-1.5 mb-1">
            <Gauge className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold uppercase tracking-wide">MAP</span>
          </div>
          <div className="text-2xl font-bold">{map}<span className="text-sm ml-0.5 font-normal opacity-70">mmHg</span></div>
          <p className="text-[9px] mt-0.5 opacity-70">(SBP + 2×DBP) / 3</p>
        </div>
        
        {/* Bottom Right: Pulse Pressure */}
        <div className="p-2.5 rounded-lg border bg-slate-50 border-slate-200 text-slate-700">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold uppercase tracking-wide">PP</span>
          </div>
          <div className="text-2xl font-bold">{pulsePressure}<span className="text-sm ml-0.5 font-normal opacity-70">mmHg</span></div>
          <p className="text-[9px] mt-0.5 opacity-70">SBP - DBP</p>
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
// ROW 2 RIGHT: Clinical Scores Card (Wells, PERC, 4PEPS)
// ===========================================================================

function ClinicalScoresCard({ 
  patient, 
  onWellsClick, 
  onPERCClick,
  on4PEPSClick,
}: { 
  patient: TeachingCase; 
  onWellsClick: () => void; 
  onPERCClick: () => void;
  on4PEPSClick: () => void;
}) {
  const { wellsScore, wellsRisk, percScore, percNegative } = patient;
  const fourPEPS = calculate4PEPS(patient);
  
  const riskConfig = {
    low: { label: 'Low', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    moderate: { label: 'Mod', color: 'text-amber-700 bg-amber-50 border-amber-200' },
    high: { label: 'High', color: 'text-red-700 bg-red-50 border-red-200' },
  };
  
  const fourPEPSColors = {
    'Very Low': 'text-emerald-700 bg-emerald-50 border-emerald-200',
    'Low': 'text-blue-700 bg-blue-50 border-blue-200',
    'Intermediate': 'text-amber-700 bg-amber-50 border-amber-200',
    'High': 'text-red-700 bg-red-50 border-red-200',
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg h-full">
      <div className="px-4 py-2 border-b border-slate-100 flex items-center gap-2">
        <Calculator className="w-4 h-4 text-slate-500" />
        <h2 className="text-sm font-semibold text-slate-900">Clinical Scores</h2>
      </div>
      <div className="p-3 grid grid-cols-3 gap-2">
        {/* Wells Score */}
        <button onClick={onWellsClick} className="text-left p-2 border border-slate-200 rounded-lg hover:border-slate-300 hover:bg-slate-50 group">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-medium text-slate-500 uppercase">Wells</span>
            <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900">{wellsScore.toFixed(1)}</span>
          </div>
          <div className={`mt-1 px-1.5 py-0.5 rounded text-[10px] font-medium border inline-block ${riskConfig[wellsRisk].color}`}>
            {riskConfig[wellsRisk].label}
          </div>
        </button>
        
        {/* PERC Rule */}
        <button onClick={onPERCClick} className="text-left p-2 border border-slate-200 rounded-lg hover:border-slate-300 hover:bg-slate-50 group">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-medium text-slate-500 uppercase">PERC</span>
            <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900">{percNegative ? '0' : percScore}</span>
          </div>
          <div className={`mt-1 px-1.5 py-0.5 rounded text-[10px] font-medium border inline-block ${percNegative ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-amber-700 bg-amber-50 border-amber-200'}`}>
            {percNegative ? 'Pass' : 'Fail'}
          </div>
        </button>
        
        {/* 4PEPS Score */}
        <button onClick={on4PEPSClick} className="text-left p-2 border border-slate-200 rounded-lg hover:border-slate-300 hover:bg-slate-50 group">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-medium text-slate-500 uppercase">4PEPS</span>
            <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900">{fourPEPS.score}</span>
          </div>
          <div className={`mt-1 px-1.5 py-0.5 rounded text-[10px] font-medium border inline-block ${fourPEPSColors[fourPEPS.tier]}`}>
            {fourPEPS.tier}
          </div>
        </button>
      </div>
    </div>
  );
}

// ===========================================================================
// ROW 3 LEFT: D-Dimer Context Card
// ===========================================================================

function DDimerContextCard({ patient }: { patient: TeachingCase }) {
  const { ddimer, age, activeProblems } = patient;
  const clinicalContext = getClinicalContext(activeProblems);
  const standardCutoff = 0.50;
  const ageAdjustedCutoff = calculateAgeAdjustedDdimer(age);
  const useAgeAdjusted = age > 50;
  
  // PENDING STATE
  if (ddimer.value === null) {
    return (
      <div className="bg-white border-2 border-dashed border-slate-300 rounded-lg h-full">
        <div className="px-4 py-2 border-b border-dashed border-slate-200 flex items-center gap-2">
          <TestTube className="w-4 h-4 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-500">D-Dimer</h2>
          <Badge variant="pending"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
        </div>
        <div className="p-6 text-center">
          <Clock className="w-12 h-12 mx-auto text-slate-300 mb-2" />
          <p className="text-lg font-medium text-slate-500">PENDING</p>
          <p className="text-xs text-slate-400">Awaiting result</p>
        </div>
      </div>
    );
  }
  
  const isElevatedStandard = ddimer.value > standardCutoff;
  const isNegativeAgeAdjusted = useAgeAdjusted && ddimer.value <= ageAdjustedCutoff;
  const hasConfounders = clinicalContext.contextMessages.length > 0;
  
  return (
    <div className="bg-white border border-slate-200 rounded-lg h-full">
      <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-900">D-Dimer</h2>
        </div>
        {hasConfounders && <Badge variant="info"><HelpCircle className="w-3 h-3 mr-1" />Context</Badge>}
      </div>
      <div className="p-3">
        {/* Value */}
        <div className="text-center mb-3">
          <span className={`text-4xl font-bold ${isElevatedStandard ? 'text-red-600' : 'text-emerald-600'}`}>
            {ddimer.value.toFixed(2)}
          </span>
          <span className="text-sm text-slate-500 ml-1">{ddimer.unit}</span>
        </div>
        
        {/* Thresholds */}
        <div className="space-y-1.5 text-sm">
          <div className="flex items-center justify-between p-1.5 bg-slate-50 rounded">
            <span className="text-slate-600">Standard</span>
            <div className="flex items-center gap-1">
              <span className="font-mono text-slate-900">0.50</span>
              {ddimer.value <= standardCutoff ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
            </div>
          </div>
          {useAgeAdjusted && (
            <div className="flex items-center justify-between p-1.5 bg-slate-50 rounded">
              <span className="text-slate-600">Age-Adj ({age}y)</span>
              <div className="flex items-center gap-1">
                <span className="font-mono text-slate-900">{ageAdjustedCutoff.toFixed(2)}</span>
                {isNegativeAgeAdjusted ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
              </div>
            </div>
          )}
        </div>
        
        {/* Context */}
        {hasConfounders && (
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
            {clinicalContext.contextMessages.map((msg, i) => (
              <div key={i} className="flex items-start gap-1">
                <span>•</span><span>{msg}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ===========================================================================
// ROW 3 MIDDLE: Prior CTPA History Card
// ===========================================================================

function PriorImagingCard({ patient }: { patient: TeachingCase }) {
  const { priorImaging } = patient;
  const daysSince = getDaysSincePriorImaging(priorImaging);
  const isRecent = daysSince !== null && daysSince < 90; // < 3 months
  const isDuplicateRisk = daysSince !== null && daysSince < 7; // < 1 week
  
  if (!priorImaging) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg h-full">
        <div className="px-4 py-2 border-b border-slate-100 flex items-center gap-2">
          <Scan className="w-4 h-4 text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-900">Prior CTPA</h2>
        </div>
        <div className="p-4 text-center">
          <History className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="text-sm text-slate-500">None on file</p>
        </div>
      </div>
    );
  }
  
  const resultColors = {
    Positive: 'text-red-700 bg-red-50 border-red-200',
    Negative: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    Indeterminate: 'text-amber-700 bg-amber-50 border-amber-200',
  };
  
  return (
    <div className={`bg-white border rounded-lg h-full ${isDuplicateRisk ? 'border-amber-300' : 'border-slate-200'}`}>
      <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scan className="w-4 h-4 text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-900">Prior {priorImaging.modality}</h2>
        </div>
        {isDuplicateRisk && <Badge variant="warning"><AlertTriangle className="w-3 h-3 mr-1" />Duplicate Risk</Badge>}
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-medium ${isRecent ? 'text-amber-700' : 'text-slate-600'}`}>
            {formatPriorImagingDate(priorImaging)}
          </span>
          <span className={`px-2 py-0.5 rounded text-xs font-medium border ${resultColors[priorImaging.result]}`}>
            {priorImaging.result}
          </span>
        </div>
        <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded">{priorImaging.reportSummary}</p>
        {isDuplicateRisk && (
          <p className="text-xs text-amber-700 mt-2 font-medium">
            Consider if repeat imaging is necessary
          </p>
        )}
      </div>
    </div>
  );
}

// ===========================================================================
// ROW 3 RIGHT: Safety Barriers Card
// ===========================================================================

function SafetyBarriersCard({ patient }: { patient: TeachingCase }) {
  const { egfr, hasContrastAllergy, bleedingRisk } = patient;
  
  const renalStatus = egfr >= 60 ? 'safe' : egfr >= 30 ? 'caution' : 'danger';
  const renalLabel = egfr >= 60 ? 'Safe' : egfr >= 30 ? 'Caution' : 'Impaired';
  
  const bleedingColors = {
    low: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    moderate: 'text-amber-700 bg-amber-50 border-amber-200',
    high: 'text-red-700 bg-red-50 border-red-200',
  };
  
  const statusColors = {
    safe: 'text-emerald-600',
    caution: 'text-amber-600',
    danger: 'text-red-600',
  };
  
  return (
    <div className="bg-white border border-slate-200 rounded-lg h-full">
      <div className="px-4 py-2 border-b border-slate-100 flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-slate-500" />
        <h2 className="text-sm font-semibold text-slate-900">Safety Barriers</h2>
      </div>
      <div className="p-3 space-y-2">
        {/* Renal Function */}
        <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100">
          <div className="flex items-center gap-2">
            <Droplet className="w-4 h-4 text-slate-500" />
            <span className="text-sm text-slate-700">eGFR</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">{egfr}</span>
            <StatusDot status={renalStatus} />
            <span className={`text-xs font-medium ${statusColors[renalStatus]}`}>{renalLabel}</span>
          </div>
        </div>
        
        {/* Contrast Allergy */}
        <div className={`flex items-center justify-between p-2 rounded border ${hasContrastAllergy ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-100'}`}>
          <div className="flex items-center gap-2">
            <Ban className="w-4 h-4 text-slate-500" />
            <span className="text-sm text-slate-700">Contrast Allergy</span>
          </div>
          {hasContrastAllergy ? (
            <Badge variant="danger">ALLERGY</Badge>
          ) : (
            <span className="text-xs text-emerald-600 font-medium">None</span>
          )}
        </div>
        
        {/* Bleeding Risk */}
        <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-slate-500" />
            <span className="text-sm text-slate-700">Bleeding Risk</span>
          </div>
          <span className={`px-2 py-0.5 rounded text-xs font-medium border capitalize ${bleedingColors[bleedingRisk]}`}>
            {bleedingRisk}
          </span>
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
// Timeline & Medications (Collapsible)
// ===========================================================================

function TimelineMedicationsRow({ patient }: { patient: TeachingCase }) {
  const iconMap: Record<TimelineEvent['type'], React.ComponentType<{ className?: string }>> = {
    Imaging: Scan, Diagnosis: Stethoscope, Lab: TestTube, Medication: Pill, Procedure: Syringe,
  };
  const statusColors: Record<string, string> = {
    Positive: 'text-red-600 bg-red-50 border-red-200',
    Negative: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    Neutral: 'text-slate-600 bg-slate-50 border-slate-200',
  };

  const today = new Date();
  const medsWithAdherence = useMemo(() => {
    return patient.medications.map(med => {
      const refillDate = new Date(med.lastRefill);
      const daysSinceRefill = Math.floor((today.getTime() - refillDate.getTime()) / (1000 * 60 * 60 * 24));
      const daysLate = daysSinceRefill - med.daysSupply;
      const hasGap = daysLate > 5;
      return { ...med, hasGap, daysLate };
    });
  }, [patient.medications]);

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Timeline */}
      <div className="bg-white border border-slate-200 rounded-lg">
        <div className="px-4 py-2 border-b border-slate-100 flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-900">Timeline</h2>
        </div>
        <div className="p-3 max-h-48 overflow-y-auto">
          <div className="relative">
            <div className="absolute left-3 top-2 bottom-2 w-px bg-slate-200" />
            <div className="space-y-2">
              {patient.timeline.slice(0, 4).map((event, idx) => {
                const Icon = iconMap[event.type] || FileQuestion;
                const statusClass = event.status ? statusColors[event.status] : 'bg-slate-100 border-slate-200';
                return (
                  <div key={idx} className="flex items-start gap-2 relative">
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center z-10 ${statusClass}`}>
                      <Icon className="w-3 h-3" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-900">{event.title}</p>
                      {event.subtitle && <p className="text-[10px] text-slate-500 truncate">{event.subtitle}</p>}
                      <p className="text-[9px] text-slate-400">{event.date}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
      {/* Medications */}
      <div className="bg-white border border-slate-200 rounded-lg">
        <div className="px-4 py-2 border-b border-slate-100 flex items-center gap-2">
          <Pill className="w-4 h-4 text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-900">Medications</h2>
        </div>
        <div className="p-3 max-h-48 overflow-y-auto">
          {patient.medications.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">No active medications</p>
          ) : (
            <div className="space-y-1.5">
              {medsWithAdherence.slice(0, 4).map((med, idx) => (
                <div key={idx} className={`flex items-center justify-between p-1.5 rounded border ${med.hasGap ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="min-w-0">
                    <span className={`text-xs font-medium ${med.hasGap ? 'text-red-800' : 'text-slate-900'}`}>{med.name}</span>
                    <span className="text-[10px] text-slate-500 ml-1">{med.dose}</span>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {med.hasGap ? <CalendarX className="w-3 h-3 text-red-600" /> : <CalendarCheck className="w-3 h-3 text-emerald-600" />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
// Main Component
// ===========================================================================

export default function DashboardLayout({ isDemoMode = true, selectedCaseIndex = 0 }: DashboardLayoutProps) {
  const [caseIndex, setCaseIndex] = useState(selectedCaseIndex);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [copied, setCopied] = useState(false);
  
  const patient = TEACHING_CASES[caseIndex] || DEFAULT_CASE;
  const isPending = patient.ddimer.value === null;
  const hasConfounders = hasConfoundingContext(patient.activeProblems);
  const isHighRisk = patient.wellsRisk === 'high';
  const fourPEPS = calculate4PEPS(patient);

  const handleCopy = useCallback(async () => {
    const clinicalContext = getClinicalContext(patient.activeProblems);
    const hemodynamics = calculateHemodynamics(patient.vitals);
    
    const summary = [
      `LUMINUR PE CALCULATOR SUMMARY`,
      `Patient: ${patient.name} | ${patient.age}${patient.gender === 'Male' ? 'M' : 'F'} | MRN: ${patient.mrn}`,
      `Chief Complaint: ${patient.chiefComplaint}`,
      ``,
      `VITALS:`,
      `  HR ${patient.vitals.hr} | BP ${patient.vitals.sbp}/${patient.vitals.dbp} | SpO2 ${patient.vitals.spo2}%${patient.vitals.o2Device ? ` [${patient.vitals.o2Device}]` : ''} | RR ${patient.vitals.rr} | Temp ${patient.vitals.temp}°C`,
      ``,
      `HEMODYNAMICS:`,
      `  SI: ${hemodynamics.shockIndex?.toFixed(2) ?? 'N/A'} | MSI: ${hemodynamics.modifiedShockIndex?.toFixed(2) ?? 'N/A'} | MAP: ${hemodynamics.map} mmHg | PP: ${hemodynamics.pulsePressure} mmHg`,
      ``,
      `CLINICAL SCORES:`,
      `  Wells: ${patient.wellsScore} (${patient.wellsRisk})`,
      `  PERC: ${patient.percNegative ? 'Negative (Pass)' : `${patient.percScore} positive (Fail)`}`,
      `  4PEPS: ${fourPEPS.score} (${fourPEPS.tier})`,
      ``,
      `D-DIMER:`,
      patient.ddimer.value !== null ? `  Value: ${patient.ddimer.value} ${patient.ddimer.unit}` : `  Status: PENDING`,
      clinicalContext.contextMessages.length > 0 ? `  Context: ${clinicalContext.contextMessages.join('; ')}` : '',
      ``,
      `SAFETY:`,
      `  eGFR: ${patient.egfr} | Contrast Allergy: ${patient.hasContrastAllergy ? 'YES' : 'No'} | Bleeding Risk: ${patient.bleedingRisk}`,
      patient.priorImaging ? `  Prior ${patient.priorImaging.modality}: ${formatPriorImagingDate(patient.priorImaging)} (${patient.priorImaging.result})` : '',
      ``,
      `--- Calculator Tool | Clinical Judgment Required ---`,
    ].filter(Boolean).join('\n');

    await navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [patient, fourPEPS]);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900">{patient.name}</h1>
            {isPending && <Badge variant="pending"><Clock className="w-3 h-3 mr-1" />Labs Pending</Badge>}
            {hasConfounders && !isPending && <Badge variant="info"><HelpCircle className="w-3 h-3 mr-1" />Context</Badge>}
            {isHighRisk && <Badge variant="danger"><AlertOctagon className="w-3 h-3 mr-1" />High Risk</Badge>}
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-sm text-slate-500">
            <span>{patient.age}{patient.gender === 'Male' ? 'M' : 'F'}</span>
            <span>•</span>
            <span>{patient.mrn}</span>
            <span>•</span>
            <span className="text-slate-400">{patient.clinicalDescriptor}</span>
          </div>
          <div className="mt-1">
            <span className="text-xs text-slate-600"><span className="font-medium">CC:</span> {patient.chiefComplaint}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <select value={caseIndex} onChange={(e) => setCaseIndex(Number(e.target.value))} className="text-xs border border-slate-200 rounded px-2 py-1 bg-white text-slate-700">
            <optgroup label="False Positive D-Dimer (1-5)">
              {TEACHING_CASES.slice(0, 5).map((c, idx) => <option key={c.id} value={idx}>{c.clinicalDescriptor}</option>)}
            </optgroup>
            <optgroup label="Pre-Workup / Pending (6-10)">
              {TEACHING_CASES.slice(5, 10).map((c, idx) => <option key={c.id} value={idx + 5}>{c.clinicalDescriptor}</option>)}
            </optgroup>
            <optgroup label="True Positive (11)">
              {TEACHING_CASES.slice(10).map((c, idx) => <option key={c.id} value={idx + 10}>{c.clinicalDescriptor}</option>)}
            </optgroup>
          </select>
          <button onClick={handleCopy} className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded border ${copied ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
            {copied ? <><Check className="w-3 h-3" />Copied</> : <><ClipboardCopy className="w-3 h-3" />Copy</>}
          </button>
        </div>
      </div>

      {/* ROW 1: Vital Stability Strip */}
      <VitalStabilityStrip patient={patient} />

      {/* ROW 2: Hemodynamics & Clinical Scores */}
      <div className="grid grid-cols-2 gap-3">
        <HemodynamicsCard patient={patient} />
        <ClinicalScoresCard 
          patient={patient} 
          onWellsClick={() => setModalType('wells')} 
          onPERCClick={() => setModalType('perc')}
          on4PEPSClick={() => setModalType('4peps')}
        />
      </div>

      {/* ROW 3: Biomarkers, Prior Imaging, Safety */}
      <div className="grid grid-cols-3 gap-3">
        <DDimerContextCard patient={patient} />
        <PriorImagingCard patient={patient} />
        <SafetyBarriersCard patient={patient} />
      </div>

      {/* ROW 4: Timeline & Medications */}
      <TimelineMedicationsRow patient={patient} />

      {/* Footer */}
      <div className="text-center py-2 border-t border-slate-100">
        <p className="text-[9px] text-slate-400 uppercase tracking-wider">Luminur PE Calculator • Data Aggregation Tool • Not a Diagnostic Device</p>
      </div>

      {/* Modals */}
      <Modal isOpen={modalType === 'wells'} onClose={() => setModalType(null)} title="Wells Score for PE">
        <WellsBreakdown score={patient.wellsScore} />
      </Modal>
      <Modal isOpen={modalType === 'perc'} onClose={() => setModalType(null)} title="PERC Rule for PE">
        <PERCBreakdown score={patient.percScore} isNegative={patient.percNegative} />
      </Modal>
      <Modal isOpen={modalType === '4peps'} onClose={() => setModalType(null)} title="4PEPS Score">
        <FourPEPSBreakdown result={fourPEPS} />
      </Modal>
    </div>
  );
}
