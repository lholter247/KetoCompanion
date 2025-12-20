import React from 'react';
import { GeminiAnalysisResult } from '../types';

interface ResultCardProps {
  result: GeminiAnalysisResult | null;
  onClose: () => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, onClose }) => {
  if (!result) return null;

  return (
    <div className="fixed top-6 right-6 z-50 w-80 animate-fade-in-up">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-purple-100">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 flex justify-between items-start">
            <div>
                 <h3 className="text-white font-bold text-lg">{result.title}</h3>
                 <p className="text-indigo-100 text-xs uppercase tracking-wider font-semibold">AI Analysis</p>
            </div>
            <button 
                onClick={onClose}
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-1 transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">What I see</h4>
            <p className="text-slate-700 leading-relaxed text-sm">{result.description}</p>
          </div>
          
          <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100">
             <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                    <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813a3.75 3.75 0 002.576-2.576l.813-2.846A.75.75 0 019 4.5z" clipRule="evenodd" />
                </svg>
                Suggestion
             </h4>
            <p className="text-indigo-900 text-sm font-medium italic">"{result.creativeSuggestion}"</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
