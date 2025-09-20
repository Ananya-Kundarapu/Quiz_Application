import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext); 

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = sessionStorage.getItem('token');
    const storedUser = sessionStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    setIsLoading(false);
  }, []);

  // ✅ Login handler
  const login = (userData, token) => {
    setUser(userData);
    setToken(token);
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
  setIsLoggingOut(true); // Trigger "Logging out..." state

  // Defer session/user clearing to align with the delay
  setTimeout(() => {
    // ✅ First: Clear session and state (this prevents header from showing)
    sessionStorage.clear();
    setUser(null);
    setToken(null);

    // ✅ Then navigate after state is cleared (prevents SignUp flash)
    navigate('/', { replace: true });

    setIsLoggingOut(false); // Reset logout state
  }, 2000); // Wait for 2s to show "Logging out..."
};

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        loading: isLoading,
        isLoggingOut,
        setIsLoggingOut,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
