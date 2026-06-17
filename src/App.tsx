import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { DashboardView } from './views/DashboardView';
import { DataManagementView } from './views/DataManagementView';
import { SettingsView } from './views/SettingsView';
import { useLocalStorage } from './hooks/useLocalStorage';
import { ViewState, RevenueRecord, ProductionRecord, PSTerjualRecord, TransmissionRecord, DEFAULT_CATEGORIES } from './types';
import { MOCK_DATA, MOCK_PRODUCTION_DATA, MOCK_PS_TERJUAL_DATA, MOCK_TRANSMISSION_DATA } from './data/mockData';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [data, setData] = useLocalStorage<RevenueRecord[]>('revtrack-data', MOCK_DATA);
  const [productionData, setProductionData] = useLocalStorage<ProductionRecord[]>('revtrack-production-data-v3', MOCK_PRODUCTION_DATA);
  const [psData, setPsData] = useLocalStorage<PSTerjualRecord[]>('revtrack-ps-data', MOCK_PS_TERJUAL_DATA);
  const [transmissionData, setTransmissionData] = useLocalStorage<TransmissionRecord[]>('revtrack-transmission-data-v1', MOCK_TRANSMISSION_DATA);
  const [categories, setCategories] = useLocalStorage<string[]>('revtrack-categories', DEFAULT_CATEGORIES);

  const handleAddData = (record: RevenueRecord) => {
    setData([...data, record]);
  };

  const handleUpdateData = (updatedRecord: RevenueRecord) => {
    setData(data.map(item => item.id === updatedRecord.id ? updatedRecord : item));
  };

  const handleDeleteData = (id: string) => {
    setData(data.filter(item => item.id !== id));
  };

  const handleUpdateCategories = (newCategories: string[]) => {
    setCategories(newCategories);
  };

  const handleClearData = () => {
    setData([]);
    setPsData([]);
    setTransmissionData([]);
  };

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
          onAddProductionData={(record) => setProductionData([...productionData, record])}
          onUpdateProductionData={(updated) => setProductionData(productionData.map(item => item.id === updated.id ? updated : item))}
          onDeleteProductionData={(id) => setProductionData(productionData.filter(item => item.id !== id))}
          onAddPsData={(record) => setPsData([...psData, record])}
          onUpdatePsData={(updated) => setPsData(psData.map(item => item.id === updated.id ? updated : item))}
          onDeletePsData={(id) => setPsData(psData.filter(item => item.id !== id))}
          onAddTransmissionData={(record) => setTransmissionData([...transmissionData, record])}
          onUpdateTransmissionData={(updated) => setTransmissionData(transmissionData.map(item => item.id === updated.id ? updated : item))}
          onDeleteTransmissionData={(id) => setTransmissionData(transmissionData.filter(item => item.id !== id))}
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
