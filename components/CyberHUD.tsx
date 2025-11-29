
import React from 'react';
import { SpellAnalysis, AppState } from '../types';

interface CyberHUDProps {
  appState: AppState;
  spellData: SpellAnalysis | null;
  fps: number;
  onInit: () => void;
  handDetected: boolean;
}

export const CyberHUD: React.FC<CyberHUDProps> = ({ appState, spellData, fps, onInit, handDetected }) => {
  
  // Theme Constants
  const theme = {
    primary: "text-emerald-400",
    primaryBg: "bg-emerald-900/20",
    border: "border-emerald-500/30",
    accent: "text-slate-200", // Silver
    accentBorder: "border-slate-300",
    glow: "drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]"
  };

  if (appState === AppState.IDLE) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/95 z-50">
        <div className="relative text-center p-12 border border-emerald-500/30 bg-black/80 backdrop-blur-xl rounded-sm max-w-2xl overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></div>
          
          <h1 className="text-6xl cyber-font text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-slate-200 to-emerald-300 mb-6 font-bold tracking-widest drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">
            EXO<span className="text-emerald-500 text-2xl align-top ml-2">LUXURY</span>
          </h1>
          
          <p className="text-emerald-100/60 mb-10 font-mono text-lg leading-relaxed">
            Holographic Matter Projection.<br/>
            Initialize Gesture Control System.
          </p>
          
          <button
            onClick={onInit}
            className="relative px-12 py-4 bg-emerald-950/50 border border-emerald-400 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all duration-300 font-bold tracking-[0.2em] uppercase overflow-hidden group-hover:shadow-[0_0_30px_rgba(52,211,153,0.6)]"
          >
            <span className="relative z-10">Ignite Engine</span>
            <div className="absolute inset-0 h-full w-full bg-emerald-400/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          </button>
        </div>
      </div>
    );
  }

  if (appState === AppState.LOADING_MODEL) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-50">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-8">
             <div className="absolute inset-0 border-t-2 border-emerald-500 rounded-full animate-spin"></div>
             <div className="absolute inset-2 border-r-2 border-slate-300 rounded-full animate-spin reverse"></div>
             <div className="absolute inset-4 border-b-2 border-emerald-700 rounded-full animate-pulse"></div>
          </div>
          <p className="text-emerald-400 font-mono tracking-widest text-xl animate-pulse">ASSEMBLING PARTICLES...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

      {/* Top HUD */}
      <div className="absolute top-0 w-full p-6 flex justify-between items-start z-40 bg-gradient-to-b from-black/90 to-transparent">
        <div>
          <h2 className="text-2xl cyber-font text-emerald-400 font-bold tracking-widest drop-shadow-[0_0_5px_rgba(16,185,129,0.8)]">EXO.SYSTEM</h2>
          <div className="flex gap-4 mt-2 font-mono text-xs text-emerald-300/70">
            <span>RENDER: {(fps * 1.5).toFixed(0)}%</span>
            <span>SHADERS: METAL_PBR</span>
            <span>STATUS: ONLINE</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
           <div className="px-3 py-1 border border-emerald-500/30 bg-black/50 text-emerald-400 text-xs font-mono">
             FPS: {fps}
           </div>
           <div className={`px-3 py-1 border text-xs font-mono font-bold transition-colors duration-300 ${handDetected ? 'border-emerald-400 text-emerald-400 bg-emerald-900/40' : 'border-slate-500/50 text-slate-400 bg-slate-900/20'}`}>
             {handDetected ? 'GESTURE LOCKED' : 'AWAITING INPUT'}
           </div>
        </div>
      </div>

      {/* Center Reticle - Dynamic */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ${handDetected ? 'opacity-10 scale-125' : 'opacity-30 scale-100'}`}>
        <div className="w-[600px] h-[600px] border border-emerald-500/10 rounded-full flex items-center justify-center">
            <div className="w-[450px] h-[450px] border border-slate-400/10 rounded-full animate-[spin_20s_linear_infinite]"></div>
            <div className="absolute w-[300px] h-[300px] border border-emerald-500/5 rotate-45"></div>
        </div>
      </div>

      {/* Spell Analysis Card */}
      <div className={`absolute bottom-8 right-8 w-96 transition-all duration-500 transform ${spellData ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
        {spellData && (
        <div className="bg-black/80 border-l-4 border-emerald-500 p-6 backdrop-blur-md relative overflow-hidden group shadow-[0_0_30px_rgba(0,0,0,0.5)]">
           {/* Scanline */}
           <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-emerald-400/5 to-transparent animate-[scan_2s_linear_infinite] pointer-events-none"></div>
           
           <div className="flex justify-between items-center mb-4 border-b border-emerald-500/20 pb-2">
              <span className="text-slate-200 font-bold cyber-font tracking-widest">SIGNATURE DETECTED</span>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
           </div>
           
           <div className="space-y-4 font-mono">
              <div>
                <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Formation Name</div>
                <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-slate-100 drop-shadow-md">
                  {spellData.name}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-2 rounded border border-emerald-500/20">
                   <div className="text-[10px] text-emerald-600 uppercase">Class</div>
                   <div className="text-emerald-100">{spellData.type}</div>
                </div>
                <div className="bg-white/5 p-2 rounded border border-emerald-500/20">
                   <div className="text-[10px] text-emerald-600 uppercase">Lux Value</div>
                   <div className="text-emerald-100">{spellData.energyLevel}</div>
                </div>
              </div>

              <div className="bg-black/40 p-3 rounded border border-emerald-500/10">
                <p className="text-slate-300/70 text-xs leading-relaxed italic">
                  "{spellData.description}"
                </p>
              </div>
           </div>
        </div>
        )}
      </div>

      {/* Decorative Corners */}
      <div className="absolute bottom-8 left-8 w-32 h-32 border-b-2 border-l-2 border-emerald-500/30"></div>
      <div className="absolute top-8 right-8 w-16 h-16 border-t-2 border-r-2 border-emerald-500/30"></div>
      
      {/* Hand Warning */}
      {!handDetected && appState === AppState.ACTIVE && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-40 text-emerald-500/60 font-mono text-sm tracking-[0.2em] animate-pulse">
              [ RAISE HAND TO SUMMON ]
          </div>
      )}
    </div>
  );
};
