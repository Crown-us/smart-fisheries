import React, { useEffect, useState } from 'react';
import { adminService, certificationService, analyticsService } from '../services/api';
import { User, DigitalCertification, Product } from '../types';
import { 
  ShieldCheck, Award, ShoppingBag, Users, FileText, 
  Check, X, AlertTriangle, Activity, DollarSign, Calendar
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [pendingCerts, setPendingCerts] = useState<DigitalCertification[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal review notes
  const [reviewNotes, setReviewNotes] = useState('');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const dataStats = await analyticsService.getAdminStats();
      setStats(dataStats);

      const dataCerts = await certificationService.listPending();
      setPendingCerts(dataCerts);

      const dataUsers = await adminService.listUsers();
      setUsers(dataUsers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveCert = async (certId: number) => {
    const notes = window.prompt('Masukkan catatan persetujuan:', 'Dokumen IndoGAP valid dan terverifikasi.');
    if (notes === null) return; // Cancelled
    
    try {
      await certificationService.reviewCert(certId, 'APPROVED', notes);
      loadAdminData();
    } catch (err) {
      alert('Gagal menyetujui sertifikasi');
    }
  };

  const handleRejectCert = async (certId: number) => {
    const notes = window.prompt('Masukkan alasan penolakan:');
    if (!notes) return;
    
    try {
      await certificationService.reviewCert(certId, 'REJECTED', notes);
      loadAdminData();
    } catch (err) {
      alert('Gagal menolak sertifikasi');
    }
  };

  const handleApproveProduct = async (productId: number) => {
    try {
      await adminService.moderateProduct(productId, 'APPROVED');
      loadAdminData();
    } catch (err) {
      alert('Gagal memoderasi produk');
    }
  };

  const handleRejectProduct = async (productId: number) => {
    try {
      await adminService.moderateProduct(productId, 'REJECTED');
      loadAdminData();
    } catch (err) {
      alert('Gagal memoderasi produk');
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Overview Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-400 font-semibold block uppercase">Total Pendapatan</span>
              <h3 className="text-2xl font-black text-white mt-1">Rp {stats.totalRevenue?.toLocaleString('id-ID') || 0}</h3>
              <p className="text-xs text-green-400 mt-1 font-medium">Dari {stats.totalTransactionsCount} penjualan</p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-xl text-green-400">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-400 font-semibold block uppercase">Pengguna Terdaftar</span>
              <h3 className="text-2xl font-black text-white mt-1">{stats.totalUsersCount || users.length}</h3>
              <p className="text-xs text-gray-400 mt-1">Petani & Konsumen</p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
              <Users className="h-6 w-6" />
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-400 font-semibold block uppercase">Verifikasi Tertunda</span>
              <h3 className="text-2xl font-black text-white mt-1">{pendingCerts.length}</h3>
              <p className="text-xs text-yellow-500 font-semibold mt-1">Menunggu review berkas</p>
            </div>
            <div className="p-3 bg-yellow-500/20 rounded-xl text-yellow-500">
              <Award className="h-6 w-6" />
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-400 font-semibold block uppercase">Total Produk Jualan</span>
              <h3 className="text-2xl font-black text-white mt-1">{stats.totalProducts || 0}</h3>
              <p className="text-xs text-gray-400 mt-1">Terdaftar di marketplace</p>
            </div>
            <div className="p-3 bg-primary/20 rounded-xl text-primary">
              <ShoppingBag className="h-6 w-6" />
            </div>
          </div>

        </div>
      )}

      {/* Verification queues and lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Certification validation requests queue */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-bold tracking-wide flex items-center gap-2">
            <Award className="h-5.5 w-5.5 text-primary" />
            Antrean Verifikasi Sertifikat Petani ({pendingCerts.length})
          </h3>

          {loading ? (
            <p className="text-gray-500">Memuat berkas...</p>
          ) : pendingCerts.length === 0 ? (
            <div className="text-center py-12 glass-panel rounded-2xl text-gray-500">
              <ShieldCheck className="h-10 w-10 mx-auto mb-2 text-gray-600" />
              <p>Tidak ada pengajuan verifikasi tertunda saat ini.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingCerts.map((c) => (
                <div key={c.id} className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between md:flex-row md:items-center gap-4">
                  <div className="space-y-1">
                    <h4 className="font-bold text-white text-base">{c.title}</h4>
                    <p className="text-xs text-gray-500">
                      Diajukan oleh: <span className="font-semibold text-primary">{c.farmerName}</span> • 
                      Tanggal: {new Date(c.createdAt).toLocaleDateString('id-ID')}
                    </p>
                    <p className="text-xs text-gray-400 pt-1 leading-relaxed">{c.description || 'Tidak ada deskripsi'}</p>
                    <a 
                      href={c.documentUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-2"
                    >
                      <FileText className="h-3.5 w-3.5" /> Lihat Dokumen Verifikasi
                    </a>
                  </div>

                  <div className="flex gap-2.5 self-end md:self-auto">
                    <button 
                      onClick={() => handleApproveCert(c.id)}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs rounded-xl transition-all flex items-center gap-1"
                    >
                      <Check className="h-4 w-4" /> Setujui
                    </button>
                    <button 
                      onClick={() => handleRejectCert(c.id)}
                      className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs rounded-xl border border-red-500/15 transition-all flex items-center gap-1"
                    >
                      <X className="h-4 w-4" /> Tolak
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Platform User management directories */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold tracking-wide flex items-center gap-2">
            <Users className="h-5.5 w-5.5 text-primary" />
            Pengguna Sistem ({users.length})
          </h3>

          <div className="glass-panel p-6 rounded-3xl space-y-4 max-h-[500px] overflow-y-auto">
            {loading ? (
              <p className="text-gray-500">Memuat pengguna...</p>
            ) : (
              users.map((u) => (
                <div key={u.id} className="flex justify-between items-center border-b border-white/5 pb-3 last:border-b-0 last:pb-0">
                  <div className="overflow-hidden pr-2">
                    <h5 className="font-bold text-white text-sm truncate">{u.firstName} {u.lastName}</h5>
                    <p className="text-xxs text-gray-500 truncate">{u.email} • {u.role}</p>
                  </div>
                  
                  <span className={`text-xxs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                    u.verified ? 'bg-green-500/15 text-green-400' : 'bg-yellow-500/15 text-yellow-500'
                  }`}>
                    {u.verified ? 'Verified' : 'Unverified'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
