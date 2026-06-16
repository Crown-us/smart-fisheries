import React, { useState, useEffect } from 'react';
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
  ArrowRight,
  CloudRain,
  Wind,
  Sparkles,
  Zap,
  HelpCircle,
  Play,
  Square
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  // Interactive Sandbox state
  const [ph, setPh] = useState(7.2);
  const [temp, setTemp] = useState(28.4);
  const [doVal, setDoVal] = useState(5.4);
  const [aeratorActive, setAeratorActive] = useState(false);
  const [feedGivenTotal, setFeedGivenTotal] = useState(150.0);
  const [biomass, setBiomass] = useState(120.9);
  const [sandboxLog, setSandboxLog] = useState<string>("Demo Sandbox aktif. Klik aksi di sebelah kiri!");

  // ROI Calculator state
  const [harvestTarget, setHarvestTarget] = useState(2000); 
  const [currentFcr, setCurrentFcr] = useState(1.6);
  const [feedPrice, setFeedPrice] = useState(12500); 

  // Calculate FCR dynamically
  const fcr = Math.round((feedGivenTotal / biomass) * 100) / 100;

  // e-Fish target FCR is 1.2
  const eFishFcr = 1.2;
  const feedNeededOld = harvestTarget * currentFcr;
  const feedNeededNew = harvestTarget * eFishFcr;
  const feedSaved = Math.max(0, feedNeededOld - feedNeededNew);
  const moneySaved = feedSaved * feedPrice;

  // Handle DO level drift based on Aerator status
  useEffect(() => {
    let interval: any;
    interval = setInterval(() => {
      setDoVal(prev => {
        if (aeratorActive) {
          if (prev < 6.8) {
            return Math.round((prev + 0.1) * 10) / 10;
          }
        } else {
          if (prev > 4.2) {
            return Math.round((prev - 0.1) * 10) / 10;
          }
        }
        return prev;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [aeratorActive]);

  const handleFeed = () => {
    setFeedGivenTotal(prev => prev + 15.0);
    setBiomass(prev => Math.round((prev + 12.0) * 10) / 10);
    setSandboxLog("Log: +15 kg pakan Cargill Prima 1 ditebar! Estimasi biomassa bertambah +12.0 kg.");
  };

  const handleSimulateRain = () => {
    setPh(6.1);
    setTemp(25.8);
    setSandboxLog("Log: Simulasi hujan lebat! Air kolam mendingin (25.8°C) dan tingkat keasaman turun (pH 6.1).");
  };

  const handleAddLime = () => {
    setPh(7.2);
    setSandboxLog("Log: Tabur kapur pertanian berhasil! Derajat keasaman (pH) kembali stabil ke angka optimal 7.2.");
  };

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

      {/* 4. Dashboard Preview Section (Interactive Live Sandbox Demo) */}
      <section id="dashboard-preview" className="py-24 bg-slate-50 border-y border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-3 py-1.5 rounded-full border border-sky-100">Live Interactive Demo Sandbox</span>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">Coba Langsung Simulasi Tambak Digital Kami!</h3>
            <p className="text-sm text-slate-500">
              Gunakan panel kontrol di sebelah kiri untuk berinteraksi dengan kolam simulasi secara real-time. Perhatikan bagaimana parameter air, biomassa ikan, dan FCR berubah secara dinamis pada dasbor monitor di sebelah kanan.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-12 items-stretch">
            
            {/* Control Panel (Left Column) */}
            <div className="lg:col-span-5 flex flex-col justify-between bg-white border border-slate-200 rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-sky-500/5 rounded-full blur-2xl -z-10" />
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-extrabold text-slate-800 text-lg">Pusat Kontrol Kolam A-1</h4>
                  <p className="text-xs text-slate-400 mt-1">Operasikan kolam simulasi secara langsung untuk melihat respons air & pertumbuhan ikan.</p>
                </div>

                <div className="space-y-3">
                  {/* Action 1: Feed Fish */}
                  <button
                    onClick={handleFeed}
                    className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-sky-50 border border-slate-100 hover:border-sky-200 rounded-2xl text-left transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-sky-100 text-sky-600 rounded-xl group-hover:bg-sky-200 group-hover:scale-105 transition-all">
                        <Flame className="w-5 h-5 fill-sky-600 stroke-none" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Beri Pakan (+15 kg)</span>
                        <span className="text-[10px] text-slate-400">Tebarkan pakan Cargill Prima 1 ke kolam.</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-colors" />
                  </button>

                  {/* Action 2: Toggle Aerator */}
                  <button
                    onClick={() => setAeratorActive(!aeratorActive)}
                    className={`w-full flex items-center justify-between p-3.5 border rounded-2xl text-left transition-all duration-200 group ${
                      aeratorActive 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                        : 'bg-slate-50 border-slate-100 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl transition-all group-hover:scale-105 ${
                        aeratorActive ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-200 text-slate-500'
                      }`}>
                        <Wind className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">
                          Aerator Kincir Air {aeratorActive ? '(Aktif)' : '(Mati)'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {aeratorActive ? 'Sedang meningkatkan kadar Oksigen (DO)...' : 'Nyalakan untuk meningkatkan Oksigen.'}
                        </span>
                      </div>
                    </div>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      aeratorActive ? 'bg-emerald-500 text-white animate-pulse' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {aeratorActive ? 'ON' : 'OFF'}
                    </span>
                  </button>

                  {/* Action 3: Simulate Rain */}
                  <button
                    onClick={handleSimulateRain}
                    className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 rounded-2xl text-left transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl group-hover:bg-blue-200 group-hover:scale-105 transition-all">
                        <CloudRain className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Simulasikan Hujan</span>
                        <span className="text-[10px] text-slate-400">Air hujan menurunkan pH dan suhu air.</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  </button>

                  {/* Action 4: Add Lime */}
                  <button
                    onClick={handleAddLime}
                    className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-amber-50 border border-slate-100 hover:border-amber-200 rounded-2xl text-left transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-amber-100 text-amber-600 rounded-xl group-hover:bg-amber-200 group-hover:scale-105 transition-all">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Tabur Kapur Pertanian</span>
                        <span className="text-[10px] text-slate-400">Menetralkan keasaman kolam kembali ideal.</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
                  </button>
                </div>
              </div>

              {/* Log Console */}
              <div className="mt-8 p-3 bg-slate-900 border border-slate-800 rounded-xl font-mono text-[11px] text-slate-200 min-h-[50px] flex items-center gap-2">
                <span className="w-1.5 h-3 bg-sky-400 animate-pulse flex-shrink-0" />
                <span className="leading-relaxed">{sandboxLog}</span>
              </div>
            </div>

            {/* Dashboard Display (Right Column) */}
            <div className="lg:col-span-7 flex">
              <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 space-y-6 text-white flex flex-col justify-between">
                
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div>
                    <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest block">Dashboard e-Fish Live</span>
                    <h4 className="text-sm font-bold text-white mt-0.5">Monitoring Kolam Budidaya</h4>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
                    <span>Kolam A-1 (Nila Merah)</span>
                  </div>
                </div>

                {/* 3 Parameter air */}
                <div className="grid grid-cols-3 gap-4">
                  
                  {/* pH Card */}
                  <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider mb-2">pH Air</span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-black text-white">{ph}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          ph >= 6.5 && ph <= 8.5 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400 animate-pulse'
                        }`}>
                          {ph >= 6.5 && ph <= 8.5 ? 'Optimal' : 'Asam!'}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full mt-4 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${ph >= 6.5 && ph <= 8.5 ? 'bg-sky-400' : 'bg-red-400'}`} 
                        style={{ width: `${(ph / 14) * 100}%` }} 
                      />
                    </div>
                  </div>

                  {/* Temperature Card */}
                  <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider mb-2">Suhu Kolam</span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-black text-white">{temp}°C</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          temp >= 26.0 && temp <= 30.0 ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400 animate-pulse'
                        }`}>
                          {temp >= 26.0 && temp <= 30.0 ? 'Normal' : 'Dingin!'}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full mt-4 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${temp >= 26.0 && temp <= 30.0 ? 'bg-orange-400' : 'bg-blue-400'}`} 
                        style={{ width: `${(temp / 40) * 100}%` }} 
                      />
                    </div>
                  </div>

                  {/* DO Card */}
                  <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex flex-col justify-between relative overflow-hidden">
                    {aeratorActive && (
                      <div className="absolute inset-0 bg-emerald-500/5 animate-pulse pointer-events-none" />
                    )}
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider mb-2">Oksigen (DO)</span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-black text-white">{doVal}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          doVal >= 5.0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400 animate-pulse'
                        }`}>
                          {doVal >= 5.0 ? 'Baik' : 'Rendah!'}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full mt-4 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${doVal >= 5.0 ? 'bg-emerald-400' : 'bg-red-400 animate-pulse'}`} 
                        style={{ width: `${(doVal / 8) * 100}%` }} 
                      />
                    </div>
                  </div>

                </div>

                {/* FCR Analytics & Feeding */}
                <div className="grid md:grid-cols-2 gap-4">
                  
                  {/* FCR Card */}
                  <div className="p-5 bg-white/5 border border-white/5 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Feed Conversion Ratio</span>
                      <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">Siklus Ke-1</span>
                    </div>
                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="text-3xl font-black text-white">{fcr}</span>
                      <span className={`text-xs font-semibold ${fcr <= 1.25 ? 'text-green-400' : 'text-yellow-400'}`}>
                        {fcr <= 1.25 ? '↓ Pakan Efisien' : 'Normal'}
                      </span>
                    </div>
                    <p className="text-[9px] text-slate-400 leading-relaxed">
                      FCR dihitung dari total pakan ({feedGivenTotal} kg) dibagi pertambahan biomassa ikan.
                    </p>
                  </div>

                  {/* Growth stats Card */}
                  <div className="p-5 bg-white/5 border border-white/5 rounded-2xl space-y-4">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Estimasi Biomassa & Pakan</span>
                    
                    <div className="space-y-2.5">
                      <div>
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className="text-slate-400 font-medium flex items-center gap-1.5">
                            <Scale className="w-3.5 h-3.5 text-sky-400" /> Total Biomassa Ikan
                          </span>
                          <span className="font-extrabold text-white">{biomass} kg</span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400 font-medium flex items-center gap-1.5">
                            <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400/20" /> Total Pakan Diberikan
                          </span>
                          <span className="font-extrabold text-white">{feedGivenTotal} kg</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            </div>

          </div>
        </div>
      </section>
      {/* 4.5. Feed Savings & ROI Calculator Section */}
      <section id="roi-calculator" className="py-20 bg-white border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
                     {/* Left Side: Copy/Explanation */}
            <div className="lg:col-span-5 space-y-8 pr-2">
              
              <div className="space-y-4">
                <span className="inline-flex items-center gap-1.5 text-xxs font-extrabold uppercase tracking-widest text-sky-600 bg-sky-50 border border-sky-100 px-3 py-1.5 rounded-full shadow-sm shadow-sky-50">
                  <TrendingUp className="w-3.5 h-3.5" /> Kalkulator ROI Tambak
                </span>
                
                <h3 className="text-3xl lg:text-4xl font-black tracking-tight leading-tight bg-gradient-to-br from-slate-950 via-slate-800 to-sky-850 bg-clip-text text-transparent">
                  Hitung Potensi Uang yang Dapat Anda Hemat
                </h3>
                
                <p className="text-sm text-slate-500 leading-relaxed">
                  Biaya pakan mencakup hingga <span className="font-extrabold text-slate-850">70% pengeluaran tambak</span>. Dengan menggunakan e-Fish, Anda dapat memantau FCR secara presisi menuju target ideal 1.2. Gunakan kalkulator ini untuk melihat berapa juta rupiah penghematan biaya pakan Anda per siklus panen!
                </p>
              </div>
              
              {/* Comparative Infographic Card */}
              <div className="p-6 bg-gradient-to-br from-sky-50 to-indigo-50/30 border-l-4 border-sky-500 rounded-r-3xl rounded-l-lg shadow-md hover:shadow-lg transition-all duration-300 space-y-4 group">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-sky-100 text-sky-700 rounded-lg">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider">Mengapa FCR Sangat Penting?</h5>
                </div>
                
                <p className="text-xs text-slate-500 leading-relaxed">
                  FCR (Feed Conversion Ratio) mendefinisikan efisiensi pakan kolam Anda. Berikut perbandingannya secara visual:
                </p>

                <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                  <div className="p-3 bg-white/70 border border-slate-100 rounded-xl space-y-1.5">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Tanpa e-Fish (FCR 1.6)</span>
                    <div className="flex items-baseline gap-1">
                      <span className="font-extrabold text-slate-800 text-sm">1.6 kg</span>
                      <span className="text-[10px] text-slate-400">pakan</span>
                    </div>
                    <span className="inline-block text-[9px] px-1.5 py-0.5 bg-rose-50 text-rose-600 rounded font-bold">Kurang Efisien</span>
                  </div>

                  <div className="p-3 bg-white/70 border border-slate-100 rounded-xl space-y-1.5 border-l-2 border-l-emerald-500 shadow-sm">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Dengan e-Fish (FCR 1.2)</span>
                    <div className="flex items-baseline gap-1">
                      <span className="font-extrabold text-emerald-600 text-sm">1.2 kg</span>
                      <span className="text-[10px] text-slate-400">pakan</span>
                    </div>
                    <span className="inline-block text-[9px] px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded font-bold">Optimal</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-start gap-2 text-xs text-slate-650 font-semibold leading-relaxed">
                  <Sparkles className="w-4.5 h-4.5 text-amber-500 fill-amber-500/10 flex-shrink-0 mt-0.5 animate-pulse" />
                  <span>
                    Anda menghemat <span className="text-emerald-600 font-extrabold">25% pembelian pakan</span> untuk jumlah hasil panen ikan yang sama!
                  </span>
                </div>
              </div>

            </div>

            {/* Right Side: Calculator Widget */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -z-10" />
              
              <h4 className="font-extrabold text-white text-lg mb-6 flex items-center gap-2">
                <Scale className="h-5 w-5 text-emerald-400" />
                Simulasi Keuntungan e-Fish
              </h4>

              <div className="space-y-6">
                {/* Slider 1: Harvest Target */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-slate-300">
                    <span>Target Hasil Panen (kg)</span>
                    <span className="text-emerald-400 font-bold">{harvestTarget.toLocaleString('id-ID')} kg</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="10000"
                    step="500"
                    value={harvestTarget}
                    onChange={(e) => setHarvestTarget(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-medium">
                    <span>500 kg</span>
                    <span>5.000 kg</span>
                    <span>10.000 kg</span>
                  </div>
                </div>

                {/* Slider 2: Current FCR */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-slate-300">
                    <span>FCR Kolam Saat Ini (Tanpa e-Fish)</span>
                    <span className="text-yellow-400 font-bold">{currentFcr}</span>
                  </div>
                  <input
                    type="range"
                    min="1.4"
                    max="2.2"
                    step="0.1"
                    value={currentFcr}
                    onChange={(e) => setCurrentFcr(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-medium">
                    <span>1.4 (Efisien)</span>
                    <span>1.8 (Boros)</span>
                    <span>2.2 (Sangat Boros)</span>
                  </div>
                </div>

                {/* Slider 3: Feed Price */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-slate-300">
                    <span>Harga Pakan Ikan (per kg)</span>
                    <span className="text-sky-400 font-bold">Rp {feedPrice.toLocaleString('id-ID')}</span>
                  </div>
                  <input
                    type="range"
                    min="9000"
                    max="16000"
                    step="500"
                    value={feedPrice}
                    onChange={(e) => setFeedPrice(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-medium">
                    <span>Rp 9.000</span>
                    <span>Rp 12.500</span>
                    <span>Rp 16.000</span>
                  </div>
                </div>

                {/* Results Screen */}
                <div className="pt-6 border-t border-white/5 grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Pakan yang Dihemat</span>
                    <span className="text-xl font-black text-white mt-1 block">
                      {feedSaved.toLocaleString('id-ID')} kg
                    </span>
                    <span className="text-[9px] text-slate-500 mt-1 block">Dari {feedNeededOld.toLocaleString('id-ID')} kg ke {feedNeededNew.toLocaleString('id-ID')} kg</span>
                  </div>

                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl" />
                    <span className="text-[10px] text-emerald-400 uppercase tracking-wider block font-bold">Total Uang Dihemat</span>
                    <span className="text-2xl font-black text-emerald-400 mt-1 block">
                      Rp {moneySaved.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[9px] text-emerald-500/60 mt-1 block font-medium">Per Siklus Budidaya</span>
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
