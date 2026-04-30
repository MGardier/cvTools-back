import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { OfferService } from './offer.service';
import { OfferController } from './offer.controller';
import { FranceTravailProvider } from './providers/france-travail/france-travail.provider';
import { FranceTravailAuthService } from './providers/france-travail/france-travail-auth.service';


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
