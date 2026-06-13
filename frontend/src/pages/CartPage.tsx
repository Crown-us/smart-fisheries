import React, { useState } from 'react';
import { useCartStore } from '../store/cartStore';
import { marketplaceService } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShoppingCart, Trash2, Plus, Minus, MapPin, 
  CreditCard, ChevronLeft, CheckCircle2 
} from 'lucide-react';

export default function CartPage() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, clearCart, getTotalAmount } = useCartStore();
  const [shippingAddress, setShippingAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setLoading(true);

    try {
      const orderItems = items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      }));

      await marketplaceService.checkoutOrder({
        shippingAddress,
        items: orderItems
      });

      // Clear local storage cart
      clearCart();
      setCheckoutSuccess(true);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal melakukan checkout. Periksa kembali stok produk.');
    } finally {
      setLoading(false);
    }
  };

  if (checkoutSuccess) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
        <div className="p-4 bg-emerald-500/10 rounded-full text-emerald-400 animate-bounce">
          <CheckCircle2 className="h-16 w-16" />
        </div>
        <h3 className="text-2xl font-bold text-white">Transaksi Berhasil!</h3>
        <p className="text-sm text-gray-400 max-w-sm">
          Pesanan Anda telah diregister di sistem dan petani akan segera memproses pengiriman produk ke alamat Anda.
        </p>
        <div className="flex gap-4 pt-4">
          <Link to="/consumer/orders" className="bg-primary text-black font-bold px-6 py-3 rounded-xl hover:shadow-lg transition-all text-sm">
            Riwayat Pesanan
          </Link>
          <Link to="/consumer/marketplace" className="bg-white/5 border border-white/10 text-white font-bold px-6 py-3 rounded-xl transition-all text-sm">
            Belanja Lagi
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header link */}
      <div>
        <Link to="/consumer/marketplace" className="text-sm text-gray-400 hover:text-primary flex items-center gap-1 mb-2 font-medium">
          <ChevronLeft className="h-4 w-4" /> Kembali Belanja
        </Link>
        <h2 className="text-2xl font-bold tracking-wide">Keranjang Belanja</h2>
        <p className="text-sm text-gray-400">Tinjau produk yang Anda pesan dan masukkan alamat pengantaran.</p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-3xl text-gray-500">
          <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-gray-600" />
          <h3 className="text-lg font-bold text-white mb-1">Keranjang Masih Kosong</h3>
          <p className="text-sm text-gray-400 mb-6">Silakan pilih ikan segar atau frozen terbaik dari katalog marketplace.</p>
          <Link to="/consumer/marketplace" className="bg-primary text-black font-bold px-6 py-3 rounded-xl text-sm">
            Mulai Belanja
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Cart items list */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.product.id} className="glass-panel p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="w-16 h-16 bg-slate-800 rounded-xl overflow-hidden flex-shrink-0">
                    {item.product.images?.[0]?.imageUrl ? (
                      <img src={item.product.images[0].imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <ShoppingCart className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-white line-clamp-1">{item.product.name}</h4>
                    <span className="text-xs text-primary font-bold block mt-1">Rp {item.product.price.toLocaleString('id-ID')}/{item.product.unit}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                  {/* Quantity adjustments */}
                  <div className="flex items-center border border-white/10 rounded-xl overflow-hidden bg-white/3">
                    <button 
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="p-2 hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-4 font-bold text-sm text-white">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="p-2 hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <span className="font-extrabold text-white text-base min-w-[90px] text-right">
                    Rp {(item.product.price * item.quantity).toLocaleString('id-ID')}
                  </span>

                  <button 
                    onClick={() => removeItem(item.product.id)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout sidebar details */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold tracking-wide">Ringkasan Pembayaran</h3>

            <div className="glass-panel p-6 rounded-3xl space-y-6">
              
              <div className="space-y-3 text-sm border-b border-white/5 pb-4">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal Belanja</span>
                  <span className="font-semibold text-white">Rp {getTotalAmount().toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Biaya Pengantaran</span>
                  <span className="font-semibold text-green-400">Gratis (Promo)</span>
                </div>
              </div>

              <div className="flex justify-between text-base font-bold text-white">
                <span>Total Tagihan</span>
                <span className="text-xl text-primary font-black">Rp {getTotalAmount().toLocaleString('id-ID')}</span>
              </div>

              {/* Shipping address form */}
              <form onSubmit={handleCheckout} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2 flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-primary" /> Alamat Pengiriman Lengkap
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Jl. Perikanan Indah No. 12, Sektor 4, Kecamatan Cerdas, Kota Bogor..."
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary text-xs"
                  />
                </div>

                <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-start gap-2.5 text-xs text-primary leading-relaxed">
                  <CreditCard className="h-5 w-5 flex-shrink-0" />
                  <p>
                    Metode pembayaran saat ini mendukung Cash-on-Delivery (COD) atau Transfer Bank langsung setelah konfirmasi status pakan dan timbang produk oleh petani.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-black font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2"
                >
                  <span>Bayar Sekarang (Rp {getTotalAmount().toLocaleString('id-ID')})</span>
                </button>
              </form>

            </div>
          </div>

        </div>
      )}

    </div>
  );
}
