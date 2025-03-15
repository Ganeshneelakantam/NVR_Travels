import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, MapPin, Plane } from 'lucide-react';
import PriceDisplay from './PriceDisplay';
import BookingSummary from './BookingSummary';

type FormType = 'local' | 'outstation' | 'airport';
type CarType = 'Hatchback' | 'Sedan' | 'SUV';

interface FormData {
  pickup: string;
  destination?: string;
  date: string;
  time: string;
  carType: CarType;
  pickupCoords?: [number, number];
  destinationCoords?: [number, number];
  distance?: number;
  airportTerminal?: string;
  totalFare?: number;
  returnDate?: string;
}

interface Location {
  formatted: string;
  lat: number;
  lon: number;
}

interface RouteInfo {
  distance: number;
  duration: number;
}

// Define Geoapify API response types
interface GeoapifyProperties {
  formatted: string;
  lat: number;
  lon: number;
}

interface GeoapifyFeature {
  properties: GeoapifyProperties;
}

interface GeoapifyResponse {
  features: GeoapifyFeature[];
}

const API_KEY = '84fe98a666e94ab8b58e48519abbae34';

const RATES = {
  Hatchback: 9,
  Sedan: 12,
  SUV: 19
};

const DRIVER_STAY_CHARGE = 300; // per night

const BookingForm = () => {
  const [formType, setFormType] = useState<FormType>('local');
  const [isRoundTrip, setIsRoundTrip] = useState(false);
  const [airportDirection, setAirportDirection] = useState<'pickup' | 'drop'>('pickup');
  const [selectedCar, setSelectedCar] = useState<CarType>('Sedan');
  const [showSummary, setShowSummary] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    pickup: '',
    date: '',
    time: '',
    carType: 'Sedan'
  });

  const [pickupSuggestions, setPickupSuggestions] = useState<Location[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<Location[]>([]);
  const [airportSuggestions, setAirportSuggestions] = useState<Location[]>([]);
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const [showAirportSuggestions, setShowAirportSuggestions] = useState(false);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const pickupRef = useRef<HTMLDivElement>(null);
  const destinationRef = useRef<HTMLDivElement>(null);
  const airportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickupRef.current && !pickupRef.current.contains(event.target as Node)) {
        setShowPickupSuggestions(false);
      }
      if (destinationRef.current && !destinationRef.current.contains(event.target as Node)) {
        setShowDestinationSuggestions(false);
      }
      if (airportRef.current && !airportRef.current.contains(event.target as Node)) {
        setShowAirportSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (text: string, type: 'pickup' | 'destination' | 'airport') => {
    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(text)}&apiKey=${API_KEY}`
      );
      const data: GeoapifyResponse = await response.json();
      const locations = data.features.map((feature: GeoapifyFeature) => ({
        formatted: feature.properties.formatted,
        lat: feature.properties.lat,
        lon: feature.properties.lon
      }));

      switch (type) {
        case 'pickup':
          setPickupSuggestions(locations);
          setShowPickupSuggestions(true);
          break;
        case 'destination':
          setDestinationSuggestions(locations);
          setShowDestinationSuggestions(true);
          break;
        case 'airport':
          setAirportSuggestions(locations);
          setShowAirportSuggestions(true);
          break;
      }
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
    }
  };

  const calculateRoute = async (pickup: [number, number], destination: [number, number]) => {
    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/routing?waypoints=${pickup[0]},${pickup[1]}|${destination[0]},${destination[1]}&mode=drive&apiKey=${API_KEY}`
      );
      const data = await response.json();
      
      if (data.features && data.features[0]) {
        const route = data.features[0].properties;
        return {
          distance: route.distance / 1000,
          duration: route.time / 60
        };
      }
      return null;
    } catch (error) {
      console.error('Error calculating route:', error);
      return null;
    }
  };

  const getCurrentLocation = (): Promise<Location> => {
    return new Promise((resolve, reject) => {
      setIsLoadingLocation(true);
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const response = await fetch(
                `https://api.geoapify.com/v1/geocode/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&apiKey=${API_KEY}`
              );
              const data = await response.json();
              const location = {
                formatted: data.features[0].properties.formatted,
                lat: position.coords.latitude,
                lon: position.coords.longitude
              };
              setIsLoadingLocation(false);
              resolve(location);
            } catch (error) {
              setIsLoadingLocation(false);
              reject(error);
            }
          },
          (error) => {
            setIsLoadingLocation(false);
            reject(error);
          }
        );
      } else {
        setIsLoadingLocation(false);
        reject(new Error('Geolocation is not supported by this browser'));
      }
    });
  };

  const handleInputFocus = async (type: 'pickup' | 'destination' | 'airport') => {
    switch (type) {
      case 'pickup':
        setShowPickupSuggestions(true);
        if (!formData.pickup) setPickupSuggestions([]);
        break;
      case 'destination':
        setShowDestinationSuggestions(true);
        if (!formData.destination) setDestinationSuggestions([]);
        break;
      case 'airport':
        setShowAirportSuggestions(true);
        if (!formData.airportTerminal) {
          await fetchSuggestions('', 'airport');
        }
        break;
    }
  };

  const handleGetCurrentLocation = async (type: 'pickup' | 'destination') => {
    try {
      const location = await getCurrentLocation();
      handleLocationSelect(location, type);
    } catch (error) {
      console.error('Error getting current location:', error);
    }
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'pickup' || name === 'destination' || name === 'airportTerminal') {
      await fetchSuggestions(
        value || '',
        name === 'airportTerminal' ? 'airport' : name as 'pickup' | 'destination'
      );
    }
  };

  const handleLocationSelect = async (location: Location, type: 'pickup' | 'destination' | 'airport') => {
    const newFormData = {
      ...formData,
      [type === 'airport' ? (airportDirection === 'pickup' ? 'pickup' : 'destination') : type]: location.formatted,
      [`${type === 'airport' ? (airportDirection === 'pickup' ? 'pickup' : 'destination') : type}Coords`]: [
        location.lat,
        location.lon
      ] as [number, number]
    };
    setFormData(newFormData);

    switch (type) {
      case 'pickup':
        setShowPickupSuggestions(false);
        break;
      case 'destination':
        setShowDestinationSuggestions(false);
        break;
      case 'airport':
        setShowAirportSuggestions(false);
        break;
    }

    if (newFormData.pickupCoords && newFormData.destinationCoords) {
      setIsCalculating(true);
      const routeInfo = await calculateRoute(newFormData.pickupCoords, newFormData.destinationCoords);
      if (routeInfo) {
        setRouteInfo(routeInfo);
        setFormData(prev => ({ ...prev, distance: routeInfo.distance }));
      }
      setIsCalculating(false);
    }
  };

  const calculateFare = (): number => {
    if (formType === 'local') {
      return 0; // Set fare to 0 for local trips, actual fare will be based on distance traveled
    }

    if (!formData.distance) return 0;

    const baseRate = RATES[selectedCar];
    let totalFare = formData.distance * baseRate;

    if (formType === 'outstation' && isRoundTrip) {
      totalFare *= 2;
      const tripDays = Math.ceil(formData.distance / 300);
      if (tripDays > 1) {
        totalFare += DRIVER_STAY_CHARGE * (tripDays - 1);
      }
    }

    return Math.round(totalFare);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fare = calculateFare();
    setFormData(prev => ({ ...prev, totalFare: fare }));
    setShowSummary(true);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    return hours > 0 ? `${hours}h ${remainingMinutes}m` : `${remainingMinutes}m`;
  };

  const renderLocationInput = (
    type: 'pickup' | 'destination',
    label: string,
    ref: React.RefObject<HTMLDivElement>
  ) => (
    <div ref={ref} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="relative">
        <MapPin className="absolute left-3 top-3 text-gray-400" />
        <input
          type="text"
          name={type}
          value={formData[type] || ''}
          onChange={handleInputChange}
          onFocus={() => handleInputFocus(type)}
          className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={`Enter ${label.toLowerCase()}`}
          required
        />
      </div>
      
      {((type === 'pickup' && showPickupSuggestions) || 
        (type === 'destination' && showDestinationSuggestions)) && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-auto">
          <button
            type="button"
            onClick={() => handleGetCurrentLocation(type)}
            className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-gray-100 cursor-pointer flex items-center"
            disabled={isLoadingLocation}
          >
            <MapPin className="w-4 h-4 mr-2" />
            {isLoadingLocation ? 'Getting location...' : 'Use current location'}
          </button>
          {(type === 'pickup' ? pickupSuggestions : destinationSuggestions).map((location, index) => (
            <button
              key={index}
              type="button"
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleLocationSelect(location, type)}
            >
              {location.formatted}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const renderAirportTerminalInput = () => (
    <div ref={airportRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">Airport Terminal</label>
      <div className="relative">
        <Plane className="absolute left-3 top-3 text-gray-400" />
        <input
          type="text"
          name="airportTerminal"
          value={formData.airportTerminal || ''}
          onChange={handleInputChange}
          onFocus={() => handleInputFocus('airport')}
          className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter airport or place..."
          required
        />
      </div>
      
      {showAirportSuggestions && airportSuggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-auto">
          {airportSuggestions.map((location, index) => (
            <button
              key={index}
              type="button"
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleLocationSelect(location, 'airport')}
            >
              {location.formatted}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-8">Book Your Journey</h2>
        
        <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4 mb-8">
          {[
            { type: 'local', label: 'Local Trip', icon: MapPin },
            { type: 'outstation', label: 'Outstation', icon: Calendar },
            { type: 'airport', label: 'Airport', icon: Plane }
          ].map(({ type, label, icon: Icon }) => (
            <button
              key={type}
              onClick={() => setFormType(type as FormType)}
              className={`flex items-center justify-center px-4 sm:px-6 py-3 rounded-lg transition ${
                formType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5 mr-2" />
              <span className="text-sm sm:text-base">{label}</span>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Select Car Type</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(['Hatchback', 'Sedan', 'SUV'] as CarType[]).map((car) => (
              <button
                key={car}
                type="button"
                onClick={() => setSelectedCar(car)}
                className={`p-4 rounded-lg border-2 transition ${
                  selectedCar === car
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <h4 className="font-medium">{car}</h4>
                <p className="text-sm text-gray-600">₹{RATES[car]}/KM</p>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
          {formType === 'local' && (
            <div className="space-y-6">
              {renderLocationInput('pickup', 'Pickup Location', pickupRef)}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {formType === 'outstation' && (
            <div className="space-y-6">
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setIsRoundTrip(false)}
                  className={`px-4 py-2 rounded-lg border ${!isRoundTrip ? 'bg-blue-600 text-white' : 'border-gray-300'}`}
                >
                  One-Way
                </button>
                <button
                  type="button"
                  onClick={() => setIsRoundTrip(true)}
                  className={`px-4 py-2 rounded-lg border ${isRoundTrip ? 'bg-blue-600 text-white' : 'border-gray-300'}`}
                >
                  Round Trip
                </button>
              </div>

              {renderLocationInput('pickup', 'Pickup Location', pickupRef)}
              {renderLocationInput('destination', 'Destination', destinationRef)}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Time</label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
              </div>

              {isRoundTrip && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Return Date</label>
                  <input
                    type="date"
                    name="returnDate"
                    value={formData.returnDate || ''}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
              )}

              {routeInfo && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Estimated Distance: {routeInfo.distance.toFixed(1)} KM
                    <br />
                    Estimated Duration: {formatDuration(routeInfo.duration)}
                  </p>
                </div>
              )}
            </div>
          )}

          {formType === 'airport' && (
            <div className="space-y-6">
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setAirportDirection('pickup')}
                  className={`px-4 py-2 rounded-lg border ${airportDirection === 'pickup' ? 'bg-blue-600 text-white' : 'border-gray-300'}`}
                >
                  Pick From Airport
                </button>
                <button
                  type="button"
                  onClick={() => setAirportDirection('drop')}
                  className={`px-4 py-2 rounded-lg border ${airportDirection === 'drop' ? 'bg-blue-600 text-white' : 'border-gray-300'}`}
                >
                  Drop at Airport
                </button>
              </div>

              {airportDirection === 'pickup' && (
                <>
                  {renderAirportTerminalInput()}
                  {renderLocationInput('destination', 'Drop Location', destinationRef)}
                </>
              )}

              {airportDirection === 'drop' && (
                <>
                  {renderLocationInput('pickup', 'Pickup Location', pickupRef)}
                  {renderAirportTerminalInput()}
                </>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Time</label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
              </div>

              {routeInfo && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Estimated Distance: {routeInfo.distance.toFixed(1)} KM
                    <br />
                    Estimated Duration: {formatDuration(routeInfo.duration)}
                  </p>
                </div>
              )}
            </div>
          )}

          <button 
            type="submit"
            disabled={isCalculating}
            className={`w-full mt-8 bg-blue-600 text-white py-3 px-6 rounded-lg transition
              ${isCalculating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}
              text-base sm:text-lg font-semibold`}
          >
            {isCalculating ? 'Calculating Route...' : 'Calculate Fare'}
          </button>
        </form>

        {!showSummary && formData.distance && formType !== 'local' && (
          <div className="mt-8">
            <PriceDisplay
              distance={formData.distance}
              carType={selectedCar}
              duration={routeInfo?.duration || 0}
            />
          </div>
        )}

        {showSummary && (
          <div className="mt-8">
            <BookingSummary
              bookingDetails={{
                tripType: formType,
                pickup: formData.pickup,
                destination: formData.destination,
                date: formData.date,
                time: formData.time,
                carType: selectedCar,
                totalFare: formData.totalFare || 0,
                isLocalTrip: formType === 'local',
                distance: formData.distance
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingForm;