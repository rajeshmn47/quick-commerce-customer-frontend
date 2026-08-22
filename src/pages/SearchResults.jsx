import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';

function SearchResults() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!query) {
            setProducts([]);
            setLoading(false);
            return;
        }

        const fetchSearch = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/products/search?query=${encodeURIComponent(query)}`);
                setProducts(res.data.data || []);
                setError(null);
            } catch (err) {
                setError('Failed to load search results');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchSearch();
    }, [query]);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto p-6 text-center py-12">
                <p className="text-gray-500">Searching for "{query}"...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto p-6 text-center py-12">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-2">Results for "{query}"</h1>
            <p className="text-gray-500 mb-6">{products.length} product{products.length !== 1 ? 's' : ''} found</p>

            {products.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow">
                    <p className="text-gray-400 text-lg">No products found</p>
                    <p className="text-sm text-gray-400">Try a different keyword</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {products.map((product) => (
                        <Link
                            to={`/product/${product._id}`}
                            key={product._id}
                            className="bg-white rounded-lg shadow hover:shadow-md transition p-3"
                        >
                            {product.image_url ? (
                                <img
                                    src={product.image_url}
                                    alt={product.name}
                                    className="w-full h-40 object-cover rounded-md mb-2"
                                />
                            ) : (
                                <div className="w-full h-40 bg-gray-100 rounded-md mb-2 flex items-center justify-center text-gray-400">
                                    No image
                                </div>
                            )}
                            <h3 className="font-medium text-sm line-clamp-1">{product.name}</h3>
                            <p className="text-blue-600 font-bold mt-1">₹{product.price}</p>
                            <p className="text-xs text-gray-500">{product.category}</p>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

export default SearchResults;