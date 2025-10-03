import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Truck, Building2, Shield, HardHat, ArrowRight, Users, Settings, Package, BarChart3, MapPin, Clock } from 'lucide-react';

const Auth = () => {
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'admin' | 'site_agent' | ''>('');
  const [loading, setLoading] = useState(false);

  // Role-based theme colors
  const getRoleTheme = () => {
    switch (selectedRole) {
      case 'admin':
        return {
          bgGradient: 'from-blue-600 via-blue-500 to-blue-400',
          icon: Building2,
          iconColor: 'text-blue-600',
          badgeColor: 'bg-blue-100 text-blue-800',
          title: 'Admin Dashboard',
          description: 'Manage operations, view analytics, and oversee production'
        };
      case 'site_agent':
        return {
          bgGradient: 'from-orange-600 via-orange-500 to-orange-400',
          icon: HardHat,
          iconColor: 'text-orange-600',
          badgeColor: 'bg-orange-100 text-orange-800',
          title: 'Site Agent Portal',
          description: 'Track deliveries, place orders, and manage site operations'
        };
      default:
        return {
          bgGradient: 'from-primary via-primary-light to-secondary',
          icon: Truck,
          iconColor: 'text-primary',
          badgeColor: 'bg-primary/10 text-primary',
          title: 'Concre-tek Portal',
          description: 'Ready-mix concrete order management system'
        };
    }
  };

  const theme = getRoleTheme();
  const RoleIcon = theme.icon;

  const handleRoleLogin = (role: 'admin' | 'site_agent') => {
    setLoading(true);
    setSelectedRole(role);
    
    // Simulate a brief loading state
    setTimeout(() => {
      login(role);
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="bg-white rounded-full p-4">
              <Truck className="w-12 h-12 text-slate-800" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-3">Concre-tek</h1>
          <p className="text-white/80 text-lg">by Greenspot Legacy</p>
          <p className="text-white/60 mt-2">Ready-mix concrete order management system</p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Admin Login Card */}
          <Card className="shadow-2xl border-0 bg-gradient-to-br from-blue-50 to-blue-100/50 hover:shadow-3xl transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 rounded-full bg-blue-600 w-16 h-16 flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-blue-900">Administrator</CardTitle>
              <CardDescription className="text-blue-700">
                Plant management, operations oversight, and analytics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Admin Features */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-blue-800">
                  <BarChart3 className="w-4 h-4" />
                  <span>Plant status & capacity monitoring</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-blue-800">
                  <Package className="w-4 h-4" />
                  <span>Material stock & inventory management</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-blue-800">
                  <Users className="w-4 h-4" />
                  <span>Order approval & batching schedule</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-blue-800">
                  <Settings className="w-4 h-4" />
                  <span>Truck dispatch & quality compliance</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-blue-800">
                  <BarChart3 className="w-4 h-4" />
                  <span>Reports & analytics dashboard</span>
                </div>
              </div>
              
              <Button 
                onClick={() => handleRoleLogin('admin')}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg font-semibold"
              >
                {loading && selectedRole === 'admin' ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Accessing Admin Dashboard...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Access Admin Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Site Agent Login Card */}
          <Card className="shadow-2xl border-0 bg-gradient-to-br from-orange-50 to-orange-100/50 hover:shadow-3xl transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 rounded-full bg-orange-600 w-16 h-16 flex items-center justify-center">
                <HardHat className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-orange-900">Site Agent</CardTitle>
              <CardDescription className="text-orange-700">
                Order placement, delivery tracking, and site operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Site Agent Features */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-orange-800">
                  <Package className="w-4 h-4" />
                  <span>Create & submit concrete orders</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-orange-800">
                  <Clock className="w-4 h-4" />
                  <span>Track delivery timeline & status</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-orange-800">
                  <MapPin className="w-4 h-4" />
                  <span>Live truck tracking & ETAs</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-orange-800">
                  <Users className="w-4 h-4" />
                  <span>Confirm deliveries & report issues</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-orange-800">
                  <BarChart3 className="w-4 h-4" />
                  <span>Project reports & order history</span>
                </div>
              </div>
              
              <Button 
                onClick={() => handleRoleLogin('site_agent')}
                disabled={loading}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white h-12 text-lg font-semibold"
              >
                {loading && selectedRole === 'site_agent' ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Accessing Site Agent Portal...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <HardHat className="w-5 h-5" />
                    Access Site Agent Portal
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-8 text-white/60 text-sm">
          <p>Select your role to access the appropriate dashboard</p>
          <p className="mt-1">No password required - role-based access only</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
