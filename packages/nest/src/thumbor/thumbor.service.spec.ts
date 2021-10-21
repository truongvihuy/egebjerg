import { Test, TestingModule } from '@nestjs/testing';
import { ThumborService } from './thumbor.service';

describe('ThumborService', () => {
  let service: ThumborService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ThumborService],
    }).compile();

    service = module.get<ThumborService>(ThumborService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
