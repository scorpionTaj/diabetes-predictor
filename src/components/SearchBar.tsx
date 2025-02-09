import React, { useState, useEffect } from "react";
import useDebounce from "../hooks/useDebounce";

const SearchBar: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedSearchTerm) {
      // Make API call with debouncedSearchTerm
      console.log("API call with:", debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  return (
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search..."
      className="p-2 border rounded"
    />
  );
};

export default SearchBar;
