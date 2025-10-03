import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface DocumentUploadProps {
  onDataExtracted?: (data: any) => void;
  onError?: (error: string) => void;
}

export const DocumentUpload = ({ onDataExtracted, onError }: DocumentUploadProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Document Upload
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Upload className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">PDF Upload Feature</h3>
          <p className="text-muted-foreground mb-4">
            Advanced PDF processing and AI extraction capabilities coming soon.
          </p>
          <Button variant="outline" onClick={() => onError?.('Feature coming soon')}>
            Select Files
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};