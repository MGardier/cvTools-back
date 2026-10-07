import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CityController } from './city.controller.js';
import { CityService } from './city.service.js';

@Module({
  imports: [HttpModule],
  controllers: [CityController],
  providers: [CityService],
})
export class CityModule {}
