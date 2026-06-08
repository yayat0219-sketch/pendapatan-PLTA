import React, { useState } from 'react';
import { Save, AlertTriangle, Plus, X } from 'lucide-react';
import { DEFAULT_CATEGORIES } from '../types';

interface SettingsViewProps {
  categories: string[];
  onUpdateCategories: (newCategories: string[]) => void;
  onClearData: () => void;
}

export function SettingsView({ categories, onUpdateCategories, onClearData }: SettingsViewProps) {
  const [localCategories, setLocalCategories] = useState<string[]>(categories.length > 0 ? categories : DEFAULT_CATEGORIES);
  const [newCategory, setNewCategory] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleAddCategory = () => {
    if (newCategory.trim() && !localCategories.includes(newCategory.trim())) {
      setLocalCategories([...localCategories, newCategory.trim()]);
      setNewCategory('');
      setIsSaved(false);
    }
  };

  const handleRemoveCategory = (cat: string) => {
    setLocalCategories(localCategories.filter(c => c !== cat));
    setIsSaved(false);
  };

  const handleSaveCategories = () => {
    onUpdateCategories(localCategories);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleClear = () => {
    if (window.confirm('PERINGATAN: Apakah Anda yakin ingin menghapus SEMUA data? Tindakan ini tidak dapat dibatalkan.')) {
      onClearData();
    }
  };

  return (
    <div className="max-w-3xl space-y-8">
      {/* Kategori Pengaturan */}
      <div className="bg-slate-900 rounded-2xl shadow-sm border border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-800">
          <h3 className="text-lg font-bold text-white leading-tight">Pengaturan Kategori</h3>
          <p className="text-sm text-slate-400 mt-1">Kelola kategori sumber pendapatan untuk memudahkan pelaporan dan grafik.</p>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                placeholder="Tambah kategori baru..."
                className="flex-1 px-4 py-2 border border-slate-700 rounded-lg bg-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-slate-500"
              />
              <button
                onClick={handleAddCategory}
                disabled={!newCategory.trim()}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:border-slate-700 disabled:cursor-not-allowed transition-colors"
              >
                <Plus size={18} className="mr-1" />
                Tambah
              </button>
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-medium text-slate-400 mb-3">Kategori Saat Ini:</h4>
              <div className="flex flex-wrap gap-2">
                {localCategories.map((cat) => (
                  <span key={cat} className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-800 text-slate-300 border border-slate-700">
                    {cat}
                    <button
                      onClick={() => handleRemoveCategory(cat)}
                      className="ml-2 inline-flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-slate-700 rounded-full transition-colors focus:outline-none p-0.5"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 px-6 py-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-sm text-emerald-400 font-medium opacity-0 transition-opacity" style={{ opacity: isSaved ? 1 : 0 }}>
            Pengaturan berhasil disimpan!
          </span>
          <button
            onClick={handleSaveCategories}
            className="inline-flex items-center justify-center px-4 py-2 border border-slate-700 text-sm font-medium rounded-lg shadow-sm text-white bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <Save size={18} className="mr-2" />
            Simpan Perubahan
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-slate-900 rounded-2xl shadow-sm border border-rose-900/50 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="text-rose-500" size={24} />
            <h3 className="text-lg font-bold text-rose-500">Area Berbahaya</h3>
          </div>
          <p className="text-sm text-slate-400 mb-6">
            Aksi di bawah ini bersifat permanen dan akan menghapus data secara lokal dari peramban Anda.
          </p>
          <button
            onClick={handleClear}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-rose-600/90 hover:bg-rose-500 transition-colors"
          >
            Hapus Semua Data
          </button>
        </div>
      </div>
    </div>
  );
}
