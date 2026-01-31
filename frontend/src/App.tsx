import React, { useState, useEffect } from 'react';
import DashboardLayout from './components/DashboardLayout';
import './index.css';

function App() {
  // We default to TRUE to ensure the UI is visible immediately while dev is happening.
  const [isDemoMode, setIsDemoMode] = useState(true);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Navigation Bar */}
      <div className="h-16 bg-white border-b border-slate-200 flex items-center px-6 justify-between shadow-sm sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">L</span>
          </div>
          <span className="font-bold text-xl text-slate-800">Luminur Clinical</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-slate-900">Dr. Sandbox User</p>
            <p className="text-xs text-slate-500">Emergency Medicine</p>
          </div>
          <div className="h-8 w-8 bg-slate-200 rounded-full"></div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="p-4 md:p-6">
        <DashboardLayout isDemoMode={isDemoMode} />
      </main>
    </div>
  );
}

export default App;
