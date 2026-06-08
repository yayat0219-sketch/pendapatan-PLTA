import React from 'react';
import { LayoutDashboard, Database, Settings, Menu, X, Droplets } from 'lucide-react';
import { ViewState } from '../types';
import { JasaTirtaLogo } from './JasaTirtaLogo';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface LayoutProps {
  currentView: ViewState;
  onViewChange: (view: ViewState) => void;
  children: React.ReactNode;
}

export function Layout({ currentView, onViewChange, children }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navigation = [
    { name: 'Dashboard', value: 'dashboard' as ViewState, icon: LayoutDashboard },
    { name: 'Kelola Data', value: 'management' as ViewState, icon: Database },
    { name: 'Pengaturan', value: 'settings' as ViewState, icon: Settings },
  ];

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-20 border-r border-slate-800 items-center py-8 gap-10 bg-slate-900/50">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white shrink-0">
          <Droplets size={24} className="stroke-2" />
        </div>
        <nav className="flex-1 flex flex-col items-center gap-8 w-full">
          {navigation.map((item) => (
            <button
              key={item.name}
              onClick={() => onViewChange(item.value)}
              title={item.name}
              className={cn(
                "flex items-center justify-center w-12 h-12 rounded-xl transition-all",
                currentView === item.value 
                  ? "bg-slate-800 text-white" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              )}
            >
              <item.icon className="h-6 w-6 stroke-2" />
            </button>
          ))}
        </nav>
        <div className="mt-auto mb-4">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white font-medium">AD</div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"
              onClick={toggleMobileMenu}
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-64 bg-slate-950 border-r border-slate-800 z-50 flex flex-col shadow-xl md:hidden text-slate-200"
            >
              <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
                <div className="flex items-center gap-2 text-indigo-500">
                  <Droplets size={24} className="stroke-2" />
                  <span className="text-lg font-bold tracking-tight text-white">RevTrack</span>
                </div>
                <button onClick={toggleMobileMenu} className="text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {navigation.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => {
                      onViewChange(item.value);
                      setIsMobileMenuOpen(false);
                    }}
                    className={cn(
                      "flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                      currentView === item.value 
                        ? "bg-slate-800 text-white" 
                        : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                    )}
                  >
                    <item.icon className={cn("mr-3 flex-shrink-0 h-5 w-5", currentView === item.value ? "text-indigo-400" : "text-slate-400")} />
                    {item.name}
                  </button>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col overflow-hidden bg-transparent">
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto h-full flex flex-col">
            {/* Header */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 shrink-0">
              <div className="flex items-center gap-4">
                <button 
                  onClick={toggleMobileMenu}
                  className="md:hidden text-slate-400 hover:text-white focus:outline-none shrink-0"
                >
                  <Menu size={24} />
                </button>
                <div>
                  <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-white capitalize leading-tight">
                    {currentView === 'management' ? 'Kelola Data' : currentView === 'dashboard' ? 'Realisasi Produksi dan Pendapatan Listrik tahun 2026' : currentView}
                  </h1>
                  <p className="text-slate-400 text-xs sm:text-sm mt-1">
                    {currentView === 'dashboard' ? 'Bagian Usaha Unit PLTA - PJT II' : currentView === 'management' ? 'Kelola daftar transaksi dan pemasukan Anda.' : 'Atur preferensi aplikasi Anda.'}
                  </p>
                </div>
              </div>
              {currentView === 'dashboard' && (
                <div className="bg-white rounded-xl p-2 px-4.5 flex items-center justify-center shadow-md border border-slate-200 h-[52px] shrink-0 self-end sm:self-center">
                  <JasaTirtaLogo className="h-10 w-auto" />
                </div>
              )}
            </header>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
