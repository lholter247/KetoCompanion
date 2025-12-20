import React, { useState, useMemo } from 'react';
import { HealthMeasurement } from '../types';

interface HealthTrackerProps {
  measurements: HealthMeasurement[];
  onAddMeasurement: (measurement: Omit<HealthMeasurement, 'id' | 'userEmail'>) => void;
  onDeleteMeasurement: (id: string) => void;
}

type GlucoseUnit = 'mmol' | 'mgdl';

// Definition for Style Configuration
interface StatusStyle {
    label: string;
    barColor: string;    // Background for the progress bar (e.g. bg-emerald-500)
    textColor: string;   // Text color for the big value number (e.g. text-emerald-900)
    badgeBg: string;     // Background for the status pill (e.g. bg-emerald-100)
    badgeText: string;   // Text color for the status pill (e.g. text-emerald-800)
}

// --- Health Bar Component ---
interface HealthBarProps {
  label: string;
  value: number;
  max: number;
  unit: string;
  styles: StatusStyle;
  description?: string;
}

const HealthBar: React.FC<HealthBarProps> = ({ label, value, max, unit, styles, description }) => {
  const percent = Math.min((value / max) * 100, 100);

  return (
    <div className="mb-8 last:mb-0">
      <div className="flex justify-between items-end mb-2">
        <div>
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">{label}</h3>
            {description && <p className="text-xs text-slate-500 font-medium mt-0.5">{description}</p>}
        </div>
        <div className="text-right">
            <span className={`text-2xl font-black ${styles.textColor}`}>{value}</span>
            <span className="text-xs font-bold text-slate-400 ml-1">{unit}</span>
        </div>
      </div>
      
      {/* Bar Track */}
      <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden relative shadow-inner ring-1 ring-slate-200/50">
         {/* Grid lines for orientation */}
         <div className="absolute top-0 bottom-0 left-1/4 w-px bg-white/60"></div>
         <div className="absolute top-0 bottom-0 left-2/4 w-px bg-white/60"></div>
         <div className="absolute top-0 bottom-0 left-3/4 w-px bg-white/60"></div>

         {/* Active Bar */}
         <div 
            className={`h-full rounded-full transition-all duration-1000 ease-out ${styles.barColor}`} 
            style={{ width: `${percent}%` }}
         ></div>
      </div>

      <div className="mt-2 flex justify-between items-center">
         {/* High Contrast Badge */}
         <span className={`text-xs font-bold px-3 py-1 rounded-md ${styles.badgeBg} ${styles.badgeText}`}>
            {styles.label}
         </span>
         <span className="text-[10px] text-slate-400 font-medium">Max {max} {unit}</span>
      </div>
    </div>
  );
};

const HealthTracker: React.FC<HealthTrackerProps> = ({ measurements, onAddMeasurement, onDeleteMeasurement }) => {
  const [date, setDate] = useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  
  const [time, setTime] = useState(() => {
      const d = new Date();
      return d.toTimeString().slice(0, 5);
  });

  const [glucose, setGlucose] = useState<string>('');
  const [glucoseUnit, setGlucoseUnit] = useState<GlucoseUnit>('mmol');
  const [ketones, setKetones] = useState<string>('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!glucose || !ketones) return;

    const dateTimeString = `${date}T${time}`;
    const timestamp = new Date(dateTimeString).getTime();

    // Convert glucose to mmol/L if entered in mg/dL
    let finalGlucose = parseFloat(glucose);
    if (glucoseUnit === 'mgdl') {
        finalGlucose = parseFloat((finalGlucose / 18).toFixed(1));
    }

    onAddMeasurement({
      timestamp: isNaN(timestamp) ? Date.now() : timestamp,
      glucose: finalGlucose, // Always store as mmol/L
      ketones: parseFloat(ketones),
      notes: notes.trim() || undefined
    });

    setGlucose('');
    setKetones('');
    setNotes('');
  };

  // Group measurements
  const groupedMeasurements = useMemo(() => {
    const groups: Record<string, HealthMeasurement[]> = {};
    const sorted = [...measurements].sort((a, b) => b.timestamp - a.timestamp);

    sorted.forEach(m => {
      const dateKey = new Date(m.timestamp).toLocaleDateString('de-DE', {
        weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit'
      });
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(m);
    });
    return groups;
  }, [measurements]);

  // Get Latest Measurement
  const latestMeasurement = useMemo(() => {
    if (measurements.length === 0) return null;
    return measurements.reduce((prev, current) => (prev.timestamp > current.timestamp) ? prev : current);
  }, [measurements]);

  // Calculate GKI
  const getGKI = (g: number, k: number): number => {
      if (k === 0) return 0;
      return parseFloat((g / k).toFixed(2));
  };

  // --- Helper Functions for Colors & Status (Explicit High Contrast) ---

  const getGKIStyles = (gki: number): StatusStyle => {
      if (gki < 1) return { 
          label: 'Therapeutisch', 
          barColor: 'bg-emerald-600', 
          textColor: 'text-emerald-900',
          badgeBg: 'bg-emerald-100',
          badgeText: 'text-emerald-900'
      };
      if (gki < 3) return { 
          label: 'Hohe Ketose', 
          barColor: 'bg-emerald-500', 
          textColor: 'text-emerald-800',
          badgeBg: 'bg-emerald-50',
          badgeText: 'text-emerald-800'
      };
      if (gki < 6) return { 
          label: 'Moderate Ketose', 
          barColor: 'bg-amber-400', 
          textColor: 'text-amber-900',
          badgeBg: 'bg-amber-50',
          badgeText: 'text-amber-800'
      };
      if (gki < 9) return { 
          label: 'Geringe Ketose', 
          barColor: 'bg-orange-400', 
          textColor: 'text-orange-900',
          badgeBg: 'bg-orange-50',
          badgeText: 'text-orange-800'
      };
      return { 
          label: 'Keine Ketose', 
          barColor: 'bg-slate-400', 
          textColor: 'text-slate-700',
          badgeBg: 'bg-slate-100',
          badgeText: 'text-slate-600'
      };
  };
  
  const getKetoneStyles = (k: number): StatusStyle => {
      if (k < 0.5) return { 
          label: "Nicht in Ketose", 
          barColor: 'bg-slate-300', 
          textColor: 'text-slate-500',
          badgeBg: 'bg-slate-100',
          badgeText: 'text-slate-600'
      };
      if (k < 1.5) return { 
          label: "Leichte Ketose", 
          barColor: 'bg-lime-500', 
          textColor: 'text-lime-800',
          badgeBg: 'bg-lime-100',
          badgeText: 'text-lime-900'
      }; 
      if (k <= 3.0) return { 
          label: "Optimale Ketose", 
          barColor: 'bg-emerald-500', 
          textColor: 'text-emerald-800',
          badgeBg: 'bg-emerald-100',
          badgeText: 'text-emerald-900'
      };
      return { 
          label: "Hohe Ketose", 
          barColor: 'bg-amber-500', 
          textColor: 'text-amber-800',
          badgeBg: 'bg-amber-100',
          badgeText: 'text-amber-900'
      }; 
  };

  return (
    <div className="w-full max-w-2xl mx-auto pb-12">
      
      {/* --- DASHBOARD SECTION --- */}
      {latestMeasurement && (
        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-6 mb-10 animate-fade-in relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-blue-600"></div>
            
            <div className="flex justify-between items-center mb-8 mt-2">
                <div>
                    <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Aktueller Status</h2>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                        {new Date(latestMeasurement.timestamp).toLocaleDateString('de-DE', { weekday: 'long', hour: '2-digit', minute:'2-digit' })}
                    </p>
                </div>
                <div className="px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                   Messwerte
                </div>
            </div>

            {/* Values */}
            <div className="space-y-2">
                 {/* Ketone Bar */}
                 <HealthBar 
                    label="Ketone"
                    description="Ketonkörper im Blut"
                    value={latestMeasurement.ketones}
                    max={5.0}
                    unit="mmol/L"
                    styles={getKetoneStyles(latestMeasurement.ketones)}
                 />

                 <div className="h-px bg-slate-100 my-8"></div>

                 {/* GKI Bar - Visual Max set to 12 for scaling */}
                 <HealthBar 
                    label="GKI"
                    description="Glukose-Keton-Index (Niedriger ist besser)"
                    value={getGKI(latestMeasurement.glucose, latestMeasurement.ketones)}
                    max={15.0} 
                    unit=""
                    styles={getGKIStyles(getGKI(latestMeasurement.glucose, latestMeasurement.ketones))}
                 />
            </div>
        </div>
      )}


      {/* --- INPUT FORM --- */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 mb-10">
         <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                        <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                    </svg>
                </div>
                <h3 className="font-bold text-slate-800">Messung eintragen</h3>
            </div>
            
            {/* Unit Toggle */}
            <div className="bg-slate-100 p-1 rounded-lg flex text-xs font-bold">
                <button 
                    onClick={() => setGlucoseUnit('mmol')}
                    className={`px-3 py-1.5 rounded-md transition-all ${glucoseUnit === 'mmol' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    mmol/L
                </button>
                <button 
                    onClick={() => setGlucoseUnit('mgdl')}
                    className={`px-3 py-1.5 rounded-md transition-all ${glucoseUnit === 'mgdl' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    mg/dL
                </button>
            </div>
         </div>
         
         <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Datum</label>
                    <input 
                        type="date" 
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-xl px-3 py-2.5 text-sm text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Uhrzeit</label>
                    <input 
                        type="time" 
                        value={time}
                        onChange={e => setTime(e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-xl px-3 py-2.5 text-sm text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                 <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100 focus-within:ring-2 focus-within:ring-rose-200 transition-all">
                    <label className="block text-[10px] font-bold text-rose-400 uppercase mb-1">Glukose</label>
                    <div className="flex items-baseline gap-1">
                        <input 
                            type="number" 
                            step={glucoseUnit === 'mmol' ? "0.1" : "1"}
                            value={glucose}
                            onChange={e => setGlucose(e.target.value)}
                            placeholder={glucoseUnit === 'mmol' ? "4.5" : "85"}
                            className="w-full bg-transparent border-none p-0 text-3xl font-black text-slate-800 placeholder-slate-300 focus:ring-0"
                        />
                         <span className="text-xs font-semibold text-rose-300 self-end mb-1">
                             {glucoseUnit === 'mmol' ? 'mmol/L' : 'mg/dL'}
                         </span>
                    </div>
                </div>
                <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 focus-within:ring-2 focus-within:ring-emerald-200 transition-all">
                    <label className="block text-[10px] font-bold text-emerald-500 uppercase mb-1">Ketone</label>
                    <div className="flex items-baseline gap-1">
                        <input 
                            type="number" 
                            step="0.1"
                            value={ketones}
                            onChange={e => setKetones(e.target.value)}
                            placeholder="1.2"
                            className="w-full bg-transparent border-none p-0 text-3xl font-black text-slate-800 placeholder-slate-300 focus:ring-0"
                        />
                        <span className="text-xs font-semibold text-emerald-400 self-end mb-1">mmol/L</span>
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1">Kommentar</label>
                <textarea 
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Wie fühlst du dich? (z.B. Nüchtern, nach Sport)..."
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm text-slate-600 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 resize-none h-20 transition-all"
                />
            </div>

            <button 
                type="submit"
                disabled={!glucose || !ketones}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform active:scale-[0.98]"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" clipRule="evenodd" />
                </svg>
                Speichern
            </button>
         </form>
      </div>

      {/* --- HISTORY SECTION --- */}
      <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-bold text-slate-800">Verlauf</h3>
            <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded-full">{measurements.length} Einträge</span>
          </div>

          {Object.entries(groupedMeasurements).length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                <p className="text-slate-400 text-sm">Noch keine Messwerte vorhanden.</p>
            </div>
          )}

          {Object.entries(groupedMeasurements).map(([date, items]) => (
            <div key={date} className="animate-fade-in-up">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 ml-2">{date}</div>
                <div className="space-y-3">
                    {(items as HealthMeasurement[]).map(item => {
                        const gki = getGKI(item.glucose, item.ketones);
                        const statusInfo = getGKIStyles(gki);

                        return (
                            <div key={item.id} className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm group hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                         {/* Badge */}
                                         <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-bold shadow-md transform group-hover:scale-105 transition-transform ${statusInfo.barColor} text-white`}>
                                             <span className="text-[10px] opacity-80 uppercase tracking-wider">GKI</span>
                                             <span className="text-xl leading-none">{gki}</span>
                                         </div>
                                         
                                         {/* Data */}
                                         <div>
                                             <div className="text-slate-800 font-bold text-lg mb-1">{new Date(item.timestamp).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</div>
                                             <div className="flex items-center gap-4 text-xs font-medium">
                                                 <span className="flex items-center gap-1">
                                                     <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                                                     <span className="text-slate-600">{item.glucose} <span className="text-slate-400">mmol/L</span></span>
                                                 </span>
                                                 <span className="flex items-center gap-1">
                                                     <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                                     <span className="text-slate-600">{item.ketones} <span className="text-slate-400">mmol/L</span></span>
                                                 </span>
                                             </div>
                                         </div>
                                    </div>
                                    
                                    <button 
                                        onClick={() => onDeleteMeasurement(item.id)}
                                        className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                            <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Full Readable Note - NO TRUNCATE */}
                                {item.notes && (
                                    <div className="mt-4 pt-3 border-t border-slate-50">
                                        <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600 italic leading-relaxed border border-slate-100">
                                            "{item.notes}"
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default HealthTracker;