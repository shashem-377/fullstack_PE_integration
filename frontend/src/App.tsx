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
        <div className="flex items-center space-x-2 flex-shrink-0">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">L</span>
          </div>
          <span className="font-bold text-xl text-slate-800">Luminur Clinical</span>
        </div>

        {/* Case Selector — hidden */}
        <div className="flex-1 hidden" />

        <div className="flex items-center space-x-4 flex-shrink-0">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-slate-900">Dr. Sandbox User</p>
            <p className="text-xs text-slate-500">Emergency Medicine</p>
          </div>
          <div className="h-8 w-8 bg-slate-200 rounded-full" />
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
