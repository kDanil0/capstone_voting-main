import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { getUser } from "./api";

export const AuthContext = createContext({
  user: null,
  token: null,
  setUser: () => {},
  setToken: () => {},
});

function AuthContextProvider({ children }) {
  // Initialize states from localStorage with better error handling
  const [token, setToken] = useState(() => {
    const storedToken = localStorage.getItem("token");
    return storedToken;
  });

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      localStorage.removeItem("user"); // Clear corrupted data
      return null;
    }
  });

  // References to track changes
  const prevToken = useRef(token);
  const prevUser = useRef(user);

  // Token effect: Update when token changes
  useEffect(() => {
    console.log("Token changed:", token ? "Token exists" : "No token");

    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    }
  }, [token]);

  // User effect: Update when user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
  }, [user]);

  // Fetch user data if we have a token but no user
  useEffect(() => {
    const fetchUserData = async () => {
      if (token && !user) {
        try {
          const userData = await getUser(token);
          if (userData) {
            setUser(userData);
          } else {
            console.warn("⚠️ Auth: API returned no user data - clearing token");
            setToken(null); // Clear invalid token
          }
        } catch (error) {
          console.error("❌ Auth: Failed to fetch user");
          setToken(null); // Clear invalid token
        }
      }
    };

    fetchUserData();
  }, [token, user]);

  // Simplified auth state logging
  useEffect(() => {
    if (process.env.NODE_ENV === "development" && (token || user)) {
      console.groupCollapsed("🔐 Auth Context State");
      console.log("Token:", token ? "exists" : "null");
      if (user) {
        console.log("User ID:", user.id);
        console.log("Role:", user.role_id);
      } else {
        console.log("User: null");
      }
      console.groupEnd();
    }
  }, [token, user]);

  return (
    <AuthContext.Provider value={{ user, token, setUser, setToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContextProvider;
export const useAuthContext = () => useContext(AuthContext);
