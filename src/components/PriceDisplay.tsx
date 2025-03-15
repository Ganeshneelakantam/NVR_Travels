import React from 'react';
import { IndianRupee } from 'lucide-react';

interface PriceDisplayProps {
  distance?: number;
  carType: 'Hatchback' | 'Sedan' | 'SUV';
  duration?: number;
}

const RATES = {
  Hatchback: 9,
  Sedan: 10,
  SUV: 13.5
};

const PriceDisplay = ({ distance = 0, carType, duration = 0 }: PriceDisplayProps) => {
  const basePrice = distance * RATES[carType];
  const totalPrice = basePrice + (duration > 8 ? (duration - 8) * 100 : 0);

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 max-w-md mx-auto">
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Fare Estimate</h3>
      <div className="space-y-3 sm:space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm sm:text-base text-gray-600">Distance</span>
          <span className="font-medium">{distance} KM</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm sm:text-base text-gray-600">Rate per KM</span>
          <span className="font-medium flex items-center">
            <IndianRupee className="w-4 h-4 mr-1" />
            {RATES[carType]}
          </span>
        </div>
        {duration > 8 && (
          <div className="flex justify-between items-center">
            <span className="text-sm sm:text-base text-gray-600">Extra Hours Charge</span>
            <span className="font-medium flex items-center">
              <IndianRupee className="w-4 h-4 mr-1" />
              {(duration - 8) * 100}
            </span>
          </div>
        )}
        <div className="pt-3 sm:pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="text-base sm:text-lg font-semibold text-gray-900">Total Fare</span>
            <span className="text-lg sm:text-xl font-bold text-blue-600 flex items-center">
              <IndianRupee className="w-5 h-5 mr-1" />
              {totalPrice}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceDisplay;