import { useState } from 'react';
import { Phone, MessageSquare, Mail } from 'lucide-react';

// Define CarType to match the keys of RATES
type CarType = 'Hatchback' | 'Sedan' | 'SUV';

interface BookingSummaryProps {
  bookingDetails: {
    tripType: string;
    pickup: string;
    destination?: string;
    date: string;
    time: string;
    carType: CarType;
    totalFare: number;
    isLocalTrip?: boolean;
    distance?: number;
  };
}

const RATES = {
  Hatchback: 9,
  Sedan: 10,
  SUV: 13.5,
};

const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.length === 10 && /^[6-9]/.test(cleaned)) {
    return `+91${cleaned}`;
  } else if (!cleaned.startsWith('+')) {
    return `+${cleaned}`;
  }
  return cleaned;
};

const truncate = (str: string, maxLength: number): string => {
  return str.length > maxLength ? str.substring(0, maxLength - 3) + '...' : str;
};

const BookingSummary = ({ bookingDetails }: BookingSummaryProps) => {
  console.log('Rendering BookingSummary with:', bookingDetails);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBookRide = () => {
    setShowModal(true);
    setError(null);
  };

  const sendSMS = async (to: string, body: string): Promise<boolean> => {
    try {
      const response = await fetch('https://nvr-travels.onrender.com/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, body }),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to send SMS');
      console.log(`SMS sent to ${to}`);
      return true;
    } catch (err) {
      console.error('Error sending SMS:', err);
      setError('Failed to send SMS. Please try again or contact support.');
      return false;
    }
  };

  const handleConfirmBooking = async () => {
    if (!name || !phone) {
      setError('Please enter both name and phone number.');
      return;
    }

    setIsLoading(true);
    setShowModal(false);
    setError(null);

    const formattedPhone = formatPhoneNumber(phone);
    console.log('Formatted customer phone:', formattedPhone);

    const nvrMessage = `Booking: ${name} (${formattedPhone})-${bookingDetails.tripType}, Pickup: ${truncate(bookingDetails.pickup, 15)}, ${bookingDetails.date} ${bookingDetails.time}, Car: ${bookingDetails.carType}, Fare: ₹${bookingDetails.totalFare}${bookingDetails.destination ? `, Dest: ${truncate(bookingDetails.destination, 15)}` : ''}`;

    console.log('Attempting to send SMS to owner:', '+919381283038');
    console.log('SMS body:', nvrMessage);
    const ownerSuccess = await sendSMS('+919381283038', nvrMessage);
    console.log('Owner SMS success status:', ownerSuccess);

    if (ownerSuccess) {
      console.log('SMS sent successfully to owner, displaying success message');
      setShowSuccess(true);
    } else {
      console.log('SMS to owner failed, showing error');
      setError('Failed to send SMS notification to the owner.');
    }

    setIsLoading(false);
  };

  const handleNewBooking = () => {
    setShowSuccess(false);
    setName('');
    setPhone('');
    setError(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 max-w-2xl mx-auto">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Booking Summary</h2>
      <div className="space-y-4 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="text-xs sm:text-sm text-gray-600">Trip Type</span>
            <p className="text-sm sm:text-base font-medium text-gray-900">{bookingDetails.tripType}</p>
          </div>
          <div>
            <span className="text-xs sm:text-sm text-gray-600">Car Type</span>
            <p className="text-sm sm:text-base font-medium text-gray-900">{bookingDetails.carType}</p>
          </div>
        </div>
        <div>
          <span className="text-xs sm:text-sm text-gray-600">Pickup Location</span>
          <p className="text-sm sm:text-base font-medium text-gray-900">{bookingDetails.pickup}</p>
        </div>
        {bookingDetails.destination && (
          <div>
            <span className="text-xs sm:text-sm text-gray-600">Destination</span>
            <p className="text-sm sm:text-base font-medium text-gray-900">{bookingDetails.destination}</p>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="text-xs sm:text-sm text-gray-600">Date</span>
            <p className="text-sm sm:text-base font-medium text-gray-900">{bookingDetails.date}</p>
          </div>
          <div>
            <span className="text-xs sm:text-sm text-gray-600">Time</span>
            <p className="text-sm sm:text-base font-medium text-gray-900">{bookingDetails.time}</p>
          </div>
        </div>
        <div className="pt-4 border-t">
          <span className="text-xs sm:text-sm text-gray-600">Total Fare</span>
          <p className="text-xl sm:text-2xl font-bold text-blue-600">
            ₹{bookingDetails.totalFare}{' '}
            {bookingDetails.isLocalTrip && (
              <span className="text-sm font-normal text-gray-600">
                (Approximate, based on actual distance traveled at ₹{RATES[bookingDetails.carType]}/km)
              </span>
            )}
            {bookingDetails.tripType === 'outstation' && bookingDetails.distance && bookingDetails.distance > 300 && (
              <span className="text-sm font-normal text-gray-600">
                (Additional charges may apply if distance exceeds 300 km)
              </span>
            )}
          </p>
        </div>
      </div>

      <button
        onClick={handleBookRide}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-3 px-6 rounded-full hover:from-blue-700 hover:to-blue-900 transition text-base sm:text-lg font-semibold mb-6"
      >
        Book Ride Now
      </button>
      <div className="space-y-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Contact Us</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a
            href="tel:9381283038"
            className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm sm:text-base"
          >
            <Phone className="w-5 h-5" />
            <span>Call Us</span>
          </a>
          <a
            href="https://wa.me/919381283038"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm sm:text-base"
          >
            <MessageSquare className="w-5 h-5" />
            <span>WhatsApp</span>
          </a>
          <a
            href="mailto:ganeshneelakantam123@gmail.com"
            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm sm:text-base"
          >
            <Mail className="w-5 h-5" />
            <span>Email</span>
          </a>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Enter Your Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBooking}
                disabled={!name || !phone || isLoading}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg hover:from-blue-700 hover:to-blue-900 transition disabled:opacity-50"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-green-600 mb-4 text-center">
              Booking Confirmed!
            </h2>
            <p className="text-gray-700 text-center">
              Thank you for booking a ride! Have a safe and happy journey. Our team will contact you soon about your ride.
            </p>
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleNewBooking}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg hover:from-blue-700 hover:to-blue-900 transition"
              >
                Book Another Ride
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Modal */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg font-semibold text-gray-900">Processing your booking...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingSummary;
