import { Module } from '@nestjs/common';
import { LocalEmbedderService } from './services/local-embedder.service';
import { QdrantService } from './services/qdrant.service';
import { SearchService } from './services/search.service';
import { IndexingService } from './services/indexing.service';
import { SearchController } from './search.controller';
import { EMBEDDER_SERVICE_TOKEN } from './ports/embedder.service.interface';
import { MessagesModule } from '../messages/messages.module';

@Module({
  imports: [MessagesModule],
  controllers: [SearchController],
  providers: [
    LocalEmbedderService,
    QdrantService,
    SearchService,
    IndexingService,
    {
      provide: EMBEDDER_SERVICE_TOKEN,
      useClass: LocalEmbedderService,
    },
  ],
  exports: [LocalEmbedderService, QdrantService, SearchService, IndexingService, EMBEDDER_SERVICE_TOKEN],
})
export class SearchModule {}
