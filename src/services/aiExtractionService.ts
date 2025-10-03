import { ExtractedTestData } from './pdfProcessingService';

export interface AIProvider {
  name: string;
  apiEndpoint: string;
  requiresApiKey: boolean;
  supportedFormats: string[];
}

export interface AIExtractionConfig {
  provider: 'openai' | 'claude' | 'gemini' | 'local';
  apiKey?: string;
  modelName?: string;
  temperature?: number;
  maxTokens?: number;
}

class AIExtractionService {
  private readonly providers: Record<string, AIProvider> = {
    openai: {
      name: 'OpenAI GPT-4',
      apiEndpoint: 'https://api.openai.com/v1/chat/completions',
      requiresApiKey: true,
      supportedFormats: ['text', 'image']
    },
    claude: {
      name: 'Anthropic Claude',
      apiEndpoint: 'https://api.anthropic.com/v1/messages',
      requiresApiKey: true,
      supportedFormats: ['text']
    },
    gemini: {
      name: 'Google Gemini',
      apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
      requiresApiKey: true,
      supportedFormats: ['text', 'image']
    },
    local: {
      name: 'Local Pattern Matching',
      apiEndpoint: '',
      requiresApiKey: false,
      supportedFormats: ['text']
    }
  };

  /**
   * Extract data using local pattern matching (fallback)
   */
  private async extractWithLocal(text: string): Promise<ExtractedTestData> {
    const extractedData: ExtractedTestData = {};
    
    // Enhanced pattern matching with more variations
    const patterns = {
      batchNumber: [
        /(?:Batch\s+(?:Number|No\.?|#):?\s*)([A-Z0-9-]+)/i,
        /(?:Mix\s+(?:Number|No\.?|#):?\s*)([A-Z0-9-]+)/i,
        /(?:Sample\s+(?:ID|Number|No\.?|#):?\s*)([A-Z0-9-]+)/i
      ],
      orderNumber: [
        /(?:Order\s+(?:Number|No\.?|#):?\s*)([A-Z0-9-]+)/i,
        /(?:Job\s+(?:Number|No\.?|#):?\s*)([A-Z0-9-]+)/i,
        /(?:Project\s+(?:Number|No\.?|#):?\s*)([A-Z0-9-]+)/i
      ],
      testDate: [
        /(?:Test\s+Date:?\s*)(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}-\d{1,2}-\d{4})/i,
        /(?:Date\s+Tested:?\s*)(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}-\d{1,2}-\d{4})/i,
        /(?:Report\s+Date:?\s*)(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}-\d{1,2}-\d{4})/i
      ],
      concreteGrade: [
        /(?:Concrete\s+Grade:?\s*)(\d+\.?\d*\s*MPa)/i,
        /(?:Grade:?\s*)(\d+\.?\d*\s*MPa)/i,
        /(?:Strength\s+Class:?\s*)(\d+\.?\d*\s*MPa)/i,
        /(?:Design\s+Strength:?\s*)(\d+\.?\d*\s*MPa)/i
      ],
      testAge: [
        /(?:Test\s+Age:?\s*)(\d+)\s*days?/i,
        /(?:Age\s+at\s+Test:?\s*)(\d+)\s*days?/i,
        /(?:(\d+)\s*day\s+strength)/i
      ],
      compressiveStrength: [
        /(?:Compressive\s+Strength:?\s*)(\d+\.?\d*)\s*MPa/i,
        /(?:Strength:?\s*)(\d+\.?\d*)\s*MPa/i,
        /(?:fc:?\s*)(\d+\.?\d*)\s*MPa/i,
        /(?:Result:?\s*)(\d+\.?\d*)\s*MPa/i
      ],
      targetStrength: [
        /(?:Target\s+Strength:?\s*)(\d+\.?\d*)\s*MPa/i,
        /(?:Required\s+Strength:?\s*)(\d+\.?\d*)\s*MPa/i,
        /(?:Design\s+Strength:?\s*)(\d+\.?\d*)\s*MPa/i,
        /(?:Specified\s+Strength:?\s*)(\d+\.?\d*)\s*MPa/i
      ],
      slumpValue: [
        /(?:Slump:?\s*)(\d+\.?\d*)\s*mm/i,
        /(?:Consistency:?\s*)(\d+\.?\d*)\s*mm/i,
        /(?:Workability:?\s*)(\d+\.?\d*)\s*mm/i
      ],
      airContent: [
        /(?:Air\s+Content:?\s*)(\d+\.?\d*)\s*%/i,
        /(?:Entrained\s+Air:?\s*)(\d+\.?\d*)\s*%/i,
        /(?:Air\s+Void:?\s*)(\d+\.?\d*)\s*%/i
      ],
      technician: [
        /(?:Technician:?\s*)([A-Za-z\s\.\-]+)(?:\n|Approved|$)/i,
        /(?:Tested\s+by:?\s*)([A-Za-z\s\.\-]+)(?:\n|Approved|$)/i,
        /(?:Operator:?\s*)([A-Za-z\s\.\-]+)(?:\n|Approved|$)/i
      ],
      certificationNumber: [
        /(?:Certificate\s+(?:Number|No\.?|#):?\s*)([A-Z0-9-]+)/i,
        /(?:Report\s+(?:Number|No\.?|#):?\s*)([A-Z0-9-]+)/i,
        /(?:Lab\s+(?:Number|No\.?|#):?\s*)([A-Z0-9-]+)/i
      ]
    };

    // Extract data using multiple patterns
    Object.entries(patterns).forEach(([key, patternArray]) => {
      for (const pattern of patternArray) {
        const match = text.match(pattern);
        if (match && match[1]) {
          const value = match[1].trim();
          switch (key) {
            case 'testAge':
            case 'compressiveStrength':
            case 'targetStrength':
            case 'slumpValue':
            case 'airContent':
              const numValue = parseFloat(value);
              if (!isNaN(numValue)) {
                (extractedData as Record<string, unknown>)[key] = numValue;
              }
              break;
            case 'testDate':
              extractedData.testDate = this.parseDate(value);
              break;
            case 'concreteGrade':
              extractedData.concreteGrade = value.replace(/\s+/g, '');
              break;
            default:
              (extractedData as Record<string, unknown>)[key] = value;
          }
          break;
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

    // Calculate confidence based on extracted fields
    const totalFields = Object.keys(patterns).length;
    const extractedFields = Object.keys(extractedData).filter(key => extractedData[key as keyof ExtractedTestData]).length;
    extractedData.confidence = Math.round((extractedFields / totalFields) * 100);
    extractedData.extractedText = text;

    return extractedData;
  }

  /**
   * Parse date from various formats
   */
  private parseDate(dateString: string): string {
    const formats = [
      /(\d{4})-(\d{2})-(\d{2})/,
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
      /(\d{1,2})-(\d{1,2})-(\d{4})/,
      /(\d{1,2})\.(\d{1,2})\.(\d{4})/
    ];
    
    for (const format of formats) {
      const match = dateString.match(format);
      if (match) {
        if (format === formats[0]) {
          return dateString;
        } else {
          const [, day, month, year] = match;
          return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
      }
    }
    
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    
    return dateString;
  }

  /**
   * Main extraction method
   */
  async extractData(text: string, config: AIExtractionConfig): Promise<ExtractedTestData> {
    try {
      switch (config.provider) {
        case 'local':
        default:
          return await this.extractWithLocal(text);
      }
    } catch (error) {
      console.error(`AI extraction failed with ${config.provider}:`, error);
      return await this.extractWithLocal(text);
    }
  }

  /**
   * Get available providers
   */
  getProviders(): Record<string, AIProvider> {
    return this.providers;
  }

  /**
   * Check if provider is available
   */
  isProviderAvailable(provider: string, apiKey?: string): boolean {
    const providerConfig = this.providers[provider];
    if (!providerConfig) return false;
    if (providerConfig.requiresApiKey && !apiKey) return false;
    return true;
  }
}

export const aiExtractionService = new AIExtractionService();