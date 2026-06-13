import React, { useEffect, useState } from 'react';
import { marketplaceService } from '../services/api';
import { Order } from '../types';
import { 
  ClipboardList, ShoppingBag, Clock, CheckCircle2, 
  Truck, XCircle, ArrowRight, ShieldCheck, MapPin 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ConsumerOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await marketplaceService.getConsumerOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load consumer orders', err);
    } finally {
      setLoading(false);
    }
  };

  const statusIcons = {
    PENDING: { icon: Clock, style: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' },
    PAID: { icon: CheckCircle2, style: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' },
    SHIPPED: { icon: Truck, style: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' },
    COMPLETED: { icon: ShieldCheck, style: 'bg-green-500/10 text-green-400 border border-green-500/20' },
    CANCELLED: { icon: XCircle, style: 'bg-red-500/10 text-red-400 border border-red-500/20' }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-wide">Riwayat Pembelian</h2>
        <p className="text-sm text-gray-400">Pantau status pengiriman ikan segar langsung dari kolam ke meja makan Anda.</p>
      </div>

      {loading ? (
        <p className="text-gray-500">Memuat riwayat transaksi...</p>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-3xl text-gray-500">
          <ClipboardList className="h-16 w-16 mx-auto mb-4 text-gray-600 animate-pulse" />
          <h3 className="text-lg font-bold text-white mb-1">Belum Ada Transaksi</h3>
          <p className="text-sm text-gray-400 mb-6">Mulai belanja seafood organik berkualitas pertama Anda sekarang!</p>
          <Link to="/consumer/marketplace" className="bg-primary text-black font-bold px-6 py-3 rounded-xl text-sm">
            Pasar Marketplace
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const StatusIcon = statusIcons[order.status]?.icon || Clock;
            const statusStyle = statusIcons[order.status]?.style || '';

            return (
              <div key={order.id} className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4 hover:border-white/10 transition-all duration-300">
                
                {/* Order header information */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/5 pb-4">
                  <div>
                    <span className="text-xs text-gray-500 block">Nomor Pesanan</span>
                    <span className="font-bold text-white text-base">#0000{order.id}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Tanggal Pembelian</span>
                    <span className="font-semibold text-white text-sm">
                      {new Date(order.createdAt).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Status Pengiriman</span>
                    <span className={`text-xxs px-2.5 py-1 rounded-full font-bold uppercase flex items-center gap-1.5 mt-1 ${statusStyle}`}>
                      <StatusIcon className="h-3.5 w-3.5" />
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Items in order */}
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-white">{item.productName}</span>
                        <span className="text-xs text-gray-500">x{item.quantity}</span>
                      </div>
                      <span className="font-bold text-white">
                        Rp {(item.pricePerUnit * item.quantity).toLocaleString('id-ID')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer totals */}
                <div className="border-t border-white/5 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs text-gray-400">
                  <div className="flex items-start gap-1.5 max-w-md">
                    <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <span>Alamat: {order.shippingAddress}</span>
                  </div>
                  <div className="text-right w-full sm:w-auto">
                    <span className="text-gray-500 block text-xxs uppercase font-semibold">Total Pembayaran</span>
                    <span className="text-lg font-black text-primary block mt-0.5">
                      Rp {order.totalAmount.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
