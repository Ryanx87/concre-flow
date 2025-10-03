import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, Wrench, AlertTriangle, Settings, TrendingUp } from 'lucide-react';
import { plantMaintenanceService, MaintenanceEquipment, MaintenanceTask } from '@/services/plantMaintenanceService';

interface MaintenanceOverviewProps {
  onViewDetails?: (equipmentId: string) => void;
  onCreateTask?: (equipmentId: string) => void;
}

export const MaintenanceOverview = ({ onViewDetails, onCreateTask }: MaintenanceOverviewProps) => {
  const [equipment, setEquipment] = useState<MaintenanceEquipment[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<MaintenanceTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [equipmentData, upcomingData] = await Promise.all([
        plantMaintenanceService.getEquipment(),
        plantMaintenanceService.getUpcomingMaintenance(7) // Next 7 days
      ]);
      
      setEquipment(equipmentData);
      setUpcomingTasks(upcomingData);
    } catch (error) {
      console.error('Error loading maintenance overview:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCriticalEquipment = () => {
    return equipment.filter(eq => 
      eq.condition === 'Critical' || 
      eq.status === 'Down' ||
      (eq.condition === 'Poor' && eq.criticality === 'High')
    );
  };

  const getMaintenanceDue = () => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return equipment.filter(eq => {
      const nextMaintenance = new Date(eq.nextMaintenanceDate);
      return nextMaintenance >= today && nextMaintenance <= nextWeek;
    });
  };

  const getConditionColor = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'fair': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-pulse">Loading maintenance overview...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const criticalEquipment = getCriticalEquipment();
  const maintenanceDue = getMaintenanceDue();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Critical Equipment Alert */}
      <Card className={criticalEquipment.length > 0 ? 'border-red-200' : ''}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className={`w-5 h-5 ${criticalEquipment.length > 0 ? 'text-red-600' : 'text-gray-400'}`} />
            Critical Equipment ({criticalEquipment.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {criticalEquipment.length === 0 ? (
            <div className="text-center py-4">
              <div className="text-green-600 mb-2">
                <Settings className="w-8 h-8 mx-auto" />
              </div>
              <p className="text-sm text-muted-foreground">All equipment operational</p>
            </div>
          ) : (
            <div className="space-y-3">
              {criticalEquipment.slice(0, 3).map((eq) => (
                <div key={eq.id} className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50">
                  <div className="flex-1">
                    <p className="font-medium text-red-800">{eq.name}</p>
                    <p className="text-sm text-red-600">{eq.location}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge className="bg-red-100 text-red-800 text-xs">{eq.status}</Badge>
                      <Badge className={`${getConditionColor(eq.condition)} text-xs`}>{eq.condition}</Badge>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-red-600 border-red-200"
                      onClick={() => onViewDetails?.(eq.id)}
                    >
                      <Wrench className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {criticalEquipment.length > 3 && (
                <p className="text-sm text-muted-foreground text-center">
                  +{criticalEquipment.length - 3} more critical items
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Maintenance Due */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange-600" />
            Maintenance Due (7 days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {maintenanceDue.length === 0 ? (
            <div className="text-center py-4">
              <Calendar className="w-8 h-8 mx-auto text-green-600 mb-2" />
              <p className="text-sm text-muted-foreground">No maintenance due this week</p>
            </div>
          ) : (
            <div className="space-y-3">
              {maintenanceDue.slice(0, 4).map((eq) => {
                const daysUntilMaintenance = Math.ceil(
                  (new Date(eq.nextMaintenanceDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                );
                
                return (
                  <div key={eq.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{eq.name}</p>
                      <p className="text-sm text-muted-foreground">{eq.location}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-orange-600" />
                        <span className="text-xs text-orange-600">
                          {daysUntilMaintenance === 0 ? 'Due today' : 
                           daysUntilMaintenance === 1 ? 'Due tomorrow' : 
                           `Due in ${daysUntilMaintenance} days`}
                        </span>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onCreateTask?.(eq.id)}
                    >
                      Schedule
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-blue-600" />
            Upcoming Tasks ({upcomingTasks.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingTasks.length === 0 ? (
            <div className="text-center py-4">
              <Wrench className="w-8 h-8 mx-auto text-blue-600 mb-2" />
              <p className="text-sm text-muted-foreground">No upcoming tasks scheduled</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingTasks.slice(0, 4).map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{task.title}</p>
                    <p className="text-xs text-muted-foreground">{task.equipmentName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">{task.type}</Badge>
                      <Badge className={`text-xs ${
                        task.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                        task.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {task.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(task.scheduledDate).toLocaleDateString()} • {task.estimatedDuration}h
                    </p>
                  </div>
                </div>
              ))}
              {upcomingTasks.length > 4 && (
                <p className="text-sm text-muted-foreground text-center">
                  +{upcomingTasks.length - 4} more tasks
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Equipment Health Summary Component
export const EquipmentHealthSummary = () => {
  const [equipment, setEquipment] = useState<MaintenanceEquipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEquipment();
  }, []);

  const loadEquipment = async () => {
    try {
      const data = await plantMaintenanceService.getEquipment();
      setEquipment(data);
    } catch (error) {
      console.error('Error loading equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse h-32 bg-muted rounded"></div>;
  }

  const healthStats = {
    excellent: equipment.filter(eq => eq.condition === 'Excellent').length,
    good: equipment.filter(eq => eq.condition === 'Good').length,
    fair: equipment.filter(eq => eq.condition === 'Fair').length,
    poor: equipment.filter(eq => eq.condition === 'Poor').length,
    critical: equipment.filter(eq => eq.condition === 'Critical').length
  };

  const total = equipment.length;
  const overallHealth = total > 0 ? 
    ((healthStats.excellent * 100 + healthStats.good * 80 + healthStats.fair * 60 + healthStats.poor * 40 + healthStats.critical * 20) / (total * 100)) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          Equipment Health Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">
              {Math.round(overallHealth)}%
            </div>
            <p className="text-sm text-muted-foreground">Overall Equipment Health</p>
            <Progress value={overallHealth} className="mt-2" />
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-green-700">Excellent</span>
                <span className="font-medium">{healthStats.excellent}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Good</span>
                <span className="font-medium">{healthStats.good}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-700">Fair</span>
                <span className="font-medium">{healthStats.fair}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-orange-700">Poor</span>
                <span className="font-medium">{healthStats.poor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-700">Critical</span>
                <span className="font-medium">{healthStats.critical}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-medium">Total</span>
                <span className="font-medium">{total}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};