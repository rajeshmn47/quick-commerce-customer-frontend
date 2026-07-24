import { useAuth } from '../context/AuthContext';

function Profile() {
    const { user, logout } = useAuth();

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                        {user?.name?.[0] || '👤'}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">{user?.name}</h2>
                        <p className="text-gray-500">{user?.email}</p>
                        <p className="text-gray-500">{user?.phone}</p>
                    </div>
                </div>

                <div className="border-t pt-4">
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