import React, { useState, useEffect } from 'react';
import { MealAnalysis, FoodItem, MacroData } from '../types';

interface NutritionResultsProps {
  analysis: MealAnalysis;
  initialTimestamp?: number;
  onSave?: (analysis: MealAnalysis, timestamp: number) => void;
  onCancel?: () => void;
}

const MacroPill: React.FC<{ label: string; value: number; unit?: string; color: string }> = ({ label, value, unit = 'g', color }) => (
  <div className={`flex flex-col items-center p-3 rounded-xl bg-${color}-50 border border-${color}-100 w-full transition-all duration-300`}>
    <span className={`text-${color}-900 font-bold text-lg`}>{Math.round(value)}{unit}</span>
    <span className={`text-${color}-600 text-[10px] uppercase tracking-wider font-semibold`}>{label}</span>
  </div>
);

interface EditableFoodRowProps {
  item: FoodItem;
  index: number;
  onChange: (index: number, field: keyof FoodItem, value: string | number) => void;
}

const EditableFoodRow: React.FC<EditableFoodRowProps> = ({ item, index, onChange }) => {
    
  const inputClass = "w-12 text-center text-xs font-semibold bg-white border border-slate-200 rounded py-1 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all";
  const labelClass = "text-[9px] text-slate-400 uppercase mt-1";

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 px-2 rounded-lg transition-colors gap-3">
      <div className="flex flex-col flex-1 w-full">
        <input 
            type="text" 
            value={item.name}
            onChange={(e) => onChange(index, 'name', e.target.value)}
            className="font-medium text-slate-800 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-emerald-500 outline-none w-full mb-1 transition-colors"
        />
        <div className="flex items-center gap-2">
            <input 
                type="text" 
                value={item.quantity}
                onChange={(e) => onChange(index, 'quantity', e.target.value)}
                className="text-xs text-slate-400 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-emerald-500 outline-none w-24 transition-colors"
            />
             <div className="flex items-center gap-1">
                <input 
                    type="number" 
                    value={Math.round(item.calories)}
                    onChange={(e) => onChange(index, 'calories', parseFloat(e.target.value) || 0)}
                    className="w-10 text-center text-xs text-slate-500 bg-slate-100 rounded border-none focus:ring-1 focus:ring-slate-300 p-0.5"
                />
                <span className="text-xs text-slate-400">kcal</span>
             </div>
        </div>
      </div>

      <div className="flex gap-3 w-full sm:w-auto justify-between sm:justify-end">
        <div className="flex flex-col items-center">
          <input 
            type="number" 
            value={Math.round(item.fat)}
            onChange={(e) => onChange(index, 'fat', parseFloat(e.target.value) || 0)}
            className={`${inputClass} text-emerald-600`}
          />
          <span className={labelClass}>Fat</span>
        </div>
        <div className="flex flex-col items-center">
          <input 
            type="number" 
            value={Math.round(item.protein)}
            onChange={(e) => onChange(index, 'protein', parseFloat(e.target.value) || 0)}
             className={`${inputClass} text-blue-500`}
          />
          <span className={labelClass}>Prot</span>
        </div>
        <div className="flex flex-col items-center">
          <input 
            type="number" 
            value={Math.round(item.netCarbs)}
            onChange={(e) => onChange(index, 'netCarbs', parseFloat(e.target.value) || 0)}
             className={`${inputClass} text-rose-500 font-bold bg-rose-50 border-rose-100`}
          />
          <span className={labelClass}>Net C</span>
        </div>
      </div>
    </div>
  );
};

const NutritionResults: React.FC<NutritionResultsProps> = ({ analysis, initialTimestamp, onSave, onCancel }) => {
  const [editableAnalysis, setEditableAnalysis] = useState<MealAnalysis>(analysis);
  const [showDatePicker, setShowDatePicker] = useState(!!initialTimestamp);
  
  // Initialize date/time state based on initialTimestamp or current time
  const [date, setDate] = useState(() => {
      const ts = initialTimestamp || Date.now();
      // Ensure correct timezone handling by creating a date object and getting the parts
      const d = new Date(ts);
      // Format to YYYY-MM-DD for input type="date"
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
  });

  const [time, setTime] = useState(() => {
      const ts = initialTimestamp || Date.now();
      const d = new Date(ts);
      return d.toTimeString().slice(0, 5);
  });

  // Update local state if prop changes (e.g. re-analysis)
  useEffect(() => {
    setEditableAnalysis(analysis);
  }, [analysis]);

  // Update date/time if initialTimestamp changes (e.g. switching between records)
  useEffect(() => {
    if (initialTimestamp) {
        const d = new Date(initialTimestamp);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        setDate(`${year}-${month}-${day}`);
        setTime(d.toTimeString().slice(0, 5));
        setShowDatePicker(true);
    } else {
        // Reset to now if strictly undefined (new analysis)
        // Check prevents resetting if user just closed and opened the same analysis
        // For new analysis flow, parent usually unmounts this component
    }
  }, [initialTimestamp]);


  const handleFoodChange = (index: number, field: keyof FoodItem, value: string | number) => {
    const updatedFoods = [...editableAnalysis.foods];
    updatedFoods[index] = { ...updatedFoods[index], [field]: value };

    // Recalculate totals
    const newTotal = updatedFoods.reduce((acc, curr) => ({
        calories: acc.calories + curr.calories,
        fat: acc.fat + curr.fat,
        protein: acc.protein + curr.protein,
        carbs: acc.carbs + curr.carbs,
        netCarbs: acc.netCarbs + curr.netCarbs,
    }), { calories: 0, fat: 0, protein: 0, carbs: 0, netCarbs: 0 } as MacroData);

    setEditableAnalysis({
        ...editableAnalysis,
        foods: updatedFoods,
        total: newTotal
    });
  };

  const handleSaveClick = () => {
    if (onSave) {
        const dateTimeString = `${date}T${time}`;
        const timestamp = new Date(dateTimeString).getTime();
        onSave(editableAnalysis, isNaN(timestamp) ? Date.now() : timestamp);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 animate-fade-in-up">
      
      {/* Summary Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden mb-6 relative">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
             <div>
                <h2 className="text-xl font-bold text-slate-800">{initialTimestamp ? 'Eintrag bearbeiten' : 'Analyse Ergebnis'}</h2>
                <div className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${editableAnalysis.isKetoFriendly ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {editableAnalysis.isKetoFriendly ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                             <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                    ) : (
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                             <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                         </svg>
                    )}
                    {editableAnalysis.isKetoFriendly ? "Keto Friendly" : "Keto Warning"}
                </div>
             </div>
             <div className="text-right">
                <div className="text-3xl font-black text-slate-800 transition-all">{Math.round(editableAnalysis.total.calories)}</div>
                <div className="text-xs text-slate-400 uppercase font-medium">Calories</div>
             </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <MacroPill label="Fat" value={editableAnalysis.total.fat} color="emerald" />
            <MacroPill label="Protein" value={editableAnalysis.total.protein} color="blue" />
            <MacroPill label="Net Carbs" value={editableAnalysis.total.netCarbs} color="rose" />
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-6">
             <p className="text-sm text-slate-600 italic">
                "{editableAnalysis.ketoAdvice}"
             </p>
          </div>

          {/* Date Adjustment Section */}
          <div className="mb-6 pt-4 border-t border-slate-50">
            <div className="flex items-center justify-between">
                <div className="text-sm text-slate-500">
                    Zeitpunkt: <span className="font-medium text-slate-700">{showDatePicker ? 'Manuell' : 'Jetzt'}</span>
                </div>
                <button 
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 hover:underline decoration-emerald-200 underline-offset-2 transition-all"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                        <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" />
                    </svg>
                    {showDatePicker ? 'Zurücksetzen' : 'Vergessene Mahlzeit eintragen'}
                </button>
            </div>
            
            {showDatePicker && (
                <div className="mt-3 flex gap-3 animate-fade-in p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex-1">
                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Datum</label>
                        <input 
                            type="date" 
                            value={date} 
                            onChange={e => setDate(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow"
                        />
                    </div>
                    <div>
                         <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Uhrzeit</label>
                        <input 
                            type="time" 
                            value={time} 
                            onChange={e => setTime(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow"
                        />
                    </div>
                </div>
            )}
          </div>

          {/* Action Buttons */}
          {onSave && (
            <div className="flex gap-3">
               <button 
                  onClick={onCancel}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
               >
                 Verwerfen
               </button>
               <button 
                  onClick={handleSaveClick}
                  className="flex-1 py-3 rounded-xl bg-slate-900 text-white font-medium hover:bg-emerald-600 shadow-lg shadow-slate-200 hover:shadow-emerald-200 transition-all flex items-center justify-center gap-2"
               >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                  Speichern
               </button>
            </div>
          )}
        </div>
      </div>

      {/* Item Breakdown */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-12">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-semibold text-slate-700">Detaillierte Aufschlüsselung</h3>
            <span className="text-[10px] bg-indigo-50 text-indigo-500 px-2 py-1 rounded uppercase font-bold tracking-wide">Bearbeitbar</span>
        </div>
        <div className="p-4">
            {editableAnalysis.foods.map((item, index) => (
                <EditableFoodRow 
                    key={index} 
                    item={item} 
                    index={index}
                    onChange={handleFoodChange} 
                />
            ))}
        </div>
      </div>
    </div>
  );
};

export default NutritionResults;