import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Truck, User, Building, Settings } from 'lucide-react';
import { fleetManagementService, FleetStatistics } from '@/services/fleetManagementService';
import { useNavigate } from 'react-router-dom';

export const FleetOverview = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<FleetStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const fleetStats = await fleetManagementService.getFleetStatistics();
        setStats(fleetStats);
      } catch (error) {
        console.error('Error loading fleet statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-secondary" />
            Fleet Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-pulse">Loading fleet data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-secondary" />
            Fleet Overview
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/users')}>
            Manage
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {/* Trucks */}
          <div className="text-center">
            <Truck className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <div className="space-y-1">
              <p className="text-2xl font-bold">{stats.totalTrucks}</p>
              <p className="text-xs text-muted-foreground">Total Trucks</p>
              <div className="space-y-1">
                <Badge variant="outline" className="text-xs">
                  {stats.availableTrucks} Available
                </Badge>
                <Badge variant="outline" className="text-xs bg-blue-50">
                  {stats.trucksOnRoute} On Route
                </Badge>
                {stats.trucksInMaintenance > 0 && (
                  <Badge variant="outline" className="text-xs bg-red-50">
                    {stats.trucksInMaintenance} Maintenance
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Drivers */}
          <div className="text-center">
            <User className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <div className="space-y-1">
              <p className="text-2xl font-bold">{stats.totalDrivers}</p>
              <p className="text-xs text-muted-foreground">Total Drivers</p>
              <div className="space-y-1">
                <Badge variant="outline" className="text-xs bg-green-50">
                  {stats.activeDrivers} Active
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {stats.totalDrivers - stats.activeDrivers} Off Duty
                </Badge>
              </div>
            </div>
          </div>

          {/* Suppliers */}
          <div className="text-center">
            <Building className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <div className="space-y-1">
              <p className="text-2xl font-bold">{stats.totalSuppliers}</p>
              <p className="text-xs text-muted-foreground">Total Suppliers</p>
              <div className="space-y-1">
                <Badge variant="outline" className="text-xs bg-purple-50">
                  {stats.activeSuppliers} Active
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {stats.totalSuppliers - stats.activeSuppliers} Inactive
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-4 pt-4 border-t space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Fleet Utilization</span>
            <span className="font-medium">{stats.utilizationRate.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Monthly Fuel Cost</span>
            <span className="font-medium">R{stats.fuelCost.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Maintenance Cost</span>
            <span className="font-medium">R{stats.maintenanceCost.toLocaleString()}</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/users?tab=trucks')}>
              <Truck className="w-3 h-3 mr-1" />
              Trucks
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/users?tab=drivers')}>
              <User className="w-3 h-3 mr-1" />
              Drivers
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};