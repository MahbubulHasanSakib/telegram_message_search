import {
  PipeTransform,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import * as path from 'path';

@Injectable()
export class ParseJsonFilePipe implements PipeTransform<Express.Multer.File, Express.Multer.File> {
  transform(file: Express.Multer.File): Express.Multer.File {
    if (!file) {
      throw new BadRequestException('No JSON export file uploaded');
    }

    const fileExt = path.extname(file.originalname).toLowerCase();
    if (fileExt !== '.json') {
      throw new BadRequestException(
        `Invalid file extension '${fileExt}'. Only '.json' Telegram export files are allowed.`,
      );
    }

    const validMimeTypes = ['application/json', 'text/plain', 'application/octet-stream'];
    if (!validMimeTypes.includes(file.mimetype) && !file.mimetype.includes('json')) {
      throw new BadRequestException(
        `Invalid MIME type '${file.mimetype}'. Expected 'application/json'.`,
      );
    }

    return file;
  }
}
