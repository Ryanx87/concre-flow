import { supabase } from '@/integrations/supabase/client';
import { aiExtractionService, AIExtractionConfig } from './aiExtractionService';

export interface ExtractedTestData {
  batchNumber?: string;
  orderNumber?: string;
  testDate?: string;
  concreteGrade?: string;
  testAge?: number;
  compressiveStrength?: number;
  targetStrength?: number;
  slumpValue?: number;
  airContent?: number;
  testType?: 'Cube' | 'Cylinder' | 'Slump' | 'Air Content';
  technician?: string;
  labName?: string;
  sampleLocation?: string;
  certificationNumber?: string;
  confidence?: number;
  extractedText?: string;
}

export interface ProcessingResult {
  success: boolean;
  data?: ExtractedTestData;
  error?: string;
  confidence?: number;
  rawText?: string;
}

class PDFProcessingService {
  private readonly API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
  private readonly VISION_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

  /**
   * Extract text from PDF using OCR (simulated - in production would use actual OCR service)
   */
  private async extractTextFromPDF(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Simulate OCR extraction - in production this would use a real OCR service
        // like Tesseract.js, Google Cloud Vision, or AWS Textract
        const simulatedText = `
          CONCRETE TEST CERTIFICATE
          
          Lab Name: ConcreTek Quality Labs
          Certificate No: CTL-2025-001
          
          PROJECT DETAILS:
          Order Number: ORD-001
          Batch Number: BAT-2025-001
          Project: Housing Project A
          
          SAMPLE INFORMATION:
          Date Sampled: 2025-10-01
          Sample Location: Foundation Pour
          Concrete Grade: 25MPa
          
          TEST RESULTS:
          Test Age: 28 days
          Test Date: 2025-10-29
          Compressive Strength: 28.5 MPa
          Target Strength: 25 MPa
          Slump: 100mm
          Air Content: 4.5%
          
          TECHNICIAN: John Smith
          APPROVED BY: Quality Manager
        `;
        
        resolve(simulatedText);
      };
      reader.onerror = () => reject(new Error('Failed to read PDF file'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Use AI to extract structured data from text (enhanced pattern matching)
   */
  private async extractDataWithAI(text: string): Promise<ExtractedTestData> {
    const extractedData: ExtractedTestData = {};
    
    // Enhanced pattern matching with more variations
    const patterns = {
      batchNumber: /(?:Batch\s+(?:Number|No\.?|#):?\s*)([A-Z0-9-]+)/i,
      orderNumber: /(?:Order\s+(?:Number|No\.?|#):?\s*)([A-Z0-9-]+)/i,
      testDate: /(?:Test\s+Date:?\s*)(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4})/i,
      concreteGrade: /(?:Concrete\s+Grade:?\s*)(\d+MPa)/i,
      testAge: /(?:Test\s+Age:?\s*)(\d+)\s*days?/i,
      compressiveStrength: /(?:Compressive\s+Strength:?\s*)(\d+\.?\d*)\s*MPa/i,
      targetStrength: /(?:Target\s+Strength:?\s*)(\d+\.?\d*)\s*MPa/i,
      slumpValue: /(?:Slump:?\s*)(\d+\.?\d*)\s*mm/i,
      airContent: /(?:Air\s+Content:?\s*)(\d+\.?\d*)\s*%/i,
      technician: /(?:Technician:?\s*)([A-Za-z\s]+)(?:\n|$)/i,
      certificationNumber: /(?:Certificate\s+(?:Number|No\.?|#):?\s*)([A-Z0-9-]+)/i
    };

    // Extract data using patterns
    Object.entries(patterns).forEach(([key, pattern]) => {
      const match = text.match(pattern);
      if (match) {
        const value = match[1].trim();
        switch (key) {
          case 'testAge':
          case 'compressiveStrength':
          case 'targetStrength':
          case 'slumpValue':
          case 'airContent': {
            const numValue = parseFloat(value);
            if (!isNaN(numValue)) {
              (extractedData as Record<string, unknown>)[key] = numValue;
            }
            break;
          }
          case 'testDate':
            extractedData.testDate = this.parseDate(value);
            break;
          default:
            (extractedData as Record<string, unknown>)[key] = value;
        }
      }
    });

    // Determine test type based on extracted data
    if (extractedData.compressiveStrength) {
      extractedData.testType = extractedData.testAge === 28 ? 'Cube' : 'Cylinder';
    } else if (extractedData.slumpValue) {
      extractedData.testType = 'Slump';
    } else if (extractedData.airContent) {
      extractedData.testType = 'Air Content';
    }

    // Calculate confidence based on how much data was extracted
    const totalFields = Object.keys(patterns).length;
    const extractedFields = Object.keys(extractedData).length;
    extractedData.confidence = Math.round((extractedFields / totalFields) * 100);
    extractedData.extractedText = text;

    return extractedData;
  }

  /**
   * Parse date from various formats
   */
  private parseDate(dateString: string): string {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      // Try different formats
      const formats = [
        /(\d{1,2})\/(\d{1,2})\/(\d{4})/,  // MM/DD/YYYY or DD/MM/YYYY
        /(\d{4})-(\d{2})-(\d{2})/         // YYYY-MM-DD
      ];
      
      for (const format of formats) {
        const match = dateString.match(format);
        if (match) {
          if (format === formats[0]) {
            // Assume DD/MM/YYYY format
            const [, day, month, year] = match;
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          } else {
            return dateString;
          }
        }
      }
    }
    return date.toISOString().split('T')[0];
  }

  /**
   * Use enhanced AI extraction service
   */
  private async extractWithEnhancedAI(text: string, config: AIExtractionConfig): Promise<ExtractedTestData> {
    return await aiExtractionService.extractData(text, config);
  }

  /**
   * Process PDF file and extract test data with enhanced AI options
   */
  async processPDFDocument(
    file: File, 
    aiConfig?: AIExtractionConfig
  ): Promise<ProcessingResult> {
    try {
      // Validate file type
      if (file.type !== 'application/pdf') {
        return {
          success: false,
          error: 'Please upload a PDF file'
        };
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        return {
          success: false,
          error: 'File size too large. Maximum 10MB allowed.'
        };
      }

      // Extract text from PDF
      const extractedText = await this.extractTextFromPDF(file);
      
      if (!extractedText.trim()) {
        return {
          success: false,
          error: 'No text could be extracted from the PDF'
        };
      }

      // Extract structured data
      let extractedData: ExtractedTestData;
      
      if (aiConfig && aiConfig.provider !== 'local') {
        extractedData = await this.extractWithEnhancedAI(extractedText, aiConfig);
      } else {
        extractedData = await this.extractDataWithAI(extractedText);
      }

      return {
        success: true,
        data: extractedData,
        confidence: extractedData.confidence || 0,
        rawText: extractedText
      };

    } catch (error) {
      console.error('PDF processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Save extracted data to database (mock implementation)
   */
  async saveExtractedData(data: ExtractedTestData, fileName: string): Promise<boolean> {
    try {
      // Mock implementation - in a real app this would save to the database
      // For now, we'll just log the data and return success
      console.log('Saving extracted data:', {
        ...data,
        source_document: fileName,
        created_at: new Date().toISOString(),
        status: data.confidence && data.confidence > 80 ? 'verified' : 'pending_review'
      });
      
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return true;
    } catch (error) {
      console.error('Save error:', error);
      return false;
    }
  }

  /**
   * Validate extracted data completeness
   */
  validateExtractedData(data: ExtractedTestData): { isValid: boolean; missingFields: string[] } {
    const requiredFields = ['batchNumber', 'testDate', 'concreteGrade', 'compressiveStrength'];
    const missingFields: string[] = [];

    requiredFields.forEach(field => {
      if (!data[field as keyof ExtractedTestData]) {
        missingFields.push(field);
      }
    });

    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  }
}

export const pdfProcessingService = new PDFProcessingService();