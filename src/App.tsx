import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { DashboardView } from './views/DashboardView';
import { DataManagementView } from './views/DataManagementView';
import { SettingsView } from './views/SettingsView';
import { ViewState, RevenueRecord, ProductionRecord, PSTerjualRecord, TransmissionRecord, DEFAULT_CATEGORIES } from './types';
import { MOCK_DATA, MOCK_PRODUCTION_DATA, MOCK_PS_TERJUAL_DATA, MOCK_TRANSMISSION_DATA } from './data/mockData';
import { saveDocument, removeDocument, syncCollection, syncCategories, saveCategories } from './lib/firebase';

// Auto-fill missing 2026 records up to December
const autoBackfillRecords = async (
  currentRevenue: RevenueRecord[],
  currentProduction: ProductionRecord[],
  currentPs: PSTerjualRecord[],
  currentTx: TransmissionRecord[]
) => {
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const categoriesList = ['PLN (Persero)', 'PS Penugasan', 'PS Usaha', 'Non PLN (Swasta) + Penduduk'];
  const promises: Promise<void>[] = [];
  
  // 1. Revenue backfill/update
  for (const m of months) {
    const monthNum = months.indexOf(m) + 1;
    for (const cat of categoriesList) {
      const existing = currentRevenue.find(r => r.month === m && r.year === 2026 && r.category === cat);
      
      if (!existing) {
        const id = `rev_2026_${m.toLowerCase()}_${cat.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`;
        promises.push(saveDocument('revenue', {
          id,
          month: m,
          year: 2026,
          category: cat,
          amount: 0,
          dateAdded: new Date(`2026-${String(monthNum).padStart(2, '0')}-15`).toISOString()
        }));
      }
    }
  }

  // 2. Production backfill/update
  for (const m of months) {
    const monthNum = months.indexOf(m) + 1;
    const existing = currentProduction.find(r => r.month === m && r.year === 2026);
    
    if (!existing) {
      const id = `prod_2026_${m.toLowerCase()}`;
      promises.push(saveDocument('production', {
        id,
        month: m,
        year: 2026,
        plta: 0,
        miniHydro: 0,
        pln: 0,
        ps: 0,
        dateAdded: new Date(`2026-${String(monthNum).padStart(2, '0')}-15`).toISOString()
      }));
    }
  }

  // 3. PS Terjual seed & cleanup (Delete all zero-value and duplicate records)
  const psGroups = new Map<string, PSTerjualRecord[]>();
  currentPs.forEach(r => {
    const normName = r.customerName.trim().toUpperCase();
    const key = `${r.year}-${r.month.trim().toLowerCase()}-${normName}`;
    if (!psGroups.has(key)) {
      psGroups.set(key, []);
    }
    psGroups.get(key)!.push(r);
  });

  // Delete all records where kwhValue === 0 && rupiahValue === 0 OR duplicate records
  psGroups.forEach((records) => {
    // Find the record with actual non-zero value if any
    const recordWithValues = records.find(r => (r.kwhValue || 0) > 0 || (r.rupiahValue || 0) > 0);
    
    records.forEach(r => {
      const isZero = (r.kwhValue || 0) === 0 && (r.rupiahValue || 0) === 0;
      // If it's a zero-value record, OR it's a duplicate of a record with values, delete it from Firestore
      if (isZero || (recordWithValues && r.id !== recordWithValues.id)) {
        promises.push(removeDocument('ps_terjual', r.id));
      }
    });
  });

  // Seed initial MOCK_PS_TERJUAL_DATA if currentPs is empty
  if (currentPs.length === 0) {
    MOCK_PS_TERJUAL_DATA.forEach(r => {
      promises.push(saveDocument('ps_terjual', r));
    });
  }

  // 4. Transmission backfill/update
  for (const m of months) {
    const monthNum = months.indexOf(m) + 1;
    const existing = currentTx.find(r => r.month === m && r.year === 2026);
    
    if (!existing) {
      const id = `tx_2026_${m.toLowerCase()}`;
      promises.push(saveDocument('transmission', {
        id,
        month: m,
        year: 2026,
        curugKirim: 0,
        curugTerima: 0,
        pdlrg1Kirim: 0,
        pdlrg1Terima: 0,
        pdlrg2Kirim: 0,
        pdlrg2Terima: 0,
        tatajabar1Kirim: 0,
        tatajabar1Terima: 0,
        tatajabar2Kirim: 0,
        tatajabar2Terima: 0,
        lineIndustriKirim: 0,
        lineIndustriTerima: 0,
        pupukKujangKirim: 0,
        pupukKujangTerima: 0,
        dateAdded: new Date(`2026-${String(monthNum).padStart(2, '0')}-15`).toISOString()
      }));
    }
  }

  if (promises.length > 0) {
    console.log(`Writing ${promises.length} backfilled records to Firestore...`);
    await Promise.all(promises);
    console.log('Finished backfilling.');
  }
};

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [data, setData] = useState<RevenueRecord[]>([]);
  const [productionData, setProductionData] = useState<ProductionRecord[]>([]);
  const [psData, setPsData] = useState<PSTerjualRecord[]>([]);
  const [transmissionData, setTransmissionData] = useState<TransmissionRecord[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [hasBackfilled, setHasBackfilled] = useState(false);

  // Track loading status of each individual collection to prevent race conditions during backfill
  const [loadingRevenue, setLoadingRevenue] = useState(true);
  const [loadingProd, setLoadingProd] = useState(true);
  const [loadingPs, setLoadingPs] = useState(true);
  const [loadingTx, setLoadingTx] = useState(true);
  const [loadingCats, setLoadingCats] = useState(true);

  const isLoading = loadingRevenue || loadingProd || loadingPs || loadingTx || loadingCats;

  useEffect(() => {
    const unsubRevenue = syncCollection<RevenueRecord>('revenue', (items) => {
      setData(items);
      setLoadingRevenue(false);
    }, MOCK_DATA);

    const unsubProd = syncCollection<ProductionRecord>('production', (items) => {
      setProductionData(items);
      setLoadingProd(false);
    }, MOCK_PRODUCTION_DATA);

    const unsubPs = syncCollection<PSTerjualRecord>('ps_terjual', (items) => {
      setPsData(items);
      setLoadingPs(false);
    }, MOCK_PS_TERJUAL_DATA);

    const unsubTx = syncCollection<TransmissionRecord>('transmission', (items) => {
      setTransmissionData(items);
      setLoadingTx(false);
    }, MOCK_TRANSMISSION_DATA);

    const unsubCats = syncCategories((list) => {
      setCategories(list);
      setLoadingCats(false);
    }, DEFAULT_CATEGORIES);

    return () => {
      unsubRevenue();
      unsubProd();
      unsubPs();
      unsubTx();
      unsubCats();
    };
  }, []);

  useEffect(() => {
    if (isLoading || hasBackfilled) return;

    setHasBackfilled(true);

    const runBackfill = async () => {
      try {
        await autoBackfillRecords(data, productionData, psData, transmissionData);
      } catch (err) {
        console.error('Error in backfill:', err);
      }
    };

    runBackfill();
  }, [isLoading, hasBackfilled, data, productionData, psData, transmissionData]);

  const handleAddData = async (record: RevenueRecord) => {
    await saveDocument('revenue', record);
  };

  const handleUpdateData = async (updatedRecord: RevenueRecord) => {
    await saveDocument('revenue', updatedRecord);
  };

  const handleDeleteData = async (id: string) => {
    await removeDocument('revenue', id);
  };

  const handleUpdateCategories = async (newCategories: string[]) => {
    await saveCategories(newCategories);
  };

  const handleClearData = async () => {
    // Delete all records in all collections
    const deletePromises = [
      ...data.map(item => removeDocument('revenue', item.id)),
      ...productionData.map(item => removeDocument('production', item.id)),
      ...psData.map(item => removeDocument('ps_terjual', item.id)),
      ...transmissionData.map(item => removeDocument('transmission', item.id))
    ];
    await Promise.all(deletePromises);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-200">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-medium text-slate-400">Menghubungkan ke database cloud...</p>
      </div>
    );
  }

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView}>
      {currentView === 'dashboard' && (
        <DashboardView data={data} productionData={productionData} psData={psData} transmissionData={transmissionData} />
      )}
      {currentView === 'management' && (
        <DataManagementView 
          data={data} 
          productionData={productionData}
          psData={psData}
          transmissionData={transmissionData}
          categories={categories}
          onAddData={handleAddData}
          onUpdateData={handleUpdateData}
          onDeleteData={handleDeleteData}
          onAddProductionData={(record) => saveDocument('production', record)}
          onUpdateProductionData={(updated) => saveDocument('production', updated)}
          onDeleteProductionData={(id) => removeDocument('production', id)}
          onAddPsData={(record) => saveDocument('ps_terjual', record)}
          onUpdatePsData={(updated) => saveDocument('ps_terjual', updated)}
          onDeletePsData={(id) => removeDocument('ps_terjual', id)}
          onAddTransmissionData={(record) => saveDocument('transmission', record)}
          onUpdateTransmissionData={(updated) => saveDocument('transmission', updated)}
          onDeleteTransmissionData={(id) => removeDocument('transmission', id)}
        />
      )}
      {currentView === 'settings' && (
        <SettingsView 
          categories={categories}
          onUpdateCategories={handleUpdateCategories}
          onClearData={handleClearData}
        />
      )}
    </Layout>
  );
}

