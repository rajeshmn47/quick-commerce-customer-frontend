import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ForgotPassword() {
    const { forgotPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            setError('Please enter your email');
            return;
        }

        setLoading(true);
        setError('');

        const result = await forgotPassword(email);
        if (result.success) {
            setSubmitted(true);
        } else {
            setError(result.error);
        }
        setLoading(false);
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
                    <div className="text-6xl mb-4">📧</div>
                    <h2 className="text-2xl font-bold text-gray-800">Check Your Email</h2>
                    <p className="text-gray-600 mt-2">
                        We've sent a password reset link to <br />
                        <span className="font-semibold text-blue-600">{email}</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-4">
                        Didn't receive the email? Check your spam folder or{' '}
                        <button
                            onClick={() => setSubmitted(false)}
                            className="text-blue-600 hover:underline"
                        >
                            try again
                        </button>
                    </p>
                    <Link
                        to="/login"
                        className="mt-6 inline-block bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition"
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
                <div className="text-center mb-8">
                    <div className="text-4xl mb-2">🔑</div>
                    <h1 className="text-2xl font-bold text-gray-800">Reset Password</h1>
                    <p className="text-gray-500 mt-1">
                        Enter your email and we'll send you a reset link
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="john@example.com"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 disabled:bg-blue-300 transition font-medium"
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link to="/login" className="text-sm text-gray-600 hover:text-blue-600 hover:underline">
                        ← Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;