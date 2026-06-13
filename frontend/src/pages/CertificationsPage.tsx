import React, { useEffect, useState } from 'react';
import { certificationService } from '../services/api';
import { DigitalCertification } from '../types';
import { 
  Award, Plus, FileText, CheckCircle2, AlertTriangle, 
  Clock, Calendar, Link as LinkIcon, X 
} from 'lucide-react';

export default function CertificationsPage() {
  const [certs, setCerts] = useState<DigitalCertification[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');

  useEffect(() => {
    loadCerts();
  }, []);

  const loadCerts = async () => {
    setLoading(true);
    try {
      const list = await certificationService.getFarmerCerts();
      setCerts(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await certificationService.submitCert({
        title,
        description,
        documentUrl
      });
      setShowModal(false);
      resetForm();
      loadCerts();
    } catch (err) {
      alert('Gagal mengajukan sertifikasi');
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDocumentUrl('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-wide">Sertifikasi & Verifikasi Digital</h2>
          <p className="text-sm text-gray-400">Ajukan dokumen Cara Budidaya Ikan yang Baik (CBIB) untuk memperoleh badge verifikasi pasar.</p>
        </div>
        
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-black font-bold px-5 py-3 rounded-xl hover:shadow-lg hover:shadow-primary/20 hover:scale-102 transition-all flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          <span>Ajukan Sertifikat</span>
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Memuat berkas sertifikasi...</p>
      ) : certs.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-3xl text-gray-500">
          <Award className="h-16 w-16 mx-auto mb-4 text-gray-600 animate-pulse" />
          <h3 className="text-lg font-bold text-white mb-1">Belum Ada Sertifikat</h3>
          <p className="text-sm text-gray-400">Ajukan sertifikasi pertama Anda untuk meningkatkan kepercayaan pembeli di marketplace.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {certs.map((cert) => (
            <div key={cert.id} className="glass-panel p-6 rounded-3xl border border-white/5 flex flex-col justify-between hover:border-primary/20 transition-all duration-300">
              <div>
                
                {/* Header row */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary/15 rounded-xl text-primary">
                      <Award className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-lg">{cert.title}</h4>
                      <span className="text-xxs text-gray-500 block mt-0.5">Diajukan: {new Date(cert.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</span>
                    </div>
                  </div>

                  <span className={`text-xxs px-2.5 py-1 rounded-full font-bold uppercase flex items-center gap-1 ${
                    cert.status === 'APPROVED' 
                      ? 'bg-green-500/10 text-green-400' 
                      : cert.status === 'REJECTED' 
                        ? 'bg-red-500/10 text-red-400' 
                        : 'bg-yellow-500/10 text-yellow-400 animate-pulse'
                  }`}>
                    {cert.status === 'APPROVED' && <CheckCircle2 className="h-3.5 w-3.5" />}
                    {cert.status === 'REJECTED' && <AlertTriangle className="h-3.5 w-3.5" />}
                    {cert.status === 'PENDING' && <Clock className="h-3.5 w-3.5" />}
                    {cert.status}
                  </span>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed mb-4">{cert.description || 'Tidak ada deskripsi'}</p>
              </div>

              {/* Review block if reviewed */}
              <div className="border-t border-white/5 pt-4 mt-auto flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Berkas Pendukung:</span>
                  <a 
                    href={cert.documentUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    <LinkIcon className="h-3 w-3" />
                    Lihat Dokumen
                  </a>
                </div>

                {cert.status !== 'PENDING' && (
                  <div className="p-3 bg-white/3 rounded-xl text-xxs text-gray-400 mt-2 leading-relaxed">
                    <span className="font-bold text-white block">Catatan Reviewer ({cert.reviewerName || 'Admin'}):</span>
                    <span className="block mt-1 italic">"{cert.reviewNotes || 'Tidak ada catatan review.'}"</span>
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* --- SUBMIT CERTIFICATION MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel p-8 rounded-3xl relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X className="h-6 w-6" />
            </button>
            
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Award className="h-6 w-6 text-primary" />
              Ajukan Berkas Sertifikasi
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">Nama Sertifikasi / Lisensi</label>
                <input
                  type="text"
                  required
                  placeholder="Sertifikat CBIB - Kategori Nila Super"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">Deskripsi Keterangan</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="CBIB yang dikeluarkan dinas kelautan setempat tahun 2026..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary h-20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">Tautan URL Dokumen (PDF/JPG)</label>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/file/d/..."
                  value={documentUrl}
                  onChange={(e) => setDocumentUrl(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-black font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all mt-4"
              >
                Kirim Pengajuan
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
