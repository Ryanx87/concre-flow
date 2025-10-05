export interface PhotoMetadata {
  id: string;
  filename: string;
  url: string;
  thumbnailUrl?: string;
  size: number;
  type: string;
  timestamp: string;
  location?: {
    lat: number;
    lon: number;
  };
  description?: string;
  tags?: string[];
  siteId?: string;
  orderId?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

class PhotoService {
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  private readonly THUMBNAIL_SIZE = 300;

  // Validate file before upload
  validateFile(file: File): { valid: boolean; error?: string } {
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: 'Only JPEG, PNG, and WebP images are allowed'
      };
    }

    if (file.size > this.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: 'File size must be less than 10MB'
      };
    }

    return { valid: true };
  }

  // Generate thumbnail for image
  private async generateThumbnail(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate thumbnail dimensions
        const ratio = Math.min(this.THUMBNAIL_SIZE / img.width, this.THUMBNAIL_SIZE / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;

        // Draw and convert to blob
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(URL.createObjectURL(blob));
          } else {
            reject(new Error('Failed to generate thumbnail'));
          }
        }, 'image/jpeg', 0.8);
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  // Get current location (if available)
  private async getCurrentLocation(): Promise<{ lat: number; lon: number } | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        () => resolve(null),
        { timeout: 5000, enableHighAccuracy: false }
      );
    });
  }

  // Upload photo to Supabase Storage
  async uploadPhoto(
    file: File,
    metadata: {
      description?: string;
      tags?: string[];
      siteId?: string;
      orderId?: string;
    } = {},
    onProgress?: (progress: UploadProgress) => void
  ): Promise<PhotoMetadata> {
    // Validate file
    const validation = this.validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    try {
      // Generate unique filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${timestamp}_${file.name}`;
      const filePath = `site-photos/${filename}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('site-photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('site-photos')
        .getPublicUrl(filePath);

      // Generate thumbnail
      let thumbnailUrl: string | undefined;
      try {
        thumbnailUrl = await this.generateThumbnail(file);
      } catch (error) {
        console.warn('Failed to generate thumbnail:', error);
      }

      // Get location if available
      const location = await this.getCurrentLocation();

      // Create photo metadata
      const photoMetadata: PhotoMetadata = {
        id: crypto.randomUUID(),
        filename: filename,
        url: urlData.publicUrl,
        thumbnailUrl,
        size: file.size,
        type: file.type,
        timestamp: new Date().toISOString(),
        location,
        ...metadata
      };

      // TODO: Store metadata in database when site_photos table is created
      // const { error: dbError } = await supabase
      //   .from('site_photos')
      //   .insert({...});
      
      // For now, just return the metadata without storing in DB

      return photoMetadata;
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw new Error(`Failed to upload photo: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get photos for a site or order
  async getPhotos(siteId?: string, orderId?: string): Promise<PhotoMetadata[]> {
    // TODO: Implement when site_photos table is created
    console.log('getPhotos called with:', { siteId, orderId });
    return [];
  }

  // Delete photo
  async deletePhoto(photoId: string): Promise<void> {
    // TODO: Implement when site_photos table is created
    console.log('deletePhoto called with:', photoId);
  }

  // Get storage usage statistics
  async getStorageStats(): Promise<{
    totalPhotos: number;
    totalSize: number;
    averageSize: number;
  }> {
    // TODO: Implement when site_photos table is created
    return {
      totalPhotos: 0,
      totalSize: 0,
      averageSize: 0
    };
  }
}

// Import supabase client
import { supabase } from '@/integrations/supabase/client';

export const photoService = new PhotoService();

