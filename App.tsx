import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sun, Moon, Type, Download, Trash2, Maximize2, Minimize2 } from 'lucide-react';
import Stats from './components/Stats';
import AIAssistant from './components/AIAssistant';
import { streamContinuation, improveSelection } from './services/geminiService';
import { EditorState, SelectionRange } from './types';

// Initial placeholder
const WELCOME_TEXT = `# ZenWriter

Start typing...

Select text to see AI options, or click the sparkle icon to continue writing.`;

export default function App() {
  // State
  const [content, setContent] = useState<string>(() => {
    return localStorage.getItem('zenwriter_content') || WELCOME_TEXT;
  });
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('zenwriter_theme') === 'dark';
  });
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [selection, setSelection] = useState<SelectionRange | null>(null);

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Derived state
  const wordCount = content.trim().split(/\s+/).filter(w => w.length > 0).length;
  const readingTime = wordCount / 200;

  // Effects
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('zenwriter_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    // Debounced autosave
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    timeoutRef.current = setTimeout(() => {
      localStorage.setItem('zenwriter_content', content);
      setLastSaved(new Date());
    }, 1000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [content]);

  // Adjust textarea height automatically
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [content, textareaRef.current]); // Also run when ref becomes available

  // Handlers
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleSelection = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    if (textarea.selectionStart !== textarea.selectionEnd) {
      setSelection({
        start: textarea.selectionStart,
        end: textarea.selectionEnd,
        text: content.substring(textarea.selectionStart, textarea.selectionEnd)
      });
    } else {
      setSelection(null);
    }
  };

  const handleAIContinue = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    
    try {
      const stream = await streamContinuation(content);
      
      let newText = "";
      for await (const chunk of stream) {
        const chunkText = chunk.text;
        if (chunkText) {
          newText += chunkText;
          setContent(prev => prev + chunkText);
          
          // Auto scroll to bottom during generation
          if (textareaRef.current) {
              window.scrollTo({
                  top: document.body.scrollHeight,
                  behavior: 'smooth'
              });
          }
        }
      }
    } catch (error) {
      console.error("AI Generation failed", error);
      alert("AI could not generate text. Check your API key or try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAIImprove = async (instruction: string) => {
    if (!selection || isGenerating) return;
    setIsGenerating(true);

    try {
      const improvedText = await improveSelection(selection.text, instruction);
      
      const before = content.substring(0, selection.start);
      const after = content.substring(selection.end);
      const newContent = before + improvedText + after;
      
      setContent(newContent);
      setSelection(null);
      // Optional: highlight the change or notify user
    } catch (error) {
      console.error("AI Improvement failed", error);
      alert("AI improvement failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleFocusMode = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch((e) => console.log(e));
        setIsFocusMode(true);
    } else {
        document.exitFullscreen();
        setIsFocusMode(false);
    }
  };

  const downloadText = () => {
    const element = document.createElement("a");
    const file = new Blob([content], {type: 'text/markdown'});
    element.href = URL.createObjectURL(file);
    element.download = "zen_draft.md";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Styles
  const bgClass = isDarkMode ? 'bg-paper-dark' : 'bg-paper-light';
  const textClass = isDarkMode ? 'text-paper-textDark' : 'text-paper-text';
  // Softer caret color
  const caretClass = isDarkMode ? 'caret-stone-500' : 'caret-stone-400';

  return (
    <div className={`min-h-screen w-full flex flex-col items-center ${bgClass} transition-colors duration-500`}>
      
      {/* Top Toolbar - Hides when scrolling down/typing in focus mode usually, but we'll keep it subtle */}
      <div className={`fixed top-0 left-0 right-0 p-6 flex justify-between items-center z-40 transition-opacity duration-300 ${isFocusMode ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}>
        <div className={`font-mono font-bold text-lg tracking-tight opacity-40 ${textClass}`}>
            ZenWriter
        </div>
        
        <div className="flex gap-4">
            <button 
                onClick={downloadText}
                className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-zinc-800 text-zinc-500' : 'hover:bg-zinc-200 text-zinc-400'}`} 
                title="Download Markdown"
            >
                <Download size={18} />
            </button>
            <button 
                onClick={() => setContent('')}
                className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-zinc-800 text-zinc-500' : 'hover:bg-zinc-200 text-zinc-400'}`} 
                title="Clear Text"
            >
                <Trash2 size={18} />
            </button>
            <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 self-center mx-1"></div>
            <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-zinc-800 text-amber-400' : 'hover:bg-zinc-200 text-zinc-600'}`}
                title="Toggle Theme"
            >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button 
                onClick={toggleFocusMode}
                className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-zinc-800 text-zinc-500' : 'hover:bg-zinc-200 text-zinc-400'}`}
                title="Focus Mode"
            >
                {isFocusMode ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
        </div>
      </div>

      {/* Main Editor Area */}
      <main className="w-full max-w-3xl flex-grow px-8 pt-32 pb-48 flex flex-col relative z-0">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleTextChange}
          onSelect={handleSelection}
          placeholder="Just write..."
          className={`
            w-full resize-none bg-transparent border-none outline-none 
            font-mono text-base md:text-lg leading-loose
            ${textClass} ${caretClass}
            placeholder-zinc-300 dark:placeholder-zinc-700
            overflow-hidden min-h-[60vh]
          `}
          spellCheck={false}
          autoFocus
        />
        
        {/* Helper text if empty */}
        {content.length === 0 && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-zinc-300 dark:text-zinc-800 font-mono text-xs pointer-events-none">
                Distraction free. Just you and your words.
            </div>
        )}
      </main>

      {/* Floating AI Tools */}
      <AIAssistant 
        isDarkMode={isDarkMode}
        isGenerating={isGenerating}
        hasSelection={!!selection}
        onContinue={handleAIContinue}
        onImprove={handleAIImprove}
      />

      {/* Stats Footer */}
      <Stats 
        wordCount={wordCount}
        readingTime={readingTime}
        lastSaved={lastSaved}
        isDarkMode={isDarkMode}
      />
      
    </div>
  );
}