import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Download, 
  FileText, 
  TrendingUp,
  Calendar,
  Filter,
  RefreshCw
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Tooltip,
  Area,
  AreaChart
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const Reports = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCharts, setShowCharts] = useState(false);

  const kpis = {
    totalVolume: 656,
    totalOrders: 105,
    avgDeliveryTime: 2.3,
    qualityRate: 94.2,
    weeklyGrowth: 8.5,
    monthlyGrowth: 12.3
  };

  // Sample data for charts
  const productionTrendData = [
    { date: '2024-01-01', volume: 45, orders: 8, quality: 92 },
    { date: '2024-01-02', volume: 52, orders: 12, quality: 94 },
    { date: '2024-01-03', volume: 61, orders: 15, quality: 96 },
    { date: '2024-01-04', volume: 58, orders: 11, quality: 93 },
    { date: '2024-01-05', volume: 67, orders: 18, quality: 95 },
    { date: '2024-01-06', volume: 72, orders: 22, quality: 97 },
    { date: '2024-01-07', volume: 85, orders: 25, quality: 94 }
  ];

  const mixTypeData = [
    { name: 'Standard Mix', value: 45, volume: 285 },
    { name: 'High Strength', value: 25, volume: 165 },
    { name: 'Lightweight', value: 15, volume: 98 },
    { name: 'Rapid Set', value: 10, volume: 68 },
    { name: 'Other', value: 5, volume: 40 }
  ];

  const deliveryPerformanceData = [
    { month: 'Jan', onTime: 85, late: 12, cancelled: 3 },
    { month: 'Feb', onTime: 88, late: 10, cancelled: 2 },
    { month: 'Mar', onTime: 92, late: 6, cancelled: 2 },
    { month: 'Apr', onTime: 89, late: 9, cancelled: 2 },
    { month: 'May', onTime: 94, late: 5, cancelled: 1 },
    { month: 'Jun', onTime: 91, late: 7, cancelled: 2 }
  ];

  const qualityMetricsData = [
    { test: 'Slump Test', passed: 96, failed: 4 },
    { test: 'Compressive Strength', passed: 94, failed: 6 },
    { test: 'Air Content', passed: 98, failed: 2 },
    { test: 'Temperature', passed: 92, failed: 8 },
    { test: 'Workability', passed: 95, failed: 5 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const chartConfig = {
    volume: {
      label: 'Volume (m³)',
      color: '#0088FE'
    },
    orders: {
      label: 'Orders',
      color: '#00C49F'
    },
    quality: {
      label: 'Quality (%)',
      color: '#FFBB28'
    }
  };

  const exportReport = (format: 'pdf' | 'excel' | 'csv') => {
    console.log(`Exporting ${format} report...`);
    // Mock export functionality
    alert(`${format.toUpperCase()} export started. Check your downloads folder.`);
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{`Date: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}${entry.dataKey === 'volume' ? 'm³' : entry.dataKey === 'quality' ? '%' : ''}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Production and business intelligence dashboard
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button 
            onClick={() => setShowCharts(!showCharts)}
            className={showCharts ? 'bg-primary text-primary-foreground' : ''}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            {showCharts ? 'Hide Charts' : 'View Charts'}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshData}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportReport('pdf')}>
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportReport('excel')}>
            <FileText className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Volume</p>
                <p className="text-3xl font-bold">{kpis.totalVolume}m³</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-green-600" />
                  <span className="text-xs text-green-600">+{kpis.weeklyGrowth}% vs last week</span>
                </div>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-3xl font-bold">{kpis.totalOrders}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-green-600" />
                  <span className="text-xs text-green-600">+{kpis.monthlyGrowth}% vs last month</span>
                </div>
              </div>
              <FileText className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Delivery Time</p>
                <p className="text-3xl font-bold">{kpis.avgDeliveryTime}h</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-green-600" />
                  <span className="text-xs text-green-600">15min improvement</span>
                </div>
              </div>
              <Calendar className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Quality Rate</p>
                <p className="text-3xl font-bold">{kpis.qualityRate}%</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-green-600" />
                  <span className="text-xs text-green-600">Above target (90%)</span>
                </div>
              </div>
              <Badge className="text-lg font-bold bg-green-100 text-green-800">A+</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Production Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Production Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Today's Production</span>
                <span className="font-bold">85m³</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">This Week</span>
                <span className="font-bold">520m³</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">This Month</span>
                <span className="font-bold">2,150m³</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Plant Utilization</span>
                <Badge variant="outline">78%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quality Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Tests Passed</span>
                <span className="font-bold text-green-600">94.2%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">SANS Compliance</span>
                <span className="font-bold text-green-600">98.5%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">COAs Generated</span>
                <span className="font-bold">87</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Rejected Loads</span>
                <span className="font-bold text-red-600">3</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Charts */}
      {showCharts && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Interactive Analytics Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
          <Tabs defaultValue="trends" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="trends">Production Trends</TabsTrigger>
              <TabsTrigger value="composition">Mix Composition</TabsTrigger>
              <TabsTrigger value="delivery">Delivery Performance</TabsTrigger>
              <TabsTrigger value="quality">Quality Metrics</TabsTrigger>
            </TabsList>

            <TabsContent value="trends" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Production Volume Trend */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Production Volume Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig} className="h-[300px]">
                      <LineChart data={productionTrendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(value) => new Date(value).toLocaleDateString()}
                        />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="volume" 
                          stroke="#0088FE" 
                          strokeWidth={2}
                          name="Volume (m³)"
                        />
                      </LineChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* Orders vs Quality */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Orders & Quality Correlation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig} className="h-[300px]">
                      <LineChart data={productionTrendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(value) => new Date(value).toLocaleDateString()}
                        />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="orders" 
                          stroke="#00C49F" 
                          strokeWidth={2}
                          name="Orders"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="quality" 
                          stroke="#FFBB28" 
                          strokeWidth={2}
                          name="Quality %"
                        />
                      </LineChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="composition" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Mix Type Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Concrete Mix Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig} className="h-[300px]">
                      <PieChart>
                        <Pie
                          data={mixTypeData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {mixTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                      </PieChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* Volume by Mix Type */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Volume by Mix Type</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig} className="h-[300px]">
                      <BarChart data={mixTypeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="volume" fill="#0088FE" name="Volume (m³)" />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="delivery" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Delivery Performance Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[400px]">
                    <BarChart data={deliveryPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar dataKey="onTime" stackId="a" fill="#00C49F" name="On Time" />
                      <Bar dataKey="late" stackId="a" fill="#FFBB28" name="Late" />
                      <Bar dataKey="cancelled" stackId="a" fill="#FF8042" name="Cancelled" />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="quality" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quality Test Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[400px]">
                    <BarChart data={qualityMetricsData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="test" type="category" width={120} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar dataKey="passed" fill="#00C49F" name="Passed" />
                      <Bar dataKey="failed" fill="#FF8042" name="Failed" />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      )}

      {/* Real-time Data Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Real-time Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">98.2%</div>
              <div className="text-sm text-muted-foreground">Plant Efficiency</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">2.1h</div>
              <div className="text-sm text-muted-foreground">Avg Response Time</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">$12.3K</div>
              <div className="text-sm text-muted-foreground">Daily Revenue</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;