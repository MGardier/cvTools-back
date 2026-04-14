import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { OfferService } from './offer.service';
import { OfferController } from './offer.controller';
import { FranceTravailProvider } from './providers/france-travail/france-travail.provider';
import { FranceTravailAuthService } from './providers/france-travail/france-travail-auth.service';

@Module({
  imports: [HttpModule],
  controllers: [OfferController],
  providers: [OfferService, FranceTravailProvider, FranceTravailAuthService],
  exports: [OfferService],
})
export class OfferModule {}
