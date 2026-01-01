import React, { useState } from 'react';
import { Sparkles, Wand2, RefreshCw, X } from 'lucide-react';

interface AIAssistantProps {
  onContinue: () => void;
  onImprove: (instruction: string) => void;
  isGenerating: boolean;
  hasSelection: boolean;
  isDarkMode: boolean;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ 
  onContinue, 
  onImprove, 
  isGenerating, 
  hasSelection,
  isDarkMode 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');

  // Updated colors for the new palette
  const bgColor = isDarkMode ? 'bg-[#18181B] border-zinc-800' : 'bg-white border-zinc-200';
  const textColor = isDarkMode ? 'text-zinc-200' : 'text-zinc-700';
  const hoverColor = isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-50';
  const buttonBg = isDarkMode ? 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700' : 'bg-white text-zinc-700 hover:bg-zinc-50 border border-zinc-200 shadow-sm';

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-8 right-8 p-3 rounded-full shadow-xl transition-all duration-300 transform hover:scale-105 ${buttonBg}`}
        title="AI Assistant"
      >
        <Sparkles size={20} className={isGenerating ? 'animate-spin' : ''} />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-8 right-8 w-72 rounded-xl shadow-2xl border p-4 flex flex-col gap-3 z-50 animate-fade-in ${bgColor} ${textColor}`}>
      <div className="flex justify-between items-center border-b pb-2 border-zinc-100 dark:border-zinc-800">
        <span className="font-mono font-medium text-xs flex items-center gap-2 tracking-wide uppercase opacity-70">
          <Sparkles size={12} className="text-amber-500" />
          Zen AI
        </span>
        <button onClick={() => setIsOpen(false)} className="opacity-50 hover:opacity-100">
          <X size={16} />
        </button>
      </div>

      <div className="flex flex-col gap-2 font-mono">
        {!hasSelection && (
          <button
            onClick={onContinue}
            disabled={isGenerating}
            className={`flex items-center gap-2 text-xs p-2 rounded-md transition-colors text-left ${hoverColor} ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Wand2 size={14} className="text-purple-500" />
            <span>Continue writing...</span>
          </button>
        )}

        {hasSelection && (
            <div className="flex flex-col gap-1">
                 <button
                    onClick={() => onImprove("Fix grammar and spelling")}
                    disabled={isGenerating}
                    className={`flex items-center gap-2 text-xs p-2 rounded-md transition-colors text-left ${hoverColor}`}
                >
                    <RefreshCw size={14} className="text-blue-500" />
                    <span>Fix grammar</span>
                </button>
                <button
                    onClick={() => onImprove("Make it more concise and punchy")}
                    disabled={isGenerating}
                    className={`flex items-center gap-2 text-xs p-2 rounded-md transition-colors text-left ${hoverColor}`}
                >
                    <RefreshCw size={14} className="text-green-500" />
                    <span>Make concise</span>
                </button>
                 <button
                    onClick={() => onImprove("Expand and describe in more detail")}
                    disabled={isGenerating}
                    className={`flex items-center gap-2 text-xs p-2 rounded-md transition-colors text-left ${hoverColor}`}
                >
                    <RefreshCw size={14} className="text-orange-500" />
                    <span>Expand</span>
                </button>
            </div>
        )}
        
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <input 
                type="text" 
                placeholder="Custom instruction..." 
                className={`w-full text-xs p-2 rounded border focus:outline-none focus:ring-1 focus:ring-zinc-400 font-mono ${isDarkMode ? 'bg-[#202022] border-zinc-800 text-zinc-300' : 'bg-zinc-50 border-zinc-200'}`}
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && customPrompt.trim()) {
                        onImprove(customPrompt);
                        setCustomPrompt('');
                    }
                }}
            />
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;