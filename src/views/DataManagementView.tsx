import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Filter, Download } from 'lucide-react';
import { RevenueRecord, ProductionRecord, PSTerjualRecord, MONTHS, DEFAULT_CATEGORIES } from '../types';
import { formatRupiah, generateId } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface DataManagementViewProps {
  data: RevenueRecord[];
  productionData: ProductionRecord[];
  psData: PSTerjualRecord[];
  onAddData: (row: RevenueRecord) => void;
  onUpdateData: (row: RevenueRecord) => void;
  onDeleteData: (id: string) => void;
  onAddProductionData: (row: ProductionRecord) => void;
  onUpdateProductionData: (row: ProductionRecord) => void;
  onDeleteProductionData: (id: string) => void;
  onAddPsData: (row: PSTerjualRecord) => void;
  onUpdatePsData: (row: PSTerjualRecord) => void;
  onDeletePsData: (id: string) => void;
  categories: string[];
}

export function DataManagementView({ 
  data, 
  productionData, 
  psData,
  onAddData, 
  onUpdateData, 
  onDeleteData, 
  onAddProductionData,
  onUpdateProductionData,
  onDeleteProductionData,
  onAddPsData,
  onUpdatePsData,
  onDeletePsData,
  categories 
}: DataManagementViewProps) {
  const [activeTab, setActiveTab] = useState<'revenue' | 'production' | 'ps_terjual'>('revenue');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<RevenueRecord | ProductionRecord | PSTerjualRecord | null>(null);

  // Form State
  const [month, setMonth] = useState(MONTHS[0]);
  const [year, setYear] = useState(new Date().getFullYear());
  
  // Revenue Form State
  const [category, setCategory] = useState(categories[0] || DEFAULT_CATEGORIES[0]);
  const [amount, setAmount] = useState<string>('');
  const [notes, setNotes] = useState('');

  // Production Form State
  const [plta, setPlta] = useState<string>('');
  const [miniHydro, setMiniHydro] = useState<string>('');
  const [pln, setPln] = useState<string>('');

  // PS Terjual Form State
  const [psCategory, setPsCategory] = useState<'INDUSTRI / PERUSAHAAN' | 'PERUMAHAN & WARUNG'>('INDUSTRI / PERUSAHAAN');
  const [customerName, setCustomerName] = useState('');
  const [kwhValue, setKwhValue] = useState<string>('');
  const [rupiahValue, setRupiahValue] = useState<string>('');

  const filteredData = data.filter(item => 
    item.month.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.year.toString().includes(searchTerm)
  ).sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return MONTHS.indexOf(a.month) - MONTHS.indexOf(b.month);
  });

  const filteredProductionData = productionData.filter(item => 
    item.month.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.year.toString().includes(searchTerm)
  ).sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return MONTHS.indexOf(a.month) - MONTHS.indexOf(b.month);
  });

  const filteredPsData = (psData || []).filter(item => 
    item.month.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.year.toString().includes(searchTerm)
  ).sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    if (a.month !== b.month) return MONTHS.indexOf(a.month) - MONTHS.indexOf(b.month);
    return a.customerName.localeCompare(b.customerName);
  });

  const openAddModal = () => {
    setEditingData(null);
    setMonth(MONTHS[0]);
    setYear(new Date().getFullYear());
    if (activeTab === 'revenue') {
      setCategory(categories[0] || DEFAULT_CATEGORIES[0]);
      setAmount('');
      setNotes('');
    } else if (activeTab === 'production') {
      setPlta('');
      setMiniHydro('');
      setPln('');
    } else {
      setPsCategory('INDUSTRI / PERUSAHAAN');
      setCustomerName('');
      setKwhValue('');
      setRupiahValue('');
    }
    setIsModalOpen(true);
  };

  const openEditModal = (item: RevenueRecord | ProductionRecord | PSTerjualRecord) => {
    setEditingData(item);
    setMonth(item.month);
    setYear(item.year);
    
    if (activeTab === 'revenue') {
      const revenueItem = item as RevenueRecord;
      setCategory(revenueItem.category);
      setAmount(revenueItem.amount.toString());
      setNotes(revenueItem.notes || '');
    } else if (activeTab === 'production') {
      const prodItem = item as ProductionRecord;
      setPlta(prodItem.plta.toString());
      setMiniHydro(prodItem.miniHydro.toString());
      setPln(prodItem.pln !== undefined && prodItem.pln !== null ? prodItem.pln.toString() : '');
    } else {
      const psItem = item as PSTerjualRecord;
      setPsCategory(psItem.category);
      setCustomerName(psItem.customerName);
      setKwhValue(psItem.kwhValue.toString());
      setRupiahValue(psItem.rupiahValue.toString());
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeTab === 'revenue') {
      if (amount === '' || isNaN(Number(amount))) {
        alert("Mohon isi jumlah pendapatan dengan angka yang valid.");
        return;
      }
      
      const record: RevenueRecord = {
        id: editingData ? editingData.id : generateId(),
        month,
        year: Number(year),
        category: category || categories[0] || DEFAULT_CATEGORIES[0],
        amount: Number(amount),
        notes,
        dateAdded: editingData ? editingData.dateAdded : new Date().toISOString(),
      };

      if (editingData) {
        onUpdateData(record);
      } else {
        onAddData(record);
      }
    } else if (activeTab === 'production') {
      if (plta === '' || isNaN(Number(plta))) {
        alert("Mohon isi produksi PLTA dengan angka yang valid.");
        return;
      }
      if (miniHydro === '' || isNaN(Number(miniHydro))) {
        alert("Mohon isi produksi Mini Hydro dengan angka yang valid.");
        return;
      }
      if (pln === '' || isNaN(Number(pln))) {
        alert("Mohon isi produksi PLN dengan angka yang valid.");
        return;
      }

      const record: ProductionRecord = {
        id: editingData ? editingData.id : generateId(),
        month,
        year: Number(year),
        plta: Number(plta),
        miniHydro: Number(miniHydro),
        pln: Number(pln),
        dateAdded: editingData ? editingData.dateAdded : new Date().toISOString(),
      };

      if (editingData) {
        onUpdateProductionData(record);
      } else {
        onAddProductionData(record);
      }
    } else {
      if (!customerName.trim()) {
        alert("Mohon isi nama perusahaan atau pelanggan.");
        return;
      }
      if (kwhValue === '' || isNaN(Number(kwhValue))) {
        alert("Mohon isi jumlah kWh dengan angka yang valid.");
        return;
      }
      if (rupiahValue === '' || isNaN(Number(rupiahValue))) {
        alert("Mohon isi jumlah Rupiah dengan angka yang valid.");
        return;
      }

      const record: PSTerjualRecord = {
        id: editingData ? editingData.id : generateId(),
        month,
        year: Number(year),
        category: psCategory,
        customerName: customerName.trim(),
        kwhValue: Number(kwhValue),
        rupiahValue: Number(rupiahValue),
        dateAdded: editingData ? (editingData as PSTerjualRecord).dateAdded : new Date().toISOString(),
      };

      if (editingData) {
        onUpdatePsData(record);
      } else {
        onAddPsData(record);
      }
    }
    
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    const tabName = activeTab === 'revenue' ? 'pendapatan' : activeTab === 'production' ? 'produksi' : 'PS Terjual';
    if (window.confirm(`Apakah Anda yakin ingin menghapus data ${tabName} ini?`)) {
      if (activeTab === 'revenue') {
        onDeleteData(id);
      } else if (activeTab === 'production') {
        onDeleteProductionData(id);
      } else {
        onDeletePsData(id);
      }
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    if (activeTab === 'revenue') {
      doc.text('Laporan Data Pendapatan', 14, 22);
      
      const head = [['Periode', 'Kategori Sumber', 'Pendapatan (Rp)', 'Catatan']];
      const body = filteredData.map(row => [
        `${row.month} ${row.year}`,
        row.category,
        formatRupiah(row.amount),
        row.notes || '-'
      ]);

      autoTable(doc, {
        startY: 30,
        head: head,
        body: body,
      });
      doc.save('data_pendapatan.pdf');
      
    } else if (activeTab === 'production') {
      doc.text('Laporan Data Produksi', 14, 22);
      
      const head = [['Periode', 'Produksi PLTA (kWh)', 'Produksi Mini Hydro (kWh)', 'Produksi PLN (kWh)', 'Produksi PS (kWh)']];
      const body = filteredProductionData.map(row => [
        `${row.month} ${row.year}`,
        new Intl.NumberFormat('id-ID').format(row.plta),
        new Intl.NumberFormat('id-ID').format(row.miniHydro),
        new Intl.NumberFormat('id-ID').format(row.pln || 0),
        new Intl.NumberFormat('id-ID').format((row.plta + row.miniHydro) - (row.pln || 0)),
      ]);

      autoTable(doc, {
        startY: 30,
        head: head,
        body: body,
      });
      doc.save('data_produksi.pdf');
      
    } else {
      doc.text('Laporan Data PS Terjual & Penugasan', 14, 22);
      
      const head = [['Periode', 'Kategori', 'Nama Pelanggan / Perusahaan', 'Penyaluran (kWh)', 'Pendapatan (Rp)']];
      const body = filteredPsData.map(row => [
        `${row.month} ${row.year}`,
        row.category,
        row.customerName,
        new Intl.NumberFormat('id-ID').format(row.kwhValue),
        formatRupiah(row.rupiahValue),
      ]);

      autoTable(doc, {
        startY: 30,
        head: head,
        body: body,
      });
      doc.save('data_ps_terjual.pdf');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1 sm:w-fit gap-1">
        <button
          onClick={() => setActiveTab('revenue')}
          className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'revenue' 
              ? 'bg-indigo-600 text-white shadow-sm' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Data Pendapatan
        </button>
        <button
          onClick={() => setActiveTab('production')}
          className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'production' 
              ? 'bg-indigo-600 text-white shadow-sm' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Data Produksi
        </button>
        <button
          onClick={() => setActiveTab('ps_terjual')}
          className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'ps_terjual' 
              ? 'bg-indigo-600 text-white shadow-sm' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          PS Terjual & Penugasan
        </button>
      </div>

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-sm">
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-500" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-lg leading-5 bg-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
            placeholder="Cari bulan, kategori..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex w-full sm:w-auto gap-2">
          <button
            onClick={handleDownloadPDF}
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-slate-700 text-sm font-medium rounded-lg shadow-sm text-slate-300 bg-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <Download className="mr-2 -ml-1 h-5 w-5" />
            Unduh PDF
          </button>
          <button
            onClick={openAddModal}
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <Plus className="mr-2 -ml-1 h-5 w-5" />
            Tambah Data
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 rounded-2xl shadow-sm border border-slate-800 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          {activeTab === 'revenue' ? (
            <table className="w-full text-left">
              <thead className="bg-slate-800/50 text-slate-500 text-xs uppercase font-bold tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-4">
                    Periode
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Kategori Sumber
                  </th>
                  <th scope="col" className="px-6 py-4 text-right">
                    Pendapatan
                  </th>
                  <th scope="col" className="px-6 py-4 hidden md:table-cell">
                    Catatan
                  </th>
                  <th scope="col" className="px-6 py-4 text-center">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-300">
                {filteredData.length > 0 ? (
                  filteredData.map((row) => (
                    <tr key={row.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-white font-medium">
                        {row.month} {row.year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {row.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-right text-emerald-400">
                        {formatRupiah(row.amount)}
                      </td>
                      <td className="px-6 py-4 text-slate-400 hidden md:table-cell max-w-[200px] truncate">
                        {row.notes || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center space-x-2 font-medium">
                        <button 
                          onClick={() => openEditModal(row)}
                          className="text-indigo-400 hover:text-indigo-300 transition-colors px-2 py-1"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(row.id)}
                          className="text-rose-400 hover:text-rose-300 transition-colors px-2 py-1"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">
                      <div className="flex flex-col items-center justify-center">
                        <Filter className="h-10 w-10 text-slate-700 mb-3" />
                        <p className="text-slate-400 font-medium text-base">Tidak ada data ditemukan</p>
                        <p className="text-slate-500 mt-1">Silakan tambah data baru atau ubah pencarian Anda.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : activeTab === 'production' ? (
            <table className="w-full text-left">
              <thead className="bg-slate-800/50 text-slate-500 text-xs uppercase font-bold tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-4">Periode</th>
                  <th scope="col" className="px-6 py-4 text-right">Produksi PLTA</th>
                  <th scope="col" className="px-6 py-4 text-right">Produksi Mini Hydro</th>
                  <th scope="col" className="px-6 py-4 text-right">Produksi PLN</th>
                  <th scope="col" className="px-6 py-4 text-right">Produksi PS</th>
                  <th scope="col" className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-300">
                {filteredProductionData.length > 0 ? (
                  filteredProductionData.map((row) => (
                    <tr key={row.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-white font-medium">
                        {row.month} {row.year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-right text-indigo-400">
                        {new Intl.NumberFormat('id-ID').format(row.plta)} kWh
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-right text-sky-400">
                        {new Intl.NumberFormat('id-ID').format(row.miniHydro)} kWh
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-right text-emerald-400">
                        {new Intl.NumberFormat('id-ID').format(row.pln || 0)} kWh
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-right text-amber-400">
                        {new Intl.NumberFormat('id-ID').format((row.plta + row.miniHydro) - (row.pln || 0))} kWh
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center space-x-2 font-medium">
                        <button 
                          onClick={() => openEditModal(row)}
                          className="text-indigo-400 hover:text-indigo-300 transition-colors px-2 py-1"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(row.id)}
                          className="text-rose-400 hover:text-rose-300 transition-colors px-2 py-1"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
                      <div className="flex flex-col items-center justify-center">
                        <Filter className="h-10 w-10 text-slate-700 mb-3" />
                        <p className="text-slate-400 font-medium text-base">Tidak ada data ditemukan</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-800/50 text-slate-500 text-xs uppercase font-bold tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-4">Periode</th>
                  <th scope="col" className="px-6 py-4">Kategori</th>
                  <th scope="col" className="px-6 py-4">Nama Pelanggan / Perusahaan</th>
                  <th scope="col" className="px-6 py-4 text-right">Penyaluran (kWh)</th>
                  <th scope="col" className="px-6 py-4 text-right">Pendapatan (Rupiah)</th>
                  <th scope="col" className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-300">
                {filteredPsData.length > 0 ? (
                  filteredPsData.map((row) => (
                    <tr key={row.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-white font-medium">
                        {row.month} {row.year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${
                          row.category === 'INDUSTRI / PERUSAHAAN'
                            ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          {row.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-200">
                        {row.customerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-right text-indigo-400">
                        {new Intl.NumberFormat('id-ID').format(row.kwhValue)} kWh
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-right text-emerald-400">
                        {formatRupiah(row.rupiahValue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center space-x-2 font-medium">
                        <button 
                          onClick={() => openEditModal(row)}
                          className="text-indigo-400 hover:text-indigo-300 transition-colors px-2 py-1"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(row.id)}
                          className="text-rose-400 hover:text-rose-300 transition-colors px-2 py-1"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
                      <div className="flex flex-col items-center justify-center">
                        <Filter className="h-10 w-10 text-slate-700 mb-3" />
                        <p className="text-slate-400 font-medium text-base">Tidak ada data ditemukan</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal CRUD */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity z-0" 
                aria-hidden="true" 
                onClick={() => setIsModalOpen(false)}
              />

              {/* Center modal trick */}
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative z-10 inline-block align-bottom bg-slate-900 border border-slate-800 rounded-2xl text-left overflow-hidden shadow-2xl sm:my-8 sm:align-middle sm:max-w-lg w-full"
              >
                <form onSubmit={handleSubmit}>
                  <div className="bg-slate-900 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                        <h3 className="text-lg leading-6 font-bold text-white mb-5" id="modal-title">
                          {editingData ? `Edit Data ${activeTab === 'revenue' ? 'Pendapatan' : activeTab === 'production' ? 'Produksi' : 'PS Terjual & Penugasan'}` : `Tambah Data ${activeTab === 'revenue' ? 'Pendapatan' : activeTab === 'production' ? 'Produksi' : 'PS Terjual & Penugasan'}`}
                        </h3>
                        
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="month" className="block text-sm font-medium text-slate-400 mb-1">Bulan</label>
                              <select
                                id="month"
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-700 rounded-lg bg-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                              >
                                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                              </select>
                            </div>
                            <div>
                              <label htmlFor="year" className="block text-sm font-medium text-slate-400 mb-1">Tahun</label>
                              <input
                                type="number"
                                id="year"
                                value={year}
                                onChange={(e) => setYear(Number(e.target.value))}
                                className="w-full px-3 py-2 border border-slate-700 rounded-lg bg-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                              />
                            </div>
                          </div>

                          {activeTab === 'revenue' ? (
                            <>
                              <div>
                                <label htmlFor="category" className="block text-sm font-medium text-slate-400 mb-1">Kategori</label>
                                <select
                                  id="category"
                                  value={category}
                                  onChange={(e) => setCategory(e.target.value)}
                                  className="w-full px-3 py-2 border border-slate-700 rounded-lg bg-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                  required
                                >
                                  {categories.length > 0 ? categories.map(c => <option key={c} value={c}>{c}</option>) : DEFAULT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                              </div>

                              <div>
                                <label htmlFor="amount" className="block text-sm font-medium text-slate-400 mb-1">
                                  Jumlah Pendapatan (Rp)
                                </label>
                                <input
                                  type="number"
                                  id="amount"
                                  value={amount}
                                  onChange={(e) => setAmount(e.target.value)}
                                  placeholder="Contoh: 15000000"
                                  className="w-full px-3 py-2 border border-slate-700 rounded-lg bg-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-slate-500"
                                  required
                                  min="0"
                                />
                              </div>

                              <div>
                                <label htmlFor="notes" className="block text-sm font-medium text-slate-400 mb-1">Catatan (Opsional)</label>
                                <textarea
                                  id="notes"
                                  value={notes}
                                  onChange={(e) => setNotes(e.target.value)}
                                  rows={3}
                                  className="w-full px-3 py-2 border border-slate-700 rounded-lg bg-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-slate-500"
                                  placeholder="Tambahkan keterangan jika perlu..."
                                />
                              </div>
                            </>
                          ) : activeTab === 'production' ? (
                            <>
                              <div>
                                <label htmlFor="plta" className="block text-sm font-medium text-slate-400 mb-1">Produksi PLTA (kWh)</label>
                                <input
                                  type="number"
                                  id="plta"
                                  value={plta}
                                  onChange={(e) => setPlta(e.target.value)}
                                  placeholder="Contoh: 89804820"
                                  className="w-full px-3 py-2 border border-slate-700 rounded-lg bg-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-slate-500"
                                  required
                                  min="0"
                                />
                              </div>
                              <div>
                                <label htmlFor="miniHydro" className="block text-sm font-medium text-slate-400 mb-1">Produksi Mini Hydro (kWh)</label>
                                <input
                                  type="number"
                                  id="miniHydro"
                                  value={miniHydro}
                                  onChange={(e) => setMiniHydro(e.target.value)}
                                  placeholder="Contoh: 350000"
                                  className="w-full px-3 py-2 border border-slate-700 rounded-lg bg-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-slate-500"
                                  required
                                  min="0"
                                />
                              </div>
                              <div>
                                <label htmlFor="pln" className="block text-sm font-medium text-slate-400 mb-1">Produksi PLN (kWh)</label>
                                <input
                                  type="number"
                                  id="pln"
                                  value={pln}
                                  onChange={(e) => setPln(e.target.value)}
                                  placeholder="Contoh: 37972050"
                                  className="w-full px-3 py-2 border border-slate-700 rounded-lg bg-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-slate-500"
                                  required
                                  min="0"
                                />
                              </div>
                            </>
                          ) : (
                            <>
                              <div>
                                <label htmlFor="psCategory" className="block text-sm font-medium text-slate-400 mb-1">Kategori Kelompok</label>
                                <select
                                  id="psCategory"
                                  value={psCategory}
                                  onChange={(e) => setPsCategory(e.target.value as any)}
                                  className="w-full px-3 py-2 border border-slate-700 rounded-lg bg-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                  required
                                >
                                  <option value="INDUSTRI / PERUSAHAAN">INDUSTRI / PERUSAHAAN</option>
                                  <option value="PERUMAHAN & WARUNG">PERUMAHAN & WARUNG</option>
                                </select>
                              </div>

                              <div>
                                <label htmlFor="customerName" className="block text-sm font-medium text-slate-400 mb-1">Nama Perusahaan / Pelanggan</label>
                                <input
                                  type="text"
                                  id="customerName"
                                  value={customerName}
                                  onChange={(e) => setCustomerName(e.target.value)}
                                  placeholder="Contoh: PT. INDOTAMA FERRO ALLOYS"
                                  className="w-full px-3 py-2 border border-slate-700 rounded-lg bg-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-slate-500"
                                  required
                                />
                              </div>

                              <div>
                                <label htmlFor="kwhValue" className="block text-sm font-medium text-slate-400 mb-1">Volume Penyaluran (kWh)</label>
                                <input
                                  type="number"
                                  step="any"
                                  id="kwhValue"
                                  value={kwhValue}
                                  onChange={(e) => setKwhValue(e.target.value)}
                                  placeholder="Contoh: 29885655.93"
                                  className="w-full px-3 py-2 border border-slate-700 rounded-lg bg-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-slate-500"
                                  required
                                  min="0"
                                />
                              </div>

                              <div>
                                <label htmlFor="rupiahValue" className="block text-sm font-medium text-slate-400 mb-1">Pendapatan Penjualan (Rupiah)</label>
                                <input
                                  type="number"
                                  step="any"
                                  id="rupiahValue"
                                  value={rupiahValue}
                                  onChange={(e) => setRupiahValue(e.target.value)}
                                  placeholder="Contoh: 23830523182"
                                  className="w-full px-3 py-2 border border-slate-700 rounded-lg bg-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-slate-500"
                                  required
                                  min="0"
                                />
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-800/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-slate-800">
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                    >
                      Simpan Data
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="mt-3 w-full inline-flex justify-center rounded-lg border border-slate-700 shadow-sm px-4 py-2 bg-slate-800 text-base font-medium text-slate-300 hover:bg-slate-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm transition-colors"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
