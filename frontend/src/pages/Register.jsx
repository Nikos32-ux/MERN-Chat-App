import React, { useState, useContext } from "react";
import api from "../../axiosConfig.js";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);       // <-- loading state
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("")
    setLoading(true)

    try {
      const formData = new FormData();

      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);

      if (profile) formData.append("profile", profile);

      const res = await api.post(
        "/api/auth/register",
        formData
      );

      if (res.data.success) {
        login(res.data.user);
          navigate("/");      
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally{
      setLoading(false)
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-[url('/logIn.jpg')] bg-center bg-cover">
      <div className="max-w-sm p-8 rounded-lg backdrop-blur-lg  hover:shadow-[0_0_40px_rgba(59,130,246,0.8)]  bg-[linear-gradient(to_right,rgba(41, 0, 105, 0.7),rgba(34, 105, 220, 0.7))]">
        <h2 className="text-3xl font-extrabold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-pink-400 to-blue-400 drop-shadow-lg">Register</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full p-3 border rounded-lg bg-white/90 text-gray-800 placeholder-gray-400 border focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
          />
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
          <input
            type="file"
            onChange={(e) => setProfile(e.target.files[0])}
            className="w-full text-semibold text-white"
          />
          <button
            disabled={loading}
            type="submit"
            className="w-full py-3 bg-green-500 text-white rounded hover:bg-green-600"
          >
           {loading ? "Registering..." : "Register" }
          </button>
        </form>
        <p className="mt-4 text-center text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
