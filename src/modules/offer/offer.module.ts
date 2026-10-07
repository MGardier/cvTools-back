import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { OfferService } from './offer.service.js';
import { OfferController } from './offer.controller.js';
import { FranceTravailProvider } from './providers/france-travail/france-travail.provider.js';
import { FranceTravailAuthService } from './providers/france-travail/france-travail-auth.service.js';

const HTTP_TIMEOUT_MS = 8_000;

@Module({
  imports: [
    HttpModule.register({
      timeout: HTTP_TIMEOUT_MS,
      maxRedirects: 3,
    }),
  ],
  controllers: [OfferController],
  providers: [OfferService, FranceTravailProvider, FranceTravailAuthService],
  exports: [OfferService],
})
export class OfferModule {}
