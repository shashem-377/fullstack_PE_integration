/**
 * Demo data for testing the PE Rule-Out Dashboard without backend
 * These scenarios represent realistic clinical presentations.
 * 
 * DATA SOURCE: Frontend fixtures (no backend/FHIR calls)
 * Used when isDemoMode=true
 */

import type { DemoScenario } from '../types/assessment';

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'low_risk_complete',
    name: 'Low Risk - Complete Data',
    description: 'Young patient with low risk features, all vitals/labs present',
    data: {
      patient_id: 'DEMO-001',
      timestamp: new Date().toISOString(),
      probability: 0.034,
      threshold: 0.08,
      decision: 'rule_out',
      explanation: 'Based on available clinical data, the model estimates a low probability of PE (3.4%). This is below the rule-out threshold of 8%, suggesting PE may be safely ruled out in appropriate clinical context.',
      feature_summary: {
        age: 32,
        gender_male: 0,
        gender_female: 1,
        bmi: 24.2,
        triage_hr: 78,
        triage_rr: 16,
        triage_o2sat: 98,
        triage_sbp: 118,
        triage_dbp: 72,
        triage_temp: 36.8,
        d_dimer: 0.35,
        troponin: 0.01,
        creatinine: 0.9,
        // Clinical scores
        wells_score: 0,
        wells_tachycardia: 0,
        wells_dvt_signs: 0,
        wells_pe_likely: 0,
        wells_hemoptysis: 0,
        geneva_score: 1,
        perc_score: 0,
        perc_negative: 1,
        shock_index: 0.66,
        // History - all negative
        prior_pe_diagnosis: 0,
        prior_dvt_diagnosis: 0,
        prior_pe_dvt: false,
        prior_cancer: 0,
        active_cancer: false,
        active_malignancy: false,
        recent_surgery: 0,
        immobilization: 0,
        estrogen_use: 0,
        pregnancy: false,
        thrombophilia: false,
        // Presentation
        cc_dyspnea: 0,
        cc_chest_pain: 1,
        cc_leg_pain_swelling: 0,
        arrival_ambulance: 0
      },
      safety_note: 'This is a decision support tool only. Clinical judgment should always take precedence.'
    }
  },
  {
    id: 'high_risk_prior_vte',
    name: 'High Risk - Prior VTE + Cancer',
    description: 'Strong prior history: prior DVT, malignancy, recent surgery',
    data: {
      patient_id: 'DEMO-002',
      timestamp: new Date().toISOString(),
      probability: 0.384,
      threshold: 0.08,
      decision: 'continue_workup',
      explanation: 'HIGH probability of PE (38.4%). Multiple high-risk features: prior DVT, active malignancy, recent surgery, hypoxia, and tachycardia.',
      feature_summary: {
        age: 68,
        gender_male: 1,
        gender_female: 0,
        bmi: 29.5,
        triage_hr: 112,
        triage_rr: 24,
        triage_o2sat: 89,
        triage_sbp: 108,
        triage_dbp: 68,
        triage_temp: 37.2,
        d_dimer: 6.8,
        troponin: 0.08,
        creatinine: 1.4,
        // Clinical scores - HIGH RISK
        wells_score: 7.5,
        wells_tachycardia: 1,
        wells_dvt_signs: 1,
        wells_pe_likely: 1,
        wells_hemoptysis: 0,
        geneva_score: 12,
        perc_score: 6,
        perc_negative: 0,
        shock_index: 1.04,
        // History - MULTIPLE RISK FACTORS (prominent for demo)
        prior_pe_diagnosis: 0,
        prior_dvt_diagnosis: 1,
        prior_pe_dvt: true,  // Had prior DVT
        prior_cancer: 1,
        active_cancer: true,  // Active malignancy
        active_malignancy: true,
        recent_surgery: 1,  // Recent surgery
        immobilization: 1,
        estrogen_use: 0,
        pregnancy: false,
        thrombophilia: true,  // Known thrombophilia
        // Presentation
        cc_dyspnea: 1,
        cc_chest_pain: 1,
        cc_leg_pain_swelling: 1,
        arrival_ambulance: 1
      },
      safety_note: 'This is a decision support tool only. Clinical judgment should always take precedence.'
    }
  },
  {
    id: 'moderate_risk_continue',
    name: 'Moderate Risk - Prior PE',
    description: 'Prior PE history, elevated D-dimer, some concerning vitals',
    data: {
      patient_id: 'DEMO-003',
      timestamp: new Date().toISOString(),
      probability: 0.142,
      threshold: 0.08,
      decision: 'continue_workup',
      explanation: 'Moderate probability of PE (14.2%). Prior PE history and elevated D-dimer warrant further workup.',
      feature_summary: {
        age: 55,
        gender_male: 0,
        gender_female: 1,
        bmi: 27.8,
        triage_hr: 98,
        triage_rr: 20,
        triage_o2sat: 94,
        triage_sbp: 132,
        triage_dbp: 84,
        triage_temp: 37.0,
        d_dimer: 1.8,
        troponin: 0.02,
        creatinine: 1.0,
        // Clinical scores
        wells_score: 3.0,
        wells_tachycardia: 0,
        wells_dvt_signs: 0,
        wells_pe_likely: 1,
        wells_hemoptysis: 0,
        geneva_score: 5,
        perc_score: 3,
        perc_negative: 0,
        shock_index: 0.74,
        // History - Prior PE
        prior_pe_diagnosis: 1,
        prior_dvt_diagnosis: 0,
        prior_pe_dvt: true,  // Had prior PE
        prior_cancer: 0,
        active_cancer: false,
        active_malignancy: false,
        recent_surgery: 0,
        immobilization: 0,
        estrogen_use: 1,  // On estrogen
        pregnancy: false,
        thrombophilia: false,
        // Presentation
        cc_dyspnea: 1,
        cc_chest_pain: 1,
        cc_leg_pain_swelling: 0,
        arrival_ambulance: 0
      },
      safety_note: 'This is a decision support tool only. Clinical judgment should always take precedence.'
    }
  },
  {
    id: 'missing_labs',
    name: 'Missing Labs - Triage Only',
    description: 'Labs pending, vitals present, no significant history',
    data: {
      patient_id: 'DEMO-004',
      timestamp: new Date().toISOString(),
      probability: 0.058,
      threshold: 0.08,
      decision: 'rule_out',
      explanation: 'Based on triage data (labs pending), low probability (5.8%). Assessment may change once labs result.',
      feature_summary: {
        age: 45,
        gender_male: 0,
        gender_female: 1,
        bmi: 26.8,
        triage_hr: 88,
        triage_rr: 18,
        triage_o2sat: 96,
        triage_sbp: 122,
        triage_dbp: 78,
        triage_temp: 37.0,
        // Labs missing
        d_dimer: null,
        troponin: null,
        creatinine: null,
        // Clinical scores
        wells_score: 1.5,
        wells_tachycardia: 0,
        wells_dvt_signs: 0,
        wells_pe_likely: 0,
        wells_hemoptysis: 0,
        geneva_score: 3,
        perc_score: 1,
        perc_negative: 0,
        shock_index: 0.72,
        // History - negative
        prior_pe_diagnosis: 0,
        prior_dvt_diagnosis: 0,
        prior_pe_dvt: false,
        prior_cancer: 0,
        active_cancer: false,
        active_malignancy: false,
        recent_surgery: 0,
        immobilization: 0,
        estrogen_use: 0,
        pregnancy: false,
        thrombophilia: false,
        // Presentation
        cc_dyspnea: 1,
        cc_chest_pain: 0,
        cc_leg_pain_swelling: 0,
        arrival_ambulance: 0
      },
      safety_note: 'This is a decision support tool only. Clinical judgment should always take precedence.'
    }
  },
  {
    id: 'missing_history',
    name: 'Missing History - Vitals Only',
    description: 'Vitals present but history unknown (demonstrates graceful degradation)',
    data: {
      patient_id: 'DEMO-005',
      timestamp: new Date().toISOString(),
      probability: 0.095,
      threshold: 0.08,
      decision: 'continue_workup',
      explanation: 'Assessment with incomplete history. Reliability reduced. Clinical judgment essential.',
      feature_summary: {
        age: 60,
        gender_male: 1,
        gender_female: 0,
        bmi: null,
        triage_hr: 95,
        triage_rr: 20,
        triage_o2sat: 94,
        triage_sbp: 130,
        triage_dbp: 82,
        triage_temp: 37.2,
        d_dimer: null,
        troponin: null,
        creatinine: null,
        // Clinical scores - partial
        wells_score: null,
        wells_tachycardia: null,
        wells_dvt_signs: null,
        wells_pe_likely: null,
        wells_hemoptysis: null,
        geneva_score: null,
        perc_score: null,
        perc_negative: null,
        shock_index: 0.73,
        // History - UNKNOWN (null = not known, different from false)
        prior_pe_diagnosis: null,
        prior_dvt_diagnosis: null,
        prior_pe_dvt: null,
        prior_cancer: null,
        active_cancer: null,
        active_malignancy: null,
        recent_surgery: null,
        immobilization: null,
        estrogen_use: null,
        pregnancy: null,
        thrombophilia: null,
        // Presentation
        cc_dyspnea: 1,
        cc_chest_pain: 1,
        cc_leg_pain_swelling: 0,
        arrival_ambulance: 1
      },
      safety_note: 'This is a decision support tool only. Clinical judgment should always take precedence.'
    }
  },
  {
    id: 'pregnancy_estrogen',
    name: 'Pregnancy/Estrogen Risk',
    description: 'Young female on estrogen with leg swelling',
    data: {
      patient_id: 'DEMO-006',
      timestamp: new Date().toISOString(),
      probability: 0.112,
      threshold: 0.08,
      decision: 'continue_workup',
      explanation: 'Moderate risk due to estrogen use and unilateral leg swelling. D-dimer elevated.',
      feature_summary: {
        age: 28,
        gender_male: 0,
        gender_female: 1,
        bmi: 24.0,
        triage_hr: 92,
        triage_rr: 18,
        triage_o2sat: 97,
        triage_sbp: 115,
        triage_dbp: 70,
        triage_temp: 36.9,
        d_dimer: 1.2,
        troponin: 0.01,
        creatinine: 0.8,
        // Clinical scores
        wells_score: 3.0,
        wells_tachycardia: 0,
        wells_dvt_signs: 1,
        wells_pe_likely: 0,
        wells_hemoptysis: 0,
        geneva_score: 4,
        perc_score: 3,
        perc_negative: 0,
        shock_index: 0.80,
        // History - Estrogen use
        prior_pe_diagnosis: 0,
        prior_dvt_diagnosis: 0,
        prior_pe_dvt: false,
        prior_cancer: 0,
        active_cancer: false,
        active_malignancy: false,
        recent_surgery: 0,
        immobilization: 0,
        estrogen_use: 1,
        pregnancy: false,  // On OCP, not pregnant
        thrombophilia: false,
        // Presentation
        cc_dyspnea: 0,
        cc_chest_pain: 0,
        cc_leg_pain_swelling: 1,
        arrival_ambulance: 0
      },
      safety_note: 'This is a decision support tool only. Clinical judgment should always take precedence.'
    }
  }
];

export const DEFAULT_DEMO_SCENARIO = DEMO_SCENARIOS[0];

export const SAMPLE_PATIENT_CONTEXT = {
  id: 'DEMO-001',
  name: 'Demo Patient',
  age: 32,
  sex: 'Female' as const,
  encounterTimestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  lastUpdated: new Date().toISOString()
};
