import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Brain, FileText, Zap, Settings, CheckCircle, AlertTriangle, Code, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthenticatedRoute } from '@/components/auth/ProtectedRoute';
import { DocumentUpload } from '@/components/ui/DocumentUpload';
import { ExtractedTestData } from '@/services/pdfProcessingService';
import { aiExtractionService } from '@/services/aiExtractionService';

const AIDocumentDemo = () => {
  const navigate = useNavigate();
  const [extractedData, setExtractedData] = useState<ExtractedTestData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [demoText, setDemoText] = useState('');

  const sampleCertificate = `CONCRETE TEST CERTIFICATE

Lab Name: ConcreTek Quality Labs
Certificate No: CTL-2025-001

PROJECT DETAILS:
Order Number: ORD-001
Batch Number: BAT-2025-001
Project: Housing Project A

SAMPLE INFORMATION:
Date Sampled: 2025-10-01
Concrete Grade: 25MPa

TEST RESULTS:
Test Age: 28 days
Test Date: 2025-10-29
Compressive Strength: 28.5 MPa
Target Strength: 25 MPa
Slump: 100mm
Air Content: 4.5%

TECHNICIAN: John Smith
APPROVED BY: Quality Manager`;

  const handleExtractedData = (data: ExtractedTestData) => {
    setExtractedData(data);
    setError(null);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setExtractedData(null);
  };

  const runTextDemo = async () => {
    try {
      const textToProcess = demoText || sampleCertificate;
      const result = await aiExtractionService.extractData(textToProcess, { provider: 'local' });
      setExtractedData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Demo extraction failed');
      setExtractedData(null);
    }
  };

  const features = [
    {
      icon: Brain,
      title: 'Multi-Provider AI Support',
      description: 'Supports OpenAI GPT-4, Anthropic Claude, Google Gemini, and local pattern matching',
      color: 'text-blue-600'
    },
    {
      icon: FileText,
      title: 'PDF Text Extraction',
      description: 'Automatically extracts text from PDF documents using OCR technology',
      color: 'text-green-600'
    },
    {
      icon: Zap,
      title: 'Smart Data Validation',
      description: 'Validates extracted data for accuracy and completeness with confidence scoring',
      color: 'text-orange-600'
    },
    {
      icon: Settings,
      title: 'Configurable Processing',
      description: 'Customizable AI models, temperature settings, and fallback mechanisms',
      color: 'text-purple-600'
    }
  ];

  const extractedFields = [
    { key: 'batchNumber', label: 'Batch Number' },
    { key: 'orderNumber', label: 'Order Number' },
    { key: 'testDate', label: 'Test Date' },
    { key: 'concreteGrade', label: 'Concrete Grade' },
    { key: 'testAge', label: 'Test Age (days)' },
    { key: 'compressiveStrength', label: 'Compressive Strength (MPa)' },
    { key: 'targetStrength', label: 'Target Strength (MPa)' },
    { key: 'slumpValue', label: 'Slump (mm)' },
    { key: 'airContent', label: 'Air Content (%)' },
    { key: 'testType', label: 'Test Type' },
    { key: 'technician', label: 'Technician' },
    { key: 'certificationNumber', label: 'Certificate Number' }
  ];

  return (
    <AuthenticatedRoute>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => navigate('/quality')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Quality Control
              </Button>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <Brain className="w-8 h-8 text-blue-600" />
                  AI Document Processing Demo
                </h1>
                <p className="text-muted-foreground">
                  Experience AI-powered PDF test certificate data extraction
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {features.map((feature, index) => (
              <Card key={index}>
                <CardContent className="p-6 text-center">
                  <feature.icon className={`w-12 h-12 mx-auto mb-4 ${feature.color}`} />
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="upload" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload">PDF Upload Demo</TabsTrigger>
              <TabsTrigger value="text">Text Extraction Demo</TabsTrigger>
              <TabsTrigger value="results">Extraction Results</TabsTrigger>
            </TabsList>

            <TabsContent value="upload">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    PDF Document Processing
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Upload PDF test certificates to see AI extraction in action
                  </p>
                </CardHeader>
                <CardContent>
                  <DocumentUpload 
                    onDataExtracted={handleExtractedData}
                    onError={handleError}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="text">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    Text Extraction Demo
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Test the AI extraction with sample certificate text
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">Certificate Text</label>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setDemoText(sampleCertificate)}
                      >
                        Load Sample
                      </Button>
                    </div>
                    <textarea
                      className="w-full h-64 p-3 border rounded-md text-sm font-mono"
                      value={demoText}
                      onChange={(e) => setDemoText(e.target.value)}
                      placeholder="Paste concrete test certificate text here..."
                    />
                  </div>
                  <Button onClick={runTextDemo} className="w-full">
                    <Brain className="w-4 h-4 mr-2" />
                    Extract Data from Text
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="results">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Extraction Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 text-red-800">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="font-medium">Error</span>
                      </div>
                      <p className="text-red-700 mt-1">{error}</p>
                    </div>
                  )}

                  {extractedData ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {extractedFields.map(({ key, label }) => {
                          const value = extractedData[key as keyof ExtractedTestData];
                          return (
                            <div key={key} className="p-4 border rounded-lg">
                              <label className="text-sm font-medium text-muted-foreground block mb-1">
                                {label}
                              </label>
                              <div className="font-medium">
                                {value ? (
                                  <span className="text-green-600">{value.toString()}</span>
                                ) : (
                                  <span className="text-gray-400 italic">Not extracted</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No extraction results yet</p>
                      <p className="text-sm">Upload a PDF or run the text demo to see results</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthenticatedRoute>
  );
};

export default AIDocumentDemo;