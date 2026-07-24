import { useState, useEffect, useRef } from 'react';
import { useLocation } from '../context/LocationContext';

function LocationSearch() {
    const { setLocationFromSearch } = useLocation();
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState(null);
    const [error, setError] = useState('');
    const debounceRef = useRef(null);

    // Fetch suggestions from Nominatim
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (query.length < 3) {
            setSuggestions([]);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`;
                const res = await fetch(url);
                const data = await res.json();
                if (Array.isArray(data)) {
                    setSuggestions(data);
                } else {
                    setSuggestions([]);
                }
                setError('');
            } catch (err) {
                console.error('Geocoding error:', err);
                setError('Failed to search. Please try again.');
                setSuggestions([]);
            } finally {
                setLoading(false);
            }
        }, 500); // debounce 500ms
    }, [query]);

    const handleSelect = (place) => {
        const lat = parseFloat(place.lat);
        const lng = parseFloat(place.lon);
        const displayName = place.display_name;
        // Try to extract pincode from address details
        const pincode = place.address?.postcode || null;

        setLocationFromSearch(lat, lng, displayName, pincode);
        setSelected(place);
        setQuery(displayName);
        setSuggestions([]);
    };

    return (
        <div className="relative w-full">
            <input
                type="text"
                placeholder="Search for city, area, or landmark"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-center text-lg focus:ring-2 focus:ring-blue-500 outline-none"
                autoFocus={!selected}
            />
            {loading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                </div>
            )}

            {/* Suggestions dropdown */}
            {suggestions.length > 0 && (
                <ul className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-10">
                    {suggestions.map((place, idx) => (
                        <li
                            key={idx}
                            onClick={() => handleSelect(place)}
                            className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm text-gray-700 border-b last:border-0"
                        >
                            <div className="font-medium">{place.display_name.split(',')[0]}</div>
                            <div className="text-xs text-gray-400 truncate">{place.display_name}</div>
                        </li>
                    ))}
                </ul>
            )}

            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
    );
}

export default LocationSearch;