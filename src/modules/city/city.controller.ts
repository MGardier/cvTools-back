import { Controller } from '@nestjs/common';
import { Implement, implement } from '@orpc/nest';
import { contract } from '@cvtools/contracts';
import { CityService } from './city.service.js';
import { Public } from '#shared/decorators/public.decorator.js';
import { ContractRoute } from '#shared/utils/contract-route.js';

@Controller()
export class CityController {
  constructor(private readonly cityService: CityService) {}

  @Public()
  @Implement(contract.city.search)
  search() {
    return implement(contract.city.search).handler(async ({ input, context }) =>
      ContractRoute.buildSuccessResponse(
        contract.city.search,
        await this.cityService.search(input),
        context.request,
      ),
    );
  }
}
