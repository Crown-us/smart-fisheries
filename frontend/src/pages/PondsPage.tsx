import React, { useEffect, useState } from 'react';
import { pondService } from '../services/api';
import { Pond, FishSpecies, PondStock } from '../types';
import { 
  Database, Plus, Trash2, Calendar, Waves, CheckCircle, 
  HelpCircle, ChevronDown, Check, X, ShieldAlert
} from 'lucide-react';

export default function PondsPage() {
  const [ponds, setPonds] = useState<Pond[]>([]);
  const [species, setSpecies] = useState<FishSpecies[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states for creating pond
  const [showPondModal, setShowPondModal] = useState(false);
  const [pondName, setPondName] = useState('');
  const [pondLoc, setPondLoc] = useState('');
  const [pondLength, setPondLength] = useState(10);
  const [pondWidth, setPondWidth] = useState(5);
  const [pondDepth, setPondDepth] = useState(1.5);
  const [waterSrc, setWaterSrc] = useState('Spring Water');

  // Form states for stocking pond
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedPondId, setSelectedPondId] = useState<number | null>(null);
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<number>(0);
  const [stockQty, setStockQty] = useState(1000);
  const [initialWeight, setInitialWeight] = useState(15);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const pondList = await pondService.listPonds();
      setPonds(pondList);

      const speciesList = await pondService.listFishSpecies();
      setSpecies(speciesList);
      if (speciesList.length > 0) {
        setSelectedSpeciesId(speciesList[0].id);
      }
    } catch (err) {
      console.error('Error loading ponds data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePond = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await pondService.createPond({
        name: pondName,
        location: pondLoc,
        length: pondLength,
        width: pondWidth,
        depth: pondDepth,
        waterSource: waterSrc,
        status: 'ACTIVE'
      });
      setShowPondModal(false);
      resetPondForm();
      loadData();
    } catch (err) {
      alert('Gagal membuat kolam');
    }
  };

  const handleDeletePond = async (pondId: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus kolam ini? Seluruh data sejarah di dalamnya akan dihapus.')) return;
    try {
      await pondService.deletePond(pondId);
      loadData();
    } catch (err) {
      alert('Gagal menghapus kolam');
    }
  };

  const handleStockPond = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPondId) return;

    try {
      await pondService.stockPond(selectedPondId, {
        fishSpeciesId: selectedSpeciesId,
        initialQuantity: stockQty,
        initialWeightG: initialWeight,
        stockedAt: new Date().toISOString()
      });
      setShowStockModal(false);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menebarkan benih');
    }
  };

  const resetPondForm = () => {
    setPondName('');
    setPondLoc('');
    setPondLength(10);
    setPondWidth(5);
    setPondDepth(1.5);
    setWaterSrc('Spring Water');
  };

  return (
    <div className="space-y-6">
      
      {/* Header section with actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-wide">Kolam & Penyebaran Benih</h2>
          <p className="text-sm text-gray-400">Atur wadah air, spesies bibit, dan siklus panen budidaya Anda.</p>
        </div>
        <button 
          onClick={() => setShowPondModal(true)}
          className="bg-primary text-black font-bold px-5 py-3 rounded-xl hover:shadow-lg hover:shadow-primary/20 hover:scale-102 transition-all flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          <span>Tambah Kolam Baru</span>
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Memuat data kolam...</p>
      ) : ponds.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-3xl text-gray-500">
          <Database className="h-16 w-16 mx-auto mb-4 text-gray-600 animate-pulse" />
          <h3 className="text-lg font-bold text-white mb-1">Kolam Kosong</h3>
          <p className="text-sm text-gray-400">Anda belum membuat kolam pembudidayaan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {ponds.map((pond) => (
            <div key={pond.id} className="glass-panel p-6 rounded-3xl border border-white/5 flex flex-col justify-between group hover:border-primary/25 transition-all duration-300">
              
              <div>
                {/* Pond name row */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors flex items-center gap-2">
                      <Database className="h-5.5 w-5.5 text-primary" />
                      {pond.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">{pond.location || 'Lokasi tidak diset'}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleDeletePond(pond.id)}
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>

                {/* Pond details table */}
                <div className="grid grid-cols-4 gap-4 p-4 bg-white/3 rounded-2xl mb-6 text-xs text-gray-400">
                  <div>
                    <span className="block text-gray-500 mb-1">Panjang</span>
                    <span className="font-semibold text-white">{pond.length} meter</span>
                  </div>
                  <div>
                    <span className="block text-gray-500 mb-1">Lebar</span>
                    <span className="font-semibold text-white">{pond.width} meter</span>
                  </div>
                  <div>
                    <span className="block text-gray-500 mb-1">Kedalaman</span>
                    <span className="font-semibold text-white">{pond.depth} meter</span>
                  </div>
                  <div>
                    <span className="block text-gray-500 mb-1">Sumber Air</span>
                    <span className="font-semibold text-white truncate block">{pond.waterSource || 'Spring Water'}</span>
                  </div>
                </div>
              </div>

              {/* Cultivation status block */}
              <div className="mt-auto border-t border-white/5 pt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-xxs uppercase tracking-wider text-gray-500 font-semibold block">Status Cultivation</span>
                    <span className="text-sm font-semibold text-white mt-0.5 flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-emerald-400" />
                      Ready stock benih
                    </span>
                  </div>
                  
                  <button 
                    onClick={() => {
                      setSelectedPondId(pond.id);
                      setShowStockModal(true);
                    }}
                    className="bg-white/5 hover:bg-primary hover:text-black border border-white/10 hover:border-transparent text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all"
                  >
                    Tebar Bibit Baru
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* --- ADD POND MODAL --- */}
      {showPondModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel p-8 rounded-3xl relative">
            <button onClick={() => setShowPondModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X className="h-6 w-6" />
            </button>
            
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Database className="h-6 w-6 text-primary" />
              Buat Kolam Budidaya
            </h3>

            <form onSubmit={handleCreatePond} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">Nama Kolam</label>
                <input
                  type="text"
                  required
                  placeholder="Kolam A - Nila Super"
                  value={pondName}
                  onChange={(e) => setPondName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">Lokasi / Sektor</label>
                <input
                  type="text"
                  placeholder="Sektor Selatan, Kebun Belakang"
                  value={pondLoc}
                  onChange={(e) => setPondLoc(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2">Panjang (m)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={pondLength}
                    onChange={(e) => setPondLength(parseFloat(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2">Lebar (m)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={pondWidth}
                    onChange={(e) => setPondWidth(parseFloat(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2">Kedalaman (m)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={pondDepth}
                    onChange={(e) => setPondDepth(parseFloat(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">Sumber Air Utama</label>
                <input
                  type="text"
                  placeholder="Mata Air Pegunungan / Air Sumur"
                  value={waterSrc}
                  onChange={(e) => setWaterSrc(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-black font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all mt-4"
              >
                Simpan Kolam
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD STOCK MODAL --- */}
      {showStockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel p-8 rounded-3xl relative">
            <button onClick={() => setShowStockModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X className="h-6 w-6" />
            </button>
            
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              Tebarkan Benih Budidaya
            </h3>

            <form onSubmit={handleStockPond} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">Pilih Spesies Ikan</label>
                <select
                  value={selectedSpeciesId}
                  onChange={(e) => setSelectedSpeciesId(parseInt(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 appearance-none"
                >
                  {species.map(s => (
                    <option key={s.id} value={s.id} className="bg-slate-900 text-white">{s.name} ({s.scientificName})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2">Jumlah Tebar (ekor)</label>
                  <input
                    type="number"
                    required
                    value={stockQty}
                    onChange={(e) => setStockQty(parseInt(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2">Berat Awal Rata-rata (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={initialWeight}
                    onChange={(e) => setInitialWeight(parseFloat(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-start gap-3 mt-4 text-xs text-primary leading-relaxed">
                <ShieldAlert className="h-5 w-5 flex-shrink-0" />
                <p>
                  Pastikan kolam telah dikondisikan dan dibersihkan sebelum benih dilepas. Parameter pH dan DO awal disarankan disesuaikan terlebih dahulu.
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-black font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all mt-4"
              >
                Mulakan Penebaran
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
