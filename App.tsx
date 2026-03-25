
import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';

import { translateText, detectLanguage, getChatbotResponse, transcribeAudio } from './services/geminiService';
import { LANGUAGES, ROLES, UI_LANG_TO_TARGET_LANG } from './constants';
import { UI_TRANSLATIONS, UILanguage } from './i18n';
import { SwapIcon, CopyIcon, CheckIcon, CloseIcon, MicrophoneIcon, UploadIcon, BookOpenIcon, ReuseIcon, TrashIcon, SpeakerIcon, ChatIcon, SendIcon, FullscreenIcon, MinimizeIcon, ChevronDownIcon } from './components/icons';

// Configure pdf.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

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
  uiLanguage: UILanguage;
}

const Chatbot: React.FC<ChatbotProps> = ({ onClose, uiLanguage }) => {
  const t = UI_TRANSLATIONS[uiLanguage];
  const [messages, setMessages] = useState<Message[]>([
    { id: 'initial', text: "Hello! I'm your AI Assistant. I can provide up-to-date information and help with various tasks. How can I help you today?", sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useMaps, setUseMaps] = useState(false);
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
      const { text, sources } = await getChatbotResponse(trimmedInput, useMaps);
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
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 lg:bottom-24 lg:right-8 w-[calc(100%-2rem)] max-w-md h-[70vh] max-h-[600px] bg-white rounded-xl shadow-2xl flex flex-col z-50 animate-fade-in origin-bottom-right border border-slate-200">
      <header className="flex items-center justify-between p-4 bg-slate-50 rounded-t-xl border-b border-slate-200 flex-shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-slate-900">AI Assistant</h2>
          <label className="flex items-center gap-1.5 cursor-pointer text-xs" title={t.useMapsDesc}>
            <input 
              type="checkbox" 
              checked={useMaps} 
              onChange={(e) => setUseMaps(e.target.checked)}
              className="rounded text-sky-600 focus:ring-sky-500"
            />
            <span className="text-slate-600 font-medium">{t.useMaps}</span>
          </label>
        </div>
        <button onClick={onClose} className="p-1 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors" title="Close chat">
          <CloseIcon className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-lg px-3 py-2 ${msg.sender === 'user' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-800 border border-slate-200'}`}>
                <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2 border-t border-slate-300 pt-2">
                    <h4 className="text-xs font-bold text-slate-500 mb-1">Sources:</h4>
                    <ul className="space-y-1">
                      {msg.sources.map((source, index) => (
                        <li key={source.uri}>
                          <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-sky-600 hover:underline truncate block" title={source.title}>
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
              <div className="max-w-[85%] rounded-lg px-3 py-2 bg-slate-100 text-slate-800 border border-slate-200">
                <p className="text-sm animate-pulse">AI Assistant is thinking...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-xl flex-shrink-0">
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask anything..."
            className="w-full bg-white border border-slate-300 rounded-full py-2 pl-4 pr-12 text-sm focus:ring-2 focus:ring-sky-500 disabled:opacity-75 text-slate-900 placeholder:text-slate-400"
            disabled={isLoading}
            aria-label="Chat input"
          />
          <button type="submit" disabled={!inputValue.trim() || isLoading} className="absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-full bg-sky-600 text-white disabled:bg-slate-300 disabled:cursor-not-allowed hover:bg-sky-500 transition-colors" title="Send message">
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
  const [role, setRole] = useState<string>(ROLES[0].id);
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
  const [isAutoTranslateEnabled, setIsAutoTranslateEnabled] = useState<boolean>(true);
  const [isAutoCorrectEnabled, setIsAutoCorrectEnabled] = useState<boolean>(true);
  const [uiLanguage, setUiLanguage] = useState<UILanguage>('pt'); // Default to PT as requested
  const [customProfession, setCustomProfession] = useState<string>('');
  
  const t = UI_TRANSLATIONS[uiLanguage];

  // Effect to sync target language with UI language
  useEffect(() => {
    const targetLangName = UI_LANG_TO_TARGET_LANG[uiLanguage];
    if (targetLangName) {
      setTargetLang(targetLangName);
    }
  }, [uiLanguage]);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [isGeneratingContent, setIsGeneratingContent] = useState<boolean>(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
  } | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const lastTranslatedTextRef = useRef<string>('');
  const detectionIdRef = useRef(0);
  const translationIdRef = useRef(0);
  
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
      if (data.id && data.id !== translationIdRef.current) return;
      
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
    if (!isAutoDetectEnabled) {
      setIsDetecting(false);
      setDetectedLangMessage(null);
      return;
    }
    
    const detectionId = ++detectionIdRef.current;

    const runDetection = async () => {
      if (!debouncedInputText.trim() || debouncedInputText.trim().length < 10) {
        setDetectedLangMessage(null);
        return;
      }

      setIsDetecting(true);
      setDetectedLangMessage(t.detecting || 'Detecting language...');
      try {
        const detected = await detectLanguage(debouncedInputText, LANGUAGES.map(l => l.name));
        
        if (detectionId !== detectionIdRef.current) return;

        if (LANGUAGES.some(l => l.name === detected)) {
          setSourceLang(detected);
          setDetectedLangMessage(`${t.detected || 'Detected'}: ${t[LANGUAGES.find(l => l.name === detected)?.nameKey as keyof typeof t] || detected}`);
        } else {
          setDetectedLangMessage(t.uncertainLanguage || 'Uncertain language. Please select manually.');
        }
      } catch (err) {
        if (detectionId !== detectionIdRef.current) return;
        setDetectedLangMessage(t.uncertainLanguage || 'Uncertain language. Please select manually.');
      } finally {
        if (detectionId === detectionIdRef.current) {
          setIsDetecting(false);
        }
      }
    };

    runDetection();
  }, [debouncedInputText, isAutoDetectEnabled, t]);

  // Effect for real-time translation (handles selected text or full debounced text)
  useEffect(() => {
    if (!isAutoTranslateEnabled) {
      return;
    }
    
    const textToTranslate = selectedText || debouncedInputText;
    const translationId = ++translationIdRef.current;

    const autoTranslate = async () => {
      if (!textToTranslate.trim()) {
        setOutputText('');
        setPhoneticText('');
        setGeneratedContent('');
        lastTranslatedTextRef.current = '';
        return;
      }
      
      const currentTranslationKey = `${textToTranslate}|${sourceLang}|${targetLang}|${role}|${isThinkingMode}|${isAutoCorrectEnabled}`;
      
      if (currentTranslationKey === lastTranslatedTextRef.current) {
        return; // Already translated this exact text with these settings
      }
      
      setIsLoading(true);
      setError(null);
      setGeneratedContent('');

      if (isOfflineMode) {
        if (workerRef.current) {
          lastTranslatedTextRef.current = currentTranslationKey;
          workerRef.current.postMessage({
            text: textToTranslate,
            src: sourceLang,
            tgt: targetLang,
            id: translationId
          });
        } else {
          setError("Offline translation worker not initialized.");
          setIsLoading(false);
        }
        return; // Exit early, worker handles the rest
      }

      try {
        const { correctedSource, translation, phonetic } = await translateText(textToTranslate, sourceLang, targetLang, role, isThinkingMode, isAutoCorrectEnabled, customProfession);
        
        if (translationId !== translationIdRef.current) return;

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
        if (translationId !== translationIdRef.current) return;
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        if (translationId === translationIdRef.current) {
          setIsLoading(false);
        }
      }
    };

    autoTranslate();
  }, [selectedText, debouncedInputText, sourceLang, targetLang, role, isThinkingMode, isAutoCorrectEnabled, isAutoTranslateEnabled]);
  
  // Effect for speech synthesis cleanup
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);


  const handleSwapLanguages = () => {
    const oldInput = inputText;
    const oldOutput = outputText;
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setInputText(oldOutput);
    setOutputText(oldInput);
    setPhoneticText('');
    setSelectedText('');
    setIsAutoDetectEnabled(false);
    setDetectedLangMessage('Manual selection');
    
    // If auto-translate is off and we have text, we might want to re-translate
    // but usually swap means we just swapped the boxes.
    // However, if the user wants to translate the new input, they'll click the button.
  };
  
  const handleCopyToClipboard = () => {
    if(outputText) {
      navigator.clipboard.writeText(outputText);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    }
  };

  const handleRepurposeContent = async (format: string) => {
    if (!outputText) return;
    setIsGeneratingContent(true);
    setGeneratedContent('');
    try {
      const { generateRepurposedContent } = await import('./services/geminiService');
      const content = await generateRepurposedContent(outputText, targetLang, format, role, customProfession);
      if (content) {
        setGeneratedContent(content);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred while generating content.');
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const handleToggleListen = async () => {
    if (isListening) {
      mediaRecorderRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64AudioMessage = reader.result as string;
            const base64Audio = base64AudioMessage.split(',')[1];
            try {
              setIsLoading(true);
              const transcription = await transcribeAudio(base64Audio, 'audio/webm');
              if (transcription) {
                setInputText(prev => prev ? `${prev} ${transcription}` : transcription);
              }
            } catch (err) {
              setError("Failed to transcribe audio.");
            } finally {
              setIsLoading(false);
            }
          };
          
          // Stop all tracks to release microphone
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsListening(true);
        setError(null);
      } catch (err) {
        console.error("Error accessing microphone:", err);
        setError("Could not access microphone. Please check permissions.");
        setIsListening(false);
      }
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

  // Manual translation function
  const handleManualTranslate = async () => {
    const textToTranslate = selectedText || inputText;
    if (!textToTranslate.trim()) return;

    const translationId = ++translationIdRef.current;
    setIsLoading(true);
    setError(null);
    setGeneratedContent('');

    if (isOfflineMode) {
      if (workerRef.current) {
        workerRef.current.postMessage({
          text: textToTranslate,
          src: sourceLang,
          tgt: targetLang,
          id: translationId
        });
      } else {
        setError("Offline translation worker not initialized.");
        setIsLoading(false);
      }
      return;
    }

    try {
      const { correctedSource, translation, phonetic } = await translateText(textToTranslate, sourceLang, targetLang, role, isThinkingMode, isAutoCorrectEnabled, customProfession);
      
      if (translationId !== translationIdRef.current) return;

      if (correctedSource && correctedSource !== textToTranslate && isAutoCorrectEnabled) {
        setInputText(correctedSource);
      }
      
      setOutputText(translation);
      setPhoneticText(phonetic);
      
      // Add to translation memory
      const newEntry: TranslationEntry = {
        id: Date.now().toString(),
        sourceText: correctedSource || textToTranslate,
        targetText: translation,
        phoneticText: phonetic,
        sourceLang,
        targetLang,
        role
      };
      setTranslationMemory(prev => [newEntry, ...prev].slice(0, 50));
    } catch (err) {
      if (translationId !== translationIdRef.current) return;
      setError(err instanceof Error ? err.message : 'Translation failed');
    } finally {
      if (translationId === translationIdRef.current) {
        setIsLoading(false);
      }
    }
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
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,_#e2e8f0_0%,_transparent_50%)] opacity-50"></div>

      <header className="w-full max-w-6xl text-center mb-10 relative z-10 flex flex-col items-center justify-center">
        <div className="absolute right-0 top-0 flex items-center gap-3">
          <div className="relative">
            <select
              value={uiLanguage}
              onChange={(e) => setUiLanguage(e.target.value as UILanguage)}
              className="appearance-none bg-white/50 hover:bg-white/80 border border-slate-200 text-slate-600 text-sm font-medium py-2 pl-3 pr-8 rounded-full shadow-sm focus:outline-none transition-colors cursor-pointer"
            >
              <option value="en">{t.langEnUk}</option>
              <option value="pt">{t.langPt}</option>
              <option value="fr">{t.langFr}</option>
              <option value="de">{t.langDe}</option>
              <option value="es">{t.langEs}</option>
              <option value="zh">{t.langZh}</option>
              <option value="da">{t.langDa}</option>
              <option value="fi">{t.langFi}</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
              <ChevronDownIcon className="w-4 h-4" />
            </div>
          </div>
          <button
            onClick={handleToggleFullscreen}
            className="p-2 rounded-full bg-white/50 hover:bg-white/80 text-slate-500 transition-colors border border-slate-200 shadow-sm"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <MinimizeIcon className="w-5 h-5" /> : <FullscreenIcon className="w-5 h-5" />}
          </button>
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-semibold text-slate-900 tracking-tight mb-3">
          {t.appTitle.replace('Pro', '')}<span className="text-sky-600 italic">Pro</span>
        </h1>
        <p className="text-slate-500 text-sm md:text-base uppercase tracking-widest font-medium">{t.appSubtitle}</p>
      </header>

      <main className="w-full max-w-6xl flex flex-col gap-8 relative z-10">
        <div className="glass-panel p-6 rounded-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex-grow">
                <label htmlFor="role-selector" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                  {t.translationPersona}
                </label>
                <div className="relative">
                  <select
                    id="role-selector"
                    value={role}
                    onChange={handleRoleChange}
                    className="w-full glass-input rounded-xl py-3 pl-4 pr-10 focus:outline-none transition duration-200 appearance-none cursor-pointer"
                  >
                    {ROLES.map((r) => (
                      <option key={r.id} value={r.id} title={t[r.descKey]} className="bg-white text-slate-900">
                        {t[r.nameKey]}
                      </option>
                    ))}
                    <option value="Custom Profession" title={t.customProfessionLabel} className="bg-white text-slate-900 font-semibold">
                      {t.customProfessionOption}
                    </option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                    <ChevronDownIcon className="w-5 h-5" />
                  </div>
                </div>
                {role === 'Custom Profession' && (
                  <div className="mt-3 animate-fade-in">
                    <input
                      type="text"
                      value={customProfession}
                      onChange={(e) => setCustomProfession(e.target.value)}
                      placeholder={t.customProfessionPlaceholder}
                      className="w-full glass-input rounded-xl py-3 px-4 focus:outline-none transition duration-200"
                    />
                  </div>
                )}
              </div>

              <div className="flex-shrink-0 sm:pt-7 flex flex-col gap-3 min-w-[220px]">
                <label htmlFor="autodetect-toggle" className={`flex items-center justify-between p-2.5 rounded-xl border transition-colors cursor-pointer group ${isOfflineMode ? 'opacity-50 pointer-events-none' : ''} ${isAutoDetectEnabled ? 'bg-amber-50 border-amber-200 shadow-sm' : 'bg-white/50 border-slate-200 hover:bg-amber-50/50'}`} title={t.autoDetectDesc}>
                    <span className={`text-sm font-medium mr-3 transition-colors ${isAutoDetectEnabled ? 'text-amber-700' : 'text-slate-600 group-hover:text-amber-600'}`}>🔍 {t.autoDetect}</span>
                    <div className="relative">
                        <input
                            type="checkbox"
                            id="autodetect-toggle"
                            className="sr-only peer"
                            checked={isAutoDetectEnabled}
                            onChange={() => setIsAutoDetectEnabled(prev => !prev)}
                            disabled={isOfflineMode}
                        />
                        <div className="w-10 h-5 rounded-full bg-slate-200 peer-checked:bg-amber-500 transition-colors"></div>
                        <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transform peer-checked:translate-x-5 transition-transform"></div>
                    </div>
                </label>

                <label htmlFor="autotranslate-toggle" className={`flex items-center justify-between p-2.5 rounded-xl border transition-colors cursor-pointer group ${isOfflineMode ? 'opacity-50 pointer-events-none' : ''} ${isAutoTranslateEnabled ? 'bg-rose-50 border-rose-200 shadow-sm' : 'bg-white/50 border-slate-200 hover:bg-rose-50/50'}`} title={t.autoTranslateDesc}>
                    <span className={`text-sm font-medium mr-3 transition-colors ${isAutoTranslateEnabled ? 'text-rose-700' : 'text-slate-600 group-hover:text-rose-600'}`}>⚡ {t.autoTranslate}</span>
                    <div className="relative">
                        <input
                            type="checkbox"
                            id="autotranslate-toggle"
                            className="sr-only peer"
                            checked={isAutoTranslateEnabled}
                            onChange={() => setIsAutoTranslateEnabled(prev => !prev)}
                            disabled={isOfflineMode}
                        />
                        <div className="w-10 h-5 rounded-full bg-slate-200 peer-checked:bg-rose-500 transition-colors"></div>
                        <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transform peer-checked:translate-x-5 transition-transform"></div>
                    </div>
                </label>

                <label htmlFor="autocorrect-toggle" className={`flex items-center justify-between p-2.5 rounded-xl border transition-colors cursor-pointer group ${isOfflineMode ? 'opacity-50 pointer-events-none' : ''} ${isAutoCorrectEnabled ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white/50 border-slate-200 hover:bg-indigo-50/50'}`} title={t.autoCorrectDesc}>
                    <span className={`text-sm font-medium mr-3 transition-colors ${isAutoCorrectEnabled ? 'text-indigo-700' : 'text-slate-600 group-hover:text-indigo-600'}`}>✨ {t.autoCorrect}</span>
                    <div className="relative">
                        <input
                            type="checkbox"
                            id="autocorrect-toggle"
                            className="sr-only peer"
                            checked={isAutoCorrectEnabled}
                            onChange={() => setIsAutoCorrectEnabled(prev => !prev)}
                            disabled={isOfflineMode}
                        />
                        <div className="w-10 h-5 rounded-full bg-slate-200 peer-checked:bg-indigo-500 transition-colors"></div>
                        <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transform peer-checked:translate-x-5 transition-transform"></div>
                    </div>
                </label>

                <label htmlFor="thinking-mode-toggle" className={`flex items-center justify-between p-2.5 rounded-xl border transition-colors cursor-pointer group ${isOfflineMode ? 'opacity-50 pointer-events-none' : ''} ${isThinkingMode ? 'bg-sky-50 border-sky-200 shadow-sm' : 'bg-white/50 border-slate-200 hover:bg-sky-50/50'}`} title={t.thinkingModeDesc}>
                    <span className={`text-sm font-medium mr-3 transition-colors ${isThinkingMode ? 'text-sky-700' : 'text-slate-600 group-hover:text-sky-600'}`}>🧠 {t.thinkingMode}</span>
                    <div className="relative">
                        <input
                            type="checkbox"
                            id="thinking-mode-toggle"
                            className="sr-only peer"
                            checked={isThinkingMode}
                            onChange={() => setIsThinkingMode(prev => !prev)}
                            disabled={isOfflineMode}
                        />
                        <div className="w-10 h-5 rounded-full bg-slate-200 peer-checked:bg-sky-500 transition-colors"></div>
                        <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transform peer-checked:translate-x-5 transition-transform"></div>
                    </div>
                </label>

                <label htmlFor="offline-mode-toggle" className={`flex items-center justify-between p-2.5 rounded-xl border transition-colors cursor-pointer group ${isOfflineMode ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'bg-white/50 border-slate-200 hover:bg-emerald-50/50'}`} title={t.offlineModeDesc}>
                    <span className={`text-sm font-medium mr-3 transition-colors ${isOfflineMode ? 'text-emerald-700' : 'text-slate-600 group-hover:text-emerald-600'}`}>🔌 {t.offlineMode}</span>
                    <div className="relative">
                        <input
                            type="checkbox"
                            id="offline-mode-toggle"
                            className="sr-only peer"
                            checked={isOfflineMode}
                            onChange={() => setIsOfflineMode(prev => !prev)}
                        />
                        <div className="w-10 h-5 rounded-full bg-slate-200 peer-checked:bg-emerald-500 transition-colors"></div>
                        <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transform peer-checked:translate-x-5 transition-transform"></div>
                    </div>
                </label>
              </div>
            </div>
            <div className="mt-4 p-4 bg-slate-100/50 rounded-xl min-h-[4rem] flex flex-col justify-center gap-2 border border-slate-200">
                <p className="text-slate-600 text-sm leading-relaxed">
                  {isOfflineMode 
                      ? <><strong className="font-semibold text-emerald-600">{t.offlineModeEnabled}</strong> {t.offlineModeEnabledDesc}</>
                      : isThinkingMode 
                          ? <><strong className="font-semibold text-sky-600">{t.thinkingModeEnabled}</strong> {t.thinkingModeEnabledDesc}</>
                          : t[ROLES.find(r => r.id === role)?.descKey as keyof typeof t] || ROLES.find(r => r.id === role)?.description
                  }
                </p>
                {offlineProgress && (
                  <div className="w-full mt-2">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>{offlineProgress.status === 'loading' ? 'Initializing model...' : offlineProgress.status === 'progress' ? `Downloading ${offlineProgress.model || 'model'}...` : 'Translating...'}</span>
                      {offlineProgress.progress !== undefined && <span>{Math.round(offlineProgress.progress)}%</span>}
                    </div>
                    {offlineProgress.progress !== undefined && (
                      <div className="w-full bg-slate-200 rounded-full h-1.5">
                        <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${offlineProgress.progress}%` }}></div>
                      </div>
                    )}
                  </div>
                )}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 items-stretch">
          {/* Input Panel */}
          <div className="flex flex-col gap-3 glass-panel p-5 rounded-2xl">
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
                  className="w-full glass-input rounded-xl py-3 px-4 pr-10 focus:outline-none transition duration-200 appearance-none cursor-pointer font-medium"
                >
                  {LANGUAGES.map((lang) => <option key={lang.name} value={lang.name} className="bg-white">{t[lang.nameKey as keyof typeof t] || lang.name}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none flex items-center">
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 text-xs font-medium text-slate-500 min-h-[1rem] uppercase tracking-wider">
                {isDetecting && (
                  <div className="w-4 h-4 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" title="Detecting language..."></div>
                )}
                {!isDetecting && detectedLangMessage?.startsWith('Detected:') && (
                  <CheckIcon className="w-4 h-4 text-emerald-600" title="Language auto-detected" />
                )}
                {detectedLangMessage && (
                  <span className={`${isDetecting ? 'animate-pulse text-sky-600' : detectedLangMessage.startsWith('Uncertain') ? 'text-amber-600' : 'text-emerald-600'}`}>{detectedLangMessage}</span>
                )}
                {detectedLangMessage?.startsWith('Uncertain') && (
                  <button 
                    onClick={() => {
                      setIsAutoDetectEnabled(false);
                      setDetectedLangMessage('Manual override');
                      document.getElementById('source-lang')?.focus();
                    }}
                    className="px-2 py-1 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-md transition-colors"
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
                placeholder={isAutoTranslateEnabled ? t.inputPlaceholderAuto : t.inputPlaceholderManual}
                className="w-full flex-grow min-h-[300px] glass-input rounded-xl p-5 pr-16 resize-none focus:outline-none transition duration-200 text-lg leading-relaxed placeholder:text-slate-400"
              />
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                {inputText && (
                  <button
                    onClick={handleClearInput}
                    className="p-2 text-slate-400 hover:text-slate-900 transition-colors rounded-full hover:bg-slate-200/50 backdrop-blur-sm"
                    title="Clear text"
                  >
                    <CloseIcon className="w-5 h-5" />
                  </button>
                )}
                <button 
                  onClick={handleToggleListen}
                  className={`p-2 text-slate-400 hover:text-slate-900 transition-colors rounded-full backdrop-blur-sm ${isListening ? 'bg-red-500/50 text-white animate-pulse' : 'hover:bg-slate-200/50'}`}
                  title={isListening ? 'Stop listening' : 'Start listening'}
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
              className="p-4 rounded-full glass-panel hover:bg-slate-200/50 text-slate-500 hover:text-slate-900 transition-all duration-300 hover:scale-105 shadow-sm"
              title="Swap languages"
            >
              <SwapIcon className="w-6 h-6" />
            </button>

            {!isAutoTranslateEnabled && (
              <button
                onClick={handleManualTranslate}
                disabled={isLoading || !inputText.trim()}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl transition-all duration-300 hover:scale-105 shadow-md border-2 ${isLoading || !inputText.trim() ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-sky-500 text-white border-sky-400 hover:bg-sky-600 active:scale-95'}`}
                title={t.translateBtn}
              >
                <BookOpenIcon className="w-6 h-6" />
                <span className="text-xs font-bold uppercase tracking-wider">{t.translateBtn}</span>
              </button>
            )}

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
                    className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl glass-panel hover:bg-slate-200/50 text-slate-500 hover:text-slate-900 transition-all duration-300 hover:scale-105 shadow-sm"
                    title={t.uploadDoc}
                >
                    <UploadIcon className="w-6 h-6" />
                    <span className="text-xs font-medium uppercase tracking-wider hidden lg:block">{t.uploadDoc.split(' ')[0]}</span>
                </button>
                {fileName && (
                    <div className="mt-3 text-xs text-slate-500 flex items-center justify-center gap-1 bg-slate-200/50 px-2 py-1 rounded-full">
                        <span className="truncate max-w-[80px]" title={fileName}>{fileName}</span>
                        <button onClick={handleClearFile} title={t.clear} className="p-0.5 rounded-full hover:bg-slate-300/50">
                            <CloseIcon className="w-3 h-3 text-red-500 hover:text-red-600" />
                        </button>
                    </div>
                )}
            </div>
          </div>

          {/* Output Panel */}
          <div className="flex flex-col gap-3 glass-panel p-5 rounded-2xl">
            <div className="relative">
              <select
                id="target-lang"
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="w-full glass-input rounded-xl py-3 px-4 pr-10 focus:outline-none transition duration-200 appearance-none cursor-pointer font-medium"
              >
                {LANGUAGES.map((lang) => <option key={lang.name} value={lang.name} className="bg-white">{t[lang.nameKey as keyof typeof t] || lang.name}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none flex items-center">
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
            <div className="relative flex-grow flex flex-col bg-slate-100/50 rounded-xl border border-slate-200 overflow-hidden">
              <textarea
                value={outputText}
                readOnly
                placeholder={t.targetText + "..."}
                className={`w-full flex-grow min-h-[300px] bg-transparent p-5 resize-none focus:outline-none text-lg leading-relaxed text-slate-900 placeholder:text-slate-400 ${isLoading ? 'opacity-50' : ''}`}
              />
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[1px] pointer-events-none">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-sky-500 border-t-transparent animate-spin shadow-[0_0_15px_rgba(14,165,233,0.2)]"></div>
                    <span className="text-sky-600 font-medium text-sm uppercase tracking-widest animate-pulse drop-shadow-sm">{t.translating}</span>
                  </div>
                </div>
              )}
               {outputText && !isLoading && (
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <div className="relative">
                      <button 
                          onClick={handleSpeak} 
                          className={`p-2 rounded-full backdrop-blur-sm transition-colors ${isSpeaking ? 'text-sky-600 bg-slate-200/50 animate-pulse' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-200/50'}`} 
                          title={isSpeaking ? t.stop : t.listen}
                          disabled={!('speechSynthesis' in window)}
                      >
                          <SpeakerIcon className="w-5 h-5" />
                      </button>
                    </div>
                    <button 
                        onClick={handleCopyToClipboard} 
                        className="p-2 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-200/50 backdrop-blur-sm transition-colors" 
                        title={t.copy}
                    >
                        {hasCopied ? <CheckIcon className="w-5 h-5 text-emerald-600" /> : <CopyIcon className="w-5 h-5" />}
                    </button>
                  </div>
               )}
                {phoneticText && !isLoading && (
                    <div className="w-full px-5 py-4 border-t border-slate-200 bg-slate-50/80">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-sky-600/70 mb-2 flex items-center gap-2">
                            {t.phoneticTranscription}
                        </div>
                        <div className="flex items-start gap-3">
                            <button
                                onClick={handleSpeak}
                                disabled={!('speechSynthesis' in window) || isSpeaking}
                                className="mt-1 p-1.5 -ml-1.5 rounded-full hover:bg-sky-100 transition-colors disabled:cursor-not-allowed flex-shrink-0"
                                title="Listen to pronunciation"
                            >
                                <SpeakerIcon className={`w-5 h-5 ${isSpeaking ? 'text-sky-600 animate-pulse' : 'text-sky-600/50'}`} />
                            </button>
                            <span className="text-sky-900 font-mono text-base md:text-lg leading-relaxed break-words tracking-wide">{phoneticText}</span>
                        </div>
                    </div>
                )}
                
                {outputText && !isLoading && (
                    <div className="w-full px-5 py-4 border-t border-slate-200 bg-indigo-50/50">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-600/70 flex items-center gap-2">
                                {t.repurposeTranslation}
                            </div>
                            <div className="relative flex-grow sm:max-w-xs">
                                <select
                                    defaultValue=""
                                    onChange={(e) => {
                                        if (e.target.value) {
                                            handleRepurposeContent(e.target.value);
                                            e.target.value = ''; // Reset after selection
                                        }
                                    }}
                                    className="w-full glass-input rounded-xl py-2 pl-4 pr-10 text-sm focus:outline-none transition duration-200 appearance-none cursor-pointer bg-white border-indigo-100 text-indigo-900"
                                    disabled={isGeneratingContent}
                                >
                                    <option value="" disabled>{isGeneratingContent ? t.generatingContent : t.repurposePrompt}</option>
                                    <option value="professional email">{t.repurposeEmail}</option>
                                    <option value="presentation slides">{t.repurposePresentation}</option>
                                    <option value="social media post">{t.repurposeSocial}</option>
                                    <option value="newsletter">{t.repurposeNewsletter}</option>
                                    <option value="formal letter">{t.repurposeLetter}</option>
                                    <option value="blog post">{t.repurposeBlog}</option>
                                    <option value="marketing brochure">{t.repurposeBrochure}</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-indigo-400">
                                    {isGeneratingContent ? (
                                        <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <ChevronDownIcon className="w-4 h-4" />
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        {generatedContent && (
                            <div className="mt-4 p-4 bg-white rounded-xl border border-indigo-100 shadow-sm relative animate-fade-in">
                                <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-600/70 mb-2">
                                    {t.generatedContentTitle}
                                </div>
                                <div className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">
                                    {generatedContent}
                                </div>
                                <button 
                                    onClick={() => {
                                        navigator.clipboard.writeText(generatedContent);
                                    }} 
                                    className="absolute top-3 right-3 p-1.5 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" 
                                    title={t.copy}
                                >
                                    <CopyIcon className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
             <div className="flex justify-between items-center text-xs font-medium text-slate-500 min-h-[1rem] uppercase tracking-wider">
                <div className="flex items-center gap-3">
                  <label htmlFor="speech-rate" className="text-slate-500 flex items-center gap-2">
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
                    className="w-24 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500"
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
            <div className="relative mt-2 text-left p-4 pr-12 bg-red-50 border border-red-200 text-red-800 rounded-xl backdrop-blur-md">
                <strong className="font-semibold">Error:</strong> {error}
                <button 
                  onClick={() => setError(null)}
                  className="absolute top-1/2 right-4 -translate-y-1/2 p-1.5 rounded-full text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors"
                  aria-label="Dismiss error"
                  title="Dismiss error"
                >
                  <CloseIcon className="w-5 h-5" />
                </button>
            </div>
        )}

        {/* Translation Memory Section */}
        <div className="glass-panel rounded-2xl overflow-hidden">
          <button
            onClick={handleToggleMemory}
            className="w-full flex justify-between items-center p-5 text-left font-serif text-xl hover:bg-slate-100/50 transition-colors"
            aria-expanded={isMemoryVisible}
            title={isMemoryVisible ? 'Hide Translation Memory' : 'Show Translation Memory'}
          >
            <span className="flex items-center gap-3 text-slate-900">
              <BookOpenIcon className="w-6 h-6 text-sky-600"/>
              {t.history} <span className="text-sm font-sans text-slate-500 bg-slate-200/50 px-2 py-0.5 rounded-full">{translationMemory.length}</span>
            </span>
            <span className={`transform transition-transform duration-300 text-slate-400 ${isMemoryVisible ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
          {isMemoryVisible && (
            <div className="p-5 border-t border-slate-200 bg-slate-50/50">
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <input
                    type="text"
                    placeholder="Search memory..."
                    value={memorySearchQuery}
                    onChange={(e) => setMemorySearchQuery(e.target.value)}
                    className="flex-grow glass-input rounded-xl py-3 px-4 focus:outline-none placeholder:text-slate-400 text-slate-900"
                    aria-label="Search translation memory"
                  />
                  <button 
                    onClick={handleClearMemory}
                    disabled={translationMemory.length === 0}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      <TrashIcon className="w-5 h-5"/> {t.clear} All
                  </button>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {filteredMemory.length > 0 ? (
                  filteredMemory.map(entry => (
                    <div key={entry.id} className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start gap-4 hover:bg-slate-50 transition-colors shadow-sm">
                      <div className="flex-grow">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">{entry.sourceLang} → {entry.targetLang} <span className="text-sky-600/70 ml-2">({entry.role})</span></p>
                        <p className="text-slate-700 mb-3 text-sm leading-relaxed break-words">{entry.sourceText}</p>
                        <p className="text-emerald-800 text-sm leading-relaxed break-words">{entry.targetText}</p>
                        {entry.phoneticText && <p className="text-sky-800 font-mono text-sm mt-2 break-words tracking-wide">{entry.phoneticText}</p>}
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-2 self-start md:self-center">
                         <button onClick={() => handleReuseMemoryEntry(entry)} className="p-2.5 rounded-full hover:bg-slate-100 transition-colors" title={t.reuse}>
                           <ReuseIcon className="w-5 h-5 text-sky-600"/>
                         </button>
                         <button onClick={() => handleDeleteMemoryEntry(entry.id)} className="p-2.5 rounded-full hover:bg-red-50 text-red-500 transition-colors" title={t.delete}>
                           <CloseIcon className="w-5 h-5"/>
                         </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-slate-500 py-10 font-medium">
                    {translationMemory.length === 0 ? t.noHistory : "No results found."}
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
          className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 z-40 w-16 h-16 bg-gradient-to-tr from-sky-600 to-emerald-500 rounded-full shadow-[0_4px_20px_rgba(14,165,233,0.3)] flex items-center justify-center text-white hover:shadow-[0_4px_25px_rgba(14,165,233,0.4)] transition-all duration-300 transform hover:scale-110 border border-white/20"
          title={isChatVisible ? "Close AI Assistant" : "Open AI Assistant"}
          aria-label="Toggle AI Assistant"
      >
          {isChatVisible ? <CloseIcon className="w-8 h-8"/> : <ChatIcon className="w-8 h-8" />}
      </button>

      {isChatVisible && <Chatbot onClose={handleToggleChat} uiLanguage={uiLanguage} />}

      {/* Confirmation Dialog */}
      {confirmDialog?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-semibold text-slate-900 mb-2">{confirmDialog.title}</h3>
            <p className="text-slate-600 mb-6">{confirmDialog.message}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={confirmDialog.onCancel}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors font-medium"
              >
                {t.cancel}
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-colors font-medium shadow-sm shadow-red-500/20"
              >
                {t.clear}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full max-w-6xl text-center py-6 mt-4 relative z-10">
        <p className="text-slate-400 text-sm font-medium tracking-wide">
          By Senuenso Corpor.&trade;
        </p>
      </footer>
    </div>
  );
};

export default App;
