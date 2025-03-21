import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from '../services/api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    // Initialize state from localStorage
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(false);

  // Persist user state to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await authService.login(email, password);
      // Make sure the response includes the user's name
      const user = {
        name: response.user.name, // Make sure this is included in the backend response
        email: response.user.email,
        id: response.user.id
      };
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout(); // This will remove the token
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const value = {
    currentUser,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext; 