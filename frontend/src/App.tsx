import { useState } from 'react';
import DashboardLayout from './components/DashboardLayout';
import { TEACHING_CASES } from './data/demoData';
import './index.css';

const DEMO_TAB_INDICES = [10, 12, 11, 0];

function App() {
  const [tabIndex, setTabIndex] = useState(0);
  const caseIndex = DEMO_TAB_INDICES[tabIndex];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Navigation Bar */}
      <div className="h-16 bg-white border-b border-slate-200 flex items-center px-6 justify-between shadow-sm sticky top-0 z-50">
        <span style={{ fontSize: 16, fontWeight: 500, color: '#111827' }}>PE Workup</span>

        {/* Case Selector — hidden */}
        <div className="flex-1 hidden" />

        <div className="text-right hidden md:block">
          <p style={{ fontSize: 14, fontWeight: 400, color: '#111827' }}>Dr. Anush Rizvi</p>
          <p style={{ fontSize: 12, fontWeight: 400, color: '#596887' }}>Emergency Medicine</p>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="p-4 md:p-6">
        <div className="max-w-[1000px] mx-auto">
          {/* Case Tabs */}
          <div className="flex gap-1 mb-4 bg-white border border-slate-200 rounded-lg p-1 w-fit">
            {DEMO_TAB_INDICES.map((_, i) => (
              <button
                key={i}
                onClick={() => setTabIndex(i)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  tabIndex === i
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Case {i + 1}
              </button>
            ))}
          </div>
          <DashboardLayout caseIndex={caseIndex} />
        </div>
      </main>
    </div>
  );
}

export default App;
