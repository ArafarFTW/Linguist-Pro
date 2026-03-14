
import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';

import { translateText, detectLanguage, getChatbotResponse } from './services/geminiService';
import { LANGUAGES, ROLES } from './constants';
import { SwapIcon, CopyIcon, CheckIcon, CloseIcon, MicrophoneIcon, UploadIcon, BookOpenIcon, ReuseIcon, TrashIcon, SpeakerIcon, ChatIcon, SendIcon, FullscreenIcon, MinimizeIcon } from './components/icons';

// Configure pdf.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

// FIX: Add types for the Web Speech API, which are not included in standard DOM typings.
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: () => void;
  onend: () => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionEvent extends Event {
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly [index: number]: SpeechRecognitionResult;
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly [index: number]: SpeechRecognitionAlternative;
  readonly length: number;
  readonly isFinal: boolean;
  item(index: number): SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new (): SpeechRecognition;
};

declare var webkitSpeechRecognition: {
  prototype: SpeechRecognition;
  new (): SpeechRecognition;
};

// Extend the Window interface to include webkitSpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

// Type for Translation Memory entries
interface TranslationEntry {
  id: string;
  sourceText: string;
  targetText: string;
  phoneticText: string;
  sourceLang: string;
  targetLang: string;
  role: string;
}

// Chatbot Component
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  sources?: { uri: string; title: string }[];
}

interface ChatbotProps {
  onClose: () => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'initial', text: "Hello! I'm your AI Assistant. I can provide up-to-date information and help with various tasks. How can I help you today?", sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), text: trimmedInput, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const { text, sources } = await getChatbotResponse(trimmedInput);
      const botMessage: Message = { id: (Date.now() + 1).toString(), text, sender: 'bot', sources };
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
      const errorBotMessage: Message = { id: (Date.now() + 1).toString(), text: `Sorry, I ran into an error: ${errorMessage}`, sender: 'bot' };
      setMessages(prev => [...prev, errorBotMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 lg:bottom-24 lg:right-8 w-[calc(100%-2rem)] max-w-md h-[70vh] max-h-[600px] bg-slate-800 rounded-xl shadow-2xl flex flex-col z-50 animate-fade-in origin-bottom-right">
      <header className="flex items-center justify-between p-4 bg-slate-900 rounded-t-xl border-b border-slate-700 flex-shrink-0">
        <h2 className="text-lg font-semibold text-slate-100">AI Assistant</h2>
        <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors" title="Close chat">
          <CloseIcon className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-lg px-3 py-2 ${msg.sender === 'user' ? 'bg-sky-700 text-white' : 'bg-slate-700 text-slate-200'}`}>
                <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2 border-t border-slate-600/50 pt-2">
                    <h4 className="text-xs font-bold text-slate-400 mb-1">Sources:</h4>
                    <ul className="space-y-1">
                      {msg.sources.map((source, index) => (
                        <li key={source.uri}>
                          <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-sky-300 hover:underline truncate block" title={source.title}>
                            {`[${index + 1}] ${source.title}`}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-lg px-3 py-2 bg-slate-700 text-slate-200">
                <p className="text-sm animate-pulse">AI Assistant is thinking...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-700 bg-slate-900/50 rounded-b-xl flex-shrink-0">
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask anything..."
            className="w-full bg-slate-700 border border-slate-600 rounded-full py-2 pl-4 pr-12 text-sm focus:ring-2 focus:ring-sky-500 disabled:opacity-75"
            disabled={isLoading}
            aria-label="Chat input"
          />
          <button type="submit" disabled={!inputValue.trim() || isLoading} className="absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-full bg-sky-600 text-white disabled:bg-slate-600 disabled:cursor-not-allowed hover:bg-sky-500 transition-colors" title="Send message">
            <SendIcon className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};


const App: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [phoneticText, setPhoneticText] = useState<string>('');
  const [sourceLang, setSourceLang] = useState<string>('Portuguese (Portugal)');
  const [targetLang, setTargetLang] = useState<string>('English (UK)');
  const [role, setRole] = useState<string>(ROLES[0].name);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasCopied, setHasCopied] = useState<boolean>(false);
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [detectedLangMessage, setDetectedLangMessage] = useState<string | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [selectedText, setSelectedText] = useState<string>('');
  const [translationMemory, setTranslationMemory] = useState<TranslationEntry[]>([]);
  const [isMemoryVisible, setIsMemoryVisible] = useState<boolean>(false);
  const [memorySearchQuery, setMemorySearchQuery] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isChatVisible, setIsChatVisible] = useState<boolean>(false);
  const [isThinkingMode, setIsThinkingMode] = useState<boolean>(false);
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
  const [offlineProgress, setOfflineProgress] = useState<{ status: string, progress?: number, model?: string } | null>(null);
  const [speechRate, setSpeechRate] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isAutoDetectEnabled, setIsAutoDetectEnabled] = useState<boolean>(true);
  const [isAutoCorrectEnabled, setIsAutoCorrectEnabled] = useState<boolean>(true);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
  } | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const lastTranslatedTextRef = useRef<string>('');
  
  // Debounce input for language detection
  const [debouncedInputText, setDebouncedInputText] = useState(inputText);

  useEffect(() => {
    // Preload speech synthesis voices
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      // Some browsers need an event listener to know when voices are loaded
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  useEffect(() => {
    // Initialize Web Worker for offline translation
    workerRef.current = new Worker(new URL('./translationWorker.ts', import.meta.url), {
      type: 'module'
    });

    workerRef.current.addEventListener('message', (e) => {
      const data = e.data;
      if (data.status === 'progress') {
        setOfflineProgress({ status: 'progress', progress: data.progress.progress, model: data.progress.file });
      } else if (data.status === 'loading') {
        setOfflineProgress({ status: 'loading', model: data.model });
      } else if (data.status === 'translating') {
        setOfflineProgress({ status: 'translating' });
      } else if (data.status === 'complete') {
        setOutputText(data.result);
        setPhoneticText(''); // Offline doesn't provide phonetics easily
        setIsLoading(false);
        setOfflineProgress(null);
      } else if (data.status === 'error') {
        setError(data.error);
        setIsLoading(false);
        setOfflineProgress(null);
      }
    });

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedInputText(inputText);
    }, 500); // 500ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [inputText]);

  // Load Translation Memory from localStorage on initial render
  useEffect(() => {
    try {
      const storedMemory = localStorage.getItem('translationMemory');
      if (storedMemory) {
        setTranslationMemory(JSON.parse(storedMemory));
      }
    } catch (error) {
      console.error("Failed to load translation memory from localStorage", error);
    }
  }, []);

  // Save Translation Memory to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('translationMemory', JSON.stringify(translationMemory));
    } catch (error) {
      console.error("Failed to save translation memory to localStorage", error);
    }
  }, [translationMemory]);
  
  // Effect for automatic language detection
  useEffect(() => {
    const runDetection = async () => {
      if (!isAutoDetectEnabled) return;
      
      if (debouncedInputText.trim().length < 10) {
        setDetectedLangMessage(null);
        return;
      }

      setIsDetecting(true);
      setDetectedLangMessage('Detecting language...');
      try {
        const detected = await detectLanguage(debouncedInputText, LANGUAGES.map(l => l.name));
        if (LANGUAGES.some(l => l.name === detected)) {
          setSourceLang(detected);
          setDetectedLangMessage(`Detected: ${detected}`);
        } else {
          setDetectedLangMessage('Uncertain language. Please select manually.');
        }
      } catch (err) {
        setDetectedLangMessage('Uncertain language. Please select manually.');
      } finally {
        setIsDetecting(false);
      }
    };

    if (debouncedInputText) {
      runDetection();
    }
  }, [debouncedInputText, isAutoDetectEnabled]);

  // Effect for real-time translation (handles selected text or full debounced text)
  useEffect(() => {
    const textToTranslate = selectedText || debouncedInputText;

    const autoTranslate = async () => {
      if (!textToTranslate.trim()) {
        setOutputText('');
        setPhoneticText('');
        lastTranslatedTextRef.current = '';
        return;
      }
      
      const currentTranslationKey = `${textToTranslate}|${sourceLang}|${targetLang}|${role}|${isThinkingMode}|${isAutoCorrectEnabled}`;
      
      if (currentTranslationKey === lastTranslatedTextRef.current) {
        return; // Already translated this exact text with these settings
      }
      
      setIsLoading(true);
      setError(null);

      if (isOfflineMode) {
        if (workerRef.current) {
          lastTranslatedTextRef.current = currentTranslationKey;
          workerRef.current.postMessage({
            text: textToTranslate,
            src: sourceLang,
            tgt: targetLang
          });
        } else {
          setError("Offline translation worker not initialized.");
          setIsLoading(false);
        }
        return; // Exit early, worker handles the rest
      }

      try {
        const { correctedSource, translation, phonetic } = await translateText(textToTranslate, sourceLang, targetLang, role, isThinkingMode, isAutoCorrectEnabled);
        
        // Update the input text with the corrected source if it changed
        // ONLY if the user hasn't typed anything new while waiting for the API
        if (correctedSource && correctedSource !== textToTranslate && isAutoCorrectEnabled) {
          setInputText(prev => {
            if (prev === textToTranslate) {
              lastTranslatedTextRef.current = `${correctedSource}|${sourceLang}|${targetLang}|${role}|${isThinkingMode}|${isAutoCorrectEnabled}`; // Prevent re-translating the correction
              return correctedSource;
            }
            return prev;
          });
        } else {
          lastTranslatedTextRef.current = currentTranslationKey;
        }

        setOutputText(translation);
        setPhoneticText(phonetic);

        // Add to translation memory if it's a new, non-trivial translation
        if (correctedSource.trim().length > 15 && translation.trim().length > 0) {
          setTranslationMemory(prevMemory => {
            const isDuplicate = prevMemory.some(
              entry => entry.sourceText === correctedSource && entry.targetLang === targetLang && entry.role === role
            );
            if (!isDuplicate) {
              const newEntry: TranslationEntry = {
                id: new Date().toISOString() + Math.random(), // simple unique id
                sourceText: correctedSource,
                targetText: translation,
                phoneticText: phonetic,
                sourceLang,
                targetLang,
                role,
              };
              return [newEntry, ...prevMemory];
            }
            return prevMemory;
          });
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    autoTranslate();
  }, [selectedText, debouncedInputText, sourceLang, targetLang, role, isThinkingMode, isAutoCorrectEnabled]);
  
  // Effect for setting up Speech Recognition
  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (event) => {
        setError(`Speech recognition error: ${event.error}`);
        setIsListening(false);
      };
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        setInputText(transcript);
      };
      recognitionRef.current = recognition;
    } else {
      console.warn("Speech recognition not supported in this browser.");
    }
    
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  // Effect to update recognition language
  useEffect(() => {
    if (recognitionRef.current) {
        const langObj = LANGUAGES.find(l => l.name === sourceLang);
        recognitionRef.current.lang = langObj?.isoCode || 'en-US';
    }
  }, [sourceLang]);

  // Effect for speech synthesis cleanup
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);


  const handleSwapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setInputText(outputText);
    setOutputText(inputText);
    setPhoneticText('');
    setSelectedText('');
    setIsAutoDetectEnabled(false);
    setDetectedLangMessage('Manual selection');
  };
  
  const handleCopyToClipboard = () => {
    if(outputText) {
      navigator.clipboard.writeText(outputText);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    }
  };

  const handleToggleListen = () => {
    if (!recognitionRef.current) return;
    
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setInputText('');
      setOutputText('');
      setPhoneticText('');
      setFileName(null);
      setSelectedText('');
      recognitionRef.current.start();
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      'text/plain', 
      'text/markdown', 
      'application/pdf', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
      'application/vnd.openxmlformats-officedocument.presentationml.presentation' // pptx
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB

    const ext = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['txt', 'md', 'pdf', 'docx', 'xlsx', 'pptx'];

    if (!allowedTypes.includes(file.type) && (!ext || !allowedExtensions.includes(ext))) {
      setError('Unsupported file type. Please upload a .txt, .md, .pdf, .docx, .xlsx, or .pptx file.');
      return;
    }
    if (file.size > maxSize) {
      setError('File is too large. Maximum size is 10MB.');
      return;
    }

    setIsLoading(true);
    setFileName(file.name);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      let extractedText = '';

      if (ext === 'pdf' || file.type === 'application/pdf') {
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          extractedText += content.items.map((item: any) => item.str).join(' ') + '\n';
        }
      } else if (ext === 'docx' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const result = await mammoth.extractRawText({ arrayBuffer });
        extractedText = result.value;
      } else if (ext === 'xlsx' || file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        workbook.SheetNames.forEach(sheetName => {
          const sheet = workbook.Sheets[sheetName];
          extractedText += XLSX.utils.sheet_to_csv(sheet) + '\n';
        });
      } else if (ext === 'pptx' || file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
        const zip = await JSZip.loadAsync(arrayBuffer);
        const slideRegex = /^ppt\/slides\/slide\d+\.xml$/;
        for (const relativePath in zip.files) {
          if (slideRegex.test(relativePath)) {
            const xml = await zip.files[relativePath].async('string');
            const matches = xml.match(/<a:t>([^<]*)<\/a:t>/g);
            if (matches) {
              extractedText += matches.map(m => m.replace(/<a:t>/, '').replace(/<\/a:t>/, '')).join(' ') + '\n';
            }
          }
        }
      } else {
        // txt, md
        extractedText = await file.text();
      }

      setInputText(extractedText);
      setSelectedText('');
    } catch (err) {
      console.error(err);
      setError('Failed to read or parse the file.');
      setFileName(null);
    } finally {
      setIsLoading(false);
      event.target.value = '';
    }
  };

  const handleClearFile = () => {
    setInputText('');
    setOutputText('');
    setPhoneticText('');
    setFileName(null);
    setSelectedText('');
  };

  const handleClearInput = () => {
    setInputText('');
    setOutputText('');
    setPhoneticText('');
    setFileName(null);
    setSelectedText('');
    setIsAutoDetectEnabled(true);
    setDetectedLangMessage(null);
  };


  const handleSelectionChange = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const selection = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
    setSelectedText(selection);
  };
  
  const handleSpeak = () => {
    if (!outputText || !('speechSynthesis' in window)) {
      console.error("Speech synthesis not supported or no text to speak.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(outputText);
    const langObj = LANGUAGES.find(l => l.name === targetLang);
    
    if (langObj) {
      utterance.lang = langObj.isoCode;
      
      // Try to find a specific voice for this language to improve reliability
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find(v => v.lang === langObj.isoCode) || 
                    voices.find(v => v.lang.startsWith(langObj.isoCode.split('-')[0]));
      if (voice) {
        utterance.voice = voice;
      }
    }
    
    utterance.rate = speechRate;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (event) => {
        console.error("Speech synthesis error", event);
        if (event.error !== 'interrupted' && event.error !== 'canceled') {
            setError(`Speech synthesis failed (${event.error}). It may not be supported by your browser's text-to-speech engine for this language.`);
        }
        setIsSpeaking(false);
    }
    
    window.speechSynthesis.cancel(); // Ensure nothing else is speaking
    
    // Small timeout to allow cancel to process before speaking
    setTimeout(() => {
        window.speechSynthesis.speak(utterance);
    }, 50);
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value;
    // Only prompt if the role is actually changing and memory is not empty
    if (newRole !== role && translationMemory.length > 0) {
      setConfirmDialog({
        isOpen: true,
        title: "Clear Memory?",
        message: "Are you sure you want to clear the translation memory for this new persona?",
        onConfirm: () => {
          setTranslationMemory([]);
          setRole(newRole);
          setConfirmDialog(null);
        },
        onCancel: () => {
          setConfirmDialog(null);
        }
      });
    } else {
      setRole(newRole);
    }
  };


  // Handlers for Translation Memory
  const handleToggleMemory = () => setIsMemoryVisible(prev => !prev);
  
  const handleDeleteMemoryEntry = (id: string) => {
    setTranslationMemory(prev => prev.filter(entry => entry.id !== id));
  };
  
  const handleReuseMemoryEntry = (entry: TranslationEntry) => {
    setInputText(entry.sourceText);
    setOutputText(entry.targetText);
    setPhoneticText(entry.phoneticText);
    setSourceLang(entry.sourceLang);
    setTargetLang(entry.targetLang);
    setRole(entry.role);
    setSelectedText(''); // Clear selection
    setIsAutoDetectEnabled(false);
    setDetectedLangMessage('Loaded from memory');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearMemory = () => {
    setConfirmDialog({
      isOpen: true,
      title: "Clear All Memory?",
      message: "Are you sure you want to clear the entire translation memory? This cannot be undone.",
      onConfirm: () => {
        setTranslationMemory([]);
        setConfirmDialog(null);
      },
      onCancel: () => {
        setConfirmDialog(null);
      }
    });
  };

  const filteredMemory = translationMemory.filter(entry =>
    entry.sourceText.toLowerCase().includes(memorySearchQuery.toLowerCase()) ||
    entry.targetText.toLowerCase().includes(memorySearchQuery.toLowerCase())
  );
  
  const handleToggleChat = () => {
    setIsChatVisible(prev => !prev);
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,_#1e293b_0%,_transparent_50%)] opacity-50"></div>

      <header className="w-full max-w-6xl text-center mb-10 relative z-10 flex flex-col items-center justify-center">
        <div className="absolute right-0 top-0">
          <button
            onClick={handleToggleFullscreen}
            className="p-2 rounded-full bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 transition-colors border border-white/5"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <MinimizeIcon className="w-5 h-5" /> : <FullscreenIcon className="w-5 h-5" />}
          </button>
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-semibold text-white tracking-tight mb-3">
          Linguist<span className="text-sky-400 italic">Pro</span>
        </h1>
        <p className="text-slate-400 text-sm md:text-base uppercase tracking-widest font-medium">Tourism & Golf Translation Engine</p>
      </header>

      <main className="w-full max-w-6xl flex flex-col gap-8 relative z-10">
        <div className="glass-panel p-6 rounded-2xl shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex-grow">
                <label htmlFor="role-selector" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  Translation Persona
                </label>
                <select
                  id="role-selector"
                  value={role}
                  onChange={handleRoleChange}
                  className="w-full glass-input text-white rounded-xl py-3 px-4 focus:outline-none transition duration-200 appearance-none cursor-pointer"
                >
                  {ROLES.map((r) => (
                    <option key={r.name} value={r.name} className="bg-slate-800 text-white">
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-shrink-0 sm:pt-7 flex flex-col gap-3">
                <label htmlFor="autocorrect-toggle" className={`flex items-center cursor-pointer group ${isOfflineMode ? 'opacity-50 pointer-events-none' : ''}`} title="Automatically correct grammar and spelling of the input text before translating.">
                    <span className="text-sm font-medium text-slate-300 mr-3 group-hover:text-white transition-colors">Auto-Correct</span>
                    <div className="relative">
                        <input
                            type="checkbox"
                            id="autocorrect-toggle"
                            className="sr-only peer"
                            checked={isAutoCorrectEnabled}
                            onChange={() => setIsAutoCorrectEnabled(prev => !prev)}
                            disabled={isOfflineMode}
                        />
                        <div className="w-12 h-6 rounded-full glass-input peer-checked:bg-sky-500/80 transition-colors"></div>
                        <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transform peer-checked:translate-x-6 transition-transform"></div>
                    </div>
                </label>

                <label htmlFor="thinking-mode-toggle" className={`flex items-center cursor-pointer group ${isOfflineMode ? 'opacity-50 pointer-events-none' : ''}`} title="Uses a more powerful model (gemini-2.5-pro) for complex, nuanced, or creative translations. Slower but more thorough.">
                    <span className="text-sm font-medium text-slate-300 mr-3 group-hover:text-white transition-colors">Thinking Mode</span>
                    <div className="relative">
                        <input
                            type="checkbox"
                            id="thinking-mode-toggle"
                            className="sr-only peer"
                            checked={isThinkingMode}
                            onChange={() => setIsThinkingMode(prev => !prev)}
                            disabled={isOfflineMode}
                        />
                        <div className="w-12 h-6 rounded-full glass-input peer-checked:bg-sky-500/80 transition-colors"></div>
                        <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transform peer-checked:translate-x-6 transition-transform"></div>
                    </div>
                </label>

                <label htmlFor="offline-mode-toggle" className="flex items-center cursor-pointer group" title="Uses local browser models for basic translation without internet. Requires downloading models (~50MB) on first use.">
                    <span className="text-sm font-medium text-slate-300 mr-3 group-hover:text-white transition-colors">Offline Mode (Beta)</span>
                    <div className="relative">
                        <input
                            type="checkbox"
                            id="offline-mode-toggle"
                            className="sr-only peer"
                            checked={isOfflineMode}
                            onChange={() => setIsOfflineMode(prev => !prev)}
                        />
                        <div className="w-12 h-6 rounded-full glass-input peer-checked:bg-emerald-500/80 transition-colors"></div>
                        <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transform peer-checked:translate-x-6 transition-transform"></div>
                    </div>
                </label>
              </div>
            </div>
            <div className="mt-4 p-4 bg-black/20 rounded-xl min-h-[4rem] flex flex-col justify-center gap-2">
                <p className="text-slate-300 text-sm leading-relaxed">
                  {isOfflineMode 
                      ? <><strong className="font-semibold text-emerald-400">🔌 Offline Mode Enabled:</strong> Basic translation running entirely in your browser. Models will be downloaded automatically on first use. Note: Quality is lower than online mode and only certain language pairs (e.g., English to Spanish) are supported.</>
                      : isThinkingMode 
                          ? <><strong className="font-semibold text-sky-400">🧠 Thinking Mode Enabled:</strong> Uses a more powerful model for complex, nuanced, or creative translations. This may be slower but provides more thorough results.</>
                          : ROLES.find(r => r.name === role)?.description
                  }
                </p>
                {offlineProgress && (
                  <div className="w-full mt-2">
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>{offlineProgress.status === 'loading' ? 'Initializing model...' : offlineProgress.status === 'progress' ? `Downloading ${offlineProgress.model || 'model'}...` : 'Translating...'}</span>
                      {offlineProgress.progress !== undefined && <span>{Math.round(offlineProgress.progress)}%</span>}
                    </div>
                    {offlineProgress.progress !== undefined && (
                      <div className="w-full bg-slate-700 rounded-full h-1.5">
                        <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${offlineProgress.progress}%` }}></div>
                      </div>
                    )}
                  </div>
                )}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 items-stretch">
          {/* Input Panel */}
          <div className="flex flex-col gap-3 glass-panel p-5 rounded-2xl shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-grow sm:max-w-[50%]">
                <select
                  id="source-lang"
                  value={sourceLang}
                  onChange={(e) => {
                    setSourceLang(e.target.value);
                    setIsAutoDetectEnabled(false);
                    setDetectedLangMessage('Manual selection');
                  }}
                  className="w-full glass-input text-white rounded-xl py-3 px-4 pr-10 focus:outline-none transition duration-200 appearance-none cursor-pointer font-medium"
                >
                  {LANGUAGES.map((lang) => <option key={lang.name} value={lang.name} className="bg-slate-800">{lang.name}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none flex items-center">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 text-xs font-medium text-slate-500 min-h-[1rem] uppercase tracking-wider">
                {isDetecting && (
                  <div className="w-4 h-4 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" title="Detecting language..."></div>
                )}
                {!isDetecting && detectedLangMessage?.startsWith('Detected:') && (
                  <CheckIcon className="w-4 h-4 text-emerald-400" title="Language auto-detected" />
                )}
                {detectedLangMessage && (
                  <span className={`${isDetecting ? 'animate-pulse text-sky-400' : detectedLangMessage.startsWith('Uncertain') ? 'text-amber-400' : 'text-emerald-400'}`}>{detectedLangMessage}</span>
                )}
                {detectedLangMessage?.startsWith('Uncertain') && (
                  <button 
                    onClick={() => {
                      setIsAutoDetectEnabled(false);
                      setDetectedLangMessage('Manual override');
                      document.getElementById('source-lang')?.focus();
                    }}
                    className="px-2 py-1 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 rounded-md transition-colors"
                  >
                    Override
                  </button>
                )}
              </div>
            </div>
            <div className="relative flex-grow flex flex-col">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onMouseUp={handleSelectionChange}
                onKeyUp={handleSelectionChange}
                placeholder="Type, paste, or dictate text to translate automatically..."
                className="w-full flex-grow min-h-[300px] glass-input text-white rounded-xl p-5 pr-16 resize-none focus:outline-none transition duration-200 text-lg leading-relaxed placeholder:text-slate-500"
              />
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                {inputText && (
                  <button
                    onClick={handleClearInput}
                    className="p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-white/10 backdrop-blur-sm"
                    title="Clear text"
                  >
                    <CloseIcon className="w-5 h-5" />
                  </button>
                )}
                <button 
                  onClick={handleToggleListen}
                  className={`p-2 text-slate-400 hover:text-white transition-colors rounded-full backdrop-blur-sm ${isListening ? 'bg-red-500/50 text-white animate-pulse' : 'hover:bg-white/10'}`}
                  title={isListening ? 'Stop listening' : 'Start listening'}
                  disabled={!recognitionRef.current}
                >
                    <MicrophoneIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex flex-row lg:flex-col items-center justify-center gap-4 my-2 lg:my-0">
             <button
              onClick={handleSwapLanguages}
              className="p-4 rounded-full glass-panel hover:bg-white/10 text-slate-300 hover:text-white transition-all duration-300 hover:scale-105 shadow-xl"
              title="Swap languages"
            >
              <SwapIcon className="w-6 h-6" />
            </button>
            <div className="text-center">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".txt,.md,.pdf,.docx,.xlsx,.pptx,text/plain,text/markdown,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                    className="hidden"
                />
                <button
                    onClick={handleUploadClick}
                    className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl glass-panel hover:bg-white/10 text-slate-300 hover:text-white transition-all duration-300 hover:scale-105 shadow-xl"
                    title="Upload a document"
                >
                    <UploadIcon className="w-6 h-6" />
                    <span className="text-xs font-medium uppercase tracking-wider hidden lg:block">Upload</span>
                </button>
                {fileName && (
                    <div className="mt-3 text-xs text-slate-400 flex items-center justify-center gap-1 bg-black/30 px-2 py-1 rounded-full">
                        <span className="truncate max-w-[80px]" title={fileName}>{fileName}</span>
                        <button onClick={handleClearFile} title="Clear file" className="p-0.5 rounded-full hover:bg-white/10">
                            <CloseIcon className="w-3 h-3 text-red-400 hover:text-red-300" />
                        </button>
                    </div>
                )}
            </div>
          </div>

          {/* Output Panel */}
          <div className="flex flex-col gap-3 glass-panel p-5 rounded-2xl shadow-2xl">
            <select
              id="target-lang"
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="w-full glass-input text-white rounded-xl py-3 px-4 focus:outline-none transition duration-200 appearance-none cursor-pointer font-medium"
            >
              {LANGUAGES.map((lang) => <option key={lang.name} value={lang.name} className="bg-slate-800">{lang.name}</option>)}
            </select>
            <div className="relative flex-grow flex flex-col bg-black/20 rounded-xl border border-white/5 overflow-hidden">
              <textarea
                value={outputText}
                readOnly
                placeholder="Translation will appear here automatically..."
                className={`w-full flex-grow min-h-[300px] bg-transparent p-5 resize-none focus:outline-none text-lg leading-relaxed text-emerald-50 placeholder:text-slate-600 ${isLoading ? 'opacity-50' : ''}`}
              />
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[1px] pointer-events-none">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-sky-500 border-t-transparent animate-spin shadow-[0_0_15px_rgba(14,165,233,0.5)]"></div>
                    <span className="text-sky-400 font-medium text-sm uppercase tracking-widest animate-pulse drop-shadow-md">Translating</span>
                  </div>
                </div>
              )}
               {outputText && !isLoading && (
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <div className="relative">
                      <button 
                          onClick={handleSpeak} 
                          className={`p-2 rounded-full backdrop-blur-sm transition-colors ${isSpeaking ? 'text-sky-400 bg-white/10 animate-pulse' : 'text-slate-400 hover:text-white hover:bg-white/10'}`} 
                          title={isSpeaking ? "Stop speaking" : "Listen to translation"}
                          disabled={!('speechSynthesis' in window)}
                      >
                          <SpeakerIcon className="w-5 h-5" />
                      </button>
                    </div>
                    <button 
                        onClick={handleCopyToClipboard} 
                        className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 backdrop-blur-sm transition-colors" 
                        title="Copy to clipboard"
                    >
                        {hasCopied ? <CheckIcon className="w-5 h-5 text-emerald-400" /> : <CopyIcon className="w-5 h-5" />}
                    </button>
                  </div>
               )}
                {phoneticText && !isLoading && (
                    <div className="w-full px-5 py-4 border-t border-white/10 bg-black/40">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-sky-400/70 mb-2 flex items-center gap-2">
                            Phonetic Transcription
                        </div>
                        <div className="flex items-start gap-3">
                            <button
                                onClick={handleSpeak}
                                disabled={!('speechSynthesis' in window) || isSpeaking}
                                className="mt-0.5 p-1.5 -ml-1.5 rounded-full hover:bg-sky-500/20 transition-colors disabled:cursor-not-allowed flex-shrink-0"
                                title="Listen to pronunciation"
                            >
                                <SpeakerIcon className={`w-4 h-4 ${isSpeaking ? 'text-sky-400 animate-pulse' : 'text-sky-400/50'}`} />
                            </button>
                            <span className="text-sky-200/90 font-mono text-sm leading-relaxed break-words">{phoneticText}</span>
                        </div>
                    </div>
                )}
            </div>
             <div className="flex justify-between items-center text-xs font-medium text-slate-500 min-h-[1rem] uppercase tracking-wider">
                <div className="flex items-center gap-3">
                  <label htmlFor="speech-rate" className="text-slate-400 flex items-center gap-2">
                    <SpeakerIcon className="w-3 h-3" />
                    Speed: {speechRate}x
                  </label>
                  <input 
                    id="speech-rate"
                    type="range" 
                    min="0.5" 
                    max="2" 
                    step="0.25" 
                    value={speechRate} 
                    onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                    className="w-24 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
                    title="Adjust speech rate"
                  />
                </div>
                <div>
                  {selectedText.trim().length > 0
                      ? <span>Translating selection</span>
                      : (inputText.trim().length > 0 && <span>Translating full text</span>)
                  }
                </div>
            </div>
          </div>
        </div>

        {error && (
            <div className="relative mt-2 text-left p-4 pr-12 bg-red-900/40 border border-red-500/30 text-red-200 rounded-xl backdrop-blur-md">
                <strong className="font-semibold">Error:</strong> {error}
                <button 
                  onClick={() => setError(null)}
                  className="absolute top-1/2 right-4 -translate-y-1/2 p-1.5 rounded-full text-red-300 hover:bg-red-500/20 hover:text-white transition-colors"
                  aria-label="Dismiss error"
                  title="Dismiss error"
                >
                  <CloseIcon className="w-5 h-5" />
                </button>
            </div>
        )}

        {/* Translation Memory Section */}
        <div className="glass-panel rounded-2xl shadow-2xl overflow-hidden">
          <button
            onClick={handleToggleMemory}
            className="w-full flex justify-between items-center p-5 text-left font-serif text-xl hover:bg-white/5 transition-colors"
            aria-expanded={isMemoryVisible}
            title={isMemoryVisible ? 'Hide Translation Memory' : 'Show Translation Memory'}
          >
            <span className="flex items-center gap-3 text-white">
              <BookOpenIcon className="w-6 h-6 text-sky-400"/>
              Translation Memory <span className="text-sm font-sans text-slate-400 bg-black/30 px-2 py-0.5 rounded-full">{translationMemory.length}</span>
            </span>
            <span className={`transform transition-transform duration-300 text-slate-400 ${isMemoryVisible ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
          {isMemoryVisible && (
            <div className="p-5 border-t border-white/5 bg-black/10">
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <input
                    type="text"
                    placeholder="Search memory..."
                    value={memorySearchQuery}
                    onChange={(e) => setMemorySearchQuery(e.target.value)}
                    className="flex-grow glass-input text-white rounded-xl py-3 px-4 focus:outline-none placeholder:text-slate-500"
                    aria-label="Search translation memory"
                  />
                  <button 
                    onClick={handleClearMemory}
                    disabled={translationMemory.length === 0}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      <TrashIcon className="w-5 h-5"/> Clear All
                  </button>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {filteredMemory.length > 0 ? (
                  filteredMemory.map(entry => (
                    <div key={entry.id} className="bg-black/20 border border-white/5 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start gap-4 hover:bg-black/30 transition-colors">
                      <div className="flex-grow">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">{entry.sourceLang} → {entry.targetLang} <span className="text-sky-400/70 ml-2">({entry.role})</span></p>
                        <p className="text-slate-300 mb-3 text-sm leading-relaxed break-words">{entry.sourceText}</p>
                        <p className="text-emerald-100 text-sm leading-relaxed break-words">{entry.targetText}</p>
                        {entry.phoneticText && <p className="text-sky-300/70 font-mono text-xs italic mt-2 break-words">{entry.phoneticText}</p>}
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-2 self-start md:self-center">
                         <button onClick={() => handleReuseMemoryEntry(entry)} className="p-2.5 rounded-full hover:bg-white/10 transition-colors" title="Reuse translation">
                           <ReuseIcon className="w-5 h-5 text-sky-400"/>
                         </button>
                         <button onClick={() => handleDeleteMemoryEntry(entry.id)} className="p-2.5 rounded-full hover:bg-red-500/10 text-red-400 transition-colors" title="Remove entry">
                           <CloseIcon className="w-5 h-5"/>
                         </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-slate-500 py-10 font-medium">
                    {translationMemory.length === 0 ? "Your translation memory is empty. New translations will be saved here." : "No results found."}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Chatbot Feature */}
      <button
          onClick={handleToggleChat}
          className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 z-40 w-16 h-16 bg-gradient-to-tr from-sky-600 to-emerald-500 rounded-full shadow-[0_0_30px_rgba(14,165,233,0.3)] flex items-center justify-center text-white hover:shadow-[0_0_40px_rgba(14,165,233,0.5)] transition-all duration-300 transform hover:scale-110 border border-white/20"
          title={isChatVisible ? "Close AI Assistant" : "Open AI Assistant"}
          aria-label="Toggle AI Assistant"
      >
          {isChatVisible ? <CloseIcon className="w-8 h-8"/> : <ChatIcon className="w-8 h-8" />}
      </button>

      {isChatVisible && <Chatbot onClose={handleToggleChat} />}

      {/* Confirmation Dialog */}
      {confirmDialog?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-semibold text-white mb-2">{confirmDialog.title}</h3>
            <p className="text-slate-300 mb-6">{confirmDialog.message}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={confirmDialog.onCancel}
                className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-700 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-colors font-medium shadow-lg shadow-red-500/20"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
