import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Filter, Download, Lock, Unlock, Zap, Target, TrendingUp, BarChart2 } from 'lucide-react';
import { RevenueRecord, ProductionRecord, PSTerjualRecord, TransmissionRecord, MONTHS, DEFAULT_CATEGORIES } from '../types';
import { formatRupiah, generateId } from '../lib/utils';
import { getRkapTarget, updateRkapTarget, deleteRkapTarget, resetRkapTargetsToDefault } from '../data/rkapTargets';
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
  const [activeTab, setActiveTab] = useState<'revenue' | 'production' | 'proyeksi' | 'ps_terjual' | 'transmission'>('revenue');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Password Protection States
  const [isAuthorized, setIsAuthorized] = useState<boolean>(() => {
    return sessionStorage.getItem('isAuthorized_usaha26PLTA') === 'true';
  });
  const [passwordModal, setPasswordModal] = useState<{
    isOpen: boolean;
    passwordInput: string;
    error: string;
    pendingAction: (() => void) | null;
  }>({
    isOpen: false,
    passwordInput: '',
    error: '',
    pendingAction: null
  });

  const checkAuthorization = (action: () => void) => {
    if (isAuthorized) {
      action();
    } else {
      setPasswordModal({
        isOpen: true,
        passwordInput: '',
        error: '',
        pendingAction: action
      });
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordModal.passwordInput === 'usaha26PLTA') {
      setIsAuthorized(true);
      sessionStorage.setItem('isAuthorized_usaha26PLTA', 'true');
      const action = passwordModal.pendingAction;
      setPasswordModal({
        isOpen: false,
        passwordInput: '',
        error: '',
        pendingAction: null
      });
      if (action) {
        action();
      }
    } else {
      setPasswordModal(prev => ({
        ...prev,
        error: 'Password salah! Silakan coba lagi.'
      }));
    }
  };

  const handleLock = () => {
    setIsAuthorized(false);
    sessionStorage.removeItem('isAuthorized_usaha26PLTA');
  };

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
  
  // Success Toast States
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Target & Proyeksi Edit & Delete States
  const [, setRkapTargetVersion] = useState(0);

  React.useEffect(() => {
    const handleTargetsUpdated = () => {
      setRkapTargetVersion(v => v + 1);
    };
    window.addEventListener('rkap-targets-updated', handleTargetsUpdated);
    return () => {
      window.removeEventListener('rkap-targets-updated', handleTargetsUpdated);
    };
  }, []);

  const [proyeksiEditModal, setProyeksiEditModal] = useState<{
    isOpen: boolean;
    month: string;
    targetProductionGwh: string;
    proyeksiProductionGwh: string;
    targetBrutoRp: string;
    proyeksiBrutoRp: string;
  }>({
    isOpen: false,
    month: '',
    targetProductionGwh: '',
    proyeksiProductionGwh: '',
    targetBrutoRp: '',
    proyeksiBrutoRp: ''
  });

  const [proyeksiDeleteModal, setProyeksiDeleteModal] = useState<{
    isOpen: boolean;
    month: string;
  }>({
    isOpen: false,
    month: ''
  });

  const handleOpenEditProyeksiModal = (selectedMonth: string) => {
    const targetObj = getRkapTarget(selectedMonth);
    setProyeksiEditModal({
      isOpen: true,
      month: selectedMonth,
      targetProductionGwh: ((targetObj?.production || 0) / 1000000).toString(),
      proyeksiProductionGwh: ((targetObj?.proyeksiProduction || 0) / 1000000).toString(),
      targetBrutoRp: (targetObj?.bruto || 0).toString(),
      proyeksiBrutoRp: (targetObj?.proyeksi || 0).toString()
    });
  };

  const handleSaveProyeksi = (e: React.FormEvent) => {
    e.preventDefault();
    const prodGwh = parseFloat(proyeksiEditModal.targetProductionGwh) || 0;
    const proyProdGwh = parseFloat(proyeksiEditModal.proyeksiProductionGwh) || 0;
    const targetBruto = parseFloat(proyeksiEditModal.targetBrutoRp) || 0;
    const proyBruto = parseFloat(proyeksiEditModal.proyeksiBrutoRp) || 0;

    updateRkapTarget(proyeksiEditModal.month, {
      production: Math.round(prodGwh * 1000000),
      proyeksiProduction: Math.round(proyProdGwh * 1000000),
      bruto: targetBruto,
      proyeksi: proyBruto
    });

    setProyeksiEditModal(prev => ({ ...prev, isOpen: false }));
    setSuccessMessage(`Target & Proyeksi ${proyeksiEditModal.month} 2026 berhasil diperbarui.`);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 4000);
  };

  const handleOpenDeleteProyeksiModal = (selectedMonth: string) => {
    setProyeksiDeleteModal({
      isOpen: true,
      month: selectedMonth
    });
  };

  const handleConfirmDeleteProyeksi = () => {
    if (proyeksiDeleteModal.month) {
      deleteRkapTarget(proyeksiDeleteModal.month);
      setProyeksiDeleteModal({ isOpen: false, month: '' });
      setSuccessMessage(`Target & Proyeksi ${proyeksiDeleteModal.month} 2026 berhasil dihapus / dikosongkan.`);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 4000);
    }
  };

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

  // Multi-row States for adding multiple records simultaneously
  const [revenueRows, setRevenueRows] = useState<{ category: string; amount: string; notes: string }[]>([
    { category: categories[0] || DEFAULT_CATEGORIES[0], amount: '', notes: '' }
  ]);

  const [productionRows, setProductionRows] = useState<{ plta: string; miniHydro: string; pln: string; ps: string }[]>([
    { plta: '', miniHydro: '', pln: '', ps: '' }
  ]);

  const [psRows, setPsRows] = useState<{ category: 'INDUSTRI / PERUSAHAAN' | 'PERUMAHAN & WARUNG'; customerName: string; kwhValue: string; rupiahValue: string }[]>([
    { category: 'INDUSTRI / PERUSAHAAN', customerName: '', kwhValue: '', rupiahValue: '' }
  ]);

  const [transmissionRows, setTransmissionRows] = useState<{
    curugKirim: string; curugTerima: string;
    pdlrg1Kirim: string; pdlrg1Terima: string;
    pdlrg2Kirim: string; pdlrg2Terima: string;
    tatajabar1Kirim: string; tatajabar1Terima: string;
    tatajabar2Kirim: string; tatajabar2Terima: string;
    lineIndustriKirim: string; lineIndustriTerima: string;
    pupukKujangKirim: string; pupukKujangTerima: string;
  }[]>([
    {
      curugKirim: '', curugTerima: '',
      pdlrg1Kirim: '', pdlrg1Terima: '',
      pdlrg2Kirim: '', pdlrg2Terima: '',
      tatajabar1Kirim: '', tatajabar1Terima: '',
      tatajabar2Kirim: '', tatajabar2Terima: '',
      lineIndustriKirim: '', lineIndustriTerima: '',
      pupukKujangKirim: '', pupukKujangTerima: '',
    }
  ]);

  const [transmissionDisplayUnit, setTransmissionDisplayUnit] = useState<'kwh' | 'rupiah'>('kwh');

  const filteredData = React.useMemo(() => {
    const existing = data || [];
    const map = new Map<string, RevenueRecord>();
    existing.forEach(item => {
      map.set(`${item.year}-${item.month}-${item.category}`, item);
    });

    const categoriesToUse = categories.length > 0 ? categories : DEFAULT_CATEGORIES;
    MONTHS.forEach(m => {
      categoriesToUse.forEach(cat => {
        const key = `2026-${m}-${cat}`;
        if (!map.has(key)) {
          map.set(key, {
            id: `rev_2026_${m}_${cat.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`,
            month: m,
            year: 2026,
            category: cat,
            amount: 0,
            notes: '-',
            dateAdded: new Date().toISOString()
          });
        }
      });
    });

    return Array.from(map.values()).filter(item => 
      item.month.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.year.toString().includes(searchTerm)
    ).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return MONTHS.indexOf(a.month) - MONTHS.indexOf(b.month);
    });
  }, [data, categories, searchTerm]);

  const filteredProductionData = React.useMemo(() => {
    const existing = productionData || [];
    const map = new Map<string, ProductionRecord>();
    existing.forEach(item => {
      map.set(`${item.year}-${item.month}`, item);
    });

    MONTHS.forEach(m => {
      const key = `2026-${m}`;
      if (!map.has(key)) {
        map.set(key, {
          id: `prod_2026_${m}`,
          month: m,
          year: 2026,
          plta: 0,
          miniHydro: 0,
          pln: 0,
          ps: 0,
          dateAdded: new Date().toISOString()
        });
      }
    });

    return Array.from(map.values()).filter(item => 
      item.month.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.year.toString().includes(searchTerm)
    ).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return MONTHS.indexOf(a.month) - MONTHS.indexOf(b.month);
    });
  }, [productionData, searchTerm]);

  const filteredPsData = React.useMemo(() => {
    const existing = psData || [];
    const map = new Map<string, PSTerjualRecord>();
    
    // Deduplicate existing records, prioritizing non-zero records and ignoring zero-value items
    existing.forEach(item => {
      const isZero = (item.kwhValue || 0) === 0 && (item.rupiahValue || 0) === 0;
      if (isZero) return;

      const normCustomer = item.customerName.trim().toUpperCase();
      const normMonth = item.month.trim().toLowerCase();
      const key = `${item.year}-${normMonth}-${normCustomer}`;

      const prev = map.get(key);
      if (!prev) {
        map.set(key, item);
      } else {
        const prevVal = (prev.kwhValue || 0) + (prev.rupiahValue || 0);
        const currVal = (item.kwhValue || 0) + (item.rupiahValue || 0);
        if (currVal > prevVal) {
          map.set(key, item);
        }
      }
    });

    return Array.from(map.values()).filter(item => 
      item.month.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.year.toString().includes(searchTerm)
    ).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      const mIndexA = MONTHS.indexOf(a.month);
      const mIndexB = MONTHS.indexOf(b.month);
      if (mIndexA !== mIndexB) return mIndexA - mIndexB;
      if (a.category !== b.category) return a.category.localeCompare(b.category);
      return a.customerName.trim().localeCompare(b.customerName.trim());
    });
  }, [psData, searchTerm]);

  // Programmatic hierarchical grouping of PS Terjual & Penugasan data
  const groupedPsData = React.useMemo(() => {
    const groups: { [key: string]: { year: number; month: string; items: PSTerjualRecord[] } } = {};
    
    filteredPsData.forEach(item => {
      const key = `${item.year}-${item.month}`;
      if (!groups[key]) {
        groups[key] = {
          year: item.year,
          month: item.month,
          items: []
        };
      }
      groups[key].items.push(item);
    });
    
    // Sort period keys (Year ascending, Month index ascending so periods are shown chronologically from Jan 2026 onwards)
    const sortedPeriodKeys = Object.keys(groups).sort((keyA, keyB) => {
      const gA = groups[keyA];
      const gB = groups[keyB];
      if (gA.year !== gB.year) return gA.year - gB.year;
      return MONTHS.indexOf(gA.month) - MONTHS.indexOf(gB.month);
    });
    
    return sortedPeriodKeys.map(key => {
      const group = groups[key];
      
      // Group items inside this period by Category
      const categoryGroups: { [cat: string]: PSTerjualRecord[] } = {};
      group.items.forEach(item => {
        if (!categoryGroups[item.category]) {
          categoryGroups[item.category] = [];
        }
        categoryGroups[item.category].push(item);
      });
      
      // Sort categories (e.g. INDUSTRI / PERUSAHAAN first, then PERUMAHAN & WARUNG)
      const sortedCats = Object.keys(categoryGroups).sort((a, b) => a.localeCompare(b));
      
      const categoriesList = sortedCats.map(catName => {
        const items = categoryGroups[catName].sort((a, b) => a.customerName.localeCompare(b.customerName));
        const subtotalKwh = items.reduce((sum, item) => sum + (item.kwhValue || 0), 0);
        const subtotalRupiah = items.reduce((sum, item) => sum + (item.rupiahValue || 0), 0);
        
        return {
          categoryName: catName,
          items,
          subtotalKwh,
          subtotalRupiah
        };
      });
      
      const totalKwh = categoriesList.reduce((sum, cat) => sum + cat.subtotalKwh, 0);
      const totalRupiah = categoriesList.reduce((sum, cat) => sum + cat.subtotalRupiah, 0);
      
      return {
        key,
        year: group.year,
        month: group.month,
        categories: categoriesList,
        totalKwh,
        totalRupiah
      };
    });
  }, [filteredPsData]);

  const filteredTransmissionData = React.useMemo(() => {
    const existing = transmissionData || [];
    const map = new Map<string, TransmissionRecord>();
    existing.forEach(item => {
      map.set(`${item.year}-${item.month}`, item);
    });

    MONTHS.forEach(m => {
      const key = `2026-${m}`;
      if (!map.has(key)) {
        map.set(key, {
          id: `tx_2026_${m}`,
          month: m,
          year: 2026,
          curugKirim: 0, curugTerima: 0,
          pdlrg1Kirim: 0, pdlrg1Terima: 0,
          pdlrg2Kirim: 0, pdlrg2Terima: 0,
          tatajabar1Kirim: 0, tatajabar1Terima: 0,
          tatajabar2Kirim: 0, tatajabar2Terima: 0,
          lineIndustriKirim: 0, lineIndustriTerima: 0,
          pupukKujangKirim: 0, pupukKujangTerima: 0,
          dateAdded: new Date().toISOString()
        });
      }
    });

    return Array.from(map.values()).filter(item => 
      item.month.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.year.toString().includes(searchTerm)
    ).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return MONTHS.indexOf(a.month) - MONTHS.indexOf(b.month);
    });
  }, [transmissionData, searchTerm]);

  const openAddModal = () => {
    setEditingData(null);
    setSaveError(null);
    setIsSaving(false);
    setMonth(MONTHS[0]);
    setYear(new Date().getFullYear());
    
    // Reset multi-row states to a single clean default row
    setRevenueRows([{ category: categories[0] || DEFAULT_CATEGORIES[0], amount: '', notes: '' }]);
    setProductionRows([{ plta: '', miniHydro: '', pln: '', ps: '' }]);
    setPsRows([{ category: 'INDUSTRI / PERUSAHAAN', customerName: '', kwhValue: '', rupiahValue: '' }]);
    setTransmissionRows([{
      curugKirim: '', curugTerima: '',
      pdlrg1Kirim: '', pdlrg1Terima: '',
      pdlrg2Kirim: '', pdlrg2Terima: '',
      tatajabar1Kirim: '', tatajabar1Terima: '',
      tatajabar2Kirim: '', tatajabar2Terima: '',
      lineIndustriKirim: '', lineIndustriTerima: '',
      pupukKujangKirim: '', pupukKujangTerima: '',
    }]);

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
      setRevenueRows([{
        category: revenueItem.category,
        amount: revenueItem.amount.toString(),
        notes: revenueItem.notes || ''
      }]);
    } else if (activeTab === 'production') {
      const prodItem = item as ProductionRecord;
      const defaultPs = prodItem.ps !== undefined && prodItem.ps !== null 
        ? prodItem.ps 
        : (prodItem.plta + prodItem.miniHydro - (prodItem.pln || 0));
      setProductionRows([{
        plta: prodItem.plta.toString(),
        miniHydro: prodItem.miniHydro.toString(),
        pln: (prodItem.pln !== undefined && prodItem.pln !== null) ? prodItem.pln.toString() : '',
        ps: defaultPs.toString()
      }]);
    } else if (activeTab === 'ps_terjual') {
      const psItem = item as PSTerjualRecord;
      setPsRows([{
        category: psItem.category,
        customerName: psItem.customerName,
        kwhValue: psItem.kwhValue.toString(),
        rupiahValue: psItem.rupiahValue.toString()
      }]);
    } else {
      const txItem = item as TransmissionRecord;
      setTransmissionRows([{
        curugKirim: txItem.curugKirim.toString(),
        curugTerima: txItem.curugTerima.toString(),
        pdlrg1Kirim: txItem.pdlrg1Kirim.toString(),
        pdlrg1Terima: txItem.pdlrg1Terima.toString(),
        pdlrg2Kirim: txItem.pdlrg2Kirim.toString(),
        pdlrg2Terima: txItem.pdlrg2Terima.toString(),
        tatajabar1Kirim: txItem.tatajabar1Kirim.toString(),
        tatajabar1Terima: txItem.tatajabar1Terima.toString(),
        tatajabar2Kirim: txItem.tatajabar2Kirim.toString(),
        tatajabar2Terima: txItem.tatajabar2Terima.toString(),
        lineIndustriKirim: txItem.lineIndustriKirim.toString(),
        lineIndustriTerima: txItem.lineIndustriTerima.toString(),
        pupukKujangKirim: txItem.pupukKujangKirim.toString(),
        pupukKujangTerima: txItem.pupukKujangTerima.toString()
      }]);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    
    try {
      if (activeTab === 'revenue') {
        // Validate all rows
        for (const row of revenueRows) {
          if (row.amount === '' || isNaN(Number(row.amount))) {
            alert("Mohon isi jumlah pendapatan dengan angka yang valid.");
            setIsSaving(false);
            return;
          }
        }
        
        // Save each row sequentially
        for (const row of revenueRows) {
          const record: RevenueRecord = {
            id: editingData ? editingData.id : generateId(),
            month,
            year: Number(year),
            category: row.category || categories[0] || DEFAULT_CATEGORIES[0],
            amount: Number(row.amount),
            notes: row.notes,
            dateAdded: editingData ? editingData.dateAdded : new Date().toISOString(),
          };

          if (editingData) {
            await onUpdateData(record);
          } else {
            await onAddData(record);
          }
        }
        setSuccessMessage(`${revenueRows.length} data pendapatan berhasil disimpan ke cloud database.`);
      } else if (activeTab === 'production') {
        // Validate all rows
        for (const row of productionRows) {
          if (row.plta === '' || isNaN(Number(row.plta))) {
            alert("Mohon isi produksi PLTA dengan angka yang valid.");
            setIsSaving(false);
            return;
          }
          if (row.miniHydro === '' || isNaN(Number(row.miniHydro))) {
            alert("Mohon isi produksi Mini Hydro dengan angka yang valid.");
            setIsSaving(false);
            return;
          }
          if (row.pln === '' || isNaN(Number(row.pln))) {
            alert("Mohon isi produksi PLN dengan angka yang valid.");
            setIsSaving(false);
            return;
          }
          if (row.ps === '' || isNaN(Number(row.ps))) {
            alert("Mohon isi produksi PS dengan angka yang valid.");
            setIsSaving(false);
            return;
          }
        }

        // Save each row sequentially
        for (const row of productionRows) {
          const record: ProductionRecord = {
            id: editingData ? editingData.id : generateId(),
            month,
            year: Number(year),
            plta: Number(row.plta),
            miniHydro: Number(row.miniHydro),
            pln: Number(row.pln),
            ps: Number(row.ps),
            dateAdded: editingData ? editingData.dateAdded : new Date().toISOString(),
          };

          if (editingData) {
            await onUpdateProductionData(record);
          } else {
            await onAddProductionData(record);
          }
        }
        setSuccessMessage(`${productionRows.length} data produksi berhasil disimpan ke cloud database.`);
      } else if (activeTab === 'ps_terjual') {
        // Validate all rows
        for (const row of psRows) {
          if (!row.customerName.trim()) {
            alert("Mohon isi nama perusahaan atau pelanggan.");
            setIsSaving(false);
            return;
          }
          if (row.kwhValue === '' || isNaN(Number(row.kwhValue))) {
            alert("Mohon isi jumlah kWh dengan angka yang valid.");
            setIsSaving(false);
            return;
          }
          if (row.rupiahValue === '' || isNaN(Number(row.rupiahValue))) {
            alert("Mohon isi jumlah Rupiah dengan angka yang valid.");
            setIsSaving(false);
            return;
          }
        }

        // Save each row sequentially
        for (const row of psRows) {
          const record: PSTerjualRecord = {
            id: editingData ? editingData.id : generateId(),
            month,
            year: Number(year),
            category: row.category,
            customerName: row.customerName.trim(),
            kwhValue: Number(row.kwhValue),
            rupiahValue: Number(row.rupiahValue),
            dateAdded: editingData ? (editingData as PSTerjualRecord).dateAdded : new Date().toISOString(),
          };

          if (editingData) {
            await onUpdatePsData(record);
          } else {
            await onAddPsData(record);
          }
        }
        setSuccessMessage(`${psRows.length} data PS Terjual berhasil disimpan ke cloud database.`);
      } else {
        // Transmission validations
        for (const row of transmissionRows) {
          // No complex validation required for transmission since fields have defaults
        }

        // Save each row sequentially
        for (const row of transmissionRows) {
          const record: TransmissionRecord = {
            id: editingData ? editingData.id : generateId(),
            month,
            year: Number(year),
            curugKirim: Number(row.curugKirim) || 0,
            curugTerima: Number(row.curugTerima) || 0,
            pdlrg1Kirim: Number(row.pdlrg1Kirim) || 0,
            pdlrg1Terima: Number(row.pdlrg1Terima) || 0,
            pdlrg2Kirim: Number(row.pdlrg2Kirim) || 0,
            pdlrg2Terima: Number(row.pdlrg2Terima) || 0,
            tatajabar1Kirim: Number(row.tatajabar1Kirim) || 0,
            tatajabar1Terima: Number(row.tatajabar1Terima) || 0,
            tatajabar2Kirim: Number(row.tatajabar2Kirim) || 0,
            tatajabar2Terima: Number(row.tatajabar2Terima) || 0,
            lineIndustriKirim: Number(row.lineIndustriKirim) || 0,
            lineIndustriTerima: Number(row.lineIndustriTerima) || 0,
            pupukKujangKirim: Number(row.pupukKujangKirim) || 0,
            pupukKujangTerima: Number(row.pupukKujangTerima) || 0,
            dateAdded: editingData ? (editingData as TransmissionRecord).dateAdded : new Date().toISOString(),
          };

          if (editingData) {
            onUpdateTransmissionData && await onUpdateTransmissionData(record);
          } else {
            onAddTransmissionData && await onAddTransmissionData(record);
          }
        }
        setSuccessMessage(`${transmissionRows.length} data penugasan transmisi berhasil disimpan ke cloud database.`);
      }
      
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 4000);
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
    const targetYear = 2026;
    const formatNum = (num: number) => new Intl.NumberFormat('id-ID').format(num || 0);

    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');

    if (activeTab === 'revenue') {
      doc.text(`Laporan Data Pendapatan (${targetYear})`, 14, 20);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID')}`, 14, 26);

      const head = [['Periode', 'Kategori Sumber', 'Pendapatan (Rp)', 'Catatan']];
      
      const revenueSorted = [...filteredData].sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return MONTHS.indexOf(a.month) - MONTHS.indexOf(b.month);
      });

      const totalAmount = revenueSorted.reduce((sum, row) => sum + (row.amount || 0), 0);

      const body = revenueSorted.map(row => [
        `${row.month} ${row.year}`,
        row.category,
        formatRupiah(row.amount),
        row.notes || '-'
      ]);

      autoTable(doc, {
        startY: 32,
        head: head,
        body: body,
        foot: [[
          { content: 'TOTAL PENDAPATAN', colSpan: 2, styles: { halign: 'right', fontStyle: 'bold' } },
          { content: formatRupiah(totalAmount), styles: { fontStyle: 'bold' } },
          { content: '', styles: {} }
        ]],
        footStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255] },
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' }
      });

      doc.save(`Laporan_Pendapatan_${targetYear}.pdf`);
      
    } else if (activeTab === 'production') {
      doc.text(`Laporan Data Produksi Energi (${targetYear})`, 14, 20);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID')}`, 14, 26);

      const head = [['Periode', 'PLTA (kWh)', 'Mini Hydro (kWh)', 'Realisasi Total (GWh)', 'PLN (kWh)', 'PS (kWh)']];
      
      let sumPlta = 0;
      let sumMini = 0;
      let sumRealisasiGwh = 0;
      let sumPln = 0;
      let sumPs = 0;

      const productionSorted = [...filteredProductionData].sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return MONTHS.indexOf(a.month) - MONTHS.indexOf(b.month);
      });

      const body = productionSorted.map(row => {
        const rPlta = row.plta || 0;
        const rMini = row.miniHydro || 0;
        const rPln = row.pln || 0;
        const rPs = row.ps !== undefined && row.ps !== null ? row.ps : Math.max(0, (rPlta + rMini) - rPln);
        const realGwh = (rPlta + rMini) / 1000000;

        sumPlta += rPlta;
        sumMini += rMini;
        sumRealisasiGwh += realGwh;
        sumPln += rPln;
        sumPs += rPs;

        return [
          `${row.month} ${row.year}`,
          formatNum(rPlta),
          formatNum(rMini),
          realGwh > 0 ? `${realGwh.toFixed(2)} GWh` : '-',
          formatNum(rPln),
          formatNum(rPs)
        ];
      });

      autoTable(doc, {
        startY: 32,
        head: head,
        body: body,
        foot: [[
          { content: 'TOTAL', styles: { fontStyle: 'bold', halign: 'right' } },
          { content: formatNum(sumPlta), styles: { fontStyle: 'bold' } },
          { content: formatNum(sumMini), styles: { fontStyle: 'bold' } },
          { content: `${sumRealisasiGwh.toFixed(2)} GWh`, styles: { fontStyle: 'bold' } },
          { content: formatNum(sumPln), styles: { fontStyle: 'bold' } },
          { content: formatNum(sumPs), styles: { fontStyle: 'bold' } }
        ]],
        footStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255] },
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' }
      });

      doc.save(`Laporan_Produksi_${targetYear}.pdf`);
      
    } else if (activeTab === 'proyeksi') {
      doc.text(`Laporan Target RKAP & Proyeksi (${targetYear})`, 14, 20);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID')}`, 14, 26);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`1. Target & Proyeksi Produksi Energi 2026 (GWh)`, 14, 34);

      const headProd = [['Bulan', 'Target RKAP (GWh)', 'Proyeksi (GWh)', 'Selisih (GWh)', '% Prognosa']];
      let totRkapProd = 0;
      let totProyProd = 0;

      const bodyProd = MONTHS.map(m => {
        const targetObj = getRkapTarget(m);
        const rkapGwh = (targetObj?.production || 0) / 1000000;
        const proyGwh = (targetObj?.proyeksiProduction || 0) / 1000000;
        const delta = proyGwh - rkapGwh;
        const pct = rkapGwh > 0 ? (proyGwh / rkapGwh) * 100 : 0;

        totRkapProd += rkapGwh;
        totProyProd += proyGwh;

        return [
          m,
          `${rkapGwh.toFixed(2)} GWh`,
          `${proyGwh.toFixed(2)} GWh`,
          `${delta >= 0 ? '+' : ''}${delta.toFixed(2)} GWh`,
          `${pct.toFixed(2)}%`
        ];
      });

      autoTable(doc, {
        startY: 38,
        head: headProd,
        body: bodyProd,
        foot: [[
          { content: 'TOTAL TAHUNAN', styles: { fontStyle: 'bold' } },
          { content: `${totRkapProd.toFixed(2)} GWh`, styles: { fontStyle: 'bold' } },
          { content: `${totProyProd.toFixed(2)} GWh`, styles: { fontStyle: 'bold' } },
          { content: `${(totProyProd - totRkapProd) >= 0 ? '+' : ''}${(totProyProd - totRkapProd).toFixed(2)} GWh`, styles: { fontStyle: 'bold' } },
          { content: `${totRkapProd > 0 ? ((totProyProd / totRkapProd) * 100).toFixed(2) : 0}%`, styles: { fontStyle: 'bold' } }
        ]],
        footStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255] },
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' }
      });

      const finalY = (doc as any).lastAutoTable?.finalY || 150;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`2. Target & Proyeksi Pendapatan Bruto 2026 (Rp)`, 14, finalY + 12);

      const headRev = [['Bulan', 'Target RKAP Bruto (Rp)', 'Proyeksi Bruto (Rp)', 'Selisih (Rp)', '% Prognosa']];
      let totRkapRev = 0;
      let totProyRev = 0;

      const bodyRev = MONTHS.map(m => {
        const targetObj = getRkapTarget(m);
        const rkapRp = targetObj?.bruto || 0;
        const proyRp = targetObj?.proyeksi || 0;
        const delta = proyRp - rkapRp;
        const pct = rkapRp > 0 ? (proyRp / rkapRp) * 100 : 0;

        totRkapRev += rkapRp;
        totProyRev += proyRp;

        return [
          m,
          formatRupiah(rkapRp),
          formatRupiah(proyRp),
          `${delta >= 0 ? '+' : ''}${formatRupiah(delta)}`,
          `${pct.toFixed(2)}%`
        ];
      });

      autoTable(doc, {
        startY: finalY + 16,
        head: headRev,
        body: bodyRev,
        foot: [[
          { content: 'TOTAL TAHUNAN', styles: { fontStyle: 'bold' } },
          { content: formatRupiah(totRkapRev), styles: { fontStyle: 'bold' } },
          { content: formatRupiah(totProyRev), styles: { fontStyle: 'bold' } },
          { content: `${(totProyRev - totRkapRev) >= 0 ? '+' : ''}${formatRupiah(totProyRev - totRkapRev)}`, styles: { fontStyle: 'bold' } },
          { content: `${totRkapRev > 0 ? ((totProyRev / totRkapRev) * 100).toFixed(2) : 0}%`, styles: { fontStyle: 'bold' } }
        ]],
        footStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255] },
        theme: 'striped',
        headStyles: { fillColor: [217, 119, 6], textColor: [255, 255, 255], fontStyle: 'bold' }
      });

      doc.save(`Laporan_Target_dan_Proyeksi_${targetYear}.pdf`);
      
    } else if (activeTab === 'ps_terjual') {
      doc.text(`Laporan Data PS Terjual & Penugasan (${targetYear})`, 14, 20);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID')}`, 14, 26);

      const head = [['Periode', 'Kategori', 'Nama Pelanggan / Perusahaan', 'Penyaluran (kWh)', 'Pendapatan (Rp)']];
      
      let totalKwh = 0;
      let totalRupiah = 0;

      const psSorted = [...filteredPsData].sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        const mA = MONTHS.indexOf(a.month);
        const mB = MONTHS.indexOf(b.month);
        if (mA !== mB) return mA - mB;
        if (a.category !== b.category) return a.category.localeCompare(b.category);
        return a.customerName.trim().localeCompare(b.customerName.trim());
      });

      const body = psSorted.map(row => {
        totalKwh += row.kwhValue || 0;
        totalRupiah += row.rupiahValue || 0;
        return [
          `${row.month} ${row.year}`,
          row.category,
          row.customerName,
          formatNum(row.kwhValue),
          formatRupiah(row.rupiahValue)
        ];
      });

      autoTable(doc, {
        startY: 32,
        head: head,
        body: body,
        foot: [[
          { content: 'TOTAL', colSpan: 3, styles: { fontStyle: 'bold', halign: 'right' } },
          { content: formatNum(totalKwh), styles: { fontStyle: 'bold' } },
          { content: formatRupiah(totalRupiah), styles: { fontStyle: 'bold' } }
        ]],
        footStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255] },
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' }
      });

      doc.save(`Laporan_PS_Terjual_${targetYear}.pdf`);

    } else {
      const docLandscape = new jsPDF({ orientation: 'landscape' });
      docLandscape.setFontSize(14);
      docLandscape.setFont('helvetica', 'bold');
      docLandscape.text(`Laporan Detail Transmisi Penghantar (PHT) PLN - Tahun ${targetYear}`, 14, 16);
      docLandscape.setFontSize(9);
      docLandscape.setFont('helvetica', 'normal');
      docLandscape.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID')}`, 14, 21);

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

      let sCurugKirim = 0, sCurugTerima = 0;
      let sPdlrg1Kirim = 0, sPdlrg1Terima = 0;
      let sPdlrg2Kirim = 0, sPdlrg2Terima = 0;
      let sTata1Kirim = 0, sTata1Terima = 0;
      let sTata2Kirim = 0, sTata2Terima = 0;
      let sLineKirim = 0, sLineTerima = 0;
      let sPupukKirim = 0, sPupukTerima = 0;
      let sTotKirim = 0, sTotTerima = 0;

      const transmissionSorted = [...filteredTransmissionData].sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return MONTHS.indexOf(a.month) - MONTHS.indexOf(b.month);
      });

      const body = transmissionSorted.map(row => {
        const totKirim = row.curugKirim + row.pdlrg1Kirim + row.pdlrg2Kirim + row.tatajabar1Kirim + row.tatajabar2Kirim + row.lineIndustriKirim + row.pupukKujangKirim;
        const totTerima = row.curugTerima + row.pdlrg1Terima + row.pdlrg2Terima + row.tatajabar1Terima + row.tatajabar2Terima + row.lineIndustriTerima + row.pupukKujangTerima;

        sCurugKirim += row.curugKirim; sCurugTerima += row.curugTerima;
        sPdlrg1Kirim += row.pdlrg1Kirim; sPdlrg1Terima += row.pdlrg1Terima;
        sPdlrg2Kirim += row.pdlrg2Kirim; sPdlrg2Terima += row.pdlrg2Terima;
        sTata1Kirim += row.tatajabar1Kirim; sTata1Terima += row.tatajabar1Terima;
        sTata2Kirim += row.tatajabar2Kirim; sTata2Terima += row.tatajabar2Terima;
        sLineKirim += row.lineIndustriKirim; sLineTerima += row.lineIndustriTerima;
        sPupukKirim += row.pupukKujangKirim; sPupukTerima += row.pupukKujangTerima;
        sTotKirim += totKirim; sTotTerima += totTerima;

        return [
          `${row.month} ${row.year}`,
          formatNum(row.curugKirim), formatNum(row.curugTerima),
          formatNum(row.pdlrg1Kirim), formatNum(row.pdlrg1Terima),
          formatNum(row.pdlrg2Kirim), formatNum(row.pdlrg2Terima),
          formatNum(row.tatajabar1Kirim), formatNum(row.tatajabar1Terima),
          formatNum(row.tatajabar2Kirim), formatNum(row.tatajabar2Terima),
          formatNum(row.lineIndustriKirim), formatNum(row.lineIndustriTerima),
          formatNum(row.pupukKujangKirim), formatNum(row.pupukKujangTerima),
          formatNum(totKirim), formatNum(totTerima)
        ];
      });

      autoTable(docLandscape, {
        startY: 25,
        head: head,
        body: body,
        foot: [[
          'TOTAL',
          formatNum(sCurugKirim), formatNum(sCurugTerima),
          formatNum(sPdlrg1Kirim), formatNum(sPdlrg1Terima),
          formatNum(sPdlrg2Kirim), formatNum(sPdlrg2Terima),
          formatNum(sTata1Kirim), formatNum(sTata1Terima),
          formatNum(sTata2Kirim), formatNum(sTata2Terima),
          formatNum(sLineKirim), formatNum(sLineTerima),
          formatNum(sPupukKirim), formatNum(sPupukTerima),
          formatNum(sTotKirim), formatNum(sTotTerima)
        ]],
        styles: { fontSize: 7, cellPadding: 1.5 },
        footStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' }
      });

      docLandscape.save(`Laporan_Transmisi_PHT_${targetYear}.pdf`);
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
          onClick={() => setActiveTab('proyeksi')}
          className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'proyeksi' 
              ? 'bg-amber-600 text-white shadow-sm' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Target & Proyeksi
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
          {isAuthorized ? (
            <button
              onClick={handleLock}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-slate-750 text-sm font-medium rounded-lg shadow-sm text-emerald-400 bg-slate-800/80 hover:bg-slate-700 focus:outline-none transition-colors cursor-pointer"
              title="Klik untuk mengunci fitur tambah, edit, & hapus"
            >
              <Unlock className="mr-2 -ml-1 h-5 w-5 text-emerald-400" />
              Unlocked
            </button>
          ) : (
            <button
              onClick={() => checkAuthorization(() => {})}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-slate-800 text-sm font-medium rounded-lg shadow-sm text-slate-400 bg-slate-800/40 hover:bg-slate-800 transition-colors cursor-pointer"
              title="Fitur tambah, edit, & hapus terkunci. Klik untuk membuka."
            >
              <Lock className="mr-2 -ml-1 h-5 w-5 text-slate-500" />
              Locked
            </button>
          )}
          <button
            onClick={handleDownloadPDF}
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-slate-700 text-sm font-medium rounded-lg shadow-sm text-slate-300 bg-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors cursor-pointer"
          >
            <Download className="mr-2 -ml-1 h-5 w-5" />
            Unduh PDF
          </button>
          <button
            onClick={() => checkAuthorization(openAddModal)}
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors cursor-pointer"
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
                          onClick={() => checkAuthorization(() => openEditModal(row))}
                          className="text-indigo-400 hover:text-indigo-300 transition-colors px-2 py-1 cursor-pointer"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => checkAuthorization(() => handleDelete(row.id))}
                          className="text-rose-400 hover:text-rose-300 transition-colors px-2 py-1 cursor-pointer"
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
                  <th scope="col" className="px-6 py-4 text-right">Realisasi Total</th>
                  <th scope="col" className="px-6 py-4 text-right">Produksi PLN</th>
                  <th scope="col" className="px-6 py-4 text-right">Produksi PS</th>
                  <th scope="col" className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-300">
                {filteredProductionData.length > 0 ? (
                  filteredProductionData.map((row) => {
                    const realKwh = (row.plta || 0) + (row.miniHydro || 0);
                    const realGwh = realKwh / 1000000;
                    return (
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
                        <td className="px-6 py-4 whitespace-nowrap font-mono text-right font-bold text-slate-100">
                          {realGwh > 0 ? `${realGwh.toFixed(2)} GWh` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-mono text-right text-emerald-400">
                          {new Intl.NumberFormat('id-ID').format(row.pln || 0)} kWh
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-mono text-right text-amber-400">
                          {new Intl.NumberFormat('id-ID').format(
                            row.ps !== undefined && row.ps !== null 
                              ? row.ps 
                              : Math.max(0, realKwh - (row.pln || 0))
                          )} kWh
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center space-x-2 font-medium">
                          <button 
                            onClick={() => checkAuthorization(() => openEditModal(row))}
                            className="text-indigo-400 hover:text-indigo-300 transition-colors px-2 py-1 cursor-pointer"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => checkAuthorization(() => handleDelete(row.id))}
                            className="text-rose-400 hover:text-rose-300 transition-colors px-2 py-1 cursor-pointer"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-500">
                      <div className="flex flex-col items-center justify-center">
                        <Filter className="h-10 w-10 text-slate-700 mb-3" />
                        <p className="text-slate-400 font-medium text-base">Tidak ada data ditemukan</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : activeTab === 'proyeksi' ? (() => {
            const annualTarget = getRkapTarget('Semua');
            const totalTargetProdGwh = (annualTarget?.production || 0) / 1000000;
            const totalProyProdGwh = (annualTarget?.proyeksiProduction || 0) / 1000000;
            const deltaProdGwh = totalProyProdGwh - totalTargetProdGwh;
            const pctProd = totalTargetProdGwh > 0 ? (totalProyProdGwh / totalTargetProdGwh) * 100 : 0;

            const totalTargetBruto = annualTarget?.bruto || 0;
            const totalProyBruto = annualTarget?.proyeksi || 0;
            const deltaBruto = totalProyBruto - totalTargetBruto;
            const pctBruto = totalTargetBruto > 0 ? (totalProyBruto / totalTargetBruto) * 100 : 0;

            return (
              <div className="p-6 space-y-8 bg-slate-950/20">
                {/* Header Badge */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Target className="w-5 h-5 text-amber-400" />
                      Kelola Data Target RKAP vs Proyeksi 2026
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Evaluasi target tahunan RKAP 2026 terhadap estimasi dan prognosis aktual produksi & pendapatan.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
                    <TrendingUp className="w-4 h-4" />
                    <span>Prognosa 2026: Produksi {pctProd.toFixed(2)}% | Pendapatan {pctBruto.toFixed(2)}%</span>
                  </div>
                </div>

                {/* KPI Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-400 uppercase">Target RKAP Produksi</span>
                      <Target className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="text-2xl font-bold font-mono text-indigo-300">{totalTargetProdGwh.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} GWh</div>
                    <div className="text-[11px] text-slate-500 mt-1">Total Target RKAP Tahun 2026</div>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-400 uppercase">Proyeksi Produksi 2026</span>
                      <Zap className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="text-2xl font-bold font-mono text-amber-300">{totalProyProdGwh.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} GWh</div>
                    <div className={`text-[11px] mt-1 font-medium ${deltaProdGwh >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {deltaProdGwh >= 0 ? '+' : ''}{deltaProdGwh.toFixed(2)} GWh ({(pctProd - 100).toFixed(2)}% vs RKAP)
                    </div>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-400 uppercase">Target RKAP Bruto</span>
                      <BarChart2 className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="text-2xl font-bold font-mono text-indigo-300">{formatRupiah(totalTargetBruto)}</div>
                    <div className="text-[11px] text-slate-500 mt-1">Total Target Pendapatan Bruto</div>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-400 uppercase">Proyeksi Bruto 2026</span>
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="text-2xl font-bold font-mono text-emerald-300">{formatRupiah(totalProyBruto)}</div>
                    <div className={`text-[11px] mt-1 font-medium ${deltaBruto >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {deltaBruto >= 0 ? '+' : ''}{formatRupiah(deltaBruto)} ({(pctBruto - 100).toFixed(2)}% vs RKAP)
                    </div>
                  </div>
                </div>

                {/* Table 1: Target vs Proyeksi Produksi Energi */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                  <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/40">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-400" />
                      1. Target RKAP & Proyeksi Produksi Energi 2026 (GWh)
                    </h4>
                    <span className="text-xs text-slate-400 font-mono">12 Bulan (Jan - Des)</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-800/60 text-slate-400 text-xs uppercase font-bold tracking-wider">
                        <tr>
                          <th scope="col" className="px-5 py-3.5">Bulan</th>
                          <th scope="col" className="px-5 py-3.5 text-right text-indigo-400">Target RKAP (GWh)</th>
                          <th scope="col" className="px-5 py-3.5 text-right text-amber-400">Proyeksi 2026 (GWh)</th>
                          <th scope="col" className="px-5 py-3.5 text-right">Selisih (GWh)</th>
                          <th scope="col" className="px-5 py-3.5 text-right">% Prognosa</th>
                          <th scope="col" className="px-5 py-3.5 text-center">Status</th>
                          <th scope="col" className="px-5 py-3.5 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs text-slate-300 divide-y divide-slate-800/50 font-mono">
                        {MONTHS.map((m) => {
                          const targetObj = getRkapTarget(m);
                          const rkapGwh = (targetObj?.production || 0) / 1000000;
                          const proyGwh = (targetObj?.proyeksiProduction || 0) / 1000000;
                          const delta = proyGwh - rkapGwh;
                          const pct = rkapGwh > 0 ? (proyGwh / rkapGwh) * 100 : 0;
                          const isAbove = delta >= 0;

                          return (
                            <tr key={m} className="hover:bg-slate-800/30 transition-colors">
                              <td className="px-5 py-3.5 font-sans font-semibold text-white">{m} 2026</td>
                              <td className="px-5 py-3.5 text-right text-indigo-300 font-semibold">{rkapGwh.toFixed(2)} GWh</td>
                              <td className="px-5 py-3.5 text-right text-amber-300 font-bold">{proyGwh.toFixed(2)} GWh</td>
                              <td className={`px-5 py-3.5 text-right font-bold ${isAbove ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {isAbove ? '+' : ''}{delta.toFixed(2)} GWh
                              </td>
                              <td className="px-5 py-3.5 text-right font-bold text-slate-200">{pct.toFixed(2)}%</td>
                              <td className="px-5 py-3.5 text-center font-sans">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  isAbove 
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                }`}>
                                  {isAbove ? 'Diatas Target' : 'Dibawah Target'}
                                </span>
                              </td>
                              <td className="px-5 py-3.5 text-center font-sans">
                                <div className="inline-flex items-center justify-center gap-1">
                                  <button 
                                    onClick={() => checkAuthorization(() => handleOpenEditProyeksiModal(m))}
                                    className="p-1.5 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-colors cursor-pointer flex items-center gap-1 font-semibold text-xs"
                                    title="Edit Target & Proyeksi"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                    <span>Edit</span>
                                  </button>
                                  <button 
                                    onClick={() => checkAuthorization(() => handleOpenDeleteProyeksiModal(m))}
                                    className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer flex items-center gap-1 font-semibold text-xs"
                                    title="Hapus / Kosongkan Target & Proyeksi"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Hapus</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="bg-slate-800/80 font-mono text-xs font-bold text-white border-t border-slate-700">
                        <tr>
                          <td className="px-5 py-3.5 font-sans">TOTAL TAHUNAN</td>
                          <td className="px-5 py-3.5 text-right text-indigo-300">{totalTargetProdGwh.toFixed(2)} GWh</td>
                          <td className="px-5 py-3.5 text-right text-amber-300">{totalProyProdGwh.toFixed(2)} GWh</td>
                          <td className={`px-5 py-3.5 text-right ${deltaProdGwh >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {deltaProdGwh >= 0 ? '+' : ''}{deltaProdGwh.toFixed(2)} GWh
                          </td>
                          <td className="px-5 py-3.5 text-right text-emerald-400">{pctProd.toFixed(2)}%</td>
                          <td className="px-5 py-3.5 text-center font-sans text-emerald-400">{deltaProdGwh >= 0 ? 'Surplus' : 'Defisit'}</td>
                          <td className="px-5 py-3.5 text-center font-sans"></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Table 2: Target vs Proyeksi Pendapatan Bruto */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                  <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/40">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      2. Target RKAP & Proyeksi Pendapatan Bruto 2026 (Rp)
                    </h4>
                    <span className="text-xs text-slate-400 font-mono">12 Bulan (Jan - Des)</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-800/60 text-slate-400 text-xs uppercase font-bold tracking-wider">
                        <tr>
                          <th scope="col" className="px-5 py-3.5">Bulan</th>
                          <th scope="col" className="px-5 py-3.5 text-right text-indigo-400">Target RKAP Bruto (Rp)</th>
                          <th scope="col" className="px-5 py-3.5 text-right text-emerald-400">Proyeksi Bruto (Rp)</th>
                          <th scope="col" className="px-5 py-3.5 text-right">Selisih (Rp)</th>
                          <th scope="col" className="px-5 py-3.5 text-right">% Prognosa</th>
                          <th scope="col" className="px-5 py-3.5 text-center">Status</th>
                          <th scope="col" className="px-5 py-3.5 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs text-slate-300 divide-y divide-slate-800/50 font-mono">
                        {MONTHS.map((m) => {
                          const targetObj = getRkapTarget(m);
                          const rkapRp = targetObj?.bruto || 0;
                          const proyRp = targetObj?.proyeksi || 0;
                          const delta = proyRp - rkapRp;
                          const pct = rkapRp > 0 ? (proyRp / rkapRp) * 100 : 0;
                          const isAbove = delta >= 0;

                          return (
                            <tr key={m} className="hover:bg-slate-800/30 transition-colors">
                              <td className="px-5 py-3.5 font-sans font-semibold text-white">{m} 2026</td>
                              <td className="px-5 py-3.5 text-right text-indigo-300 font-semibold">{formatRupiah(rkapRp)}</td>
                              <td className="px-5 py-3.5 text-right text-emerald-300 font-bold">{formatRupiah(proyRp)}</td>
                              <td className={`px-5 py-3.5 text-right font-bold ${isAbove ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {isAbove ? '+' : ''}{formatRupiah(delta)}
                              </td>
                              <td className="px-5 py-3.5 text-right font-bold text-slate-200">{pct.toFixed(2)}%</td>
                              <td className="px-5 py-3.5 text-center font-sans">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  isAbove 
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                }`}>
                                  {isAbove ? 'Diatas Target' : 'Dibawah Target'}
                                </span>
                              </td>
                              <td className="px-5 py-3.5 text-center font-sans">
                                <div className="inline-flex items-center justify-center gap-1">
                                  <button 
                                    onClick={() => checkAuthorization(() => handleOpenEditProyeksiModal(m))}
                                    className="p-1.5 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-colors cursor-pointer flex items-center gap-1 font-semibold text-xs"
                                    title="Edit Target & Proyeksi"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                    <span>Edit</span>
                                  </button>
                                  <button 
                                    onClick={() => checkAuthorization(() => handleOpenDeleteProyeksiModal(m))}
                                    className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer flex items-center gap-1 font-semibold text-xs"
                                    title="Hapus / Kosongkan Target & Proyeksi"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Hapus</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="bg-slate-800/80 font-mono text-xs font-bold text-white border-t border-slate-700">
                        <tr>
                          <td className="px-5 py-3.5 font-sans">TOTAL TAHUNAN</td>
                          <td className="px-5 py-3.5 text-right text-indigo-300">{formatRupiah(totalTargetBruto)}</td>
                          <td className="px-5 py-3.5 text-right text-emerald-300">{formatRupiah(totalProyBruto)}</td>
                          <td className={`px-5 py-3.5 text-right ${deltaBruto >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {deltaBruto >= 0 ? '+' : ''}{formatRupiah(deltaBruto)}
                          </td>
                          <td className="px-5 py-3.5 text-right text-emerald-400">{pctBruto.toFixed(2)}%</td>
                          <td className="px-5 py-3.5 text-center font-sans text-emerald-400">{deltaBruto >= 0 ? 'Surplus' : 'Defisit'}</td>
                          <td className="px-5 py-3.5 text-center font-sans"></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            );
          })() : activeTab === 'ps_terjual' ? (
            <div className="p-6 space-y-8 bg-slate-950/20">
              {groupedPsData.length > 0 ? (
                groupedPsData.map((periodGroup) => (
                  <div key={periodGroup.key} className="bg-slate-900/60 border border-slate-800/70 rounded-2xl overflow-hidden shadow-lg">
                    {/* Period Header */}
                    <div className="bg-slate-800/30 border-b border-slate-800/80 px-5 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                        <span className="text-base font-extrabold text-white tracking-wide uppercase">
                          Periode: {periodGroup.month} {periodGroup.year}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2.5">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          Total Penyaluran: <strong className="font-mono ml-1.5 text-white">{new Intl.NumberFormat('id-ID').format(periodGroup.totalKwh)} kWh</strong>
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                          Total Pendapatan: <strong className="font-mono ml-1.5 text-white">{formatRupiah(periodGroup.totalRupiah)}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Categories inside Period */}
                    <div className="p-5 space-y-6">
                      {periodGroup.categories.map((catGroup) => (
                        <div key={catGroup.categoryName} className="bg-slate-950/40 rounded-xl p-4 border border-slate-800/60 shadow-sm">
                          {/* Category Title & Subtotal */}
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-3 mb-3 gap-3">
                            <span className={`inline-flex items-center px-3 py-1 rounded text-xs font-extrabold tracking-widest border uppercase ${
                              catGroup.categoryName === 'INDUSTRI / PERUSAHAAN'
                                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            }`}>
                              {catGroup.categoryName}
                            </span>
                            <div className="text-xs text-slate-400 flex flex-wrap gap-x-4 gap-y-1 font-semibold">
                              <span>Penyaluran: <strong className="text-indigo-400 font-mono text-sm ml-1">{new Intl.NumberFormat('id-ID').format(catGroup.subtotalKwh)} kWh</strong></span>
                              <span className="text-slate-700 hidden sm:inline">|</span>
                              <span>Pendapatan: <strong className="text-emerald-400 font-mono text-sm ml-1">{formatRupiah(catGroup.subtotalRupiah)}</strong></span>
                            </div>
                          </div>

                          {/* Customers Table */}
                          <div className="overflow-x-auto">
                            <table className="w-full text-left">
                              <thead>
                                <tr className="text-slate-500 text-[10px] font-extrabold uppercase tracking-widest border-b border-slate-800/40 pb-2">
                                  <th scope="col" className="pb-2 font-semibold">Nama Pelanggan / Perusahaan</th>
                                  <th scope="col" className="pb-2 text-right font-semibold">Penyaluran (kWh)</th>
                                  <th scope="col" className="pb-2 text-right font-semibold">Pendapatan (Rupiah)</th>
                                  <th scope="col" className="pb-2 text-center font-semibold w-32">Aksi</th>
                                </tr>
                              </thead>
                              <tbody className="text-xs text-slate-300 divide-y divide-slate-800/20">
                                {catGroup.items.map((row) => (
                                  <tr key={row.id} className="hover:bg-slate-800/25 transition-colors group">
                                    <td className="py-3 font-semibold text-slate-200 group-hover:text-white transition-colors">
                                      {row.customerName}
                                    </td>
                                    <td className="py-3 text-right font-mono text-indigo-400 font-semibold text-sm">
                                      {new Intl.NumberFormat('id-ID').format(row.kwhValue)} kWh
                                    </td>
                                    <td className="py-3 text-right font-mono text-emerald-400 font-semibold text-sm">
                                      {formatRupiah(row.rupiahValue)}
                                    </td>
                                    <td className="py-3 text-center space-x-1 whitespace-nowrap">
                                      <button 
                                        onClick={() => checkAuthorization(() => openEditModal(row))}
                                        className="text-indigo-400 hover:text-indigo-300 transition-colors px-2 py-0.5 rounded hover:bg-indigo-500/5 font-semibold text-xs cursor-pointer"
                                      >
                                        Edit
                                      </button>
                                      <button 
                                        onClick={() => checkAuthorization(() => handleDelete(row.id))}
                                        className="text-rose-400 hover:text-rose-300 transition-colors px-2 py-0.5 rounded hover:bg-rose-500/5 font-semibold text-xs cursor-pointer"
                                      >
                                        Hapus
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <Filter className="h-10 w-10 text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-400 font-semibold text-base">Tidak ada data ditemukan</p>
                </div>
              )}
            </div>
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
                                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors border border-slate-700 font-medium cursor-pointer"
                              >
                                {isExpanded ? 'Tutup Rincian' : 'Lihat 7 Penghantar'}
                              </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center space-x-2 font-medium">
                              <button 
                                onClick={() => checkAuthorization(() => openEditModal(row))}
                                className="text-indigo-400 hover:text-indigo-300 transition-colors px-2 py-1 cursor-pointer"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => checkAuthorization(() => handleDelete(row.id))}
                                className="text-rose-400 hover:text-rose-300 transition-colors px-2 py-1 cursor-pointer"
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
                className="relative z-10 inline-flex flex-col align-bottom bg-slate-900 border border-slate-800 rounded-2xl text-left overflow-hidden shadow-2xl sm:my-8 sm:align-middle sm:max-w-2xl w-full max-h-[90vh]"
              >
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                  <div className="bg-slate-900 px-4 pt-5 pb-4 sm:p-6 sm:pb-4 overflow-y-auto flex-1">
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
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                              {revenueRows.map((row, idx) => (
                                <div key={idx} className="p-3 bg-slate-800/40 border border-slate-700/60 rounded-xl space-y-3 relative">
                                  {revenueRows.length > 1 && !editingData && (
                                    <button
                                      type="button"
                                      onClick={() => setRevenueRows(revenueRows.filter((_, rIdx) => rIdx !== idx))}
                                      className="absolute top-2 right-2 text-rose-400 hover:text-rose-300 p-1"
                                      title="Hapus baris ini"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                  <p className="text-xs font-semibold text-indigo-400">Baris #{idx + 1}</p>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-xs font-medium text-slate-400 mb-1">Kategori</label>
                                      <select
                                        value={row.category}
                                        onChange={(e) => {
                                          const next = [...revenueRows];
                                          next[idx].category = e.target.value;
                                          setRevenueRows(next);
                                        }}
                                        className="w-full px-3 py-1.5 border border-slate-700 rounded-lg bg-slate-800 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        required
                                      >
                                        {categories.length > 0 ? categories.map(c => <option key={c} value={c}>{c}</option>) : DEFAULT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                      </select>
                                    </div>

                                    <div>
                                      <label className="block text-xs font-medium text-slate-400 mb-1">Jumlah Pendapatan (Rp)</label>
                                      <input
                                        type="number"
                                        value={row.amount}
                                        onChange={(e) => {
                                          const next = [...revenueRows];
                                          next[idx].amount = e.target.value;
                                          setRevenueRows(next);
                                        }}
                                        placeholder="Contoh: 15000000"
                                        className="w-full px-3 py-1.5 border border-slate-700 rounded-lg bg-slate-800 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        required
                                        min="0"
                                      />
                                    </div>
                                  </div>

                                  <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Catatan (Opsional)</label>
                                    <input
                                      type="text"
                                      value={row.notes}
                                      onChange={(e) => {
                                        const next = [...revenueRows];
                                        next[idx].notes = e.target.value;
                                        setRevenueRows(next);
                                      }}
                                      placeholder="Tambahkan keterangan jika perlu..."
                                      className="w-full px-3 py-1.5 border border-slate-700 rounded-lg bg-slate-800 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                  </div>
                                </div>
                              ))}

                              {!editingData && (
                                <button
                                  type="button"
                                  onClick={() => setRevenueRows([...revenueRows, { category: categories[0] || DEFAULT_CATEGORIES[0], amount: '', notes: '' }])}
                                  className="w-full py-2 border border-dashed border-indigo-500/50 rounded-xl text-xs font-semibold text-indigo-400 hover:bg-indigo-500/5 hover:border-indigo-500 transition-colors flex items-center justify-center gap-1"
                                >
                                  <Plus className="w-4 h-4" /> Tambah Baris Baru
                                </button>
                              )}
                            </div>
                          ) : activeTab === 'production' ? (
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                              {productionRows.map((row, idx) => (
                                <div key={idx} className="p-3 bg-slate-800/40 border border-slate-700/60 rounded-xl space-y-3 relative">
                                  {productionRows.length > 1 && !editingData && (
                                    <button
                                      type="button"
                                      onClick={() => setProductionRows(productionRows.filter((_, rIdx) => rIdx !== idx))}
                                      className="absolute top-2 right-2 text-rose-400 hover:text-rose-300 p-1"
                                      title="Hapus baris ini"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                  <p className="text-xs font-semibold text-indigo-400">Baris #{idx + 1}</p>
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-xs font-medium text-slate-400 mb-1">Produksi PLTA (kWh)</label>
                                      <input
                                        type="number"
                                        value={row.plta}
                                        onChange={(e) => {
                                          const next = [...productionRows];
                                          next[idx].plta = e.target.value;
                                          setProductionRows(next);
                                        }}
                                        placeholder="Contoh: 89804820"
                                        className="w-full px-3 py-1.5 border border-slate-700 rounded-lg bg-slate-800 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        required
                                        min="0"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-slate-400 mb-1">Produksi Mini Hydro (kWh)</label>
                                      <input
                                        type="number"
                                        value={row.miniHydro}
                                        onChange={(e) => {
                                          const next = [...productionRows];
                                          next[idx].miniHydro = e.target.value;
                                          setProductionRows(next);
                                        }}
                                        placeholder="Contoh: 350000"
                                        className="w-full px-3 py-1.5 border border-slate-700 rounded-lg bg-slate-800 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        required
                                        min="0"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-slate-400 mb-1">Produksi PLN (kWh)</label>
                                      <input
                                        type="number"
                                        value={row.pln}
                                        onChange={(e) => {
                                          const next = [...productionRows];
                                          next[idx].pln = e.target.value;
                                          setProductionRows(next);
                                        }}
                                        placeholder="Contoh: 37972050"
                                        className="w-full px-3 py-1.5 border border-slate-700 rounded-lg bg-slate-800 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        required
                                        min="0"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-slate-400 mb-1">Produksi PS (kWh)</label>
                                      <input
                                        type="number"
                                        value={row.ps}
                                        onChange={(e) => {
                                          const next = [...productionRows];
                                          next[idx].ps = e.target.value;
                                          setProductionRows(next);
                                        }}
                                        placeholder="Contoh: 52182770"
                                        className="w-full px-3 py-1.5 border border-slate-700 rounded-lg bg-slate-800 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        required
                                        min="0"
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}

                              {!editingData && (
                                <button
                                  type="button"
                                  onClick={() => setProductionRows([...productionRows, { plta: '', miniHydro: '', pln: '', ps: '' }])}
                                  className="w-full py-2 border border-dashed border-indigo-500/50 rounded-xl text-xs font-semibold text-indigo-400 hover:bg-indigo-500/5 hover:border-indigo-500 transition-colors flex items-center justify-center gap-1"
                                >
                                  <Plus className="w-4 h-4" /> Tambah Baris Baru
                                </button>
                              )}
                            </div>
                          ) : activeTab === 'ps_terjual' ? (
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                              {psRows.map((row, idx) => (
                                <div key={idx} className="p-3 bg-slate-800/40 border border-slate-700/60 rounded-xl space-y-3 relative">
                                  {psRows.length > 1 && !editingData && (
                                    <button
                                      type="button"
                                      onClick={() => setPsRows(psRows.filter((_, rIdx) => rIdx !== idx))}
                                      className="absolute top-2 right-2 text-rose-400 hover:text-rose-300 p-1"
                                      title="Hapus baris ini"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                  <p className="text-xs font-semibold text-indigo-400">Baris #{idx + 1}</p>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-xs font-medium text-slate-400 mb-1">Kategori Kelompok</label>
                                      <select
                                        value={row.category}
                                        onChange={(e) => {
                                          const next = [...psRows];
                                          next[idx].category = e.target.value as any;
                                          setPsRows(next);
                                        }}
                                        className="w-full px-3 py-1.5 border border-slate-700 rounded-lg bg-slate-800 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        required
                                      >
                                        <option value="INDUSTRI / PERUSAHAAN">INDUSTRI / PERUSAHAAN</option>
                                        <option value="PERUMAHAN & WARUNG">PERUMAHAN & WARUNG</option>
                                      </select>
                                    </div>

                                    <div>
                                      <label className="block text-xs font-medium text-slate-400 mb-1">Nama Perusahaan / Pelanggan</label>
                                      <input
                                        type="text"
                                        value={row.customerName}
                                        onChange={(e) => {
                                          const next = [...psRows];
                                          next[idx].customerName = e.target.value;
                                          setPsRows(next);
                                        }}
                                        placeholder="Contoh: PT. INDOTAMA FERRO ALLOYS"
                                        className="w-full px-3 py-1.5 border border-slate-700 rounded-lg bg-slate-800 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        required
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-xs font-medium text-slate-400 mb-1">Volume Penyaluran (kWh)</label>
                                      <input
                                        type="number"
                                        step="any"
                                        value={row.kwhValue}
                                        onChange={(e) => {
                                          const next = [...psRows];
                                          next[idx].kwhValue = e.target.value;
                                          setPsRows(next);
                                        }}
                                        placeholder="Contoh: 29885655.93"
                                        className="w-full px-3 py-1.5 border border-slate-700 rounded-lg bg-slate-800 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        required
                                        min="0"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-xs font-medium text-slate-400 mb-1">Pendapatan Penjualan (Rupiah)</label>
                                      <input
                                        type="number"
                                        step="any"
                                        value={row.rupiahValue}
                                        onChange={(e) => {
                                          const next = [...psRows];
                                          next[idx].rupiahValue = e.target.value;
                                          setPsRows(next);
                                        }}
                                        placeholder="Contoh: 23830523182"
                                        className="w-full px-3 py-1.5 border border-slate-700 rounded-lg bg-slate-800 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        required
                                        min="0"
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}

                              {!editingData && (
                                <button
                                  type="button"
                                  onClick={() => setPsRows([...psRows, { category: 'INDUSTRI / PERUSAHAAN', customerName: '', kwhValue: '', rupiahValue: '' }])}
                                  className="w-full py-2 border border-dashed border-indigo-500/50 rounded-xl text-xs font-semibold text-indigo-400 hover:bg-indigo-500/5 hover:border-indigo-500 transition-colors flex items-center justify-center gap-1"
                                >
                                  <Plus className="w-4 h-4" /> Tambah Baris Baru
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                              {transmissionRows.map((row, idx) => (
                                <div key={idx} className="p-3 bg-slate-800/40 border border-slate-700/60 rounded-xl space-y-3 relative">
                                  {transmissionRows.length > 1 && !editingData && (
                                    <button
                                      type="button"
                                      onClick={() => setTransmissionRows(transmissionRows.filter((_, rIdx) => rIdx !== idx))}
                                      className="absolute top-2 right-2 text-rose-400 hover:text-rose-300 p-1"
                                      title="Hapus baris ini"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                  <p className="text-xs font-semibold text-indigo-400 border-b border-indigo-950/60 pb-1 mb-2">Baris #{idx + 1} - Penghantar Transmisi Detail PHT (kWh)</p>
                                  
                                  <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-800/60">
                                    <h4 className="col-span-2 text-xs font-bold text-slate-300">1. PHT Curug</h4>
                                    <div>
                                      <label className="text-xs text-slate-500">Kirim</label>
                                      <input type="number" step="any" value={row.curugKirim} onChange={(e) => {
                                        const next = [...transmissionRows];
                                        next[idx].curugKirim = e.target.value;
                                        setTransmissionRows(next);
                                      }} className="w-full px-2 py-1 border border-slate-700 rounded bg-slate-800 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500" placeholder="0" />
                                    </div>
                                    <div>
                                      <label className="text-xs text-slate-500">Terima</label>
                                      <input type="number" step="any" value={row.curugTerima} onChange={(e) => {
                                        const next = [...transmissionRows];
                                        next[idx].curugTerima = e.target.value;
                                        setTransmissionRows(next);
                                      }} className="w-full px-2 py-1 border border-slate-700 rounded bg-slate-800 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500" placeholder="0" />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-800/60">
                                    <h4 className="col-span-2 text-xs font-bold text-slate-300">2. PHT Padalarang 1 (PDLRG 1)</h4>
                                    <div>
                                      <label className="text-xs text-slate-500">Kirim</label>
                                      <input type="number" step="any" value={row.pdlrg1Kirim} onChange={(e) => {
                                        const next = [...transmissionRows];
                                        next[idx].pdlrg1Kirim = e.target.value;
                                        setTransmissionRows(next);
                                      }} className="w-full px-2 py-1 border border-slate-700 rounded bg-slate-800 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500" placeholder="0" />
                                    </div>
                                    <div>
                                      <label className="text-xs text-slate-500">Terima</label>
                                      <input type="number" step="any" value={row.pdlrg1Terima} onChange={(e) => {
                                        const next = [...transmissionRows];
                                        next[idx].pdlrg1Terima = e.target.value;
                                        setTransmissionRows(next);
                                      }} className="w-full px-2 py-1 border border-slate-700 rounded bg-slate-800 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500" placeholder="0" />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-800/60">
                                    <h4 className="col-span-2 text-xs font-bold text-slate-300">3. PHT Padalarang 2 (PDLRG 2)</h4>
                                    <div>
                                      <label className="text-xs text-slate-500">Kirim</label>
                                      <input type="number" step="any" value={row.pdlrg2Kirim} onChange={(e) => {
                                        const next = [...transmissionRows];
                                        next[idx].pdlrg2Kirim = e.target.value;
                                        setTransmissionRows(next);
                                      }} className="w-full px-2 py-1 border border-slate-700 rounded bg-slate-800 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500" placeholder="0" />
                                    </div>
                                    <div>
                                      <label className="text-xs text-slate-500">Terima</label>
                                      <input type="number" step="any" value={row.pdlrg2Terima} onChange={(e) => {
                                        const next = [...transmissionRows];
                                        next[idx].pdlrg2Terima = e.target.value;
                                        setTransmissionRows(next);
                                      }} className="w-full px-2 py-1 border border-slate-700 rounded bg-slate-800 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500" placeholder="0" />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-800/60">
                                    <h4 className="col-span-2 text-xs font-bold text-slate-300">4. PHT Tata Jabar 1</h4>
                                    <div>
                                      <label className="text-xs text-slate-500">Kirim</label>
                                      <input type="number" step="any" value={row.tatajabar1Kirim} onChange={(e) => {
                                        const next = [...transmissionRows];
                                        next[idx].tatajabar1Kirim = e.target.value;
                                        setTransmissionRows(next);
                                      }} className="w-full px-2 py-1 border border-slate-700 rounded bg-slate-800 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500" placeholder="0" />
                                    </div>
                                    <div>
                                      <label className="text-xs text-slate-500">Terima</label>
                                      <input type="number" step="any" value={row.tatajabar1Terima} onChange={(e) => {
                                        const next = [...transmissionRows];
                                        next[idx].tatajabar1Terima = e.target.value;
                                        setTransmissionRows(next);
                                      }} className="w-full px-2 py-1 border border-slate-700 rounded bg-slate-800 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500" placeholder="0" />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-800/60">
                                    <h4 className="col-span-2 text-xs font-bold text-slate-300">5. PHT Tata Jabar 2</h4>
                                    <div>
                                      <label className="text-xs text-slate-500">Kirim</label>
                                      <input type="number" step="any" value={row.tatajabar2Kirim} onChange={(e) => {
                                        const next = [...transmissionRows];
                                        next[idx].tatajabar2Kirim = e.target.value;
                                        setTransmissionRows(next);
                                      }} className="w-full px-2 py-1 border border-slate-700 rounded bg-slate-800 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500" placeholder="0" />
                                    </div>
                                    <div>
                                      <label className="text-xs text-slate-500">Terima</label>
                                      <input type="number" step="any" value={row.tatajabar2Terima} onChange={(e) => {
                                        const next = [...transmissionRows];
                                        next[idx].tatajabar2Terima = e.target.value;
                                        setTransmissionRows(next);
                                      }} className="w-full px-2 py-1 border border-slate-700 rounded bg-slate-800 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500" placeholder="0" />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-800/60">
                                    <h4 className="col-span-2 text-xs font-bold text-slate-300">6. PHT Line Industri</h4>
                                    <div>
                                      <label className="text-xs text-slate-500">Kirim</label>
                                      <input type="number" step="any" value={row.lineIndustriKirim} onChange={(e) => {
                                        const next = [...transmissionRows];
                                        next[idx].lineIndustriKirim = e.target.value;
                                        setTransmissionRows(next);
                                      }} className="w-full px-2 py-1 border border-slate-700 rounded bg-slate-800 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500" placeholder="0" />
                                    </div>
                                    <div>
                                      <label className="text-xs text-slate-500">Terima</label>
                                      <input type="number" step="any" value={row.lineIndustriTerima} onChange={(e) => {
                                        const next = [...transmissionRows];
                                        next[idx].lineIndustriTerima = e.target.value;
                                        setTransmissionRows(next);
                                      }} className="w-full px-2 py-1 border border-slate-700 rounded bg-slate-800 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500" placeholder="0" />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-3">
                                    <h4 className="col-span-2 text-xs font-bold text-slate-300">7. PHT Pupuk Kujang</h4>
                                    <div>
                                      <label className="text-xs text-slate-500">Kirim</label>
                                      <input type="number" step="any" value={row.pupukKujangKirim} onChange={(e) => {
                                        const next = [...transmissionRows];
                                        next[idx].pupukKujangKirim = e.target.value;
                                        setTransmissionRows(next);
                                      }} className="w-full px-2 py-1 border border-slate-700 rounded bg-slate-800 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500" placeholder="0" />
                                    </div>
                                    <div>
                                      <label className="text-xs text-slate-500">Terima</label>
                                      <input type="number" step="any" value={row.pupukKujangTerima} onChange={(e) => {
                                        const next = [...transmissionRows];
                                        next[idx].pupukKujangTerima = e.target.value;
                                        setTransmissionRows(next);
                                      }} className="w-full px-2 py-1 border border-slate-700 rounded bg-slate-800 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500" placeholder="0" />
                                    </div>
                                  </div>
                                </div>
                              ))}

                              {!editingData && (
                                <button
                                  type="button"
                                  onClick={() => setTransmissionRows([...transmissionRows, {
                                    curugKirim: '', curugTerima: '',
                                    pdlrg1Kirim: '', pdlrg1Terima: '',
                                    pdlrg2Kirim: '', pdlrg2Terima: '',
                                    tatajabar1Kirim: '', tatajabar1Terima: '',
                                    tatajabar2Kirim: '', tatajabar2Terima: '',
                                    lineIndustriKirim: '', lineIndustriTerima: '',
                                    pupukKujangKirim: '', pupukKujangTerima: '',
                                  }])}
                                  className="w-full py-2 border border-dashed border-indigo-500/50 rounded-xl text-xs font-semibold text-indigo-400 hover:bg-indigo-500/5 hover:border-indigo-500 transition-colors flex items-center justify-center gap-1"
                                >
                                  <Plus className="w-4 h-4" /> Tambah Baris Baru
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  {saveError && (
                    <div className="mx-4 sm:mx-6 mb-3 p-3 bg-rose-950/50 border border-rose-800/50 rounded-lg text-rose-300 text-xs flex items-start gap-2 shrink-0">
                      <span className="font-bold flex-shrink-0 text-rose-400">⚠️ Error:</span>
                      <span className="break-all">{saveError}</span>
                    </div>
                  )}

                  <div className="bg-slate-800/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-slate-800 shrink-0">
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

      {/* Modal Edit Target & Proyeksi */}
      <AnimatePresence>
        {proyeksiEditModal.isOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity z-0" 
                aria-hidden="true" 
                onClick={() => setProyeksiEditModal(prev => ({ ...prev, isOpen: false }))}
              />

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative z-10 inline-block align-middle bg-slate-900 border border-slate-700 rounded-2xl text-left overflow-hidden shadow-2xl sm:my-8 sm:max-w-lg w-full"
              >
                <form onSubmit={handleSaveProyeksi}>
                  <div className="bg-slate-900 px-6 pt-6 pb-4 sm:pb-6">
                    <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-4">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
                        <Target className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          Edit Target & Proyeksi {proyeksiEditModal.month} 2026
                        </h3>
                        <p className="text-xs text-slate-400">
                          Ubah target RKAP dan nilai proyeksi untuk bulan {proyeksiEditModal.month}.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4 text-xs">
                      {/* Target RKAP Produksi & Proyeksi Produksi */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-800/40 border border-slate-800 rounded-xl">
                        <div className="col-span-2 text-indigo-400 font-bold flex items-center gap-1.5">
                          <Zap className="w-4 h-4" /> Produksi Energi (GWh)
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1 font-medium">Target RKAP (GWh)</label>
                          <input
                            type="number"
                            step="any"
                            required
                            value={proyeksiEditModal.targetProductionGwh}
                            onChange={(e) => setProyeksiEditModal(prev => ({ ...prev, targetProductionGwh: e.target.value }))}
                            className="w-full px-3 py-2 border border-slate-700 rounded-lg bg-slate-800 text-slate-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1 font-medium">Proyeksi 2026 (GWh)</label>
                          <input
                            type="number"
                            step="any"
                            required
                            value={proyeksiEditModal.proyeksiProductionGwh}
                            onChange={(e) => setProyeksiEditModal(prev => ({ ...prev, proyeksiProductionGwh: e.target.value }))}
                            className="w-full px-3 py-2 border border-slate-700 rounded-lg bg-slate-800 text-amber-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      {/* Target RKAP Bruto & Proyeksi Bruto */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-800/40 border border-slate-800 rounded-xl">
                        <div className="col-span-2 text-emerald-400 font-bold flex items-center gap-1.5">
                          <TrendingUp className="w-4 h-4" /> Pendapatan Bruto (Rp)
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1 font-medium">Target RKAP Bruto (Rp)</label>
                          <input
                            type="number"
                            step="any"
                            required
                            value={proyeksiEditModal.targetBrutoRp}
                            onChange={(e) => setProyeksiEditModal(prev => ({ ...prev, targetBrutoRp: e.target.value }))}
                            className="w-full px-3 py-2 border border-slate-700 rounded-lg bg-slate-800 text-slate-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1 font-medium">Proyeksi Bruto (Rp)</label>
                          <input
                            type="number"
                            step="any"
                            required
                            value={proyeksiEditModal.proyeksiBrutoRp}
                            onChange={(e) => setProyeksiEditModal(prev => ({ ...prev, proyeksiBrutoRp: e.target.value }))}
                            className="w-full px-3 py-2 border border-slate-700 rounded-lg bg-slate-800 text-emerald-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-800/40 px-6 py-4 sm:flex sm:flex-row-reverse border-t border-slate-800 gap-3">
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2.5 bg-indigo-600 text-base font-semibold text-white hover:bg-indigo-500 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm transition-colors cursor-pointer"
                    >
                      Simpan Perubahan
                    </button>
                    <button
                      type="button"
                      onClick={() => setProyeksiEditModal(prev => ({ ...prev, isOpen: false }))}
                      className="mt-3 w-full inline-flex justify-center rounded-lg border border-slate-700 shadow-sm px-4 py-2.5 bg-slate-800 text-base font-semibold text-slate-300 hover:bg-slate-700 hover:text-white focus:outline-none sm:mt-0 sm:w-auto sm:text-sm transition-colors cursor-pointer"
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

      {/* Modal Hapus Target & Proyeksi */}
      <AnimatePresence>
        {proyeksiDeleteModal.isOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity z-0" 
                aria-hidden="true" 
                onClick={() => setProyeksiDeleteModal({ isOpen: false, month: '' })}
              />

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
                      <h3 className="text-lg leading-6 font-bold text-white mb-2">
                        Konfirmasi Hapus Target & Proyeksi
                      </h3>
                      <p className="text-sm text-slate-300">
                        Apakah Anda yakin ingin menghapus / mengosongkan data Target RKAP & Proyeksi untuk bulan <span className="font-semibold text-rose-400">{proyeksiDeleteModal.month} 2026</span>?
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-800/40 px-6 py-4 sm:flex sm:flex-row-reverse border-t border-slate-800 gap-3">
                  <button
                    type="button"
                    onClick={handleConfirmDeleteProyeksi}
                    className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2.5 bg-rose-600 text-base font-semibold text-white hover:bg-rose-500 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm transition-colors cursor-pointer"
                  >
                    Hapus Data
                  </button>
                  <button
                    type="button"
                    onClick={() => setProyeksiDeleteModal({ isOpen: false, month: '' })}
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

      {/* Modal Proteksi Password */}
      <AnimatePresence>
        {passwordModal.isOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity z-0" 
                aria-hidden="true" 
                onClick={() => setPasswordModal(prev => ({ ...prev, isOpen: false }))}
              />

              {/* Center modal trick */}
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative z-10 inline-block align-middle bg-slate-900 border border-slate-700 rounded-2xl text-left overflow-hidden shadow-2xl sm:my-8 sm:max-w-md w-full"
              >
                <form onSubmit={handlePasswordSubmit}>
                  <div className="bg-slate-900 px-6 pt-6 pb-4 sm:pb-6">
                    <div className="sm:flex sm:items-start">
                      <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-500/10 sm:mx-0 sm:h-10 sm:w-10">
                        <Lock className="h-5 w-5 text-indigo-400" />
                      </div>
                      <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                        <h3 className="text-lg leading-6 font-bold text-white mb-2">
                          Proteksi Password Admin
                        </h3>
                        <p className="text-sm text-slate-400 mb-4">
                          Fitur tambah data, edit, dan hapus diproteksi. Masukkan kata sandi untuk membuka akses.
                        </p>
                        <div className="mt-2">
                          <input
                            type="password"
                            required
                            autoFocus
                            placeholder="Masukkan password..."
                            value={passwordModal.passwordInput}
                            onChange={(e) => setPasswordModal(prev => ({ ...prev, passwordInput: e.target.value, error: '' }))}
                            className="block w-full px-3 py-2 border border-slate-700 rounded-lg bg-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-colors"
                          />
                        </div>
                        {passwordModal.error && (
                          <p className="mt-2 text-xs text-rose-400 font-medium">
                            ⚠️ {passwordModal.error}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-800/40 px-6 py-4 sm:flex sm:flex-row-reverse border-t border-slate-800 gap-3">
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2.5 bg-indigo-600 text-base font-semibold text-white hover:bg-indigo-500 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm transition-colors cursor-pointer"
                    >
                      Verifikasi
                    </button>
                    <button
                      type="button"
                      onClick={() => setPasswordModal(prev => ({ ...prev, isOpen: false }))}
                      className="mt-3 w-full inline-flex justify-center rounded-lg border border-slate-700 shadow-sm px-4 py-2.5 bg-slate-800 text-base font-semibold text-slate-300 hover:bg-slate-700 hover:text-white focus:outline-none sm:mt-0 sm:w-auto sm:text-sm transition-colors cursor-pointer"
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
