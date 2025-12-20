import React from 'react';
import { ToolType, PenColor, StrokeWidth } from '../types';

interface ToolbarProps {
  currentTool: ToolType;
  currentColor: PenColor;
  currentWidth: StrokeWidth;
  setTool: (tool: ToolType) => void;
  setColor: (color: PenColor) => void;
  setWidth: (width: StrokeWidth) => void;
  onClear: () => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  canUndo: boolean;
  onUndo: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  currentTool,
  currentColor,
  currentWidth,
  setTool,
  setColor,
  setWidth,
  onClear,
  onAnalyze,
  isAnalyzing,
  canUndo,
  onUndo
}) => {
  
  const iconClass = "w-5 h-5";
  const btnBase = "p-3 rounded-xl transition-all shadow-sm flex items-center justify-center border";
  const activeClass = "bg-slate-800 text-white border-slate-800 ring-2 ring-slate-300";
  const inactiveClass = "bg-white text-slate-600 border-slate-200 hover:bg-slate-50";

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-50">
      
      {/* Primary Tools */}
      <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-slate-200/60">
        
        {/* Pen */}
        <button
          onClick={() => setTool(ToolType.PEN)}
          className={`${btnBase} ${currentTool === ToolType.PEN ? activeClass : inactiveClass}`}
          title="Pen"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={iconClass}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
          </svg>
        </button>

        {/* Eraser */}
        <button
          onClick={() => setTool(ToolType.ERASER)}
          className={`${btnBase} ${currentTool === ToolType.ERASER ? activeClass : inactiveClass}`}
          title="Eraser"
        >
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={iconClass}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75L14.25 12m0 0l2.25 2.25M14.25 12l2.25-2.25M14.25 12L12 14.25m-2.58 4.92l-6.375-6.375a1.125 1.125 0 010-1.59L9.42 4.83c.211-.211.498-.33.796-.33H19.5a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-9.284c-.298 0-.585-.119-.796-.33z" />
          </svg>
        </button>

        <div className="w-px h-8 bg-slate-200 mx-1"></div>

        {/* Color Picker (Only show if Pen is active) */}
        <div className={`flex gap-1 transition-opacity duration-300 ${currentTool === ToolType.PEN ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
          {Object.values(PenColor).map((color) => (
            <button
              key={color}
              onClick={() => setColor(color)}
              className={`w-6 h-6 rounded-full border border-slate-200 transition-transform ${currentColor === color ? 'scale-125 ring-2 ring-slate-300' : 'hover:scale-110'}`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>

        <div className="w-px h-8 bg-slate-200 mx-1"></div>

        {/* Stroke Width */}
        <div className="flex items-center gap-1">
             <button
              onClick={() => setWidth(StrokeWidth.THIN)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg ${currentWidth === StrokeWidth.THIN ? 'bg-slate-100' : ''}`}
             >
                <div className="bg-slate-800 rounded-full w-1 h-1" />
             </button>
             <button
              onClick={() => setWidth(StrokeWidth.MEDIUM)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg ${currentWidth === StrokeWidth.MEDIUM ? 'bg-slate-100' : ''}`}
             >
                <div className="bg-slate-800 rounded-full w-2 h-2" />
             </button>
             <button
              onClick={() => setWidth(StrokeWidth.THICK)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg ${currentWidth === StrokeWidth.THICK ? 'bg-slate-100' : ''}`}
             >
                <div className="bg-slate-800 rounded-full w-3 h-3" />
             </button>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-3">
        <button
            onClick={onUndo}
            disabled={!canUndo}
            className="px-4 py-2 bg-white rounded-full text-slate-700 shadow-lg font-medium text-sm flex items-center gap-2 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-100"
        >
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
            </svg>
            Undo
        </button>

        <button
            onClick={onClear}
            className="px-4 py-2 bg-white rounded-full text-red-500 shadow-lg font-medium text-sm flex items-center gap-2 hover:bg-red-50 border border-slate-100"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
            Clear
        </button>

        <button
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full text-white shadow-lg shadow-indigo-200 font-medium text-sm flex items-center gap-2 hover:shadow-xl hover:scale-105 transition-all disabled:opacity-70 disabled:scale-100"
        >
            {isAnalyzing ? (
                <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Thinking...
                </>
            ) : (
                <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813a3.75 3.75 0 002.576-2.576l.813-2.846A.75.75 0 019 4.5zM6.97 6.97a.75.75 0 011.06 0l.43.43a.75.75 0 11-1.06 1.06l-.43-.43a.75.75 0 010-1.06zm0 10.06a.75.75 0 010 1.06l-.43.43a.75.75 0 11-1.06-1.06l.43-.43a.75.75 0 011.06 0z" clipRule="evenodd" />
                </svg>
                Ask Gemini
                </>
            )}
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
