import React, { useMemo } from 'react';
import { DietRecord, MacroData } from '../types';

interface DailyLogProps {
  records: DietRecord[];
  onDeleteRecord: (id: string) => void;
  onEditRecord: (record: DietRecord) => void;
}

const DailyLog: React.FC<DailyLogProps> = ({ records, onDeleteRecord, onEditRecord }) => {
  
  // Group records by Date string
  const groupedRecords = useMemo(() => {
    const groups: Record<string, DietRecord[]> = {};
    
    // Sort records descending (newest first)
    const sorted = [...records].sort((a, b) => b.timestamp - a.timestamp);

    sorted.forEach(record => {
      const dateKey = new Date(record.timestamp).toLocaleDateString('de-DE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(record);
    });
    return groups;
  }, [records]);

  // Calculate daily totals
  const getDailyTotal = (dailyRecords: DietRecord[]): MacroData => {
    return dailyRecords.reduce((acc, curr) => ({
      calories: acc.calories + curr.analysis.total.calories,
      fat: acc.fat + curr.analysis.total.fat,
      protein: acc.protein + curr.analysis.total.protein,
      carbs: acc.carbs + curr.analysis.total.carbs,
      netCarbs: acc.netCarbs + curr.analysis.total.netCarbs,
    }), { calories: 0, fat: 0, protein: 0, carbs: 0, netCarbs: 0 });
  };

  if (records.length === 0) return null;

  return (
    <div className="w-full max-w-2xl mx-auto mt-12 space-y-8 pb-20">
      
      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-slate-200"></div>
        <h2 className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Tagebuch</h2>
        <div className="h-px flex-1 bg-slate-200"></div>
      </div>

      {(Object.entries(groupedRecords) as [string, DietRecord[]][]).map(([date, dailyRecords]) => {
        const totals = getDailyTotal(dailyRecords);

        return (
          <div key={date} className="animate-fade-in-up">
            <h3 className="text-lg font-bold text-slate-700 mb-4 px-2 sticky top-0 bg-[#F3F4F6] py-2 z-10">{date}</h3>
            
            {/* Daily Totals Card */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 mb-4">
               <div className="grid grid-cols-4 gap-2 text-center divide-x divide-slate-100">
                  <div>
                    <div className="text-xl font-black text-slate-800">{Math.round(totals.calories)}</div>
                    <div className="text-[10px] uppercase text-slate-400 font-bold">Kcal</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-emerald-600">{Math.round(totals.fat)}g</div>
                    <div className="text-[10px] uppercase text-slate-400 font-bold">Fett</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-blue-500">{Math.round(totals.protein)}g</div>
                    <div className="text-[10px] uppercase text-slate-400 font-bold">Protein</div>
                  </div>
                   <div>
                    <div className="text-lg font-bold text-rose-500">{Math.round(totals.netCarbs)}g</div>
                    <div className="text-[10px] uppercase text-slate-400 font-bold">Net Carbs</div>
                  </div>
               </div>
            </div>

            {/* Meal List */}
            <div className="space-y-3">
              {dailyRecords.map((record) => (
                <div key={record.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex justify-between items-start group">
                   <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            {new Date(record.timestamp).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                         <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold border ${record.analysis.isKetoFriendly ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                            {record.analysis.isKetoFriendly ? 'KETO' : 'LIMIT'}
                        </span>
                      </div>
                      <p className="text-slate-700 font-medium text-sm leading-snug">
                          {record.analysis.foods.map(f => f.name).join(', ')}
                      </p>
                      <div className="mt-2 flex gap-3 text-xs text-slate-500">
                         <span>{Math.round(record.analysis.total.calories)} kcal</span>
                         <span className="text-rose-500 font-semibold">{Math.round(record.analysis.total.netCarbs)}g Carbs</span>
                      </div>
                   </div>
                   
                   <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button 
                        onClick={() => onEditRecord(record)}
                        className="text-slate-300 hover:text-emerald-600 transition-all p-2 rounded-lg hover:bg-emerald-50"
                        title="Bearbeiten"
                       >
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                            <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                        </svg>
                       </button>

                       <button 
                        onClick={() => onDeleteRecord(record.id)}
                        className="text-slate-300 hover:text-red-500 transition-all p-2 rounded-lg hover:bg-red-50"
                        title="Löschen"
                       >
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                        </svg>
                       </button>
                   </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DailyLog;