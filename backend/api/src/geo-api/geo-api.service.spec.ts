import { Test, TestingModule } from '@nestjs/testing';
import { GeoApiService } from './geo-api.service';

describe('GeoApiService', () => {
  let service: GeoApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GeoApiService],
    }).compile();

    service = module.get<GeoApiService>(GeoApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
