import { useState, useEffect, useCallback } from 'react';
import TopBar from './components/TopBar';
import DecisionCard from './components/DecisionCard';
import DemoModeSelector from './components/DemoModeSelector';
import SandboxTestPanel from './components/SandboxTestPanel';
import DebugPanel from './components/DebugPanel';
import AuthIndicator from './components/AuthIndicator';
import AuthDebugPanel from './components/AuthDebugPanel';
import VitalsSnapshotRow from './components/VitalsSnapshotRow';
import RiskScoreDropdowns from './components/RiskScoreDropdowns';
import WhySection from './components/WhySection';
import SupportingDataDrawer from './components/SupportingDataDrawer';
import DemoPatientSelector from './components/DemoPatientSelector';
import ErrorBoundary from './components/ErrorBoundary';
import PriorHistoryChips from './components/PriorHistoryChips';
import NoPatientSelected from './components/NoPatientSelected';
import { useAutoAuth } from './hooks/useAutoAuth';
import { DEFAULT_DEMO_SCENARIO } from './data/demoData';
import { transformAPIResponse } from './utils/dataTransform';
import { safeFetch, setTrackedPatientId } from './utils/safeFetch';
import { isValidPatientId, getPatientIdError } from './utils/patientId';
import type { AssessmentResult, APIAssessmentResponse, DemoScenario } from './types/assessment';
import './App.css';

const DEFAULT_PATIENT_ID = 'Tbt3KuCY0B5PSrJvCu2j-PlK.aiHsu2xUjUM8bWpetXoB';

interface DebugInfo {
  patient_id: string;
  data_source: string;
  fhir_calls: string[];
  vitals_count: number;
  labs_count: number;
  missing_critical: string[];
  missing_optional: string[];
  warnings: string[];
}

interface FrontpageData {
  data_source: 'EPIC' | 'DEMO';
  patient?: { id: string; name?: string };
  vitals_latest?: {
    hr: number | null;
    spo2: number | null;
    rr: number | null;
    sbp: number | null;
    timestamp: string | null;
  };
  vitals_series?: Record<string, unknown[]>;
  labs_latest?: {
    ddimer: number | null;
    ddimer_units: string | null;
    timestamp: string | null;
  };
  ddimer_latest?: {
    value: number | null;
    ts: string | null;
    unit: string | null;
  };
  history_flags?: {
    prior_pe: boolean;
    prior_dvt_vte: boolean;
    active_cancer: boolean;
    recent_surgery: boolean;
    immobilization: boolean;
    thrombophilia: boolean;
    pregnancy_estrogen: boolean;
  };
  prior_risk_flags?: Record<string, boolean>;
  history_checked?: string[];
  missingness?: {
    vitals_missing: boolean;
    ddimer_missing: boolean;
    history_missing: boolean;
  };
}

function App() {
  // Auto-auth hook for sandbox mode
  const {
    isAuthenticated,
    isChecking: isCheckingAuth,
    authError,
    sessionId: autoSessionId,
    patient: autoPatient,
    sandboxMode,
    timeRemaining,
    backendAvailable,
    triggerReauth
  } = useAutoAuth();

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [patientId, setPatientId] = useState<string>(DEFAULT_PATIENT_ID);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [rawFeatureSummary, setRawFeatureSummary] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(!sandboxMode);
  const [selectedScenario, setSelectedScenario] = useState<DemoScenario>(DEFAULT_DEMO_SCENARIO);
  
  // Frontpage data for stable clinical display
  const [frontpageData, setFrontpageData] = useState<FrontpageData | null>(null);
  const [frontpageLoading, setFrontpageLoading] = useState(false);
  const [frontpageError, setFrontpageError] = useState<string | null>(null);

  // Sync session from auto-auth
  useEffect(() => {
    if (autoSessionId) {
      setSessionId(autoSessionId);
      if (isAuthenticated) {
        setIsDemoMode(false);
      }
    }
    if (autoPatient) {
      setPatientId(autoPatient);
    }
  }, [autoSessionId, autoPatient, isAuthenticated]);

  // Check URL params on mount (fallback)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const session = params.get('session');
    const patient = params.get('patient');
    if (session && !autoSessionId) {
      setSessionId(session);
      setIsDemoMode(false);
    }
    if (patient) setPatientId(patient);
  }, [autoSessionId]);

  // Load frontpage data when patient changes - with validation
  useEffect(() => {
    if (isValidPatientId(patientId) && isAuthenticated && !isDemoMode) {
      loadFrontpageData(patientId);
    } else {
      setFrontpageData(null);
      setFrontpageError(null);
    }
  }, [patientId, isAuthenticated, isDemoMode]);

  const loadFrontpageData = async (pid: string) => {
    if (!isValidPatientId(pid)) {
      console.warn('loadFrontpageData called with invalid patient_id:', pid);
      setFrontpageError(getPatientIdError(pid));
      setFrontpageLoading(false);
      return;
    }
    
    setFrontpageLoading(true);
    setFrontpageError(null);
    setFrontpageData(null);
    setTrackedPatientId(pid);
    
    const { data, error: fetchError } = await safeFetch<FrontpageData>(
      `/api/clinical/frontpage?patient_id=${encodeURIComponent(pid)}`
    );
    
    if (fetchError) {
      setFrontpageError(fetchError);
    } else {
      setFrontpageData(data);
    }
    setFrontpageLoading(false);
  };

  // Sample features for testing
  const getSampleFeatures = useCallback(() => ({
    age: 55, bmi: 28.5, gender_male: 1, gender_female: 0,
    triage_hr: 105, triage_rr: 22, triage_o2sat: 93,
    triage_temp: 37.2, triage_sbp: 125, triage_dbp: 78,
    cc_dyspnea: 1, cc_chest_pain: 1, cc_leg_pain_swelling: 0,
    prior_pe_diagnosis: 0, prior_dvt_diagnosis: 1, prior_cancer: 0,
    wells_score: 3.0, perc_score: 3, perc_negative: 0,
    shock_index: 0.84, arrival_ambulance: 1,
  }), []);

  // Run API assessment for a specific patient
  const runAssessmentForPatient = useCallback(async (targetPatientId: string) => {
    setIsLoading(true);
    setError(null);
    setDebugInfo(null);
    
    try {
      const requestBody: { patient_id: string; session_id?: string; features?: Record<string, unknown> } = {
        patient_id: targetPatientId,
      };
      
      const currentSessionId = sessionId || autoSessionId;
      if (currentSessionId) {
        requestBody.session_id = currentSessionId;
      } else {
        requestBody.features = getSampleFeatures();
      }

      const response = await fetch('/api/pe-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data.debug) {
        setDebugInfo(data.debug);
      }
      
      setRawFeatureSummary(data.feature_summary);
      
      const apiResponse: APIAssessmentResponse = {
        patient_id: data.patient_id,
        timestamp: data.timestamp,
        probability: data.probability,
        threshold: data.threshold,
        decision: data.decision,
        explanation: data.explanation,
        feature_summary: data.feature_summary,
        safety_note: data.safety_note
      };
      
      setResult(transformAPIResponse(apiResponse));
      setPatientId(targetPatientId);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Assessment failed');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, autoSessionId, getSampleFeatures]);

  // Run assessment with current patient ID
  const runAssessment = useCallback(() => {
    runAssessmentForPatient(patientId);
  }, [patientId, runAssessmentForPatient]);

  // Handle demo scenario selection - NO backend calls in demo mode
  const handleSelectScenario = useCallback((scenario: DemoScenario) => {
    setSelectedScenario(scenario);
    setResult(transformAPIResponse(scenario.data));
    setRawFeatureSummary(scenario.data.feature_summary);
    
    // Build demo frontpage data from scenario
    const demoFrontpage: FrontpageData = {
      data_source: 'DEMO',
      patient: { id: scenario.data.patient_id, name: scenario.name },
      vitals_latest: {
        hr: typeof scenario.data.feature_summary?.triage_hr === 'number' ? scenario.data.feature_summary.triage_hr : null,
        spo2: typeof scenario.data.feature_summary?.triage_o2sat === 'number' ? scenario.data.feature_summary.triage_o2sat : null,
        rr: typeof scenario.data.feature_summary?.triage_rr === 'number' ? scenario.data.feature_summary.triage_rr : null,
        sbp: typeof scenario.data.feature_summary?.triage_sbp === 'number' ? scenario.data.feature_summary.triage_sbp : null,
        timestamp: scenario.data.timestamp || null
      },
      labs_latest: {
        ddimer: typeof scenario.data.feature_summary?.d_dimer === 'number' ? scenario.data.feature_summary.d_dimer : null,
        ddimer_units: 'μg/mL',
        timestamp: scenario.data.timestamp || null
      },
      history_flags: {
        prior_pe: scenario.data.feature_summary?.prior_pe_diagnosis === 1 || scenario.data.feature_summary?.prior_pe === true,
        prior_dvt_vte: scenario.data.feature_summary?.prior_dvt_diagnosis === 1 || scenario.data.feature_summary?.prior_dvt === true,
        active_cancer: scenario.data.feature_summary?.prior_cancer === 1 || scenario.data.feature_summary?.active_malignancy === true,
        recent_surgery: scenario.data.feature_summary?.recent_surgery === 1,
        immobilization: scenario.data.feature_summary?.immobilization === 1,
        thrombophilia: scenario.data.feature_summary?.thrombophilia === true,
        pregnancy_estrogen: scenario.data.feature_summary?.estrogen_use === 1 || scenario.data.feature_summary?.pregnancy === 1
      },
      history_checked: [
        'Prior PE', 'Prior DVT/VTE', 'Active cancer', 
        'Recent surgery', 'Immobilization', 'Thrombophilia', 'Pregnancy/estrogen'
      ],
      missingness: {
        vitals_missing: false,
        ddimer_missing: scenario.data.feature_summary?.d_dimer == null,
        history_missing: false
      }
    };
    
    setFrontpageData(demoFrontpage);
    setDebugInfo({
      patient_id: scenario.data.patient_id,
      data_source: 'DEMO',
      fhir_calls: [],
      vitals_count: 5,
      labs_count: 3,
      missing_critical: [],
      missing_optional: [],
      warnings: []
    });
    setError(null);
  }, []);

  // Toggle demo mode
  const handleToggleDemoMode = useCallback(() => {
    setIsDemoMode(prev => {
      if (!prev) {
        handleSelectScenario(DEFAULT_DEMO_SCENARIO);
      } else {
        setResult(null);
        setDebugInfo(null);
        setFrontpageData(null);
      }
      return !prev;
    });
  }, [handleSelectScenario]);

  // Run assessment handler
  const handleRunAssessment = useCallback(() => {
    if (isDemoMode) {
      handleSelectScenario(selectedScenario);
    } else {
      runAssessment();
    }
  }, [isDemoMode, selectedScenario, handleSelectScenario, runAssessment]);

  // Handle patient selection from sandbox panel
  const handleSelectPatient = useCallback((selectedPatientId: string) => {
    setPatientId(selectedPatientId);
  }, []);

  // Handle run assessment from sandbox panel
  const handleSandboxRunAssessment = useCallback((targetPatientId: string) => {
    runAssessmentForPatient(targetPatientId);
  }, [runAssessmentForPatient]);

  // Initial demo load
  useEffect(() => {
    if (isDemoMode && !result) {
      handleSelectScenario(DEFAULT_DEMO_SCENARIO);
    }
  }, [isDemoMode, result, handleSelectScenario]);

  // Show loading state while checking auth in sandbox mode
  if (sandboxMode && isCheckingAuth && backendAvailable) {
    return (
      <div className="app">
        <div className="prototype-banner">
          PROTOTYPE — Decision Support Only — Clinical Judgment Required
        </div>
        <div className="auth-loading">
          <div className="auth-loading-spinner"></div>
          <p>Checking Epic Sandbox authentication...</p>
        </div>
      </div>
    );
  }

  // Build vitals/ddimer for display
  const vitalsLatest = frontpageData?.vitals_latest || 
    (result?.featureSummary ? {
      hr: typeof result.featureSummary.triage_hr === 'number' ? result.featureSummary.triage_hr : null,
      spo2: typeof result.featureSummary.triage_o2sat === 'number' ? result.featureSummary.triage_o2sat : null,
      rr: typeof result.featureSummary.triage_rr === 'number' ? result.featureSummary.triage_rr : null,
      sbp: typeof result.featureSummary.triage_sbp === 'number' ? result.featureSummary.triage_sbp : null,
      timestamp: null
    } : null);

  const ddimerLatest = frontpageData?.labs_latest || 
    (frontpageData?.ddimer_latest ? {
      ddimer: frontpageData.ddimer_latest.value,
      ddimer_units: frontpageData.ddimer_latest.unit,
      timestamp: frontpageData.ddimer_latest.ts
    } : null) ||
    (result?.featureSummary?.d_dimer != null ? {
      ddimer: result.featureSummary.d_dimer as number,
      ddimer_units: 'μg/mL',
      timestamp: null
    } : null);

  const historyFlags = frontpageData?.history_flags || 
    (frontpageData?.prior_risk_flags ? {
      prior_pe: frontpageData.prior_risk_flags.prior_pe || false,
      prior_dvt_vte: frontpageData.prior_risk_flags.prior_dvt || false,
      active_cancer: frontpageData.prior_risk_flags.active_malignancy || false,
      recent_surgery: frontpageData.prior_risk_flags.recent_surgery || false,
      immobilization: false,
      thrombophilia: frontpageData.prior_risk_flags.thrombophilia || false,
      pregnancy_estrogen: frontpageData.prior_risk_flags.pregnancy || false
    } : null) ||
    (result?.featureSummary ? {
      prior_pe: Boolean(result.featureSummary.prior_pe_diagnosis),
      prior_dvt_vte: Boolean(result.featureSummary.prior_dvt_diagnosis),
      active_cancer: Boolean(result.featureSummary.prior_cancer),
      recent_surgery: Boolean(result.featureSummary.recent_surgery),
      immobilization: Boolean(result.featureSummary.immobilization),
      thrombophilia: Boolean(result.featureSummary.thrombophilia),
      pregnancy_estrogen: Boolean(result.featureSummary.estrogen_use)
    } : null);

  const historyChecked = frontpageData?.history_checked || [
    'Prior PE', 'Prior DVT/VTE', 'Active cancer', 
    'Recent surgery', 'Immobilization', 'Thrombophilia', 'Pregnancy/estrogen'
  ];

  return (
    <ErrorBoundary fallbackTitle="Application Error" componentName="App">
    <div className="app">
      {/* Prototype warning */}
      <div className="prototype-banner">
        PROTOTYPE — Decision Support Only — Clinical Judgment Required
      </div>

      {/* Auth indicator */}
      <AuthIndicator
        isAuthenticated={isAuthenticated}
        isChecking={isCheckingAuth}
        sandboxMode={sandboxMode}
        timeRemaining={timeRemaining}
        patient={autoPatient}
        onReauth={triggerReauth}
        error={authError}
        backendAvailable={backendAvailable}
      />

      {/* Auth Debug Panel */}
      <AuthDebugPanel visible={sandboxMode || !isAuthenticated} sessionId={sessionId || autoSessionId} />

      <TopBar
        patientId={isDemoMode ? `Demo: ${selectedScenario.name}` : patientId}
        isLoading={isLoading || frontpageLoading}
        isDemoMode={isDemoMode}
        onRunAssessment={handleRunAssessment}
        onToggleDemoMode={handleToggleDemoMode}
      />

      <main className="main">
        {/* Auth error banner */}
        {authError && (
          <div className="error-banner auth-error-banner">
            {authError}
            <button onClick={triggerReauth}>Re-authenticate</button>
          </div>
        )}

        {/* Data Source Indicator */}
        <div className={`data-source-bar source-${isDemoMode ? 'demo' : isAuthenticated ? 'epic' : 'none'}`}>
          <span className="source-dot" />
          <span className="source-text">
            {isDemoMode ? 'DEMO MODE' : isAuthenticated ? 'EPIC FHIR' : 'Not connected'}
          </span>
        </div>

        {/* Patient Controls */}
        {isAuthenticated && !isDemoMode && (
          <div className="patient-controls-row">
            <DemoPatientSelector
              currentPatientId={patientId}
              onSelectPatient={(newPatientId) => {
                setPatientId(newPatientId);
                handleSandboxRunAssessment(newPatientId);
              }}
              isAuthenticated={isAuthenticated}
            />
          </div>
        )}

        {/* Sandbox Testing Panel */}
        {!isDemoMode && (
          <SandboxTestPanel
            sessionId={sessionId || autoSessionId}
            onSelectPatient={handleSelectPatient}
            onRunAssessment={handleSandboxRunAssessment}
            isLoading={isLoading}
          />
        )}

        {/* Demo selector */}
        {isDemoMode && (
          <DemoModeSelector
            selectedScenarioId={selectedScenario.id}
            onSelectScenario={handleSelectScenario}
          />
        )}

        {/* Error state */}
        {(error || frontpageError) && (
          <div className="error-banner">
            {error || frontpageError}
            <button onClick={handleRunAssessment}>Retry</button>
          </div>
        )}

        {/* === TWO-LAYER CLINICAL UI === */}
        <ErrorBoundary fallbackTitle="Clinical display error" componentName="ClinicalPanel">
          {/* Empty state if no valid patient */}
          {!isDemoMode && isAuthenticated && !isValidPatientId(patientId) ? (
            <NoPatientSelected message={getPatientIdError(patientId) || undefined} />
          ) : (
            <>
              {/* === LAYER 1: Always Visible === */}
              
              {/* 1A. Decision Card - Primary */}
              <DecisionCard result={result} isLoading={isLoading} />

              {/* 1B. Vitals Snapshot Row */}
              <VitalsSnapshotRow
                vitals={vitalsLatest}
                ddimer={ddimerLatest}
                dataSource={isDemoMode ? 'DEMO' : 'EPIC'}
              />

              {/* 1C. Prior History / Risk Factors */}
              <PriorHistoryChips
                historyFlags={historyFlags}
                historyChecked={historyChecked}
                isMissing={frontpageData?.missingness?.history_missing}
              />

              {/* 1D. Risk Score Dropdowns */}
              <RiskScoreDropdowns features={result?.featureSummary || null} />

              {/* === LAYER 2: Collapsible === */}
              
              {/* 2A. Why Section (rationale) */}
              <WhySection result={result} />

              {/* 2B. Supporting Data Accordion */}
              <SupportingDataDrawer
                patientId={isValidPatientId(patientId) ? patientId : null}
                isAuthenticated={isAuthenticated && !isDemoMode}
              />
            </>
          )}
        </ErrorBoundary>

        {/* Debug Panel */}
        <DebugPanel 
          debug={debugInfo} 
          featureSummary={rawFeatureSummary}
        />
      </main>

      {/* Footer */}
      <footer className="footer">
        Not for clinical use • Model: MIMIC-IV ED • Threshold: 8%
      </footer>
    </div>
    </ErrorBoundary>
  );
}

export default App;
