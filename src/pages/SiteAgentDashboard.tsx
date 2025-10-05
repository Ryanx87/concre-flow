import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Truck, LogOut, Settings } from 'lucide-react';
import { useState } from 'react';
import SiteAgentDashboardComponent from '@/components/dashboard/SiteAgentDashboard';
import { SiteAgentRoute } from '@/components/auth/ProtectedRoute';
import { NotificationBell } from '@/components/ui/NotificationBell';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { RealtimeStatusBadge } from '@/components/dashboard/RealtimeStatusBadge';

const SiteAgentDashboard = () => {
  const { user, logout } = useAuth();
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const realtimeStatus = useRealtimeSync();

  const handleSignOut = () => {
    logout();
  };

  return (
    <SiteAgentRoute>
    <div className="min-h-screen bg-background">
      {/* Header */}
        <header className="bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-full p-2">
                  <Truck className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Concre-tek</h1>
                <p className="text-sm text-white/80">Site Agent Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <RealtimeStatusBadge status={realtimeStatus} />
              <NotificationBell />
              <Dialog open={showNotificationSettings} onOpenChange={setShowNotificationSettings}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Notification Settings</DialogTitle>
                  </DialogHeader>
                  <NotificationSettings />
                </DialogContent>
              </Dialog>
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
            Welcome back!
          </h2>
          <p className="text-muted-foreground">
            {user?.email}
          </p>
        </div>

          {/* Enhanced Dashboard Component */}
          <SiteAgentDashboardComponent />
      </main>
    </div>
    </SiteAgentRoute>
  );
};

export default SiteAgentDashboard;
