import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, TestTube, FileText, Download, CheckCircle, AlertTriangle, Plus, Calendar, Target, Upload, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AdminRoute } from '@/components/auth/ProtectedRoute';
import { DocumentUpload } from '@/components/ui/DocumentUpload';
import { ExtractedTestData } from '@/services/pdfProcessingService';

interface TestRecord {
  id: string;
  batchNumber: string;
  orderNumber: string;
  testDate: string;
  concreteGrade: string;
  testAge: number; // days
  compressiveStrength: number; // MPa
  targetStrength: number; // MPa
  status: 'Pass' | 'Fail' | 'Pending';
  testType: 'Cube' | 'Cylinder' | 'Slump' | 'Air Content';
  technician: string;
  notes?: string;
}

interface COA {
  id: string;
  orderNumber: string;
  customerName: string;
  concreteGrade: string;
  volume: number;
  issueDate: string;
  status: 'Generated' | 'Sent' | 'Approved';
  testResults: string[];
}

const QualityControl = () => {
  const navigate = useNavigate();
  const [showNewTestForm, setShowNewTestForm] = useState(false);
  const [showNewCOAForm, setShowNewCOAForm] = useState(false);
  const [selectedTab, setSelectedTab] = useState('tests');
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [newTest, setNewTest] = useState({
    batchNumber: '',
    orderNumber: '',
    concreteGrade: '',
    testType: 'Cube',
    compressiveStrength: '',
    testAge: '28',
    technician: '',
    notes: ''
  });

  // Mock test records
  const [testRecords] = useState<TestRecord[]>([
    {
      id: '1',
      batchNumber: 'BAT-2025-001',
      orderNumber: 'ORD-001',
      testDate: '2025-10-01',
      concreteGrade: '25MPa',
      testAge: 28,
      compressiveStrength: 28.5,
      targetStrength: 25,
      status: 'Pass',
      testType: 'Cube',
      technician: 'John Smith'
    },
    {
      id: '2',
      batchNumber: 'BAT-2025-002',
      orderNumber: 'ORD-002',
      testDate: '2025-10-02',
      concreteGrade: '30MPa',
      testAge: 7,
      compressiveStrength: 22.1,
      targetStrength: 21,
      status: 'Pass',
      testType: 'Cube',
      technician: 'Sarah Wilson'
    },
    {
      id: '3',
      batchNumber: 'BAT-2025-003',
      orderNumber: 'ORD-003',
      testDate: '2025-10-03',
      concreteGrade: '35MPa',
      testAge: 28,
      compressiveStrength: 32.8,
      targetStrength: 35,
      status: 'Fail',
      testType: 'Cube',
      technician: 'Mike Johnson',
      notes: 'Strength below specification, investigate mix design'
    },
    {
      id: '4',
      batchNumber: 'BAT-2025-004',
      orderNumber: 'ORD-004',
      testDate: '2025-10-03',
      concreteGrade: '20MPa',
      testAge: 28,
      compressiveStrength: 23.2,
      targetStrength: 20,
      status: 'Pass',
      testType: 'Cube',
      technician: 'John Smith'
    }
  ]);

  // Mock COA records
  const [coaRecords] = useState<COA[]>([
    {
      id: 'COA-001',
      orderNumber: 'ORD-001',
      customerName: 'Housing Project A',
      concreteGrade: '25MPa',
      volume: 30,
      issueDate: '2025-10-01',
      status: 'Sent',
      testResults: ['28-day cube test: 28.5MPa', 'Slump test: 100mm']
    },
    {
      id: 'COA-002',
      orderNumber: 'ORD-002',
      customerName: 'Commercial Complex',
      concreteGrade: '30MPa',
      volume: 45,
      issueDate: '2025-10-02',
      status: 'Generated',
      testResults: ['7-day cube test: 22.1MPa']
    },
    {
      id: 'COA-003',
      orderNumber: 'ORD-004',
      customerName: 'Road Extension',
      concreteGrade: '20MPa',
      volume: 60,
      issueDate: '2025-10-03',
      status: 'Approved',
      testResults: ['28-day cube test: 23.2MPa', 'Air content: 4.5%']
    }
  ]);

  const getTestStatusColor = (status: string) => {
    switch (status) {
      case 'Pass': return 'bg-green-100 text-green-800';
      case 'Fail': return 'bg-red-100 text-red-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCOAStatusColor = (status: string) => {
    switch (status) {
      case 'Generated': return 'bg-blue-100 text-blue-800';
      case 'Sent': return 'bg-green-100 text-green-800';
      case 'Approved': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSubmitTest = () => {
    if (!newTest.batchNumber || !newTest.orderNumber || !newTest.concreteGrade || !newTest.compressiveStrength) {
      alert('Please fill in all required fields');
      return;
    }

    console.log('Submitting new test:', newTest);
    alert('Test record added successfully!');
    setShowNewTestForm(false);
    setNewTest({
      batchNumber: '',
      orderNumber: '',
      concreteGrade: '',
      testType: 'Cube',
      compressiveStrength: '',
      testAge: '28',
      technician: '',
      notes: ''
    });
  };

  const handleGenerateCOA = (orderNumber: string) => {
    console.log(`Generating COA for order ${orderNumber}`);
    alert(`COA generated for order ${orderNumber}`);
  };

  const handleDownloadCOA = (coaId: string) => {
    console.log(`Downloading COA ${coaId}`);
    alert(`Downloading COA ${coaId}...`);
  };

  const calculatePassRate = () => {
    const totalTests = testRecords.length;
    const passedTests = testRecords.filter(test => test.status === 'Pass').length;
    return totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : '0';
  };

  const getAverageStrength = (grade: string) => {
    const gradeTests = testRecords.filter(test => test.concreteGrade === grade && test.testAge === 28);
    if (gradeTests.length === 0) return 0;
    const totalStrength = gradeTests.reduce((sum, test) => sum + test.compressiveStrength, 0);
    return (totalStrength / gradeTests.length).toFixed(1);
  };

  const handleExtractedData = (data: ExtractedTestData) => {
    // Auto-populate form with extracted data
    setNewTest({
      batchNumber: data.batchNumber || '',
      orderNumber: data.orderNumber || '',
      concreteGrade: data.concreteGrade || '',
      testType: data.testType || 'Cube',
      compressiveStrength: data.compressiveStrength?.toString() || '',
      testAge: data.testAge?.toString() || '28',
      technician: data.technician || '',
      notes: `Imported from PDF: ${data.certificationNumber || 'Unknown'}. Confidence: ${data.confidence?.toFixed(0) || 0}%`
    });
    setShowNewTestForm(true);
    setShowDocumentUpload(false);
  };

  const handleUploadError = (error: string) => {
    alert('Upload Error: ' + error);
  };

  return (
    <AdminRoute>
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
                <h1 className="text-3xl font-bold">Quality Control</h1>
                <p className="text-muted-foreground">Manage concrete testing and certificates of analysis</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/ai-demo')}>
                <Brain className="w-4 h-4 mr-2" />
                AI Demo
              </Button>
            </div>
          </div>

          {/* Quality Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  Pass Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">{calculatePassRate()}%</p>
                <p className="text-sm text-muted-foreground">Tests passed this month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TestTube className="w-5 h-5 text-blue-600" />
                  Total Tests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600">{testRecords.length}</p>
                <p className="text-sm text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  COAs Generated
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-purple-600">{coaRecords.length}</p>
                <p className="text-sm text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Failed Tests</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-red-600">{testRecords.filter(t => t.status === 'Fail').length}</p>
                <p className="text-sm text-muted-foreground">Require investigation</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="tests">Cube Tests</TabsTrigger>
              <TabsTrigger value="coa">Certificates of Analysis</TabsTrigger>
              <TabsTrigger value="upload">AI Document Upload</TabsTrigger>
            </TabsList>

            <TabsContent value="tests" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <TestTube className="w-5 h-5" />
                    Test Records
                  </CardTitle>
                  <Button onClick={() => setShowNewTestForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Test Result
                  </Button>
                  <Button variant="outline" onClick={() => setShowDocumentUpload(true)}>
                    <Upload className="w-4 h-4 mr-2" />
                    Import from PDF
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Test Date</TableHead>
                          <TableHead>Batch Number</TableHead>
                          <TableHead>Order</TableHead>
                          <TableHead>Grade</TableHead>
                          <TableHead>Test Age</TableHead>
                          <TableHead>Strength (MPa)</TableHead>
                          <TableHead>Target (MPa)</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Technician</TableHead>
                          <TableHead>Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {testRecords.map((test) => (
                          <TableRow key={test.id}>
                            <TableCell>{new Date(test.testDate).toLocaleDateString()}</TableCell>
                            <TableCell className="font-mono text-sm">{test.batchNumber}</TableCell>
                            <TableCell>{test.orderNumber}</TableCell>
                            <TableCell>{test.concreteGrade}</TableCell>
                            <TableCell>{test.testAge} days</TableCell>
                            <TableCell className="font-bold">{test.compressiveStrength}</TableCell>
                            <TableCell>{test.targetStrength}</TableCell>
                            <TableCell>
                              <Badge className={getTestStatusColor(test.status)}>
                                {test.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{test.technician}</TableCell>
                            <TableCell>
                              {test.notes && (
                                <span className="text-sm text-muted-foreground" title={test.notes}>
                                  {test.notes.length > 30 ? `${test.notes.substring(0, 30)}...` : test.notes}
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="coa" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Certificates of Analysis
                  </CardTitle>
                  <Button onClick={() => setShowNewCOAForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Generate COA
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>COA ID</TableHead>
                          <TableHead>Order Number</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Grade</TableHead>
                          <TableHead>Volume (m³)</TableHead>
                          <TableHead>Issue Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {coaRecords.map((coa) => (
                          <TableRow key={coa.id}>
                            <TableCell className="font-mono text-sm">{coa.id}</TableCell>
                            <TableCell>{coa.orderNumber}</TableCell>
                            <TableCell>{coa.customerName}</TableCell>
                            <TableCell>{coa.concreteGrade}</TableCell>
                            <TableCell>{coa.volume}</TableCell>
                            <TableCell>{new Date(coa.issueDate).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Badge className={getCOAStatusColor(coa.status)}>
                                {coa.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDownloadCOA(coa.id)}
                                >
                                  <Download className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => alert(`View details for ${coa.id}`)}
                                >
                                  View
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="upload" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-blue-600" />
                    AI-Powered PDF Processing
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Upload PDF test certificates to automatically extract and import test data using AI technology.
                  </p>
                </CardHeader>
                <CardContent>
                  <DocumentUpload 
                    onDataExtracted={handleExtractedData}
                    onError={handleUploadError}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Document Upload Modal */}
          {showDocumentUpload && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-blue-600" />
                    AI Document Processing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DocumentUpload 
                    onDataExtracted={handleExtractedData}
                    onError={handleUploadError}
                  />
                  <div className="flex justify-end mt-4">
                    <Button variant="outline" onClick={() => setShowDocumentUpload(false)}>
                      Close
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Add Test Form */}
          {showNewTestForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CardHeader>
                  <CardTitle>Add Test Result</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="batchNumber">Batch Number *</Label>
                      <Input
                        id="batchNumber"
                        placeholder="BAT-2025-001"
                        value={newTest.batchNumber}
                        onChange={(e) => setNewTest({...newTest, batchNumber: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="orderNumber">Order Number *</Label>
                      <Input
                        id="orderNumber"
                        placeholder="ORD-001"
                        value={newTest.orderNumber}
                        onChange={(e) => setNewTest({...newTest, orderNumber: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="concreteGrade">Concrete Grade *</Label>
                      <Select value={newTest.concreteGrade} onValueChange={(value) => setNewTest({...newTest, concreteGrade: value})}>
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
                      <Label htmlFor="testType">Test Type</Label>
                      <Select value={newTest.testType} onValueChange={(value) => setNewTest({...newTest, testType: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Cube">Cube Test</SelectItem>
                          <SelectItem value="Cylinder">Cylinder Test</SelectItem>
                          <SelectItem value="Slump">Slump Test</SelectItem>
                          <SelectItem value="Air Content">Air Content</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="testAge">Test Age (days)</Label>
                      <Select value={newTest.testAge} onValueChange={(value) => setNewTest({...newTest, testAge: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7">7 days</SelectItem>
                          <SelectItem value="28">28 days</SelectItem>
                          <SelectItem value="56">56 days</SelectItem>
                          <SelectItem value="90">90 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="compressiveStrength">Compressive Strength (MPa) *</Label>
                      <Input
                        id="compressiveStrength"
                        type="number"
                        step="0.1"
                        placeholder="28.5"
                        value={newTest.compressiveStrength}
                        onChange={(e) => setNewTest({...newTest, compressiveStrength: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="technician">Technician</Label>
                      <Input
                        id="technician"
                        placeholder="John Smith"
                        value={newTest.technician}
                        onChange={(e) => setNewTest({...newTest, technician: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any additional observations or comments..."
                      value={newTest.notes}
                      onChange={(e) => setNewTest({...newTest, notes: e.target.value})}
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSubmitTest} className="flex-1">
                      Add Test Result
                    </Button>
                    <Button variant="outline" onClick={() => setShowNewTestForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </AdminRoute>
  );
};

export default QualityControl;