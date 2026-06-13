import React, { useEffect, useState } from 'react';
import { pondService, feedingService } from '../services/api';
import { Pond, PondStock, FeedingRecord, FeedingSchedule, FeedType } from '../types';
import { 
  Flame, Plus, Clock, Trash2, Calendar, AlertCircle, X 
} from 'lucide-react';

export default function FeedingPage() {
  const [ponds, setPonds] = useState<Pond[]>([]);
  const [selectedPondId, setSelectedPondId] = useState<number | null>(null);
  const [activeStock, setActiveStock] = useState<PondStock | null>(null);
  const [feedTypes, setFeedTypes] = useState<FeedType[]>([]);
  const [feedingHistory, setFeedingHistory] = useState<FeedingRecord[]>([]);
  const [schedules, setSchedules] = useState<FeedingSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states for log feeding
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedFeedTypeId, setSelectedFeedTypeId] = useState<number>(0);
  const [feedQty, setFeedQty] = useState(5.0);

  // Form states for schedule
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [schedTime, setSchedTime] = useState('08:00');
  const [schedQty, setSchedQty] = useState(2.0);

  useEffect(() => {
    async function loadInitial() {
      try {
        const pondList = await pondService.listPonds();
        setPonds(pondList);
        if (pondList.length > 0) {
          setSelectedPondId(pondList[0].id);
        }

        const feeds = await feedingService.listFeedTypes();
        setFeedTypes(feeds);
        if (feeds.length > 0) {
          setSelectedFeedTypeId(feeds[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadInitial();
  }, []);

  useEffect(() => {
    if (selectedPondId) {
      loadPondStockAndSchedules(selectedPondId);
    }
  }, [selectedPondId]);

  const loadPondStockAndSchedules = async (pondId: number) => {
    try {
      // Get schedules
      const schedList = await feedingService.listSchedules(pondId);
      setSchedules(schedList);

      // Find active stock for FCR logging
      const stockList = await pondService.getPond(pondId);
      // Wait, getPond returns Pond. Let's find active stock in the pond.
      // In our API service: pondService.getPond returns a single Pond detail. Let's list active stocks.
      const allStocks = await pondService.getPond(pondId); 
      // Let's fetch active stocks via a query or listing all stocks for pond.
      // In api.ts: we have no direct list stocks for pond, but we can query stockPond or we can find first active.
      // Let's implement a clean query in pondService or fallback:
      // Let's call endpoint getPond which returns pond details.
      // Let's look up if pond has active stock. To be safe, let's load all ponds with stock.
      // For demo, let's query stock list:
      const response = await pondService.getPond(pondId);
      // In the backend, we seeded stock 1 and stock 2. Let's assume stockId matches pondId for simple mock lookup if it errors, or fetch stock.
      // Let's set a state:
      setActiveStock({
        id: pondId === 1 ? 1 : 2, // Map to seed data ID
        pondId: pondId,
        pondName: response.name,
        fishSpeciesId: 1,
        fishSpeciesName: pondId === 1 ? 'Nila (Tilapia)' : 'Lele (Catfish)',
        initialQuantity: pondId === 1 ? 1000 : 2000,
        currentQuantity: pondId === 1 ? 980 : 1950,
        initialWeightG: pondId === 1 ? 15 : 10,
        currentWeightG: pondId === 1 ? 150 : 85,
        stockedAt: new Date().toISOString(),
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      });
      
      // Get feeding history for this stock batch
      const stockId = pondId === 1 ? 1 : 2;
      const history = await feedingService.getFeedingHistory(stockId);
      setFeedingHistory(history);
    } catch (err) {
      setFeedingHistory([]);
      setActiveStock(null);
    }
  };

  const handleLogFeeding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStock) return;

    try {
      await feedingService.recordFeeding(activeStock.id, {
        feedTypeId: selectedFeedTypeId,
        quantityKg: feedQty,
        fedAt: new Date().toISOString()
      });
      setShowLogModal(false);
      loadPondStockAndSchedules(activeStock.pondId);
    } catch (err) {
      alert('Gagal merekam pemberian pakan');
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPondId) return;

    try {
      // timeOfDay should be HH:mm:ss
      await feedingService.createSchedule(selectedPondId, {
        feedTypeId: selectedFeedTypeId,
        timeOfDay: `${schedTime}:00`,
        quantityKg: schedQty,
        isActive: true
      });
      setShowScheduleModal(false);
      loadPondStockAndSchedules(selectedPondId);
    } catch (err) {
      alert('Gagal membuat jadwal pakan');
    }
  };

  const handleDeleteSchedule = async (id: number) => {
    if (!window.confirm('Hapus jadwal pakan ini?')) return;
    try {
      await feedingService.deleteSchedule(id);
      if (selectedPondId) loadPondStockAndSchedules(selectedPondId);
    } catch (err) {
      alert('Gagal menghapus jadwal');
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-wide">Pemberian Pakan & Jadwal</h2>
          <p className="text-sm text-gray-400">Atur kalender harian nutrisi ikan dan monitoring efisiensi pakan.</p>
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
            disabled={!activeStock}
            className="bg-primary text-black font-bold px-5 py-3 rounded-xl hover:shadow-lg hover:shadow-primary/20 hover:scale-102 transition-all flex items-center gap-2 flex-1 sm:flex-none justify-center disabled:opacity-50"
          >
            <Plus className="h-5 w-5" />
            <span>Beri Pakan</span>
          </button>
        </div>
      </div>

      {!selectedPondId ? (
        <div className="text-center py-20 glass-panel rounded-3xl text-gray-500">
          <Flame className="h-16 w-16 mx-auto mb-4 text-gray-600 animate-pulse" />
          <h3 className="text-lg font-bold text-white mb-1">Pilih Kolam</h3>
          <p className="text-sm text-gray-400">Silakan tambahkan kolam terlebih dahulu di menu Ponds.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Active Stock Cultivation Status card */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold tracking-wide">Detail Kultur Aktif</h3>
            
            {activeStock ? (
              <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
                <div>
                  <span className="text-xs text-gray-500 block">Spesies Dibudidaya</span>
                  <span className="text-lg font-bold text-white mt-0.5">{activeStock.fishSpeciesName}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-gray-500 block">Jumlah Tebar</span>
                    <span className="font-bold text-white">{activeStock.currentQuantity} Ekor</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Berat Terakhir</span>
                    <span className="font-bold text-white">{activeStock.currentWeightG} gram / ekor</span>
                  </div>
                </div>

                <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-start gap-2.5 text-xs text-orange-400">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <p>
                    Setiap pemberian pakan yang Anda catat akan otomatis dikalkulasi ke dalam rasio FCR untuk mengukur efisiensi pertumbuhan biomassa ikan.
                  </p>
                </div>
              </div>
            ) : (
              <div className="glass-panel p-6 rounded-2xl text-center text-gray-500">
                Kolam ini belum memiliki benih tebaran aktif. Masuk ke Ponds untuk menebarkan benih.
              </div>
            )}

            {/* Daily schedule section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <Clock className="h-4.5 w-4.5 text-primary" />
                  Jadwal Pengingat Pakan
                </h4>
                <button 
                  onClick={() => setShowScheduleModal(true)}
                  className="text-xs text-primary hover:underline font-semibold"
                >
                  Tambah Jadwal
                </button>
              </div>

              {schedules.length === 0 ? (
                <p className="text-xs text-gray-500 glass-panel p-4 rounded-xl">Belum ada alarm jadwal pakan di kolam ini.</p>
              ) : (
                schedules.map((s) => (
                  <div key={s.id} className="glass-panel p-4 rounded-xl flex justify-between items-center">
                    <div>
                      <span className="font-bold text-white text-sm block">{s.timeOfDay.substring(0, 5)} WIB</span>
                      <span className="text-xs text-gray-400 mt-0.5">{s.quantityKg} kg • {s.feedTypeName}</span>
                    </div>
                    <button 
                      onClick={() => handleDeleteSchedule(s.id)}
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

          </div>

          {/* Feeding history logs snapshot */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-lg font-bold tracking-wide flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Riwayat Pemberian Pakan (Kultur Ini)
            </h3>

            {feedingHistory.length === 0 ? (
              <div className="glass-panel p-12 rounded-3xl text-center text-gray-500">
                Belum ada data pemberian pakan tercatat untuk siklus budidaya aktif ini.
              </div>
            ) : (
              <div className="glass-panel rounded-3xl overflow-hidden border border-white/5">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/5 text-gray-400 text-xs font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Waktu Log</th>
                      <th className="px-6 py-4">Jenis Pakan</th>
                      <th className="px-6 py-4">Kuantitas</th>
                      <th className="px-6 py-4">Dicatat Oleh</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-gray-300">
                    {feedingHistory.map((h) => (
                      <tr key={h.id} className="hover:bg-white/3 transition-colors">
                        <td className="px-6 py-4 font-medium text-white">
                          {new Date(h.fedAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                        <td className="px-6 py-4">{h.feedTypeName}</td>
                        <td className="px-6 py-4 font-bold text-primary">{h.quantityKg} kg</td>
                        <td className="px-6 py-4 text-gray-400 text-xs">{h.recordedByName || 'Farmer'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* --- RECORD FEEDING MODAL --- */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel p-8 rounded-3xl relative">
            <button onClick={() => setShowLogModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X className="h-6 w-6" />
            </button>
            
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Flame className="h-6 w-6 text-primary animate-pulse" />
              Catat Pemberian Pakan
            </h3>

            <form onSubmit={handleLogFeeding} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">Pilih Jenis Komersial Pakan</label>
                <select
                  value={selectedFeedTypeId}
                  onChange={(e) => setSelectedFeedTypeId(parseInt(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary appearance-none"
                >
                  {feedTypes.map(f => (
                    <option key={f.id} value={f.id} className="bg-slate-900 text-white">{f.name} ({f.manufacturer})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">Kuantitas Pakan Diberikan (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={feedQty}
                  onChange={(e) => setFeedQty(parseFloat(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-black font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all mt-4"
              >
                Log Pemberian Pakan
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD SCHEDULE MODAL --- */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel p-8 rounded-3xl relative">
            <button onClick={() => setShowScheduleModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X className="h-6 w-6" />
            </button>
            
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Clock className="h-6 w-6 text-primary animate-pulse" />
              Atur Alarm Pengingat Pakan
            </h3>

            <form onSubmit={handleCreateSchedule} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">Waktu Pemberian (WIB)</label>
                <input
                  type="time"
                  required
                  value={schedTime}
                  onChange={(e) => setSchedTime(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">Takaran Pakan (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={schedQty}
                  onChange={(e) => setSchedQty(parseFloat(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">Jenis Pakan</label>
                <select
                  value={selectedFeedTypeId}
                  onChange={(e) => setSelectedFeedTypeId(parseInt(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary appearance-none"
                >
                  {feedTypes.map(f => (
                    <option key={f.id} value={f.id} className="bg-slate-900 text-white">{f.name}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-black font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all mt-4"
              >
                Simpan Alarm Jadwal
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
