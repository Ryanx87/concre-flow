import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Calendar, Clock, CheckCircle, AlertTriangle, FileText, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthenticatedRoute } from '@/components/auth/ProtectedRoute';

interface BatchSchedule {
  id: string;
  orderNumber: string;
  customerName: string;
  concreteGrade: string;
  volume: number;
  scheduledTime: string;
  estimatedDuration: number;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Delayed';
  priority: 'Low' | 'Medium' | 'High';
  specialRequirements?: string;
  assignedTruck?: string;
}

const BatchingSchedule = () => {
  const navigate = useNavigate();
  const [showNewBatchForm, setShowNewBatchForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [newBatch, setNewBatch] = useState({
    orderNumber: '',
    customerName: '',
    concreteGrade: '',
    volume: '',
    scheduledTime: '',
    priority: 'Medium',
    specialRequirements: ''
  });

  // Mock batching schedule data
  const [batchSchedule] = useState<BatchSchedule[]>([
    {
      id: '1',
      orderNumber: 'ORD-001',
      customerName: 'Housing Project A',
      concreteGrade: '25MPa',
      volume: 30,
      scheduledTime: '2025-10-03T06:00:00',
      estimatedDuration: 45,
      status: 'Completed',
      priority: 'High',
      assignedTruck: 'TRK-001'
    },
    {
      id: '2',
      orderNumber: 'ORD-002',
      customerName: 'Commercial Complex',
      concreteGrade: '30MPa',
      volume: 45,
      scheduledTime: '2025-10-03T08:00:00',
      estimatedDuration: 60,
      status: 'In Progress',
      priority: 'Medium',
      assignedTruck: 'TRK-002'
    },
    {
      id: '3',
      orderNumber: 'ORD-003',
      customerName: 'Bridge Construction',
      concreteGrade: '35MPa',
      volume: 25,
      scheduledTime: '2025-10-03T10:00:00',
      estimatedDuration: 50,
      status: 'Scheduled',
      priority: 'Low',
      specialRequirements: 'High strength mix with special admixtures'
    },
    {
      id: '4',
      orderNumber: 'ORD-004',
      customerName: 'Road Extension',
      concreteGrade: '20MPa',
      volume: 60,
      scheduledTime: '2025-10-03T12:00:00',
      estimatedDuration: 75,
      status: 'Scheduled',
      priority: 'High'
    },
    {
      id: '5',
      orderNumber: 'ORD-005',
      customerName: 'Shopping Mall',
      concreteGrade: '30MPa',
      volume: 40,
      scheduledTime: '2025-10-03T14:00:00',
      estimatedDuration: 55,
      status: 'Delayed',
      priority: 'Medium',
      specialRequirements: 'Weather-dependent pour'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Scheduled': return 'bg-gray-100 text-gray-800';
      case 'Delayed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'In Progress': return <Clock className="w-4 h-4 text-blue-600" />;
      case 'Scheduled': return <Calendar className="w-4 h-4 text-gray-600" />;
      case 'Delayed': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const filteredBatches = batchSchedule.filter(batch => {
    const batchDate = new Date(batch.scheduledTime).toISOString().split('T')[0];
    return batchDate === selectedDate;
  });

  const handleScheduleBatch = () => {
    if (!newBatch.orderNumber || !newBatch.customerName || !newBatch.concreteGrade || !newBatch.volume || !newBatch.scheduledTime) {
      alert('Please fill in all required fields');
      return;
    }

    // In a real app, this would make an API call
    console.log('Scheduling new batch:', newBatch);
    alert('Batch scheduled successfully!');
    setShowNewBatchForm(false);
    setNewBatch({
      orderNumber: '',
      customerName: '',
      concreteGrade: '',
      volume: '',
      scheduledTime: '',
      priority: 'Medium',
      specialRequirements: ''
    });
  };

  const handleUpdateStatus = (batchId: string, newStatus: string) => {
    console.log(`Updating batch ${batchId} status to ${newStatus}`);
    alert(`Batch ${batchId} status updated to ${newStatus}`);
  };

  const handleExportSchedule = () => {
    // In a real app, this would generate and download a file
    alert('Schedule exported successfully!');
  };

  const calculateEndTime = (startTime: string, duration: number) => {
    const start = new Date(startTime);
    const end = new Date(start.getTime() + duration * 60000);
    return end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getTotalVolume = () => {
    return filteredBatches.reduce((total, batch) => total + batch.volume, 0);
  };

  const getTotalDuration = () => {
    return filteredBatches.reduce((total, batch) => total + batch.estimatedDuration, 0);
  };

  return (
    <AuthenticatedRoute>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Batching Schedule</h1>
                <p className="text-muted-foreground">Plan and monitor concrete production schedule</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportSchedule}>
                <Download className="w-4 h-4 mr-2" />
                Export Schedule
              </Button>
              <Button onClick={() => setShowNewBatchForm(true)}>
                <Calendar className="w-4 h-4 mr-2" />
                Schedule New Batch
              </Button>
            </div>
          </div>

          {/* Date Selector and Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Select Date</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Batches
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600">{filteredBatches.length}</p>
                <p className="text-sm text-muted-foreground">Scheduled for {new Date(selectedDate).toLocaleDateString()}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">{getTotalVolume()}m³</p>
                <p className="text-sm text-muted-foreground">Concrete to produce</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Duration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-orange-600">{Math.round(getTotalDuration() / 60)}h {getTotalDuration() % 60}m</p>
                <p className="text-sm text-muted-foreground">Estimated time</p>
              </CardContent>
            </Card>
          </div>

          {/* Schedule Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Production Schedule - {new Date(selectedDate).toLocaleDateString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredBatches.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No batches scheduled for this date</p>
                  <Button 
                    className="mt-4" 
                    onClick={() => setShowNewBatchForm(true)}
                  >
                    Schedule First Batch
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredBatches
                    .sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime())
                    .map((batch, index) => (
                    <div key={batch.id} className="flex items-center gap-4 p-4 rounded-lg border bg-muted/30">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="text-center">
                          <p className="text-lg font-bold text-primary">
                            {new Date(batch.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            - {calculateEndTime(batch.scheduledTime, batch.estimatedDuration)}
                          </p>
                        </div>
                        <div className="w-0.5 h-12 bg-border mx-2" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {getStatusIcon(batch.status)}
                            <span className="font-medium">{batch.orderNumber}</span>
                            <Badge className={getPriorityColor(batch.priority)}>
                              {batch.priority}
                            </Badge>
                            <Badge className={getStatusColor(batch.status)}>
                              {batch.status}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium">{batch.customerName}</p>
                          <p className="text-sm text-muted-foreground">
                            {batch.volume}m³ • {batch.concreteGrade} • {batch.estimatedDuration}min
                          </p>
                          {batch.specialRequirements && (
                            <p className="text-xs text-orange-600 mt-1">
                              ⚠️ {batch.specialRequirements}
                            </p>
                          )}
                          {batch.assignedTruck && (
                            <p className="text-xs text-blue-600 mt-1">
                              🚛 Assigned: {batch.assignedTruck}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {batch.status === 'Scheduled' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleUpdateStatus(batch.id, 'In Progress')}
                            >
                              Start
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => alert(`Edit batch ${batch.id}`)}
                            >
                              Edit
                            </Button>
                          </>
                        )}
                        {batch.status === 'In Progress' && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleUpdateStatus(batch.id, 'Completed')}
                          >
                            Complete
                          </Button>
                        )}
                        {batch.status === 'Delayed' && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleUpdateStatus(batch.id, 'Scheduled')}
                          >
                            Reschedule
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Schedule New Batch Form */}
          {showNewBatchForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CardHeader>
                  <CardTitle>Schedule New Batch</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="orderNumber">Order Number *</Label>
                      <Input
                        id="orderNumber"
                        placeholder="ORD-001"
                        value={newBatch.orderNumber}
                        onChange={(e) => setNewBatch({...newBatch, orderNumber: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="customerName">Customer/Project *</Label>
                      <Input
                        id="customerName"
                        placeholder="Housing Project A"
                        value={newBatch.customerName}
                        onChange={(e) => setNewBatch({...newBatch, customerName: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="concreteGrade">Concrete Grade *</Label>
                      <Select value={newBatch.concreteGrade} onValueChange={(value) => setNewBatch({...newBatch, concreteGrade: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select grade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10MPa">10MPa</SelectItem>
                          <SelectItem value="15MPa">15MPa</SelectItem>
                          <SelectItem value="20MPa">20MPa</SelectItem>
                          <SelectItem value="25MPa">25MPa</SelectItem>
                          <SelectItem value="30MPa">30MPa</SelectItem>
                          <SelectItem value="35MPa">35MPa</SelectItem>
                          <SelectItem value="40MPa">40MPa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="volume">Volume (m³) *</Label>
                      <Input
                        id="volume"
                        type="number"
                        placeholder="30"
                        value={newBatch.volume}
                        onChange={(e) => setNewBatch({...newBatch, volume: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={newBatch.priority} onValueChange={(value) => setNewBatch({...newBatch, priority: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="scheduledTime">Scheduled Time *</Label>
                    <Input
                      id="scheduledTime"
                      type="datetime-local"
                      value={newBatch.scheduledTime}
                      onChange={(e) => setNewBatch({...newBatch, scheduledTime: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="specialRequirements">Special Requirements</Label>
                    <Textarea
                      id="specialRequirements"
                      placeholder="Any special mix requirements, weather considerations, etc."
                      value={newBatch.specialRequirements}
                      onChange={(e) => setNewBatch({...newBatch, specialRequirements: e.target.value})}
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleScheduleBatch} className="flex-1">
                      Schedule Batch
                    </Button>
                    <Button variant="outline" onClick={() => setShowNewBatchForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </AuthenticatedRoute>
  );
};

export default BatchingSchedule;