import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import AdminDashboard from './AdminDashboard';
import SiteAgentDashboard from './SiteAgentDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Dashboard = () => {
  const { user } = useAuth();
  const { role, loading } = useUserRole();

  if (loading) {
    return (
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
    );
  }

  if (role === 'admin') {
    return <AdminDashboard />;
  }

  if (role === 'site_agent') {
    return <SiteAgentDashboard />;
  }

  return (
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
  );
};

export default Dashboard;
