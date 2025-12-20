import React, { useState, useEffect, useMemo } from 'react';
import KetoInput from './components/KetoInput';
import NutritionResults from './components/NutritionResults';
import DailyLog from './components/DailyLog';
import HealthTracker from './components/HealthTracker';
import LoginScreen from './components/LoginScreen';
import UserProfileForm from './components/UserProfileForm';
import DashboardStats from './components/DashboardStats';
import { analyzeMeal } from './services/geminiService';
import { dbService } from './services/db';
import { MealAnalysis, DietRecord, User, UserProfile, MacroData, HealthMeasurement } from './types';

type ActiveTab = 'diet' | 'health';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('diet');
  
  // Diet State
  const [analysis, setAnalysis] = useState<MealAnalysis | null>(null);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [editingRecordTimestamp, setEditingRecordTimestamp] = useState<number | undefined>(undefined);
  const [records, setRecords] = useState<DietRecord[]>([]);
  
  // Health State
  const [measurements, setMeasurements] = useState<HealthMeasurement[]>([]);

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // 1. Check for logged-in user on mount (Session Persistence)
  useEffect(() => {
    const checkSession = async () => {
        const storedUser = localStorage.getItem('keto-companion-current-user');
        if (storedUser) {
            try {
                const sessionUser = JSON.parse(storedUser);
                // Refresh user data from DB to get latest profile
                const dbUser = await dbService.getUser(sessionUser.email);
                if (dbUser) {
                    setUser(dbUser);
                } else {
                    setUser(sessionUser); // Fallback if DB wiped but session exists
                }
            } catch (e) {
                console.error("Failed to parse user session", e);
            }
        }
        setIsInitializing(false);
    };
    checkSession();
  }, []);

  // 2. Load Data from IndexedDB whenever user changes
  useEffect(() => {
    const loadData = async () => {
        if (user) {
            try {
                // Load Diet Records
                const dbRecords = await dbService.getRecordsByUser(user.email);
                setRecords(dbRecords);
                
                // Load Health Measurements
                const dbMeasurements = await dbService.getMeasurementsByUser(user.email);
                setMeasurements(dbMeasurements);

            } catch (e) {
                console.error("Failed to load records from DB", e);
            }
        } else {
            setRecords([]);
            setMeasurements([]);
        }
    };
    loadData();
  }, [user]);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem('keto-companion-current-user', JSON.stringify(loggedInUser));
  };

  const handleLogout = () => {
    setUser(null);
    setAnalysis(null);
    setEditingRecordId(null);
    localStorage.removeItem('keto-companion-current-user');
  };

  const handleUpdateProfile = async (profile: UserProfile) => {
      if (user) {
          const updatedUser = { ...user, profile };
          setUser(updatedUser);
          setShowProfileModal(false);
          
          // Update in DB
          await dbService.updateUser(updatedUser);
          // Update Session
          localStorage.setItem('keto-companion-current-user', JSON.stringify(updatedUser));
      }
  };

  // --- DIET LOGIC ---

  // Calculate Today's Totals
  const todayTotals = useMemo(() => {
      const today = new Date().toDateString();
      const todaysRecords = records.filter(r => new Date(r.timestamp).toDateString() === today);
      
      return todaysRecords.reduce((acc, curr) => ({
          calories: acc.calories + curr.analysis.total.calories,
          fat: acc.fat + curr.analysis.total.fat,
          protein: acc.protein + curr.analysis.total.protein,
          carbs: acc.carbs + curr.analysis.total.carbs,
          netCarbs: acc.netCarbs + curr.analysis.total.netCarbs,
      }), { calories: 0, fat: 0, protein: 0, carbs: 0, netCarbs: 0 } as MacroData);
  }, [records]);

  const handleAnalyze = async (text: string) => {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    setEditingRecordId(null); // Ensure we are not in edit mode
    setEditingRecordTimestamp(undefined);

    try {
      const result = await analyzeMeal(text);
      setAnalysis(result);
    } catch (err) {
      setError("Hoppla! Ich konnte das nicht analysieren. Bitte versuche es erneut.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditRecord = (record: DietRecord) => {
      setEditingRecordId(record.id);
      setEditingRecordTimestamp(record.timestamp);
      setAnalysis(record.analysis);
      // Automatically scroll to top for better UX
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveRecord = async (finalAnalysis: MealAnalysis, customTimestamp: number) => {
    if (!user) return;

    if (editingRecordId) {
        // --- UPDATE EXISTING RECORD ---
        const updatedRecord: DietRecord = {
            id: editingRecordId,
            userEmail: user.email,
            timestamp: customTimestamp, // Allowed to change timestamp
            analysis: finalAnalysis
        };

        setRecords(prev => prev.map(r => r.id === editingRecordId ? updatedRecord : r));
        
        try {
            await dbService.updateRecord(updatedRecord);
        } catch (e) {
            console.error("Failed to update record", e);
        }

        setEditingRecordId(null);
        setEditingRecordTimestamp(undefined);

    } else {
        // --- CREATE NEW RECORD ---
        const newRecord: DietRecord = {
            id: crypto.randomUUID(),
            userEmail: user.email,
            timestamp: customTimestamp,
            analysis: finalAnalysis,
        };

        // Optimistic Update
        setRecords((prev) => [newRecord, ...prev]);
        
        // Save to DB
        try {
            await dbService.addRecord(newRecord);
        } catch (e) {
            console.error("Failed to save record to DB", e);
        }
    }

    setAnalysis(null);
  };

  const handleDeleteRecord = async (id: string) => {
      // Optimistic Update
      setRecords(prev => prev.filter(r => r.id !== id));
      
      // Delete from DB
      try {
          await dbService.deleteRecord(id);
      } catch (e) {
           console.error("Failed to delete record from DB", e);
      }
  };

  const handleCancelAnalysis = () => {
    setAnalysis(null);
    setEditingRecordId(null);
    setEditingRecordTimestamp(undefined);
  };

  // --- HEALTH LOGIC ---

  const handleAddMeasurement = async (data: Omit<HealthMeasurement, 'id' | 'userEmail'>) => {
      if (!user) return;
      const newMeasurement: HealthMeasurement = {
          id: crypto.randomUUID(),
          userEmail: user.email,
          ...data
      };
      
      // Optimistic
      setMeasurements(prev => [newMeasurement, ...prev]);

      try {
          await dbService.addMeasurement(newMeasurement);
      } catch (e) {
          console.error("Failed to save measurement", e);
      }
  };

  const handleDeleteMeasurement = async (id: string) => {
      setMeasurements(prev => prev.filter(m => m.id !== id));
      try {
          await dbService.deleteMeasurement(id);
      } catch (e) {
          console.error("Failed to delete measurement", e);
      }
  };

  if (isInitializing) return null;

  if (!user) {
    return (
        <div className="h-screen w-screen overflow-hidden bg-[#F3F4F6] selection:bg-emerald-100 selection:text-emerald-900">
            <LoginScreen onLogin={handleLogin} />
        </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-y-auto bg-[#F3F4F6] selection:bg-emerald-100 selection:text-emerald-900 scroll-smooth">
      <div className="container mx-auto px-4 py-8 flex flex-col items-center min-h-full">
        
        {/* Header with User Info */}
        <div className="w-full flex justify-between items-center mb-6 max-w-2xl">
            <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-200">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                 </div>
                 <div>
                     <h1 className="text-xl font-extrabold text-slate-800 tracking-tight leading-none">Keto<span className="text-emerald-600">Companion</span></h1>
                     <p className="text-xs text-slate-400 font-medium">Hallo, {user.username}</p>
                 </div>
            </div>

            <div className="flex items-center gap-3">
                 <button
                    onClick={() => setShowProfileModal(true)}
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 transition-all shadow-sm group"
                    title="Profil bearbeiten"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 transform group-hover:scale-110 transition-transform">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.99 5.99 0 00-4.793 2.39A9.916 9.916 0 0010 18c2.695 0 5.13-1.07 6.793-2.61A5.99 5.99 0 0010 12z" clipRule="evenodd" />
                    </svg>
                </button>

                <button 
                    onClick={handleLogout}
                    className="text-sm font-medium text-slate-500 hover:text-rose-500 transition-colors bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm hover:shadow-md"
                >
                    Abmelden
                </button>
            </div>
        </div>

        {/* Tab Navigation */}
        <div className="w-full max-w-2xl mb-8 flex p-1 bg-slate-200/50 rounded-2xl">
            <button 
                onClick={() => setActiveTab('diet')}
                className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${activeTab === 'diet' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Ernährung & Macros
            </button>
            <button 
                onClick={() => setActiveTab('health')}
                className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${activeTab === 'health' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Glukose & Ketone
            </button>
        </div>

        {/* Dashboard Stats (Only show on Diet Tab) */}
        {activeTab === 'diet' && !analysis && (
            <>
                {user.profile && user.profile.calculatedTargets ? (
                    <DashboardStats 
                        current={todayTotals} 
                        targets={user.profile.calculatedTargets} 
                        onEditProfile={() => setShowProfileModal(true)}
                    />
                ) : (
                    <div className="w-full max-w-2xl mb-8">
                        <button 
                            onClick={() => setShowProfileModal(true)}
                            className="w-full bg-slate-800 text-white p-4 rounded-2xl shadow-lg flex items-center justify-between hover:bg-slate-700 transition-colors"
                        >
                            <span className="font-semibold">⚠️ Profil einrichten um Ziele zu sehen</span>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                )}
            </>
        )}

        {/* Main Content Area */}
        <div className="w-full flex flex-col items-center gap-6 pb-12">
            
            {/* --- DIET TAB CONTENT --- */}
            {activeTab === 'diet' && (
                <>
                    {!analysis && (
                        <KetoInput onAnalyze={handleAnalyze} isLoading={isLoading} />
                    )}
                    
                    {error && (
                        <div className="w-full max-w-2xl p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center gap-2 animate-fade-in">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </div>
                    )}

                    {/* Analysis Result (Preview before save) */}
                    {analysis && (
                    <div className="w-full">
                        <NutritionResults 
                            analysis={analysis} 
                            initialTimestamp={editingRecordTimestamp}
                            onSave={handleSaveRecord} 
                            onCancel={handleCancelAnalysis}
                        />
                    </div>
                    )}
                    
                    {/* History Log */}
                    {!analysis && (
                        <DailyLog 
                            records={records} 
                            onDeleteRecord={handleDeleteRecord} 
                            onEditRecord={handleEditRecord}
                        />
                    )}

                    {!analysis && !isLoading && !error && records.length === 0 && (
                         <div className="mt-12 text-center text-slate-400 max-w-md animate-fade-in">
                            <p className="text-sm">Willkommen {user.username}! Dein Tagebuch ist leer. <br/>Tracke jetzt deine erste Mahlzeit.</p>
                         </div>
                    )}
                </>
            )}

            {/* --- HEALTH TAB CONTENT --- */}
            {activeTab === 'health' && (
                <HealthTracker 
                    measurements={measurements}
                    onAddMeasurement={handleAddMeasurement}
                    onDeleteMeasurement={handleDeleteMeasurement}
                />
            )}
        </div>

        {/* Profile Modal */}
        {showProfileModal && (
            <UserProfileForm 
                initialProfile={user.profile} 
                onSave={handleUpdateProfile} 
                onCancel={() => setShowProfileModal(false)} 
            />
        )}

        {/* Footer */}
        <div className="mt-auto py-6 text-slate-400 text-xs font-medium text-center">
            Powered by Google Gemini
        </div>
      </div>
    </div>
  );
};

export default App;