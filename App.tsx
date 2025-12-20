
import React, { useState, useRef } from 'react';
import { getCarInfo, generateCarImage, identifyCarFromImage } from './services/geminiService';
import { CarInfo, AppState } from './types';
import PerformanceChart from './components/PerformanceChart';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    searchQuery: '',
    loading: false,
    error: null,
    carData: null,
    carImageUrl: null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const performSearch = async (query: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const info = await getCarInfo(query);
      const imageUrl = await generateCarImage(info.make, info.model);
      setState(prev => ({
        ...prev,
        carData: info,
        carImageUrl: imageUrl,
        loading: false,
        searchQuery: query
      }));
      
      setTimeout(() => {
        const resultSection = document.getElementById('result-section');
        if (resultSection) {
          resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err: any) {
      console.error(err);
      setState(prev => ({
        ...prev,
        error: "Search failed. Please try a different car or check your connection.",
        loading: false,
      }));
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.searchQuery.trim()) return;
    performSearch(state.searchQuery);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = (event.target?.result as string).split(',')[1];
        const carName = await identifyCarFromImage(base64, file.type);
        performSearch(carName);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setState(prev => ({ ...prev, error: "Image search failed.", loading: false }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#020617] text-slate-200 selection:bg-sky-500/30">
      {/* Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-sky-900/20 rounded-full blur-[160px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-900/20 rounded-full blur-[160px] animate-pulse"></div>
      </div>

      {/* Hero Header (Homepage - Unchanged as requested) */}
      <header className="relative w-full pt-32 pb-40 px-4 flex flex-col items-center justify-center">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none"></div>
        
        <div className="z-10 text-center max-w-5xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-sky-500/20 bg-sky-500/5 text-sky-400 text-xs font-bold tracking-[0.3em] uppercase animate-in fade-in zoom-in duration-1000">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
            </span>
            Real-Time Automotive Intelligence
          </div>
          
          <h1 className="text-8xl md:text-[10rem] font-bold font-oswald text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-800 italic uppercase tracking-tighter leading-[0.8] drop-shadow-[0_25px_25px_rgba(0,0,0,0.5)]">
            AutoLens
          </h1>
          
          <p className="text-slate-500 text-xl md:text-2xl max-w-2xl mx-auto font-light leading-relaxed tracking-wide">
            Access real-time specs, pricing, and high-fidelity visuals instantly using live search data.
          </p>

          <div className="pt-12 w-full max-w-2xl mx-auto space-y-6">
            <form onSubmit={handleSearch} className="relative group p-[2px] bg-gradient-to-r from-sky-500 via-indigo-600 to-sky-400 rounded-[2.5rem] transition-all duration-700 hover:shadow-[0_0_60px_-15px_rgba(14,165,233,0.4)]">
              <div className="relative flex items-center bg-[#020617] rounded-[2.4rem] overflow-hidden">
                <input
                  type="text"
                  className="w-full bg-transparent text-white px-10 py-6 focus:outline-none text-xl placeholder:text-slate-700"
                  placeholder="Enter make and model..."
                  value={state.searchQuery}
                  onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
                />
                <div className="flex items-center gap-3 pr-6">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 text-slate-600 hover:text-sky-400 transition-all hover:scale-110"
                    title="Visual Search"
                  >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                  
                  <button
                    type="submit"
                    disabled={state.loading}
                    className="bg-white text-slate-950 font-black px-10 py-4 rounded-3xl transition-all uppercase tracking-widest text-sm disabled:bg-slate-900 disabled:text-slate-700 shadow-2xl hover:bg-sky-400 active:scale-95"
                  >
                    {state.loading ? 'Searching...' : 'Explore'}
                  </button>
                </div>
              </div>
            </form>

            <div className="flex justify-center">
              <div className="relative group/tooltip">
                <button
                  type="button"
                  disabled
                  className="bg-slate-900/50 text-slate-500 font-bold px-10 py-4 rounded-3xl uppercase tracking-[0.3em] text-xs cursor-not-allowed flex items-center gap-3 border border-slate-800 transition-all group-hover/tooltip:border-indigo-500/30"
                >
                  <svg className="w-4 h-4 text-slate-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                  Comparison
                </button>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 px-4 py-2 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-all transform scale-95 group-hover/tooltip:scale-100 pointer-events-none whitespace-nowrap shadow-2xl z-50">
                  Coming Soon
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-8 border-transparent border-b-indigo-600"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Results Explorer - Re-styled for professional organization */}
      <main id="result-section" className="max-w-7xl w-full px-6 py-24 mx-auto flex-grow scroll-mt-20">
        {state.error && (
          <div className="mb-16 p-8 bg-red-950/20 border border-red-500/20 text-red-400 rounded-3xl text-center backdrop-blur-xl animate-in zoom-in duration-300">
            <span className="block text-4xl mb-4">⚠️</span>
            <p className="text-lg font-medium">{state.error}</p>
          </div>
        )}

        {state.loading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <div className="relative">
              <div className="w-16 h-16 border-2 border-sky-500/10 border-t-sky-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 bg-sky-500/10 blur-2xl rounded-full"></div>
            </div>
            <p className="text-slate-500 font-bold tracking-[0.5em] uppercase text-[10px]">Accessing Database</p>
          </div>
        )}

        {state.carData && !state.loading && (
          <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000 space-y-12">
            
            {/* Editorial Top Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              <div className="lg:col-span-8 group relative rounded-[2rem] overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
                {state.carImageUrl && (
                  <img 
                    src={state.carImageUrl} 
                    alt={state.carData.model}
                    className="w-full h-[500px] object-cover transition-transform duration-[10s] group-hover:scale-110"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-12 w-full z-20">
                  <div className="flex flex-col gap-2">
                    <h2 className="text-6xl md:text-8xl font-bold font-oswald text-white uppercase tracking-tighter leading-none">
                      {state.carData.make} {state.carData.model}
                    </h2>
                    <div className="flex items-center gap-6">
                      <span className="text-xl text-slate-500 font-oswald uppercase tracking-[0.2em]">{state.carData.yearRange}</span>
                      <div className="h-px w-12 bg-sky-500"></div>
                      <span className="text-2xl text-white font-bold font-oswald uppercase tracking-wider">{state.carData.priceRange}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* High-Level Overview Sidebar */}
              <div className="lg:col-span-4 space-y-6 h-full flex flex-col">
                <div className="flex-grow p-10 bg-slate-900/40 rounded-[2rem] border border-slate-800 flex flex-col justify-center space-y-8">
                  {[
                    { label: 'Max Power', value: `${state.carData.specs.horsepower} HP`, color: 'text-sky-400' },
                    { label: 'Acceleration', value: `${state.carData.specs.zeroToSixty}S`, color: 'text-indigo-400' },
                    { label: 'Top Velocity', value: `${state.carData.specs.topSpeed} MPH`, color: 'text-emerald-400' },
                  ].map((stat, i) => (
                    <div key={i} className="space-y-1">
                      <div className="text-[10px] text-slate-600 uppercase font-black tracking-widest">{stat.label}</div>
                      <div className={`text-5xl font-bold font-oswald ${stat.color}`}>{stat.value}</div>
                    </div>
                  ))}
                </div>
                <div className="p-8 bg-sky-500/5 rounded-[1.5rem] border border-sky-500/10 flex items-center justify-between">
                  <div className="text-center flex-1">
                    <div className="text-[9px] text-slate-600 uppercase font-bold tracking-widest mb-1">Drivetrain</div>
                    <div className="text-xs font-black text-white uppercase">{state.carData.specs.driveType}</div>
                  </div>
                  <div className="w-px h-6 bg-slate-800"></div>
                  <div className="text-center flex-1">
                    <div className="text-[9px] text-slate-600 uppercase font-bold tracking-widest mb-1">Fuel Econ</div>
                    <div className="text-xs font-black text-white uppercase">{state.carData.specs.fuelEconomy}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Information Grid: Organized and Professional */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              
              {/* Main Column: History & Insights */}
              <div className="lg:col-span-2 space-y-10">
                <section className="p-12 bg-slate-900/20 rounded-[3rem] border border-slate-800/50">
                  <h3 className="text-3xl font-bold font-oswald text-white uppercase tracking-tighter mb-8 italic border-b border-slate-800 pb-4 flex justify-between items-center">
                    The Narrative
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest not-italic">Engineering Profile</span>
                  </h3>
                  <div className="text-xl text-slate-400 leading-relaxed font-light space-y-6">
                    <p className="first-letter:text-6xl first-letter:font-oswald first-letter:float-left first-letter:mr-3 first-letter:text-sky-500">
                      {state.carData.history}
                    </p>
                  </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-8 bg-green-500/5 rounded-[2rem] border border-green-500/10 shadow-sm">
                    <h4 className="text-[10px] font-black text-green-500 uppercase tracking-[0.4em] mb-8">Performance Merits</h4>
                    <ul className="space-y-6">
                      {state.carData.benefits.map((b, i) => (
                        <li key={i} className="text-sm text-slate-400 leading-relaxed flex gap-4">
                          <span className="text-green-500/30 font-bold">/</span> {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-8 bg-amber-500/5 rounded-[2rem] border border-amber-500/10 shadow-sm">
                    <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em] mb-8">Critical Notes</h4>
                    <ul className="space-y-6">
                      {state.carData.drawbacks.map((d, i) => (
                        <li key={i} className="text-sm text-slate-400 leading-relaxed flex gap-4">
                          <span className="text-amber-500/30 font-bold">/</span> {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Sidebar Column: Data & Specs */}
              <div className="lg:col-span-1 space-y-8">
                <div className="p-8 bg-slate-950 rounded-[2.5rem] border border-slate-800 shadow-xl overflow-hidden">
                  <PerformanceChart specs={state.carData.specs} />
                </div>

                <div className="p-10 bg-slate-900/40 rounded-[2.5rem] border border-slate-800 space-y-8">
                  <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-4">Detailed Specifications</h4>
                  {[
                    { l: 'Engine Arch', v: state.carData.specs.engineType },
                    { l: 'Transmission', v: state.carData.specs.transmission },
                    { l: 'Drivetrain', v: state.carData.specs.driveType },
                    { l: 'Thermal Efficiency', v: state.carData.specs.fuelEconomy },
                  ].map((item, idx) => (
                    <div key={idx} className="group border-b border-slate-800/50 pb-5 last:border-0 transition-all">
                      <div className="text-[9px] text-slate-700 uppercase font-black tracking-widest mb-1 group-hover:text-sky-500">{item.l}</div>
                      <div className="text-slate-200 font-bold text-lg">{item.v}</div>
                    </div>
                  ))}
                </div>

                {state.carData.groundingLinks && state.carData.groundingLinks.length > 0 && (
                  <div className="p-8 bg-slate-950/50 rounded-[2rem] border border-slate-800 space-y-4">
                    <div className="text-[9px] text-slate-800 uppercase font-black tracking-widest">Information Sources</div>
                    <div className="flex flex-col gap-2">
                      {state.carData.groundingLinks.slice(0, 3).map((link, i) => (
                        <a 
                          key={i} 
                          href={link.uri} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[10px] text-sky-500/50 hover:text-sky-400 truncate bg-slate-900 p-3 rounded-xl border border-slate-800 transition-all"
                        >
                          {link.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full mt-32 py-24 px-4 text-center border-t border-slate-900/50 bg-[#010409]">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-6xl font-oswald font-black italic uppercase tracking-tighter text-slate-900 select-none">
            AutoLens
          </div>
          <p className="text-slate-800 font-bold tracking-[0.4em] uppercase text-[9px] max-w-sm mx-auto leading-loose">
            High-Performance Data Retrieval &copy; {new Date().getFullYear()} AutoLens. Search indices updated in real-time.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
