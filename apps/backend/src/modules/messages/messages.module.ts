import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { TgExportParserService } from './services/tg-export-parser.service';

@Module({
  controllers: [MessagesController],
  providers: [MessagesService, TgExportParserService],
  exports: [MessagesService, TgExportParserService],
})
export class MessagesModule {}
