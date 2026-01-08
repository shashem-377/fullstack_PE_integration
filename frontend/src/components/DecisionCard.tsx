import type { AssessmentResult } from '../types/assessment';
import { formatProbability } from '../utils/dataTransform';
import { getScoreSummary } from './ClinicalScoresBar';

interface DecisionCardProps {
  result: AssessmentResult | null;
  isLoading: boolean;
}

/**
 * Generate a concise ED-style rationale based on key findings
 * Now includes clinical score context when reinforcing
 */
function generateRationale(result: AssessmentResult): string {
  const features = result.featureSummary;
  const isRuleOut = result.decision === 'rule_out';
  
  const concerns: string[] = [];
  const reassurances: string[] = [];
  
  // Get score summary
  const scores = getScoreSummary(features);
  
  // Check hypoxia
  const spo2 = features.triage_o2sat ?? features.spO2;
  if (spo2 != null && spo2 < 95) {
    concerns.push('hypoxia');
  } else if (spo2 != null && spo2 >= 95) {
    reassurances.push('normal oxygenation');
  }
  
  // Check tachycardia
  const hr = features.triage_hr ?? features.heartRate;
  if (hr != null && hr > 100) {
    concerns.push('tachycardia');
  }
  
  // Check hemodynamic status
  const sbp = features.triage_sbp ?? features.systolicBP;
  const shockIndex = features.shock_index;
  if ((sbp != null && sbp < 90) || (shockIndex != null && shockIndex > 1.0)) {
    concerns.push('hemodynamic instability');
  }
  
  // Check prior VTE
  if (features.prior_pe_diagnosis || features.prior_dvt_diagnosis) {
    concerns.push('prior VTE');
  }
  
  // Check D-dimer
  const ddimer = features.d_dimer ?? features.dDimer;
  if (ddimer != null && ddimer > 0.5) {
    concerns.push('elevated D-dimer');
  } else if (ddimer != null && ddimer <= 0.5) {
    reassurances.push('normal D-dimer');
  }
  
  // Check high-risk conditions
  if (features.prior_cancer) concerns.push('malignancy');
  if (features.recent_surgery) concerns.push('recent surgery');
  
  // Generate rationale with score integration
  if (isRuleOut) {
    // Build reassurance phrase
    let base = '';
    if (reassurances.length > 0) {
      base = `Low-risk presentation with ${reassurances[0]}`;
    } else {
      base = 'Low-risk clinical presentation';
    }
    
    // Add score context if supportive
    if (scores.summary && (scores.wellsLow || scores.percNegative)) {
      return `${base}. ${scores.summary}.`;
    }
    
    if (concerns.length === 0) {
      return `${base}. No high-risk features identified.`;
    }
    
    return `${base} despite ${concerns[0]}.`;
  } else {
    // Continue workup
    let concernPhrase = concerns.length > 0 
      ? concerns.slice(0, 2).join(' and ')
      : 'clinical features';
    
    // Add high-risk score context if present
    if (scores.anyHighRisk && scores.summary) {
      return `Elevated risk due to ${concernPhrase} with ${scores.summary}. Further workup recommended.`;
    }
    
    return `Elevated risk due to ${concernPhrase}. Further workup recommended.`;
  }
}

export default function DecisionCard({ result, isLoading }: DecisionCardProps) {
  if (isLoading) {
    return (
      <div className="decision-card decision-loading">
        <div className="loading-pulse"></div>
        <span className="loading-text">Analyzing...</span>
      </div>
    );
  }
  
  if (!result) {
    return (
      <div className="decision-card decision-empty">
        <div className="empty-state">
          <span className="empty-icon">📋</span>
          <span className="empty-text">Run assessment to see result</span>
        </div>
      </div>
    );
  }
  
  const isRuleOut = result.decision === 'rule_out';
  const rationale = generateRationale(result);
  
  return (
    <div className={`decision-card ${isRuleOut ? 'decision-rule-out' : 'decision-continue'}`}>
      {/* Primary Decision - Unmistakable */}
      <div className="decision-primary">
        <div className={`decision-badge ${isRuleOut ? 'badge-rule-out' : 'badge-continue'}`}>
          <span className="badge-icon">{isRuleOut ? '✓' : '→'}</span>
          <span className="badge-text">{isRuleOut ? 'RULE OUT' : 'CONTINUE WORKUP'}</span>
        </div>
      </div>
      
      {/* Probability Context - Quick Reference */}
      <div className="decision-probability">
        <span className="prob-value">{formatProbability(result.probability)}</span>
        <span className="prob-context">
          {isRuleOut ? 'below' : 'above'} {formatProbability(result.threshold)} threshold
        </span>
      </div>
      
      {/* One-line Rationale - ED Style with score context */}
      <p className="decision-rationale">{rationale}</p>
    </div>
  );
}

