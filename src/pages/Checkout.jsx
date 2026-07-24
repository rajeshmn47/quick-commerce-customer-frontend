import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLocation } from '../context/LocationContext';
import api from '../services/api';
import LocationPicker from '../components/LocationPicker';

function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { location, pincode, hasLocation, setLocationCoords } = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    address: '',
    deliveryInstructions: '',
  });
  const [showPicker, setShowPicker] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLocationSelect = (pos) => {
    if (pos) {
      setLocationCoords(pos.lat, pos.lng);
      // ❌ No reverse-geocoding – user types address manually
    }
    setShowPicker(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!hasLocation) {
      alert('❌ Please set your delivery location first.');
      setLoading(false);
      return;
    }

    const orderData = {
      customerName: form.customerName,
      customerPhone: form.customerPhone,
      address: form.address,
      deliveryInstructions: form.deliveryInstructions || '',
      items: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount: totalPrice,
      customerLatitude: location?.lat || null,
      customerLongitude: location?.lng || null,
      customerPincode: pincode || null,
    };

    try {
      const res = await api.post('/orders', orderData);
      alert(res.data.message || '✅ Order placed successfully!');
      clearCart();
      navigate('/orders');
    } catch (err) {
      const errorMsg = err.response?.data?.error || '❌ Failed to place order';
      alert(errorMsg);
      console.error('Order error:', err);
    } finally {
      setLoading(false);
    }
  };

  console.log(showPicker, "picker");

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Cart is empty</h2>
        <Link to="/" className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg">
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">📝 Checkout</h2>

      {/* 📍 Location status + "Change" button */}
      <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-sm">
        <span className="text-green-700">
          📍 {location
            ? `Delivering to: ${location.lat?.toFixed(4)}, ${location.lng?.toFixed(4)}`
            : pincode
              ? `Delivering to pincode: ${pincode}`
              : 'Location not set'}
        </span>
        <button
          type="button"
          onClick={() => setShowPicker(!showPicker)}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          {showPicker ? 'Close Map' : 'Change Locatioen'}
        </button>
      </div>

      {/* 🗺️ Location Picker */}
      {showPicker && (
        <div className="mb-6">
          <h1>show picker</h1>
          <LocationPicker
            onLocationSelect={handleLocationSelect}
            initialPosition={location ? { lat: location.lat, lng: location.lng } : null}
          />
        </div>
      )}

      {/* Checkout Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name *</label>
          <input
            type="text"
            name="customerName"
            value={form.customerName}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
          <input
            type="tel"
            name="customerPhone"
            value={form.customerPhone}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Delivery Address *</label>
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            required
            rows="3"
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Enter full address with landmarks"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Delivery Instructions</label>
          <input
            type="text"
            name="deliveryInstructions"
            value={form.deliveryInstructions}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Call before delivery, gate code, etc."
          />
        </div>

        <div className="border-t pt-4">
          <h3 className="font-semibold">Order Summary</h3>
          {items.map(item => (
            <div key={item.productId} className="flex justify-between text-sm py-1">
              <span>{item.quantity} × {item.name}</span>
              <span>₹{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t">
            <span>Total</span>
            <span>₹{totalPrice.toFixed(2)}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition font-medium"
        >
          {loading ? 'Placing Order...' : 'Place Order'}
        </button>
      </form>
    </div>
  );
}

export default Checkout;