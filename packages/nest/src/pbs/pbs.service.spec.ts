import { Test, TestingModule } from '@nestjs/testing';
import { PBSService } from './pbs.service';

describe('PBSService', () => {
  let service: PBSService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PBSService],
    }).compile();

    service = module.get<PBSService>(PBSService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
