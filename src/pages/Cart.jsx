import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function Cart() {
  const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800">🛒 Your Cart is Empty</h2>
        <p className="text-gray-500 mt-2">Start shopping to add items.</p>
        <Link to="/" className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">🛒 Your Cart ({totalItems} items)</h2>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {items.map(item => (
          <div key={item.productId} className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex-1">
              <h3 className="font-medium text-gray-800">{item.name}</h3>
              <p className="text-sm text-gray-500">₹{item.price} / {item.unit}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 transition"
              >
                -
              </button>
              <span className="w-8 text-center font-medium">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 transition"
              >
                +
              </button>
            </div>
            <div className="ml-4 text-right">
              <p className="font-bold text-gray-800">₹{(item.price * item.quantity).toFixed(2)}</p>
              <button
                onClick={() => removeItem(item.productId)}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        <div className="p-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Total:</span>
            <span className="text-2xl font-bold text-blue-600">₹{totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={clearCart}
              className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
            >
              Clear Cart
            </button>
            <Link
              to="/checkout"
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition text-center"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;