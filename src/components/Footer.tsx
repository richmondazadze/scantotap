
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-scan-dark text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex-shrink-0">
              <h2 className="text-2xl font-bold text-gradient">ScanToTap</h2>
            </Link>
            <p className="mt-4 text-sm text-gray-300 max-w-md">
              Your digital identity, one tap away. ScanToTap helps professionals connect instantly with a smart business card that's as unique as you are.
            </p>
            <div className="mt-6 space-x-4">
              <a href="#" className="text-scan-blue-light hover:text-scan-blue">
                Twitter
              </a>
              <a href="#" className="text-scan-blue-light hover:text-scan-blue">
                LinkedIn
              </a>
              <a href="#" className="text-scan-blue-light hover:text-scan-blue">
                Instagram
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/dashboard" className="text-gray-300 hover:text-scan-blue">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-300 hover:text-scan-blue">
                  Pricing
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-scan-blue">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-scan-blue">
                  Security
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-300 hover:text-scan-blue">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-scan-blue">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-scan-blue">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-scan-blue">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} ScanToTap. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
