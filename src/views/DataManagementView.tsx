import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Filter, Download } from 'lucide-react';
import { RevenueRecord, ProductionRecord, PSTerjualRecord, TransmissionRecord, MONTHS, DEFAULT_CATEGORIES } from '../types';
import { formatRupiah, generateId } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface DataManagementViewProps {
  data: RevenueRecord[];
  productionData: ProductionRecord[];
  psData: PSTerjualRecord[];
  transmissionData?: TransmissionRecord[];
  onAddData: (row: RevenueRecord) => void;
  onUpdateData: (row: RevenueRecord) => void;
  onDeleteData: (id: string) => void;
  onAddProductionData: (row: ProductionRecord) => void;
  onUpdateProductionData: (row: ProductionRecord) => void;
  onDeleteProductionData: (id: string) => void;
  onAddPsData: (row: PSTerjualRecord) => void;
  onUpdatePsData: (row: PSTerjualRecord) => void;
  onDeletePsData: (id: string) => void;
  onAddTransmissionData?: (row: TransmissionRecord) => void;
  onUpdateTransmissionData?: (row: TransmissionRecord) => void;
  onDeleteTransmissionData?: (id: string) => void;
  categories: string[];
}

export function DataManagementView({ 
  data, 
  productionData, 
  psData,
  transmissionData = [],
  onAddData, 
  onUpdateData, 
  onDeleteData, 
  onAddProductionData,
  onUpdateProductionData,
  onDeleteProductionData,
  onAddPsData,
  onUpdatePsData,
  onDeletePsData,
  onAddTransmissionData,
  onUpdateTransmissionData,
  onDeleteTransmissionData,
  categories 
}: DataManagementViewProps) {
  const [activeTab, setActiveTab] = useState<'revenue' | 'production' | 'ps_terjual' | 'transmission'>('revenue');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<RevenueRecord | ProductionRecord | PSTerjualRecord | TransmissionRecord | null>(null);
  const [expandedTxRow, setExpandedTxRow] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string | null; tabName: string }>({
    isOpen: false,
    id: null,
    tabName: ''
  });

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
  const [ps, setPs] = useState<string>('');

  // PS Terjual Form State
  const [psCategory, setPsCategory] = useState<'INDUSTRI / PERUSAHAAN' | 'PERUMAHAN & WARUNG'>('INDUSTRI / PERUSAHAAN');
  const [customerName, setCustomerName] = useState('');
  const [kwhValue, setKwhValue] = useState<string>('');
  const [rupiahValue, setRupiahValue] = useState<string>('');

  // Transmission Form State (7 transmission lines, Kirim & Terima)
  const [curugKirim, setCurugKirim] = useState<string>('');
  const [curugTerima, setCurugTerima] = useState<string>('');
  const [pdlrg1Kirim, setPdlrg1Kirim] = useState<string>('');
  const [pdlrg1Terima, setPdlrg1Terima] = useState<string>('');
  const [pdlrg2Kirim, setPdlrg2Kirim] = useState<string>('');
  const [pdlrg2Terima, setPdlrg2Terima] = useState<string>('');
  const [tatajabar1Kirim, setTatajabar1Kirim] = useState<string>('');
  const [tatajabar1Terima, setTatajabar1Terima] = useState<string>('');
  const [tatajabar2Kirim, setTatajabar2Kirim] = useState<string>('');
  const [tatajabar2Terima, setTatajabar2Terima] = useState<string>('');
  const [lineIndustriKirim, setLineIndustriKirim] = useState<string>('');
  const [lineIndustriTerima, setLineIndustriTerima] = useState<string>('');
  const [pupukKujangKirim, setPupukKujangKirim] = useState<string>('');
  const [pupukKujangTerima, setPupukKujangTerima] = useState<string>('');

  const [transmissionDisplayUnit, setTransmissionDisplayUnit] = useState<'kwh' | 'rupiah'>('kwh');

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

  const filteredTransmissionData = (transmissionData || []).filter(item => 
    item.month.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.year.toString().includes(searchTerm)
  ).sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return MONTHS.indexOf(a.month) - MONTHS.indexOf(b.month);
  });

  const openAddModal = () => {
    setEditingData(null);
    setSaveError(null);
    setIsSaving(false);
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
      setPs('');
    } else if (activeTab === 'ps_terjual') {
      setPsCategory('INDUSTRI / PERUSAHAAN');
      setCustomerName('');
      setKwhValue('');
      setRupiahValue('');
    } else {
      setCurugKirim('');
      setCurugTerima('');
      setPdlrg1Kirim('');
      setPdlrg1Terima('');
      setPdlrg2Kirim('');
      setPdlrg2Terima('');
      setTatajabar1Kirim('');
      setTatajabar1Terima('');
      setTatajabar2Kirim('');
      setTatajabar2Terima('');
      setLineIndustriKirim('');
      setLineIndustriTerima('');
      setPupukKujangKirim('');
      setPupukKujangTerima('');
    }
    setIsModalOpen(true);
  };

  const openEditModal = (item: RevenueRecord | ProductionRecord | PSTerjualRecord | TransmissionRecord) => {
    setEditingData(item);
    setSaveError(null);
    setIsSaving(false);
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
      const defaultPs = prodItem.ps !== undefined && prodItem.ps !== null 
        ? prodItem.ps 
        : (prodItem.plta + prodItem.miniHydro - (prodItem.pln || 0));
      setPs(defaultPs.toString());
    } else if (activeTab === 'ps_terjual') {
      const psItem = item as PSTerjualRecord;
      setPsCategory(psItem.category);
      setCustomerName(psItem.customerName);
      setKwhValue(psItem.kwhValue.toString());
      setRupiahValue(psItem.rupiahValue.toString());
    } else {
      const txItem = item as TransmissionRecord;
      setCurugKirim(txItem.curugKirim.toString());
      setCurugTerima(txItem.curugTerima.toString());
      setPdlrg1Kirim(txItem.pdlrg1Kirim.toString());
      setPdlrg1Terima(txItem.pdlrg1Terima.toString());
      setPdlrg2Kirim(txItem.pdlrg2Kirim.toString());
      setPdlrg2Terima(txItem.pdlrg2Terima.toString());
      setTatajabar1Kirim(txItem.tatajabar1Kirim.toString());
      setTatajabar1Terima(txItem.tatajabar1Terima.toString());
      setTatajabar2Kirim(txItem.tatajabar2Kirim.toString());
      setTatajabar2Terima(txItem.tatajabar2Terima.toString());
      setLineIndustriKirim(txItem.lineIndustriKirim.toString());
      setLineIndustriTerima(txItem.lineIndustriTerima.toString());
      setPupukKujangKirim(txItem.pupukKujangKirim.toString());
      setPupukKujangTerima(txItem.pupukKujangTerima.toString());
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    
    try {
      if (activeTab === 'revenue') {
        if (amount === '' || isNaN(Number(amount))) {
          alert("Mohon isi jumlah pendapatan dengan angka yang valid.");
          setIsSaving(false);
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
          await onUpdateData(record);
        } else {
          await onAddData(record);
        }
      } else if (activeTab === 'production') {
        if (plta === '' || isNaN(Number(plta))) {
          alert("Mohon isi produksi PLTA dengan angka yang valid.");
          setIsSaving(false);
          return;
        }
        if (miniHydro === '' || isNaN(Number(miniHydro))) {
          alert("Mohon isi produksi Mini Hydro dengan angka yang valid.");
          setIsSaving(false);
          return;
        }
        if (pln === '' || isNaN(Number(pln))) {
          alert("Mohon isi produksi PLN dengan angka yang valid.");
          setIsSaving(false);
          return;
        }
        if (ps === '' || isNaN(Number(ps))) {
          alert("Mohon isi produksi PS dengan angka yang valid.");
          setIsSaving(false);
          return;
        }

        const record: ProductionRecord = {
          id: editingData ? editingData.id : generateId(),
          month,
          year: Number(year),
          plta: Number(plta),
          miniHydro: Number(miniHydro),
          pln: Number(pln),
          ps: Number(ps),
          dateAdded: editingData ? editingData.dateAdded : new Date().toISOString(),
        };

        if (editingData) {
          await onUpdateProductionData(record);
        } else {
          await onAddProductionData(record);
        }
      } else if (activeTab === 'ps_terjual') {
        if (!customerName.trim()) {
          alert("Mohon isi nama perusahaan atau pelanggan.");
          setIsSaving(false);
          return;
        }
        if (kwhValue === '' || isNaN(Number(kwhValue))) {
          alert("Mohon isi jumlah kWh dengan angka yang valid.");
          setIsSaving(false);
          return;
        }
        if (rupiahValue === '' || isNaN(Number(rupiahValue))) {
          alert("Mohon isi jumlah Rupiah dengan angka yang valid.");
          setIsSaving(false);
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
          await onUpdatePsData(record);
        } else {
          await onAddPsData(record);
        }
      } else {
        const record: TransmissionRecord = {
          id: editingData ? editingData.id : generateId(),
          month,
          year: Number(year),
          curugKirim: Number(curugKirim) || 0,
          curugTerima: Number(curugTerima) || 0,
          pdlrg1Kirim: Number(pdlrg1Kirim) || 0,
          pdlrg1Terima: Number(pdlrg1Terima) || 0,
          pdlrg2Kirim: Number(pdlrg2Kirim) || 0,
          pdlrg2Terima: Number(pdlrg2Terima) || 0,
          tatajabar1Kirim: Number(tatajabar1Kirim) || 0,
          tatajabar1Terima: Number(tatajabar1Terima) || 0,
          tatajabar2Kirim: Number(tatajabar2Kirim) || 0,
          tatajabar2Terima: Number(tatajabar2Terima) || 0,
          lineIndustriKirim: Number(lineIndustriKirim) || 0,
          lineIndustriTerima: Number(lineIndustriTerima) || 0,
          pupukKujangKirim: Number(pupukKujangKirim) || 0,
          pupukKujangTerima: Number(pupukKujangTerima) || 0,
          dateAdded: editingData ? (editingData as TransmissionRecord).dateAdded : new Date().toISOString(),
        };

        if (editingData) {
          onUpdateTransmissionData && await onUpdateTransmissionData(record);
        } else {
          onAddTransmissionData && await onAddTransmissionData(record);
        }
      }
      
      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Error saving data:", err);
      let errorMsg = "Gagal menyimpan data ke cloud database.";
      try {
        const parsed = JSON.parse(err.message);
        if (parsed && parsed.error) {
          errorMsg = `Gagal menyimpan: ${parsed.error}`;
        }
      } catch (e) {
        if (err instanceof Error) {
          errorMsg = `Gagal menyimpan: ${err.message}`;
        }
      }
      setSaveError(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    const tabName = activeTab === 'revenue' 
      ? 'pendapatan' 
      : activeTab === 'production' 
        ? 'produksi' 
        : activeTab === 'ps_terjual' 
          ? 'PS Terjual' 
          : 'Transmisi PHT';
    setDeleteConfirm({ isOpen: true, id, tabName });
  };

  const confirmDelete = () => {
    if (deleteConfirm.id) {
      if (activeTab === 'revenue') {
        onDeleteData(deleteConfirm.id);
      } else if (activeTab === 'production') {
        onDeleteProductionData(deleteConfirm.id);
      } else if (activeTab === 'ps_terjual') {
        onDeletePsData(deleteConfirm.id);
      } else {
        onDeleteTransmissionData && onDeleteTransmissionData(deleteConfirm.id);
      }
    }
    setDeleteConfirm({ isOpen: false, id: null, tabName: '' });
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
        new Intl.NumberFormat('id-ID').format(
          row.ps !== undefined && row.ps !== null 
            ? row.ps 
            : (row.plta + row.miniHydro) - (row.pln || 0)
        ),
      ]);

      autoTable(doc, {
        startY: 30,
        head: head,
        body: body,
      });
      doc.save('data_produksi.pdf');
      
    } else if (activeTab === 'ps_terjual') {
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
    } else {
      const docLandscape = new jsPDF({ orientation: 'landscape' });
      docLandscape.setFontSize(14);
      docLandscape.text('Laporan Detail Transmisi Penghantar (PHT) PLN - 2026', 14, 18);
      
      const head = [[
        'Periode',
        'Curug Kirim', 'Curug Terima',
        'PDLRG 1 Kirim', 'PDLRG 1 Terima',
        'PDLRG 2 Kirim', 'PDLRG 2 Terima',
        'Tata Jabar 1 Kirim', 'Tata Jabar 1 Terima',
        'Tata Jabar 2 Kirim', 'Tata Jabar 2 Terima',
        'Line Ind. Kirim', 'Line Ind. Terima',
        'Pupuk Kujang Kirim', 'Pupuk Kujang Terima',
        'Total Kirim', 'Total Terima'
      ]];
      const body = filteredTransmissionData.map(row => [
        `${row.month} ${row.year}`,
        new Intl.NumberFormat('id-ID').format(row.curugKirim), new Intl.NumberFormat('id-ID').format(row.curugTerima),
        new Intl.NumberFormat('id-ID').format(row.pdlrg1Kirim), new Intl.NumberFormat('id-ID').format(row.pdlrg1Terima),
        new Intl.NumberFormat('id-ID').format(row.pdlrg2Kirim), new Intl.NumberFormat('id-ID').format(row.pdlrg2Terima),
        new Intl.NumberFormat('id-ID').format(row.tatajabar1Kirim), new Intl.NumberFormat('id-ID').format(row.tatajabar1Terima),
        new Intl.NumberFormat('id-ID').format(row.tatajabar2Kirim), new Intl.NumberFormat('id-ID').format(row.tatajabar2Terima),
        new Intl.NumberFormat('id-ID').format(row.lineIndustriKirim), new Intl.NumberFormat('id-ID').format(row.lineIndustriTerima),
        new Intl.NumberFormat('id-ID').format(row.pupukKujangKirim), new Intl.NumberFormat('id-ID').format(row.pupukKujangTerima),
        new Intl.NumberFormat('id-ID').format(row.curugKirim + row.pdlrg1Kirim + row.pdlrg2Kirim + row.tatajabar1Kirim + row.tatajabar2Kirim + row.lineIndustriKirim + row.pupukKujangKirim),
        new Intl.NumberFormat('id-ID').format(row.curugTerima + row.pdlrg1Terima + row.pdlrg2Terima + row.tatajabar1Terima + row.tatajabar2Terima + row.lineIndustriTerima + row.pupukKujangTerima)
      ]);

      autoTable(docLandscape, {
        startY: 24,
        head: head,
        styles: { fontSize: 7.5 },
        body: body,
      });
      docLandscape.save('data_transmisi_pht.pdf');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap bg-slate-900 border border-slate-800 rounded-lg p-1 sm:w-fit gap-1">
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
        <button
          onClick={() => setActiveTab('transmission')}
          className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'transmission' 
              ? 'bg-indigo-600 text-white shadow-sm' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Transmisi PLN (Detail PHT)
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
                        {new Intl.NumberFormat('id-ID').format(
                          row.ps !== undefined && row.ps !== null 
                            ? row.ps 
                            : (row.plta + row.miniHydro) - (row.pln || 0)
                        )} kWh
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
          ) : activeTab === 'ps_terjual' ? (
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
          ) : (
            <div>
              <div className="bg-slate-800/20 p-4 border-b border-slate-800 flex justify-between items-center">
                <span className="text-sm font-medium text-slate-400">
                  Model Tampilan Unit Transmisi:
                </span>
                <div className="flex bg-slate-900 border border-slate-700 rounded-lg p-0.5 gap-1">
                  <button
                    onClick={() => setTransmissionDisplayUnit('kwh')}
                    className={`px-3 py-1 text-xs font-medium rounded ${
                      transmissionDisplayUnit === 'kwh'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Dalam kWh
                  </button>
                  <button
                    onClick={() => setTransmissionDisplayUnit('rupiah')}
                    className={`px-3 py-1 text-xs font-medium rounded ${
                      transmissionDisplayUnit === 'rupiah'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Setara Rp (Tarif PLN)
                  </button>
                </div>
              </div>
              <table className="w-full text-left">
                <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase font-bold tracking-wider">
                  <tr>
                    <th scope="col" className="px-6 py-4">Periode</th>
                    <th scope="col" className="px-6 py-4 text-right">Total Kirim ({transmissionDisplayUnit === 'kwh' ? 'kWh' : 'Rp'})</th>
                    <th scope="col" className="px-6 py-4 text-right">Total Terima ({transmissionDisplayUnit === 'kwh' ? 'kWh' : 'Rp'})</th>
                    <th scope="col" className="px-6 py-4 text-right">Net PLN ({transmissionDisplayUnit === 'kwh' ? 'kWh' : 'Rp'})</th>
                    <th scope="col" className="px-6 py-4 text-center">Rincian</th>
                    <th scope="col" className="px-6 py-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-slate-300">
                  {filteredTransmissionData.length > 0 ? (
                    filteredTransmissionData.map((row) => {
                      const totalKirim = row.curugKirim + row.pdlrg1Kirim + row.pdlrg2Kirim + row.tatajabar1Kirim + row.tatajabar2Kirim + row.lineIndustriKirim + row.pupukKujangKirim;
                      const totalTerima = row.curugTerima + row.pdlrg1Terima + row.pdlrg2Terima + row.tatajabar1Terima + row.tatajabar2Terima + row.lineIndustriTerima + row.pupukKujangTerima;
                      const netPlnVal = totalKirim - totalTerima;

                      const multiplier = transmissionDisplayUnit === 'rupiah' ? 375 : 1; // standard PLN tariff approximation
                      const formatVal = (val: number) => {
                        if (transmissionDisplayUnit === 'rupiah') {
                          return formatRupiah(val * multiplier);
                        }
                        return `${new Intl.NumberFormat('id-ID').format(val)} kWh`;
                      };

                      const isExpanded = expandedTxRow === row.id;

                      return (
                        <React.Fragment key={row.id}>
                          <tr className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-white font-semibold">
                              {row.month} {row.year}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap font-mono text-right text-indigo-400">
                              {formatVal(totalKirim)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap font-mono text-right text-sky-400">
                              {formatVal(totalTerima)}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap font-mono text-right font-semibold ${netPlnVal >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {formatVal(netPlnVal)}
                            </td>
                            <td className="px-6 py-4 text-center whitespace-nowrap">
                              <button
                                onClick={() => setExpandedTxRow(isExpanded ? null : row.id)}
                                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors border border-slate-700 font-medium"
                              >
                                {isExpanded ? 'Tutup Rincian' : 'Lihat 7 Penghantar'}
                              </button>
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
                          {isExpanded && (
                            <tr className="bg-slate-950 border-b border-slate-800/70">
                              <td colSpan={6} className="px-8 py-5">
                                <h4 className="text-xs uppercase font-extrabold tracking-widest text-slate-400 mb-4 border-b border-slate-800 pb-2 flex justify-between">
                                  <span>Detail Meter Transmisi PHT PLN ({transmissionDisplayUnit === 'kwh' ? 'kWh' : 'Rupiah'})</span>
                                  <span className="text-indigo-400">Periode: {row.month} {row.year}</span>
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                  {[
                                    { name: 'PHT Curug', kirim: row.curugKirim, terima: row.curugTerima },
                                    { name: 'PHT Padalarang 1 (PDLRG 1)', kirim: row.pdlrg1Kirim, terima: row.pdlrg1Terima },
                                    { name: 'PHT Padalarang 2 (PDLRG 2)', kirim: row.pdlrg2Kirim, terima: row.pdlrg2Terima },
                                    { name: 'PHT Tata Jabar 1', kirim: row.tatajabar1Kirim, terima: row.tatajabar1Terima },
                                    { name: 'PHT Tata Jabar 2', kirim: row.tatajabar2Kirim, terima: row.tatajabar2Terima },
                                    { name: 'PHT Line Industri', kirim: row.lineIndustriKirim, terima: row.lineIndustriTerima },
                                    { name: 'PHT Pupuk Kujang', kirim: row.pupukKujangKirim, terima: row.pupukKujangTerima }
                                  ].map((pht, index) => (
                                    <div key={index} className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                                      <p className="text-xs font-bold text-slate-300 mb-2 border-b border-slate-800/50 pb-1">{pht.name}</p>
                                      <div className="flex justify-between text-xs font-mono">
                                        <span className="text-slate-500">Kirim:</span>
                                        <span className="text-indigo-300 font-semibold">{formatVal(pht.kirim)}</span>
                                      </div>
                                      <div className="flex justify-between text-xs font-mono mt-1">
                                        <span className="text-slate-500">Terima:</span>
                                        <span className="text-sky-300 font-semibold">{formatVal(pht.terima)}</span>
                                      </div>
                                      <div className="flex justify-between text-xs font-mono mt-2 pt-1 border-t border-slate-800/40 font-bold text-slate-400">
                                        <span>Selisih:</span>
                                        <span className={pht.kirim - pht.terima >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                                          {formatVal(pht.kirim - pht.terima)}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                  
                                  {/* Totals Box */}
                                  <div className="bg-indigo-950/20 border border-indigo-900/40 p-3 rounded-xl flex flex-col justify-between">
                                    <p className="text-xs font-bold text-indigo-300 mb-2 border-b border-indigo-900/30 pb-1">TOTAL TRANSMISI PHT</p>
                                    <div className="space-y-1">
                                      <div className="flex justify-between text-xs font-mono">
                                        <span className="text-indigo-400">Total Kirim:</span>
                                        <span className="text-indigo-200 font-bold">{formatVal(totalKirim)}</span>
                                      </div>
                                      <div className="flex justify-between text-xs font-mono">
                                        <span className="text-sky-450 text-indigo-455">Total Terima:</span>
                                        <span className="text-sky-200 font-bold">{formatVal(totalTerima)}</span>
                                      </div>
                                    </div>
                                    <div className="flex justify-between text-xs font-mono mt-2 pt-1 border-t border-indigo-900/30 font-extrabold text-white">
                                      <span>Net PLN:</span>
                                      <span className={netPlnVal >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                                        {formatVal(netPlnVal)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
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
            </div>
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
                          {editingData ? `Edit Data ${activeTab === 'revenue' ? 'Pendapatan' : activeTab === 'production' ? 'Produksi' : activeTab === 'ps_terjual' ? 'PS Terjual & Penugasan' : 'Transmisi PHT'}` : `Tambah Data ${activeTab === 'revenue' ? 'Pendapatan' : activeTab === 'production' ? 'Produksi' : activeTab === 'ps_terjual' ? 'PS Terjual & Penugasan' : 'Transmisi PHT'}`}
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
                              <div>
                                <label htmlFor="ps" className="block text-sm font-medium text-slate-400 mb-1">
                                  Produksi PS (kWh)
                                </label>
                                <input
                                  type="number"
                                  id="ps"
                                  value={ps}
                                  onChange={(e) => setPs(e.target.value)}
                                  placeholder="Contoh: 52182770"
                                  className="w-full px-3 py-2 border border-slate-700 rounded-lg bg-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-slate-500"
                                  required
                                  min="0"
                                />
                              </div>
                            </>
                          ) : activeTab === 'ps_terjual' ? (
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
                          ) : (
                            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                              <p className="text-xs font-semibold text-indigo-400 border-b border-indigo-950 pb-1 mb-2">Penghantar Transmisi Detail PHT (kWh)</p>
                              
                              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-800/60">
                                <h4 className="col-span-2 text-xs font-bold text-slate-300">1. PHT Curug</h4>
                                <div>
                                  <label className="text-xs text-slate-500">Kirim</label>
                                  <input type="number" step="any" value={curugKirim} onChange={(e) => setCurugKirim(e.target.value)} className="w-full px-2 py-1 border border-slate-700 rounded bg-slate-800 text-slate-200 text-sm" placeholder="0" />
                                </div>
                                <div>
                                  <label className="text-xs text-slate-500">Terima</label>
                                  <input type="number" step="any" value={curugTerima} onChange={(e) => setCurugTerima(e.target.value)} className="w-full px-2 py-1 border border-slate-700 rounded bg-slate-800 text-slate-200 text-sm" placeholder="0" />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-800/60">
                                <h4 className="col-span-2 text-xs font-bold text-slate-300">2. PHT Padalarang 1 (PDLRG 1)</h4>
                                <div>
                                  <label className="text-xs text-slate-500">Kirim</label>
                                  <input type="number" step="any" value={pdlrg1Kirim} onChange={(e) => setPdlrg1Kirim(e.target.value)} className="w-full px-2 py-1 border border-slate-700 rounded bg-slate-800 text-slate-200 text-sm" placeholder="0" />
                                </div>
                                <div>
                                  <label className="text-xs text-slate-500">Terima</label>
                                  <input type="number" step="any" value={pdlrg1Terima} onChange={(e) => setPdlrg1Terima(e.target.value)} className="w-full px-2 py-1 border border-slate-700 rounded bg-slate-800 text-slate-200 text-sm" placeholder="0" />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-800/60">
                                <h4 className="col-span-2 text-xs font-bold text-slate-300">3. PHT Padalarang 2 (PDLRG 2)</h4>
                                <div>
                                  <label className="text-xs text-slate-500">Kirim</label>
                                  <input type="number" step="any" value={pdlrg2Kirim} onChange={(e) => setPdlrg2Kirim(e.target.value)} className="w-full px-2 py-1 border border-slate-700 rounded bg-slate-800 text-slate-200 text-sm" placeholder="0" />
                                </div>
                                <div>
                                  <label className="text-xs text-slate-500">Terima</label>
                                  <input type="number" step="any" value={pdlrg2Terima} onChange={(e) => setPdlrg2Terima(e.target.value)} className="w-full px-2 py-1 border border-slate-700 rounded bg-slate-800 text-slate-200 text-sm" placeholder="0" />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-800/60">
                                <h4 className="col-span-2 text-xs font-bold text-slate-300">4. PHT Tata Jabar 1</h4>
                                <div>
                                  <label className="text-xs text-slate-500">Kirim</label>
                                  <input type="number" step="any" value={tatajabar1Kirim} onChange={(e) => setTatajabar1Kirim(e.target.value)} className="w-full px-2 py-1 border border-slate-700 rounded bg-slate-800 text-slate-200 text-sm" placeholder="0" />
                                </div>
                                <div>
                                  <label className="text-xs text-slate-500">Terima</label>
                                  <input type="number" step="any" value={tatajabar1Terima} onChange={(e) => setTatajabar1Terima(e.target.value)} className="w-full px-2 py-1 border border-slate-700 rounded bg-slate-800 text-slate-200 text-sm" placeholder="0" />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-800/60">
                                <h4 className="col-span-2 text-xs font-bold text-slate-300">5. PHT Tata Jabar 2</h4>
                                <div>
                                  <label className="text-xs text-slate-500">Kirim</label>
                                  <input type="number" step="any" value={tatajabar2Kirim} onChange={(e) => setTatajabar2Kirim(e.target.value)} className="w-full px-2 py-1 border border-slate-700 rounded bg-slate-800 text-slate-200 text-sm" placeholder="0" />
                                </div>
                                <div>
                                  <label className="text-xs text-slate-500">Terima</label>
                                  <input type="number" step="any" value={tatajabar2Terima} onChange={(e) => setTatajabar2Terima(e.target.value)} className="w-full px-2 py-1 border border-slate-700 rounded bg-slate-800 text-slate-200 text-sm" placeholder="0" />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-800/60">
                                <h4 className="col-span-2 text-xs font-bold text-slate-300">6. PHT Line Industri</h4>
                                <div>
                                  <label className="text-xs text-slate-500">Kirim</label>
                                  <input type="number" step="any" value={lineIndustriKirim} onChange={(e) => setLineIndustriKirim(e.target.value)} className="w-full px-2 py-1 border border-slate-700 rounded bg-slate-800 text-slate-200 text-sm" placeholder="0" />
                                </div>
                                <div>
                                  <label className="text-xs text-slate-500">Terima</label>
                                  <input type="number" step="any" value={lineIndustriTerima} onChange={(e) => setLineIndustriTerima(e.target.value)} className="w-full px-2 py-1 border border-slate-700 rounded bg-slate-800 text-slate-200 text-sm" placeholder="0" />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <h4 className="col-span-2 text-xs font-bold text-slate-300">7. PHT Pupuk Kujang</h4>
                                <div>
                                  <label className="text-xs text-slate-500">Kirim</label>
                                  <input type="number" step="any" value={pupukKujangKirim} onChange={(e) => setPupukKujangKirim(e.target.value)} className="w-full px-2 py-1 border border-slate-700 rounded bg-slate-800 text-slate-200 text-sm" placeholder="0" />
                                </div>
                                <div>
                                  <label className="text-xs text-slate-500">Terima</label>
                                  <input type="number" step="any" value={pupukKujangTerima} onChange={(e) => setPupukKujangTerima(e.target.value)} className="w-full px-2 py-1 border border-slate-700 rounded bg-slate-800 text-slate-200 text-sm" placeholder="0" />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  {saveError && (
                    <div className="mx-4 sm:mx-6 mt-3 p-3 bg-rose-950/50 border border-rose-800/50 rounded-lg text-rose-300 text-xs flex items-start gap-2">
                      <span className="font-bold flex-shrink-0 text-rose-400">⚠️ Error:</span>
                      <span className="break-all">{saveError}</span>
                    </div>
                  )}

                  <div className="bg-slate-800/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-slate-800 mt-4">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="w-full inline-flex justify-center items-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Menyimpan...
                        </>
                      ) : (
                        'Simpan Data'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      disabled={isSaving}
                      className="mt-3 w-full inline-flex justify-center rounded-lg border border-slate-700 shadow-sm px-4 py-2 bg-slate-800 text-base font-medium text-slate-300 hover:bg-slate-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Modal Konfirmasi Hapus */}
      <AnimatePresence>
        {deleteConfirm.isOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="delete-modal-title" role="dialog" aria-modal="true">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity z-0" 
                aria-hidden="true" 
                onClick={() => setDeleteConfirm({ isOpen: false, id: null, tabName: '' })}
              />

              {/* Center modal trick */}
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative z-10 inline-block align-middle bg-slate-900 border border-slate-700 rounded-2xl text-left overflow-hidden shadow-2xl sm:my-8 sm:max-w-md w-full"
              >
                <div className="bg-slate-900 px-6 pt-6 pb-4 sm:pb-6">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-rose-500/10 sm:mx-0 sm:h-10 sm:w-10">
                      <Trash2 className="h-6 w-6 text-rose-500" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg leading-6 font-bold text-white mb-2" id="delete-modal-title">
                        Konfirmasi Hapus Data
                      </h3>
                      <p className="text-sm text-slate-300">
                        Apakah Anda yakin ingin menghapus data <span className="font-semibold text-rose-400 capitalize">{deleteConfirm.tabName}</span> ini? Tindakan ini tidak dapat dibatalkan.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-800/40 px-6 py-4 sm:flex sm:flex-row-reverse border-t border-slate-800 gap-3">
                  <button
                    type="button"
                    onClick={confirmDelete}
                    className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2.5 bg-rose-600 text-base font-semibold text-white hover:bg-rose-500 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm transition-colors cursor-pointer"
                  >
                    Hapus Data
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm({ isOpen: false, id: null, tabName: '' })}
                    className="mt-3 w-full inline-flex justify-center rounded-lg border border-slate-700 shadow-sm px-4 py-2.5 bg-slate-800 text-base font-semibold text-slate-300 hover:bg-slate-700 hover:text-white focus:outline-none sm:mt-0 sm:w-auto sm:text-sm transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
