import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Bot, Sparkles } from 'lucide-react';
import { getFinancialAdvice } from '@/services/ai';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

interface FinancialBotProps {
  isOpen: boolean;
  onClose: () => void;
  financialData: {
    balance: number;
    limit: number;
    expenses: number;
    transactions: any[];
  };
}

export function FinancialBot({ isOpen, onClose, financialData }: FinancialBotProps) {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    { role: 'assistant', text: 'Olá! Sou seu assistente financeiro. Como posso ajudar você a economizar hoje? 💰' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Auto-generate advice when opened for the first time or data changes significantly?
  // For now, let's add a "Generate Analysis" button inside.

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      // Simple chat for now, ideally we would maintain history context
      // But we'll just ask for general advice if it's a generic question
      // Or pass the prompt to the AI service.
      
      // For this MVP, we'll re-use the advice function if the user asks for "analise" or similar, 
      // otherwise we might need a more generic chat function. 
      // Let's make a generic chat function in the service later if needed.
      // For now, let's assume the user wants advice based on context.
      
      const response = await getFinancialAdvice(
        financialData.balance,
        financialData.limit,
        financialData.expenses,
        financialData.transactions
      );
      
      setMessages(prev => [...prev, { role: 'assistant', text: response || "Não entendi, pode repetir?" }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', text: "Tive um erro ao processar. Tente novamente." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateAdvice = async () => {
    setIsLoading(true);
    try {
      const advice = await getFinancialAdvice(
        financialData.balance,
        financialData.limit,
        financialData.expenses,
        financialData.transactions
      );
      setMessages(prev => [...prev, { role: 'assistant', text: advice || "Sem conselhos no momento." }]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 h-[85vh] bg-zinc-900 rounded-t-3xl z-50 flex flex-col shadow-2xl border-t border-white/10"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-600 rounded-xl">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">FinBot</h3>
                  <p className="text-xs text-zinc-400">Seu assistente de economia</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed",
                    msg.role === 'user'
                      ? "bg-violet-600 text-white ml-auto rounded-tr-sm"
                      : "bg-zinc-800 text-zinc-200 mr-auto rounded-tl-sm"
                  )}
                >
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown
                      components={{
                        p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2 last:mb-0" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2 last:mb-0" {...props} />,
                        li: ({node, ...props}) => <li className="mb-1" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-bold text-white" {...props} />,
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="bg-zinc-800 text-zinc-200 mr-auto rounded-tl-sm rounded-2xl p-4 w-16 flex items-center justify-center">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="px-4 pb-2">
               <button 
                onClick={handleGenerateAdvice}
                disabled={isLoading}
                className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 active:scale-95 transition-all rounded-xl flex items-center justify-center gap-2 text-sm font-medium text-violet-300 border border-violet-500/20"
              >
                <Sparkles className="w-4 h-4" />
                Gerar Análise Mensal
              </button>
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/5 bg-zinc-900 pb-8">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Pergunte sobre seus gastos..."
                  className="flex-1 bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-violet-500 outline-none text-white placeholder:text-zinc-500"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="p-3 bg-violet-600 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-violet-700 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
