import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function Orders() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');

    const fetchOrders = async () => {
        try {
            // ✅ Fetch orders for the logged-in customer
            const url = statusFilter 
                ? `/orders/customer?phone=${user?.phone}&status=${statusFilter}`
                : `/orders/customer?phone=${user?.phone}`;
            const res = await api.get(url);
            setOrders(res.data.data || []);
        } catch (err) {
            console.error(err);
            alert('Failed to fetch your orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.phone) {
            fetchOrders();
        }
    }, [statusFilter, user?.phone]);

    // ✅ Helper: Get status color
    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            picking: 'bg-blue-100 text-blue-800',
            dispatched: 'bg-purple-100 text-purple-800',
            delivered: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    // ✅ Helper: Get status icon
    const getStatusIcon = (status) => {
        const icons = {
            pending: '⏳',
            picking: '📦',
            dispatched: '🚚',
            delivered: '✅',
            cancelled: '❌',
        };
        return icons[status] || '📋';
    };

    // ✅ Helper: Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-gray-600">Loading your orders...</div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">📦 My Orders</h1>
                    <p className="text-gray-500 text-sm">
                        {orders.length} order{orders.length !== 1 ? 's' : ''} found
                    </p>
                </div>

                {/* Filter */}
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                >
                    <option value="">All Status</option>
                    <option value="pending">⏳ Pending</option>
                    <option value="picking">📦 Picking</option>
                    <option value="dispatched">🚚 Dispatched</option>
                    <option value="delivered">✅ Delivered</option>
                    <option value="cancelled">❌ Cancelled</option>
                </select>
            </div>

            {/* Orders List */}
            {orders.length === 0 ? (
                <div className="bg-white rounded-xl shadow p-12 text-center">
                    <div className="text-6xl mb-4">🛒</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Orders Yet</h3>
                    <p className="text-gray-500 mb-4">Start shopping to place your first order!</p>
                    <Link
                        to="/"
                        className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        Browse Products
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div
                            key={order._id}
                            className="bg-white rounded-xl shadow hover:shadow-md transition overflow-hidden"
                        >
                            {/* Order Header */}
                            <div className="p-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-2">
                                <div>
                                    <span className="font-mono text-sm text-gray-500">
                                        Order #{order._id.slice(-8).toUpperCase()}
                                    </span>
                                    <span className="mx-2 text-gray-300">|</span>
                                    <span className="text-sm text-gray-500">
                                        {formatDate(order.createdAt)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{getStatusIcon(order.status)}</span>
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                        {order.status.toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            {/* Order Body */}
                            <div className="p-4">
                                {/* Store */}
                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                                    <span>🏪</span>
                                    <span>{order.storeId?.name || 'Store'}</span>
                                    <span className="text-gray-300">•</span>
                                    <span className="text-gray-400">{order.storeId?.address}</span>
                                </div>

                                {/* Items */}
                                <div className="space-y-2 mb-3">
                                    {order.items?.slice(0, 3).map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-sm">
                                            <span className="text-gray-700">
                                                {item.quantity}× {item.productId?.name || 'Product'}
                                            </span>
                                            <span className="text-gray-600">
                                                ₹{(item.price * item.quantity).toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                    {order.items?.length > 3 && (
                                        <div className="text-sm text-gray-400">
                                            + {order.items.length - 3} more item{order.items.length - 3 > 1 ? 's' : ''}
                                        </div>
                                    )}
                                </div>

                                {/* Delivery Info */}
                                <div className="border-t border-gray-100 pt-3 mt-2">
                                    <div className="flex items-start gap-2 text-sm text-gray-600">
                                        <span>📍</span>
                                        <span>{order.address}</span>
                                    </div>
                                    {order.deliveryInstructions && (
                                        <div className="flex items-start gap-2 text-sm text-gray-500 mt-1">
                                            <span>📝</span>
                                            <span className="italic">{order.deliveryInstructions}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Total & Actions */}
                                <div className="border-t border-gray-100 pt-3 mt-3 flex flex-wrap justify-between items-center gap-3">
                                    <div>
                                        <span className="text-sm text-gray-500">Total</span>
                                        <span className="text-xl font-bold text-blue-600 ml-3">
                                            ₹{order.totalAmount?.toFixed(2) || '0.00'}
                                        </span>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        {order.status === 'pending' && (
                                            <button
                                                onClick={async () => {
                                                    if (!window.confirm('Cancel this order?')) return;
                                                    try {
                                                        await api.put(`/orders/${order._id}/status`, { status: 'cancelled' });
                                                        fetchOrders();
                                                    } catch (err) {
                                                        alert('Failed to cancel order');
                                                    }
                                                }}
                                                className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                                            >
                                                Cancel Order
                                            </button>
                                        )}
                                        {order.status === 'delivered' && (
                                            <Link
                                                to={`/orders/${order._id}`}
                                                className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                                            >
                                                View Details
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Orders;