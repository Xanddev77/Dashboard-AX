import React, { useState, useEffect } from 'react';
import { useFinance } from '@/hooks/useFinance';
import { formatCurrency, cn } from '@/lib/utils';
import { Plus, TrendingUp, TrendingDown, Wallet, Bot, AlertTriangle, Settings, Trash2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ExpenseChart } from '@/components/dashboard/ExpenseChart';
import { AddTransactionModal } from '@/components/dashboard/AddTransactionModal';
import { FinancialBot } from '@/components/dashboard/FinancialBot';

export default function Dashboard() {
  const { 
    transactions, 
    monthlyLimit, 
    getBalance, 
    getTotalExpenses, 
    addTransaction, 
    deleteTransaction,
    getMonthlyExpenses,
    setMonthlyLimit
  } = useFinance();

  const [greeting, setGreeting] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBotOpen, setIsBotOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newLimit, setNewLimit] = useState(monthlyLimit.toString());

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Bom dia');
    else if (hour < 18) setGreeting('Boa tarde');
    else setGreeting('Boa noite');
  }, []);

  const balance = getBalance();
  const totalExpenses = getTotalExpenses();
  const monthlyData = getMonthlyExpenses();
  const isOverLimit = totalExpenses > monthlyLimit;
  const percentageUsed = Math.min((totalExpenses / monthlyLimit) * 100, 100);

  const handleSaveLimit = () => {
    const val = parseFloat(newLimit);
    if (!isNaN(val) && val > 0) {
      setMonthlyLimit(val);
      setIsSettingsOpen(false);
    }
  };

  const [resetConfirm, setResetConfirm] = useState(false);

  const handleResetData = () => {
    if (resetConfirm) {
      localStorage.removeItem('finsmart_data_v1');
      window.location.reload();
    } else {
      setResetConfirm(true);
      setTimeout(() => setResetConfirm(false), 3000); // Reset confirmation state after 3s
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 pb-24 relative overflow-hidden font-sans">
      {/* Background Gradients */}
      <div className="fixed top-0 left-0 w-full h-[500px] bg-violet-900/20 blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 max-w-md mx-auto px-6 pt-12">
        {/* Header */}
        <header className="flex justify-between items-start mb-8">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent"
            >
              {greeting}, Xavier
            </motion.h1>
            <p className="text-zinc-400 text-sm mt-1">Vamos cuidar das suas finanças.</p>
          </div>
          <button 
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="p-2 bg-zinc-900/50 border border-white/5 rounded-full hover:bg-white/10 transition-colors"
          >
            <Settings className="w-5 h-5 text-zinc-400" />
          </button>
        </header>

        {/* Settings Panel */}
        <AnimatePresence>
          {isSettingsOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-6 bg-zinc-900 p-4 rounded-2xl border border-white/10 overflow-hidden"
            >
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-zinc-400 uppercase font-bold tracking-wider mb-2 block">Definir Limite Mensal</label>
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      value={newLimit}
                      onChange={(e) => setNewLimit(e.target.value)}
                      className="flex-1 bg-zinc-800 rounded-lg px-3 py-2 text-sm border border-zinc-700 focus:ring-2 focus:ring-violet-500 outline-none"
                    />
                    <button 
                      onClick={handleSaveLimit}
                      className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      Salvar
                    </button>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-white/5">
                  <button 
                    onClick={handleResetData}
                    className={cn(
                      "flex items-center gap-2 text-xs transition-colors w-full justify-center py-2 rounded-lg",
                      resetConfirm ? "bg-red-500/20 text-red-400 font-bold" : "text-red-400 hover:text-red-300"
                    )}
                  >
                    <RefreshCw className={cn("w-3 h-3", resetConfirm && "animate-spin")} />
                    {resetConfirm ? "Tem certeza? Clique para confirmar." : "Resetar todos os dados"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Balance Card */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-3xl p-6 shadow-2xl shadow-violet-900/20 mb-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
          
          <div className="relative z-10">
            <p className="text-violet-200 text-sm font-medium mb-1">Saldo Total</p>
            <h2 className="text-4xl font-bold text-white mb-6 font-mono tracking-tight">
              {formatCurrency(balance)}
            </h2>

            <div className="flex gap-4">
              <div className="flex-1 bg-black/20 rounded-xl p-3 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1 bg-emerald-500/20 rounded-full">
                    <TrendingUp className="w-3 h-3 text-emerald-300" />
                  </div>
                  <span className="text-xs text-violet-200">Receitas</span>
                </div>
                <p className="text-lg font-semibold text-white">
                  {formatCurrency(transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0))}
                </p>
              </div>
              <div className="flex-1 bg-black/20 rounded-xl p-3 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1 bg-red-500/20 rounded-full">
                    <TrendingDown className="w-3 h-3 text-red-300" />
                  </div>
                  <span className="text-xs text-violet-200">Despesas</span>
                </div>
                <p className="text-lg font-semibold text-white">
                  {formatCurrency(totalExpenses)}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Monthly Limit Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-end mb-2">
            <h3 className="text-sm font-medium text-zinc-300">Limite Mensal</h3>
            <span className={cn("text-xs font-mono", isOverLimit ? "text-red-400" : "text-zinc-400")}>
              {formatCurrency(totalExpenses)} / {formatCurrency(monthlyLimit)}
            </span>
          </div>
          <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${percentageUsed}%` }}
              className={cn(
                "h-full rounded-full transition-all duration-500",
                isOverLimit ? "bg-red-500" : "bg-violet-500"
              )}
            />
          </div>
          {isOverLimit && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 flex items-center gap-2 text-red-400 text-xs bg-red-500/10 p-2 rounded-lg"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Atenção: Você excedeu seu limite mensal!</span>
            </motion.div>
          )}
        </div>

        {/* Chart Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Gastos por Mês</h3>
          <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6">
            <ExpenseChart data={monthlyData} />
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="mb-20">
          <h3 className="text-lg font-semibold mb-4">Transações Recentes</h3>
          <div className="space-y-3">
            {transactions.length === 0 ? (
              <p className="text-center text-zinc-500 py-8 text-sm">Nenhuma transação ainda.</p>
            ) : (
              transactions.slice(0, 5).map((t) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={t.id} 
                  className="group flex items-center justify-between bg-zinc-900/50 p-4 rounded-2xl border border-white/5 hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-full",
                      t.type === 'income' ? "bg-emerald-500/10" : "bg-red-500/10"
                    )}>
                      {t.type === 'income' ? (
                        <TrendingUp className={cn("w-4 h-4", t.type === 'income' ? "text-emerald-500" : "text-red-500")} />
                      ) : (
                        <Wallet className="w-4 h-4 text-zinc-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{t.description}</p>
                      <p className="text-xs text-zinc-500">{t.category} • {new Date(t.date).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "font-mono font-medium",
                      t.type === 'income' ? "text-emerald-400" : "text-zinc-200"
                    )}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                    </span>
                    <button 
                      onClick={() => deleteTransaction(t.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-zinc-500 hover:text-red-400 transition-all"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-30">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsBotOpen(true)}
          className="w-14 h-14 bg-zinc-800 border border-violet-500/30 text-violet-400 rounded-full shadow-lg flex items-center justify-center relative"
        >
          <Bot className="w-6 h-6" />
          {/* Notification dot if needed */}
          <span className="absolute top-0 right-0 w-3 h-3 bg-violet-500 rounded-full border-2 border-zinc-900" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAddModalOpen(true)}
          className="w-14 h-14 bg-violet-600 text-white rounded-full shadow-lg shadow-violet-600/30 flex items-center justify-center"
        >
          <Plus className="w-6 h-6" />
        </motion.button>
      </div>

      {/* Modals */}
      <AddTransactionModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={addTransaction} 
      />

      <FinancialBot 
        isOpen={isBotOpen} 
        onClose={() => setIsBotOpen(false)}
        financialData={{
          balance,
          limit: monthlyLimit,
          expenses: totalExpenses,
          transactions
        }}
      />
    </div>
  );
}
