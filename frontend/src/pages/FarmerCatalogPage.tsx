import React, { useEffect, useState } from 'react';
import { marketplaceService } from '../services/api';
import { Product } from '../types';
import { 
  ShoppingBag, Plus, Trash2, Edit3, Image, 
  CheckCircle2, XCircle, Clock, X 
} from 'lucide-react';

export default function FarmerCatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(30000);
  const [stock, setStock] = useState(100.0);
  const [unit, setUnit] = useState<'KG' | 'PCS'>('KG');
  const [category, setCategory] = useState<'FRESH_FISH' | 'FROZEN_FISH' | 'PROCESSED'>('FRESH_FISH');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const list = await marketplaceService.listFarmerCatalog();
      setProducts(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name,
      description,
      price,
      stockQuantity: stock,
      unit,
      category,
      imageUrls: imageUrl ? [imageUrl] : []
    };

    try {
      if (editingProduct) {
        await marketplaceService.updateProduct(editingProduct.id, data);
      } else {
        await marketplaceService.createProduct(data);
      }
      setShowModal(false);
      resetForm();
      loadProducts();
    } catch (err) {
      alert('Gagal menyimpan produk');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setDescription(product.description || '');
    setPrice(product.price);
    setStock(product.stockQuantity);
    setUnit(product.unit);
    setCategory(product.category as any);
    setImageUrl(product.images?.[0]?.imageUrl || '');
    setShowModal(true);
  };

  const handleDelete = async (productId: number) => {
    if (!window.confirm('Hapus produk ini?')) return;
    try {
      await marketplaceService.deleteProduct(productId);
      loadProducts();
    } catch (err) {
      alert('Gagal menghapus produk');
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setPrice(30000);
    setStock(100.0);
    setUnit('KG');
    setCategory('FRESH_FISH');
    setImageUrl('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-wide">Katalog Jualan Anda</h2>
          <p className="text-sm text-gray-400">Kelola dagangan Anda untuk dipasarkan langsung ke konsumen.</p>
        </div>
        
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-primary text-black font-bold px-5 py-3 rounded-xl hover:shadow-lg hover:shadow-primary/20 hover:scale-102 transition-all flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          <span>Tambah Produk Baru</span>
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Memuat katalog...</p>
      ) : products.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-3xl text-gray-500">
          <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-gray-600 animate-pulse" />
          <h3 className="text-lg font-bold text-white mb-1">Katalog Masih Kosong</h3>
          <p className="text-sm text-gray-400">Tambahkan barang jualan pertama Anda seperti ikan nila segar, lele hidup, dll.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <div key={p.id} className="glass-panel rounded-3xl overflow-hidden border border-white/5 flex flex-col justify-between hover:border-primary/25 transition-all duration-300">
              
              {/* Product Visual */}
              <div className="relative h-48 bg-slate-800">
                {p.images?.[0]?.imageUrl ? (
                  <img src={p.images[0].imageUrl} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                    <Image className="h-10 w-10" />
                  </div>
                )}
                
                {/* Moderation Status Tag */}
                <span className={`absolute top-4 right-4 text-xxs font-bold px-2.5 py-1 rounded-full uppercase flex items-center gap-1 shadow-lg ${
                  p.moderationStatus === 'APPROVED' 
                    ? 'bg-green-500 text-white' 
                    : p.moderationStatus === 'REJECTED' 
                      ? 'bg-red-500 text-white' 
                      : 'bg-yellow-500 text-black'
                }`}>
                  {p.moderationStatus === 'APPROVED' && <CheckCircle2 className="h-3 w-3" />}
                  {p.moderationStatus === 'REJECTED' && <XCircle className="h-3 w-3" />}
                  {p.moderationStatus === 'PENDING' && <Clock className="h-3 w-3" />}
                  {p.moderationStatus}
                </span>
              </div>

              {/* Product Info */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-white text-lg line-clamp-1">{p.name}</h4>
                  <p className="text-xs text-gray-500 mt-0.5 capitalize">{p.category.replace('_', ' ').toLowerCase()}</p>
                  
                  <div className="mt-4 flex justify-between items-baseline">
                    <span className="text-xl font-black text-primary">Rp {p.price.toLocaleString('id-ID')}<span className="text-xs text-gray-400 font-semibold">/{p.unit}</span></span>
                    <span className="text-xs text-gray-400">Stok: <span className="font-bold text-white">{p.stockQuantity} {p.unit}</span></span>
                  </div>
                  
                  <p className="text-xs text-gray-400 mt-3 line-clamp-2 leading-relaxed">{p.description || 'Tidak ada deskripsi.'}</p>
                </div>

                {/* Edit and Delete Actions */}
                <div className="flex gap-3 mt-6 border-t border-white/5 pt-4">
                  <button 
                    onClick={() => handleEdit(p)}
                    className="flex-1 py-2 px-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Edit Detail
                  </button>
                  <button 
                    onClick={() => handleDelete(p.id)}
                    className="py-2 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* --- ADD/EDIT PRODUCT MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel p-8 rounded-3xl relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X className="h-6 w-6" />
            </button>
            
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <ShoppingBag className="h-6 w-6 text-primary" />
              {editingProduct ? 'Ubah Informasi Produk' : 'Tambah Produk Jualan'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">Nama Produk</label>
                <input
                  type="text"
                  required
                  placeholder="Ikan Nila Segar Baru Panen"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">Tautan URL Gambar Produk</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... (Kosongkan jika tidak ada)"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2">Harga Jual (Rp)</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(parseInt(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2">Stok Awal</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={stock}
                    onChange={(e) => setStock(parseFloat(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2">Satuan Unit</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as any)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary appearance-none"
                  >
                    <option value="KG" className="bg-slate-900 text-white">Kilogram (KG)</option>
                    <option value="PCS" className="bg-slate-900 text-white">Ekor/Buah (PCS)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary appearance-none"
                  >
                    <option value="FRESH_FISH" className="bg-slate-900 text-white">Ikan Segar</option>
                    <option value="FROZEN_FISH" className="bg-slate-900 text-white">Ikan Beku</option>
                    <option value="PROCESSED" className="bg-slate-900 text-white">Olahan Ikan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">Deskripsi Produk</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ikan dipanen pagi hari langsung dari kolam bersih..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary h-20"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-black font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all mt-4"
              >
                {editingProduct ? 'Ubah Informasi' : 'Terbitkan Produk'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
