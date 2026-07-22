import { Module } from '@nestjs/common';
import { GroqEmbedderService } from './services/groq-embedder.service';
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
    GroqEmbedderService,
    QdrantService,
    SearchService,
    IndexingService,
    {
      provide: EMBEDDER_SERVICE_TOKEN,
      useClass: GroqEmbedderService,
    },
  ],
  exports: [GroqEmbedderService, QdrantService, SearchService, IndexingService, EMBEDDER_SERVICE_TOKEN],
})
export class SearchModule {}
