import { MapPin, Phone, Mail, Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div id="contact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-4">NVR Travels</h3>
            <p className="text-sm sm:text-base text-gray-400 mb-4">
              Your trusted partner for comfortable and reliable car rental services.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Facebook className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Instagram className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Twitter className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm sm:text-base">
              <li>
                <a href="#home" className="hover:text-white transition">Home</a>
              </li>
              <li>
                <a href="#cars" className="hover:text-white transition">Our Cars</a>
              </li>
              <li>
                <a href="/booking" className="hover:text-white transition">Book Now</a> {/* Updated to /booking */}
              </li>
              <li>
                <a href="#contact" className="hover:text-white transition">Contact</a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Contact Us</h3>
            <ul className="space-y-4 text-sm sm:text-base">
              <li className="flex items-center">
                <MapPin className="w-5 h-5 mr-3 text-blue-500 flex-shrink-0" />
                <span>Yanamalakuduru, Vijayawada, 520007</span>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 mr-3 text-blue-500 flex-shrink-0" />
                <a href="tel:9381283038" className="hover:text-white transition">+91 93812 83038</a>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 mr-3 text-blue-500 flex-shrink-0" />
                <a href="mailto:ganeshneelakantam123@gmail.com" className="hover:text-white transition break-all">
                  ganeshneelakantam123@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-8 text-center text-sm sm:text-base">
          <p>© {new Date().getFullYear()} NVR Travels. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;