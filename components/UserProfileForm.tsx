import React, { useState, useEffect } from 'react';
import { UserProfile, Gender, ActivityLevel, DietGoal, MacroData } from '../types';

interface UserProfileFormProps {
  initialProfile?: UserProfile;
  onSave: (profile: UserProfile) => void;
  onCancel: () => void;
}

const UserProfileForm: React.FC<UserProfileFormProps> = ({ initialProfile, onSave, onCancel }) => {
  const [formData, setFormData] = useState<UserProfile>(initialProfile || {
    weight: 70,
    height: 170,
    age: 30,
    gender: 'female',
    activity: 'sedentary',
    goal: 'lose',
    bodyFat: 0
  });

  // Calculate Macros on form change or save
  const calculateMacros = (): MacroData => {
    // Mifflin-St Jeor Equation
    let bmr = (10 * formData.weight) + (6.25 * formData.height) - (5 * formData.age);
    bmr += formData.gender === 'male' ? 5 : -161;

    // Activity Multiplier
    const multipliers: Record<ActivityLevel, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };
    
    const tdee = bmr * multipliers[formData.activity];

    // Goal Adjustment
    let targetCalories = tdee;
    if (formData.goal === 'lose') targetCalories -= 500; // ~0.5kg per week
    if (formData.goal === 'gain') targetCalories += 300;

    // Standard Keto Ratios (approximate)
    // 5% Carbs (capped usually at 25g-30g net for strict keto), 25% Protein, 70% Fat
    const netCarbs = 25; // Hard cap for strict keto
    const protein = (targetCalories * 0.25) / 4;
    const fat = (targetCalories - (netCarbs * 4) - (protein * 4)) / 9;

    return {
      calories: Math.round(targetCalories),
      netCarbs: Math.round(netCarbs),
      protein: Math.round(protein),
      fat: Math.round(fat),
      carbs: Math.round(netCarbs + 15), // Assumed fiber buffer
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targets = calculateMacros();
    onSave({ ...formData, calculatedTargets: targets });
  };

  const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none";
  const labelClass = "block text-xs font-semibold text-slate-500 uppercase mb-1";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="bg-slate-900 p-4 flex justify-between items-center">
            <h2 className="text-white font-bold text-lg">Dein Profil</h2>
            <button onClick={onCancel} className="text-slate-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>Geschlecht</label>
                    <select 
                        value={formData.gender} 
                        onChange={e => setFormData({...formData, gender: e.target.value as Gender})}
                        className={inputClass}
                    >
                        <option value="female">Weiblich</option>
                        <option value="male">Männlich</option>
                    </select>
                </div>
                <div>
                    <label className={labelClass}>Alter</label>
                    <input 
                        type="number" 
                        value={formData.age} 
                        onChange={e => setFormData({...formData, age: Number(e.target.value)})}
                        className={inputClass}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>Gewicht (kg)</label>
                    <input 
                        type="number" 
                        value={formData.weight} 
                        onChange={e => setFormData({...formData, weight: Number(e.target.value)})}
                        className={inputClass}
                    />
                </div>
                <div>
                    <label className={labelClass}>Größe (cm)</label>
                    <input 
                        type="number" 
                        value={formData.height} 
                        onChange={e => setFormData({...formData, height: Number(e.target.value)})}
                        className={inputClass}
                    />
                </div>
            </div>

            <div>
                <label className={labelClass}>Aktivitätslevel</label>
                <select 
                    value={formData.activity} 
                    onChange={e => setFormData({...formData, activity: e.target.value as ActivityLevel})}
                    className={inputClass}
                >
                    <option value="sedentary">Sitzend (Kein Sport)</option>
                    <option value="light">Leicht (1-3x Sport/Woche)</option>
                    <option value="moderate">Moderat (3-5x Sport/Woche)</option>
                    <option value="active">Aktiv (6-7x Sport/Woche)</option>
                    <option value="very_active">Sehr Aktiv (Physischer Job + Sport)</option>
                </select>
            </div>

            <div>
                <label className={labelClass}>Ziel</label>
                <select 
                    value={formData.goal} 
                    onChange={e => setFormData({...formData, goal: e.target.value as DietGoal})}
                    className={inputClass}
                >
                    <option value="lose">Abnehmen (Defizit)</option>
                    <option value="maintain">Gewicht halten</option>
                    <option value="gain">Muskelaufbau (Überschuss)</option>
                </select>
            </div>

            <div className="pt-4 border-t border-slate-100">
                <button 
                    type="submit" 
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-200 transition-all transform hover:scale-[1.01]"
                >
                    Ziele berechnen & Speichern
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfileForm;