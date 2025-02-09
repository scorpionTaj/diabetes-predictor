import React from "react";
import { FaSun, FaMoon } from "react-icons/fa";

const ThemeSwitcher: React.FC = () => {
  const [darkMode, setDarkMode] = React.useState<boolean>(false);

  React.useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    } else {
      document.documentElement.classList.remove("dark");
      setDarkMode(false);
    }
  }, []);

  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setDarkMode(true);
    }
  };

  return (
    <button onClick={toggleDarkMode} className="text-white ml-4">
      {darkMode ? <FaSun /> : <FaMoon />}
    </button>
  );
};

export default ThemeSwitcher;
