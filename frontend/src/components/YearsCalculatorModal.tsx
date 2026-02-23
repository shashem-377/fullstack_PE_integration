/**
 * YEARS PE Algorithm Calculator Modal
 * Adapted from Magic Patterns design (VariantA)
 * Uses Tailwind CSS to match the main app's styling system.
 */

import React, { useState, useEffect } from 'react';
import { X, Check, CheckCircle, AlertTriangle, ClipboardCopy, Droplets } from 'lucide-react';

type FactorValue = true | false | null;

interface Factors {
  dvt: FactorValue;
  hemoptysis: FactorValue;
  peMostLikely: FactorValue;
}

const QUESTIONS = [
  { key: 'dvt' as keyof Factors, label: 'Clinical DVT?' },
  { key: 'hemoptysis' as keyof Factors, label: 'Hemoptysis?' },
  { key: 'peMostLikely' as keyof Factors, label: 'PE is most likely diagnosis' },
];

const CASES = {
  case1: {
    patient: 'Barnes, Richard · 52M',
    complaint: 'Left calf cramping x 3 days, mild SOB today',
    dDimer: 760,
    defaultFactors: { dvt: false, hemoptysis: false, peMostLikely: false } as Factors,
  },
  case4: {
    patient: 'Johnson, Robert · 62M',
    complaint: 'Fever, productive cough, SOB',
    dDimer: 512,
    defaultFactors: { dvt: true, hemoptysis: true, peMostLikely: false } as Factors,
  },
};

interface YearsCalculatorModalProps {
  initialCase: 'case1' | 'case4';
  onClose: () => void;
}

export default function YearsCalculatorModal({ initialCase, onClose }: YearsCalculatorModalProps) {
  const [activeCase, setActiveCase] = useState<'case1' | 'case4'>(initialCase);
  const [factors, setFactors] = useState<Factors>(CASES[initialCase].defaultFactors);
  const [copied, setCopied] = useState(false);

  const caseData = CASES[activeCase];
  const { dDimer } = caseData;

  useEffect(() => {
    setFactors(CASES[activeCase].defaultFactors);
    setCopied(false);
  }, [activeCase]);

  const allAnswered = Object.values(factors).filter((v) => v !== null).length === 3;
  const yearsScore = Object.values(factors).filter((v) => v === true).length;
  const threshold = yearsScore === 0 ? 1000 : 500;
  const result = allAnswered ? (dDimer < threshold ? 'rule-out' : 'no-rule-out') : null;

  const setFactor = (key: keyof Factors, value: boolean) => {
    setFactors((prev) => ({ ...prev, [key]: value }));
  };

  const handleCopy = () => {
    const mdm =
      result === 'rule-out'
        ? `YEARS Algorithm: D-Dimer ${dDimer} ng/mL, YEARS score ${yearsScore}, threshold ${threshold} ng/mL. PE ruled out. 0.43% VTE risk at 3-month follow-up. No CTA-PE indicated.`
        : `YEARS Algorithm: D-Dimer ${dDimer} ng/mL, YEARS score ${yearsScore}, threshold ${threshold} ng/mL. D-Dimer exceeds threshold. CTA-PE recommended.`;
    navigator.clipboard.writeText(mdm).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // D-Dimer bar calculations
  const maxValue = Math.max(dDimer, threshold) * 1.35;
  const dDimerPct = (dDimer / maxValue) * 100;
  const thresholdPct = (threshold / maxValue) * 100;
  const exceeds = dDimer >= threshold;

  // Build human-readable factor text
  const positiveLabels: string[] = [];
  if (factors.dvt === true) positiveLabels.push('signs of clinical DVT present');
  if (factors.hemoptysis === true) positiveLabels.push('hemoptysis present');
  if (factors.peMostLikely === true) positiveLabels.push('PE was most likely diagnosis');
  const allNo =
    factors.dvt === false && factors.hemoptysis === false && factors.peMostLikely === false;
  const factorListText = allNo
    ? 'no signs of clinical DVT, no hemoptysis, and PE not most likely diagnosis'
    : positiveLabels.length === 1
    ? positiveLabels[0]
    : positiveLabels.length === 2
    ? `${positiveLabels[0]} and ${positiveLabels[1]}`
    : `${positiveLabels[0]}, ${positiveLabels[1]}, and ${positiveLabels[2]}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-[630px] max-h-[90vh] overflow-y-auto"
        style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
      >
        {/* Controls bar */}
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
          <div className="flex gap-1">
            {(['case1', 'case4'] as const).map((c) => (
              <button
                key={c}
                onClick={() => setActiveCase(c)}
                className={`px-3 h-7 rounded text-xs font-semibold border transition-colors ${
                  activeCase === c
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
                }`}
              >
                {c === 'case1' ? 'Case 3' : 'Case 4'}
              </button>
            ))}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Main content */}
        <div className="px-8 pt-6 pb-10">
          {/* Patient header */}
          <div className="flex gap-10 mb-6">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Patient</p>
              <p className="text-sm text-gray-900">{caseData.patient}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Chief Complaint</p>
              <p className="text-sm text-gray-900">{caseData.complaint}</p>
            </div>
          </div>

          {/* D-Dimer badge */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 rounded px-3 py-1.5 bg-[#F7F9FF]">
              <Droplets size={15} className="text-gray-500" />
              <span className="text-sm font-semibold text-gray-900">
                D-Dimer: {dDimer} NG/ML
              </span>
            </div>
          </div>

          {/* Title */}
          <div className="mb-7">
            <p className="text-xl font-bold text-gray-900 leading-snug mb-2">
              YEARS can rule out PE if no additional factors are present. Select factors to see
              YEARS results and MDM.
            </p>
            <p className="text-sm text-gray-500">
              Legally sound MDM will be generated based on chart data and YEARS.
            </p>
          </div>

          {/* Questions + bar in constrained width column */}
          <div className="w-full max-w-[480px]">
            <div className="flex flex-col gap-6">
              {QUESTIONS.map((q) => (
                <div key={q.key}>
                  <p className="text-[15px] font-bold text-gray-900 mb-3">{q.label}</p>
                  <div className="flex w-full">
                    {/* Yes button */}
                    <button
                      onClick={() => setFactor(q.key, true)}
                      className={`flex-1 h-[52px] text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 rounded-l border ${
                        factors[q.key] === true
                          ? 'border-gray-900 bg-[#F7F9FF] text-gray-900'
                          : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                      style={{
                        borderRight:
                          factors[q.key] === false ? 'none' : undefined,
                      }}
                    >
                      {factors[q.key] === true && <Check size={14} />}
                      Yes
                    </button>
                    {/* No button */}
                    <button
                      onClick={() => setFactor(q.key, false)}
                      className={`flex-1 h-[52px] text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 rounded-r border ${
                        factors[q.key] === false
                          ? 'border-gray-900 bg-[#F7F9FF] text-gray-900'
                          : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                      style={{
                        borderLeft:
                          factors[q.key] === true ? 'none' : undefined,
                      }}
                    >
                      {factors[q.key] === false && <X size={14} />}
                      No
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* D-Dimer bar — shown after all answered */}
            {allAnswered && (
              <div className="mt-10 mb-2">
                <p className="text-[15px] font-bold text-gray-900 mb-5">
                  D-Dimer vs. YEARS Threshold
                </p>

                {/* Threshold label above bar */}
                <div className="relative h-9 mb-1">
                  <div
                    className="absolute text-center"
                    style={{ left: `${thresholdPct}%`, transform: 'translateX(-50%)' }}
                  >
                    <p className="text-[11px] text-gray-600 whitespace-nowrap">Threshold</p>
                    <p className="text-[13px] font-bold text-gray-600">{threshold}</p>
                  </div>
                </div>

                {/* Bar track */}
                <div className="relative h-[10px] w-full overflow-visible">
                  {/* Gray zone: 0 → threshold */}
                  <div
                    className="absolute left-0 top-0 h-full bg-gray-200 rounded-l-full"
                    style={{ width: `${thresholdPct}%` }}
                  />
                  {/* Light zone: threshold → max */}
                  <div
                    className="absolute top-0 h-full bg-gray-100 rounded-r-full"
                    style={{ left: `${thresholdPct}%`, width: `${100 - thresholdPct}%` }}
                  />
                  {/* D-Dimer fill */}
                  <div
                    className="absolute left-0 top-0 h-full rounded-l-full z-[2]"
                    style={{
                      width: `${dDimerPct}%`,
                      backgroundColor: exceeds ? '#991B1B' : '#166534',
                      transition: 'width 0.5s ease, background-color 0.4s ease',
                    }}
                  />
                  {/* Threshold tick */}
                  <div
                    className="absolute top-[-5px] h-5 w-px bg-gray-500 z-[4]"
                    style={{ left: `${thresholdPct}%`, transform: 'translateX(-50%)' }}
                  />
                  {/* D-Dimer tick */}
                  <div
                    className="absolute top-[-5px] h-5 w-px z-[5]"
                    style={{
                      left: `${dDimerPct}%`,
                      transform: 'translateX(-50%)',
                      backgroundColor: exceeds ? '#991B1B' : '#166534',
                    }}
                  />
                </div>

                {/* D-Dimer label below bar */}
                <div className="relative h-9 mt-1">
                  <div
                    className="absolute text-center"
                    style={{ left: `${dDimerPct}%`, transform: 'translateX(-50%)' }}
                  >
                    <p
                      className="text-[13px] font-bold"
                      style={{ color: exceeds ? '#991B1B' : '#166534' }}
                    >
                      {dDimer}
                    </p>
                    <p
                      className="text-[11px] whitespace-nowrap"
                      style={{ color: exceeds ? '#991B1B' : '#166534' }}
                    >
                      D-Dimer
                    </p>
                  </div>
                </div>

                {/* Legend */}
                <div className="mt-4">
                  <p className="text-xs text-gray-600">
                    Threshold = 1000 when 0 clinical factors present
                  </p>
                  <p className="text-xs text-gray-600">
                    Threshold = 500 when &ge; 1 clinical factor present
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Result card */}
          {allAnswered && (
            <div className="pt-8">
              <div
                className="border rounded-lg p-5"
                style={{
                  backgroundColor: result === 'rule-out' ? '#F0FDF4' : '#FEF2F2',
                  borderColor: result === 'rule-out' ? '#86EFAC' : '#FECACA',
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span style={{ color: result === 'rule-out' ? '#16A34A' : '#DC2626' }}>
                    {result === 'rule-out' ? (
                      <CheckCircle size={18} />
                    ) : (
                      <AlertTriangle size={18} />
                    )}
                  </span>
                  <p
                    className="text-base font-bold"
                    style={{ color: result === 'rule-out' ? '#166534' : '#991B1B' }}
                  >
                    {result === 'rule-out' ? 'PE can be ruled out' : 'PE cannot be ruled out'}
                  </p>
                </div>
                <p className="text-sm text-gray-900 mb-5 leading-relaxed">
                  {result === 'rule-out'
                    ? `D-Dimer ${dDimer} ng/mL is below the YEARS threshold of ${threshold} (${factorListText}). YEARS algorithm rules out PE with 0.43% VTE risk at 3-month follow-up.`
                    : `D-Dimer ${dDimer} ng/mL exceeds the YEARS threshold of ${threshold} (${factorListText}). CTA-PE is recommended.`}
                </p>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 h-9 bg-gray-900 text-white text-sm font-semibold rounded hover:bg-gray-800 transition-colors"
                >
                  <ClipboardCopy size={15} />
                  {copied ? 'Copied!' : 'Copy MDM'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
