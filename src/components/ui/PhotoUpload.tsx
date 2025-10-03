import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Camera, 
  Upload, 
  X, 
  MapPin, 
  Tag, 
  FileImage, 
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { photoService, PhotoMetadata, UploadProgress } from '@/services/photoService';

interface PhotoUploadProps {
  onUploadComplete?: (photos: PhotoMetadata[]) => void;
  maxPhotos?: number;
  siteId?: string;
  orderId?: string;
  className?: string;
}

export const PhotoUpload = ({ 
  onUploadComplete, 
  maxPhotos = 10, 
  siteId, 
  orderId,
  className 
}: PhotoUploadProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [photos, setPhotos] = useState<PhotoMetadata[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [descriptions, setDescriptions] = useState<{ [key: string]: string }>({});
  const [tags, setTags] = useState<{ [key: string]: string[] }>({});

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Validate file count
    if (photos.length + files.length > maxPhotos) {
      toast({
        variant: 'destructive',
        title: 'Too Many Photos',
        description: `Maximum ${maxPhotos} photos allowed`,
      });
      return;
    }

    // Validate each file
    const validFiles: File[] = [];
    for (const file of files) {
      const validation = photoService.validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        toast({
          variant: 'destructive',
          title: 'Invalid File',
          description: `${file.name}: ${validation.error}`,
        });
      }
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress({ loaded: 0, total: 100, percentage: 0 });

    const uploadedPhotos: PhotoMetadata[] = [];

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const fileKey = `${file.name}-${i}`;
        
        // Update progress
        const progress = ((i + 1) / selectedFiles.length) * 100;
        setUploadProgress({ loaded: i + 1, total: selectedFiles.length, percentage: progress });

        // Upload photo
        const photo = await photoService.uploadPhoto(file, {
          description: descriptions[fileKey] || '',
          tags: tags[fileKey] || [],
          siteId,
          orderId
        });

        uploadedPhotos.push(photo);
      }

      // Update state
      setPhotos(prev => [...uploadedPhotos, ...prev]);
      setSelectedFiles([]);
      setDescriptions({});
      setTags({});
      setUploadProgress(null);

      toast({
        title: 'Upload Successful',
        description: `${uploadedPhotos.length} photos uploaded successfully`,
      });

      if (onUploadComplete) {
        onUploadComplete([...uploadedPhotos, ...photos]);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    try {
      await photoService.deletePhoto(photoId);
      setPhotos(prev => prev.filter(photo => photo.id !== photoId));
      
      toast({
        title: 'Photo Deleted',
        description: 'Photo has been removed successfully',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Delete Failed',
        description: 'Failed to delete photo',
      });
    }
  };

  const addTag = (fileKey: string, tag: string) => {
    if (tag.trim()) {
      setTags(prev => ({
        ...prev,
        [fileKey]: [...(prev[fileKey] || []), tag.trim()]
      }));
    }
  };

  const removeTag = (fileKey: string, tagIndex: number) => {
    setTags(prev => ({
      ...prev,
      [fileKey]: prev[fileKey]?.filter((_, i) => i !== tagIndex) || []
    }));
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Site Documentation Photos
            <Badge variant="outline">
              {photos.length}/{maxPhotos}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Area */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || photos.length >= maxPhotos}
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Select Photos
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <span className="text-sm text-muted-foreground">
                Max {maxPhotos} photos, 10MB each
              </span>
            </div>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Selected Photos</h4>
                {selectedFiles.map((file, index) => {
                  const fileKey = `${file.name}-${index}`;
                  const fileUrl = URL.createObjectURL(file);
                  
                  return (
                    <Card key={fileKey} className="p-4">
                      <div className="flex gap-4">
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted">
                          <img
                            src={fileUrl}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSelectedFile(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="space-y-2">
                            <div>
                              <Label htmlFor={`desc-${fileKey}`} className="text-xs">
                                Description (optional)
                              </Label>
                              <Textarea
                                id={`desc-${fileKey}`}
                                placeholder="Describe this photo..."
                                value={descriptions[fileKey] || ''}
                                onChange={(e) =>
                                  setDescriptions(prev => ({
                                    ...prev,
                                    [fileKey]: e.target.value
                                  }))
                                }
                                className="h-16 text-sm"
                              />
                            </div>

                            <div>
                              <Label className="text-xs">Tags (optional)</Label>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {(tags[fileKey] || []).map((tag, tagIndex) => (
                                  <Badge
                                    key={tagIndex}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {tag}
                                    <button
                                      onClick={() => removeTag(fileKey, tagIndex)}
                                      className="ml-1 hover:text-destructive"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                              <Input
                                placeholder="Add tag and press Enter"
                                className="h-8 text-sm mt-1"
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    addTag(fileKey, e.currentTarget.value);
                                    e.currentTarget.value = '';
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}

                {/* Upload Button */}
                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleUpload}
                    disabled={uploading || selectedFiles.length === 0}
                    className="flex items-center gap-2"
                  >
                    {uploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} Photos`}
                  </Button>
                  
                  {uploadProgress && (
                    <div className="flex-1">
                      <Progress value={uploadProgress.percentage} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        {uploadProgress.loaded} of {uploadProgress.total} photos
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Uploaded Photos */}
            {photos.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Uploaded Photos</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {photos.map((photo) => (
                    <Card key={photo.id} className="overflow-hidden">
                      <div className="aspect-square relative">
                        <img
                          src={photo.thumbnailUrl || photo.url}
                          alt={photo.filename}
                          className="w-full h-full object-cover"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 h-6 w-6 p-0"
                          onClick={() => handleDeletePhoto(photo.id)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="p-2 space-y-1">
                        <p className="text-xs font-medium truncate">
                          {photo.filename}
                        </p>
                        {photo.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {photo.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-1">
                          {photo.tags?.slice(0, 2).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          {photo.location ? 'Located' : 'No location'}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {photos.length === 0 && selectedFiles.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-2">No photos uploaded yet</p>
                <p className="text-sm text-muted-foreground">
                  Upload photos to document site conditions and progress
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

