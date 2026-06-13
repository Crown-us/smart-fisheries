import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/api';
import { Waves, User, UserCheck, Loader2, ArrowLeft } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<'FARMER' | 'CONSUMER'>('FARMER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const data = await authService.register({
        email,
        username,
        password,
        firstName,
        lastName,
        role
      });
      
      setAuth(
        {
          id: data.userId,
          username: data.username,
          email: data.email,
          role: data.role,
          verified: data.role === 'CONSUMER',
        },
        data.accessToken,
        data.refreshToken
      );

      if (data.role === 'FARMER') {
        navigate('/farmer/dashboard');
      } else {
        navigate('/consumer/marketplace');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registrasi gagal. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative">
      {/* Back to Home Button */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-sm hover:shadow transition-all"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali ke Home
      </button>

      <div className="w-full max-w-lg bg-white border border-slate-200 p-8 rounded-2xl shadow-xl shadow-slate-100/80 relative overflow-hidden">
        
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-50 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-50/70 rounded-full blur-3xl -z-10" />

        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center mb-4 text-sky-600 shadow-sm border border-sky-100/30">
            <Waves className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Daftar Akun Baru</h2>
          <p className="text-xs text-slate-500 mt-1">Gabung Platform Perikanan Cerdas & Marketplace</p>
        </div>

        {error && (
          <div className="p-4 mb-4 bg-red-550 border border-red-200/50 text-red-600 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Role selection tab */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Pilih Peran Akun</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('FARMER')}
                className={`py-3.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                  role === 'FARMER'
                    ? 'bg-sky-50 border-sky-200 text-sky-700 font-bold shadow-sm'
                    : 'bg-white border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                <User className="h-4.5 w-4.5" />
                <span className="text-xs">Pembudidaya (Petani)</span>
              </button>
              
              <button
                type="button"
                onClick={() => setRole('CONSUMER')}
                className={`py-3.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                  role === 'CONSUMER'
                    ? 'bg-sky-50 border-sky-200 text-sky-700 font-bold shadow-sm'
                    : 'bg-white border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                <UserCheck className="h-4.5 w-4.5" />
                <span className="text-xs">Konsumen (Pembeli)</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Nama Depan</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Budi"
                className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Nama Belakang</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Santoso"
                className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="budi@example.com"
              className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="budipetani"
              className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Minimal 6 karakter"
              className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-all duration-200"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3.5 rounded-xl shadow-md shadow-sky-100 hover:shadow-lg hover:shadow-sky-100 transition-all duration-200 mt-2 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <span>Daftar Sekarang</span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-sky-600 hover:underline font-bold">
            Masuk disini
          </Link>
        </div>
      </div>
    </div>
  );
}
