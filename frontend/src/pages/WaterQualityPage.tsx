import React, { useEffect, useState } from 'react';
import { pondService, waterQualityService } from '../services/api';
import { Pond, WaterQualityRecord } from '../types';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend 
} from 'recharts';
import { 
  Waves, Plus, Activity, Thermometer, Wind, 
  Compass, AlertCircle, Trash2, X, Play, Square, Radio, Zap
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

  // IoT Simulation state
  const [isSimulating, setIsSimulating] = useState(false);
  const [simMode, setSimMode] = useState<'NORMAL' | 'ALERT'>('NORMAL');
  const [lastTickTime, setLastTickTime] = useState<string | null>(null);

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

  const triggerSimTick = async () => {
    if (!selectedPondId) return;
    try {
      await waterQualityService.simulateIot(selectedPondId, simMode);
      setLastTickTime(new Date().toLocaleTimeString('id-ID'));
      loadPondRecords(selectedPondId);
    } catch (err) {
      console.error('Failed to trigger simulation tick', err);
    }
  };

  useEffect(() => {
    let intervalId: any;
    if (isSimulating && selectedPondId) {
      triggerSimTick();

      intervalId = setInterval(() => {
        triggerSimTick();
      }, 4000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isSimulating, selectedPondId, simMode]);

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

      {/* IoT Simulation Panel */}
      {selectedPondId && (
        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden border border-slate-200/50 shadow-md">
          {/* Decorative background grid/radiant */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-2xl -z-10" />
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-primary/10 rounded-lg text-primary">
                  <Radio className="h-4 w-4 animate-pulse" />
                </span>
                <h3 className="font-extrabold text-white text-base">Simulasi Sensor IoT (ESP32)</h3>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase ${
                  isSimulating ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isSimulating ? 'bg-green-400 animate-ping' : 'bg-slate-500'}`} />
                  {isSimulating ? 'Live Streaming' : 'Offline'}
                </span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Menirukan perangkat ESP32 yang mengirimkan pH, DO, suhu, dll secara berkala ke MQTT Broker. Kamu bisa mensimulasikan kondisi normal atau memicu alarm bahaya untuk menguji sistem peringatan dini.
              </p>
              {lastTickTime && (
                <p className="text-[10px] text-gray-500 font-medium">
                  Pengiriman data terakhir: <span className="text-primary font-bold">{lastTickTime}</span>
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {/* Mode Selector */}
              <div className="flex bg-slate-900/60 p-1 rounded-xl border border-white/5">
                <button
                  onClick={() => setSimMode('NORMAL')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    simMode === 'NORMAL' 
                      ? 'bg-primary text-black font-bold shadow-sm' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Normal (Aman)
                </button>
                <button
                  onClick={() => setSimMode('ALERT')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    simMode === 'ALERT' 
                      ? 'bg-yellow-500 text-black font-bold shadow-sm' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Bahaya (Alert)
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={triggerSimTick}
                  disabled={isSimulating}
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-semibold transition-all border border-white/10 flex items-center gap-1.5 disabled:opacity-50"
                  title="Kirim 1 paket data sekarang"
                >
                  <Zap className="h-3.5 w-3.5 text-primary" />
                  Kirim Sekali
                </button>

                <button
                  onClick={() => setIsSimulating(!isSimulating)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isSimulating 
                      ? 'bg-red-500/25 text-red-400 border border-red-500/30 hover:bg-red-500/30' 
                      : 'bg-primary text-black hover:shadow-lg hover:shadow-primary/10'
                  }`}
                >
                  {isSimulating ? (
                    <>
                      <Square className="h-3.5 w-3.5 fill-red-400 stroke-none" />
                      Hentikan Stream
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 fill-black stroke-none" />
                      Mulai Stream (4s)
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
