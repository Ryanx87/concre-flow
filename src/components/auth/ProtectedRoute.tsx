import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/hooks/useUserRole';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, HardHat, AlertTriangle } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
  allowedRoles?: UserRole[];
  fallback?: ReactNode;
}

export const ProtectedRoute = ({ 
  children, 
  requiredRole, 
  allowedRoles, 
  fallback 
}: ProtectedRouteProps) => {
  const { user, role, loading } = useAuth();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              Loading...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Checking your permissions...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check role-based access
  const hasAccess = () => {
    if (!role) return false;
    
    if (requiredRole) {
      return role === requiredRole;
    }
    
    if (allowedRoles) {
      return allowedRoles.includes(role);
    }
    
    return true; // No specific role requirement
  };

  // Show access denied if role doesn't match
  if (!hasAccess()) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 rounded-full bg-red-100">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-xl">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              You don't have permission to access this page.
            </p>
            
            {requiredRole && (
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {requiredRole === 'admin' ? (
                    <Shield className="w-5 h-5 text-blue-600" />
                  ) : (
                    <HardHat className="w-5 h-5 text-orange-600" />
                  )}
                  <span className="font-medium">
                    Required: {requiredRole === 'admin' ? 'Administrator' : 'Site Agent'} Access
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your current role: {role === 'admin' ? 'Administrator' : role === 'site_agent' ? 'Site Agent' : 'Unknown'}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <button 
                onClick={() => window.history.back()}
                className="w-full px-4 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors"
              >
                Go Back
              </button>
              <button 
                onClick={() => window.location.href = '/dashboard'}
                className="w-full px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

// Convenience components for specific roles
export const AdminRoute = ({ children }: { children: ReactNode }) => (
  <ProtectedRoute requiredRole="admin">{children}</ProtectedRoute>
);

export const SiteAgentRoute = ({ children }: { children: ReactNode }) => (
  <ProtectedRoute requiredRole="site_agent">{children}</ProtectedRoute>
);

export const AuthenticatedRoute = ({ children }: { children: ReactNode }) => (
  <ProtectedRoute>{children}</ProtectedRoute>
);

