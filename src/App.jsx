import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Register from "./components/Register";
import Login from "./components/Login";
import Upload from "./components/Upload";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./components/NotFound";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = () => {
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(true);
  };
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login login={login} />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
            <Route path="/upload" element={<Upload logout={logout} />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
