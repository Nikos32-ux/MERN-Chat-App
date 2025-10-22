import React, { useContext, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Home from "./pages/Home.jsx";
import { AuthContext } from "./context/AuthContext.jsx";
import axios from "axios";

axios.defaults.withCredentials = true;

const App = () => {
  const { loggedInUser, setLoggedInUser } = useContext(AuthContext);

  return (
    <Routes>
      <Route path="/login" element={!loggedInUser ? <Login /> : <Navigate to="/" />} />
      <Route path="/register" element={!loggedInUser ? <Register /> : <Navigate to="/" />}/>
      <Route path="/" element={loggedInUser ? <Home /> : <Navigate to="/login" />} />
    </Routes>
  );
};

export default App;
