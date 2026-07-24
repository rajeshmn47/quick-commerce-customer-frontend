import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { LocationProvider } from './context/LocationContext';   // 👈 1. Import Provider
import LocationPopup from './components/LocationPopup';         // 👈 2. Import Popup
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderTracking from './pages/OrderTracking';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';
import Orders from './pages/Orders';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

// Customer App
function AppContent() {
    return (
        <BrowserRouter>
            {/* 👇 3. LocationPopup is rendered HERE – it will conditionally block the UI */}
            <LocationPopup />
            
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />

                    {/* Protected routes */}
                    <Route path="/" element={
                        <ProtectedRoute>
                            <Home />
                        </ProtectedRoute>
                    } />
                    <Route path="/product/:id" element={
                        <ProtectedRoute>
                            <ProductDetail />
                        </ProtectedRoute>
                    } />
                    <Route path="/cart" element={
                        <ProtectedRoute>
                            <Cart />
                        </ProtectedRoute>
                    } />
                    <Route path="/checkout" element={
                        <ProtectedRoute>
                            <Checkout />
                        </ProtectedRoute>
                    } />
                    <Route path="/orders" element={
                        <ProtectedRoute>
                            <Orders />
                        </ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    } />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

function App() {
    return (
        <AuthProvider>
            <CartProvider>
                {/* 👇 4. Wrap everything inside LocationProvider */}
                <LocationProvider>
                    <AppContent />
                </LocationProvider>
            </CartProvider>
        </AuthProvider>
    );
}

export default App;