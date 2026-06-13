import React, { useEffect, useState } from 'react';
import { pondService, waterQualityService } from '../services/api';
import { Pond, WaterQualityRecord } from '../types';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend 
} from 'recharts';
import { 
  Waves, Plus, Activity, Thermometer, Wind, 
  Compass, AlertCircle, Trash2, X 
} from 'lucide-react';

export default function WaterQualityPage() {
  const [ponds, setPonds] = useState<Pond[]>([]);
  const [selectedPondId, setSelectedPondId] = useState<number | null>(null);
  const [records, setRecords] = useState<WaterQualityRecord[]>([]);
  const [latestRecord, setLatestRecord] = useState<WaterQualityRecord | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [showLogModal, setShowLogModal] = useState(false);
  const [ph, setPh] = useState(7.2);
  const [temp, setTemp] = useState(28.0);
  const [doVal, setDoVal] = useState(5.0);
  const [salinity, setSalinity] = useState(1.0);
  const [ammonia, setAmmonia] = useState(0.01);
  const [notes, setNotes] = useState('');

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
      loadPondRecords(selectedPondId);
    }
  }, [selectedPondId]);

  const loadPondRecords = async (pondId: number) => {
    try {
      const history = await waterQualityService.getHistory(pondId, 7);
      setRecords(history);

      const latest = await waterQualityService.getLatest(pondId);
      setLatestRecord(latest);
    } catch (err) {
      setRecords([]);
      setLatestRecord(null);
    }
  };

  const handleLogMetrics = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPondId) return;

    try {
      await waterQualityService.recordWater(selectedPondId, {
        ph,
        temperature: temp,
        dissolvedOxygen: doVal,
        salinity,
        ammonia,
        notes,
        recordedAt: new Date().toISOString()
      });
      setShowLogModal(false);
      resetForm();
      loadPondRecords(selectedPondId);
    } catch (err) {
      alert('Gagal merekam kualitas air');
    }
  };

  const resetForm = () => {
    setPh(7.2);
    setTemp(28.0);
    setDoVal(5.0);
    setSalinity(1.0);
    setAmmonia(0.01);
    setNotes('');
  };

  // Helper formatting for dates in chart
  const chartData = records.map(r => ({
    time: new Date(r.recordedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
    pH: r.ph,
    Temp: r.temperature,
    DO: r.dissolvedOxygen,
    Salinity: r.salinity,
    Ammonia: r.ammonia
  }));

  return (
    <div className="space-y-8">
      
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-wide">Monitoring Kualitas Air</h2>
          <p className="text-sm text-gray-400">Parameter kimiawi dan fisik air kolam untuk pencegahan penyakit.</p>
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
            onClick={() => setShowLogModal(true)}
            disabled={!selectedPondId}
            className="bg-primary text-black font-bold px-5 py-3 rounded-xl hover:shadow-lg hover:shadow-primary/20 hover:scale-102 transition-all flex items-center gap-2 flex-1 sm:flex-none justify-center disabled:opacity-50"
          >
            <Plus className="h-5 w-5" />
            <span>Rekam Manual</span>
          </button>
        </div>
      </div>

      {/* Main content grid */}
      {!selectedPondId ? (
        <div className="text-center py-20 glass-panel rounded-3xl text-gray-500">
          <Waves className="h-16 w-16 mx-auto mb-4 text-gray-600 animate-pulse" />
          <h3 className="text-lg font-bold text-white mb-1">Pilih Kolam</h3>
          <p className="text-sm text-gray-400">Silakan tambahkan kolam terlebih dahulu di menu Ponds.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Latest Stats Panel */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold tracking-wide flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Kondisi Terakhir
            </h3>

            {latestRecord ? (
              <div className="grid grid-cols-1 gap-4">
                
                <div className="glass-panel p-5 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-sky-500/10 rounded-xl text-sky-400">
                      <Waves className="h-5.5 w-5.5" />
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 font-medium block">Kadar pH</span>
                      <span className="text-lg font-bold text-white mt-0.5">{latestRecord.ph}</span>
                    </div>
                  </div>
                  <span className={`text-xxs font-bold px-2 py-0.5 rounded-full ${
                    latestRecord.ph >= 6.5 && latestRecord.ph <= 8.5 ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400 animate-pulse'
                  }`}>
                    {latestRecord.ph >= 6.5 && latestRecord.ph <= 8.5 ? 'Optimal' : 'Bahaya'}
                  </span>
                </div>

                <div className="glass-panel p-5 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-orange-500/10 rounded-xl text-orange-400">
                      <Thermometer className="h-5.5 w-5.5" />
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 font-medium block">Suhu Air</span>
                      <span className="text-lg font-bold text-white mt-0.5">{latestRecord.temperature}°C</span>
                    </div>
                  </div>
                  <span className={`text-xxs font-bold px-2 py-0.5 rounded-full ${
                    latestRecord.temperature >= 25 && latestRecord.temperature <= 30 ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400 animate-pulse'
                  }`}>
                    {latestRecord.temperature >= 25 && latestRecord.temperature <= 30 ? 'Optimal' : 'Bahaya'}
                  </span>
                </div>

                <div className="glass-panel p-5 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
                      <Wind className="h-5.5 w-5.5" />
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 font-medium block">Dissolved Oxygen (DO)</span>
                      <span className="text-lg font-bold text-white mt-0.5">{latestRecord.dissolvedOxygen} mg/L</span>
                    </div>
                  </div>
                  <span className={`text-xxs font-bold px-2 py-0.5 rounded-full ${
                    latestRecord.dissolvedOxygen >= 4.0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400 animate-pulse'
                  }`}>
                    {latestRecord.dissolvedOxygen >= 4.0 ? 'Optimal' : 'Sangat Rendah'}
                  </span>
                </div>

                <div className="glass-panel p-5 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-teal-500/10 rounded-xl text-teal-400">
                      <Compass className="h-5.5 w-5.5" />
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 font-medium block">Salinitas / Kadar Garam</span>
                      <span className="text-lg font-bold text-white mt-0.5">{latestRecord.salinity} ppt</span>
                    </div>
                  </div>
                  <span className="text-xxs font-bold px-2 py-0.5 rounded-full bg-green-500/10 text-green-400">
                    Aman
                  </span>
                </div>

                <div className="glass-panel p-5 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-yellow-500/10 rounded-xl text-yellow-400">
                      <AlertCircle className="h-5.5 w-5.5" />
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 font-medium block">Amonia (NH3)</span>
                      <span className="text-lg font-bold text-white mt-0.5">{latestRecord.ammonia} mg/L</span>
                    </div>
                  </div>
                  <span className={`text-xxs font-bold px-2 py-0.5 rounded-full ${
                    latestRecord.ammonia < 0.05 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400 animate-pulse'
                  }`}>
                    {latestRecord.ammonia < 0.05 ? 'Optimal' : 'Toksik'}
                  </span>
                </div>

              </div>
            ) : (
              <p className="text-gray-500 text-sm glass-panel p-6 rounded-2xl">Belum ada data kualitas air tercatat.</p>
            )}
          </div>

          {/* Historical Trends Charts */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-lg font-bold tracking-wide">Tren Kualitas Air (7 Hari Terakhir)</h3>
            
            <div className="glass-panel p-6 rounded-3xl min-h-[350px] flex flex-col justify-between">
              {chartData.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  Tidak ada data grafik yang dapat dimuat. Tambahkan beberapa log terlebih dahulu.
                </div>
              ) : (
                <div className="w-full h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="time" stroke="gray" fontSize={11} />
                      <YAxis stroke="gray" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)' }} />
                      <Legend />
                      <Line type="monotone" dataKey="pH" stroke="#0ea5e9" strokeWidth={2.5} activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="Temp" stroke="#f97316" strokeWidth={2.5} />
                      <Line type="monotone" dataKey="DO" stroke="#10b981" strokeWidth={2.5} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* --- RECORD WATER LOG MODAL --- */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel p-8 rounded-3xl relative">
            <button onClick={() => setShowLogModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X className="h-6 w-6" />
            </button>
            
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Waves className="h-6 w-6 text-primary" />
              Input Parameter Kualitas Air
            </h3>

            <form onSubmit={handleLogMetrics} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2">pH Level</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={ph}
                    onChange={(e) => setPh(parseFloat(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2">Suhu Air (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={temp}
                    onChange={(e) => setTemp(parseFloat(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2">Dissolved O2 (DO)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={doVal}
                    onChange={(e) => setDoVal(parseFloat(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2">Salinitas (ppt)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={salinity}
                    onChange={(e) => setSalinity(parseFloat(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2">Amonia (mg/L)</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={ammonia}
                    onChange={(e) => setAmmonia(parseFloat(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">Catatan Tambahan</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Kondisi air agak keruh, ditambahkan kapur pertanian..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary h-20"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-black font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all mt-4"
              >
                Log Data Air
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
