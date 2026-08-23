import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLocation } from '../context/LocationContext';
import api from '../services/api';
import LocationPicker from '../components/LocationPicker';
import { useAuth } from '../context/AuthContext';

function Checkout() {
  const { user } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const { location, pincode, hasLocation, setLocationCoords } = useLocation();
  const navigate = useNavigate();

  // ─── State ───
  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [paymentLoading, setPaymentLoading] = useState(false);

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    line1: '',
    line2: '',
    locality: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    deliveryInstructions: '',
  });

  // ─── Handlers ───
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLocationSelect = (pos) => {
    if (pos) {
      setLocationCoords(pos.lat, pos.lng);
    }
    setShowPicker(false);
  };

  // ─── Load Razorpay script (dynamic) ───
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // ─── Submit order ───
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!hasLocation) {
      alert('❌ Please set your delivery location first.');
      setLoading(false);
      return;
    }

    // Combine address fields into a single string
    const fullAddress = [
      form.line1,
      form.line2,
      form.locality,
      form.landmark,
      form.city,
      form.state,
      form.pincode,
    ]
      .filter(Boolean)
      .join(', ');

    const orderData = {
      customerName: form.name,
      customerPhone: form.phone,
      address: fullAddress,
      deliveryInstructions: form.deliveryInstructions || '',
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount: totalPrice,
      customerLatitude: location?.lat || null,
      customerLongitude: location?.lng || null,
      customerPincode: form.pincode || null,
      paymentMethod: paymentMethod,
    };

    try {
      if (paymentMethod === 'cod') {
        // ─── Cash on Delivery ───
        const res = await api.post('/orders', orderData);
        alert(res.data.message || '✅ Order placed successfully!');
        clearCart();
        navigate('/orders');
      } else {
        // ─── Online Payment (Razorpay) ───
        setPaymentLoading(true);

        // 1. Create order on backend (gets order ID)
        const orderRes = await api.post('/orders', { ...orderData, paymentMethod: 'online' });
        const order = orderRes.data.data;
        if (!order) throw new Error('Order creation failed');

        // 2. Load Razorpay script
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          alert('Payment gateway failed to load. Please try again.');
          setPaymentLoading(false);
          setLoading(false);
          return;
        }

        // 3. Get Razorpay order ID from backend
        const razorpayRes = await api.post('/orders/create-razorpay-order', {
          orderId: order._id,
          amount: totalPrice * 100, // in paise
        });
        const razorpayOrder = razorpayRes.data;

        // 4. Open Razorpay checkout
        const options = {
          key: process.env.REACT_APP_RAZORPAY_KEY_ID,
          amount: totalPrice * 100,
          currency: 'INR',
          name: 'Your Store',
          description: `Order #${order._id.slice(-6)}`,
          order_id: razorpayOrder.id,
          handler: async (response) => {
            // Verify payment on backend
            try {
              const verifyRes = await api.post('/orders/verify-payment', {
                orderId: order._id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              });
              if (verifyRes.data.success) {
                alert('✅ Payment successful! Order placed.');
                clearCart();
                navigate('/orders');
              } else {
                alert('Payment verification failed. Please contact support.');
              }
            } catch (err) {
              alert('Verification error. Please contact support.');
              console.error(err);
            }
          },
          modal: {
            ondismiss: () => {
              setPaymentLoading(false);
              setLoading(false);
            },
          },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
        setPaymentLoading(false); // will be overridden by modal close
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || '❌ Failed to place order';
      alert(errorMsg);
      console.error('Order error:', err);
    } finally {
      if (paymentMethod === 'cod') {
        setLoading(false);
      } else {
        // For online, loading is controlled by the modal
        setLoading(false);
      }
    }
  };

  // ─── Empty cart view ───
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

      {/* ─── Location status ─── */}
      <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-sm">
        <span className="text-green-700">
          📍{' '}
          {location
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
          {showPicker ? 'Close Map' : 'Change Location'}
        </button>
      </div>

      {/* ─── Location Picker ─── */}
      {showPicker && (
        <div className="mb-6">
          <LocationPicker
            onLocationSelect={handleLocationSelect}
            initialPosition={location ? { lat: location.lat, lng: location.lng } : null}
          />
        </div>
      )}

      {/* ─── Checkout Form ─── */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4">
        {/* Name & Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Your Name *</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Address fields */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Flat / House no / Building name *</label>
          <input
            type="text"
            name="line1"
            value={form.line1}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="e.g., A-101, Green Apartments"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Floor (optional)</label>
          <input
            type="text"
            name="line2"
            value={form.line2}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="e.g., 3rd Floor"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Area / Sector / Locality *</label>
          <input
            type="text"
            name="locality"
            value={form.locality}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="e.g., Banashankari 1st Stage"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Nearby Landmark (optional)</label>
          <input
            type="text"
            name="landmark"
            value={form.landmark}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="e.g., Near temple"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">City *</label>
            <input
              type="text"
              name="city"
              value={form.city}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">State *</label>
            <input
              type="text"
              name="state"
              value={form.state}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Pincode *</label>
            <input
              type="text"
              name="pincode"
              value={form.pincode}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              pattern="[0-9]{6}"
              title="6-digit pincode"
            />
          </div>
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

        {/* ─── PAYMENT METHOD ─── */}
        <div className="border-t pt-4">
          <h3 className="font-semibold mb-3">Payment Method</h3>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                checked={paymentMethod === 'cod'}
                onChange={() => setPaymentMethod('cod')}
              />
              Cash on Delivery
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="paymentMethod"
                value="online"
                checked={paymentMethod === 'online'}
                onChange={() => setPaymentMethod('online')}
              />
              Online (UPI / Card)
            </label>
          </div>
        </div>

        {/* ─── ORDER SUMMARY ─── */}
        <div className="border-t pt-4">
          <h3 className="font-semibold mb-2">Order Summary</h3>
          {items.map((item) => (
            <div key={item.productId} className="flex justify-between text-sm py-1">
              <span>
                {item.quantity} × {item.name}
              </span>
              <span>₹{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t">
            <span>Total</span>
            <span>₹{totalPrice.toFixed(2)}</span>
          </div>
        </div>

        {/* ─── SUBMIT ─── */}
        <button
          type="submit"
          disabled={loading || paymentLoading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition font-medium"
        >
          {loading || paymentLoading
            ? 'Processing...'
            : paymentMethod === 'cod'
            ? 'Place Order'
            : 'Pay & Place Order'}
        </button>
      </form>
    </div>
  );
}

export default Checkout;