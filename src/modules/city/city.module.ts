import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CityController } from './city.controller';
import { CityService } from './city.service';

@Module({
  imports: [HttpModule],
  controllers: [CityController],
  providers: [CityService],
})
export class CityModule {}
