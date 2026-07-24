import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const { addItem } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products');
        setProducts(res.data.data || []);
        // Extract unique categories
        const cats = [...new Set(res.data.data.map(p => p.category))];
        setCategories(cats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = selectedCategory
    ? products.filter(p => p.category === selectedCategory)
    : products;

  if (loading) {
    return <div className="text-center py-10 text-gray-600">Loading products...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">🛒 Shop Now</h1>

      {/* Category Filter */}
      <div className="flex gap-3 flex-wrap mb-6">
        <button
          onClick={() => setSelectedCategory('')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
            selectedCategory === '' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-10 text-gray-500">No products found</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <div key={product._id} className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden">
              <Link to={`/product/${product._id}`}>
                <div className="h-48 bg-gray-100 flex items-center justify-center">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-4xl">📦</span>
                  )}
                </div>
              </Link>
              <div className="p-4">
                <Link to={`/product/${product._id}`}>
                  <h3 className="font-semibold text-gray-800 hover:text-blue-600">{product.name}</h3>
                </Link>
                <p className="text-sm text-gray-500">{product.category}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-lg font-bold text-gray-800">₹{product.price.toFixed(2)}</span>
                  <span className="text-sm text-gray-500">per {product.unit}</span>
                </div>
                <button
                  onClick={() => addItem(product)}
                  className="w-full mt-3 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;