import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

function Navbar() {
    const { totalItems } = useCart();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <span className="text-2xl">🛍️</span>
                        <span className="text-xl font-bold text-blue-600">Shop</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link to="/" className="text-gray-600 hover:text-blue-600 transition">
                            Home
                        </Link>
                        <Link to="/orders" className="text-gray-600 hover:text-blue-600 transition">
                            Orders
                        </Link>
                        <Link to="/profile" className="text-gray-600 hover:text-blue-600 transition">
                            Profile
                        </Link>

                        {/* Cart Icon with Badge */}
                        <Link to="/cart" className="relative text-gray-600 hover:text-blue-600 transition">
                            <span className="text-2xl">🛒</span>
                            {totalItems > 0 && (
                                <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                    {totalItems}
                                </span>
                            )}
                        </Link>

                        {/* User Info & Logout */}
                        <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200">
                            <span className="text-sm text-gray-600">
                                👋 {user?.name?.split(' ')[0] || 'User'}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="text-sm text-red-600 hover:text-red-800 transition"
                            >
                                Logout
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden text-gray-600 hover:text-gray-800"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-100 space-y-3">
                        <Link
                            to="/"
                            className="block text-gray-600 hover:text-blue-600 transition px-2"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Home
                        </Link>
                        <Link
                            to="/orders"
                            className="block text-gray-600 hover:text-blue-600 transition px-2"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Orders
                        </Link>
                        <Link
                            to="/profile"
                            className="block text-gray-600 hover:text-blue-600 transition px-2"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Profile
                        </Link>
                        <Link
                            to="/cart"
                            className="block text-gray-600 hover:text-blue-600 transition px-2"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Cart {totalItems > 0 && `(${totalItems})`}
                        </Link>
                        <button
                            onClick={() => {
                                handleLogout();
                                setIsMenuOpen(false);
                            }}
                            className="block text-red-600 hover:text-red-800 transition px-2 w-full text-left"
                        >
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;