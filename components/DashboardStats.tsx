import React from 'react';
import { MacroData } from '../types';

interface DashboardStatsProps {
  current: MacroData;
  targets: MacroData;
  onEditProfile: () => void;
}

const ProgressBar: React.FC<{ label: string; current: number; max: number; color: string; unit: string }> = ({ label, current, max, color, unit }) => {
  const percentage = Math.min(100, Math.max(0, (current / max) * 100));
  const isOverLimit = current > max;
  
  return (
    <div className="mb-3">
      <div className="flex justify-between items-end mb-1">
        <span className="text-xs font-bold text-slate-500 uppercase">{label}</span>
        <span className="text-xs font-medium text-slate-400">
          <span className={`font-bold ${isOverLimit ? 'text-red-500' : 'text-slate-700'}`}>{Math.round(current)}</span> 
          <span className="text-slate-300"> / </span>
          {Math.round(max)}{unit}
        </span>
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ease-out ${color} ${isOverLimit ? 'bg-red-500' : ''}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

const DashboardStats: React.FC<DashboardStatsProps> = ({ current, targets, onEditProfile }) => {
  return (
    <div className="w-full max-w-2xl mx-auto mb-8 animate-fade-in-up">
      <div className="bg-white rounded-2xl shadow-md shadow-slate-200/50 border border-slate-100 p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
        </div>
        
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800">Tagesziele</h3>
            <button 
                onClick={onEditProfile}
                className="text-xs font-medium text-emerald-600 hover:bg-emerald-50 px-2 py-1 rounded-md transition-colors"
            >
                Profil / Ziele anpassen
            </button>
        </div>

        <ProgressBar 
            label="Kalorien" 
            current={current.calories} 
            max={targets.calories} 
            unit=" kcal"
            color="bg-slate-800" 
        />
        
        <div className="grid grid-cols-3 gap-6 mt-4">
             <ProgressBar 
                label="Fett" 
                current={current.fat} 
                max={targets.fat} 
                unit="g"
                color="bg-emerald-500" 
            />
             <ProgressBar 
                label="Protein" 
                current={current.protein} 
                max={targets.protein} 
                unit="g"
                color="bg-blue-500" 
            />
             <ProgressBar 
                label="Net Carbs" 
                current={current.netCarbs} 
                max={targets.netCarbs} 
                unit="g"
                color="bg-rose-500" 
            />
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;