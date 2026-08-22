import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function Profile() {
    const { user, setUser, logout } = useAuth();

    // ─── EDIT MODE STATE ───
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // ─── FORM STATE ───
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
    });

    // ─── HANDLE CHANGE ───
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // ─── TOGGLE EDIT MODE ───
    const toggleEdit = () => {
        setIsEditing(!isEditing);
        setMessage({ type: '', text: '' });
        // Reset form to current user data if cancelling
        if (isEditing) {
            setFormData({
                name: user?.name || '',
                email: user?.email || '',
                phone: user?.phone || '',
            });
        }
    };

    // ─── SAVE PROFILE ───
    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const payload = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
            };

            const res = await api.put('/users/profile', payload);

            // ✅ Update user in context
            setUser(res.data.data);

            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setIsEditing(false);
        } catch (err) {
            setMessage({
                type: 'error',
                text: err.response?.data?.error || 'Failed to update profile',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-xl shadow p-6">
                {/* ─── HEADER ─── */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                            {user?.name?.[0] || '👤'}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{user?.name}</h2>
                            <p className="text-gray-500">{user?.email}</p>
                            <p className="text-gray-500">{user?.phone}</p>
                        </div>
                    </div>
                    <button
                        onClick={toggleEdit}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        {isEditing ? 'Cancel' : 'Edit Profile'}
                    </button>
                </div>

                {/* ─── MESSAGE ─── */}
                {message.text && (
                    <div className={`p-3 rounded-lg mb-4 ${
                        message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                        {message.text}
                    </div>
                )}

                {/* ─── EDIT FORM ─── */}
                {isEditing && (
                    <form onSubmit={handleSave} className="border-t pt-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition"
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button
                                type="button"
                                onClick={toggleEdit}
                                className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}

                {/* ─── LOGOUT ─── */}
                <div className="border-t pt-4 mt-4">
                    <button
                        onClick={logout}
                        className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Profile;