import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, User, RefreshCw, HelpCircle, FileText, CheckCircle2, ArrowRight, Building2, Sprout } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { generateAIAnswer, parseSoilInputsFromText } from '../engine/aiEngine';

export function AIChatbot({ geoState, agriState, setGeoInputs, setAgriInputs, setActiveTab }) {
  const { t, lang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const initialGreetingEn = "Hello! I am GeoCrop AI Assistant. You can paste any soil data or ask questions! I can automatically parse your inputs, fill the forms, compute bearing capacity & crop suitability, and help you generate official PDF reports.";
  const initialGreetingTa = "வணக்கம்! நான் ஜியோக்ராப் AI உதவியாளர். உங்கள் மண் தரவுகளை தட்டச்சு செய்யுங்கள் — நான் தானாகவே படிவங்களை நிரப்பி, தாங்கும் திறன், பயிர் பொருத்தம் மற்றும் PDF அறிக்கையை உருவாக்க உதவுவேன்!";

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: lang === 'ta' ? initialGreetingTa : initialGreetingEn,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  useEffect(() => {
    if (messages.length === 1) {
      setMessages([
        {
          id: 1,
          sender: 'bot',
          text: lang === 'ta' ? initialGreetingTa : initialGreetingEn,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [lang]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    try {
      // API call to the new Express Gemini backend
      const response = await fetch('http://localhost:5000/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, geoState, agriState, lang })
      });

      if (!response.ok) {
        throw new Error('Gemini API failed or key not configured');
      }

      const data = await response.json();
      let autoFillMsg = '';
      let autoFilled = false;

      if (data.extractedParams) {
        const hasGeo = Object.keys(data.extractedParams.geo || {}).length > 0;
        const hasAgri = Object.keys(data.extractedParams.agri || {}).length > 0;

        if (hasGeo && setGeoInputs) {
          setGeoInputs(prev => ({ ...prev, ...data.extractedParams.geo }));
        }
        if (hasAgri && setAgriInputs) {
          setAgriInputs(prev => ({ ...prev, ...data.extractedParams.agri }));
        }

        if (hasGeo || hasAgri) {
          autoFilled = true;
          autoFillMsg = lang === 'ta'
            ? `✅ AI அளவுருக்களை வெற்றிகரமாக கண்டறிந்து படிவத்தில் தானாக நிரப்பியது!\n\n`
            : `✅ AI successfully extracted and auto-filled soil parameters into the application forms!\n\n`;
        }
      }

      if (data.navigate && setActiveTab) {
        setActiveTab(data.navigate);
      }

      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: autoFillMsg + data.answer,
        hasActions: autoFilled || query.toLowerCase().includes('report') || query.toLowerCase().includes('pdf') || query.toLowerCase().includes('அறிக்கை'),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.warn('Fallback to local rule-based AI Engine due to Gemini error:', err);
      // Fallback: 1. Try to parse parameters from user text
      const { parsedGeo, parsedAgri, count } = parseSoilInputsFromText(query);
      let autoFillMsg = '';

      if (count > 0) {
        if (setGeoInputs && Object.keys(parsedGeo).length > 0) {
          setGeoInputs(prev => ({ ...prev, ...parsedGeo }));
        }
        if (setAgriInputs && Object.keys(parsedAgri).length > 0) {
          setAgriInputs(prev => ({ ...prev, ...parsedAgri }));
        }

        const isTa = lang === 'ta';
        autoFillMsg = isTa
          ? `✅ ${count} மண் அளவுருக்கள் வெற்றிகரமாக கண்டறியப்பட்டு படிவத்தில் தானாக நிரப்பப்பட்டன!\n\n`
          : `✅ Successfully extracted and auto-filled ${count} soil parameters into the application forms!\n\n`;
      }

      // Fallback: 2. Generate AI Answer
      const answerText = autoFillMsg + generateAIAnswer(query, geoState, agriState, lang);
      
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: answerText,
        hasActions: count > 0 || query.toLowerCase().includes('report') || query.toLowerCase().includes('pdf') || query.toLowerCase().includes('அறிக்கை'),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleActionClick = (tabName) => {
    if (setActiveTab) {
      setActiveTab(tabName);
    }
  };

  return (
    <>
      {/* Floating Widget Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-geo-600 via-emerald-600 to-geo-700 hover:from-geo-500 hover:to-emerald-500 text-white rounded-full shadow-2xl shadow-geo-950 border border-geo-400/40 group hover:scale-105 transition-all duration-300"
        >
          <div className="relative">
            <Bot className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full" />
          </div>
          <span className="text-xs font-extrabold tracking-wide font-sans pr-1">
            {t('chatAssistant')}
          </span>
        </button>
      )}

      {/* Expanded Chat Dialog */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[90vw] sm:w-[440px] h-[580px] bg-[#0d131a] border border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
          
          {/* Dialog Header */}
          <div className="bg-gradient-to-r from-geo-950 via-slate-900 to-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-geo-500/20 border border-geo-500/30 flex items-center justify-center text-geo-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  {t('chatAssistant')}
                  <Sparkles className="w-3 h-3 text-geo-400" />
                </h3>
                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {lang === 'ta' ? 'Auto-Fill & PDF உதவியாளர்' : 'Auto-Fill & Report AI Active'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Messages List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-950/60 scrollbar-thin scrollbar-thumb-slate-800">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-xl bg-geo-900 border border-geo-700 text-geo-400 flex items-center justify-center text-xs shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-geo-600 text-white rounded-br-none shadow-md'
                      : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-bl-none shadow-md space-y-2'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                  
                  {msg.hasActions && (
                    <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                      <button
                        onClick={() => handleActionClick('geo')}
                        className="px-2.5 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-[10px] font-semibold flex items-center gap-1 transition"
                      >
                        <Building2 className="w-3 h-3" /> View Geo Tab
                      </button>
                      <button
                        onClick={() => handleActionClick('agri')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-semibold flex items-center gap-1 transition"
                      >
                        <Sprout className="w-3 h-3" /> View Agri Tab
                      </button>
                      <button
                        onClick={() => handleActionClick('report')}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-semibold flex items-center gap-1 transition"
                      >
                        <FileText className="w-3 h-3 text-amber-400" /> Generate PDF Report
                      </button>
                    </div>
                  )}

                  <span className="text-[9px] opacity-60 block text-right mt-1 font-mono">
                    {msg.time}
                  </span>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center text-xs shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-slate-400 text-xs italic pl-9">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-geo-400" />
                <span>{t('aiThinking')}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={lang === 'ta' ? 'தரவுகளை தட்டச்சு செய்யவும்...' : 'Type soil data or ask any question...'}
              className="flex-1 bg-slate-950 border border-slate-700/80 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-geo-500 transition"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim()}
              className="p-2.5 rounded-2xl bg-geo-600 hover:bg-geo-500 text-white disabled:opacity-40 transition shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}
    </>
  );
}
