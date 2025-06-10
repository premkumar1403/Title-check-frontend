import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import useAuthStore from "../store/useAuthStore";


const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const {signup}= useAuthStore();
  
  const usernameRegex = /^(?! )[A-Za-z\d]+(?: [A-Za-z\d]+)*(?<! )$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  const App_Base_URL =
    import.meta.env.VITE_REACT_APP_NET_URI ||
    import.meta.env.VITE_REACT_APP_LOCAL_URI;
  const validateField = (name, value) => {
    switch (name) {
      case "username":
        return usernameRegex.test(value)
          ? ""
          : "3-20 chars, only letters are allowed";
      case "email":
        return emailRegex.test(value) ? "" : "Invalid email";
      case "password":
        return passwordRegex.test(value)
          ? ""
          : "Min 8 chars, uppercase, lowercase, digit & special char";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "username") setUsername(value);
    if (name === "email") setEmail(value);
    if (name === "password") setPassword(value);
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const isFormValid = () => {
    return (
      !errors.username &&
      username &&
      !errors.email &&
      email &&
      !errors.password &&
      password
    );
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!isFormValid()) {
    toast.error("Please fill all the required fields correctly.");
    return;
  }
  try {
      setErrors({ username: "", email: "", password: "" });
      await signup(username,email,password,navigate);
      setUsername("");
      setEmail("");
      setPassword("");
     } 
  catch (error) {
    console.error("Registration Error:", error);
    toast.error(error.response?.data?.message || "Server Error");
  }
};

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Panel */}
      <div className="md:w-1/2 w-full bg-blue-500 flex flex-col justify-center items-center text-white p-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome!</h1>
        <p className="text-lg font-semibold mb-6">
          Create your account. For Free!
        </p>
        <Link to={"/"}>
            <button className="border border-white px-6 py-2 rounded-full hover:bg-white hover:text-blue-500 transition cursor-pointer">
              Log In
            </button>
        </Link>
      </div>

      {/* Right Panel - Form */}
      <div className="md:w-1/2 w-full flex items-center justify-center bg-white px-6 py-12">
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
          <h2 className="text-3xl font-bold text-black">Signup</h2>

          {/* Username Field */}
          <div>
            <label htmlFor="username" className="block text-gray-700 mb-1">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={username}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded border ${
                errors.username
                  ? "border-red-500"
                  : username
                  ? "border-green-500"
                  : "border-gray-300"
              } focus:outline-none`}
            />
            {errors.username && (
              <p className="text-sm text-red-600 mt-1">{errors.username}</p>
            )}
          </div>

          {/* Email Field */}
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

          {/* Password Field */}
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
            Sign Up
          </button>

          <ToastContainer position="top-right" autoClose={3000} />
        </form>
      </div>
    </div>
  );
};

export default Register;
