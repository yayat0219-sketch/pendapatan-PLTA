import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { DashboardView } from './views/DashboardView';
import { DataManagementView } from './views/DataManagementView';
import { SettingsView } from './views/SettingsView';
import { ViewState, RevenueRecord, ProductionRecord, PSTerjualRecord, TransmissionRecord, DEFAULT_CATEGORIES } from './types';
import { MOCK_DATA, MOCK_PRODUCTION_DATA, MOCK_PS_TERJUAL_DATA, MOCK_TRANSMISSION_DATA } from './data/mockData';
import { saveDocument, removeDocument, syncCollection, syncCategories, saveCategories } from './lib/firebase';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [data, setData] = useState<RevenueRecord[]>([]);
  const [productionData, setProductionData] = useState<ProductionRecord[]>([]);
  const [psData, setPsData] = useState<PSTerjualRecord[]>([]);
  const [transmissionData, setTransmissionData] = useState<TransmissionRecord[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubRevenue = syncCollection<RevenueRecord>('revenue', (items) => {
      setData(items);
    }, MOCK_DATA);

    const unsubProd = syncCollection<ProductionRecord>('production', (items) => {
      setProductionData(items);
    }, MOCK_PRODUCTION_DATA);

    const unsubPs = syncCollection<PSTerjualRecord>('ps_terjual', (items) => {
      setPsData(items);
    }, MOCK_PS_TERJUAL_DATA);

    const unsubTx = syncCollection<TransmissionRecord>('transmission', (items) => {
      setTransmissionData(items);
    }, MOCK_TRANSMISSION_DATA);

    const unsubCats = syncCategories((list) => {
      setCategories(list);
      setIsLoading(false);
    }, DEFAULT_CATEGORIES);

    return () => {
      unsubRevenue();
      unsubProd();
      unsubPs();
      unsubTx();
      unsubCats();
    };
  }, []);

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

