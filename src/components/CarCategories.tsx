import { Users } from 'lucide-react';

const cars = [
  {
    type: 'Hatchback',
    price: '₹9/KM',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80',
    features: ['4 Seater', 'AC', 'Luggage: 2 Bags']
  },
  {
    type: 'Sedan',
    price: '₹10/KM',
    image: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&q=80',
    features: ['5 Seater', 'AC', 'Luggage: 3 Bags']
  },
  {
    type: 'SUV',
    price: '₹13.5/KM',
    image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&q=80',
    features: ['7 Seater', 'AC', 'Luggage: 4 Bags']
  }
];

const CarCategories = () => {
  return (
    <section id="cars" className="py-16 sm:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-8 sm:mb-12">Choose Your Perfect Car</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {cars.map((car) => (
            <div 
              key={car.type}
              className="bg-white rounded-xl overflow-hidden shadow-lg transition-transform hover:scale-105"
            >
              <div className="h-48 sm:h-56 overflow-hidden">
                <img 
                  src={car.image} 
                  alt={car.type}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{car.type}</h3>
                <p className="text-xl sm:text-2xl font-bold text-blue-600 mb-4">{car.price}</p>
                <ul className="space-y-2">
                  {car.features.map((feature) => (
                    <li key={feature} className="flex items-center text-gray-600">
                      <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="text-sm sm:text-base">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CarCategories;