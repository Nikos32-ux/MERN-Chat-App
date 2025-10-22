import { createContext, useState, useEffect } from "react";
import api from '../../axiosConfig.js'

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [loggedInUser, setLoggedInUser] = useState(null);

  //on mount to auto-recover user connection
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/api/auth/get_user", {
          withCredentials: true,
        });

        if (res.data.success) {
          setLoggedInUser(res.data.user);
        } else {
          setLoggedInUser(null);
        }
      } catch (err) {
        if(err.response?.status !== 401){
          console.error(err)
        }
        setLoggedInUser(null);
      }
    };
    fetchUser();
  }, []);
  
  const login = (userData) => {
    setLoggedInUser(userData);
  };

  const logout = async () => {
    try {
      await api.post(
        "/api/auth/logout",
        {}
      );
    } catch (err) {
      console.error(err);
    }
    setLoggedInUser(null);
  };

  return (
    <AuthContext.Provider value={{ loggedInUser, setLoggedInUser, login, logout}}>
      {children}
    </AuthContext.Provider>
  );
};
