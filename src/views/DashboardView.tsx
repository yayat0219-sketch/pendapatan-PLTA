import React, { useMemo, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { RevenueRecord, ProductionRecord, PSTerjualRecord, TransmissionRecord, MONTHS } from '../types';
import { formatRupiah } from '../lib/utils';
import { TrendingUp, Wallet, ArrowUpRight, BarChart2, PieChart as PieChartIcon, Zap } from 'lucide-react';

interface DashboardViewProps {
  data: RevenueRecord[];
  productionData?: ProductionRecord[];
  psData?: PSTerjualRecord[];
  transmissionData?: TransmissionRecord[];
}

const COLORS = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export function DashboardView({ data, productionData = [], psData = [], transmissionData = [] }: DashboardViewProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>('Semua');

  const filteredData = useMemo(() => {
    if (selectedMonth === 'Semua') return data;
    if (selectedMonth === 'Q1') return data.filter(d => ['Januari', 'Februari', 'Maret'].includes(d.month));
    if (selectedMonth === 'Q2') return data.filter(d => ['April', 'Mei', 'Juni'].includes(d.month));
    if (selectedMonth === 'Q3') return data.filter(d => ['Juli', 'Agustus', 'September'].includes(d.month));
    if (selectedMonth === 'Q4') return data.filter(d => ['Oktober', 'November', 'Desember'].includes(d.month));
    return data.filter(d => d.month === selectedMonth);
  }, [data, selectedMonth]);

  const filteredProductionData = useMemo(() => {
    if (selectedMonth === 'Semua') return productionData;
    if (selectedMonth === 'Q1') return productionData.filter(d => ['Januari', 'Februari', 'Maret'].includes(d.month));
    if (selectedMonth === 'Q2') return productionData.filter(d => ['April', 'Mei', 'Juni'].includes(d.month));
    if (selectedMonth === 'Q3') return productionData.filter(d => ['Juli', 'Agustus', 'September'].includes(d.month));
    if (selectedMonth === 'Q4') return productionData.filter(d => ['Oktober', 'November', 'Desember'].includes(d.month));
    return productionData.filter(d => d.month === selectedMonth);
  }, [productionData, selectedMonth]);

  // Aggregate totals
  const totalRevenue = useMemo(() => filteredData.reduce((sum, item) => sum + item.amount, 0), [filteredData]);
  const totalPln = useMemo(() => filteredData.filter(d => d.category === 'PLN (Persero)').reduce((sum, item) => sum + item.amount, 0), [filteredData]);
  const totalPs = useMemo(() => filteredData.filter(d => d.category !== 'PLN (Persero)').reduce((sum, item) => sum + item.amount, 0), [filteredData]);

  // Filtering Scale factor to dynamically calculate active targets (Quarter = 1/4, Month = 1/12, Semua = 1)
  const scaleFactor = useMemo(() => {
    if (selectedMonth === 'Semua') return 1;
    if (['Q1', 'Q2', 'Q3', 'Q4'].includes(selectedMonth)) return 0.25;
    return 1 / 12;
  }, [selectedMonth]);

  // RKAP Target Comparison (RKAP Target: Rp 612.174.500.594)
  const RKAP_TARGET = 612174500594;
  const currentRkapTarget = useMemo(() => RKAP_TARGET * scaleFactor, [scaleFactor]);
  const rkapPercentageCurrent = useMemo(() => (totalRevenue / currentRkapTarget) * 100, [totalRevenue, currentRkapTarget]);
  const annualRkapPercentage = useMemo(() => (totalRevenue / RKAP_TARGET) * 100, [totalRevenue]);

  // RKAP Netto Target Comparison (RKAP Netto Target: Rp 576.942.988.460)
  const RKAP_NETTO_TARGET = 576942988460;
  const currentRkapNettoTarget = useMemo(() => RKAP_NETTO_TARGET * scaleFactor, [scaleFactor]);
  const rkapNettoPercentageCurrent = useMemo(() => (totalRevenue / currentRkapNettoTarget) * 100, [totalRevenue, currentRkapNettoTarget]);
  const annualRkapNettoPercentage = useMemo(() => (totalRevenue / RKAP_NETTO_TARGET) * 100, [totalRevenue]);
  
  // Aggregate production totals
  const totalPlta = useMemo(() => filteredProductionData.reduce((sum, item) => sum + item.plta, 0), [filteredProductionData]);
  const totalMiniHydro = useMemo(() => filteredProductionData.reduce((sum, item) => sum + item.miniHydro, 0), [filteredProductionData]);
  const totalProduction = totalPlta + totalMiniHydro;
  const totalPlnKwh = useMemo(() => filteredProductionData.reduce((sum, item) => sum + (item.pln || 0), 0), [filteredProductionData]);
  const totalPsKwh = totalProduction - totalPlnKwh;

  // RKAP Production Target comparison (RKAP Production Target: 984.544.147 kWh)
  const RKAP_PRODUCTION_TARGET = 984544147;
  const currentProductionTarget = useMemo(() => RKAP_PRODUCTION_TARGET * scaleFactor, [scaleFactor]);
  const productionRkapPercentageCurrent = useMemo(() => (totalProduction / currentProductionTarget) * 100, [totalProduction, currentProductionTarget]);
  const annualProductionRkapPercentage = useMemo(() => (totalProduction / RKAP_PRODUCTION_TARGET) * 100, [totalProduction]);

  // RKAP PT PLN Production Target comparison (RKAP Target: 431.937.998 kWh)
  const RKAP_PLN_PRODUCTION_TARGET = 431937998;
  const currentPlnProductionTarget = useMemo(() => RKAP_PLN_PRODUCTION_TARGET * scaleFactor, [scaleFactor]);
  const plnProductionRkapPercentageCurrent = useMemo(() => (totalPlnKwh / currentPlnProductionTarget) * 100, [totalPlnKwh, currentPlnProductionTarget]);
  const annualPlnProductionRkapPercentage = useMemo(() => (totalPlnKwh / RKAP_PLN_PRODUCTION_TARGET) * 100, [totalPlnKwh]);

  // RKAP PS & Terjual Production Target comparison (RKAP Target: 552.606.149 kWh)
  const RKAP_PS_PRODUCTION_TARGET = 552606149;
  const currentPsProductionTarget = useMemo(() => RKAP_PS_PRODUCTION_TARGET * scaleFactor, [scaleFactor]);
  const psProductionRkapPercentageCurrent = useMemo(() => (totalPsKwh / currentPsProductionTarget) * 100, [totalPsKwh, currentPsProductionTarget]);
  const annualPsProductionRkapPercentage = useMemo(() => (totalPsKwh / RKAP_PS_PRODUCTION_TARGET) * 100, [totalPsKwh]);

  // Aggregate data for Line and Bar charts (Monthly totals)
  const monthlyData = useMemo(() => {
    return MONTHS.map(month => {
      const monthData = data.filter(d => d.month === month);
      const total = monthData.reduce((sum, item) => sum + item.amount, 0);
      
      // Also separate by category for stacked bars if we want to
      const byCategory = monthData.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + item.amount;
        return acc;
      }, {} as Record<string, number>);

      return {
        month,
        total,
        ...byCategory,
      };
    });
  }, [data]);

  // Aggregate data for PLN production trend chart
  const plnProductionMonthlyData = useMemo(() => {
    return MONTHS.map(month => {
      const prodRecord = productionData.find(p => p.month === month);
      return {
        month,
        pln: prodRecord ? prodRecord.pln : 0,
      };
    });
  }, [productionData]);

  // Aggregate data for non-PLN (Swasta + Penduduk) production trend chart
  const psProductionMonthlyData = useMemo(() => {
    return MONTHS.map(month => {
      const monthRecords = psData.filter(p => p.month === month);
      const swasta = monthRecords
        .filter(r => r.category === 'INDUSTRI / PERUSAHAAN')
        .reduce((sum, item) => sum + item.kwhValue, 0);
      const penduduk = monthRecords
        .filter(r => r.category === 'PERUMAHAN & WARUNG')
        .reduce((sum, item) => sum + item.kwhValue, 0);
      const total = swasta + penduduk;
      
      return {
        month,
        swasta,
        penduduk,
        total,
      };
    });
  }, [psData]);

  // Aggregate data for Pie chart (Total by category)
  const categoryData = useMemo(() => {
    const agg = filteredData.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(agg)
      .map(([name, value]) => ({ name, value: value as number }))
      .sort((a, b) => b.value - a.value);
  }, [filteredData]);

  const categories = Array.from(new Set(data.map(d => d.category)));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-800 shadow-xl rounded-lg p-3 text-sm text-slate-300">
          <p className="font-semibold text-white mb-1.5">{label}</p>
          {payload.map((entry: any, index: number) => {
            const isKwh = entry.unit === 'kWh' || entry.name.toLowerCase().includes('produksi') || entry.name.toLowerCase().includes('kwh');
            const valueFormatted = isKwh 
              ? `${new Intl.NumberFormat('id-ID').format(entry.value)} kWh` 
              : formatRupiah(entry.value);
            return (
              <div key={`item-${index}`} className="flex items-center gap-2 mb-1 last:mb-0">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.stroke }} />
                <span className="text-slate-400 capitalize">{entry.name}:</span>
                <span className="font-semibold text-white">{valueFormatted}</span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-lg font-bold text-white">Dashboard Statistik</h2>
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-1.5 shadow-sm">
          <label htmlFor="month-filter" className="text-sm font-medium text-slate-400 pl-2">Filter Periode:</label>
          <select 
            id="month-filter" 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-slate-800 border-none text-slate-200 text-sm rounded-md focus:ring-0 focus:outline-none block py-1.5 pr-8 pl-3 cursor-pointer hover:bg-slate-700 transition-colors appearance-none relative"
            style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%22%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right .7rem top 50%', backgroundSize: '.65rem auto' }}
          >
            <option value="Semua">Semua Waktu</option>
            <optgroup label="Pilihan Kuartal" className="text-indigo-400 bg-slate-900 font-semibold">
              <option value="Q1" className="text-slate-200">Quartal 1 (Jan - Mar)</option>
              <option value="Q2" className="text-slate-200">Quartal 2 (Apr - Jun)</option>
              <option value="Q3" className="text-slate-200">Quartal 3 (Jul - Sep)</option>
              <option value="Q4" className="text-slate-200">Quartal 4 (Okt - Des)</option>
            </optgroup>
            <optgroup label="Pilihan Bulan" className="text-indigo-400 bg-slate-900 font-semibold">
              {MONTHS.map(m => (
                 <option key={m} value={m} className="text-slate-200">{m}</option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[minmax(140px,auto)]">
      {/* Metrics Row */}
      <div className="col-span-1 row-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
        <div>
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2 block">Total Pendapatan</span>
          <div className="flex flex-col gap-1">
            <span className="text-2xl font-bold text-white tracking-tight">{formatRupiah(totalRevenue)}</span>
            <span className="text-emerald-400 text-xs font-medium">+ (2026)</span>
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-3">
          {/* RKAP Bruto */}
          <div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">
                {selectedMonth === 'Semua' ? 'RKAP Bruto Tahunan' : `RKAP Bruto ${selectedMonth}`}
              </span>
              <span className="text-emerald-400 font-semibold text-sm">
                {rkapPercentageCurrent.toFixed(2)}%
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
              <div 
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${Math.min(rkapPercentageCurrent, 100)}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1">
              <span>Target RKAP Bruto:</span>
              <span className="font-medium text-slate-300">
                {formatRupiah(currentRkapTarget)}
              </span>
            </div>
          </div>

          {/* RKAP Netto */}
          <div className="pt-2.5 border-t border-slate-800/40">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">
                {selectedMonth === 'Semua' ? 'RKAP Netto Tahunan' : `RKAP Netto ${selectedMonth}`}
              </span>
              <span className="text-cyan-400 font-semibold text-sm">
                {rkapNettoPercentageCurrent.toFixed(2)}%
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
              <div 
                className="bg-cyan-500 h-1.5 rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${Math.min(rkapNettoPercentageCurrent, 100)}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1">
              <span>Target RKAP Netto:</span>
              <span className="font-medium text-slate-300">
                {formatRupiah(currentRkapNettoTarget)}
              </span>
            </div>
          </div>

          {selectedMonth !== 'Semua' && (
            <div className="text-[10px] text-slate-500 flex flex-col gap-0.5 pt-2 border-t border-slate-800/40">
              <div className="flex justify-between items-center">
                <span>Kontribusi Bruto ke Tahunan:</span>
                <span className="text-slate-400 font-medium">{annualRkapPercentage.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Kontribusi Netto ke Tahunan:</span>
                <span className="text-slate-400 font-medium">{annualRkapNettoPercentage.toFixed(2)}%</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="col-span-1 row-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
        <div>
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2 block">Total Produksi</span>
          <div className="flex flex-col gap-1">
            <span className="text-2xl font-bold text-white tracking-tight">
              {new Intl.NumberFormat('id-ID').format(totalProduction)} <span className="text-sm font-normal text-slate-400">kWh</span>
            </span>
            <div className="flex justify-between items-center mt-1 text-[11px] gap-2">
               <span className="text-slate-400 text-ellipsis overflow-hidden whitespace-nowrap">PLTA: <span className="text-indigo-400 font-medium">{new Intl.NumberFormat('id-ID').format(totalPlta)}</span></span>
               <span className="text-slate-400 text-ellipsis overflow-hidden whitespace-nowrap">Mini: <span className="text-cyan-400 font-medium">{new Intl.NumberFormat('id-ID').format(totalMiniHydro)}</span></span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">
              {selectedMonth === 'Semua' ? 'Pencapaian RKAP Tahunan' : `Pencapaian RKAP ${selectedMonth}`}
            </span>
            <span className="text-indigo-400 font-semibold text-sm">
              {productionRkapPercentageCurrent.toFixed(2)}%
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${Math.min(productionRkapPercentageCurrent, 100)}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-500">
            <span>Target RKAP:</span>
            <span className="font-medium text-slate-300">
              {new Intl.NumberFormat('id-ID').format(Math.round(currentProductionTarget))} kWh
            </span>
          </div>
          {selectedMonth !== 'Semua' && (
            <div className="text-[10px] text-slate-500 flex justify-between items-center pt-0.5">
              <span>Kontribusi ke Tahunan:</span>
              <span className="text-slate-400 font-medium">{annualProductionRkapPercentage.toFixed(2)}%</span>
            </div>
          )}
        </div>
      </div>

      <div className="col-span-1 row-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
        <div>
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2 block">Produksi PT PLN</span>
          <div className="flex flex-col gap-1">
            <span className="text-2xl font-bold text-white tracking-tight">
              {new Intl.NumberFormat('id-ID').format(totalPlnKwh)} <span className="text-sm font-normal text-slate-400">kWh</span>
            </span>
            <div className="flex justify-between items-center mt-1 text-[11px]">
              <span className="text-slate-400">Pendapatan: <span className="text-indigo-400 font-medium">{formatRupiah(totalPln)}</span></span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">
              {selectedMonth === 'Semua' ? 'Pencapaian RKAP Tahunan' : `Pencapaian RKAP ${selectedMonth}`}
            </span>
            <span className="text-indigo-400 font-semibold text-sm">
              {plnProductionRkapPercentageCurrent.toFixed(2)}%
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${Math.min(plnProductionRkapPercentageCurrent, 100)}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-500">
            <span>Target RKAP:</span>
            <span className="font-medium text-slate-300">
              {new Intl.NumberFormat('id-ID').format(Math.round(currentPlnProductionTarget))} kWh
            </span>
          </div>
          {selectedMonth !== 'Semua' && (
            <div className="text-[10px] text-slate-500 flex justify-between items-center pt-0.5">
              <span>Kontribusi ke Tahunan:</span>
              <span className="text-slate-400 font-medium">{annualPlnProductionRkapPercentage.toFixed(2)}%</span>
            </div>
          )}
        </div>
      </div>

      <div className="col-span-1 row-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
        <div>
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2 block">Produksi PS & Terjual</span>
          <div className="flex flex-col gap-1">
            <span className="text-2xl font-bold text-white tracking-tight">
              {new Intl.NumberFormat('id-ID').format(totalPsKwh)} <span className="text-sm font-normal text-slate-400">kWh</span>
            </span>
            <div className="flex justify-between items-center mt-1 text-[11px] gap-2">
              <span className="text-slate-400">Pendapatan: <span className="text-cyan-400 font-medium">{formatRupiah(totalPs)}</span></span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">
              {selectedMonth === 'Semua' ? 'Pencapaian RKAP Tahunan' : `Pencapaian RKAP ${selectedMonth}`}
            </span>
            <span className="text-cyan-400 font-semibold text-sm">
              {psProductionRkapPercentageCurrent.toFixed(2)}%
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-cyan-500 h-1.5 rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${Math.min(psProductionRkapPercentageCurrent, 100)}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-500">
            <span>Target RKAP:</span>
            <span className="font-medium text-slate-300">
              {new Intl.NumberFormat('id-ID').format(Math.round(currentPsProductionTarget))} kWh
            </span>
          </div>
          {selectedMonth !== 'Semua' && (
            <div className="text-[10px] text-slate-500 flex justify-between items-center pt-0.5">
              <span>Kontribusi ke Tahunan:</span>
              <span className="text-slate-400 font-medium">{annualPsProductionRkapPercentage.toFixed(2)}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Line Chart */}
      <div className="col-span-1 md:col-span-2 row-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 relative flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-white font-bold">Tren Pendapatan Bulanan</h3>
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
            <div className="w-3 h-3 rounded-full bg-slate-700"></div>
          </div>
        </div>
        <div className="flex-1 w-full relative min-h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#94a3b8' }} 
                dy={10} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#94a3b8' }} 
                tickFormatter={(value) => `Rp ${(value / 1000000000).toFixed(0)}M`}
                dx={-10}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="total" 
                name="Total Pendapatan" 
                stroke="#6366f1" 
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, fill: '#1e293b' }}
                activeDot={{ r: 6, strokeWidth: 0, fill: '#6366f1' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* PT. PLN Production Line Chart */}
      <div id="pln-prod-trend-chart" className="col-span-1 md:col-span-2 row-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 relative flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-white font-bold">Tren Produksi PT PLN</h3>
            <p className="text-slate-500 text-[11px] mt-0.5">Tren volume penyaluran/produksi bulanan dalam kWh</p>
          </div>
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <div className="w-3 h-3 rounded-full bg-slate-700"></div>
          </div>
        </div>
        <div className="flex-1 w-full relative min-h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={plnProductionMonthlyData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#94a3b8' }} 
                dy={10} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#94a3b8' }} 
                tickFormatter={(value) => `${new Intl.NumberFormat('id-ID').format(Math.round(value / 1000000))} jt`}
                dx={-10}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="pln" 
                name="Produksi PT PLN" 
                unit="kWh"
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, fill: '#1e293b' }}
                activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Non-PLN (Swasta + Penduduk) Production Line Chart */}
      <div id="non-pln-prod-trend-chart" className="col-span-1 md:col-span-2 row-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 relative flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-white font-bold">Tren Penyaluran Non-PLN</h3>
            <p className="text-slate-500 text-[11px] mt-0.5">Tren penyaluran Swasta (Industri) & Penduduk</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block"></span>
              Swasta
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
              Penduduk
            </span>
          </div>
        </div>
        <div className="flex-1 w-full relative min-h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={psProductionMonthlyData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#94a3b8' }} 
                dy={10} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#94a3b8' }} 
                tickFormatter={(value) => `${new Intl.NumberFormat('id-ID').format(Math.round(value / 1000000))} jt`}
                dx={-10}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="swasta" 
                name="Volume Swasta (Industri)" 
                unit="kWh"
                stroke="#22d3ee" 
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, fill: '#1e293b' }}
                activeDot={{ r: 6, strokeWidth: 0, fill: '#22d3ee' }}
              />
              <Line 
                type="monotone" 
                dataKey="penduduk" 
                name="Volume Penduduk (Perumahan)" 
                unit="kWh"
                stroke="#fbbf24" 
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2, fill: '#1e293b' }}
                activeDot={{ r: 6, strokeWidth: 0, fill: '#fbbf24' }}
              />
              <Line 
                type="monotone" 
                dataKey="total" 
                name="Total Non-PLN" 
                unit="kWh"
                stroke="#a78bfa" 
                strokeWidth={2.5}
                strokeDasharray="4 4"
                dot={{ r: 3, strokeWidth: 1, fill: '#1e293b' }}
                activeDot={{ r: 5, strokeWidth: 0, fill: '#a78bfa' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart Section */}
      <div className="col-span-1 md:col-span-2 row-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1 flex flex-col justify-between w-full h-full">
          <div>
            <h3 className="text-white font-bold">Distribusi Kategori</h3>
            <p className="text-slate-500 text-xs mt-1">Sumbangan relatif per kategori tipe pemasukan.</p>
          </div>
          <div className="space-y-3 mt-4 flex-1 overflow-y-auto pr-2">
            {categoryData.slice(0, 5).map((entry, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-medium text-slate-300 truncate max-w-[140px]" title={entry.name}>
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="truncate">{entry.name}</span>
                </div>
                <div className="font-semibold text-white ml-2">
                  {((entry.value / totalRevenue) * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="w-48 h-48 relative flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => formatRupiah(value)}
                contentStyle={{ borderRadius: '8px', border: '1px solid #1e293b', backgroundColor: '#0f172a', color: '#f8fafc', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ color: '#f8fafc' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar Chart Section */}
      <div className="col-span-1 md:col-span-4 row-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col h-[400px]">
        <h3 className="text-white font-bold text-sm mb-6">Perbandingan Kategori per Bulan</h3>
        <div className="flex-1 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#94a3b8' }} 
                dy={10} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#94a3b8' }} 
                tickFormatter={(value) => `Rp ${(value / 1000000000).toFixed(0)}M`}
                dx={-10}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px', color: '#94a3b8' }} />
              {categories.map((category, index) => (
                <Bar 
                  key={category} 
                  dataKey={category} 
                  stackId="a" 
                  fill={COLORS[index % COLORS.length]} 
                  radius={index === categories.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
    </div>
  );
}
