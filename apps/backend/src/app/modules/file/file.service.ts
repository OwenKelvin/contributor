import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { v4 as uuidv4 } from 'uuid';
import { Readable } from 'stream';

export interface FileUploadResult {
  filename: string;
  url: string;
  size: number;
  contentType: string;
}

@Injectable()
export class FileService implements OnModuleInit {
  private readonly logger = new Logger(FileService.name);
  private minioClient: Minio.Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    const endpoint = this.configService.get<string>('MINIO_ENDPOINT', 'localhost');
    const port = this.configService.get<number>('MINIO_PORT', 9000);
    const accessKey = this.configService.get<string>('MINIO_ACCESS_KEY', 'minioadmin');
    const secretKey = this.configService.get<string>('MINIO_SECRET_KEY', 'minioadmin');
    const useSSL = this.configService.get<string>('MINIO_USE_SSL', 'false') === 'true';
    this.bucketName = this.configService.get<string>('MINIO_BUCKET_NAME', 'contributor-files');

    this.minioClient = new Minio.Client({
      endPoint: endpoint,
      port: port,
      useSSL: useSSL,
      accessKey: accessKey,
      secretKey: secretKey,
    });
  }

  async onModuleInit() {
    try {
      const bucketExists = await this.minioClient.bucketExists(this.bucketName);
      if (!bucketExists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
        this.logger.log(`Bucket "${this.bucketName}" created successfully`);
      } else {
        this.logger.log(`Bucket "${this.bucketName}" already exists`);
      }
    } catch (error) {
      this.logger.error(`Error initializing Minio bucket: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Upload a file to Minio
   * @param file - File buffer
   * @param originalName - Original filename
   * @param contentType - MIME type
   * @returns Upload result with filename and URL
   */
  async uploadFile(
    file: Buffer,
    originalName: string,
    contentType: string
  ): Promise<FileUploadResult> {
    try {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(contentType)) {
        throw new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.length > maxSize) {
        throw new Error(`File size exceeds maximum allowed size of 5MB`);
      }

      // Generate unique filename
      const fileExtension = this.getFileExtension(originalName);
      const uniqueFilename = `${uuidv4()}${fileExtension}`;

      // Upload to Minio
      await this.minioClient.putObject(
        this.bucketName,
        uniqueFilename,
        file,
        file.length,
        {
          'Content-Type': contentType,
        }
      );

      // Generate file URL
      const url = await this.getFileUrl(uniqueFilename);

      this.logger.log(`File uploaded successfully: ${uniqueFilename}`);

      return {
        filename: uniqueFilename,
        url,
        size: file.length,
        contentType,
      };
    } catch (error) {
      this.logger.error(`Error uploading file: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Download a file from Minio
   * @param filename - Name of the file to download
   * @returns File stream and metadata
   */
  async downloadFile(filename: string): Promise<{ stream: Readable; stat: Minio.BucketItemStat }> {
    try {
      const stat = await this.minioClient.statObject(this.bucketName, filename);
      const stream = await this.minioClient.getObject(this.bucketName, filename);

      return { stream, stat };
    } catch (error) {
      if (error.code === 'NoSuchKey' || error.code === 'NotFound') {
        throw new Error('File not found');
      }
      this.logger.error(`Error downloading file: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Delete a file from Minio
   * @param filename - Name of the file to delete
   * @returns Success status
   */
  async deleteFile(filename: string): Promise<boolean> {
    try {
      await this.minioClient.removeObject(this.bucketName, filename);
      this.logger.log(`File deleted successfully: ${filename}`);
      return true;
    } catch (error) {
      if (error.code === 'NoSuchKey' || error.code === 'NotFound') {
        throw new Error('File not found');
      }
      this.logger.error(`Error deleting file: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get file URL
   * @param filename - Name of the file
   * @returns Presigned URL for the file
   */
  private async getFileUrl(filename: string): Promise<string> {
    try {
      // Generate presigned URL valid for 7 days
      const url = await this.minioClient.presignedGetObject(
        this.bucketName,
        filename,
        7 * 24 * 60 * 60
      );
      return url;
    } catch (error) {
      this.logger.error(`Error generating file URL: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Extract file extension from filename
   * @param filename - Original filename
   * @returns File extension with dot
   */
  private getFileExtension(filename: string): string {
    const lastDotIndex = filename.lastIndexOf('.');
    if (lastDotIndex === -1) {
      return '';
    }
    return filename.substring(lastDotIndex);
  }
}
