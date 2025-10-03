import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Monitor, Smartphone, Activity, ArrowRightLeft } from 'lucide-react';
import { realTimeDataService } from '@/services/realTimeDataService';

export const RealTimeSyncDemo = () => {
  const [demoStep, setDemoStep] = useState(0);
  const [adminCount, setAdminCount] = useState(1);
  const [agentCount, setAgentCount] = useState(1);

  const demoSteps = [
    {
      title: "Admin creates new area",
      description: "Admin user adds 'Foundation Zone D' to the project",
      action: () => {
        realTimeDataService.setCurrentUser('admin-demo', 'admin', 'Demo Admin');
        realTimeDataService.addArea('Foundation Zone D', 15);
      }
    },
    {
      title: "Site Agent sees update instantly",
      description: "New area appears in Site Agent's dropdown immediately",
      action: () => {
        // Simulate site agent viewing
        setAgentCount(prev => prev + 1);
      }
    },
    {
      title: "Site Agent adds structure",
      description: "Site Agent adds 'Raft Foundation' to the new area",
      action: () => {
        realTimeDataService.setCurrentUser('agent-demo', 'site-agent', 'Demo Agent');
        const areas = realTimeDataService.getProjectAreas();
        const newArea = areas.find(a => a.name === 'Foundation Zone D');
        if (newArea) {
          realTimeDataService.addStructureToArea(newArea.id, 'Raft Foundation', 'Foundation', '30MPa');
        }
      }
    },
    {
      title: "Admin sees structure update",
      description: "Admin dashboard reflects the new structure immediately",
      action: () => {
        setAdminCount(prev => prev + 1);
      }
    },
    {
      title: "Site Agent creates order",
      description: "Quick order for 35m³ of 30MPa concrete",
      action: () => {
        realTimeDataService.setCurrentUser('agent-demo', 'site-agent', 'Demo Agent');
        const areas = realTimeDataService.getProjectAreas();
        const area = areas.find(a => a.name === 'Foundation Zone D');
        const structure = area?.structures.find(s => s.name === 'Raft Foundation');
        
        if (area && structure) {
          realTimeDataService.createOrder({
            projectName: 'Demo Project',
            location: 'Demo Site',
            areaId: area.id,
            structureId: structure.id,
            volume: 35,
            grade: '30MPa',
            slump: 100,
            deliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            deliveryTime: '08:00',
            status: 'Pending',
            contactName: 'Demo Agent',
            contactPhone: '+27 82 000 0000'
          });
        }
      }
    },
    {
      title: "All users synchronized",
      description: "Order appears in admin dashboard for processing",
      action: () => {
        setAdminCount(prev => prev + 1);
        setAgentCount(prev => prev + 1);
      }
    }
  ];

  const runDemo = () => {
    if (demoStep < demoSteps.length) {
      demoSteps[demoStep].action();
      setDemoStep(prev => prev + 1);
    }
  };

  const resetDemo = () => {
    setDemoStep(0);
    setAdminCount(1);
    setAgentCount(1);
  };

  return (
    <Card className="border-2 border-purple-200 bg-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-600" />
          <span className="text-purple-800">Real-Time Sync Demo</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Demo Progress */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Demo Progress</span>
          <Badge variant="outline">{demoStep} / {demoSteps.length}</Badge>
        </div>
        
        {/* Current Step */}
        {demoStep < demoSteps.length && (
          <div className="p-3 bg-white rounded border">
            <h4 className="font-medium text-purple-800">{demoSteps[demoStep].title}</h4>
            <p className="text-sm text-muted-foreground">{demoSteps[demoStep].description}</p>
          </div>
        )}

        {/* User Simulation */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-white rounded border">
            <Monitor className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <div className="flex items-center justify-center gap-2">
              <Users className="w-4 h-4" />
              <span className="font-semibold">{adminCount}</span>
            </div>
            <p className="text-xs text-muted-foreground">Admin Users</p>
          </div>
          <div className="text-center p-3 bg-white rounded border">
            <Smartphone className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <div className="flex items-center justify-center gap-2">
              <Users className="w-4 h-4" />
              <span className="font-semibold">{agentCount}</span>
            </div>
            <p className="text-xs text-muted-foreground">Site Agents</p>
          </div>
        </div>

        {/* Sync Indicator */}
        <div className="flex items-center justify-center gap-2 p-2 bg-white rounded border">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <ArrowRightLeft className="w-4 h-4 text-green-600" />
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-green-700">Live Sync Active</span>
        </div>

        {/* Demo Controls */}
        <div className="flex gap-2">
          <Button 
            onClick={runDemo} 
            disabled={demoStep >= demoSteps.length}
            className="flex-1"
          >
            {demoStep >= demoSteps.length ? 'Demo Complete' : 'Next Step'}
          </Button>
          <Button variant="outline" onClick={resetDemo}>
            Reset
          </Button>
        </div>

        {/* Demo Complete */}
        {demoStep >= demoSteps.length && (
          <div className="p-3 bg-green-100 border border-green-200 rounded">
            <p className="text-sm text-green-800 font-medium">✅ Demo Complete!</p>
            <p className="text-xs text-green-700">
              All changes synchronized in real-time between admin and site agent dashboards.
            </p>
          </div>
        )}

        {/* Info */}
        <div className="text-xs text-muted-foreground bg-white p-2 rounded border">
          <p><strong>Real-time features:</strong></p>
          <ul className="mt-1 space-y-1">
            <li>• Instant area/structure synchronization</li>
            <li>• Live order updates across all users</li>
            <li>• Activity tracking with timestamps</li>
            <li>• Automatic conflict resolution</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};