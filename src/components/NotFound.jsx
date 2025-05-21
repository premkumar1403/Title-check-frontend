import React from "react";

const NotFound = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 text-center">
      <div>
        <h1 className="text-6xl font-bold text-red-500">404</h1>
        <p className="text-xl mt-4">Page Not Found</p>
        <a href="/" className="text-blue-500 underline mt-4 block">
          Go back to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;