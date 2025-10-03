import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { signOut } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Truck, LogOut, Loader2 } from 'lucide-react';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import SiteAgentDashboard from '@/components/dashboard/SiteAgentDashboard';

const Dashboard = () => {
  const { user } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to sign out',
      });
    } else {
      toast({
        title: 'Signed Out',
        description: 'Successfully logged out',
      });
    }
  };

  if (roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-primary-light text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-full p-2">
                <Truck className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Concre-tek</h1>
                <p className="text-sm text-white/80">by Greenspot Legacy</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">{role === 'admin' ? 'Admin' : 'Site Agent'}</p>
                <p className="text-xs text-white/80">{user?.email}</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSignOut}
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Welcome back{role === 'admin' ? ', Admin' : ''}!
          </h2>
          <p className="text-muted-foreground">
            {role === 'admin' ? 'Manage plant operations and approve orders' : 'Track your deliveries and place new orders'}
          </p>
        </div>

        {/* Role-based Dashboard */}
        {role === 'admin' ? <AdminDashboard /> : <SiteAgentDashboard />}
      </main>
    </div>
  );
};

export default Dashboard;
