"use client";

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogOut, X } from "lucide-react";
import {
  FaSun,
  FaMoon,
  FaBars,
  FaHome,
  FaInfoCircle,
  FaUser,
  FaHistory,
  FaSignInAlt,
  FaUserPlus,
  FaChartBar,
  FaEnvelope,
  FaBook,
} from "react-icons/fa";
import { useSpring, animated } from "react-spring";
import axios from "axios";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // On mount, read theme from localStorage and update document class
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    } else {
      document.documentElement.classList.remove("dark");
      setDarkMode(false);
    }
  }, []);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/current_user`, {
        withCredentials: true,
      })
      .then((response) => {
        // Only set user if authenticated flag is true
        if (response.data.isAuthenticated) {
          setCurrentUser(response.data);
        } else {
          setCurrentUser(null);
        }
      })
      .catch(() => setCurrentUser(null));
  }, [location]); // re-fetch on route change

  const toggleDarkMode = () => {
    const newTheme = darkMode ? "light" : "dark";
    document.documentElement.classList.toggle("dark", !darkMode);
    localStorage.setItem("theme", newTheme);
    setDarkMode(!darkMode);
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/logout`,
        {},
        { withCredentials: true }
      );
      setCurrentUser(null);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const menuAnimation = useSpring({
    opacity: isMobileMenuOpen ? 1 : 0,
    transform: isMobileMenuOpen ? "translateY(0)" : "translateY(-100%)",
  });

  return (
    <nav className="flex justify-between items-center px-4 py-2 text-white bg-gradient-to-r from-[#fc466b] to-[#3f5efb]">
      <div className="flex items-center space-x-2">
        <span className="font-bold text-lg">Diabetes Predictor (Beta)</span>
      </div>

      {/* Desktop links */}
      <div className="hidden md:flex items-center space-x-4 ml-auto">
        {currentUser && currentUser.isAuthenticated ? (
          <>
            <Link
              to="/"
              className="text-white hover:underline flex items-center"
            >
              <FaHome className="mr-1" /> Home
            </Link>
            <Link
              to="/about"
              className="text-white hover:underline flex items-center"
            >
              <FaInfoCircle className="mr-1" /> About
            </Link>
            <Link
              to="/profile"
              className="text-white hover:underline flex items-center"
            >
              <FaUser className="mr-1" /> Profile
            </Link>
            <Link
              to="/predict-history"
              className="text-white hover:underline flex items-center"
            >
              <FaHistory className="mr-1" /> History
            </Link>

            <Link
              to="/visualizations"
              className="text-white hover:underline flex items-center"
            >
              <FaChartBar className="mr-1" /> Visualizations
            </Link>
            <Link
              to="/resources"
              className="text-white hover:underline flex items-center"
            >
              <FaBook className="mr-1" /> Resources
            </Link>
            <Link
              to="/contact"
              className="text-white hover:underline flex items-center"
            >
              <FaEnvelope className="mr-1" /> Contact Us
            </Link>
            <button
              onClick={handleLogout}
              className="text-white hover:underline flex items-center"
            >
              <LogOut className="mr-1" /> Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="text-white hover:underline flex items-center"
            >
              <FaSignInAlt className="mr-1" /> Login
            </Link>
            <Link
              to="/register"
              className="text-white hover:underline flex items-center"
            >
              <FaUserPlus className="mr-1" /> Register
            </Link>
          </>
        )}
        <button onClick={toggleDarkMode} className="text-white ml-4">
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>
      </div>

      {/* Hamburger menu for smaller devices */}
      <div className="md:hidden">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-white focus:outline-none"
        >
          <FaBars className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <animated.div
          style={menuAnimation}
          className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex flex-col items-center justify-center space-y-4"
        >
          <button
            onClick={closeMobileMenu}
            className="absolute top-4 right-4 text-white"
          >
            <X className="h-6 w-6" />
          </button>
          {currentUser && currentUser.isAuthenticated ? (
            <>
              <Link
                to="/"
                className="text-white flex items-center"
                onClick={closeMobileMenu}
              >
                <FaHome className="mr-1" /> Home
              </Link>
              <Link
                to="/about"
                className="text-white flex items-center"
                onClick={closeMobileMenu}
              >
                <FaInfoCircle className="mr-1" /> About
              </Link>
              <Link
                to="/visualizations"
                className="text-white flex items-center"
                onClick={closeMobileMenu}
              >
                <FaChartBar className="mr-1" /> Visualizations
              </Link>
              <Link
                to="/contact"
                className="text-white flex items-center"
                onClick={closeMobileMenu}
              >
                <FaEnvelope className="mr-1" /> Contact Us
              </Link>
              <Link
                to="/resources"
                className="text-white flex items-center"
                onClick={closeMobileMenu}
              >
                <FaBook className="mr-1" /> Resources
              </Link>
              <Link
                to="/profile"
                className="text-white flex items-center"
                onClick={closeMobileMenu}
              >
                <FaUser className="mr-1" /> Profile
              </Link>
              <Link
                to="/predict-history"
                className="text-white flex items-center"
                onClick={closeMobileMenu}
              >
                <FaHistory className="mr-1" /> History
              </Link>
              <button
                onClick={handleLogout}
                className="text-white flex items-center"
              >
                <LogOut className="mr-1" /> Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-white flex items-center"
                onClick={closeMobileMenu}
              >
                <FaSignInAlt className="mr-1" /> Login
              </Link>
              <Link
                to="/register"
                className="text-white flex items-center"
                onClick={closeMobileMenu}
              >
                <FaUserPlus className="mr-1" /> Register
              </Link>
            </>
          )}
        </animated.div>
      )}
    </nav>
  );
};

export default Navbar;
