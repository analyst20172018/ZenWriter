import React from 'react';

interface StatsProps {
  wordCount: number;
  readingTime: number;
  lastSaved: Date | null;
  isDarkMode: boolean;
}

const Stats: React.FC<StatsProps> = ({ wordCount, readingTime, lastSaved, isDarkMode }) => {
  const textColor = isDarkMode ? 'text-stone-500' : 'text-stone-400';
  
  return (
    <div className={`fixed bottom-0 left-0 right-0 p-4 text-xs font-sans flex justify-between items-center transition-opacity duration-300 opacity-50 hover:opacity-100 ${textColor} select-none pointer-events-none`}>
      <div className="flex gap-4">
        <span>{wordCount.toLocaleString()} words</span>
        <span>{readingTime < 1 ? '< 1' : Math.ceil(readingTime)} min read</span>
      </div>
      <div className="transition-opacity duration-500">
        {lastSaved ? `Saved ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Unsaved'}
      </div>
    </div>
  );
};

export default Stats;