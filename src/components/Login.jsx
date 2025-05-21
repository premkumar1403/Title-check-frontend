import React, { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";

const Login = ({ login }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateField = (name, value) => {
    switch (name) {
      case "email":
        return emailRegex.test(value) ? "" : "Invalid email";
      case "password":
        return value.length >= 6
          ? ""
          : "Password must be at least 6 characters";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "email") setEmail(value);
    if (name === "password") setPassword(value);
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const isFormValid = () => {
    return !errors.email && email && !errors.password && password;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      toast.error("Please enter valid credentials.");
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_REACT_APP_URI}/api/v1/users/signin`,
        {
          email,
          password,
        },
        {
          withCredentials: true,
        }
      );
      if (res) {
        login(email, password);
        toast.success("Logged in successfully!");
        navigate("/upload", { replace: true });
        setEmail("");
        setPassword("");
        setErrors({ email: "", password: "" });
      } else {
        toast.error(res.data.message || "Login failed!");
      }
    } catch (error) {
      console.error("Login Error:", error);
      toast.error(error.response?.data?.message || "Server Error");
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Panel */}
      <div className="md:w-1/2 w-full bg-blue-500 flex flex-col justify-center items-center text-white p-10 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome Back!</h1>
        <p className="text-lg font-semibold mb-6">Login to your account.</p>
        <Link to={"/register"}>
          <button className="border border-white px-6 py-2 rounded-full hover:bg-white hover:text-blue-500 transition cursor-pointer">
            Sign Up
          </button>
        </Link>
      </div>

      {/* Right Panel - Login Form */}
      <div className="md:w-1/2 w-full flex items-center justify-center bg-white px-6 py-12">
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
          <h2 className="text-3xl font-bold text-black">Login</h2>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="text"
              value={email}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded border ${
                errors.email
                  ? "border-red-500"
                  : email
                  ? "border-green-500"
                  : "border-gray-300"
              } focus:outline-none`}
            />
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="relative">
            <label htmlFor="password" className="block text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded border ${
                errors.password
                  ? "border-red-500"
                  : password
                  ? "border-green-500"
                  : "border-gray-300"
              } focus:outline-none`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-9 text-sm text-blue-600"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
            {errors.password && (
              <p className="text-sm text-red-600 mt-1">{errors.password}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full border-2 border-blue-500 text-blue-500 font-bold py-2 rounded-full hover:bg-blue-500 hover:text-white transition cursor-pointer"
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
