import React, { useState, useEffect } from 'react';
import { AppPage, MarketData } from './types';
import { geminiService } from './services/geminiService';
import MarketMatrix from './components/MarketMatrix';
import CompetitorDetails from './components/CompetitorDetails';
import FieldResearchLab from './components/FieldResearchLab';

// Interface for AI Studio window object
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<AppPage>(AppPage.MARKET_MATRIX);
  const [currentDMA, setCurrentDMA] = useState<string>('Dallas DFW');
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasLoadedInitial, setHasLoadedInitial] = useState(false);
  
  // API Key State
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);

  useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    if (window.aistudio && window.aistudio.hasSelectedApiKey) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      setHasApiKey(hasKey);
      if (hasKey && !hasLoadedInitial) {
        loadMarketData();
      }
    } else {
      // Fallback for dev environments without window.aistudio
      setHasApiKey(true);
      if (!hasLoadedInitial) {
         loadMarketData();
      }
    }
  };

  const handleSelectKey = async () => {
    if (window.aistudio && window.aistudio.openSelectKey) {
      await window.aistudio.openSelectKey();
      // Assume success after dialog interaction per guidelines
      setHasApiKey(true);
      loadMarketData();
    }
  };

  const loadMarketData = async () => {
    setIsLoading(true);
    const data = await geminiService.generateMarketMatrix(currentDMA);
    setMarketData(data);
    setIsLoading(false);
    setHasLoadedInitial(true);
  };

  const handleDMAChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentDMA(e.target.value);
  };

  const handleDMAKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        loadMarketData();
    }
  };

  if (!hasApiKey) {
      return (
          <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white p-6">
              <div className="max-w-md text-center space-y-6">
                  <h1 className="text-3xl font-bold">AD&I Market Intelligence</h1>
                  <p className="text-slate-300">
                      Access to the Market Research Agent requires a valid API key with billing enabled (for Search & Veo capabilities).
                  </p>
                  <button 
                    onClick={handleSelectKey}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Select API Key
                  </button>
                  <p className="text-xs text-slate-500">
                      Learn more about billing at <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline">ai.google.dev/gemini-api/docs/billing</a>
                  </p>
              </div>
          </div>
      );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-20">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold tracking-tight text-white">AD&I Intelligence</h1>
          <p className="text-xs text-slate-400 mt-1">Market Strategist Agent</p>
        </div>
        
        <nav className="flex-1 py-6 space-y-2 px-3">
          <button
            onClick={() => setCurrentPage(AppPage.MARKET_MATRIX)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentPage === AppPage.MARKET_MATRIX ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            Market Matrix
          </button>
          
          <button
            onClick={() => setCurrentPage(AppPage.COMPETITOR_DEEP_DIVE)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentPage === AppPage.COMPETITOR_DEEP_DIVE ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            Competitor Details
          </button>

          <button
            onClick={() => setCurrentPage(AppPage.FIELD_RESEARCH_LAB)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentPage === AppPage.FIELD_RESEARCH_LAB ? 'bg-purple-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
            Research Lab (AI)
          </button>
        </nav>

        {/* Global Context Control */}
        <div className="p-4 border-t border-slate-800">
           <label className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2 block">Target Market / DMA</label>
           <div className="flex gap-1">
               <input 
                 type="text"
                 value={currentDMA} 
                 onChange={handleDMAChange}
                 onKeyDown={handleDMAKeyDown}
                 placeholder="e.g. Phoenix, Chicago..."
                 className="w-full bg-slate-800 text-white text-sm rounded border border-slate-700 p-2 focus:ring-2 focus:ring-blue-500 outline-none"
               />
               <button 
                onClick={loadMarketData}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded flex items-center justify-center"
               >
                   {isLoading ? (
                       <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                       </svg>
                   ) : (
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                   )}
               </button>
           </div>
           {currentDMA.toLowerCase().includes('dallas') || currentDMA.toLowerCase().includes('dfw') ? (
               <p className="text-[10px] text-green-400 mt-2 flex items-center">
                   <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                   Internal Data Locked
               </p>
           ) : (
               <p className="text-[10px] text-purple-400 mt-2 flex items-center">
                   <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                   AI Research Active
               </p>
           )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden p-4 relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        
        {currentPage === AppPage.MARKET_MATRIX && (
          <div className="h-full overflow-y-auto">
            <MarketMatrix 
              data={marketData} 
              isLoading={isLoading} 
              onRefresh={loadMarketData} 
            />
          </div>
        )}

        {currentPage === AppPage.COMPETITOR_DEEP_DIVE && (
           <div className="h-full overflow-hidden">
             <CompetitorDetails 
                marketData={marketData}
                dma={currentDMA}
             />
           </div>
        )}

        {currentPage === AppPage.FIELD_RESEARCH_LAB && (
            <div className="h-full pb-2">
                <FieldResearchLab />
            </div>
        )}
      </main>
    </div>
  );
};

export default App;