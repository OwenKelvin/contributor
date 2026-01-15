import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Res,
  Req,
  HttpStatus,
  HttpException,
  Logger,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { FileService } from './file.service';

@Controller('files')
export class FileController {
  private readonly logger = new Logger(FileController.name);

  constructor(private readonly fileService: FileService) {}

  /**
   * Upload a file
   * POST /api/files/upload
   */
  @Post('upload')
  async uploadFile(@Req() req: FastifyRequest) {
    try {
      const data = await req.file();

      if (!data) {
        throw new HttpException('No file provided', HttpStatus.BAD_REQUEST);
      }

      const buffer = await data.toBuffer();
      const result = await this.fileService.uploadFile(
        buffer,
        data.filename,
        data.mimetype
      );

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error(`File upload failed: ${error.message}`, error.stack);
      
      if (error.message.includes('Invalid file type')) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      
      if (error.message.includes('File size exceeds')) {
        throw new HttpException(error.message, HttpStatus.PAYLOAD_TOO_LARGE);
      }

      throw new HttpException(
        'File upload failed',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Download a file
   * GET /api/files/:filename
   */
  @Get(':filename')
  async downloadFile(
    @Param('filename') filename: string,
    @Res() res: FastifyReply
  ) {
    try {
      const { stream, stat } = await this.fileService.downloadFile(filename);

      // Set appropriate headers
      res.header('Content-Type', stat.metaData['content-type'] || 'application/octet-stream');
      res.header('Content-Length', stat.size.toString());
      res.header('Content-Disposition', `inline; filename="${filename}"`);

      // Stream the file to response
      res.send(stream);
    } catch (error) {
      this.logger.error(`File download failed: ${error.message}`, error.stack);

      if (error.message === 'File not found') {
        throw new HttpException('File not found', HttpStatus.NOT_FOUND);
      }

      throw new HttpException(
        'File download failed',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Delete a file
   * DELETE /api/files/:filename
   */
  @Delete(':filename')
  async deleteFile(@Param('filename') filename: string) {
    try {
      const success = await this.fileService.deleteFile(filename);

      return {
        success,
        message: 'File deleted successfully',
      };
    } catch (error) {
      this.logger.error(`File deletion failed: ${error.message}`, error.stack);

      if (error.message === 'File not found') {
        throw new HttpException('File not found', HttpStatus.NOT_FOUND);
      }

      throw new HttpException(
        'File deletion failed',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
