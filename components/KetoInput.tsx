import React, { useState } from 'react';

interface KetoInputProps {
  onAnalyze: (text: string) => void;
  isLoading: boolean;
}

const KetoInput: React.FC<KetoInputProps> = ({ onAnalyze, isLoading }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onAnalyze(text);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative bg-white rounded-2xl shadow-xl p-2 border border-slate-100">
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Was hast du gegessen? (z.B. 2 Eier, 1 Avocado und schwarzer Kaffee)"
                className="w-full h-32 p-4 text-slate-700 placeholder-slate-400 bg-transparent border-none focus:ring-0 resize-none text-lg leading-relaxed rounded-xl"
                disabled={isLoading}
            />
            <div className="flex justify-between items-center px-4 pb-2">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">
                    Gemini AI Powered
                </span>
                <button
                    type="submit"
                    disabled={!text.trim() || isLoading}
                    className="bg-slate-900 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-medium transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Analysiere...</span>
                        </>
                    ) : (
                        <>
                            <span>Track Meal</span>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                            </svg>
                        </>
                    )}
                </button>
            </div>
        </div>
      </form>
    </div>
  );
};

export default KetoInput;
