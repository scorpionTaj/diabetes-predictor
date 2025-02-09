import React from "react";

const NotFound: React.FC = () => {
  return (
    <div className="text-center mt-8">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
        404 - Not Found
      </h1>
      <p className="mt-4 text-gray-600 dark:text-gray-400">
        The page you are looking for does not exist.
      </p>
    </div>
  );
};

export default NotFound;
