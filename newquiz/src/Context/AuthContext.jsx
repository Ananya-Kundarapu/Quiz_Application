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
  const storedUser = sessionStorage.getItem('user');

  if (storedUser) {
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    setToken(parsedUser.token || null); 
  }

  setIsLoading(false);
}, []);


const login = (userData, token) => {
  const userWithToken = { ...userData, token };
  setUser(userWithToken);
  setToken(token); 
  sessionStorage.setItem('token', token);
  sessionStorage.setItem('user', JSON.stringify(userWithToken)); 
};

  const logout = () => {
  setIsLoggingOut(true); 
  setTimeout(() => {
    sessionStorage.clear();
    setUser(null);
    setToken(null);
    navigate('/', { replace: true });

    setIsLoggingOut(false);
  }, 2000); 
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
