import axios from "axios";
import { create } from "zustand";
import { toast } from "react-toastify";

const App_Base_URL =
    import.meta.env.VITE_REACT_APP_NET_URI || import.meta.env.VITE_REACT_APP_LOCAL_URI;

const useAuthStore = create((set, get) => ({
    user: null,
    isAuthenticated: !!localStorage.getItem("token"),
    token: null,
    signup: async (username, email, password, navigate) => {
        try {
            const res = await axios.post(`${App_Base_URL}/api/v1/users/signup`, {
                username,
                email,
                password,
            });
            if (res) {
                toast.success("Account created successfully!");
                set({ user: res.data });
                setTimeout(() => navigate("/"), 1000);
            }
        } catch (error) {
            console.error("Signup Error:", error);
            toast.error(error.response?.data?.message || "Signup failed");
        }
    },

    signin: async (email, password) => {
        try {
            const res = await axios.post(
                `${App_Base_URL}/api/v1/users/signin`,
                { email, password },
                { withCredentials: true }
            );
            if (res) {
                localStorage.setItem("token", res.data.data);
                set({ user:res.data, isAuthenticated: true });
                toast.success("Logged in successfully!");
            }
        } catch (error) {
            console.error("Login Error:", error);
            toast.error(error.response?.data?.message || "Login failed");
        }
    },

    logout: async (navigate) => {
        try {
            const res = await axios.get(`${App_Base_URL}/api/v1/users/signout`, {
                withCredentials: true,
            });
            if (res.status === 200) {
                localStorage.removeItem("token");
                set({ user: null, isAuthenticated: false });
                navigate("/");
            }
        } catch (error) {
            console.error("Logout Error:", error);
        }
    },
}));

export default useAuthStore;
