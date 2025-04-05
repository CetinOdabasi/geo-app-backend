import { Test, TestingModule } from '@nestjs/testing';
import { GeoApiController } from './geo-api.controller';

describe('GeoApiController', () => {
  let controller: GeoApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GeoApiController],
    }).compile();

    controller = module.get<GeoApiController>(GeoApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
