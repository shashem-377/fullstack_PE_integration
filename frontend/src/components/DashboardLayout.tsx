/**
 * Clinical Dashboard Layout - FDA 21st Century Cures Act Compliant
 * 
 * This is a CALCULATOR & DATA AGGREGATOR, not a diagnostic tool.
 * - Standard medical scores only (Wells, PERC, Shock Index)
 * - Factual data comparison (Patient Value vs. Threshold)
 * - No AI predictions, probabilities, or automated decisions
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
} from 'lucide-react';
import { 
  CLINICAL_CASES, 
  DEFAULT_CASE, 
  type ClinicalPatient,
  type TimelineEvent,
  calculateHemodynamics,
  calculateAgeAdjustedDdimer,
} from '../data/demoData';

// ===========================================================================
// Types
// ===========================================================================

interface DashboardLayoutProps {
  isDemoMode?: boolean;
  selectedCaseIndex?: number;
}

type ModalType = null | 'wells' | 'perc';

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
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'pending';
}) {
  const variants = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    pending: 'bg-slate-100 text-slate-500 border-slate-200 border-dashed',
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

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 border border-slate-200">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded transition-colors"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {children}
        </div>
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
          <button
            onClick={onClose}
            className="w-full py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
// Wells Score Breakdown (Standard Medical Calculator)
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
      if (remaining >= c.points) {
        result.push(true);
        remaining -= c.points;
      } else {
        result.push(false);
      }
    }
    return result;
  }, [score]);

  return (
    <div className="space-y-2">
      <div className="text-xs text-slate-500 mb-3 p-2 bg-blue-50 rounded border border-blue-100">
        Standard Wells Criteria for PE (validated clinical calculator)
      </div>
      {WELLS_CRITERIA.map((item, idx) => (
        <div 
          key={idx}
          className={`flex items-center justify-between p-2 rounded text-sm ${
            activeCriteria[idx] ? 'bg-amber-50 border border-amber-200' : 'bg-slate-50 border border-slate-100'
          }`}
        >
          <div className="flex items-center gap-2">
            {activeCriteria[idx] ? (
              <CheckCircle2 className="w-4 h-4 text-amber-600" />
            ) : (
              <div className="w-4 h-4 rounded-full border border-slate-300" />
            )}
            <span className={activeCriteria[idx] ? 'text-amber-900' : 'text-slate-500'}>
              {item.criterion}
            </span>
          </div>
          <span className={`font-mono text-xs ${activeCriteria[idx] ? 'text-amber-700' : 'text-slate-400'}`}>
            +{item.points}
          </span>
        </div>
      ))}
      <div className="flex items-center justify-between pt-2 border-t border-slate-200">
        <span className="text-sm font-medium text-slate-700">Total Score</span>
        <span className="text-lg font-bold text-slate-900">{score.toFixed(1)}</span>
      </div>
    </div>
  );
}

// ===========================================================================
// PERC Breakdown (Standard Medical Calculator)
// ===========================================================================

const PERC_CRITERIA = [
  'Age ≥ 50 years',
  'Heart rate ≥ 100 bpm',
  'SpO2 on room air < 95%',
  'Unilateral leg swelling',
  'Hemoptysis',
  'Recent surgery or trauma',
  'Prior PE or DVT',
  'Hormone use (OCP, HRT)',
];

function PERCBreakdown({ score, isNegative }: { score: number; isNegative: boolean }) {
  return (
    <div className="space-y-3">
      <div className="text-xs text-slate-500 p-2 bg-blue-50 rounded border border-blue-100">
        PERC Rule: If LOW pretest probability AND all 8 criteria are negative, PE can be excluded without further testing.
      </div>
      
      <div className={`p-3 rounded text-sm ${
        isNegative ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'
      }`}>
        {isNegative ? (
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2 className="w-4 h-4" />
            <span className="font-medium">All criteria negative (PERC = 0)</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-amber-700">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-medium">{score} criteria positive</span>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {PERC_CRITERIA.map((criterion, idx) => {
          const isPositive = idx < score;
          return (
            <div 
              key={idx}
              className={`flex items-center gap-2 p-2 rounded text-xs ${
                isPositive ? 'bg-red-50 text-red-700' : 'bg-slate-50 text-slate-600'
              }`}
            >
              {isPositive ? (
                <AlertCircle className="w-3 h-3" />
              ) : (
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              )}
              <span>{criterion}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ===========================================================================
// Zone 1: Risk Stratification Card (Calculator Only - No AI)
// ===========================================================================

function RiskStratificationCard({ 
  patient, 
  onWellsClick, 
  onPERCClick 
}: { 
  patient: ClinicalPatient;
  onWellsClick: () => void;
  onPERCClick: () => void;
}) {
  const { wellsScore, wellsRisk, percScore, percNegative } = patient.scores;
  
  const riskConfig = {
    low: { label: 'Low Risk', color: 'text-emerald-700', bg: 'bg-emerald-50' },
    moderate: { label: 'Moderate Risk', color: 'text-amber-700', bg: 'bg-amber-50' },
    high: { label: 'High Risk', color: 'text-red-700', bg: 'bg-red-50' },
  };
  const risk = riskConfig[wellsRisk];

  return (
    <div className="bg-white border border-slate-200 rounded-lg">
      <div className="px-4 py-3 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-900">Clinical Calculators</h2>
          </div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wide">Standard Validated Tools</span>
        </div>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Wells Score */}
          <button
            onClick={onWellsClick}
            className="text-left p-3 border border-slate-200 rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-colors group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Wells Score</span>
              <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">{wellsScore.toFixed(1)}</span>
              <Badge variant={wellsRisk === 'low' ? 'success' : wellsRisk === 'moderate' ? 'warning' : 'danger'}>
                {risk.label}
              </Badge>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Click for criteria breakdown</p>
          </button>

          {/* PERC */}
          <button
            onClick={onPERCClick}
            className="text-left p-3 border border-slate-200 rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-colors group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">PERC Rule</span>
              <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">{percNegative ? '0' : percScore}</span>
              <Badge variant={percNegative ? 'success' : 'warning'}>
                {percNegative ? 'All Negative' : `${percScore} Positive`}
              </Badge>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Click for criteria breakdown</p>
          </button>
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
// Zone 2A: D-Dimer Card (Handles NULL/Pending State)
// ===========================================================================

function DDimerCard({ patient }: { patient: ClinicalPatient }) {
  const { ddimer, ddimerTimestamp } = patient.labs;
  const age = patient.demographics.age;
  
  // Thresholds
  const standardCutoff = 0.50;
  const ageAdjustedCutoff = calculateAgeAdjustedDdimer(age);
  const useAgeAdjusted = age > 50;
  
  // Handle NULL (Pending) state
  if (ddimer === null) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg border-dashed">
        <div className="px-4 py-3 border-b border-slate-100 border-dashed">
          <div className="flex items-center gap-2">
            <TestTube className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-500">D-Dimer</h2>
            <Badge variant="pending">Pending</Badge>
          </div>
        </div>
        
        <div className="p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center">
            <Clock className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-lg font-medium text-slate-500">Result Pending</p>
          <p className="text-sm text-slate-400 mt-1">No recent result available</p>
          
          {/* Show thresholds for reference */}
          <div className="mt-4 bg-slate-50 border border-slate-100 rounded-lg p-3 text-left">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-2">Reference Thresholds</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Standard</span>
              <span className="font-mono text-slate-700">0.50 µg/mL</span>
            </div>
            {useAgeAdjusted && (
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-slate-600">Age-Adjusted ({age}y)</span>
                <span className="font-mono text-slate-700">{ageAdjustedCutoff.toFixed(2)} µg/mL</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // D-Dimer is available
  const isNegative = ddimer <= ageAdjustedCutoff;
  const isElevatedStandard = ddimer > standardCutoff && ddimer <= ageAdjustedCutoff;
  
  return (
    <div className="bg-white border border-slate-200 rounded-lg">
      <div className="px-4 py-3 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-900">D-Dimer</h2>
          </div>
          {ddimerTimestamp && (
            <span className="text-[10px] text-slate-400">
              {new Date(ddimerTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </div>
      
      <div className="p-4">
        {/* Large Value Display */}
        <div className="text-center mb-4">
          <span className={`text-5xl font-bold tracking-tight ${
            isNegative ? 'text-emerald-600' : 'text-red-600'
          }`}>
            {ddimer.toFixed(2)}
          </span>
          <span className="text-lg text-slate-500 ml-2">µg/mL</span>
        </div>
        
        {/* Threshold Comparison */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Standard Threshold</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-medium text-slate-900">0.50</span>
              {ddimer <= standardCutoff ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-500" />
              )}
            </div>
          </div>
          {useAgeAdjusted && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Age-Adjusted ({age}y × 0.01)</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-medium text-slate-900">{ageAdjustedCutoff.toFixed(2)}</span>
                {isNegative ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Status */}
        <div className={`mt-3 p-2 rounded-lg flex items-center gap-2 ${
          isNegative 
            ? 'bg-emerald-50 border border-emerald-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          {isNegative ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700">
                Below {isElevatedStandard ? 'Age-Adjusted' : 'Standard'} Threshold
              </span>
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-700">Above Threshold</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
// Zone 2B: Hemodynamic Profile Card (Standard Calculations)
// ===========================================================================

function HemodynamicCard({ patient }: { patient: ClinicalPatient }) {
  const hemodynamics = calculateHemodynamics(patient.vitals);
  const { shockIndex, map, pulsePressure } = hemodynamics;
  
  // Thresholds
  const siStatus = shockIndex !== null && shockIndex > 0.9 ? 'danger' : shockIndex !== null && shockIndex > 0.7 ? 'caution' : 'safe';
  const mapStatus = map < 65 ? 'danger' : map < 70 ? 'caution' : 'safe';
  const ppStatus = pulsePressure < 25 ? 'caution' : 'safe';
  
  const metrics = [
    {
      label: 'Shock Index',
      value: shockIndex?.toFixed(2) ?? '—',
      formula: 'HR / SBP',
      status: siStatus,
      icon: HeartPulse,
    },
    {
      label: 'MAP',
      value: map.toFixed(0),
      unit: 'mmHg',
      formula: '(SBP + 2×DBP) / 3',
      status: mapStatus,
      icon: Gauge,
    },
    {
      label: 'Pulse Pressure',
      value: pulsePressure.toString(),
      unit: 'mmHg',
      formula: 'SBP - DBP',
      status: ppStatus,
      icon: Activity,
    },
  ];
  
  return (
    <div className="bg-white border border-slate-200 rounded-lg">
      <div className="px-4 py-3 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-900">Hemodynamic Calculations</h2>
          </div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wide">Derived Values</span>
        </div>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-3 gap-3">
          {metrics.map((metric, idx) => {
            const Icon = metric.icon;
            const statusColors = {
              safe: 'text-emerald-600 bg-emerald-50 border-emerald-200',
              caution: 'text-amber-600 bg-amber-50 border-amber-200',
              danger: 'text-red-600 bg-red-50 border-red-200',
            };
            
            return (
              <div 
                key={idx}
                className={`p-3 rounded-lg border ${statusColors[metric.status]}`}
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <Icon className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium uppercase tracking-wide">{metric.label}</span>
                </div>
                <div className="text-2xl font-bold">
                  {metric.value}
                  {metric.unit && <span className="text-xs ml-1 font-normal opacity-70">{metric.unit}</span>}
                </div>
                <p className="text-[10px] mt-1 opacity-70">{metric.formula}</p>
              </div>
            );
          })}
        </div>
        
        {/* Renal Function */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 uppercase tracking-wide">eGFR</span>
            <span className="text-lg font-bold text-slate-900">{patient.labs.egfr}</span>
            <span className="text-xs text-slate-500">mL/min</span>
          </div>
          <div className="flex items-center gap-1.5">
            <StatusDot status={patient.labs.egfr >= 60 ? 'safe' : patient.labs.egfr >= 30 ? 'caution' : 'danger'} />
            <span className={`text-xs font-medium ${
              patient.labs.egfr >= 60 ? 'text-emerald-700' :
              patient.labs.egfr >= 30 ? 'text-amber-700' : 'text-red-700'
            }`}>
              {patient.labs.egfr >= 60 ? 'Contrast Safe' : patient.labs.egfr >= 30 ? 'Caution' : 'Impaired'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
// Zone 3A: Timeline Card (Updated for new TimelineEvent interface)
// ===========================================================================

function TimelineCard({ patient }: { patient: ClinicalPatient }) {
  const { timeline } = patient;

  const iconMap: Record<TimelineEvent['type'], React.ComponentType<{ className?: string }>> = {
    Imaging: Scan,
    Diagnosis: Stethoscope,
    Lab: TestTube,
    Medication: Pill,
    Procedure: Syringe,
  };
  
  const statusColors: Record<string, string> = {
    Positive: 'text-red-600 bg-red-50 border-red-200',
    Negative: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    Neutral: 'text-slate-600 bg-slate-50 border-slate-200',
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg">
      <div className="px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-900">Clinical Timeline</h2>
        </div>
      </div>
      
      <div className="p-4">
        <div className="relative">
          <div className="absolute left-4 top-3 bottom-3 w-px bg-slate-200" />
          
          <div className="space-y-3">
            {timeline.map((event, idx) => {
              const Icon = iconMap[event.type] || FileQuestion;
              const statusClass = event.status ? statusColors[event.status] : 'bg-slate-100 border-slate-200';
              
              return (
                <div key={idx} className="flex items-start gap-3 relative">
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center z-10 ${statusClass}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1 pt-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">{event.title}</p>
                    {event.subtitle && (
                      <p className="text-xs text-slate-500 truncate">{event.subtitle}</p>
                    )}
                    <p className="text-[10px] text-slate-400 mt-0.5">{event.date}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
// Zone 3B: Medication Adherence Card
// ===========================================================================

function MedicationAdherenceCard({ patient }: { patient: ClinicalPatient }) {
  const { medications } = patient;
  
  const today = new Date();
  
  const medsWithAdherence = useMemo(() => {
    return medications.map(med => {
      const refillDate = new Date(med.lastRefill);
      const daysSinceRefill = Math.floor((today.getTime() - refillDate.getTime()) / (1000 * 60 * 60 * 24));
      const daysLate = daysSinceRefill - med.daysSupply;
      const hasGap = daysLate > 5;
      
      return { ...med, daysSinceRefill, daysLate, hasGap };
    });
  }, [medications]);
  
  const grouped = useMemo(() => {
    const groups: Record<string, typeof medsWithAdherence> = {};
    medsWithAdherence.forEach(med => {
      if (!groups[med.category]) groups[med.category] = [];
      groups[med.category].push(med);
    });
    return groups;
  }, [medsWithAdherence]);
  
  const hasAnticoagulantGap = medsWithAdherence.some(
    med => med.category === 'Anticoagulant' && med.hasGap
  );
  
  // Handle empty medications
  if (medications.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg">
        <div className="px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Pill className="w-4 h-4 text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-900">Medications</h2>
          </div>
        </div>
        <div className="p-6 text-center">
          <p className="text-sm text-slate-500">No active medications on record</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white border border-slate-200 rounded-lg">
      <div className="px-4 py-3 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Pill className="w-4 h-4 text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-900">Medication Adherence</h2>
          </div>
          {hasAnticoagulantGap && (
            <Badge variant="danger">Anticoagulant Gap</Badge>
          )}
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        {Object.entries(grouped).map(([category, meds]) => (
          <div key={category}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {category}
              </span>
              {category === 'Anticoagulant' && (
                <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">VTE Protection</span>
              )}
              {category === 'Hormonal' && (
                <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">VTE Risk Factor</span>
              )}
            </div>
            
            <div className="space-y-2">
              {meds.map((med, idx) => (
                <div 
                  key={idx}
                  className={`flex items-center justify-between p-2 rounded border ${
                    med.hasGap ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-100'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${med.hasGap ? 'text-red-800' : 'text-slate-900'}`}>
                        {med.name}
                      </span>
                      <span className="text-xs text-slate-500">{med.dose}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {med.hasGap ? (
                      <>
                        <CalendarX className="w-3.5 h-3.5 text-red-600" />
                        <span className="text-xs font-medium text-red-700">Late {med.daysLate}d</span>
                      </>
                    ) : (
                      <>
                        <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-xs font-medium text-emerald-700">Active</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===========================================================================
// Vitals Bar
// ===========================================================================

function VitalsBar({ patient }: { patient: ClinicalPatient }) {
  const { hr, sbp, dbp, rr, spo2, temp } = patient.vitals;
  
  const vitals = [
    { label: 'HR', value: hr, unit: 'bpm', icon: Heart, alert: hr > 100 },
    { label: 'BP', value: `${sbp}/${dbp}`, unit: 'mmHg', icon: Activity, alert: sbp < 90 },
    { label: 'RR', value: rr, unit: '/min', icon: Wind, alert: rr > 20 },
    { label: 'SpO2', value: `${spo2}%`, unit: '', icon: Droplets, alert: spo2 < 94 },
    { label: 'Temp', value: temp.toFixed(1), unit: '°C', icon: Thermometer, alert: temp > 38 },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-lg">
      <div className="px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-900">Current Vitals</h2>
        </div>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-5 gap-4">
          {vitals.map((vital, idx) => {
            const Icon = vital.icon;
            return (
              <div 
                key={idx} 
                className={`text-center p-3 rounded-lg border ${
                  vital.alert ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 mx-auto mb-1 ${vital.alert ? 'text-amber-600' : 'text-slate-400'}`} />
                <p className={`text-lg font-bold ${vital.alert ? 'text-amber-700' : 'text-slate-900'}`}>
                  {vital.value}
                </p>
                <p className="text-[10px] text-slate-500 uppercase">{vital.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
// Main Component (FDA Compliant - No AI Decisions)
// ===========================================================================

export default function DashboardLayout({ 
  isDemoMode = true, 
  selectedCaseIndex = 0 
}: DashboardLayoutProps) {
  const [caseIndex, setCaseIndex] = useState(selectedCaseIndex);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [copied, setCopied] = useState(false);
  
  const patient = CLINICAL_CASES[caseIndex] || DEFAULT_CASE;
  const isPending = patient.labs.ddimer === null;

  // Copy Summary (factual only, no AI decisions)
  const handleCopy = useCallback(async () => {
    const { name, demographics, scores, labs } = patient;
    const ageAdjCutoff = calculateAgeAdjustedDdimer(demographics.age);
    
    const summary = [
      `LUMINUR PE CALCULATOR SUMMARY`,
      `Patient: ${name} | ${demographics.age}${demographics.sex} | MRN: ${demographics.mrn}`,
      ``,
      `CLINICAL SCORES:`,
      `  Wells Score: ${scores.wellsScore} (${scores.wellsRisk} risk)`,
      `  PERC: ${scores.percNegative ? 'All 8 criteria negative' : `${scores.percScore} criteria positive`}`,
      ``,
      `D-DIMER:`,
      labs.ddimer !== null 
        ? `  Value: ${labs.ddimer} µg/mL`
        : `  Status: Pending`,
      `  Standard Threshold: 0.50 µg/mL`,
      demographics.age > 50 ? `  Age-Adjusted Threshold: ${ageAdjCutoff.toFixed(2)} µg/mL` : '',
      ``,
      `--- This is a calculator tool. Clinical judgment required. ---`,
    ].filter(Boolean).join('\n');

    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  }, [patient]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900">{patient.name}</h1>
            {isPending && <Badge variant="pending">Labs Pending</Badge>}
          </div>
          <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
            <span>{patient.demographics.age}{patient.demographics.sex}</span>
            <span>•</span>
            <span>{patient.demographics.mrn}</span>
            <span>•</span>
            <span className="text-slate-400">{patient.clinicalDescriptor}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Case Selector */}
          <select
            value={caseIndex}
            onChange={(e) => setCaseIndex(Number(e.target.value))}
            className="text-sm border border-slate-200 rounded px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CLINICAL_CASES.map((c, idx) => (
              <option key={c.id} value={idx}>
                {idx < 5 ? '✓ ' : '○ '}{c.clinicalDescriptor}
              </option>
            ))}
          </select>
          
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded border transition-colors ${
              copied 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <ClipboardCopy className="w-4 h-4" />
                <span>Copy Summary</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Clinical Context */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
        <p className="text-sm text-slate-700">
          <span className="font-medium">Chief Complaint:</span> {patient.clinicalContext.chiefComplaint}
        </p>
      </div>

      {/* Zone 1: Clinical Calculators */}
      <RiskStratificationCard 
        patient={patient}
        onWellsClick={() => setModalType('wells')}
        onPERCClick={() => setModalType('perc')}
      />

      {/* Zone 2: Biomarkers & Hemodynamics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DDimerCard patient={patient} />
        <HemodynamicCard patient={patient} />
      </div>

      {/* Vitals Bar */}
      <VitalsBar patient={patient} />

      {/* Zone 3: Clinical Context */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TimelineCard patient={patient} />
        <MedicationAdherenceCard patient={patient} />
      </div>

      {/* Footer - FDA Compliance Notice */}
      <div className="text-center py-3 border-t border-slate-100">
        <p className="text-[10px] text-slate-400 uppercase tracking-wider">
          Luminur PE Calculator • Data Aggregation Tool • Not a Diagnostic Device
        </p>
        <p className="text-[10px] text-slate-300 mt-0.5">
          21st Century Cures Act Compliant — Clinical Decision Support Exempt
        </p>
      </div>

      {/* Modals */}
      <Modal
        isOpen={modalType === 'wells'}
        onClose={() => setModalType(null)}
        title="Wells Score for PE"
      >
        <WellsBreakdown score={patient.scores.wellsScore} />
      </Modal>

      <Modal
        isOpen={modalType === 'perc'}
        onClose={() => setModalType(null)}
        title="PERC Rule for PE"
      >
        <PERCBreakdown 
          score={patient.scores.percScore} 
          isNegative={patient.scores.percNegative} 
        />
      </Modal>
    </div>
  );
}
