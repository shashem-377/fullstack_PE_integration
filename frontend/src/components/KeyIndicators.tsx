import type { FeatureSummary } from '../types/assessment';

interface KeyIndicatorsProps {
  features: FeatureSummary | null;
}

interface Indicator {
  label: string;
  status: 'normal' | 'abnormal' | 'missing';
  detail?: string;
}

/**
 * Compact key indicators that ED physicians care about for PE rule-out
 * Only shows high-signal findings, not exhaustive data
 */
export default function KeyIndicators({ features }: KeyIndicatorsProps) {
  if (!features) return null;
  
  const indicators: Indicator[] = [];
  
  // SpO2 / Hypoxia
  const spo2 = features.triage_o2sat ?? features.spO2;
  if (spo2 == null) {
    indicators.push({ label: 'Hypoxia', status: 'missing' });
  } else if (spo2 < 95) {
    indicators.push({ label: 'Hypoxia', status: 'abnormal', detail: `SpO₂ ${spo2}%` });
  } else {
    indicators.push({ label: 'Oxygenation', status: 'normal', detail: `SpO₂ ${spo2}%` });
  }
  
  // Heart Rate / Tachycardia
  const hr = features.triage_hr ?? features.heartRate;
  if (hr == null) {
    indicators.push({ label: 'Tachycardia', status: 'missing' });
  } else if (hr > 100) {
    indicators.push({ label: 'Tachycardia', status: 'abnormal', detail: `HR ${hr}` });
  } else {
    indicators.push({ label: 'Heart Rate', status: 'normal', detail: `HR ${hr}` });
  }
  
  // Hemodynamic Status
  const sbp = features.triage_sbp ?? features.systolicBP;
  const shockIndex = features.shock_index;
  if (sbp == null) {
    indicators.push({ label: 'Hemodynamics', status: 'missing' });
  } else if (sbp < 90 || (shockIndex != null && shockIndex > 1.0)) {
    indicators.push({ label: 'Hemodynamics', status: 'abnormal', detail: `SBP ${sbp}` });
  } else {
    indicators.push({ label: 'Hemodynamics', status: 'normal', detail: `SBP ${sbp}` });
  }
  
  // D-dimer
  const ddimer = features.d_dimer ?? features.dDimer;
  if (ddimer == null) {
    indicators.push({ label: 'D-dimer', status: 'missing', detail: 'pending' });
  } else if (ddimer > 0.5) {
    indicators.push({ label: 'D-dimer', status: 'abnormal', detail: `${ddimer.toFixed(1)}` });
  } else {
    indicators.push({ label: 'D-dimer', status: 'normal', detail: `${ddimer.toFixed(1)}` });
  }
  
  return (
    <div className="key-indicators">
      {indicators.map((ind) => (
        <div key={ind.label} className={`indicator indicator-${ind.status}`}>
          <span className="indicator-icon">
            {ind.status === 'normal' && '✓'}
            {ind.status === 'abnormal' && '!'}
            {ind.status === 'missing' && '?'}
          </span>
          <span className="indicator-label">{ind.label}</span>
          {ind.detail && <span className="indicator-detail">{ind.detail}</span>}
        </div>
      ))}
    </div>
  );
}

