import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  Droplet, 
  TrendingUp, 
  ShoppingBag, 
  Award, 
  Bell, 
  ChevronRight, 
  Layers, 
  ShieldCheck, 
  Star,
  Activity,
  Calendar,
  MapPin,
  Scale,
  Flame,
  ArrowRight
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  const stats = [
    { value: '250+', label: 'Petani Terverifikasi', desc: 'Sertifikasi IndoGAP & CBIB' },
    { value: '1,200+', label: 'Tambak Aktif', desc: 'Dalam pemantauan kualitas air' },
    { value: '45 Ton', label: 'Hasil Panen Terjual', desc: 'Langsung ke pasar konsumen' },
    { value: '1.22', label: 'Rata-rata FCR', desc: 'Efisiensi pakan tingkat tinggi' }
  ];

  const pillars = [
    {
      step: '01',
      title: 'Monitor Pond',
      desc: 'Pantau parameter kualitas air kritis (pH, Oksigen Terlarut/DO, Suhu) secara digital harian.',
      badgeColor: 'bg-sky-50 text-sky-700 border-sky-100'
    },
    {
      step: '02',
      title: 'Manage Feeding',
      desc: 'Atur jadwal feeding harian otomatis dan pantau inventaris pakan dari produsen resmi.',
      badgeColor: 'bg-teal-50 text-teal-700 border-teal-100'
    },
    {
      step: '03',
      title: 'Calculate FCR',
      desc: 'Analisis rasio konversi pakan (FCR) real-time untuk memangkas biaya budidaya terbesar.',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-100'
    },
    {
      step: '04',
      title: 'Sell Harvest',
      desc: 'Upload stok hasil panen bersertifikat langsung ke marketplace B2C dan B2B tanpa calo.',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-100'
    }
  ];

  const products = [
    {
      name: 'Ikan Nila Merah Segar Super (Nile Tilapia)',
      farmerName: 'Kelompok Tani Mina Lestari',
      pondLocation: 'Kec. Ciparay, Bandung',
      harvestDate: 'Panen: 14 Juni 2026',
      stock: 'Stok: 150 kg',
      price: 'Rp 34.500',
      unit: 'kg',
      image: '/images/fresh_tilapia.jpg',
      rating: 5,
      reviewsCount: 38,
      certified: true,
      certName: 'IndoGAP Certified'
    },
    {
      name: 'Lele Sangkuriang Hidup (Fresh Catfish)',
      farmerName: 'Pak Dedi Budidaya Mandiri',
      pondLocation: 'Bogor Selatan, Jawa Barat',
      harvestDate: 'Panen: 15 Juni 2026',
      stock: 'Stok: 320 kg',
      price: 'Rp 24.000',
      unit: 'kg',
      image: '/images/fresh_catfish.jpg',
      rating: 4,
      reviewsCount: 54,
      certified: true,
      certName: 'CBIB Verified'
    },
    {
      name: 'Ikan Gurame Kolam Air Mengalir',
      farmerName: 'Tambak Parahyangan',
      pondLocation: 'Sumedang, Jawa Barat',
      harvestDate: 'Panen: 12 Juni 2026',
      stock: 'Stok: 80 kg',
      price: 'Rp 48.000',
      unit: 'kg',
      image: '/images/fresh_gourami.jpg',
      rating: 5,
      reviewsCount: 19,
      certified: false,
      certName: ''
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-sky-500 selection:text-white">
      
      {/* 1. Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-teal-400 flex items-center justify-center text-white font-bold shadow-md shadow-sky-100">
              eF
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-sky-600 to-teal-500 bg-clip-text text-transparent">
              Smart Fisheries
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#pillars" className="hover:text-sky-600 transition-colors">Core Pillars</a>
            <a href="#dashboard-preview" className="hover:text-sky-600 transition-colors">Dasbor Fitur</a>
            <a href="#marketplace" className="hover:text-sky-600 transition-colors">Pasar Ikan</a>
            <a href="#statistics" className="hover:text-sky-600 transition-colors">Data Dampak</a>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <button 
                onClick={() => {
                  if (user.role === 'ADMIN') navigate('/admin/dashboard');
                  else if (user.role === 'FARMER') navigate('/farmer/dashboard');
                  else navigate('/consumer/marketplace');
                }}
                className="px-4 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-500 transition-colors rounded-xl shadow-sm hover:shadow shadow-sky-100"
              >
                Ke Dashboard
              </button>
            ) : (
              <>
                <button 
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-sky-600 transition-colors rounded-lg hover:bg-slate-100"
                >
                  Masuk
                </button>
                <button 
                  onClick={() => navigate('/register')}
                  className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-500 transition-colors rounded-xl shadow-sm hover:shadow shadow-sky-100"
                >
                  Daftar
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-16 pb-24 overflow-hidden bg-white border-b border-slate-200/40">
        <div className="absolute inset-0 bg-gradient-blue opacity-50 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-green opacity-30 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-xs font-bold text-sky-700">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
              Komersial & Terintegrasi IndoGAP
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-tight">
              Budidaya Perikanan <span className="bg-gradient-to-r from-sky-600 to-teal-500 bg-clip-text text-transparent">Lebih Cerdas & Menguntungkan</span>
            </h1>

            <p className="text-lg text-slate-600 max-w-xl leading-relaxed">
              Membantu pembudidaya mengontrol tambak secara presisi, menekan biaya pakan dengan FCR Analytics, dan menjual hasil panen segar langsung ke konsumen akhir.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button 
                onClick={() => navigate('/register')}
                className="px-6 py-4 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-500 transition-all rounded-xl shadow-md hover:shadow-lg shadow-sky-100 flex items-center justify-center gap-2"
              >
                Mulai Budidaya Cerdas <ChevronRight className="w-4 h-4" />
              </button>
              <a 
                href="#marketplace"
                className="px-6 py-4 text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors rounded-xl flex items-center justify-center gap-2"
              >
                Beli Ikan Segar Petani
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-100">
              <img 
                src="/images/aquaculture_pond.jpg" 
                alt="Fisheries Pond Aquaculture" 
                className="rounded-xl object-cover h-64 md:h-80 w-full hover:scale-101 transition-transform duration-300"
              />
              <div className="p-4 bg-slate-50 border-t border-slate-100 rounded-b-xl flex items-center justify-between">
                <div>
                  <span className="text-xxs font-bold text-slate-400 uppercase tracking-widest">Kondisi Lapangan</span>
                  <p className="text-xs font-bold text-slate-700">Tambak Nila Air Tawar - Sleman, Yogyakarta</p>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  <Activity className="w-3.5 h-3.5" /> Optimal
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Pillars (Instant 5-Second Explanation) */}
      <section id="pillars" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-sky-600">Alur Utama Platform</h2>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">4 Pilar Utama Manajemen Tambak</h3>
            <p className="text-sm text-slate-500">Mulai dari tebar benih hingga uang masuk rekening penjualan.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {pillars.map((p, i) => (
              <div 
                key={i} 
                className="p-6 rounded-2xl border border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-md transition-all duration-200 group"
              >
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-sm mb-5 ${p.badgeColor}`}>
                  {p.step}
                </div>
                <h4 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-sky-600 transition-colors">{p.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Dashboard Preview Section */}
      <section id="dashboard-preview" className="py-24 bg-slate-50 border-y border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-4 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-600">Monitoring Tambak Modern</span>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">Dasbor Analisis Parameter Air & FCR</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Visualisasikan kesehatan ekosistem perikanan Anda secara digital. Hubungkan data pakan harian dan hasil sampling biomassa untuk melihat tren pertumbuhan harian secara otomatis.
              </p>
              
              <ul className="space-y-3 pt-2">
                <li className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500" /> Deteksi penurunan Oksigen Terlarut (DO)
                </li>
                <li className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500" /> Histori FCR setiap siklus panen
                </li>
                <li className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500" /> Log alarm water temperature
                </li>
              </ul>
            </div>

            <div className="lg:col-span-8">
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-xxs font-bold text-slate-400 uppercase">Interactive Mockup</span>
                    <h4 className="text-sm font-bold text-slate-800">e-Fish Monitoring Board</h4>
                  </div>
                  <span className="text-[10px] text-slate-400">Pond A-1: Nila Merah</span>
                </div>

                {/* 3 Parameter air */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="text-[10px] text-slate-400 block mb-1">pH Air (Keasaman)</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-extrabold text-slate-800">7.2</span>
                      <span className="text-[9px] text-green-600 font-bold">Optimal</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1 rounded-full mt-2">
                      <div className="bg-sky-500 h-1 rounded-full w-[70%]" />
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="text-[10px] text-slate-400 block mb-1">Suhu Kolam</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-extrabold text-slate-800">28.4°C</span>
                      <span className="text-[9px] text-green-600 font-bold">Normal</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1 rounded-full mt-2">
                      <div className="bg-teal-500 h-1 rounded-full w-[80%]" />
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="text-[10px] text-slate-400 block mb-1">Oksigen (DO)</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-extrabold text-slate-800">5.4 mg/L</span>
                      <span className="text-[9px] text-green-600 font-bold">Baik</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1 rounded-full mt-2">
                      <div className="bg-emerald-500 h-1 rounded-full w-[75%]" />
                    </div>
                  </div>
                </div>

                {/* FCR Analytics & Feeding */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 border border-slate-100 rounded-xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-400 block">FCR Analytics</span>
                      <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Target: 1.25</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-slate-800">1.24</span>
                      <span className="text-xs text-green-600 font-semibold">↓ -5% hemat biaya pakan</span>
                    </div>
                    <span className="text-[9px] text-slate-400 block">Hasil konversi pakan sangat efisien</span>
                  </div>

                  <div className="p-4 border border-slate-100 rounded-xl space-y-3">
                    <span className="text-[10px] text-slate-400 block">Feeding Schedule</span>
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-600 font-medium">Feeding Pagi (08:00)</span>
                        <span className="font-bold text-slate-800">15 kg (Prima 1)</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-600 font-medium">Feeding Sore (16:00)</span>
                        <span className="font-bold text-slate-400">15 kg (Prima 1)</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. Marketplace Section (Tokopedia + Shopify style) */}
      <section id="marketplace" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-sky-600">Pasar Perikanan Digital</h2>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">Direct Aquaculture Marketplace</h3>
              <p className="text-sm text-slate-500">Ikan segar dipanen dari tambak pembudidaya pilihan bersertifikat IndoGAP dan CBIB.</p>
            </div>
            <button 
              onClick={() => navigate('/login')}
              className="px-5 py-3 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm transition-all inline-flex items-center gap-2 self-start md:self-auto"
            >
              Jelajahi Semua Hasil Panen <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((prod, i) => (
              <div 
                key={i} 
                className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                
                <div>
                  <div className="h-52 overflow-hidden relative bg-slate-100">
                    <img 
                      src={prod.image} 
                      alt={prod.name} 
                      className="w-full h-full object-cover hover:scale-103 transition-transform duration-500"
                    />
                    {prod.certified && (
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-green-500 text-white text-[10px] font-bold shadow-md flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> {prod.certName}
                      </div>
                    )}
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400">Komoditas Utama</span>
                      <h4 className="font-extrabold text-slate-800 text-base leading-snug hover:text-sky-600 transition-colors line-clamp-2">
                        {prod.name}
                      </h4>
                    </div>

                    {/* Metadata detail request */}
                    <div className="space-y-1.5 text-xs text-slate-500 pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-700">{prod.farmerName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> <span>{prod.pondLocation}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" /> <span>{prod.harvestDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <Scale className="w-3.5 h-3.5 text-slate-400" /> <span className="font-semibold text-slate-700">{prod.stock}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(prod.rating)].map((_, index) => (
                      <Star key={index} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    ))}
                    <span className="text-[10px] text-slate-400 ml-1">({prod.reviewsCount} review)</span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div>
                      <span className="text-xs text-slate-400 block">Harga Langsung</span>
                      <span className="text-xl font-extrabold text-slate-800">{prod.price}<span className="text-xs font-medium text-slate-400"> / {prod.unit}</span></span>
                    </div>
                    <button 
                      onClick={() => navigate('/login')}
                      className="px-4 py-2.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl transition-all shadow-md shadow-sky-50 flex items-center gap-1.5"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" /> Beli Ikan
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 6. Impact / Statistics Section */}
      <section id="statistics" className="py-20 bg-slate-50 border-t border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-2">
                <span className="text-3xl font-black text-sky-600 tracking-tight block">
                  {stat.value}
                </span>
                <span className="text-sm font-bold text-slate-800 block">
                  {stat.label}
                </span>
                <span className="text-xs text-slate-500 block">
                  {stat.desc}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="bg-white border-t border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4 col-span-2 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white font-bold">
                e
              </div>
              <span className="font-bold text-lg text-slate-900">Smart Fisheries</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Platform modern manajemen tambak budidaya air tawar (aquaculture) dan marketplace terpercaya untuk petani ikan lokal Indonesia.
            </p>
          </div>

          <div className="space-y-3">
            <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Perusahaan</h5>
            <ul className="space-y-2 text-xs text-slate-500">
              <li><a href="#" className="hover:text-sky-600 transition-colors">Tentang Kami</a></li>
              <li><a href="#" className="hover:text-sky-600 transition-colors">Karir</a></li>
              <li><a href="#" className="hover:text-sky-600 transition-colors">Kemitraan Tani</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Dukungan</h5>
            <ul className="space-y-2 text-xs text-slate-500">
              <li><a href="#" className="hover:text-sky-600 transition-colors">Pusat Bantuan</a></li>
              <li><a href="#" className="hover:text-sky-600 transition-colors">Dokumentasi FCR</a></li>
              <li><a href="#" className="hover:text-sky-600 transition-colors">Verifikasi CBIB</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Legalitas</h5>
            <ul className="space-y-2 text-xs text-slate-500">
              <li><a href="#" className="hover:text-sky-600 transition-colors">Syarat Ketentuan</a></li>
              <li><a href="#" className="hover:text-sky-600 transition-colors">Kebijakan Privasi</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <span>&copy; 2026 Smart Fisheries System (e-Fish). Hak Cipta Dilindungi Undang-Undang.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-sky-600 transition-colors">Indonesia</a>
            <a href="#" className="hover:text-sky-600 transition-colors">English</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
