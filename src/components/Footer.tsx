import React from "react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-4 border-t border-gray-700">
      <div className="container mx-auto text-center">
        <p className="text-sm mb-2">
          © 2025 Diabetes Predictor. Developed by{" "}
          <Link to="/about" className="text-indigo-400 hover:underline">
            TAN Team
          </Link>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
