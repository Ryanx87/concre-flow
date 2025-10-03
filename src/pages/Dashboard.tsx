import { useAuth } from '@/contexts/AuthContext';
import AdminDashboard from './AdminDashboard';
import SiteAgentDashboard from './SiteAgentDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthenticatedRoute } from '@/components/auth/ProtectedRoute';

const Dashboard = () => {
  const { user, role, loading } = useAuth();

  return (
    <AuthenticatedRoute>
      {loading ? (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Checking your permissions...</p>
            </CardContent>
          </Card>
        </div>
      ) : role === 'admin' ? (
        <AdminDashboard />
      ) : role === 'site_agent' ? (
        <SiteAgentDashboard />
      ) : (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                You don't have permission to access the dashboard. Please contact your administrator.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </AuthenticatedRoute>
  );
};

export default Dashboard;
