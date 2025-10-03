import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

export type UserRole = 'admin' | 'site_agent' | null;

interface AuthContextType {
  user: { id: string; email: string; role: UserRole } | null;
  role: UserRole | null;
  loading: boolean;
  theme: 'admin' | 'site_agent' | 'default';
  login: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
  theme: 'default',
  login: () => {},
  logout: () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ id: string; email: string; role: UserRole } | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Determine theme based on role
  const theme = role === 'admin' ? 'admin' : role === 'site_agent' ? 'site_agent' : 'default';

  // Login function - creates a mock user with the selected role
  const login = (selectedRole: UserRole) => {
    const mockUser = {
      id: `mock-${selectedRole}-${Date.now()}`,
      email: `${selectedRole}@concretek.com`,
      role: selectedRole
    };
    
    setUser(mockUser);
    setRole(selectedRole);
    
    // Store in localStorage for persistence
    localStorage.setItem('concretek_user', JSON.stringify(mockUser));
    localStorage.setItem('concretek_role', selectedRole);
    
    navigate('/dashboard');
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setRole(null);
    
    // Clear localStorage
    localStorage.removeItem('concretek_user');
    localStorage.removeItem('concretek_role');
    
    navigate('/auth');
  };

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('concretek_user');
    const storedRole = localStorage.getItem('concretek_role') as UserRole;
    
    if (storedUser && storedRole) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setRole(storedRole);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('concretek_user');
        localStorage.removeItem('concretek_role');
      }
    }
    
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading, theme, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};