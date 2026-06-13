import React, { useEffect, useState } from 'react';
import { marketplaceService } from '../services/api';
import { Product } from '../types';
import { useCartStore } from '../store/cartStore';
import { 
  ShoppingBag, Search, Filter, ShoppingCart, 
  CheckCircle, ShieldCheck, Tag, Info 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ConsumerMarketplace() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  const addItem = useCartStore((state) => state.addItem);
  const cartItemsCount = useCartStore((state) => state.getTotalCount());

  useEffect(() => {
    loadMarketplace();
  }, [searchQuery, selectedCategory]);

  const loadMarketplace = async () => {
    setLoading(true);
    try {
      const data = await marketplaceService.browseProducts(searchQuery, selectedCategory);
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: '', label: 'Semua Kategori' },
    { value: 'FRESH_FISH', label: 'Ikan Segar' },
    { value: 'FROZEN_FISH', label: 'Ikan Beku' },
    { value: 'PROCESSED', label: 'Olahan Ikan' },
  ];

  return (
    <div className="space-y-8">
      
      {/* Banner / Intro */}
      <div className="glass-panel p-8 rounded-3xl bg-gradient-to-r from-primary/10 via-emerald-500/5 to-transparent relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="space-y-3 max-w-xl">
          <span className="text-xs font-bold text-primary tracking-widest uppercase bg-primary/10 px-3 py-1.5 rounded-full">Direct-to-Consumer</span>
          <h2 className="text-3xl font-extrabold text-white leading-tight">Pasar Ikan Cerdas & Segar</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Beli komoditas perikanan bermutu tinggi langsung dari kolam pembudidaya lokal berlisensi dan tersertifikasi digital.
          </p>
        </div>

        <Link 
          to="/consumer/cart" 
          className="bg-primary text-black font-bold px-6 py-4 rounded-2xl hover:shadow-lg hover:shadow-primary/20 hover:scale-102 active:scale-98 transition-all flex items-center gap-3 self-stretch md:self-auto justify-center"
        >
          <ShoppingCart className="h-5.5 w-5.5" />
          <span>Keranjang Belanja ({cartItemsCount})</span>
        </Link>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-500" />
          </span>
          <input
            type="text"
            placeholder="Cari ikan segar atau frozen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-primary placeholder-gray-500"
          />
        </div>

        {/* Categories Tabs */}
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2.5 rounded-xl border text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.value
                  ? 'bg-primary border-primary text-black'
                  : 'bg-white/5 border-white/5 text-gray-400 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products list grid */}
      {loading ? (
        <p className="text-gray-500">Memuat ikan segar dari pasar...</p>
      ) : products.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-3xl text-gray-500">
          <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-gray-600" />
          <h3 className="text-lg font-bold text-white mb-1">Produk Tidak Ditemukan</h3>
          <p className="text-sm text-gray-400">Tidak ada produk budidaya yang lolos moderasi atau sesuai pencarian saat ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="glass-panel rounded-3xl overflow-hidden border border-white/5 flex flex-col justify-between hover:border-primary/25 transition-all duration-300">
              
              {/* Product Visual */}
              <div className="relative h-48 bg-slate-800">
                {product.images?.[0]?.imageUrl ? (
                  <img src={product.images[0].imageUrl} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                    <ShoppingBag className="h-10 w-10" />
                  </div>
                )}
                
                {/* Farmer badge */}
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl flex items-center gap-1.5 border border-white/10">
                  <span className="text-xxs text-gray-300 font-semibold">{product.farmerName}</span>
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6 flex-grow flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-white text-lg line-clamp-1">{product.name}</h4>
                  <p className="text-xs text-gray-400 mt-2 line-clamp-2 leading-relaxed">{product.description || 'Tidak ada deskripsi.'}</p>
                </div>

                <div className="mt-6 border-t border-white/5 pt-4">
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="text-xl font-black text-primary">Rp {product.price.toLocaleString('id-ID')}<span className="text-xs text-gray-400 font-semibold">/{product.unit}</span></span>
                    <span className="text-xs text-gray-400">Stok: {product.stockQuantity} {product.unit}</span>
                  </div>

                  <button
                    onClick={() => {
                      addItem(product, 1);
                      alert(`${product.name} ditambahkan ke keranjang belanja!`);
                    }}
                    className="w-full bg-white/5 hover:bg-primary border border-white/10 hover:border-transparent text-white hover:text-black font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <ShoppingCart className="h-4.5 w-4.5" />
                    <span>Beli Sekarang</span>
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
