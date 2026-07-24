import { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
    // ✅ 1. All state declarations
    const [location, setLocation] = useState(null);
    const [pincode, setPincode] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLocationDenied, setIsLocationDenied] = useState(false);

    // ✅ 2. Request GPS location
    const requestLocation = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    resolve({ lat: latitude, lng: longitude });
                },
                (err) => reject(err),
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
            );
        });
    };

    // ✅ 3. On mount – check localStorage or request GPS
    useEffect(() => {
        const stored = localStorage.getItem('userLocation');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setLocation(parsed);
                setLoading(false);
                return;
            } catch (e) {
                // fall through
            }
        }

        const storedPincode = localStorage.getItem('userPincode');
        if (storedPincode) {
            setPincode(storedPincode);
            setLoading(false);
            return;
        }

        const getLocation = async () => {
            try {
                const coords = await requestLocation();
                setLocation(coords);
                localStorage.setItem('userLocation', JSON.stringify(coords));
            } catch (err) {
                console.warn('Location error:', err.message);
                if (err.code === 1) {
                    setIsLocationDenied(true);
                } else {
                    setError('Unable to get location. Please enter pincode.');
                    setIsLocationDenied(true);
                }
            } finally {
                setLoading(false);
            }
        };
        getLocation();
    }, []);

    // ✅ 4. Save location to localStorage when it changes
    useEffect(() => {
        if (location) {
            localStorage.setItem('userLocation', JSON.stringify(location));
        }
    }, [location]);

    // ✅ 5. Set pincode manually (fallback)
    const setManualPincode = async (pincodeValue) => {
        setPincode(pincodeValue);
        setLocation(null);
        setIsLocationDenied(false);
        setError(null);
        localStorage.setItem('userPincode', pincodeValue);
    };

    // ✅ 6. Set location from search (geocoded result)
    const setLocationFromSearch = (lat, lng, displayName, pincodeValue = null) => {
        const loc = { lat, lng, displayName };
        setLocation(loc);
        if (pincodeValue) setPincode(pincodeValue);
        setIsLocationDenied(false);
        setError(null);
        localStorage.setItem('userLocation', JSON.stringify(loc));
        if (pincodeValue) localStorage.setItem('userPincode', pincodeValue);
    };

    // 🆕 7. Set location coordinates directly (from map picker)
    const setLocationCoords = (lat, lng) => {
        const loc = { lat, lng };
        setLocation(loc);
        setPincode(null);
        setIsLocationDenied(false);
        setError(null);
        localStorage.setItem('userLocation', JSON.stringify(loc));
        localStorage.removeItem('userPincode'); // clear pincode if it was set
    };

    // ✅ 8. Build the value object
    const value = {
        location,
        pincode,
        loading,
        error,
        isLocationDenied,
        setManualPincode,
        requestLocation,
        setLocationFromSearch,
        setLocationCoords,   // 👈 Now available
        hasLocation: !!location || !!pincode,
    };

    return (
        <LocationContext.Provider value={value}>
            {children}
        </LocationContext.Provider>
    );
};

// ✅ 9. Custom hook
export const useLocation = () => {
    const context = useContext(LocationContext);
    if (!context) {
        throw new Error('useLocation must be used within a LocationProvider');
    }
    return context;
};