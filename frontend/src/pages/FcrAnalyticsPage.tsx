import React, { useEffect, useState } from 'react';
import { pondService, fcrService } from '../services/api';
import { Pond, FcrReport, FcrRecord } from '../types';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend 
} from 'recharts';
import { 
  LineChart as ChartIcon, Sparkles, Scale, RefreshCw, 
  HelpCircle, ChevronRight, Activity, AlertTriangle, CheckCircle2
} from 'lucide-react';

export default function FcrAnalyticsPage() {
  const [ponds, setPonds] = useState<Pond[]>([]);
  const [selectedPondId, setSelectedPondId] = useState<number | null>(null);
  const [report, setReport] = useState<FcrReport | null>(null);
  const [history, setHistory] = useState<FcrRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // AI Prediction state
  const [aiForecast, setAiForecast] = useState<any | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Form states to update current weight
  const [showWeightForm, setShowWeightForm] = useState(false);
  const [newWeight, setNewWeight] = useState(150.0);
  const [newQty, setNewQty] = useState(950);

  useEffect(() => {
    async function loadPonds() {
      try {
        const pondList = await pondService.listPonds();
        setPonds(pondList);
        if (pondList.length > 0) {
          setSelectedPondId(pondList[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadPonds();
  }, []);

  useEffect(() => {
    if (selectedPondId) {
      loadFcrReport(selectedPondId);
    }
  }, [selectedPondId]);

  const loadFcrReport = async (pondId: number) => {
    try {
      const stockId = pondId === 1 ? 1 : 2;
      const dataReport = await fcrService.getReport(stockId);
      setReport(dataReport);
      
      const dataHistory = await fcrService.getHistory(stockId);
      setHistory(dataHistory);

      // Prepopulate form
      setNewWeight(dataReport.currentWeightKg * 1000);
      setNewQty(dataReport.currentQuantity);

      // Load AI Forecast
      setLoadingAi(true);
      try {
        const dataForecast = await fcrService.getAiForecast(stockId);
        setAiForecast(dataForecast);
      } catch (aiErr) {
        console.error('Failed to load AI Forecast', aiErr);
        setAiForecast(null);
      } finally {
        setLoadingAi(false);
      }
    } catch (err) {
      setReport(null);
      setHistory([]);
      setAiForecast(null);
    }
  };

  const handleUpdateWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPondId) return;

    try {
      const stockId = selectedPondId === 1 ? 1 : 2;
      await pondService.updateWeight(stockId, newWeight, newQty);
      setShowWeightForm(false);
      loadFcrReport(selectedPondId);
    } catch (err) {
      alert('Gagal memperbarui berat ikan');
    }
  };

  const chartData = [...history].reverse().map(h => ({
    date: new Date(h.calculationDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
    FCR: h.fcrValue,
    Feed: h.totalFeedGivenKg,
    Biomass: h.totalBiomassGainKg
  }));

  return (
    <div className="space-y-8">
      
      {/* Header and selection */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-wide">Analitik FCR (Food Conversion Ratio)</h2>
          <p className="text-sm text-gray-400">Efisiensi pakan kultur: perbandingan pakan masuk dengan pertambahan daging ikan.</p>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto">
          {ponds.length > 0 && (
            <select
              value={selectedPondId || ''}
              onChange={(e) => setSelectedPondId(parseInt(e.target.value))}
              className="bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary flex-1 sm:flex-none"
            >
              {ponds.map(p => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-white">{p.name}</option>
              ))}
            </select>
          )}

          <button
            onClick={() => loadFcrReport(selectedPondId || 1)}
            disabled={!selectedPondId}
            className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors disabled:opacity-50"
          >
            <RefreshCw className="h-5 w-5 text-gray-400" />
          </button>
        </div>
      </div>

      {!selectedPondId ? (
        <div className="text-center py-20 glass-panel rounded-3xl text-gray-500">
          <ChartIcon className="h-16 w-16 mx-auto mb-4 text-gray-600 animate-pulse" />
          <h3 className="text-lg font-bold text-white mb-1">Pilih Kolam</h3>
          <p className="text-sm text-gray-400">Silakan tambahkan kolam terlebih dahulu di menu Ponds.</p>
        </div>
      ) : !report ? (
        <div className="text-center py-20 glass-panel rounded-3xl text-gray-500">
          <Activity className="h-16 w-16 mx-auto mb-4 text-gray-600 animate-pulse" />
          <h3 className="text-lg font-bold text-white mb-1">Kultur Belum Menebar Benih</h3>
          <p className="text-sm text-gray-400">Tebarkan bibit budidaya di menu Kolam & Bibit untuk mengaktifkan kalkulasi FCR.</p>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* FCR dashboard cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="glass-panel p-6 rounded-2xl flex items-center justify-between border-l-4 border-primary shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl -z-10" />
              <div>
                <span className="text-xs font-semibold text-gray-400 block uppercase">FCR Budidaya Saat Ini</span>
                <h3 className="text-4xl font-black text-white mt-1">{report.currentFcr}</h3>
                <p className={`text-xs font-bold mt-1.5 ${
                  report.currentFcr <= 1.2 ? 'text-green-400' : report.currentFcr <= 1.5 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {report.currentFcr <= 1.2 ? 'Luar Biasa Efisien' : report.currentFcr <= 1.5 ? 'Efisien Normal' : 'Pemborosan Pakan!'}
                </p>
              </div>
              <div className="p-3 bg-primary/20 rounded-xl">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl flex items-center justify-between border-l-4 border-orange-500 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-xl -z-10" />
              <div>
                <span className="text-xs font-semibold text-gray-400 block uppercase">Total Pakan Diberikan</span>
                <h3 className="text-4xl font-black text-white mt-1">{report.totalFeedGivenKg} kg</h3>
                <p className="text-xs text-gray-400 mt-1.5">Siklus Kultur Akif</p>
              </div>
              <div className="p-3 bg-orange-500/20 rounded-xl">
                <Activity className="h-6 w-6 text-orange-400" />
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl flex items-center justify-between border-l-4 border-emerald-500 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl -z-10" />
              <div>
                <span className="text-xs font-semibold text-gray-400 block uppercase">Pertambahan Biomassa</span>
                <h3 className="text-4xl font-black text-white mt-1">+{report.totalBiomassGainKg.toFixed(2)} kg</h3>
                <p className="text-xs text-emerald-400 mt-1.5 font-medium">Berdasarkan sampling timbangan</p>
              </div>
              <div className="p-3 bg-emerald-500/20 rounded-xl">
                <Scale className="h-6 w-6 text-emerald-400" />
              </div>
            </div>

          </div>

          {/* AI Assistant Predictions & Recommendation Panel */}
          <div className="glass-panel p-6 rounded-3xl border border-primary/20 shadow-xl relative overflow-hidden mb-8">
            {/* Ambient light glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-4 mb-5 gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-primary/10 rounded-xl text-primary animate-pulse">
                  <Sparkles className="h-5.5 w-5.5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">Asisten AI e-Fish</h3>
                  <p className="text-xs text-gray-400">Analisis kondisi ekologis air & perkiraan konversi pakan secara prediktif.</p>
                </div>
              </div>
              
              {loadingAi ? (
                <span className="text-xs text-gray-500 animate-pulse">Menganalisis data...</span>
              ) : aiForecast ? (
                <span className={`text-[10px] font-black tracking-wider uppercase px-3 py-1 rounded-full border ${
                  aiForecast.analysisStatus.includes("EXCELLENT") 
                    ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                    : aiForecast.analysisStatus.includes("WARNING") 
                      ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' 
                      : 'bg-red-500/10 text-red-400 border-red-500/20 animate-pulse'
                }`}>
                  {aiForecast.analysisStatus}
                </span>
              ) : (
                <span className="text-xs text-gray-500">Data telemetri belum cukup</span>
              )}
            </div>

            {loadingAi ? (
              <div className="text-center py-6 text-gray-500 text-sm">
                Asisten AI sedang menghitung estimasi FCR & biomassa...
              </div>
            ) : !aiForecast ? (
              <div className="text-center py-6 text-gray-500 text-sm">
                Tambahkan log kualitas air & pakan terlebih dahulu untuk menghasilkan rekomendasi AI.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. FCR Forecast */}
                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wider animate-pulse">Prediksi FCR (15 Hari)</span>
                    <h4 className="text-3xl font-black text-white mt-2">{aiForecast.predictedFcr}</h4>
                  </div>
                  <div className="text-xs text-sky-400 font-semibold mt-4 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-sky-400 animate-bounce" />
                    <span>Tingkat Kepercayaan: {Math.round(aiForecast.confidenceLevel * 100)}%</span>
                  </div>
                </div>

                {/* 2. Feed recommendation */}
                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wider">Rekomendasi Pakan Harian</span>
                    <h4 className="text-3xl font-black text-white mt-2">{aiForecast.recommendedFeedQuantityKg} kg</h4>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-4 leading-relaxed">
                    Dosis pakan disesuaikan otomatis dengan kondisi air saat ini agar nafsu makan ikan optimal.
                  </p>
                </div>

                {/* 3. Harvest readiness */}
                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wider">Kesiapan Panen</span>
                    <h4 className="text-3xl font-black text-white mt-2">{Math.round(aiForecast.harvestReadyProbability * 100)}%</h4>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full mt-4 overflow-hidden">
                    <div 
                      className="h-full bg-emerald-400 rounded-full transition-all duration-500" 
                      style={{ width: `${aiForecast.harvestReadyProbability * 100}%` }}
                    />
                  </div>
                </div>

                {/* Recommendation notes */}
                <div className="col-span-1 md:col-span-3 p-4 bg-slate-900/60 rounded-2xl border border-white/5 mt-2">
                  <h5 className="text-xs font-extrabold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Activity className="h-4 w-4 text-primary" />
                    Analisis Kondisi Kolam & Rencana Tindakan AI
                  </h5>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {aiForecast.recommendationNotes}
                  </p>
                </div>

              </div>
            )}
          </div>

          {/* Split layout: graph vs sampling updates */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Recharts trend */}
            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-xl font-bold tracking-wide">Grafik Pergerakan FCR</h3>
              <div className="glass-panel p-6 rounded-3xl h-80">
                {chartData.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    Belum ada data untuk dimuat di grafik.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="date" stroke="gray" fontSize={11} />
                      <YAxis stroke="gray" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)' }} />
                      <Legend />
                      <Line type="monotone" dataKey="FCR" stroke="#0ea5e9" strokeWidth={2.5} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Weighing sampling logging form */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold tracking-wide">Sampling Timbangan Ikan</h3>
              
              <div className="glass-panel p-6 rounded-3xl space-y-4">
                <h4 className="font-bold text-white text-sm">Catat Hasil Timbangan Baru</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Lakukan penimbangan sampling terhadap 10-20 ekor ikan secara rutin seminggu sekali untuk memperbarui estimasi berat rata-rata dan populasi saat ini.
                </p>

                <form onSubmit={handleUpdateWeight} className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-2">Berat Rata-rata Saat Ini (gram)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={newWeight}
                      onChange={(e) => setNewWeight(parseFloat(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-2">Perkiraan Populasi Hidup (ekor)</label>
                    <input
                      type="number"
                      required
                      value={newQty}
                      onChange={(e) => setNewQty(parseInt(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-primary text-black font-bold py-3 rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all"
                  >
                    Simpan & Hitung FCR
                  </button>
                </form>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
