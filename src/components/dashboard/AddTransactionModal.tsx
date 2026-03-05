import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (t: { description: string; amount: number; type: 'income' | 'expense'; category: string; date: string }) => void;
}

export function AddTransactionModal({ isOpen, onClose, onAdd }: AddTransactionModalProps) {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Outros');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    onAdd({
      description,
      amount: parseFloat(amount),
      type,
      category,
      date: new Date().toISOString(),
    });
    
    // Reset
    setAmount('');
    setDescription('');
    setCategory('Outros');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="fixed left-4 right-4 top-[15%] md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-md bg-zinc-900 rounded-3xl p-6 z-50 border border-white/10 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Nova Transação</h2>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Type Toggle */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={cn(
                    "py-2 rounded-lg text-sm font-medium transition-all",
                    type === 'expense' ? "bg-red-500/20 text-red-400 shadow-sm" : "text-zinc-400 hover:text-zinc-200"
                  )}
                >
                  Despesa
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={cn(
                    "py-2 rounded-lg text-sm font-medium transition-all",
                    type === 'income' ? "bg-emerald-500/20 text-emerald-400 shadow-sm" : "text-zinc-400 hover:text-zinc-200"
                  )}
                >
                  Receita
                </button>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">Valor</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-4 pl-10 pr-4 text-2xl font-mono focus:ring-2 focus:ring-violet-500 outline-none transition-all"
                    placeholder="0.00"
                    autoFocus
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">Descrição</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-4 focus:ring-2 focus:ring-violet-500 outline-none transition-all"
                  placeholder="Ex: Supermercado"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">Categoria</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-4 focus:ring-2 focus:ring-violet-500 outline-none transition-all appearance-none"
                >
                  <option value="Alimentação">Alimentação</option>
                  <option value="Transporte">Transporte</option>
                  <option value="Lazer">Lazer</option>
                  <option value="Saúde">Saúde</option>
                  <option value="Moradia">Moradia</option>
                  <option value="Salário">Salário</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-violet-600 hover:bg-violet-700 active:scale-95 transition-all rounded-xl font-semibold text-white shadow-lg shadow-violet-600/20 flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                Salvar Transação
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
