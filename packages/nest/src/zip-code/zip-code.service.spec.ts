import { Test, TestingModule } from '@nestjs/testing';
import { ZipCodeService } from './zip-code.service';

describe('ZipCodeService', () => {
  let service: ZipCodeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ZipCodeService],
    }).compile();

    service = module.get<ZipCodeService>(ZipCodeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
