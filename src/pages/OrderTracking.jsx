import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';

function OrderTracking() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('id');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      const fetchOrder = async () => {
        try {
          const res = await api.get(`/orders/${orderId}`);
          setOrder(res.data.data);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    } else {
      setLoading(false);
    }
  }, [orderId]);

  if (loading) return <div className="text-center py-10 text-gray-600">Loading order...</div>;
  if (!order) return <div className="text-center py-10 text-red-600">Order not found</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">📦 Order #{order._id.slice(-6)}</h2>
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center">
          <span className="font-medium">Status:</span>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
            order.status === 'dispatched' ? 'bg-blue-100 text-blue-800' :
            order.status === 'picking' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {order.status ? order.status.toUpperCase() : 'PENDING'}
          </span>
        </div>
        <div className="mt-4">
          <p><strong>Delivery Address:</strong> {order.address}</p>
          <p><strong>Total:</strong> ₹{order.totalAmount?.toFixed(2)}</p>
        </div>
        <div className="mt-4 border-t pt-4">
          <h4 className="font-medium">Items</h4>
          {order.items?.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm py-1">
              <span>{item.quantity} x {item.productId?.name || 'Product'}</span>
              <span>₹{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default OrderTracking;