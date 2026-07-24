import { useState } from 'react';
import { useLocation } from '../context/LocationContext';
import LocationSearch from './LocationSearch';

function LocationPopup() {
    const { location, pincode, loading, isLocationDenied, requestLocation, setManualPincode } = useLocation();
    const [mode, setMode] = useState('detect'); // 'detect' | 'search'
    const [inputPincode, setInputPincode] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // If location is already set, don't render the popup
    if (location || pincode) return null;

    const handleRetryGps = async () => {
        try {
            await requestLocation();
            // Reload to trigger re-check
            window.location.reload();
        } catch (err) {
            setError('Unable to get location. Please try searching.');
        }
    };

    const handlePincodeSubmit = async (e) => {
        e.preventDefault();
        if (inputPincode.length !== 6 || !/^\d{6}$/.test(inputPincode)) {
            setError('Please enter a valid 6-digit pincode');
            return;
        }
        setSubmitting(true);
        try {
            await setManualPincode(inputPincode);
        } catch (err) {
            setError('Failed to verify pincode. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-white z-[9999] flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="text-center">
                    <div className="text-6xl mb-6">📍</div>
                    <h1 className="text-2xl font-bold text-gray-800">Set Your Location</h1>
                    <p className="text-gray-500 mt-2">
                        {loading && mode === 'detect'
                            ? 'Detecting your location...'
                            : 'We need your location to show stores and products near you.'}
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 mt-6">
                    <button
                        onClick={() => setMode('detect')}
                        className={`flex-1 py-3 text-center font-medium transition ${
                            mode === 'detect'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        📍 Detect
                    </button>
                    <button
                        onClick={() => setMode('search')}
                        className={`flex-1 py-3 text-center font-medium transition ${
                            mode === 'search'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        🔍 Search
                    </button>
                </div>

                {/* Content based on mode */}
                <div className="mt-6">
                    {mode === 'detect' && (
                        <>
                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                                </div>
                            ) : isLocationDenied ? (
                                // Fallback: pincode input (but also allow switch to search)
                                <div>
                                    <p className="text-sm text-gray-500 mb-4 text-center">
                                        Location access denied. Please enter your pincode or switch to Search.
                                    </p>
                                    <form onSubmit={handlePincodeSubmit} className="space-y-3">
                                        <input
                                            type="text"
                                            maxLength="6"
                                            placeholder="Enter 6-digit pincode"
                                            value={inputPincode}
                                            onChange={(e) => setInputPincode(e.target.value.replace(/\D/g, ''))}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-center text-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            autoFocus
                                        />
                                        {error && <p className="text-red-500 text-sm">{error}</p>}
                                        <button
                                            type="submit"
                                            disabled={submitting || inputPincode.length !== 6}
                                            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition font-medium"
                                        >
                                            {submitting ? 'Verifying...' : 'Continue'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleRetryGps}
                                            className="w-full text-sm text-blue-600 hover:underline"
                                        >
                                            🔄 Try GPS again
                                        </button>
                                    </form>
                                </div>
                            ) : (
                                // GPS is still trying
                                <p className="text-center text-gray-500">Waiting for location access...</p>
                            )}
                        </>
                    )}

                    {mode === 'search' && (
                        <div>
                            <p className="text-sm text-gray-500 mb-4 text-center">
                                Search for your city, area, or landmark.
                            </p>
                            <LocationSearch />
                        </div>
                    )}
                </div>

                {/* No close/skip button */}
            </div>
        </div>
    );
}

export default LocationPopup;