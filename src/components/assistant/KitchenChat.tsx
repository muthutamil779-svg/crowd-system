import React, { useState, useRef, useEffect } from 'react';
import { useKitchen } from '../../context/KitchenContext';
import { processUserKitchenQuery, AssistantAction } from '../../services/chatAssistantEngine';
import {
  MessageSquare,
  Mic,
  MicOff,
  Send,
  Sparkles,
  ChefHat,
  ShoppingCart,
  PackageOpen,
  ArrowRight,
  Bot,
  User,
  Volume2
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  languageDetected?: 'English' | 'Tanglish' | 'Tamil';
  actions?: AssistantAction[];
  highlightItems?: string[];
}

export const KitchenChat: React.FC = () => {
  const { inventory, recipes, setActiveTab, setSelectedRecipeId, addShoppingItem } = useKitchen();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init-1',
      sender: 'assistant',
      text: `Vanakkam! 👋 I am your zero-waste SmartKitchen assistant.
I understand conversational English as well as everyday kitchen Tanglish ("Enna samaikkalam?", "Milk mudinjiduchu").

Ask me anything about your current pantry or tap one of the common questions below!`,
      timestamp: 'Just now',
      languageDetected: 'Tanglish',
      actions: [
        { label: '🍳 What should I cook first?', actionType: 'navigate_cook' },
        { label: '⚠️ Check expiring items', actionType: 'navigate_inventory' }
      ]
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (textToSend?: string) => {
    const q = textToSend || inputQuery;
    if (!q.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: 'Just now'
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');

    // Process with AI Chat Assistant Engine
    setTimeout(() => {
      const response = processUserKitchenQuery(q, inventory, recipes);

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: response.message,
        timestamp: 'Just now',
        languageDetected: response.languageDetected,
        actions: response.actions,
        highlightItems: response.highlightItems
      };

      setMessages((prev) => [...prev, aiMsg]);
    }, 450);
  };

  const handleActionClick = (action: AssistantAction) => {
    if (action.actionType === 'open_recipe' && action.payload) {
      setSelectedRecipeId(action.payload);
      setActiveTab('cook');
    } else if (action.actionType === 'navigate_cook') {
      setActiveTab('cook');
    } else if (action.actionType === 'navigate_shopping') {
      setActiveTab('shopping');
    } else if (action.actionType === 'navigate_inventory') {
      setActiveTab('inventory');
    } else if (action.actionType === 'add_shopping_item' && action.payload) {
      const p = action.payload;
      addShoppingItem(p.name, p.quantity, p.unit, 'Added via Voice / Chat AI');
      setActiveTab('shopping');
    }
  };

  // Toggle speech recognition or voice simulation
  const handleToggleVoice = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      // If Web Speech not available in browser, simulate microphone listening with standard query
      setIsListening(true);
      setTimeout(() => {
        setIsListening(false);
        handleSendMessage('Enna samaikkalam?');
      }, 1500);
      return;
    }

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN'; // South Asian English / Tanglish friendly

      if (!isListening) {
        setIsListening(true);
        recognition.start();

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputQuery(transcript);
          setIsListening(false);
          handleSendMessage(transcript);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };
      } else {
        recognition.stop();
        setIsListening(false);
      }
    } catch {
      setIsListening(false);
    }
  };

  const quickPrompts = [
    'Enna samaikkalam?',
    'What is going to expire soon?',
    'Milk mudinjiduchu.',
    'I have tomato, egg and onion. What can I cook?',
    'What should I buy?',
    'Can I substitute buttermilk?'
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-16">
      {/* Top Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/20">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">
                  Ask Kitchen AI
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                  Multilingual • Tanglish & English
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Talk or type naturally. The assistant knows your live pantry and expiring ingredients.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Connected to Pantry Memory</span>
          </div>
        </div>
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-bold text-slate-400 whitespace-nowrap">Try asking:</span>
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(prompt)}
            className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-medium whitespace-nowrap border border-purple-200 transition-colors"
          >
            “{prompt}”
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-soft min-h-[420px] max-h-[560px] flex flex-col justify-between">
        <div className="overflow-y-auto space-y-4 pr-1">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-xs ${
                    isUser ? 'bg-slate-800' : 'bg-gradient-to-tr from-purple-600 to-indigo-500 shadow-sm'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                </div>

                {/* Bubble */}
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-4 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-slate-900 text-white rounded-tr-none'
                      : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-none space-y-3'
                  }`}
                >
                  {/* Language Detected Tag for Assistant */}
                  {!isUser && msg.languageDetected && (
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pb-1 border-b border-slate-200/50">
                      <span>Kitchen AI</span>
                      <span className="font-semibold text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded-full">
                        {msg.languageDetected}
                      </span>
                    </div>
                  )}

                  {/* Message Content */}
                  <div className="whitespace-pre-line">{msg.text}</div>

                  {/* Actionable Suggestion Cards/Buttons */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-slate-200/60">
                      {msg.actions.map((act, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleActionClick(act)}
                          className="px-3 py-1.5 bg-white hover:bg-purple-50 text-purple-900 font-bold text-xs rounded-xl border border-purple-300 shadow-xs flex items-center gap-1.5 transition-colors"
                        >
                          <span>{act.label}</span>
                          <ArrowRight className="w-3 h-3 text-purple-600" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          {/* Listening Indicator */}
          {isListening && (
            <div className="mb-2 p-2 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center gap-2 text-xs font-semibold text-purple-800 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>Listening to your microphone... speak now!</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleVoice}
              className={`p-3 rounded-2xl transition-all ${
                isListening
                  ? 'bg-rose-500 text-white animate-bounce'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
              title="Voice Input (Tamil / English)"
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <input
              type="text"
              placeholder="Ask: “Enna samaikkalam?”, “Milk mudinjiduchu”, or recipe questions..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              className="flex-1 p-3 text-xs sm:text-sm rounded-2xl border border-slate-200 focus:outline-none focus:border-purple-600 bg-slate-50/50"
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={!inputQuery.trim()}
              className="p-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white rounded-2xl shadow-sm transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
