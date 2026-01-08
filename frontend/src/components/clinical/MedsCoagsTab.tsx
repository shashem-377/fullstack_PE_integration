import { useState, useEffect } from 'react';

interface MedsCoagsTabProps {
  patientId: string;
}

interface Medication {
  name: string;
  type: string;
  status: string;
  start: string | null;
}

interface INRPoint {
  time: string;
  value: number;
  unit: string;
}

/**
 * Meds & Coags Tab - Anticoagulation details.
 * 
 * Shows:
 * - Grouped medication list (DOACs, Warfarin, Heparin/LMWH, Antiplatelets)
 * - INR trend chart if on Warfarin
 */
export default function MedsCoagsTab({ patientId }: MedsCoagsTabProps) {
  const [anticoag, setAnticoag] = useState<any>(null);
  const [inrData, setInrData] = useState<INRPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllMeds, setShowAllMeds] = useState(false);

  useEffect(() => {
    loadData();
  }, [patientId]);

  const loadData = async () => {
    setLoading(true);
    
    try {
      // Load anticoagulation data
      const anticoagRes = await fetch(`/api/clinical/anticoagulation?patient_id=${patientId}`, {
        credentials: 'include'
      });
      if (anticoagRes.ok) {
        const data = await anticoagRes.json();
        setAnticoag(data);
        
        // If has warfarin, load INR
        if (data.has_warfarin) {
          const inrRes = await fetch(`/api/clinical/inr?patient_id=${patientId}&days=30`, {
            credentials: 'include'
          });
          if (inrRes.ok) {
            const inrJson = await inrRes.json();
            setInrData(inrJson.series || []);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load meds/coags:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="meds-coags-tab">
        <div className="skeleton-loader">
          <div className="skeleton skeleton-list"></div>
          <div className="skeleton skeleton-chart"></div>
        </div>
      </div>
    );
  }

  // Group medications by type
  const medications = anticoag?.medications || [];
  const groupedMeds: Record<string, Medication[]> = {
    DOAC: [],
    Warfarin: [],
    Heparin_LMWH: [],
    Antiplatelet: []
  };
  
  medications.forEach((med: Medication) => {
    if (groupedMeds[med.type]) {
      groupedMeds[med.type].push(med);
    }
  });

  const groupLabels: Record<string, string> = {
    DOAC: 'DOACs',
    Warfarin: 'Warfarin',
    Heparin_LMWH: 'Heparin / LMWH',
    Antiplatelet: 'Antiplatelets'
  };

  // INR chart data
  const lastINR = inrData.length > 0 ? inrData[0] : null;

  return (
    <div className="meds-coags-tab">
      {/* Status summary */}
      <div className="meds-status">
        <span className={`status-badge status-${anticoag?.status || 'unknown'}`}>
          {anticoag?.status === 'on_anticoagulant' ? '⚠️ On Anticoagulant' :
           anticoag?.status === 'none' ? '✓ No Anticoagulation' : '? Unknown'}
        </span>
      </div>

      {/* Medication groups */}
      <div className="meds-groups">
        {Object.entries(groupLabels).map(([type, label]) => {
          const meds = groupedMeds[type];
          if (meds.length === 0) return null;
          
          const displayMeds = showAllMeds ? meds : meds.slice(0, 3);
          
          return (
            <div key={type} className="med-group">
              <div className="group-header">{label}</div>
              <div className="group-meds">
                {displayMeds.map((med, i) => (
                  <div key={i} className={`med-item status-${med.status}`}>
                    <span className="med-name">{med.name}</span>
                    <span className="med-status">{med.status}</span>
                    {med.start && (
                      <span className="med-start">Since {med.start}</span>
                    )}
                  </div>
                ))}
                {meds.length > 3 && !showAllMeds && (
                  <button className="show-more" onClick={() => setShowAllMeds(true)}>
                    +{meds.length - 3} more
                  </button>
                )}
              </div>
            </div>
          );
        })}
        
        {medications.length === 0 && (
          <div className="no-meds">
            No anticoagulant or antiplatelet medications found in records
          </div>
        )}
      </div>

      {/* INR Trend (if on Warfarin) */}
      {anticoag?.has_warfarin && (
        <div className="inr-section">
          <div className="section-label">INR Trend (Last 30 Days)</div>
          
          {lastINR ? (
            <div className="inr-content">
              <div className="inr-latest">
                <span className="inr-value">{lastINR.value.toFixed(1)}</span>
                <span className="inr-label">Latest INR</span>
                <span className="inr-date">
                  {new Date(lastINR.time).toLocaleDateString()}
                </span>
              </div>
              
              {inrData.length > 1 && (
                <div className="inr-trend-mini">
                  <svg width="150" height="40" className="inr-chart">
                    {inrData.slice(0, 10).reverse().map((point, i, arr) => {
                      const x = (i / (arr.length - 1)) * 140 + 5;
                      const y = 35 - ((point.value - 1) / 4) * 30; // INR 1-5 range
                      return i === 0 ? null : (
                        <line
                          key={i}
                          x1={(((i - 1) / (arr.length - 1)) * 140 + 5)}
                          y1={35 - ((arr[i - 1].value - 1) / 4) * 30}
                          x2={x}
                          y2={y}
                          stroke="#8b5cf6"
                          strokeWidth="2"
                        />
                      );
                    })}
                    {/* Therapeutic range 2-3 */}
                    <line x1="5" y1="27.5" x2="145" y2="27.5" stroke="#22c55e" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
                    <line x1="5" y1="12.5" x2="145" y2="12.5" stroke="#22c55e" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
                  </svg>
                  <div className="inr-range-label">Therapeutic: 2.0-3.0</div>
                </div>
              )}
            </div>
          ) : (
            <div className="no-data">No INR results found</div>
          )}
        </div>
      )}
    </div>
  );
}

