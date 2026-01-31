/**
 * Clinical Demo Scenarios for Luminur PE Calculator
 * 
 * FDA 21st Century Cures Act Compliant:
 * - No AI predictions or probability scores
 * - Standard medical calculators only (Wells, PERC, Shock Index)
 * - Factual data presentation
 * 
 * 10 Cases:
 * - Cases 1-5: Resulted (D-dimer available)
 * - Cases 6-10: Pre-Workup (D-dimer pending)
 */

import type { DemoScenario } from '../types/assessment';

// ===========================================================================
// Types (FDA Compliant)
// ===========================================================================

export interface Medication {
  name: string;
  category: 'Anticoagulant' | 'Cardiovascular' | 'Hormonal' | 'Psychiatric' | 'Respiratory' | 'Analgesic' | 'Other';
  dose: string;
  lastRefill: string; // ISO date string
  daysSupply: number;
}

export interface TimelineEvent {
  date: string;
  type: 'Imaging' | 'Diagnosis' | 'Lab' | 'Medication' | 'Procedure';
  title: string;
  subtitle?: string;
  status?: 'Positive' | 'Negative' | 'Neutral';
}

export interface ClinicalPatient {
  id: string;
  name: string;
  clinicalDescriptor: string;
  demographics: {
    age: number;
    sex: 'M' | 'F';
    mrn: string;
  };
  vitals: {
    hr: number;
    sbp: number;
    dbp: number;
    rr: number;
    spo2: number;
    temp: number;
  };
  labs: {
    ddimer: number | null; // NULL = Pending/Not Resulted
    ddimerUnits: string;
    ddimerTimestamp?: string; // When was it resulted
    creatinine: number;
    egfr: number;
    troponin: number | null;
  };
  scores: {
    wellsScore: number;
    wellsRisk: 'low' | 'moderate' | 'high';
    percScore: number;
    percNegative: boolean;
    // REMOVED: probability (FDA compliance - no AI predictions)
  };
  clinicalContext: {
    chiefComplaint: string;
    relevantHistory: string[];
    physicalExam: string[];
  };
  medications: Medication[];
  timeline: TimelineEvent[];
  // REMOVED: result/decision block (FDA compliance - no AI recommendations)
}

// ===========================================================================
// RESULTED CASES (1-5): D-Dimer Available
// ===========================================================================

export const CASE_001_ANXIETY: ClinicalPatient = {
  id: 'CASE-001',
  name: 'Martinez, Elena',
  clinicalDescriptor: 'Anxiety-Related Dyspnea',
  demographics: { age: 45, sex: 'F', mrn: 'MRN-7842391' },
  vitals: { hr: 102, sbp: 138, dbp: 88, rr: 20, spo2: 99, temp: 36.8 },
  labs: {
    ddimer: 0.35,
    ddimerUnits: 'µg/mL',
    ddimerTimestamp: '2026-01-27T14:30:00Z',
    creatinine: 0.9,
    egfr: 82,
    troponin: 0.01,
  },
  scores: {
    wellsScore: 1.5,
    wellsRisk: 'low',
    percScore: 1,
    percNegative: false,
  },
  clinicalContext: {
    chiefComplaint: 'Shortness of breath, palpitations',
    relevantHistory: [
      'Generalized anxiety disorder (5 years)',
      'Recent work-related stress',
      'No prior VTE',
    ],
    physicalExam: [
      'Anxious-appearing female',
      'Tachycardic but regular rhythm',
      'Clear lung sounds bilaterally',
      'No leg swelling or tenderness',
    ],
  },
  medications: [
    { name: 'Escitalopram', category: 'Psychiatric', dose: '10mg daily', lastRefill: '2026-01-15', daysSupply: 30 },
    { name: 'Alprazolam', category: 'Psychiatric', dose: '0.5mg PRN', lastRefill: '2026-01-10', daysSupply: 30 },
  ],
  timeline: [
    { date: '5 years ago', type: 'Diagnosis', title: 'Anxiety Disorder', subtitle: 'GAD diagnosed' },
    { date: '5 years ago', type: 'Medication', title: 'Started SSRI', subtitle: 'Escitalopram initiated' },
    { date: '8 months ago', type: 'Procedure', title: 'ED Visit', subtitle: 'Palpitations workup negative' },
    { date: 'Today 14:30', type: 'Lab', title: 'D-Dimer', subtitle: '0.35 µg/mL', status: 'Negative' },
  ],
};

export const CASE_002_COPD: ClinicalPatient = {
  id: 'CASE-002',
  name: 'Williams, Robert',
  clinicalDescriptor: 'COPD Exacerbation',
  demographics: { age: 64, sex: 'M', mrn: 'MRN-5291837' },
  vitals: { hr: 94, sbp: 142, dbp: 86, rr: 24, spo2: 91, temp: 37.1 },
  labs: {
    ddimer: 0.62,
    ddimerUnits: 'µg/mL',
    ddimerTimestamp: '2026-01-27T15:45:00Z',
    creatinine: 1.1,
    egfr: 68,
    troponin: 0.02,
  },
  scores: {
    wellsScore: 1.5,
    wellsRisk: 'low',
    percScore: 3,
    percNegative: false,
  },
  clinicalContext: {
    chiefComplaint: 'Worsening shortness of breath for 3 days',
    relevantHistory: [
      'COPD (GOLD Stage II)',
      'Former smoker (40 pack-years)',
      'Recent URI symptoms',
      'No prior VTE',
    ],
    physicalExam: [
      'Increased work of breathing',
      'Diffuse expiratory wheezes',
      'No leg edema',
      'Barrel chest',
    ],
  },
  medications: [
    { name: 'Tiotropium', category: 'Respiratory', dose: '18mcg inhaled daily', lastRefill: '2026-01-05', daysSupply: 30 },
    { name: 'Albuterol', category: 'Respiratory', dose: '90mcg PRN', lastRefill: '2026-01-20', daysSupply: 30 },
    { name: 'Prednisone', category: 'Other', dose: '40mg taper', lastRefill: '2026-01-25', daysSupply: 7 },
    { name: 'Lisinopril', category: 'Cardiovascular', dose: '10mg daily', lastRefill: '2025-12-28', daysSupply: 90 },
  ],
  timeline: [
    { date: '8 years ago', type: 'Diagnosis', title: 'COPD', subtitle: 'GOLD Stage II' },
    { date: '2 years ago', type: 'Imaging', title: 'CT Chest', subtitle: 'Emphysematous changes', status: 'Neutral' },
    { date: '6 months ago', type: 'Procedure', title: 'COPD Exacerbation', subtitle: 'Required steroids' },
    { date: 'Today 15:45', type: 'Lab', title: 'D-Dimer', subtitle: '0.62 µg/mL (Age-adj: 0.64)', status: 'Negative' },
  ],
};

export const CASE_003_PLEURISY: ClinicalPatient = {
  id: 'CASE-003',
  name: 'Chen, Michael',
  clinicalDescriptor: 'Pleuritic Chest Pain',
  demographics: { age: 28, sex: 'M', mrn: 'MRN-9182736' },
  vitals: { hr: 96, sbp: 118, dbp: 72, rr: 18, spo2: 98, temp: 37.8 },
  labs: {
    ddimer: 0.28,
    ddimerUnits: 'µg/mL',
    ddimerTimestamp: '2026-01-27T12:00:00Z',
    creatinine: 0.8,
    egfr: 112,
    troponin: null,
  },
  scores: {
    wellsScore: 0,
    wellsRisk: 'low',
    percScore: 0,
    percNegative: true,
  },
  clinicalContext: {
    chiefComplaint: 'Sharp chest pain, worse with deep breathing',
    relevantHistory: [
      'Recent viral syndrome (1 week)',
      'No prior cardiac or pulmonary disease',
      'Active, plays recreational basketball',
      'No VTE risk factors',
    ],
    physicalExam: [
      'Well-appearing young male',
      'Pleural friction rub on auscultation',
      'Pain reproducible with palpation',
      'No leg findings',
    ],
  },
  medications: [
    { name: 'Ibuprofen', category: 'Analgesic', dose: '600mg TID', lastRefill: '2026-01-27', daysSupply: 14 },
  ],
  timeline: [
    { date: '7 days ago', type: 'Diagnosis', title: 'Viral Illness', subtitle: 'Upper respiratory symptoms' },
    { date: '2 days ago', type: 'Diagnosis', title: 'Chest Pain Onset', subtitle: 'Pleuritic quality' },
    { date: 'Today 12:00', type: 'Lab', title: 'D-Dimer', subtitle: '0.28 µg/mL', status: 'Negative' },
  ],
};

export const CASE_004_SYNCOPE: ClinicalPatient = {
  id: 'CASE-004',
  name: 'Thompson, Margaret',
  clinicalDescriptor: 'Syncope Post-Surgery',
  demographics: { age: 72, sex: 'F', mrn: 'MRN-3847291' },
  vitals: { hr: 88, sbp: 110, dbp: 70, rr: 20, spo2: 94, temp: 36.6 },
  labs: {
    ddimer: 4.50,
    ddimerUnits: 'µg/mL',
    ddimerTimestamp: '2026-01-27T16:20:00Z',
    creatinine: 1.3,
    egfr: 42,
    troponin: 0.08,
  },
  scores: {
    wellsScore: 4.5,
    wellsRisk: 'moderate',
    percScore: 4,
    percNegative: false,
  },
  clinicalContext: {
    chiefComplaint: 'Witnessed syncope at home',
    relevantHistory: [
      'Recent hip surgery (3 weeks ago)',
      'Limited mobility post-surgery',
      'Hypertension, Type 2 DM',
      'No prior VTE',
    ],
    physicalExam: [
      'Alert, oriented, no focal deficits',
      'Mild tachypnea at rest',
      'RLE with mild edema (surgical site)',
      'JVP mildly elevated',
    ],
  },
  medications: [
    { name: 'Enoxaparin', category: 'Anticoagulant', dose: '40mg SC daily', lastRefill: '2026-01-10', daysSupply: 21 },
    { name: 'Metformin', category: 'Other', dose: '1000mg BID', lastRefill: '2025-12-15', daysSupply: 90 },
    { name: 'Lisinopril', category: 'Cardiovascular', dose: '20mg daily', lastRefill: '2025-12-15', daysSupply: 90 },
    { name: 'Oxycodone', category: 'Analgesic', dose: '5mg Q6H PRN', lastRefill: '2026-01-10', daysSupply: 14 },
  ],
  timeline: [
    { date: '3 weeks ago', type: 'Procedure', title: 'Hip Replacement', subtitle: 'Right total hip arthroplasty' },
    { date: '2 weeks ago', type: 'Procedure', title: 'Hospital Discharge', subtitle: 'On DVT prophylaxis' },
    { date: 'Today 16:00', type: 'Diagnosis', title: 'Syncope', subtitle: 'Witnessed collapse at home' },
    { date: 'Today 16:20', type: 'Lab', title: 'D-Dimer', subtitle: '4.50 µg/mL', status: 'Positive' },
  ],
};

export const CASE_005_DVT: ClinicalPatient = {
  id: 'CASE-005',
  name: 'Anderson, James',
  clinicalDescriptor: 'DVT with Dyspnea',
  demographics: { age: 50, sex: 'M', mrn: 'MRN-6729183' },
  vitals: { hr: 105, sbp: 102, dbp: 64, rr: 26, spo2: 91, temp: 37.0 },
  labs: {
    ddimer: 2.10,
    ddimerUnits: 'µg/mL',
    ddimerTimestamp: '2026-01-27T17:00:00Z',
    creatinine: 1.0,
    egfr: 88,
    troponin: 0.05,
  },
  scores: {
    wellsScore: 6.0,
    wellsRisk: 'high',
    percScore: 5,
    percNegative: false,
  },
  clinicalContext: {
    chiefComplaint: 'Shortness of breath, left calf pain',
    relevantHistory: [
      'Recent long-haul flight (12 hours, 1 week ago)',
      '"Calf cramp" started 5 days ago',
      'Progressive dyspnea over 2 days',
      'Prior DVT 2 years ago',
    ],
    physicalExam: [
      'Tachypneic, using accessory muscles',
      'Tachycardic, hypotensive',
      'Left calf swollen, tender, positive Homans sign',
      'Clear lung sounds despite hypoxia',
    ],
  },
  medications: [
    { name: 'Apixaban', category: 'Anticoagulant', dose: '5mg BID', lastRefill: '2025-12-10', daysSupply: 30 },
    { name: 'Atorvastatin', category: 'Cardiovascular', dose: '40mg daily', lastRefill: '2025-12-20', daysSupply: 90 },
    { name: 'Metoprolol', category: 'Cardiovascular', dose: '25mg BID', lastRefill: '2025-12-20', daysSupply: 90 },
  ],
  timeline: [
    { date: '2 years ago', type: 'Diagnosis', title: 'Prior DVT', subtitle: 'Left lower extremity' },
    { date: '18 months ago', type: 'Medication', title: 'Anticoagulation Stopped', subtitle: 'Completed 6-month course' },
    { date: '1 week ago', type: 'Procedure', title: 'Long-Haul Flight', subtitle: '12 hours' },
    { date: '5 days ago', type: 'Diagnosis', title: 'Calf Pain Onset', subtitle: 'Initially dismissed' },
    { date: 'Today 17:00', type: 'Lab', title: 'D-Dimer', subtitle: '2.10 µg/mL', status: 'Positive' },
  ],
};

// ===========================================================================
// PRE-WORKUP CASES (6-10): D-Dimer Pending
// ===========================================================================

export const CASE_006_TRIAGE_CP: ClinicalPatient = {
  id: 'CASE-006',
  name: 'Rodriguez, Carlos',
  clinicalDescriptor: 'Triage Chest Pain',
  demographics: { age: 55, sex: 'M', mrn: 'MRN-4821937' },
  vitals: { hr: 88, sbp: 148, dbp: 92, rr: 18, spo2: 97, temp: 36.9 },
  labs: {
    ddimer: null, // PENDING
    ddimerUnits: 'µg/mL',
    creatinine: 1.0,
    egfr: 78,
    troponin: null,
  },
  scores: {
    wellsScore: 3.0,
    wellsRisk: 'moderate',
    percScore: 2,
    percNegative: false,
  },
  clinicalContext: {
    chiefComplaint: 'Substernal chest pressure, mild SOB',
    relevantHistory: [
      'Hypertension (10 years)',
      'Hyperlipidemia',
      'Family history of MI',
      'No prior VTE',
    ],
    physicalExam: [
      'Mildly diaphoretic',
      'Regular heart rhythm, no murmurs',
      'Lungs clear',
      'No leg edema',
    ],
  },
  medications: [
    { name: 'Lisinopril', category: 'Cardiovascular', dose: '20mg daily', lastRefill: '2026-01-10', daysSupply: 90 },
    { name: 'Atorvastatin', category: 'Cardiovascular', dose: '20mg daily', lastRefill: '2026-01-10', daysSupply: 90 },
    { name: 'Aspirin', category: 'Cardiovascular', dose: '81mg daily', lastRefill: '2026-01-10', daysSupply: 90 },
  ],
  timeline: [
    { date: '10 years ago', type: 'Diagnosis', title: 'Hypertension', subtitle: 'Started on ACE inhibitor' },
    { date: '5 years ago', type: 'Imaging', title: 'Stress Echo', subtitle: 'Normal', status: 'Negative' },
    { date: 'Today 18:00', type: 'Lab', title: 'D-Dimer', subtitle: 'Order placed', status: 'Neutral' },
  ],
};

export const CASE_007_ELDERLY_SYNCOPE: ClinicalPatient = {
  id: 'CASE-007',
  name: 'O\'Brien, Patricia',
  clinicalDescriptor: 'Syncope Unknown Cause',
  demographics: { age: 82, sex: 'F', mrn: 'MRN-7391824' },
  vitals: { hr: 72, sbp: 124, dbp: 68, rr: 16, spo2: 96, temp: 36.4 },
  labs: {
    ddimer: null, // PENDING
    ddimerUnits: 'µg/mL',
    creatinine: 1.4,
    egfr: 38,
    troponin: 0.02,
  },
  scores: {
    wellsScore: 1.5,
    wellsRisk: 'low',
    percScore: 2,
    percNegative: false,
  },
  clinicalContext: {
    chiefComplaint: 'Syncopal episode in grocery store',
    relevantHistory: [
      'Atrial fibrillation (on anticoagulation)',
      'CKD Stage 3b',
      'Prior D-dimer 0.45 (March 2024)',
      'No recent surgery or immobility',
    ],
    physicalExam: [
      'Alert, oriented x3',
      'Irregularly irregular rhythm',
      'No focal neurologic deficits',
      'No leg edema',
    ],
  },
  medications: [
    { name: 'Apixaban', category: 'Anticoagulant', dose: '2.5mg BID', lastRefill: '2026-01-18', daysSupply: 30 },
    { name: 'Metoprolol', category: 'Cardiovascular', dose: '50mg BID', lastRefill: '2026-01-05', daysSupply: 90 },
    { name: 'Furosemide', category: 'Cardiovascular', dose: '20mg daily', lastRefill: '2026-01-05', daysSupply: 90 },
  ],
  timeline: [
    { date: '5 years ago', type: 'Diagnosis', title: 'Atrial Fibrillation', subtitle: 'Started anticoagulation' },
    { date: 'March 2024', type: 'Lab', title: 'Prior D-Dimer', subtitle: '0.45 µg/mL', status: 'Negative' },
    { date: 'Today 14:15', type: 'Diagnosis', title: 'Syncope', subtitle: 'Witnessed in store' },
    { date: 'Today 14:45', type: 'Lab', title: 'D-Dimer', subtitle: 'Pending result', status: 'Neutral' },
  ],
};

export const CASE_008_ANXIOUS_YOUNG: ClinicalPatient = {
  id: 'CASE-008',
  name: 'Kim, Jennifer',
  clinicalDescriptor: 'Anxious Tachycardia',
  demographics: { age: 22, sex: 'F', mrn: 'MRN-2918374' },
  vitals: { hr: 110, sbp: 112, dbp: 70, rr: 22, spo2: 99, temp: 36.7 },
  labs: {
    ddimer: null, // PENDING
    ddimerUnits: 'µg/mL',
    creatinine: 0.7,
    egfr: 118,
    troponin: null,
  },
  scores: {
    wellsScore: 1.5, // HR > 100
    wellsRisk: 'low',
    percScore: 1, // HR > 100
    percNegative: false,
  },
  clinicalContext: {
    chiefComplaint: 'Can\'t catch my breath, heart racing',
    relevantHistory: [
      'On oral contraceptives (3 years)',
      'Anxiety disorder',
      'No prior VTE',
      'No recent travel or surgery',
    ],
    physicalExam: [
      'Anxious-appearing female',
      'Tachycardic, regular rhythm',
      'Clear lungs',
      'No leg findings',
    ],
  },
  medications: [
    { name: 'Ethinyl Estradiol/Norgestimate', category: 'Hormonal', dose: '35mcg/0.25mg daily', lastRefill: '2026-01-20', daysSupply: 28 },
    { name: 'Sertraline', category: 'Psychiatric', dose: '50mg daily', lastRefill: '2026-01-15', daysSupply: 30 },
  ],
  timeline: [
    { date: '3 years ago', type: 'Medication', title: 'Started OCP', subtitle: 'Combined oral contraceptive' },
    { date: '2 years ago', type: 'Diagnosis', title: 'Anxiety Disorder', subtitle: 'Started SSRI' },
    { date: 'Today 19:30', type: 'Diagnosis', title: 'ED Presentation', subtitle: 'SOB and palpitations' },
    { date: 'Today 19:45', type: 'Lab', title: 'D-Dimer', subtitle: 'Order placed', status: 'Neutral' },
  ],
};

export const CASE_009_POSTOP: ClinicalPatient = {
  id: 'CASE-009',
  name: 'Mitchell, David',
  clinicalDescriptor: 'Post-Op Dyspnea',
  demographics: { age: 65, sex: 'M', mrn: 'MRN-8472916' },
  vitals: { hr: 105, sbp: 118, dbp: 72, rr: 24, spo2: 93, temp: 37.2 },
  labs: {
    ddimer: null, // PENDING - URGENT
    ddimerUnits: 'µg/mL',
    creatinine: 1.2,
    egfr: 58,
    troponin: null,
  },
  scores: {
    wellsScore: 4.5, // Immobility (1.5) + HR > 100 (1.5) + PE likely (1.5)
    wellsRisk: 'high',
    percScore: 4,
    percNegative: false,
  },
  clinicalContext: {
    chiefComplaint: 'Progressive shortness of breath',
    relevantHistory: [
      'Knee replacement 2 weeks ago',
      'Limited mobility since surgery',
      'No DVT prophylaxis after discharge',
      'No prior VTE',
    ],
    physicalExam: [
      'Tachypneic at rest',
      'Tachycardic',
      'Diminished breath sounds right base',
      'Right calf slightly larger than left',
    ],
  },
  medications: [
    { name: 'Oxycodone', category: 'Analgesic', dose: '5mg Q4H PRN', lastRefill: '2026-01-13', daysSupply: 14 },
    { name: 'Lisinopril', category: 'Cardiovascular', dose: '10mg daily', lastRefill: '2025-12-20', daysSupply: 90 },
    { name: 'Metformin', category: 'Other', dose: '500mg BID', lastRefill: '2025-12-20', daysSupply: 90 },
  ],
  timeline: [
    { date: '2 weeks ago', type: 'Procedure', title: 'Knee Replacement', subtitle: 'Right TKA' },
    { date: '10 days ago', type: 'Procedure', title: 'Hospital Discharge', subtitle: 'No anticoagulation prescribed' },
    { date: '3 days ago', type: 'Diagnosis', title: 'SOB Onset', subtitle: 'Progressive worsening' },
    { date: 'Today 20:00', type: 'Lab', title: 'D-Dimer STAT', subtitle: 'Order placed - URGENT', status: 'Neutral' },
  ],
};

export const CASE_010_VIRAL: ClinicalPatient = {
  id: 'CASE-010',
  name: 'Park, Daniel',
  clinicalDescriptor: 'Viral Illness with Cough',
  demographics: { age: 35, sex: 'M', mrn: 'MRN-5928471' },
  vitals: { hr: 98, sbp: 122, dbp: 78, rr: 20, spo2: 97, temp: 38.2 },
  labs: {
    ddimer: null, // PENDING
    ddimerUnits: 'µg/mL',
    creatinine: 0.9,
    egfr: 98,
    troponin: null,
  },
  scores: {
    wellsScore: 0,
    wellsRisk: 'low',
    percScore: 0,
    percNegative: true,
  },
  clinicalContext: {
    chiefComplaint: 'Cough, fever, mild SOB',
    relevantHistory: [
      'Recent sick contacts',
      'No chronic medical conditions',
      'No prior VTE',
      'No recent travel or surgery',
    ],
    physicalExam: [
      'Appears mildly ill',
      'Pharyngeal erythema',
      'Scattered rhonchi bilaterally',
      'No leg findings',
    ],
  },
  medications: [],
  timeline: [
    { date: '4 days ago', type: 'Diagnosis', title: 'Symptom Onset', subtitle: 'Fever and malaise' },
    { date: '2 days ago', type: 'Diagnosis', title: 'Cough Developed', subtitle: 'Productive' },
    { date: 'Today 21:00', type: 'Diagnosis', title: 'ED Presentation', subtitle: 'Mild dyspnea added' },
    { date: 'Today 21:15', type: 'Lab', title: 'D-Dimer', subtitle: 'Order placed', status: 'Neutral' },
  ],
};

// ===========================================================================
// Export All Cases
// ===========================================================================

export const CLINICAL_CASES: ClinicalPatient[] = [
  // Resulted Cases (D-Dimer Available)
  CASE_001_ANXIETY,
  CASE_002_COPD,
  CASE_003_PLEURISY,
  CASE_004_SYNCOPE,
  CASE_005_DVT,
  // Pre-Workup Cases (D-Dimer Pending)
  CASE_006_TRIAGE_CP,
  CASE_007_ELDERLY_SYNCOPE,
  CASE_008_ANXIOUS_YOUNG,
  CASE_009_POSTOP,
  CASE_010_VIRAL,
];

export const DEFAULT_CASE = CASE_001_ANXIETY;

// ===========================================================================
// Utility: Calculate Hemodynamics
// ===========================================================================

export function calculateHemodynamics(vitals: ClinicalPatient['vitals']) {
  const { hr, sbp, dbp } = vitals;
  return {
    shockIndex: sbp > 0 ? hr / sbp : null,
    map: (sbp + 2 * dbp) / 3,
    pulsePressure: sbp - dbp,
  };
}

export function calculateAgeAdjustedDdimer(age: number): number {
  return age > 50 ? age * 0.01 : 0.50;
}

// ===========================================================================
// Legacy: Convert to DemoScenario for backward compatibility
// ===========================================================================

export function clinicalPatientToScenario(patient: ClinicalPatient): DemoScenario {
  return {
    id: patient.id,
    name: patient.name,
    description: patient.clinicalDescriptor,
    data: {
      patient_id: patient.id,
      timestamp: new Date().toISOString(),
      probability: 0, // FDA Compliance: No AI probability
      threshold: 0.08,
      decision: 'rule_out', // Placeholder - not used
      explanation: '',
      feature_summary: {
        age: patient.demographics.age,
        gender_male: patient.demographics.sex === 'M' ? 1 : 0,
        gender_female: patient.demographics.sex === 'F' ? 1 : 0,
        triage_hr: patient.vitals.hr,
        triage_sbp: patient.vitals.sbp,
        triage_dbp: patient.vitals.dbp,
        triage_rr: patient.vitals.rr,
        triage_o2sat: patient.vitals.spo2,
        triage_temp: patient.vitals.temp,
        d_dimer: patient.labs.ddimer ?? 0,
        creatinine: patient.labs.creatinine,
        gfr: patient.labs.egfr,
        wells_score: patient.scores.wellsScore,
        perc_score: patient.scores.percScore,
        perc_negative: patient.scores.percNegative ? 1 : 0,
        shock_index: calculateHemodynamics(patient.vitals).shockIndex ?? 0,
      },
      safety_note: '',
    },
  };
}

export const DEMO_SCENARIOS: DemoScenario[] = CLINICAL_CASES.map(clinicalPatientToScenario);
export const DEFAULT_DEMO_SCENARIO = DEMO_SCENARIOS[0];
