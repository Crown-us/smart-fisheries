import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { pondService, notificationService } from '../services/api';
import { Pond, Notification } from '../types';
import { 
  Waves, Database, Flame, LineChart, AlertTriangle, 
  Activity, ArrowRight, ShieldCheck, Thermometer, CheckCircle2
} from 'lucide-react';

export default function FarmerDashboard() {
  const [ponds, setPonds] = useState<Pond[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const pondList = await pondService.listPonds();
        setPonds(pondList);
        
        const notificationList = await notificationService.listUnread();
        setNotifications(notificationList.slice(0, 5));
      } catch (err) {
        console.error('Error loading dashboard stats', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const activePonds = ponds.filter(p => p.status === 'ACTIVE');
  const alertNotifications = notifications.filter(n => n.type === 'ALERT');

  return (
    <div className="space-y-8">
      {/* Upper stats widgets grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl -z-10" />
          <div>
            <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">Jumlah Kolam</span>
            <h3 className="text-3xl font-extrabold text-white mt-1">{ponds.length}</h3>
            <p className="text-xs text-primary font-semibold mt-1">{activePonds.length} Aktif budidaya</p>
          </div>
          <div className="p-3 bg-primary/20 rounded-xl">
            <Database className="h-6 w-6 text-primary" />
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl -z-10" />
          <div>
            <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">Status Kualitas Air</span>
            <h3 className="text-lg font-bold text-white mt-2 flex items-center gap-1.5">
              {alertNotifications.length > 0 ? (
                <>
                  <AlertTriangle className="h-5 w-5 text-yellow-500 animate-bounce" />
                  <span className="text-yellow-500 text-sm">Ada Bahaya DO!</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  <span className="text-green-400 text-sm">Semua Kolam Aman</span>
                </>
              )}
            </h3>
            <p className="text-xs text-gray-400 mt-1">Manual Input IoT-Ready</p>
          </div>
          <div className="p-3 bg-emerald-500/20 rounded-xl">
            <Waves className="h-6 w-6 text-emerald-400" />
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-xl -z-10" />
          <div>
            <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">Jadwal Pakan</span>
            <h3 className="text-3xl font-extrabold text-white mt-1">Sore</h3>
            <p className="text-xs text-gray-400 mt-1">Pukul 16:00 (15 kg Cargill)</p>
          </div>
          <div className="p-3 bg-orange-500/20 rounded-xl">
            <Flame className="h-6 w-6 text-orange-400" />
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl -z-10" />
          <div>
            <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">FCR Rata-rata</span>
            <h3 className="text-3xl font-extrabold text-white mt-1">1.25</h3>
            <p className="text-xs text-purple-400 font-semibold mt-1">Sangat Efisien (Target &lt; 1.5)</p>
          </div>
          <div className="p-3 bg-purple-500/20 rounded-xl">
            <LineChart className="h-6 w-6 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Warning Center for Critical Alerts */}
      {alertNotifications.length > 0 && (
        <div className="p-5 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex items-start gap-4">
          <div className="p-2.5 bg-yellow-500/20 rounded-xl text-yellow-500 mt-0.5 animate-pulse">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-bold text-yellow-500">Peringatan Kualitas Air Kritis!</h4>
            <p className="text-sm text-gray-400 mt-1">
              Beberapa parameter kolam berada di luar ambang batas optimal ikan. Segera periksa aerasi dan lakukan sirkulasi air!
            </p>
            <div className="mt-3 flex gap-3">
              <Link to="/farmer/water-quality" className="text-xs bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-4 py-2 rounded-xl transition-all">
                Cek Kolam Sekarang
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main split grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Ponds snapshot section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold tracking-wide flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Daftar Kolam Aktif
            </h3>
            <Link to="/farmer/ponds" className="text-xs text-primary hover:underline font-semibold flex items-center gap-1">
              Lihat Semua Kolam <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? (
              <p className="text-gray-500">Memuat kolam...</p>
            ) : ponds.length === 0 ? (
              <div className="col-span-2 text-center py-12 glass-panel rounded-2xl text-gray-500">
                <Database className="h-10 w-10 mx-auto mb-2 text-gray-600" />
                <p>Belum ada kolam budidaya yang dibuat.</p>
                <Link to="/farmer/ponds" className="mt-4 inline-block text-xs bg-primary text-black font-bold px-4 py-2 rounded-xl">
                  Tambah Kolam Pertama
                </Link>
              </div>
            ) : (
              ponds.slice(0, 4).map((pond) => (
                <div key={pond.id} className="glass-panel p-6 rounded-2xl relative group hover:border-primary/30 transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-lg text-white group-hover:text-primary transition-colors">{pond.name}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{pond.location || 'Lokasi tidak diset'}</p>
                    </div>
                    <span className={`text-xxs px-2.5 py-1 rounded-full font-bold uppercase ${
                      pond.status === 'ACTIVE' ? 'bg-primary/10 text-primary' : 'bg-gray-800 text-gray-400'
                    }`}>
                      {pond.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 border-t border-white/5 pt-4 text-xs">
                    <div>
                      <span className="text-gray-500 block">Panjang</span>
                      <span className="font-bold">{pond.length} m</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Lebar</span>
                      <span className="font-bold">{pond.width} m</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Kedalaman</span>
                      <span className="font-bold">{pond.depth} m</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar panels */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold tracking-wide">Pemberitahuan Terkini</h3>
          
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            {loading ? (
              <p className="text-gray-500">Memuat pemberitahuan...</p>
            ) : notifications.length === 0 ? (
              <p className="text-sm text-gray-500">Tidak ada peringatan kualitas air saat ini. Kolam dalam kondisi optimal!</p>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="p-3 bg-white/5 rounded-xl border-l-4 border-primary">
                  <h5 className="font-bold text-xs flex items-center gap-1.5 text-white">
                    {n.type === 'ALERT' ? <AlertTriangle className="h-3.5 w-3.5 text-yellow-500 animate-pulse" /> : <Thermometer className="h-3.5 w-3.5 text-blue-400" />}
                    {n.title}
                  </h5>
                  <p className="text-xxs text-gray-400 mt-1">{n.message}</p>
                </div>
              ))
            )}
          </div>

          <div className="glass-panel p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-emerald-500/10">
            <h4 className="font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Sertifikasi CBIB / IndoGAP
            </h4>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Mulai daftarkan sertifikasi Cara Budidaya Ikan yang Baik (CBIB) untuk memamerkan badge verifikasi digital Anda kepada konsumen di pasar marketplace!
            </p>
            <Link to="/farmer/certifications" className="mt-4 w-full text-center block text-xs bg-primary text-black font-bold py-2.5 rounded-xl transition-all">
              Ajukan Sertifikat
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
