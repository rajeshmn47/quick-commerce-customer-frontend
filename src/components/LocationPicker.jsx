import { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon (required for markers)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// 🗺️ Component that handles map clicks and marker drag
function LocationMarker({ position, setPosition }) {
    const map = useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            setPosition({ lat, lng });
        },
    });

    const markerRef = useRef(null);

    useEffect(() => {
        if (markerRef.current) {
            markerRef.current.openPopup();
        }
    }, [position]);

    return position ? (
        <Marker
            draggable
            position={[position.lat, position.lng]}
            ref={markerRef}
            eventHandlers={{
                dragend(e) {
                    const { lat, lng } = e.target.getLatLng();
                    setPosition({ lat, lng });
                },
            }}
        >
            <Popup>📍 Selected location</Popup>
        </Marker>
    ) : null;
}

// 🔍 Simple search using Nominatim (free, no API key)
const searchNominatim = async (query) => {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return data.map(item => ({
        label: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
    }));
};

function LocationPicker({ onLocationSelect, initialPosition = null }) {
    const [position, setPosition] = useState(initialPosition || null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 1️⃣ Auto‑get GPS on mount if no initial position
    useEffect(() => {
        if (!initialPosition && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    setPosition({ lat: latitude, lng: longitude });
                },
                () => {}, // silent fail – user can click the 📍 button
                { enableHighAccuracy: true, timeout: 5000 }
            );
        }
    }, [initialPosition]);

    // 2️⃣ Get current location (📍 button)
    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser.');
            return;
        }
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                setPosition({ lat: latitude, lng: longitude });
                setLoading(false);
                setError(null);
            },
            (err) => {
                setError('Unable to get location. Please try again.');
                setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    // 3️⃣ Handle search
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setLoading(true);
        try {
            const results = await searchNominatim(searchQuery);
            setSearchResults(results);
            setError(null);
        } catch (err) {
            setError('Search failed. Please try again.');
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };

    const selectSearchResult = (result) => {
        setPosition({ lat: result.lat, lng: result.lng });
        setSearchResults([]);
        setSearchQuery('');
    };

    // 4️⃣ Confirm location (only this calls the parent)
    const handleConfirm = () => {
        if (!position) {
            alert('Please select a location on the map.');
            return;
        }
        if (onLocationSelect) {
            onLocationSelect(position);
        }
    };

    // 5️⃣ Render
    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Search bar */}
            <div className="p-4 border-b">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Search for an address or place..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        🔍
                    </button>
                </form>
                {searchResults.length > 0 && (
                    <ul className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg bg-white shadow">
                        {searchResults.map((result, idx) => (
                            <li
                                key={idx}
                                onClick={() => selectSearchResult(result)}
                                className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b last:border-none text-sm"
                            >
                                {result.label}
                            </li>
                        ))}
                    </ul>
                )}
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>

            {/* Map */}
            <div className="h-80 md:h-96 relative">
                <MapContainer
                    center={position ? [position.lat, position.lng] : [12.9716, 77.5946]}
                    zoom={position ? 15 : 12}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='© OpenStreetMap contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker position={position} setPosition={setPosition} />
                </MapContainer>

                {/* Floating controls */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <button
                        onClick={getCurrentLocation}
                        className="bg-white shadow-lg rounded-full p-3 hover:bg-gray-100 transition"
                        title="Use my current location"
                    >
                        📍
                    </button>
                </div>
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow text-sm text-gray-700">
                    {position ? (
                        <>
                            <span className="font-medium">📍 Selected:</span>{' '}
                            {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
                        </>
                    ) : (
                        'Click on the map or search for an address'
                    )}
                </div>
            </div>

            {/* Confirm button */}
            <div className="p-4 border-t flex justify-end">
                <button
                    onClick={handleConfirm}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition font-medium"
                >
                    ✅ Confirm Location
                </button>
            </div>
        </div>
    );
}

export default LocationPicker;