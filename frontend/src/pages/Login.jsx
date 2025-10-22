import React, { useState, useContext } from "react";
import api from '../../axiosConfig.js'
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await api.post("/api/auth/login",{ email, password });

      if (res.data.success) {
        login(res.data.user);

        setSuccess("✅ Successfully logged in!");
        setTimeout(() => {
          navigate("/");
        }, 3000);

      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-[url('/logIn.jpg')] bg-center bg-cover shadow-md bg-bottom bg-gray-100">
      <div className="max-w-sm p-8 rounded-lg backdrop-blur-lg  hover:shadow-[0_0_40px_rgba(59,130,246,0.8)]  bg-[linear-gradient(to_right,rgba(41, 0, 105, 0.7),rgba(34, 105, 220, 0.7))]">
        <h2 className="text-3xl font-extrabold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-pink-400 to-blue-400 drop-shadow-lg">Login</h2>

        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        {success && <p className="text-green-500 mb-4 text-center">{success}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 border rounded-lg bg-white/90 text-gray-800 placeholder-gray-400 border focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 border rounded-lg bg-white/90 text-gray-800 placeholder-gray-400 border focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold text-white transition-colors ${loading ? "bg-gray-400 cursor-not-allowed" :"bg-blue-500 hover:bg-blue-600 active:bg-blue-700"}`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-4 text-center text-gray-600">
          Don’t have an account?{" "}
          <Link to="/register" className="text-blue-500 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
